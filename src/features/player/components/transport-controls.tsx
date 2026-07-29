"use client";

import * as React from "react";
import {
  Pause,
  Play,
  RotateCcw,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { usePlayerStore } from "../stores/player-store";
import { IconButton, Tooltip } from "@/components/ui";
import { VolumeControl } from "./volume-control";
import { LoopToggleButton } from "@/features/loop/components/loop-toggle-button";

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
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const seekBy = usePlayerStore((s) => s.seekBy);
  const restartLoop = usePlayerStore((s) => s.restartLoop);
  const loopReady = usePlayerStore((s) => s.loop.markerA != null);

  const isPlaying = status === "playing" || status === "buffering";
  const disabled =
    status === "idle" || status === "loading" || status === "error";

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      {/* Left: the loop toggle on mobile, empty on desktop.
          Three buttons on the right could not fit beside the centre cluster
          below ~375px — the loop and forward buttons overlapped. Moving loop
          here spends the otherwise-empty column and balances both sides, so
          the centre still reads as centred. On desktop there is room, and
          loop belongs with the other loop tools, so it moves back. */}
      <div className="flex min-w-0 items-center gap-0.5">
        <span className="flex items-center gap-0.5 lg:hidden">
          <LoopToggleButton size="sm" />
          <Tooltip content="Jump to loop start" shortcut="R">
            <IconButton
              label="Restart loop from marker A"
              variant="ghost"
              size="sm"
              onClick={restartLoop}
              disabled={disabled || !loopReady}
            >
              <RotateCcw />
            </IconButton>
          </Tooltip>
        </span>
      </div>

      {/* Centre: the transport cluster. ±5s sit either side of play so the
          three read as one control. Fine 1s seeking is keyboard-only (← / →). */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <Tooltip content="Back 5s" shortcut="⇧←">
          <IconButton
            label="Seek backward 5 seconds"
            variant="ghost"
            onClick={() => seekBy(-5)}
            disabled={disabled}
          >
            <ChevronsLeft />
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

        <Tooltip content="Forward 5s" shortcut="⇧→">
          <IconButton
            label="Seek forward 5 seconds"
            variant="ghost"
            onClick={() => seekBy(5)}
            disabled={disabled}
          >
            <ChevronsRight />
          </IconButton>
        </Tooltip>
      </div>

      {/* Right: loop tools + volume on desktop; volume alone on mobile, where
          the loop pair lives in the left zone instead.

          The restart glyph belongs to "jump to loop start" — that IS the
          restart a musician wants mid-practice. Restarting the whole video is
          a seek to zero, which the timeline already does. */}
      <div className="flex min-w-0 items-center justify-end gap-0.5 sm:gap-1">
        <span className="hidden items-center gap-0.5 sm:gap-1 lg:inline-flex">
          <LoopToggleButton size="sm" />
          <Tooltip content="Jump to loop start" shortcut="R">
            <IconButton
              label="Restart loop from marker A"
              variant="ghost"
              size="sm"
              onClick={restartLoop}
              disabled={disabled || !loopReady}
            >
              <RotateCcw />
            </IconButton>
          </Tooltip>
        </span>
        <VolumeControl />
      </div>
    </div>
  );
}
