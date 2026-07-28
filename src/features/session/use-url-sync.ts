"use client";

import * as React from "react";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { serializePracticeParams } from "@/lib/validation/practice-params";

interface UrlSyncOptions {
  /** YouTube video id, when the source is YouTube. */
  videoId?: string;
  /** Local source id, when the source is a local file (`?src=local:<id>`). */
  localId?: string;
}

/**
 * Mirrors the shareable practice state into the URL via debounced
 * `history.replaceState`. Only meaningful, low-frequency state is synced
 * (markers, speed, loop) — never the playhead — so we don't spam history.
 *
 * For local files the URL carries `?src=local:<id>` instead of `?v=`, so a
 * reload reopens the cached file with the same markers.
 */
export function useUrlSync({ videoId, localId }: UrlSyncOptions) {
  const markerA = usePlayerStore((s) => s.loop.markerA);
  const markerB = usePlayerStore((s) => s.loop.markerB);
  const loopEnabled = usePlayerStore((s) => s.loop.enabled);
  const requestedSpeed = usePlayerStore((s) => s.speed.requestedRate);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = serializePracticeParams({
        // Use a stable placeholder for local; we replace the `v` key below.
        videoId: videoId ?? "___local___",
        a: markerA,
        b: markerB,
        speed: requestedSpeed,
        loop: loopEnabled,
      });
      if (!videoId && localId) {
        params.delete("v");
        params.set("src", `local:${localId}`);
      }
      const url = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(window.history.state, "", url);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [videoId, localId, markerA, markerB, loopEnabled, requestedSpeed]);
}
