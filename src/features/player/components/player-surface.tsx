"use client";

import * as React from "react";
import Image from "next/image";
import { Loader2, AlertTriangle, Play, RotateCcw } from "lucide-react";
import { usePlayerStore } from "../stores/player-store";
import { AudioVisualizer } from "./audio-visualizer";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utilities/cn";

interface PlayerSurfaceProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Set for an audio-only local file. Audio has no picture, so the waveform
   * visualizer takes the faceplate instead of leaving a black rectangle.
   */
  audioFile?: File | null;
  /**
   * YouTube id whose thumbnail backs the facade before activation. Only set
   * for the YouTube source; local and mock sources load eagerly and never
   * show a facade.
   */
  posterVideoId?: string | null;
}

const ERROR_TITLES: Record<string, string> = {
  "invalid-video": "Invalid video",
  // Deliberately not "the owner disabled embedding" — YouTube emits this code
  // for region blocks, age gates, and unresolvable ids too. See mapErrorCode.
  "not-embeddable": "YouTube won't play this here",
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
export function PlayerSurface({
  containerRef,
  audioFile = null,
  posterVideoId = null,
}: PlayerSurfaceProps) {
  const status = usePlayerStore((s) => s.status);
  const error = usePlayerStore((s) => s.error);
  const play = usePlayerStore((s) => s.play);
  const activation = usePlayerStore((s) => s.activation);
  const starting = usePlayerStore((s) => s.starting);

  // Pre-activation facade: the video's own thumbnail with the start button.
  // The YouTube iframe (and its ~1 MB of script) does not exist yet — it is
  // created when this overlay's `play` fires. See `activation` in the store.
  const showFacade = posterVideoId != null && activation === "pending";
  // From the activation gesture until playback begins, the facade picture
  // holds steady: poster on top of the booting iframe, start button showing a
  // spinner in place. One picture, no black flash, no overlay churn.
  const showStarting = posterVideoId != null && starting;
  const holdPoster = showFacade || showStarting;

  const isLoading =
    !holdPoster && (status === "loading" || status === "idle");
  const isReadyToStart = !holdPoster && status === "ready";

  return (
    <div className="relative isolate">
      {/* Ambient glow bloom behind the faceplate.
       *
       * The clipping wrapper is load-bearing, not decoration. The bloom uses a
       * negative inset to bleed outside the faceplate; unclipped, that bleed
       * counts as layout width. On a 390px phone the page measured 406px, so
       * the browser zoomed out to fit and produced both scrollbars — and since
       * pages only scroll rightward, the left bleed was clipped while the right
       * stayed scrollable, which is why the side padding looked uneven. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -inset-x-8 -top-6 bottom-2 bg-glow blur-2xl" />
      </div>
      <div
        className={cn(
          "relative overflow-hidden rounded-card border border-border bg-black",
          "shadow-faceplate",
        )}
      >
        <div className="relative aspect-video w-full">
          {/* Facade poster. Rendered ABOVE the mount node (z-[1]) and kept
              there until playback actually starts, so the iframe boots — and
              flashes black — invisibly underneath it. Unmounted the moment
              `starting` clears. Decorative — the start button (in the z-[2]
              overlay above it) carries the accessible name. */}
          {holdPoster && !audioFile && posterVideoId != null && (
            <PosterImage videoId={posterVideoId} />
          )}
          {/* For audio the mount node holds a screen-reader-only <audio>
              element, so the waveform fills the panel behind the overlays. */}
          {audioFile && <AudioVisualizer file={audioFile} />}
          <div
            ref={containerRef}
            className={cn(
              "relative h-full w-full [&_iframe]:h-full [&_iframe]:w-full",
              audioFile && "absolute inset-0",
            )}
          />
        </div>

        {holdPoster && !error && (
          // Light scrim: the thumbnail IS the content here — the heavy
          // gradient + backdrop blur made it look muddy and out of focus.
          <Overlay interactive={showFacade} light>
            <StartButton
              onClick={play}
              label="Load the player and start playback"
              onWarm={warmYouTubeConnections}
              pending={showStarting}
            />
            {/* Own scrim pill: over the light overlay the caption sits on the
                raw thumbnail, which can be arbitrarily bright or busy. */}
            <p className="mt-5 rounded-pill bg-black/65 px-4 py-1.5 text-small-body text-primary backdrop-blur-sm">
              {showStarting ? (
                "Starting…"
              ) : (
                <>
                  Press <Kbd>Space</Kbd> or click to begin
                </>
              )}
            </p>
          </Overlay>
        )}

        {isLoading && !error && (
          <Overlay>
            <Loader2 className="h-7 w-7 animate-spin text-accent motion-reduce:animate-none" />
            <p className="mt-3 text-small-body text-secondary">
              Loading the player…
            </p>
          </Overlay>
        )}

        {isReadyToStart && !error && (
          <Overlay interactive light={audioFile != null}>
            <StartButton onClick={play} label="Start playback" />
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
            {/* These errors are often transient — the same video can fail once
                and load on a second attempt — so a retry has to be reachable
                without reloading the page and losing the loop. */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="h-4 w-4" />
                Try again
              </Button>
              <YouTubeFallbackLink />
            </div>
          </Overlay>
        )}
      </div>
    </div>
  );
}

/**
 * The facade thumbnail, sharpest available first: maxresdefault (1280×720)
 * only exists for some videos, so on a miss we step down to hqdefault, which
 * always exists. YouTube serves a small grey placeholder instead of a 404 for
 * missing maxres; it is detectable by its natural width.
 *
 * Served through next/image: resized to the actual slot, re-encoded, cached
 * long (see `images` in next.config.ts), and preloaded from the same origin —
 * this img is the page's LCP element, so its delivery is the LCP.
 */
function PosterImage({ videoId }: { videoId: string }) {
  const QUALITIES = ["maxresdefault", "hqdefault"] as const;
  const [quality, setQuality] = React.useState(0);

  const stepDown = (img: HTMLImageElement) => {
    // The missing-thumbnail placeholder is 120×90; a real frame never is.
    // The optimizer never upscales, so the placeholder keeps its tiny
    // natural size and stays detectable through /_next/image.
    if (quality < QUALITIES.length - 1 && img.naturalWidth <= 120) {
      setQuality((q) => q + 1);
    }
  };

  return (
    <Image
      src={`https://i.ytimg.com/vi/${videoId}/${QUALITIES[quality]}.jpg`}
      alt=""
      fill
      priority
      // The faceplate tracks the max-w-4xl content column: full-bleed minus
      // padding on phones, capped on desktop. Keeps phones on the ~640w
      // rendition instead of the full 1280.
      sizes="(max-width: 896px) calc(100vw - 32px), 846px"
      onLoad={(e) => stepDown(e.currentTarget)}
      onError={() => setQuality((q) => Math.min(q + 1, QUALITIES.length - 1))}
      className="z-[1] object-cover"
    />
  );
}

/** The big orange start control, shared by the facade and the ready overlay. */
function StartButton({
  onClick,
  label,
  onWarm,
  pending = false,
}: {
  onClick: () => void;
  label: string;
  /** Fired on hover/focus — a head start on DNS + TLS before the click. */
  onWarm?: () => void;
  /**
   * The start is in flight: same button, same spot, but its glyph becomes a
   * spinner. Swapping the icon in place — rather than swapping overlays —
   * is what keeps the click-to-playing stretch visually still.
   */
  pending?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={pending ? undefined : onClick}
      onPointerEnter={onWarm}
      onFocus={onWarm}
      aria-label={pending ? "Starting playback" : label}
      aria-disabled={pending}
      className={cn(
        "group grid h-20 w-20 place-items-center rounded-full",
        "bg-accent text-accent-contrast",
        "shadow-[0_10px_40px_-8px_rgba(224,86,31,0.6)]",
        "transition-transform duration-hover ease-emphasized",
        !pending && "hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-black",
      )}
    >
      {pending ? (
        <Loader2 className="h-8 w-8 animate-spin motion-reduce:animate-none" />
      ) : (
        <Play className="h-8 w-8 translate-x-0.5 fill-current" />
      )}
    </button>
  );
}

/**
 * Preconnect to the hosts the YouTube player will hit the moment activation
 * happens. Safe to call repeatedly; injects each link once.
 */
function warmYouTubeConnections() {
  // Media segments come from per-session *.googlevideo.com subdomains, so
  // preconnecting that host is pointless; these two are the fixed ones the
  // IFrame API hits first.
  for (const origin of ["https://www.youtube.com", "https://www.google.com"]) {
    const id = `preconnect-${origin.replace(/\W/g, "")}`;
    if (document.getElementById(id)) continue;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "preconnect";
    link.href = origin;
    document.head.appendChild(link);
  }
}

function Overlay({
  children,
  interactive,
  light,
}: {
  children: React.ReactNode;
  interactive?: boolean;
  /**
   * A lighter scrim, for when there is something worth seeing underneath.
   * Over a video frame the heavy scrim gives the text contrast; over the audio
   * waveform it erases the only thing the panel has to show.
   */
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        // z-[2]: overlays must beat the facade poster (z-[1]), which itself
        // sits above the booting iframe. Without this the poster paints over
        // the start button.
        "absolute inset-0 z-[2] flex flex-col items-center justify-center px-5 text-center",
        light
          ? "bg-black/35"
          : "bg-gradient-to-b from-black/70 via-black/80 to-black/90 backdrop-blur-sm",
        interactive ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {children}
    </div>
  );
}

/** The "Open on YouTube" fallback — only shown for real YouTube ids. */
function YouTubeFallbackLink() {
  const videoId = usePlayerStore((s) => s.videoId);
  const isYouTube = videoId != null && /^[A-Za-z0-9_-]{11}$/.test(videoId);
  if (!isYouTube) return null;
  return (
    <a
      href={`https://www.youtube.com/watch?v=${videoId}`}
      target="_blank"
      rel="noreferrer noopener"
      className="px-1 text-small-body font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      Open on YouTube →
    </a>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 rounded border border-border-strong bg-elevated px-1.5 py-0.5 font-mono text-[0.7rem] text-primary">
      {children}
    </kbd>
  );
}
