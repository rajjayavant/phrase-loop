"use client";

import * as React from "react";

export type DragTarget = "playhead" | "markerA" | "markerB" | null;

interface UseTimelineDragOptions {
  /** Convert a clientX to a time in seconds within [0, duration]. */
  clientXToTime: (clientX: number) => number;
  onSeek: (seconds: number) => void;
  onMoveMarker: (marker: "A" | "B", seconds: number) => void;
  onDragStateChange?: (target: DragTarget) => void;
}

/**
 * Unified pointer-drag handling for the timeline. Uses Pointer Events so mouse,
 * touch, and pen all work through one path. Pointer capture keeps the drag
 * alive outside the element, and `touch-action: none` on the track (set by the
 * component) prevents the page from scrolling while dragging on mobile.
 *
 * Crucially, a marker's pointerdown stops propagation so it can never *also*
 * trigger a track seek — the playhead, marker A, and marker B no longer fight
 * over the same pixels.
 */
export function useTimelineDrag({
  clientXToTime,
  onSeek,
  onMoveMarker,
  onDragStateChange,
}: UseTimelineDragOptions) {
  const dragTargetRef = React.useRef<DragTarget>(null);

  const setTarget = React.useCallback(
    (target: DragTarget) => {
      dragTargetRef.current = target;
      onDragStateChange?.(target);
    },
    [onDragStateChange],
  );

  const apply = React.useCallback(
    (target: Exclude<DragTarget, null>, clientX: number) => {
      const time = clientXToTime(clientX);
      if (target === "playhead") onSeek(time);
      else onMoveMarker(target === "markerA" ? "A" : "B", time);
    },
    [clientXToTime, onSeek, onMoveMarker],
  );

  const handlePointerDown = React.useCallback(
    (target: Exclude<DragTarget, null>) => (event: React.PointerEvent) => {
      // A marker drag must not bubble to the track (which would seek).
      if (target !== "playhead") event.stopPropagation();
      event.preventDefault();
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      setTarget(target);
      apply(target, event.clientX);
    },
    [apply, setTarget],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent) => {
      const target = dragTargetRef.current;
      if (!target) return;
      event.preventDefault();
      apply(target, event.clientX);
    },
    [apply],
  );

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent) => {
      if (!dragTargetRef.current) return;
      try {
        (event.currentTarget as HTMLElement).releasePointerCapture(
          event.pointerId,
        );
      } catch {
        // capture may already be released
      }
      setTarget(null);
    },
    [setTarget],
  );

  /** Click-to-seek / scrub on the track background. */
  const handleTrackPointerDown = React.useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0) return;
      handlePointerDown("playhead")(event);
    },
    [handlePointerDown],
  );

  return {
    dragTargetRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTrackPointerDown,
  };
}
