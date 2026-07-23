"use client";

import * as React from "react";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { TimelineTrack } from "./timeline-track";
import { formatClock } from "@/lib/formatting/timestamp";

/**
 * The timeline beneath the player: a single full-video scale. Click or drag to
 * seek; drag the A/B handles to reshape the loop.
 */
export function Timeline() {
  const duration = usePlayerStore((s) => s.duration);
  const hasDuration = duration > 0;

  return (
    <div className="px-1">
      <TimelineTrack
        windowStart={0}
        windowEnd={hasDuration ? duration : 1}
        ariaLabel="Video timeline. Click or drag to seek; drag the A and B handles to set the loop."
      />
      <div className="tabular mt-0.5 flex justify-between text-helper text-muted">
        <span>00:00</span>
        <span>{formatClock(duration, duration >= 3600)}</span>
      </div>
    </div>
  );
}
