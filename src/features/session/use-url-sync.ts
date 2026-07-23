"use client";

import * as React from "react";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { serializePracticeParams } from "@/lib/validation/practice-params";

/**
 * Mirrors the shareable practice state into the URL via debounced
 * `history.replaceState`. Only meaningful, low-frequency state is synced
 * (markers, speed, loop) — never the playhead — so we don't spam history.
 */
export function useUrlSync(videoId: string) {
  const markerA = usePlayerStore((s) => s.loop.markerA);
  const markerB = usePlayerStore((s) => s.loop.markerB);
  const loopEnabled = usePlayerStore((s) => s.loop.enabled);
  const requestedSpeed = usePlayerStore((s) => s.speed.requestedRate);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = serializePracticeParams({
        videoId,
        a: markerA,
        b: markerB,
        speed: requestedSpeed,
        loop: loopEnabled,
      });
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(window.history.state, "", url);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [videoId, markerA, markerB, loopEnabled, requestedSpeed]);
}
