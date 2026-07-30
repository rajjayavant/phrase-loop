"use client";

import * as React from "react";
import { usePlayerStore } from "@/features/player/stores/player-store";

/**
 * Global keyboard shortcuts for the practice workspace.
 *
 * Guards:
 *   - Never fires while focus is in an input/textarea/contenteditable, or when
 *     a modifier we don't own (Meta/Ctrl/Alt) is held.
 *   - Uses `event.code` for layout-stable letter keys.
 *
 * Conflict decisions match `shortcut-definitions.ts`:
 *   L = loop only, K/Space = play, J = slower, Shift+J = faster,
 *   [ / ] = move the selected marker, arrows = seek.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts() {
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (isEditableTarget(event.target)) return;
      // Let browser/OS shortcuts through.
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const store = usePlayerStore.getState();
      const precision = store.nudgePrecision;

      switch (event.code) {
        case "Space":
        case "KeyK":
          event.preventDefault();
          store.togglePlay();
          return;
        case "KeyA":
          event.preventDefault();
          store.setMarkerA();
          return;
        case "KeyB":
          event.preventDefault();
          store.setMarkerB();
          return;
        case "KeyL":
          event.preventDefault();
          store.toggleLoop();
          return;
        case "KeyR":
          event.preventDefault();
          store.restartLoop();
          return;
        // Speed follows YouTube's own bindings — ⇧, slower, ⇧. faster —
        // so the muscle memory users arrive with just works. Unshifted
        // comma/period stay free.
        case "Comma":
          if (!event.shiftKey) return;
          event.preventDefault();
          store.nudgeSpeed(-0.05);
          return;
        case "Period":
          if (!event.shiftKey) return;
          event.preventDefault();
          store.nudgeSpeed(0.05);
          return;
        // Plain arrow = 1s, Shift+arrow = 5s. The 5s jump used to be a button
        // on the transport bar; it lives here now so the bar stays uncluttered.
        case "ArrowLeft":
          event.preventDefault();
          store.seekBy(event.shiftKey ? -5 : -1);
          return;
        case "ArrowRight":
          event.preventDefault();
          store.seekBy(event.shiftKey ? 5 : 1);
          return;
        case "BracketLeft":
          event.preventDefault();
          store.nudgeActiveMarker(-precision);
          return;
        case "BracketRight":
          event.preventDefault();
          store.nudgeActiveMarker(precision);
          return;
        default:
          return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
