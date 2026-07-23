"use client";

import * as React from "react";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { saveSession } from "./session-storage";

/**
 * Persists the practice session to localStorage (keyed by video ID) whenever
 * meaningful state changes, debounced. Playhead time is never persisted.
 */
export function useSessionSync(videoId: string) {
  const markerA = usePlayerStore((s) => s.loop.markerA);
  const markerB = usePlayerStore((s) => s.loop.markerB);
  const loopEnabled = usePlayerStore((s) => s.loop.enabled);
  const requestedSpeed = usePlayerStore((s) => s.speed.requestedRate);
  const appliedSpeed = usePlayerStore((s) => s.speed.appliedRate);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const nudgePrecision = usePlayerStore((s) => s.nudgePrecision);
  const timelineMode = usePlayerStore((s) => s.timelineMode);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      saveSession({
        videoId,
        markerA,
        markerB,
        loopEnabled,
        requestedSpeed,
        appliedSpeed,
        volume,
        muted,
        nudgePrecision,
        timelineMode,
        updatedAt: Date.now(),
      });
    }, 500);
    return () => window.clearTimeout(timer);
  }, [
    videoId,
    markerA,
    markerB,
    loopEnabled,
    requestedSpeed,
    appliedSpeed,
    volume,
    muted,
    nudgePrecision,
    timelineMode,
  ]);
}
