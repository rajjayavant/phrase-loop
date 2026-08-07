"use client";

import * as React from "react";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { isValidVideoId } from "@/lib/youtube/parse-url";
import {
  upsertSavedLoop,
  youtubeLoopKey,
  localLoopKey,
} from "./saved-loops-storage";
import { captureLocalVideoThumbnail } from "./capture-thumbnail";

interface RecorderSource {
  kind: "youtube" | "mock" | "local";
  /** YouTube id (youtube kind). */
  videoId?: string;
  /** Cache id + file (local kind). */
  localId?: string;
  file?: File | null;
}

/**
 * Records the current source into the Saved Loops index, debounced, keeping
 * only the latest configuration per media (see saved-loops-storage).
 *
 * Waits for a real duration before the first write — "the user used this
 * loop" means the media actually loaded, not that a URL was visited. The mock
 * source is never recorded (it exists only for tests).
 */
export function useSavedLoopRecorder(source: RecorderSource) {
  const markerA = usePlayerStore((s) => s.loop.markerA);
  const markerB = usePlayerStore((s) => s.loop.markerB);
  const loopEnabled = usePlayerStore((s) => s.loop.enabled);
  const speed = usePlayerStore((s) => s.speed.requestedRate);
  const duration = usePlayerStore((s) => s.duration);

  const { kind, videoId, localId, file } = source;

  // One capture per file identity: the entry's thumb is sticky in storage, so
  // re-capturing on every marker nudge would be pure waste.
  const capturedForRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (kind === "mock" || duration <= 0) return;
    if (kind === "youtube" && !(videoId && isValidVideoId(videoId))) return;
    if (kind === "local" && !(localId && file)) return;

    const timer = window.setTimeout(() => {
      const title =
        usePlayerStore.getState().adapter?.getMediaTitle?.() ?? null;
      const base = {
        title,
        markerA,
        markerB,
        speed,
        loopEnabled,
        duration,
        thumb: null,
        updatedAt: Date.now(),
      };

      if (kind === "youtube" && videoId) {
        upsertSavedLoop({
          ...base,
          key: youtubeLoopKey(videoId),
          kind: "youtube",
          id: videoId,
        });
        return;
      }

      if (kind === "local" && localId && file) {
        const key = localLoopKey(file);
        upsertSavedLoop({
          ...base,
          key,
          kind: "local",
          id: localId,
          title: title ?? file.name,
        });
        // Thumbnail rides in afterwards; the entry is already saved either way.
        if (capturedForRef.current !== key) {
          capturedForRef.current = key;
          void captureLocalVideoThumbnail(file).then((thumb) => {
            if (!thumb) return;
            upsertSavedLoop({
              ...base,
              key,
              kind: "local",
              id: localId,
              title: title ?? file.name,
              thumb,
            });
          });
        }
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [
    kind,
    videoId,
    localId,
    file,
    markerA,
    markerB,
    loopEnabled,
    speed,
    duration,
  ]);
}
