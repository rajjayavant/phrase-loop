"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { serializePracticeParams } from "@/lib/validation/practice-params";
import { toast } from "@/components/ui";
import { announce } from "./announcer";
import { trackEvent } from "@/features/session/analytics";

/**
 * Builds the current shareable URL and copies it to the clipboard, with a
 * toast + screen-reader announcement. Falls back to a temporary textarea when
 * the async clipboard API is unavailable.
 */
export function CopyLinkButton({ trigger }: { trigger: React.ReactElement }) {
  const buildUrl = React.useCallback((): string | null => {
    const state = usePlayerStore.getState();
    if (!state.videoId) return null;
    const params = serializePracticeParams({
      videoId: state.videoId,
      a: state.loop.markerA,
      b: state.loop.markerB,
      speed: state.speed.requestedRate,
      loop: state.loop.enabled,
    });
    // Local sources are keyed `local:<id>`; rewrite `v` → `src` so the link
    // reopens the cached file (same browser only).
    if (state.videoId.startsWith("local:")) {
      params.delete("v");
      params.set("src", state.videoId);
    }
    return `${window.location.origin}/?${params.toString()}`;
  }, []);

  const copy = React.useCallback(async () => {
    const url = buildUrl();
    if (!url) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        fallbackCopy(url);
      }
      toast.success("Practice link copied", "Paste it anywhere to share.");
      announce("Practice link copied to clipboard");
      trackEvent({ name: "practice_link_copied" });
    } catch {
      toast.show({
        title: "Couldn't copy automatically",
        description: url,
        duration: 6000,
      });
    }
  }, [buildUrl]);

  return <Slot onClick={copy}>{trigger}</Slot>;
}

function fallbackCopy(text: string): void {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}
