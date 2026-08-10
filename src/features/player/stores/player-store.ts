"use client";

/**
 * The central practice store.
 *
 * Responsibilities:
 *   - Own the adapter instance (created by the mount hook, never by UI).
 *   - Hold discrete state: status, duration, loop, speed, volume, prefs.
 *   - Expose intent-level actions (setMarkerA, toggleLoop, requestSpeed, …)
 *     that the UI and keyboard layer call.
 *
 * Deliberately NOT in this store: the high-frequency playhead time. Current
 * time is read directly from the adapter on a rAF loop by the components that
 * need it (timeline, timestamp), so 60fps playback never triggers React state
 * churn across the tree. See `use-playhead`.
 */

import { create } from "zustand";
import type {
  PlayerAdapter,
  PlayerStatus,
  PlayerError,
} from "../types/player-adapter";
import {
  clearLoop as clearLoopState,
  clearMarkerA as clearMarkerAState,
  clearMarkerB as clearMarkerBState,
  evaluateLoopTick,
  initialLoopState,
  moveMarker as moveMarkerState,
  setLoopEnabled as setLoopEnabledState,
  setMarkerA as setMarkerAState,
  setMarkerB as setMarkerBState,
  toggleLoop as toggleLoopState,
  type LoopState,
} from "@/features/loop/engine/loop-state";
import {
  initialSpeedState,
  nudgeRate as nudgeRateState,
  reconcileAppliedRate,
  requestRate as requestRateState,
  resetRate as resetRateState,
  setAvailableRates,
  type PlaybackSpeedState,
} from "./speed-state";
import { emitPlayhead } from "../hooks/playhead-listeners";
import { announce } from "@/features/session/announcer";
import { trackEvent } from "@/features/session/analytics";
import { formatTimestamp } from "@/lib/formatting/timestamp";
import { formatRate } from "./speed-state";
import type {
  NudgePrecision,
  TimelineMode,
} from "@/features/session/session-storage";

export type ActiveMarker = "A" | "B";

/**
 * Whether the visitor has expressed intent to play. The YouTube iframe (and
 * the IFrame API script) load only after activation — before that the surface
 * shows a thumbnail facade. YouTube's embed shifts its own internal layout
 * while booting, which counts toward the page's field CLS even though it
 * happens inside a cross-origin iframe, and it pulls ~1 MB of third-party JS.
 * Page-level, not per-source: once a visitor has activated, every subsequent
 * video loads eagerly.
 */
export type PlayerActivation = "pending" | "active";

export interface PlayerStoreState {
  adapter: PlayerAdapter | null;
  videoId: string | null;
  activation: PlayerActivation;
  /**
   * True from the activation gesture until playback actually begins. The
   * surface holds one steady picture for the whole stretch — poster up, start
   * button showing a spinner in place — instead of cycling facade → black
   * iframe → ready overlay, and transport intents are ignored so an impatient
   * second press of Space cannot pause the video it just asked for.
   */
  starting: boolean;
  status: PlayerStatus;
  error: PlayerError | null;
  duration: number;
  /**
   * A whole-clip default loop is armed but waiting for the duration to place
   * marker B. In state (not a module flag) because the timeline renders the
   * pending B at the end of the track: "end of clip" is 100% on any scale,
   * so the default loop is visible before the player has ever loaded.
   */
  wholeClipPending: boolean;
  loop: LoopState;
  speed: PlaybackSpeedState;
  volume: number;
  muted: boolean;
  /** Which marker keyboard nudges and `[`/`]` act on. */
  activeMarker: ActiveMarker;
  nudgePrecision: NudgePrecision;
  timelineMode: TimelineMode;

  // --- lifecycle ---
  /**
   * First user intent (facade click, Space, or pasting a link): allows the
   * mount hook to create the YouTube adapter, and arms play-on-ready so the
   * gesture that activated also starts playback.
   */
  activate: () => void;
  attachAdapter: (adapter: PlayerAdapter, videoId: string) => void;
  detachAdapter: () => void;
  /** Clear all per-source state (loop, speed, duration) before seeding a new one. */
  resetForNewSource: () => void;
  setStatus: (status: PlayerStatus) => void;
  setError: (error: PlayerError | null) => void;
  setDuration: (duration: number) => void;
  /**
   * Called once the adapter is ready: syncs available rates, re-applies the
   * hydrated speed/volume/mute, and (for a link/session with markers) parks the
   * playhead on marker A so a pasted loop starts from the top. Playback still
   * waits for a user gesture — autoplay is never assumed.
   */
  onPlayerReady: () => void;

