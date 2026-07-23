"use client";

import * as React from "react";
import { subscribeToPlayhead } from "@/features/player/hooks/use-playhead";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { useTimelineDrag, type DragTarget } from "../hooks/use-timeline-drag";
import { clamp } from "@/lib/utilities/clamp";
import { formatClock } from "@/lib/formatting/timestamp";
import { cn } from "@/lib/utilities/cn";

interface TimelineTrackProps {
  /** Visible window start in seconds. */
  windowStart: number;
  /** Visible window end in seconds. */
  windowEnd: number;
  /** Compact height variant for the precision lane. */
  compact?: boolean;
  ariaLabel: string;
}

/**
 * A single scrubbable timeline lane over a [windowStart, windowEnd] window.
 *
 * Layout that fixes the "three controls fight over the same pixels" bug:
 *   - The clickable track (seek/scrub) is a thin bar in the vertical middle.
 *   - Marker A/B handles are tall pills that sit ABOVE the track on their own
 *     z-layer with wide grab targets; their pointerdown stops propagation so a
 *     marker drag never also seeks.
 *   - The playhead is purely visual (`pointer-events-none`) and never steals a
 *     drag.
 *
 * The playhead is positioned imperatively from the rAF playhead subscription,
 * so playback never re-renders this component.
 */
