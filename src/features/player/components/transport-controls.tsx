"use client";

import * as React from "react";
import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { usePlayerStore } from "../stores/player-store";
import { IconButton, Tooltip } from "@/components/ui";
import { PlayheadTime } from "./playhead-time";
import { VolumeControl } from "./volume-control";
import { LoopToggleButton } from "@/features/loop/components/loop-toggle-button";
import { formatClock } from "@/lib/formatting/timestamp";

/**
 * The transport bar. A three-zone grid keeps the play/pause button centered
 * horizontally beneath the video regardless of how wide the side zones grow.
 *
 *   [ time · seek-back ]      [ ◀ ▶⏸ ▶ ]      [ loop · restart · volume ]
 *
 * Fine 100ms seeking lives on Shift+Arrow (keyboard) — the on-screen 100ms
 * buttons were removed as redundant.
 */
export function TransportControls() {
  const status = usePlayerStore((s) => s.status);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seekBy = usePlayerStore((s) => s.seekBy);
  const restartVideo = usePlayerStore((s) => s.restartVideo);
  const restartLoop = usePlayerStore((s) => s.restartLoop);
  const loopReady = usePlayerStore((s) => s.loop.markerA != null);

  const isPlaying = status === "playing" || status === "buffering";
  const disabled =
    status === "idle" || status === "loading" || status === "error";
  const forceHours = duration >= 3600;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      {/* Left zone: time + coarse back seeks */}
      <div className="flex min-w-0 items-center gap-1">
        <div className="mr-1 hidden items-baseline gap-1.5 text-timestamp sm:flex">
          <PlayheadTime precise className="text-primary" />
          <span className="text-muted" aria-hidden="true">
            /
          </span>
          <span className="tabular text-muted">
            {formatClock(duration, forceHours)}
          </span>
        </div>
        <Tooltip content="Back 5s">
          <IconButton
            label="Seek backward 5 seconds"
            variant="ghost"
            size="sm"
            onClick={() => seekBy(-5)}
            disabled={disabled}
          >
            <ChevronsLeft />
          </IconButton>
        </Tooltip>
      </div>

      {/* Center zone: the transport cluster — play/pause is the visual center */}
      <div className="flex items-center gap-1.5">
        <Tooltip content="Back 1s" shortcut="←">
          <IconButton
            label="Seek backward 1 second"
            variant="ghost"
            onClick={() => seekBy(-1)}
            disabled={disabled}
          >
            <ChevronLeft />
          </IconButton>
        </Tooltip>

        <Tooltip content={isPlaying ? "Pause" : "Play"} shortcut="Space">
          <IconButton
            label={isPlaying ? "Pause" : "Play"}
            variant="primary"
            size="lg"
            onClick={togglePlay}
            disabled={disabled}
          >
            {isPlaying ? <Pause /> : <Play />}
          </IconButton>
        </Tooltip>

        <Tooltip content="Forward 1s" shortcut="→">
          <IconButton
            label="Seek forward 1 second"
            variant="ghost"
            onClick={() => seekBy(1)}
            disabled={disabled}
          >
            <ChevronRight />
          </IconButton>
        </Tooltip>
      </div>

      {/* Right zone: loop toggle + forward + restart + volume */}
      <div className="flex min-w-0 items-center justify-end gap-1">
        <Tooltip content="Forward 5s">
          <IconButton
            label="Seek forward 5 seconds"
            variant="ghost"
            size="sm"
            onClick={() => seekBy(5)}
            disabled={disabled}
          >
            <ChevronsRight />
          </IconButton>
        </Tooltip>
        <LoopToggleButton size="sm" />
        <Tooltip content="Jump to loop start" shortcut="R">
          <IconButton
            label="Restart loop from marker A"
            variant="ghost"
            size="sm"
            onClick={restartLoop}
            disabled={disabled || !loopReady}
          >
            <SkipBack />
          </IconButton>
        </Tooltip>
        <Tooltip content="Restart video">
          <IconButton
            label="Restart video from the beginning"
            variant="ghost"
            size="sm"
            onClick={restartVideo}
            disabled={disabled}
          >
            <RotateCcw />
          </IconButton>
        </Tooltip>
        <VolumeControl />
      </div>
    </div>
  );
}
