"use client";

import * as React from "react";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { TimelineTrack } from "./timeline-track";
import { PlayheadTime } from "@/features/player/components/playhead-time";
import { formatClock, formatTimestamp } from "@/lib/formatting/timestamp";
import { getLoopValidity } from "../engine/loop-state";

/**
 * The timeline — the instrument's hero surface. A readout strip (elapsed · loop
 * length · total) sits above a ruled "tape" track with draggable A/B chips.
 */
export function Timeline() {
  const duration = usePlayerStore((s) => s.duration);
  const markerA = usePlayerStore((s) => s.loop.markerA);
  const markerB = usePlayerStore((s) => s.loop.markerB);
  const loop = usePlayerStore((s) => s.loop);
  const hasDuration = duration > 0;
  const forceHours = duration >= 3600;

  const loopLength =
    markerA != null && markerB != null ? markerB - markerA : null;
  const loopValid = getLoopValidity(loop) === "valid";

  return (
    <div>
      {/* Readout strip */}
      <div className="mb-3 flex items-end justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted">
            Position
          </span>
          <PlayheadTime
            precise
            className="text-[1.35rem] font-medium leading-none text-primary"
          />
        </div>

        <div className="flex flex-col items-center text-center">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted">
            Loop
          </span>
          <span
            className={
              loopLength != null && loopValid
                ? "tabular text-[1.05rem] leading-none text-accent"
                : "tabular text-[1.05rem] leading-none text-muted"
            }
          >
            {loopLength != null ? formatTimestamp(loopLength) : "—:—.—"}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted">
            Duration
          </span>
          <span className="tabular text-[1.05rem] leading-none text-secondary">
            {formatClock(duration, forceHours)}
          </span>
        </div>
      </div>

      <TimelineTrack
        windowStart={0}
        windowEnd={hasDuration ? duration : 1}
        ariaLabel="Video timeline. Click or drag to seek; drag the A and B handles to set the loop."
      />
    </div>
  );
}