  // --- transport ---
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  seekBy: (delta: number) => void;
  restartVideo: () => void;
  restartLoop: () => void;

  // --- loop / markers ---
  setMarkerA: (seconds?: number) => void;
  setMarkerB: (seconds?: number) => void;
  moveMarker: (marker: ActiveMarker, seconds: number) => void;
  nudgeActiveMarker: (deltaSeconds: number) => void;
  clearMarkerA: () => void;
  clearMarkerB: () => void;
  clearLoop: () => void;
  toggleLoop: () => void;
  setLoopEnabled: (enabled: boolean) => void;
  incrementIteration: () => void;
  setActiveMarker: (marker: ActiveMarker) => void;

  // --- speed ---
  requestSpeed: (rate: number) => void;
  nudgeSpeed: (delta: number) => void;
  resetSpeed: () => void;
  onAvailableRates: (rates: number[]) => void;
  onAppliedRate: (rate: number) => void;

  // --- volume ---
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // --- prefs ---
  setNudgePrecision: (precision: NudgePrecision) => void;
  setTimelineMode: (mode: TimelineMode) => void;

  // --- hydration from URL / session ---
  hydrate: (partial: Partial<HydrateInput>) => void;
  /**
   * Arm a "whole clip" default loop: A at 0 immediately, B set to the full
   * duration and looping enabled as soon as the player reports its duration.
   * Used for a fresh video with no shared markers and no saved session.
   */
  requestWholeClipLoop: () => void;

  // --- loop tick (called by the playhead loop) ---
  onTick: (currentTime: number) => void;
}

export interface HydrateInput {
  markerA: number | null;
  markerB: number | null;
  loopEnabled: boolean;
  requestedSpeed: number;
  appliedSpeed: number;
  volume: number;
  muted: boolean;
  nudgePrecision: NudgePrecision;
  timelineMode: TimelineMode;
  /**
   * Last known media duration, from the saved session. Seeds the timeline
   * scale so restored markers render in the right place BEFORE the player
   * loads (the facade defers loading until the first play gesture). The
   * player's real duration overwrites it on ready.
   */
  duration: number;
}

function applyLoop(loop: LoopState): Partial<PlayerStoreState> {
  return { loop };
}

/**
 * When markers arrive from a shared link or a saved session, park the playhead
 * on marker A as soon as the player is ready so a pasted loop starts from the
 * top. Set by `hydrate`, consumed by `onPlayerReady`.
 */
let seekToMarkerAOnReady = false;

/**
 * Set by `activate`, consumed by `onPlayerReady`: the gesture that dismissed
 * the facade should also start playback, without a second click. Module-level
 * like the flags above — nothing re-renders on it.
 */
let playOnActivate = false;

/**
 * Analytics-only view of playback, per source. `logicallyPlaying` treats
 * buffering as a continuation of whatever came before it; `hasPlayedThisSource`
 * marks `media_played`'s first_play. Module-level: nothing re-renders on them.
 */