export function TimelineTrack({
  windowStart,
  windowEnd,
  compact,
  ariaLabel,
}: TimelineTrackProps) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const playheadRef = React.useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = React.useState<number | null>(null);
  const [dragTarget, setDragTarget] = React.useState<DragTarget>(null);

  const duration = usePlayerStore((s) => s.duration);
  const markerA = usePlayerStore((s) => s.loop.markerA);
  const markerB = usePlayerStore((s) => s.loop.markerB);
  const loopEnabled = usePlayerStore((s) => s.loop.enabled);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const moveMarker = usePlayerStore((s) => s.moveMarker);
  const setActiveMarker = usePlayerStore((s) => s.setActiveMarker);

  const windowSpan = Math.max(0.001, windowEnd - windowStart);

  const timeToPercent = React.useCallback(
    (time: number) => clamp(((time - windowStart) / windowSpan) * 100, 0, 100),
    [windowStart, windowSpan],
  );

  const clientXToTime = React.useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return windowStart;
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return windowStart + ratio * windowSpan;
    },
    [windowStart, windowSpan],
  );

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTrackPointerDown,
  } = useTimelineDrag({
    clientXToTime,
    onSeek: seekTo,
    onMoveMarker: (marker, seconds) => {
      setActiveMarker(marker);
      moveMarker(marker, seconds);
    },
    onDragStateChange: setDragTarget,
  });

  // Position the playhead imperatively from the rAF clock.
  React.useEffect(() => {
    const node = playheadRef.current;
    if (!node) return;
    const update = (time: number) => {
      const percent = timeToPercent(time);
      node.style.left = `${percent}%`;
      node.style.opacity =
        time < windowStart - 0.01 || time > windowEnd + 0.01 ? "0" : "1";
    };
    update(usePlayerStore.getState().adapter?.getCurrentTime() ?? 0);
    return subscribeToPlayhead(update);
  }, [timeToPercent, windowStart, windowEnd]);

  const aPercent = markerA != null ? timeToPercent(markerA) : null;
  const bPercent = markerB != null ? timeToPercent(markerB) : null;
  const showLoopRegion = aPercent != null && bPercent != null;

  const handleHover = (event: React.PointerEvent) => {
    if (event.pointerType === "touch") return;
    setHoverTime(clientXToTime(event.clientX));
  };

  // Total interactive height gives markers room to extend above the track.
  const laneHeight = compact ? "h-9" : "h-11";
  const trackThickness = compact ? "h-2" : "h-2.5";

  return (
    <div className={cn("relative select-none", laneHeight)}>
      {/* Marker + region layer (above the track). Pointer-transparent except
          on the marker handles themselves. */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {aPercent != null && (
          <MarkerHandle
            marker="A"
            percent={aPercent}
            dragging={dragTarget === "markerA"}
            onPointerDown={handlePointerDown("markerA")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            compact={compact}
            time={markerA}
          />
        )}
        {bPercent != null && (
          <MarkerHandle
            marker="B"
            percent={bPercent}
            dragging={dragTarget === "markerB"}
            onPointerDown={handlePointerDown("markerB")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            compact={compact}
            time={markerB}
          />
        )}
      </div>

      {/* The seek/scrub track, vertically centered. */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={windowStart}
        aria-valuemax={windowEnd}
        aria-valuenow={usePlayerStore.getState().adapter?.getCurrentTime() ?? 0}
        aria-valuetext={`${formatClock(windowStart)} to ${formatClock(windowEnd)}`}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={(e) => {
          handlePointerMove(e);
          handleHover(e);
        }}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => setHoverTime(null)}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 0.1 : 1;
          const now = usePlayerStore.getState().adapter?.getCurrentTime() ?? 0;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            seekTo(now - step);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            seekTo(now + step);
          }
        }}
        className={cn(
          "absolute inset-x-0 top-1/2 z-10 -translate-y-1/2",
          "w-full cursor-pointer touch-none rounded-pill bg-timeline-track",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          trackThickness,
        )}
      >
        {/* Loop region */}
        {showLoopRegion && (
          <div
            className={cn(
              "absolute inset-y-0 rounded-pill",
              loopEnabled
                ? "ring-accent/40 bg-[var(--color-loop-region)] ring-1 ring-inset"
                : "bg-subtle",
            )}
            style={{
              left: `${Math.min(aPercent, bPercent)}%`,
              width: `${Math.abs(bPercent - aPercent)}%`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Playhead (purely visual) */}
        <div
          ref={playheadRef}
          className="pointer-events-none absolute top-1/2 z-[15] -translate-x-1/2 -translate-y-1/2"
          style={{ left: "0%" }}
          aria-hidden="true"
        >
          <div
            className={cn(
              "rounded-pill bg-primary shadow-tooltip ring-2 ring-canvas",
              compact ? "h-3.5 w-3.5" : "h-4 w-4",
            )}
          />
        </div>

        {/* Hover preview */}
        {hoverTime != null && duration > 0 && (
          <div
            className="tabular pointer-events-none absolute -top-8 z-30 -translate-x-1/2 rounded-sm border border-border bg-elevated px-1.5 py-0.5 text-[0.65rem] text-primary shadow-tooltip"
            style={{ left: `${timeToPercent(hoverTime)}%` }}
            aria-hidden="true"
          >
            {formatClock(hoverTime, duration >= 3600)}
          </div>
        )}
      </div>
    </div>
  );
}

interface MarkerHandleProps {
  marker: "A" | "B";
  percent: number;
  dragging: boolean;
  compact?: boolean;
  time: number | null;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

/**
 * A tall marker handle: a labeled cap sitting above the track connected to a
 * thin stem that crosses it. The whole thing is one wide pointer target, which
 * makes A and B easy to grab and impossible to confuse with a track seek.
 */
function MarkerHandle({
  marker,
  percent,
  dragging,
  compact,
  time,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: MarkerHandleProps) {
  const isA = marker === "A";
  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-20 -translate-x-1/2"
      style={{ left: `${percent}%` }}
    >
      <button
        type="button"
        aria-label={`Marker ${marker}${time != null ? ` at ${formatClock(time)}` : ""}, drag to adjust`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={cn(
          "group pointer-events-auto absolute inset-y-0 flex cursor-ew-resize touch-none flex-col items-center",
          // Wide invisible hit area so the handle is easy to grab.
          "-translate-x-1/2 px-2",
          "focus-visible:outline-none",
        )}
      >
        {/* Cap */}
        <span
          className={cn(
            "flex items-center justify-center rounded-sm border font-semibold text-canvas",
            "shadow-tooltip transition-transform",
            "group-focus-visible:ring-2 group-focus-visible:ring-focus group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-canvas",
            isA ? "border-marker-a bg-marker-a" : "border-marker-b bg-marker-b",
            dragging && "scale-110",
            compact ? "h-4 w-4 text-[0.6rem]" : "h-5 w-5 text-[0.65rem]",
          )}
        >
          {marker}
        </span>
        {/* Stem crossing the track */}
        <span
          className={cn(
            "mt-0.5 w-0.5 flex-1 rounded-pill",
            isA ? "bg-marker-a" : "bg-marker-b",
            dragging ? "opacity-100" : "opacity-80",
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
