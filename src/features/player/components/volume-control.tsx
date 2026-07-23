"use client";

import * as React from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import { usePlayerStore } from "../stores/player-store";
import {
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Slider,
  Tooltip,
} from "@/components/ui";

/** Volume + mute, tucked into a popover to keep the transport row compact. */
export function VolumeControl() {
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);

  const effectiveVolume = muted ? 0 : volume;
  const Icon =
    muted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <Popover>
      <Tooltip content="Volume">
        <PopoverTrigger asChild>
          <IconButton label="Volume and mute" variant="ghost">
            <Icon />
          </IconButton>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent align="end" className="w-56">
        <div className="flex items-center gap-3">
          <IconButton
            label={muted ? "Unmute" : "Mute"}
            variant="ghost"
            size="sm"
            active={muted}
            onClick={toggleMute}
          >
            {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
          </IconButton>
          <Slider
            label="Volume"
            value={[effectiveVolume]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => setVolume(v ?? 0)}
            className="flex-1"
            aria-valuetext={`${Math.round(effectiveVolume)} percent`}
          />
          <span className="tabular w-9 text-right text-helper text-muted">
            {Math.round(effectiveVolume)}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
