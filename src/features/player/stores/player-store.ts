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
import { announce } from "@/features/session/announcer";
import { trackEvent } from "@/features/session/analytics";
import { formatTimestamp } from "@/lib/formatting/timestamp";
import { formatRate } from "./speed-state";
import type {
  NudgePrecision,
  TimelineMode,
} from "@/features/session/session-storage";

export type ActiveMarker = "A" | "B";

export interface PlayerStoreState {
  adapter: PlayerAdapter | null;
  videoId: string | null;
  status: PlayerStatus;
  error: PlayerError | null;
  duration: number;
  loop: LoopState;
  speed: PlaybackSpeedState;
  volume: number;
  muted: boolean;
  /** Which marker keyboard nudges and `[`/`]` act on. */
  activeMarker: ActiveMarker;
  nudgePrecision: NudgePrecision;
  timelineMode: TimelineMode;

  // --- lifecycle ---
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
}

function applyLoop(loop: LoopState): Partial<PlayerStoreState> {
  return { loop };
}

/**
 * Module-level flag for the pending whole-clip loop. Kept out of the reactive
 * store state because nothing needs to re-render on it; `setDuration` reads and
 * clears it when the duration first arrives.
 */
let pendingWholeClipLoop = false;

/**
 * When markers arrive from a shared link or a saved session, park the playhead
 * on marker A as soon as the player is ready so a pasted loop starts from the
 * top. Set by `hydrate`, consumed by `onPlayerReady`.
 */
let seekToMarkerAOnReady = false;

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  adapter: null,
  videoId: null,
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

  attachAdapter: (adapter, videoId) =>
    set({ adapter, videoId, error: null, status: "loading" }),

  detachAdapter: () => {
    // NB: do not clear pendingWholeClipLoop / seekToMarkerAOnReady here — a new
    // source's seed (in a layout effect) may run before the old adapter's
    // cleanup, and clearing them would drop the new source's armed defaults.
    // `resetForNewSource` owns clearing them.
    set({ adapter: null, status: "idle" });
  },

  resetForNewSource: () => {
    pendingWholeClipLoop = false;
    seekToMarkerAOnReady = false;
    set({
      duration: 0,
      error: null,
      status: "idle",
      loop: initialLoopState,
      speed: initialSpeedState,
      activeMarker: "A",
    });
  },

  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: error ? "error" : get().status }),
  setDuration: (duration) => {
    set({ duration });
    // Complete a pending whole-clip loop now that we know the end.
    if (pendingWholeClipLoop && duration > 0) {
      pendingWholeClipLoop = false;
      set({
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
    pendingWholeClipLoop = true;
    const { duration } = get();
    // Place A at the start right away for immediate visual feedback.
    set({ loop: { ...get().loop, markerA: 0 } });
    // If the duration is already known, complete immediately.
    if (duration > 0) {
      pendingWholeClipLoop = false;
      set({
        loop: {
          markerA: 0,
          markerB: duration,
          enabled: true,
          iterationCount: 0,
        },
      });
    }
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
  },

  togglePlay: () => {
    const { status, play, pause } = get();
    if (status === "playing" || status === "buffering") pause();
    else play();
  },

  play: () => get().adapter?.play(),
  pause: () => get().adapter?.pause(),

  seekTo: (seconds) => {
    const { adapter, duration } = get();
    if (!adapter) return;
    const clamped = Math.max(
      0,
      duration > 0 ? Math.min(seconds, duration) : seconds,
    );
    adapter.seekTo(clamped);
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
    if (next.enabled && next.markerA != null && next.markerB != null) {
      trackEvent({
        name: "loop_enabled",
        loopLength: next.markerB - next.markerA,
      });
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
