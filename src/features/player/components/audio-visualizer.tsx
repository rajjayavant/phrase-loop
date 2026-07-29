"use client";

import * as React from "react";
import { Music2, Loader2 } from "lucide-react";
import { usePlayerStore } from "../stores/player-store";
import { subscribeToPlayhead, readCurrentTime } from "../hooks/use-playhead";
import { extractPeaks } from "@/lib/audio/waveform";
import { cn } from "@/lib/utilities/cn";

interface AudioVisualizerProps {
  file: File;
}

/**
 * The faceplate for audio-only sources.
 *
 * A video fills the panel with a picture; audio would leave a black rectangle,
 * which reads as broken and gives the eye nothing to hold during a long
 * practice loop. So we draw the whole file's waveform with a moving playhead.
 *
 * This is deliberately a *static* waveform rather than a live spectrum
 * analyser. A dancing bar chart is decorative and tells you nothing about
 * where you are; the shape of the recording shows the attack and decay of each
 * phrase, so placing markers A and B becomes a visual act rather than a
 * guessing game. It also still says something useful while paused, which a
 * live analyser cannot.
 */
export function AudioVisualizer({ file }: AudioVisualizerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [peaks, setPeaks] = React.useState<Float32Array | null>(null);
  const [decoding, setDecoding] = React.useState(true);

  const duration = usePlayerStore((s) => s.duration);
  const markerA = usePlayerStore((s) => s.loop.markerA);
  const markerB = usePlayerStore((s) => s.loop.markerB);

  // Decode once per file. Peaks are small and fixed-size, so they can live in
  // state; the decoded PCM never leaves extractPeaks.
  React.useEffect(() => {
    let cancelled = false;
    setDecoding(true);
    setPeaks(null);

    void extractPeaks(file).then((result) => {
      if (cancelled) return;
      setPeaks(result);
      setDecoding(false);
    });

    return () => {
      cancelled = true;
    };
  }, [file]);

  // Redraw from the app's single global playhead clock rather than starting a
  // second rAF loop. `subscribeToPlayhead` already runs at ~60fps while
  // playing and notifies imperatively, so the waveform tracks playback without
  // ever causing a React re-render.
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks) return;

    const draw = (currentTime: number) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Match the backing store to the CSS size so bars stay crisp on HiDPI.
      const dpr = window.devicePixelRatio || 1;
      const { width: cssWidth, height: cssHeight } =
        canvas.getBoundingClientRect();
      if (cssWidth === 0 || cssHeight === 0) return;
      if (canvas.width !== Math.round(cssWidth * dpr)) {
        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      const mid = cssHeight / 2;
      const slot = cssWidth / peaks.length;
      // Leave ~35% of each slot as gap so individual bars stay distinguishable.
      const barWidth = Math.max(1.5, slot * 0.65);
      const position = duration > 0 ? currentTime / duration : 0;
      const playedX = position * cssWidth;

      // The loop region, drawn behind the bars so the loop reads as a
      // highlighted span of the recording.
      if (markerA != null && markerB != null && duration > 0) {
        const ax = (markerA / duration) * cssWidth;
        const bx = (markerB / duration) * cssWidth;
        ctx.fillStyle = "rgba(224, 86, 31, 0.14)";
        ctx.fillRect(ax, 0, Math.max(1, bx - ax), cssHeight);
      }

      for (let i = 0; i < peaks.length; i += 1) {
        // Centre the bar in its slot so gaps read evenly on both sides.
        const x = i * slot + (slot - barWidth) / 2;
        // A floor of 2px keeps silent passages visible as a thin line rather
        // than a gap, so the timeline still reads as continuous.
        const amplitude = Math.max(2, (peaks[i] ?? 0) * (cssHeight * 0.86));
        const inLoop =
          markerA != null &&
          markerB != null &&
          duration > 0 &&
          x >= (markerA / duration) * cssWidth &&
          x <= (markerB / duration) * cssWidth;

        // Played is full accent; unplayed is a dim neutral. The gap between
        // them has to be wide or the playhead's position stops being readable
        // at a glance, which is the whole point while looping.
        if (x <= playedX) {
          ctx.fillStyle = "#ff6a2c";
        } else if (inLoop) {
          ctx.fillStyle = "rgba(224, 86, 31, 0.30)";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
        }
        ctx.fillRect(x, mid - amplitude / 2, barWidth, amplitude);
      }

      // Playhead.
      if (duration > 0) {
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillRect(playedX - 1, 0, 2, cssHeight);
      }
    };

    // Draw once immediately so the waveform is correct while paused, then
    // follow the clock.
    draw(readCurrentTime());
    return subscribeToPlayhead(draw);
  }, [peaks, duration, markerA, markerB]);

  return (
    <div className="relative h-full w-full bg-[#0d0b0a]">
      {/* A faint accent wash so the panel doesn't read as an empty black box. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,rgba(224,86,31,0.10),transparent_70%)]"
      />

      {peaks && (
        <canvas
          ref={canvasRef}
          className="absolute inset-x-0 top-1/2 h-[58%] w-full -translate-y-1/2 px-6"
          // The canvas is decorative; the timeline and time readouts carry the
          // same information accessibly.
          aria-hidden="true"
        />
      )}

      {decoding && (
        <div className="absolute inset-0 grid place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent motion-reduce:animate-none" />
        </div>
      )}

      {!decoding && !peaks && (
        // Decoding failed (an exotic codec the <audio> tag may still play).
        // Playback is unaffected, so show the file identity rather than an error.
        <div className="absolute inset-0 grid place-items-center">
          <Music2 className="h-10 w-10 text-secondary" />
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center gap-2 px-6 py-4",
          "text-small-body text-secondary",
        )}
      >
        <Music2 className="h-4 w-4 shrink-0 text-accent" />
        <span className="truncate" title={file.name}>
          {file.name}
        </span>
      </div>
    </div>
  );
}
