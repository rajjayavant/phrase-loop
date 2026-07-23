"use client";

import * as React from "react";
import { usePlayerStore } from "../stores/player-store";
import { formatRate, SPEED_PRESETS, SPEED_STEP } from "../stores/speed-state";
import { MAX_SPEED, MIN_SPEED } from "@/lib/validation/practice-params";
import { NumberField } from "@/components/ui";
import { cn } from "@/lib/utilities/cn";

/**
 * The full speed preset grid plus exact numeric entry (0.01 step). Lives in
 * Advanced settings; the always-visible slim SpeedRow covers the common case.
 */
export function SpeedPresets() {
  const speed = usePlayerStore((s) => s.speed);
  const requestSpeed = usePlayerStore((s) => s.requestSpeed);
  const requested = speed.requestedRate;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-label uppercase tracking-wide text-muted">
          Exact speed
        </span>
        <div className="w-24">
          <label htmlFor="speed-exact" className="sr-only">
            Exact playback speed
          </label>
          <NumberField
            id="speed-exact"
            value={requested}
            onValueChange={() => {
              /* commit on blur/Enter only */
            }}
            onCommit={(v) => requestSpeed(v)}
            step={SPEED_STEP}
            min={MIN_SPEED}
            max={MAX_SPEED}
            aria-label="Exact playback speed"
            className="h-8 text-timestamp"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {SPEED_PRESETS.map((preset) => {
          const active = Math.abs(requested - preset) < 0.005;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => requestSpeed(preset)}
              aria-pressed={active}
              className={cn(
                "tabular rounded-control border px-2 py-1.5 text-label font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                active
                  ? "bg-accent-surface border-accent text-accent"
                  : "border-border text-secondary hover:border-border-strong hover:text-primary",
              )}
            >
              {formatRate(preset)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
