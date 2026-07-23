"use client";

import * as React from "react";
import { usePlayerStore } from "../stores/player-store";
import { YouTubePlayerAdapter } from "../adapters/youtube-adapter";
import { MockPlayerAdapter } from "../adapters/mock-adapter";
import type { PlayerAdapter } from "../types/player-adapter";
import { trackEvent } from "@/features/session/analytics";

export type AdapterKind = "youtube" | "mock";

interface UsePlayerMountOptions {
  videoId: string;
  startSeconds?: number;
  kind?: AdapterKind;
}

/**
 * Creates the player adapter, mounts it into `containerRef`, wires adapter
 * events into the store, and tears everything down on unmount / video change.
 *
 * Handles React StrictMode double-mount and fast route changes by keying the
 * effect on the videoId+kind and guarding against a stale adapter writing to
 * the store after cleanup.
 */
export function usePlayerMount({
  videoId,
  startSeconds,
  kind = "youtube",
}: UsePlayerMountOptions) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const attachAdapter = usePlayerStore((s) => s.attachAdapter);
  const detachAdapter = usePlayerStore((s) => s.detachAdapter);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const adapter: PlayerAdapter =
      kind === "mock"
        ? new MockPlayerAdapter(container, {
            onStatusChange: (status) => {
              if (!cancelled) usePlayerStore.getState().setStatus(status);
            },
            onDurationChange: (duration) => {
              if (!cancelled) usePlayerStore.getState().setDuration(duration);
            },
            onPlaybackRateChange: (rate) => {
              if (!cancelled) usePlayerStore.getState().onAppliedRate(rate);
            },
            onReady: () => {
              if (cancelled) return;
              usePlayerStore.getState().onPlayerReady();
              trackEvent({ name: "video_loaded", videoId });
            },
            onError: (error) => {
              if (!cancelled) usePlayerStore.getState().setError(error);
            },
          })
        : new YouTubePlayerAdapter(container, {
            onStatusChange: (status) => {
              if (!cancelled) usePlayerStore.getState().setStatus(status);
            },
            onDurationChange: (duration) => {
              if (!cancelled) usePlayerStore.getState().setDuration(duration);
            },
            onPlaybackRateChange: (rate) => {
              if (!cancelled) usePlayerStore.getState().onAppliedRate(rate);
            },
            onReady: () => {
              if (cancelled) return;
              usePlayerStore.getState().onPlayerReady();
              trackEvent({ name: "video_loaded", videoId });
            },
            onError: (error) => {
              if (!cancelled) usePlayerStore.getState().setError(error);
            },
          });

    attachAdapter(adapter, videoId);

    adapter.load(videoId, startSeconds).catch(() => {
      if (!cancelled) {
        usePlayerStore.getState().setError({
          kind: "unknown",
          message:
            "The player failed to load. Check your connection and try again.",
        });
      }
    });

    return () => {
      cancelled = true;
      adapter.destroy();
      detachAdapter();
      // Clear the mount node so StrictMode's second pass starts clean.
      container.replaceChildren();
    };
  }, [videoId, startSeconds, kind, attachAdapter, detachAdapter]);

  return { containerRef };
}
