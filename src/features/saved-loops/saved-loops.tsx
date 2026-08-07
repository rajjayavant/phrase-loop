"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Music, Repeat, X } from "lucide-react";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { hasCachedFile } from "@/features/player/stores/local-source";
import { formatTimestamp } from "@/lib/formatting/timestamp";
import { formatRate } from "@/features/player/stores/speed-state";
import { cn } from "@/lib/utilities/cn";
import {
  listSavedLoops,
  removeSavedLoop,
  type SavedLoop,
} from "./saved-loops-storage";

interface SavedLoopsProps {
  /**
   * Identity of the media currently in the player (see saved-loops-storage
   * keys). Its own entry is hidden — a shelf offering to reopen what is
   * already open is noise.
   */
  currentKey?: string | null;
}

/**
 * The Saved Loops shelf: every video or file the user has practiced, one tile
 * each, newest first, with the last-used loop configuration baked into the
 * tile's link. Local entries appear only while their file is still in the
 * IndexedDB cache — a tile that cannot open is worse than no tile.
 */
export function SavedLoops({ currentKey = null }: SavedLoopsProps) {
  const router = useRouter();
  const activate = usePlayerStore((s) => s.activate);
  const [entries, setEntries] = React.useState<SavedLoop[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const all = listSavedLoops().filter((e) => e.key !== currentKey);
    const locals = all.filter((e) => e.kind === "local");
    if (locals.length === 0) {
      setEntries(all);
      return;
    }
    void Promise.all(
      locals.map(async (e) => [e.key, await hasCachedFile(e.id)] as const),
    ).then((checks) => {
      if (cancelled) return;
      const gone = new Set(checks.filter(([, ok]) => !ok).map(([k]) => k));
      setEntries(all.filter((e) => !gone.has(e.key)));
    });
    return () => {
      cancelled = true;
    };
  }, [currentKey]);

  // null = still checking local availability on first paint. Rendering
  // nothing for that beat avoids a flash of entries that then disappear.
  if (entries === null) return null;

  return (
    <section aria-label="Saved loops">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h2 className="text-[0.72rem] font-medium uppercase tracking-[0.12em] text-muted">
          Saved loops
        </h2>

      </div>

      {entries.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {entries.map((entry) => (
            <li key={entry.key} className="group relative">
              <button
                type="button"
                onClick={() => {
                  // Opening a saved loop is unambiguous play intent, exactly
                  // like pasting a link — no second facade gate.
                  activate();
                  router.push(hrefFor(entry));
                }}
                className={cn(
                  "block w-full overflow-hidden rounded-card border border-border bg-surface text-left",
                  "transition-colors duration-hover ease-standard hover:border-border-strong",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                )}
              >
                <Thumb entry={entry} />
                <div className="px-3 py-2.5">
                  <p className="truncate text-small-body font-medium text-primary">
                    {entry.title ?? fallbackTitle(entry)}
                  </p>
                  <p className="tabular mt-0.5 truncate text-helper text-muted">
                    {loopSummary(entry)}
                  </p>
                </div>
              </button>
              <button
                type="button"
                aria-label={`Remove ${entry.title ?? fallbackTitle(entry)} from saved loops`}
                onClick={() => {
                  removeSavedLoop(entry.key);
                  setEntries((prev) =>
                    prev ? prev.filter((e) => e.key !== entry.key) : prev,
                  );
                }}
                className={cn(
                  "absolute right-1.5 top-1.5 z-[1] grid h-6 w-6 place-items-center rounded-full",
                  "bg-black/60 text-primary backdrop-blur-sm",
                  "opacity-0 transition-opacity duration-hover focus-visible:opacity-100 group-hover:opacity-100",
                  "hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                )}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function hrefFor(entry: SavedLoop): string {
  if (entry.kind === "youtube") {
    // Markers ride in the saved per-video session and restore on open; the
    // bare URL keeps shared-link semantics (URL params would also win over a
    // *newer* session, so passing them here could resurrect stale markers).
    return `/?v=${entry.id}`;
  }
  // Local markers have no session store — they ride in the URL.
  const params = new URLSearchParams({ src: `local:${entry.id}` });
  if (entry.markerA != null) params.set("a", String(entry.markerA));
  if (entry.markerB != null) params.set("b", String(entry.markerB));
  if (entry.speed !== 1) params.set("speed", String(entry.speed));
  params.set("loop", entry.loopEnabled ? "1" : "0");
  return `/?${params.toString()}`;
}

function fallbackTitle(entry: SavedLoop): string {
  return entry.kind === "youtube" ? "YouTube video" : "Local file";
}

/** "0:42 – 1:05 · 0.75×", degrading gracefully when parts are unknown. */
function loopSummary(entry: SavedLoop): string {
  const ts = (s: number) => formatTimestamp(s, { showMilliseconds: false });
  const wholeClip =
    entry.markerA != null &&
    entry.markerB != null &&
    entry.markerA === 0 &&
    entry.duration > 0 &&
    Math.abs(entry.markerB - entry.duration) < 1;
  const range =
    entry.markerA != null && entry.markerB != null && !wholeClip
      ? `${ts(entry.markerA)} – ${ts(entry.markerB)}`
      : entry.duration > 0
        ? `Whole clip · ${ts(entry.duration)}`
        : "Whole clip";
  return entry.speed !== 1 ? `${range} · ${formatRate(entry.speed)}` : range;
}

function Thumb({ entry }: { entry: SavedLoop }) {
  const src =
    entry.kind === "youtube"
      ? `https://i.ytimg.com/vi/${entry.id}/mqdefault.jpg`
      : entry.thumb;

  if (!src) {
    // Audio (or a video whose frame capture failed): a quiet icon tile.
    return (
      <div className="grid aspect-video w-full place-items-center border-b border-border bg-elevated">
        <Music className="h-7 w-7 text-muted" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className="relative aspect-video w-full overflow-hidden border-b border-border bg-black">
      {/* Small remote or data-URL thumbnails, below the fold, lazy. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-hover ease-standard group-hover:scale-[1.03]"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-border bg-surface px-6 py-10 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-elevated text-muted">
        <Repeat className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="mt-3 text-small-body font-medium text-primary">
        No saved loops yet
      </p>
      <p className="mt-1 max-w-sm text-helper text-muted">
        Every video or file you practice lands here automatically, with its
        markers and speed, ready to pick back up.
      </p>
    </div>
  );
}
