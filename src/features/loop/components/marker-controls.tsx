"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Flag, X } from "lucide-react";
import {
  usePlayerStore,
  type ActiveMarker,
} from "@/features/player/stores/player-store";
import type { NudgePrecision } from "@/features/session/session-storage";
import {
  Card,
  CardHeader,
  CardTitle,
  IconButton,
  SegmentedControl,
  TextField,
  Tooltip,
} from "@/components/ui";
import { formatTimestamp, parseTimestamp } from "@/lib/formatting/timestamp";
import { cn } from "@/lib/utilities/cn";

const PRECISION_OPTIONS = [
  { value: "0.01", label: "10ms" },
  { value: "0.1", label: "100ms" },
  { value: "1", label: "1s" },
] as const;

/** Set, clear, nudge, and precisely enter marker timestamps. */
export function MarkerControls() {
  const loop = usePlayerStore((s) => s.loop);
  const activeMarker = usePlayerStore((s) => s.activeMarker);
  const setActiveMarker = usePlayerStore((s) => s.setActiveMarker);
  const setMarkerA = usePlayerStore((s) => s.setMarkerA);
  const setMarkerB = usePlayerStore((s) => s.setMarkerB);
  const clearMarkerA = usePlayerStore((s) => s.clearMarkerA);
  const clearMarkerB = usePlayerStore((s) => s.clearMarkerB);
  const moveMarker = usePlayerStore((s) => s.moveMarker);
  const nudgePrecision = usePlayerStore((s) => s.nudgePrecision);
  const setNudgePrecision = usePlayerStore((s) => s.setNudgePrecision);

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Flag className="h-3.5 w-3.5" />
          Markers
        </CardTitle>
        <SegmentedControl
          label="Nudge precision"
          size="sm"
          options={PRECISION_OPTIONS}
          value={String(nudgePrecision) as "0.01" | "0.1" | "1"}
          onValueChange={(v) =>
            setNudgePrecision(Number.parseFloat(v) as NudgePrecision)
          }
        />
      </CardHeader>

      <div className="mt-4 flex flex-col gap-3">
        <MarkerRow
          marker="A"
          value={loop.markerA}
          active={activeMarker === "A"}
          precision={nudgePrecision}
          onSelect={() => setActiveMarker("A")}
          onSet={() => setMarkerA()}
          onClear={clearMarkerA}
          onNudge={(delta) =>
            loop.markerA != null && moveMarker("A", loop.markerA + delta)
          }
          onExact={(seconds) => moveMarker("A", seconds)}
        />
        <MarkerRow
          marker="B"
          value={loop.markerB}
          active={activeMarker === "B"}
          precision={nudgePrecision}
          onSelect={() => setActiveMarker("B")}
          onSet={() => setMarkerB()}
          onClear={clearMarkerB}
          onNudge={(delta) =>
            loop.markerB != null && moveMarker("B", loop.markerB + delta)
          }
          onExact={(seconds) => moveMarker("B", seconds)}
        />
      </div>

      <p className="mt-3 text-helper text-muted">
        Nudge steps by {formatPrecision(nudgePrecision)}. The{" "}
        <span className="text-secondary">selected</span> marker also responds to{" "}
        <kbd className="text-secondary">[</kbd> and{" "}
        <kbd className="text-secondary">]</kbd>.
      </p>
    </Card>
  );
}

function formatPrecision(precision: NudgePrecision): string {
  if (precision === 1) return "1 second";
  return `${precision * 1000} ms`;
}

interface MarkerRowProps {
  marker: ActiveMarker;
  value: number | null;
  active: boolean;
  precision: NudgePrecision;
  onSelect: () => void;
  onSet: () => void;
  onClear: () => void;
  onNudge: (delta: number) => void;
  onExact: (seconds: number) => void;
}

function MarkerRow({
  marker,
  value,
  active,
  precision,
  onSelect,
  onSet,
  onClear,
  onNudge,
  onExact,
}: MarkerRowProps) {
  const isSet = value != null;
  const markerColor = marker === "A" ? "text-marker-a" : "text-marker-b";
  const [draft, setDraft] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  const [invalid, setInvalid] = React.useState(false);

  React.useEffect(() => {
    if (!editing) setDraft(value != null ? formatTimestamp(value) : "");
  }, [value, editing]);

  const commit = () => {
    setEditing(false);
    const parsed = parseTimestamp(draft);
    if (parsed == null) {
      setInvalid(true);
      setDraft(value != null ? formatTimestamp(value) : "");
      return;
    }
    setInvalid(false);
    onExact(parsed);
  };

  return (
    <div
      className={cn(
        "rounded-control border p-2.5 transition-colors",
        active ? "border-accent/50 bg-accent-surface/40" : "border-border",
      )}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSelect}
          className="flex items-center gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-pressed={active}
          aria-label={`Select marker ${marker}${active ? " (selected)" : ""}`}
        >
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-sm border text-label font-semibold",
              markerColor,
              marker === "A" ? "border-marker-a/40" : "border-marker-b/40",
            )}
          >
            {marker}
          </span>
          {active && (
            <span className="text-helper uppercase tracking-wide text-accent">
              Selected
            </span>
          )}
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSet}
            className="rounded-control border border-border px-2.5 py-1 text-label font-medium text-secondary transition-colors hover:border-border-strong hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Set at playhead
          </button>
          <Tooltip content={`Clear marker ${marker}`}>
            <IconButton
              label={`Clear marker ${marker}`}
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={!isSet}
            >
              <X />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <Tooltip content={`Nudge back ${precision * 1000}ms`}>
          <IconButton
            label={`Nudge marker ${marker} earlier`}
            variant="secondary"
            size="sm"
            onClick={() => onNudge(-precision)}
            disabled={!isSet}
          >
            <ChevronLeft />
          </IconButton>
        </Tooltip>
        <TextField
          value={draft}
          invalid={invalid}
          disabled={!isSet}
          placeholder="—:—.—"
          aria-label={`Marker ${marker} timestamp`}
          onFocus={() => {
            setEditing(true);
            onSelect();
          }}
          onChange={(e) => {
            setDraft(e.target.value);
            if (invalid) setInvalid(false);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit();
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="tabular h-8 flex-1 text-center text-timestamp"
        />
        <Tooltip content={`Nudge forward ${precision * 1000}ms`}>
          <IconButton
            label={`Nudge marker ${marker} later`}
            variant="secondary"
            size="sm"
            onClick={() => onNudge(precision)}
            disabled={!isSet}
          >
            <ChevronRight />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}