let logicallyPlaying = false;
let hasPlayedThisSource = false;

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  adapter: null,
  videoId: null,
  activation: "pending",
  starting: false,
  wholeClipPending: false,
  status: "idle",
  error: null,
  duration: 0,
  loop: initialLoopState,
  speed: initialSpeedState,
  volume: 100,
  muted: false,
  activeMarker: "A",
  nudgePrecision: 0.1,
  timelineMode: "full",

  activate: () => {
    if (get().activation === "active") return;
    playOnActivate = true;
    set({ activation: "active", starting: true });
  },

  attachAdapter: (adapter, videoId) =>
    set({ adapter, videoId, error: null, status: "loading" }),

  detachAdapter: () => {
    // NB: do not clear wholeClipPending / seekToMarkerAOnReady here — a new
    // source's seed (in a layout effect) may run before the old adapter's
    // cleanup, and clearing them would drop the new source's armed defaults.
    // `resetForNewSource` owns clearing them.
    set({ adapter: null, status: "idle" });
  },

  resetForNewSource: () => {
    seekToMarkerAOnReady = false;
    logicallyPlaying = false;
    hasPlayedThisSource = false;
    set({
      duration: 0,
      error: null,
      status: "idle",
      wholeClipPending: false,
      loop: initialLoopState,
      speed: initialSpeedState,
      activeMarker: "A",
    });
  },

  setStatus: (status) => {
    // Play/pause analytics from status *transitions*, so plays started from
    // the YouTube iframe's own controls count exactly like ours. "Logically
    // playing" ignores buffering: a loop wrap or a seek passes through
    // buffering mid-playback and must not read as a fresh play.
    if (status === "playing" && !logicallyPlaying) {
      logicallyPlaying = true;
      trackEvent({ name: "media_played", first_play: !hasPlayedThisSource });
      hasPlayedThisSource = true;
    } else if (status === "paused" && logicallyPlaying) {
      logicallyPlaying = false;
      trackEvent({ name: "media_paused" });
    } else if (
      status === "idle" ||
      status === "ready" ||
      status === "ended" ||
      status === "error"
    ) {
      // Not a user pause — just leave the logical-playing state.
      logicallyPlaying = false;
    }
    set((state) =>
      // Playback has genuinely begun — the starting hold is over.
      status === "playing" && state.starting
        ? { status, starting: false }
        : { status },
    );
  },
  setError: (error) => {
    if (error) {
      trackEvent({
        name: "media_failed",
        kind: error.kind,
        video_id: get().videoId ?? undefined,
      });
    }
    set({ error, starting: false, status: error ? "error" : get().status });
  },
  setDuration: (duration) => {
    set({ duration });
    // Complete a pending whole-clip loop now that we know the end.
    if (get().wholeClipPending && duration > 0) {
      set({
        wholeClipPending: false,
        loop: {
          markerA: 0,
          markerB: duration,
          enabled: true,
          iterationCount: 0,
        },
      });
    }
  },

  requestWholeClipLoop: () => {
    const { duration } = get();
    // If the duration is already known, complete immediately.
    if (duration > 0) {
      set({
        wholeClipPending: false,
        loop: {
          markerA: 0,
          markerB: duration,
          enabled: true,
          iterationCount: 0,
        },
      });
      return;
    }
    // Otherwise arm it: A at the start right away for immediate visual
    // feedback, and the pending flag lets the timeline draw B at the end of
    // the track before the duration exists.
    set({
      wholeClipPending: true,
      loop: { ...get().loop, markerA: 0 },
    });
  },

  onPlayerReady: () => {
    const state = get();
    const { adapter, speed, volume, muted, loop } = state;
    if (!adapter) return;
    state.onAvailableRates(adapter.getAvailablePlaybackRates());
    if (speed.requestedRate !== 1) adapter.setPlaybackRate(speed.requestedRate);
    adapter.setVolume(volume);
    if (muted) adapter.mute();
    // Park on marker A for a pasted/restored loop so it starts from the top.
    if (seekToMarkerAOnReady && loop.markerA != null) {
      adapter.seekTo(loop.markerA);
    }
    seekToMarkerAOnReady = false;
    // The click that dismissed the facade is the play gesture; don't ask for a
    // second one. Programmatic play works here because the IFrame API's iframe
    // carries allow="autoplay" and the page holds sticky user activation from
    // that click.
    if (playOnActivate) {
      playOnActivate = false;
      adapter.play();
      // If a strict browser refuses the delegated autoplay anyway, drop the
      // starting hold so the ready overlay (with a clickable start button)
      // comes back instead of a spinner that never resolves.
      setTimeout(() => {
        if (get().starting && get().status !== "playing") {
          set({ starting: false });
        }
      }, 4000);
    }
  },

  togglePlay: () => {
    const { starting, status, play, pause } = get();
    // A start is already in flight; a second impatient press must not queue a
    // pause against the playback the first press asked for.
    if (starting) return;
    if (status === "playing" || status === "buffering") pause();
    else play();
  },

  play: () => {
    const { adapter, activation, activate } = get();
    // No adapter yet because the facade is still up: this press (Space, or the
    // facade button) is the activation gesture. The mount hook reacts to the
    // state change, creates the adapter, and `onPlayerReady` starts playback.
    if (!adapter && activation === "pending") {
      activate();
      return;
    }
    adapter?.play();
  },
  pause: () => get().adapter?.pause(),

  seekTo: (seconds) => {
    const { adapter, duration } = get();
    if (!adapter) return;
    const clamped = Math.max(
      0,
      duration > 0 ? Math.min(seconds, duration) : seconds,
    );
    adapter.seekTo(clamped);
    // The rAF clock only runs while playing, so a seek made while paused would
    // leave every playhead (timeline, waveform) showing its old position until
    // playback resumed. Push the new position out immediately.
    //
    // We pass `clamped` rather than re-reading the adapter: YouTube's
    // getCurrentTime still reports the pre-seek position for a frame or two,
    // which would paint the old spot and then jump.
    emitPlayhead(clamped);
  },

  seekBy: (delta) => {
    const { adapter, seekTo } = get();
    if (!adapter) return;
    seekTo(adapter.getCurrentTime() + delta);
  },

  restartVideo: () => {
    const { seekTo, play } = get();
    seekTo(0);
    play();
  },

  restartLoop: () => {
    const { loop, seekTo, play } = get();
    if (loop.markerA != null) {
      seekTo(loop.markerA);
      play();
    }
  },

  setMarkerA: (seconds) => {
    const { adapter, duration, loop } = get();
    const at = seconds ?? adapter?.getCurrentTime() ?? 0;
    const next = setMarkerAState(loop, at, duration);
    set({ ...applyLoop(next), activeMarker: "A" });
    announce(`Marker A set at ${formatTimestamp(next.markerA ?? at)}`);
    trackEvent({ name: "marker_set", marker: "A" });
  },

  setMarkerB: (seconds) => {
    const { adapter, duration, loop } = get();
    const at = seconds ?? adapter?.getCurrentTime() ?? 0;
    const next = setMarkerBState(loop, at, duration);
    if (next.markerB != null && next.markerA == null && loop.markerA != null) {
      announce("Marker B must be after A. Marker A was cleared.");
    } else {
      announce(`Marker B set at ${formatTimestamp(next.markerB ?? at)}`);
    }
    set({ ...applyLoop(next), activeMarker: "B" });
    trackEvent({ name: "marker_set", marker: "B" });
  },

  moveMarker: (marker, seconds) => {
    const { duration, loop, adapter, seekTo } = get();
    const next = moveMarkerState(loop, marker, seconds, duration);
    set(applyLoop(next));
    // If marker A moves ahead of the playhead, follow it to A (keeping the
    // current play/pause state — seeking doesn't start or stop playback).
    if (
      marker === "A" &&
      next.markerA != null &&
      adapter != null &&
      adapter.getCurrentTime() < next.markerA
    ) {
      seekTo(next.markerA);
    }
  },

  nudgeActiveMarker: (deltaSeconds) => {
    const { loop, activeMarker, duration, adapter, seekTo } = get();
    const current = activeMarker === "A" ? loop.markerA : loop.markerB;
    if (current == null) return;
    const next = moveMarkerState(
      loop,
      activeMarker,
      current + deltaSeconds,
      duration,
    );
    set(applyLoop(next));
    if (
      activeMarker === "A" &&
      next.markerA != null &&
      adapter != null &&
      adapter.getCurrentTime() < next.markerA
    ) {
      seekTo(next.markerA);
    }
  },

  clearMarkerA: () => {
    set(applyLoop(clearMarkerAState(get().loop)));
    announce("Marker A cleared");
  },
  clearMarkerB: () => {
    set(applyLoop(clearMarkerBState(get().loop)));
    announce("Marker B cleared");
  },
  clearLoop: () => {
    set(applyLoop(clearLoopState()));
    announce("Loop cleared");
  },

  toggleLoop: () => {
    const { loop } = get();
    const next = toggleLoopState(loop);
    if (next.enabled === loop.enabled && !next.enabled) {
      announce("Set both markers before looping");
    } else {
      announce(next.enabled ? "Loop enabled" : "Loop disabled");
    }
    if (
      next.enabled &&
      !loop.enabled &&
      next.markerA != null &&
      next.markerB != null
    ) {
      trackEvent({
        name: "loop_turned_on",
        loop_length: next.markerB - next.markerA,
      });
    } else if (!next.enabled && loop.enabled) {
      trackEvent({ name: "loop_turned_off" });
    }
    set(applyLoop(next));
  },

  setLoopEnabled: (enabled) => {
    set(applyLoop(setLoopEnabledState(get().loop, enabled)));
  },

  incrementIteration: () =>
    set((state) => ({
      loop: { ...state.loop, iterationCount: state.loop.iterationCount + 1 },
    })),

  setActiveMarker: (marker) => set({ activeMarker: marker }),

  requestSpeed: (rate) => {
    const { adapter, speed } = get();
    const next = requestRateState(speed, rate);
    set({ speed: next });
    adapter?.setPlaybackRate(next.requestedRate);
  },

  nudgeSpeed: (delta) => {
    const { adapter, speed } = get();
    const next = nudgeRateState(speed, delta);
    set({ speed: next });
    adapter?.setPlaybackRate(next.requestedRate);
  },

  resetSpeed: () => {
    const { adapter, speed } = get();
    const next = resetRateState(speed);
    set({ speed: next });
    adapter?.setPlaybackRate(next.requestedRate);
  },

  onAvailableRates: (rates) =>
    set((state) => ({ speed: setAvailableRates(state.speed, rates) })),

  onAppliedRate: (rate) => {
    const next = reconcileAppliedRate(get().speed, rate);
    set({ speed: next });
    if (next.status === "adjusted") {
      announce(`Playback speed adjusted to ${formatRate(next.appliedRate)}`);
    }
    if (next.status === "applied" || next.status === "adjusted") {
      trackEvent({
        name: "speed_changed",
        requested: next.requestedRate,
        applied: next.appliedRate,
      });
    }
  },

  setVolume: (volume) => {
    const clamped = Math.max(0, Math.min(100, volume));
    get().adapter?.setVolume(clamped);
    if (clamped > 0 && get().muted) {
      get().adapter?.unmute();
      set({ muted: false });
    }
    set({ volume: clamped });
  },

  toggleMute: () => {
    const { adapter, muted } = get();
    if (muted) {
      adapter?.unmute();
      set({ muted: false });
    } else {
      adapter?.mute();
      set({ muted: true });
    }
  },

  setNudgePrecision: (nudgePrecision) => set({ nudgePrecision }),
  setTimelineMode: (timelineMode) => set({ timelineMode }),

  hydrate: (partial) => {
    // Markers arriving via hydrate come from a shared link or saved session —
    // park the playhead on A once the player is ready.
    if (partial.markerA != null) seekToMarkerAOnReady = true;
    set((state) => {
      const loop: LoopState = {
        markerA: partial.markerA ?? state.loop.markerA,
        markerB: partial.markerB ?? state.loop.markerB,
        enabled: partial.loopEnabled ?? state.loop.enabled,
        iterationCount: 0,
      };
      const speed =
        partial.requestedSpeed != null
          ? requestRateState(state.speed, partial.requestedSpeed)
          : state.speed;
      return {
        loop,
        speed,
        volume: partial.volume ?? state.volume,
        muted: partial.muted ?? state.muted,
        nudgePrecision: partial.nudgePrecision ?? state.nudgePrecision,
        timelineMode: partial.timelineMode ?? state.timelineMode,
        // Only a real remembered duration may seed the scale; never clobber
        // a live duration with a session's 0.
        duration:
          partial.duration != null && partial.duration > 0 && state.duration <= 0
            ? partial.duration
            : state.duration,
      };
    });
  },

  onTick: (currentTime) => {
    const { loop, seekTo, incrementIteration } = get();
    const decision = evaluateLoopTick(loop, currentTime);
    if (decision.shouldWrap && decision.seekTo != null) {
      seekTo(decision.seekTo);
      incrementIteration();
    }
  },
}));
