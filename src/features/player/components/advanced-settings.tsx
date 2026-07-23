"use client";

import * as React from "react";
import { ChevronDown, Maximize, SlidersHorizontal } from "lucide-react";
import { MarkerControls } from "@/features/loop/components/marker-controls";
import { SpeedPresets } from "./speed-presets";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utilities/cn";

/**
 * A single collapsible "Advanced settings" panel that holds the precision
 * tools kept out of the default view: marker editing (set/drag/nudge/exact),
 * the full speed preset grid + exact entry, and fullscreen. Collapsed by
 * default so the main surface stays calm.
 */
export function AdvancedSettings() {
  const [open, setOpen] = React.useState(false);

  const requestFullscreen = () => {
    const iframe = document.querySelector<HTMLIFrameElement>("iframe");
    const target = iframe ?? document.documentElement;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (target.requestFullscreen) {
      void target.requestFullscreen().catch(() => {
        /* fullscreen may be blocked; non-fatal */
      });
    }
  };

  return (
    <div className="rounded-card border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-card px-4 py-3 text-label uppercase tracking-wide text-muted transition-colors hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Advanced settings
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-menu",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <MarkerControls />
          <SpeedPresets />
          <Button
            variant="secondary"
            size="sm"
            className="w-full gap-2"
            onClick={requestFullscreen}
          >
            <Maximize className="h-4 w-4" />
            Toggle fullscreen
          </Button>
        </div>
      )}
    </div>
  );
}
