"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
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
 * A slim, horizontal speed control living inside the console. Slider + a couple
 * of presets are always visible; the reconciled applied rate is shown large,
 * and any adjustment surfaces a compact status line below.
 */
export function SpeedRow() {
  const speed = usePlayerStore((s) => s.speed);
  const requestSpeed = usePlayerStore((s) => s.requestSpeed);
  const resetSpeed = usePlayerStore((s) => s.resetSpeed);

  const statusMessage = getSpeedStatusMessage(speed);
  const requested = speed.requestedRate;

  return (
    <div>
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="text-[0.68rem] font-medium uppercase tracking-[0.12em] text-muted">
          Speed
        </span>

        <span
          className="tabular w-14 shrink-0 text-[1.15rem] font-medium leading-none text-accent"
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

        <div className="hidden shrink-0 items-center gap-1 md:flex">
          {SPEED_PRESETS.filter((p) => [0.5, 0.75, 1].includes(p)).map(
            (preset) => {
              const active = Math.abs(requested - preset) < 0.005;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => requestSpeed(preset)}
                  aria-pressed={active}
                  className={cn(
                    "tabular rounded-md border px-2 py-1 text-[0.72rem] font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    active
                      ? "border-accent bg-accent-soft text-accent"
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
