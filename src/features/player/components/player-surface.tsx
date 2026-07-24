"use client";

import * as React from "react";
import { Loader2, AlertTriangle, Play } from "lucide-react";
import { usePlayerStore } from "../stores/player-store";
import { cn } from "@/lib/utilities/cn";

interface PlayerSurfaceProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const ERROR_TITLES: Record<string, string> = {
  "invalid-video": "Invalid video",
  "not-embeddable": "Playback disabled here",
  "not-found": "Video unavailable",
  "html5-error": "Playback error",
  network: "Network problem",
  unknown: "Could not load video",
};

/**
 * The player faceplate — the visual centerpiece. The video sits inside a
 * rounded device panel with an ambient accent glow behind it and a faint inner
 * top-light, so it reads like a physical unit rather than an embedded iframe.
 * Status overlays keep the region from ever being blank.
 */
export function PlayerSurface({ containerRef }: PlayerSurfaceProps) {
  const status = usePlayerStore((s) => s.status);
  const error = usePlayerStore((s) => s.error);
  const play = usePlayerStore((s) => s.play);

  const isLoading = status === "loading" || status === "idle";
  const isReadyToStart = status === "ready";

  return (
    <div className="relative">
      {/* Ambient glow bloom behind the faceplate. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-8 -top-6 bottom-2 bg-glow blur-2xl"
      />
      <div
        className={cn(
          "relative overflow-hidden rounded-card border border-border bg-black",
          "shadow-faceplate",
        )}
      >
        <div className="aspect-video w-full">
          <div
            ref={containerRef}
            className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full"
          />
        </div>

        {isLoading && !error && (
          <Overlay>
            <Loader2 className="h-7 w-7 animate-spin text-accent motion-reduce:animate-none" />
            <p className="mt-3 text-small-body text-secondary">
              Loading the player…
            </p>
          </Overlay>
        )}

        {isReadyToStart && !error && (
          <Overlay interactive>
            <button
              type="button"
              onClick={play}
              aria-label="Start playback"
              className={cn(
                "group grid h-20 w-20 place-items-center rounded-full",
                "bg-accent text-accent-contrast",
                "shadow-[0_10px_40px_-8px_rgba(224,86,31,0.6)]",
                "transition-transform duration-hover ease-emphasized hover:scale-105 active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-black",
              )}
            >
              <Play className="h-8 w-8 translate-x-0.5 fill-current" />
            </button>
            <p className="mt-5 text-small-body text-secondary">
              Press <Kbd>Space</Kbd> or click to begin
            </p>
          </Overlay>
        )}

        {error && (
          <Overlay interactive>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive-surface text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <p className="mt-4 font-display text-lg font-semibold text-primary">
              {ERROR_TITLES[error.kind] ?? ERROR_TITLES.unknown}
            </p>
            <p className="mt-1 max-w-sm text-small-body text-secondary">
              {error.message}
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${usePlayerStore.getState().videoId ?? ""}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 text-small-body font-medium text-accent underline-offset-4 hover:underline"
            >
              Open on YouTube →
            </a>
          </Overlay>
        )}
      </div>
    </div>
  );
}

function Overlay({
  children,
  interactive,
}: {
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center px-5 text-center",
        "bg-gradient-to-b from-black/70 via-black/80 to-black/90 backdrop-blur-sm",
        interactive ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {children}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 rounded border border-border-strong bg-elevated px-1.5 py-0.5 font-mono text-[0.7rem] text-primary">
      {children}
    </kbd>
  );
}
