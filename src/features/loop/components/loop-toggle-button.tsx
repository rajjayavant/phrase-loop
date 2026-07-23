"use client";

import * as React from "react";
import { Repeat } from "lucide-react";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { getLoopValidity } from "../engine/loop-state";
import { IconButton, Tooltip } from "@/components/ui";

/**
 * The single loop control in the transport bar. Rendered as a plain icon
 * button matching the other transport icons — it just lights up (accent) when
 * looping is on. On by default; disabled only when the region is invalid.
 */
export function LoopToggleButton({ size = "md" }: { size?: "sm" | "md" }) {
  const loop = usePlayerStore((s) => s.loop);
  const toggleLoop = usePlayerStore((s) => s.toggleLoop);
  const canLoop = getLoopValidity(loop) === "valid";
  const on = loop.enabled && canLoop;

  return (
    <Tooltip content={on ? "Looping on" : "Looping off"} shortcut="L">
      <IconButton
        label={on ? "Disable looping" : "Enable looping"}
        variant="ghost"
        size={size}
        active={on}
        onClick={toggleLoop}
        disabled={!canLoop}
      >
        <Repeat />
      </IconButton>
    </Tooltip>
  );
}
