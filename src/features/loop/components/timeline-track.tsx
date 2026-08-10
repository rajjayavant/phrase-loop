"use client";

import * as React from "react";
import { subscribeToPlayhead } from "@/features/player/hooks/use-playhead";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { trackEvent } from "@/features/session/analytics";
import { useTimelineDrag, type DragTarget } from "../hooks/use-timeline-drag";
import { clamp } from "@/lib/utilities/clamp";
import { formatClock } from "@/lib/formatting/timestamp";
import { cn } from "@/lib/utilities/cn";

interface TimelineTrackProps {
  windowStart: number;
  windowEnd: number;
  compact?: boolean;
  ariaLabel: string;
}

const TICK_COUNT = 40;

/**
 * The ruled "tape" track — the instrument's scrub surface.
 *
 * Layout that keeps the playhead, marker A and marker B from fighting over the
 * same pixels:
 *   - The seek/scrub tape fills the vertical center; clicking it seeks.
 *   - A/B chips are tall hardware-style handles ABOVE the tape, on their own
 *     z-layer with wide grab targets; a marker drag stops propagation so it
 *     never also seeks.
 *   - The playhead is a bright vertical line + cap, purely visual.
 *
 * The playhead is positioned imperatively from the rAF clock, so playback never
 * re-renders this component.
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

  // For analytics: the previous drag target, so releasing a marker drag can
  // be told apart from releasing a playhead scrub. State alone loses the
  // "what was being dragged" by the time the release arrives.
  const lastDragTargetRef = React.useRef<DragTarget>(null);

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
    onDragStateChange: (target) => {
      const previous = lastDragTargetRef.current;
      lastDragTargetRef.current = target;
      // Releasing a dragged marker is placing it — the drag counterpart of
      // pressing A/B, fired once per drag rather than per movement.
      if (target === null && (previous === "markerA" || previous === "markerB")) {
        trackEvent({
          name: "marker_set",
          marker: previous === "markerA" ? "A" : "B",
        });
      }
      setDragTarget(target);
    },
  });

  React.useEffect(() => {
    const node = playheadRef.current;
    if (!node) return;
    const update = (time: number) => {
      node.style.left = `${timeToPercent(time)}%`;
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

  const laneHeight = compact ? "h-12" : "h-16";
  const tapeThickness = compact ? "h-8" : "h-11";

  return (
    <div className={cn("relative select-none", laneHeight)}>
      {/* Marker chip layer (above the tape). Pointer-transparent except on the
          chips themselves. */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {aPercent != null && (
          <MarkerHandle
            marker="A"
            percent={aPercent}
            dragging={dragTarget === "markerA"}
            compact={compact}
            onPointerDown={handlePointerDown("markerA")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            time={markerA}
          />
        )}
        {bPercent != null && (
          <MarkerHandle
            marker="B"
            percent={bPercent}
            dragging={dragTarget === "markerB"}
            compact={compact}
            onPointerDown={handlePointerDown("markerB")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            time={markerB}
          />
        )}
      </div>

      {/* The scrub tape */}
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
          "absolute inset-x-0 top-1/2 -translate-y-1/2 z-10",
          "w-full cursor-pointer touch-none overflow-hidden rounded-control",
          "border border-border bg-timeline-track",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          tapeThickness,
        )}
      >
        {/* Ruler ticks etched into the tape — a faint, evenly-spaced hairline
            ruler that reads as engraved metal, not a barcode. */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-between px-2"
          aria-hidden="true"
        >
          {Array.from({ length: TICK_COUNT + 1 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "w-px rounded-full bg-primary",
                i % 5 === 0 ? "h-2 opacity-[0.14]" : "h-1 opacity-[0.07]",
              )}
            />
          ))}
        </div>

        {/* Loop region — a warm ember band with glowing boundary posts. */}
        {showLoopRegion && (
          <div
            className={cn(
              "absolute inset-y-0 transition-colors",
              loopEnabled
                ? "bg-gradient-to-b from-accent/35 via-accent/20 to-accent/25"
                : "bg-timeline-buffer",
            )}
            style={{
              left: `${Math.min(aPercent, bPercent)}%`,
              width: `${Math.abs(bPercent - aPercent)}%`,
            }}
            aria-hidden="true"
          >
            <span className="absolute inset-y-0 left-0 w-[2px] bg-marker-a shadow-[0_0_8px_var(--color-marker-a)]" />
            <span className="absolute inset-y-0 right-0 w-[2px] bg-marker-b shadow-[0_0_8px_var(--color-marker-b)]" />
          </div>
        )}

        {/* Playhead: bright vertical filament + cap */}
        <div
          ref={playheadRef}
          className="pointer-events-none absolute inset-y-0 z-[15] -translate-x-1/2"
          style={{ left: "0%" }}
          aria-hidden="true"
        >
          <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-primary shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-tooltip" />
        </div>

        {/* Hover preview */}
        {hoverTime != null && duration > 0 && (
          <div
            className="tabular pointer-events-none absolute -top-9 z-30 -translate-x-1/2 rounded-sm border border-border bg-elevated px-1.5 py-0.5 text-[0.65rem] text-primary shadow-tooltip"
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
  time: number | null;
  /** Matches the track's own `compact`; the tape is thinner, so the cap sits lower. */
  compact?: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

/**
 * A hardware-style marker chip: a labeled cap sitting above the tape with a
 * thin stem crossing it.
 *
 * The drag target is the CAP ONLY, and it is deliberately larger than it looks
 * — an invisible expander gives it a ~44px square of hit area (the platform
 * touch-target minimum) centred on a visually smaller chip.
 *
 * The stem is `pointer-events-none`. It used to be part of a full-height,
 * 20px-wide button, which made a wall either side of every marker: clicking
 * the track anywhere near A or B grabbed the marker instead of seeking. Since
 * the track is the only thing that seeks and a mis-seek is far more common
 * than a mis-drag, the stem now yields to the track entirely and the cap
 * absorbs the precision.
 */
function MarkerHandle({
  marker,
  percent,
  dragging,
  time,
  compact,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: MarkerHandleProps) {
  const isA = marker === "A";
  // The tape is centred in the lane, so its top edge is half its thickness
  // above centre. Anchoring the cap's bottom there rests it on the tape without
  // ever overlapping it. Keep in step with `tapeThickness` above.
  const capBottom = compact ? "bottom-[calc(50%+1rem)]" : "bottom-[calc(50%+1.375rem)]";
  const stemHeight = compact ? "h-8" : "h-11";
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
          "group pointer-events-auto absolute left-0 -translate-x-1/2",
          // The cap rests ON TOP of the tape's upper edge, never over it: the
          // button is bottom-anchored to the tape line, so its whole box lives
          // in the clear lane above. Any height that dipped onto the tape would
          // recreate the dead zone where a nearby click grabs the marker
          // instead of seeking. Width stays generous for the thumb.
          capBottom,
          "grid h-8 w-11 cursor-ew-resize touch-none items-end justify-center",
          "focus-visible:outline-none",
        )}
      >
        <span
          className={cn(
            "flex h-[1.2rem] w-[1.4rem] items-center justify-center rounded-md border font-mono text-[0.65rem] font-semibold text-black",
            "shadow-tooltip transition-transform",
            "group-focus-visible:ring-2 group-focus-visible:ring-focus group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-surface",
            isA ? "border-marker-a bg-marker-a" : "border-marker-b bg-marker-b",
            dragging ? "scale-110" : "group-hover:scale-105",
          )}
        >
          {marker}
        </span>
      </button>

      {/* Stem: purely visual, and bounded to the tape. It spans exactly the
          tape's height (centred, 2.75rem) so nothing hangs below the grid.
          Pointer-transparent, or it would reinstate the dead zone. */}
      <span
        className={cn(
          "pointer-events-none absolute left-0 top-1/2 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full",
          stemHeight,
          isA ? "bg-marker-a" : "bg-marker-b",
          dragging ? "opacity-100" : "opacity-70",
        )}
        aria-hidden="true"
      />
    </div>
  );
}
