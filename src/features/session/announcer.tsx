"use client";

import * as React from "react";
import { create } from "zustand";

/**
 * A single polite `aria-live` region for significant, non-visual state changes
 * (marker set, loop enabled, speed adjusted, invalid range, link copied).
 *
 * Deliberately separate from toasts: not every announcement warrants a visible
 * card, and playhead updates must NEVER be announced. Callers push short
 * phrases; the region is cleared shortly after so repeated identical messages
 * still re-announce.
 */

interface AnnouncerStore {
  message: string;
  announce: (message: string) => void;
  clear: () => void;
}

const useAnnouncerStore = create<AnnouncerStore>((set) => ({
  message: "",
  announce: (message) => set({ message }),
  clear: () => set({ message: "" }),
}));

/** Announce a phrase to assistive technology. Safe to call outside React. */
export function announce(message: string): void {
  useAnnouncerStore.getState().announce(message);
}

export function Announcer() {
  const message = useAnnouncerStore((s) => s.message);
  const clear = useAnnouncerStore((s) => s.clear);

  React.useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(clear, 1000);
    return () => window.clearTimeout(timer);
  }, [message, clear]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
