"use client";

import * as React from "react";
import { usePlayerStore } from "../stores/player-store";
import { YouTubePlayerAdapter } from "../adapters/youtube-adapter";
import { MockPlayerAdapter } from "../adapters/mock-adapter";
import { LocalFilePlayerAdapter } from "../adapters/local-file-adapter";
import type { PlayerAdapter, PlayerAdapterEvents } from "../types/player-adapter";
import { trackEvent } from "@/features/session/analytics";
import { consumeLoadMethod } from "@/features/session/load-method";
import { isAudioFile } from "../adapters/local-file-adapter";

export type AdapterKind = "youtube" | "mock" | "local";

interface UsePlayerMountOptions {
  /** Stable identity for this source (YouTube id, or a local source id). */
  videoId: string;
  startSeconds?: number;
  kind?: AdapterKind;
  /** Required when `kind === "local"`. */
  file?: File | null;
}

/**
 * Creates the player adapter, mounts it into `containerRef`, wires adapter
 * events into the store, and tears everything down on unmount / source change.
 *
 * Handles React StrictMode double-mount and fast route changes by keying the
 * effect on the source id + kind and guarding against a stale adapter writing
 * to the store after cleanup.
 */
export function usePlayerMount({
  videoId,
  startSeconds,
  kind = "youtube",
  file = null,
}: UsePlayerMountOptions) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const attachAdapter = usePlayerStore((s) => s.attachAdapter);
  const detachAdapter = usePlayerStore((s) => s.detachAdapter);
  const activation = usePlayerStore((s) => s.activation);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Behind the facade: no adapter, no iframe, no third-party script until
    // the visitor expresses intent (see `activation` in the store). Mock and
    // local sources are exempt — they are same-origin and cost nothing, and
    // the e2e suite drives the mock without a facade click.
    if (kind === "youtube" && activation === "pending") return;

    let cancelled = false;

    // Shared event wiring — identical across every adapter, so a new source
    // type never has to re-implement store plumbing.
    const events: PlayerAdapterEvents = {
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
        if (kind !== "mock") {
          trackEvent({
            name: "media_loaded",
            source:
              kind === "youtube"
                ? "youtube"
                : file && isAudioFile(file)
                  ? "local_audio"
                  : "local_video",
            method: consumeLoadMethod(),
            video_id: kind === "youtube" ? videoId : undefined,
          });
        }
      },
      onError: (error) => {
        if (!cancelled) usePlayerStore.getState().setError(error);
      },
    };

    let adapter: PlayerAdapter;
    if (kind === "mock") {
      adapter = new MockPlayerAdapter(container, events);
    } else if (kind === "local") {
      if (!file) {
        usePlayerStore.getState().setError({
          kind: "not-found",
          message:
            "This local file is no longer available. Open a video or audio file to practice.",
        });
        return;
      }
      adapter = new LocalFilePlayerAdapter(container, file, events);
    } else {
      adapter = new YouTubePlayerAdapter(container, events);
    }

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
  }, [videoId, startSeconds, kind, file, activation, attachAdapter, detachAdapter]);

  return { containerRef };
}
