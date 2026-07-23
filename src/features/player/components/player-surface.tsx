"use client";

import * as React from "react";
import { Loader2, AlertTriangle, PlayCircle } from "lucide-react";
import { usePlayerStore } from "../stores/player-store";
import { Button } from "@/components/ui";
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
 * The 16:9 player region. The YouTube iframe mounts into `containerRef`; status
 * overlays sit above it so the region is never blank without explanation. The
 * aspect-ratio box is fixed to avoid layout shift during initialization.
 */
export function PlayerSurface({ containerRef }: PlayerSurfaceProps) {
  const status = usePlayerStore((s) => s.status);
  const error = usePlayerStore((s) => s.error);
  const play = usePlayerStore((s) => s.play);

  const isLoading = status === "loading" || status === "idle";
  const isReadyToStart = status === "ready";

  return (
    <div className="relative w-full overflow-hidden rounded-card border border-border bg-black">
      <div className="aspect-video w-full">
        <div
          ref={containerRef}
          className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full"
        />
      </div>

      {/* Loading overlay */}
      {isLoading && !error && (
        <Overlay>
          <Loader2 className="h-7 w-7 animate-spin text-accent motion-reduce:animate-none" />
          <p className="mt-3 text-small-body text-secondary">
            Loading the player…
          </p>
        </Overlay>
      )}

      {/* Ready-to-start overlay (autoplay is never assumed) */}
      {isReadyToStart && !error && (
        <Overlay interactive>
          <Button
            size="lg"
            onClick={play}
            className="gap-2.5"
            aria-label="Start playback"
          >
            <PlayCircle className="h-5 w-5" />
            Start
          </Button>
          <p className="mt-3 text-helper text-muted">
            Press Space or click to begin
          </p>
        </Overlay>
      )}

      {/* Error overlay */}
      {error && (
        <Overlay interactive>
          <div className="bg-destructive-surface flex h-11 w-11 items-center justify-center rounded-pill text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="mt-3 text-section-title text-primary">
            {ERROR_TITLES[error.kind] ?? ERROR_TITLES.unknown}
          </p>
          <p className="mt-1 max-w-sm text-small-body text-secondary">
            {error.message}
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${usePlayerStore.getState().videoId ?? ""}`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 text-small-body text-accent underline-offset-2 hover:underline"
          >
            Open on YouTube
          </a>
        </Overlay>
      )}
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
        "bg-canvas/85 absolute inset-0 flex flex-col items-center justify-center px-5 text-center backdrop-blur-sm",
        interactive ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {children}
    </div>
  );
}
