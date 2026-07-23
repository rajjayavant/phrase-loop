"use client";

import * as React from "react";
import { Gauge, RotateCcw } from "lucide-react";
import { usePlayerStore } from "../stores/player-store";
import {
  formatRate,
  getSpeedStatusMessage,
  SPEED_PRESETS,
  SPEED_STEP,
} from "../stores/speed-state";
import { MAX_SPEED, MIN_SPEED } from "@/lib/validation/practice-params";
import { IconButton, Slider, StatusMessage, Tooltip } from "@/components/ui";
import { cn } from "@/lib/utilities/cn";

/**
 * A slim, horizontal speed control that sits directly under the timeline.
 * Slider + a couple of presets are always visible; the reconciled applied rate
 * is shown and any adjustment surfaces a compact status line below.
 */
export function SpeedRow() {
  const speed = usePlayerStore((s) => s.speed);
  const requestSpeed = usePlayerStore((s) => s.requestSpeed);
  const resetSpeed = usePlayerStore((s) => s.resetSpeed);

  const statusMessage = getSpeedStatusMessage(speed);
  const requested = speed.requestedRate;

  return (
    <div className="rounded-card border border-border bg-surface px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 items-center gap-1.5 text-label uppercase tracking-wide text-muted">
          <Gauge className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Speed</span>
        </div>

        <span
          className="tabular w-12 shrink-0 text-numeric font-semibold text-primary"
          aria-live="off"
        >
          {formatRate(speed.appliedRate)}
        </span>

        <Slider
          label="Playback speed"
          value={[requested]}
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={SPEED_STEP}
          onValueChange={([v]) => requestSpeed(v ?? 1)}
          aria-valuetext={formatRate(requested)}
          className="min-w-0 flex-1"
        />

        {/* A few key presets inline; the full set is in Advanced settings. */}
        <div className="hidden shrink-0 items-center gap-1 md:flex">
          {SPEED_PRESETS.filter((p) => [0.5, 0.75, 1, 1.25].includes(p)).map(
            (preset) => {
              const active = Math.abs(requested - preset) < 0.005;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => requestSpeed(preset)}
                  aria-pressed={active}
                  className={cn(
                    "tabular rounded-control border px-2 py-1 text-helper font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    active
                      ? "bg-accent-surface border-accent text-accent"
                      : "border-border text-secondary hover:border-border-strong hover:text-primary",
                  )}
                >
                  {formatRate(preset)}
                </button>
              );
            },
          )}
        </div>

        <Tooltip content="Reset to 1×">
          <IconButton
            label="Reset speed to 1×"
            variant="ghost"
            size="sm"
            onClick={resetSpeed}
            disabled={requested === 1}
          >
            <RotateCcw />
          </IconButton>
        </Tooltip>
      </div>

      {statusMessage && (
        <StatusMessage
          tone={speed.status === "unsupported" ? "warning" : "info"}
          className="mt-2.5"
        >
          {statusMessage}
        </StatusMessage>
      )}
    </div>
  );
}
