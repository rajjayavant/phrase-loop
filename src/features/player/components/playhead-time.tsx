"use client";

import * as React from "react";
import { subscribeToPlayhead } from "../hooks/use-playhead";
import { usePlayerStore } from "../stores/player-store";
import { formatClock, formatTimestamp } from "@/lib/formatting/timestamp";
import { cn } from "@/lib/utilities/cn";

interface PlayheadTimeProps {
  /** Show milliseconds (MM:SS.mmm) vs clock (MM:SS). */
  precise?: boolean;
  className?: string;
}

/**
 * Renders the live current time by writing to the DOM imperatively from the
 * playhead subscription — it never triggers a React re-render, so it can update
 * every frame cheaply.
 */
export function PlayheadTime({
  precise = false,
  className,
}: PlayheadTimeProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const duration = usePlayerStore((s) => s.duration);
  const forceHours = duration >= 3600;

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const format = (t: number) =>
      precise ? formatTimestamp(t, { forceHours }) : formatClock(t, forceHours);
    // Seed immediately.
    node.textContent = format(
      usePlayerStore.getState().adapter?.getCurrentTime() ?? 0,
    );
    return subscribeToPlayhead((time) => {
      node.textContent = format(time);
    });
  }, [precise, forceHours]);

  return (
    <span ref={ref} className={cn("tabular", className)} aria-hidden="true">
      00:00
    </span>
  );
}
