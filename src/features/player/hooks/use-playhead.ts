"use client";

import * as React from "react";
import { usePlayerStore } from "../stores/player-store";
import { emitPlayhead } from "./playhead-listeners";

/**
 * A single global playhead clock.
 *
 * While the video is playing, one `requestAnimationFrame` loop reads the
 * adapter's current time (~60fps) and:
 *   1. drives the loop engine tick (wrap at B → A), and
 *   2. notifies subscribers (timeline, timestamp) imperatively.
 *
 * Subscribers get time via `subscribeToPlayhead` and update the DOM directly,
 * so high-frequency playback never causes a React re-render across the tree.
 *
 * The clock only runs while playing. Anything that moves the playhead while
 * paused — a seek, a marker jump — must call `emitPlayhead` itself, or every
 * subscriber keeps rendering the stale position. `seekTo` in the player store
 * does exactly that.
 *
 * The listener registry lives in `./playhead-listeners` so the store can emit
 * without importing this module (which imports the store).
 */

let rafId: number | null = null;
let lastLoopCheck = 0;

function frame() {
  const store = usePlayerStore.getState();
  const adapter = store.adapter;
  if (!adapter) {
    stopLoop();
    return;
  }

  const currentTime = adapter.getCurrentTime();

  // Throttle the (cheap) loop-engine check to ~every 30ms to keep wraps tight
  // without doing seek math on every single frame.
  const now = performance.now();
  if (now - lastLoopCheck >= 30) {
    lastLoopCheck = now;
    store.onTick(currentTime);
  }

  emitPlayhead(currentTime);
  rafId = requestAnimationFrame(frame);
}

function startLoop() {
  if (rafId != null) return;
  lastLoopCheck = 0;
  rafId = requestAnimationFrame(frame);
}

function stopLoop() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

// Re-exported so existing subscribers keep their import path.
export { subscribeToPlayhead, emitPlayhead } from "./playhead-listeners";
export type { TimeListener } from "./playhead-listeners";

/** Read the current time on demand (outside the rAF loop). */
export function readCurrentTime(): number {
  return usePlayerStore.getState().adapter?.getCurrentTime() ?? 0;
}

/**
 * Mount-level hook that starts/stops the global rAF clock based on whether the
 * player is actively playing (or looping). Call once in the practice shell.
 */
export function usePlayheadClock() {
  const status = usePlayerStore((s) => s.status);
  const loopEnabled = usePlayerStore((s) => s.loop.enabled);
  const hasAdapter = usePlayerStore((s) => s.adapter != null);

  React.useEffect(() => {
    // Run the clock while playing/buffering, or while a loop is armed (so a
    // paused-at-B state can still update the display after a manual seek).
    const shouldRun =
      hasAdapter && (status === "playing" || status === "buffering");
    if (shouldRun) startLoop();
    else stopLoop();
    return () => {
      // Keep the loop alive across effect re-runs; only fully stop on unmount
      // is handled by the practice shell teardown below.
    };
  }, [status, loopEnabled, hasAdapter]);

  React.useEffect(() => stopLoop, []);

  // Expose a read-only current-time probe for E2E tests (never in production).
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    (
      window as unknown as { __looperCurrentTime?: () => number }
    ).__looperCurrentTime = readCurrentTime;
    return () => {
      delete (window as unknown as { __looperCurrentTime?: () => number })
        .__looperCurrentTime;
    };
  }, []);
}
