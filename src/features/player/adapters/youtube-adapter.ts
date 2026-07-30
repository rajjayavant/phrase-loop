/**
 * YouTubePlayerAdapter — the only concrete `PlayerAdapter` today.
 *
 * All YouTube-specific concerns (the `YT.Player` object, its numeric state
 * codes, and error codes) live here and nowhere else. The store and UI see
 * only the neutral `PlayerAdapter` surface.
 */

import type {
  PlayerAdapter,
  PlayerAdapterEvents,
  PlayerError,
  PlayerErrorKind,
  PlayerStatus,
} from "../types/player-adapter";
import { loadYouTubeApi } from "./youtube-api-loader";

function mapPlayerState(state: number): PlayerStatus {
  switch (state) {
    case YT.PlayerState.PLAYING:
      return "playing";
    case YT.PlayerState.PAUSED:
      return "paused";
    case YT.PlayerState.BUFFERING:
      return "buffering";
    case YT.PlayerState.ENDED:
      return "ended";
    case YT.PlayerState.CUED:
    case YT.PlayerState.UNSTARTED:
      return "ready";
    default:
      return "idle";
  }
}

/**
 * Map a YouTube IFrame API error code to our own taxonomy.
 *
 * Note on 101/150 — measured, not documented. YouTube's docs describe these
 * as "the owner does not allow embedded playback", but the player emits them
 * for a *well-formed but unresolvable* video id too (both `aaaaaaaaaaa` and a
 * random 11-char id return 150). It also emits them for region blocks and age
 * gates. So the code alone cannot tell us which it is, and asserting "the
 * owner disabled embedding" is often simply false — which reads as a bug to
 * anyone who can open the same video on YouTube in another tab.
 *
 * We therefore keep the distinct kind (callers may still want it) but word the
 * message honestly: the video can't be played *here*, with the likely reasons
 * listed and an escape hatch. See the "Open on YouTube" link in PlayerSurface.
 */
function mapErrorCode(code: number): PlayerError {
  const kind: PlayerErrorKind = (() => {
    switch (code) {
      case 2:
        return "invalid-video"; // invalid parameter (bad id)
      case 5:
        return "html5-error";
      case 100:
        return "not-found"; // removed / private
      case 101:
      case 150:
        return "not-embeddable"; // see the note above — NOT necessarily the owner
      default:
        return "unknown";
    }
  })();

  const message: Record<PlayerErrorKind, string> = {
    "invalid-video": "This video ID is invalid or malformed.",
    "not-embeddable":
      "YouTube won't play this one outside its own site. That usually means the video is age-restricted, blocked in your region, or the owner turned off embedding — it can also happen if the link is slightly off.",
    "not-found": "This video is unavailable, private, or has been removed.",
    "html5-error": "The video could not be played due to a playback error.",
    network: "A network error interrupted playback.",
    unknown: "The video could not be loaded.",
  };

  return { kind, message: message[kind] };
}

export class YouTubePlayerAdapter implements PlayerAdapter {
  private player: YT.Player | null = null;
  private ready = false;
  private status: PlayerStatus = "idle";
  private duration = 0;
  private destroyed = false;
  private readonly container: HTMLElement;
  private readonly events: PlayerAdapterEvents;

  constructor(container: HTMLElement, events: PlayerAdapterEvents = {}) {
    this.container = container;
    this.events = events;
  }

  private setStatus(status: PlayerStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.events.onStatusChange?.(status);
  }

  async load(videoId: string, startSeconds?: number): Promise<void> {
    if (this.destroyed) return;
    this.setStatus("loading");

    const YTApi = await loadYouTubeApi();
    if (this.destroyed) return;

    // Recreate the player if it already exists (e.g. loading a new video).
    if (this.player) {
      this.player.loadVideoById({ videoId, startSeconds });
      return;
    }

    // The YT.Player replaces the mount element with an <iframe>, so mount into
    // a child node we control to keep our container stable.
    const mount = document.createElement("div");
    this.container.appendChild(mount);

    await new Promise<void>((resolve) => {
      this.player = new YTApi.Player(mount, {
        videoId,
        playerVars: {
          // Keep native branding + controls visible and compliant.
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin,
          start: startSeconds ? Math.floor(startSeconds) : undefined,
          // Do NOT autoplay — playback starts on a user gesture.
          autoplay: 0,
        },
        events: {
          onReady: () => {
            if (this.destroyed) return;
            this.ready = true;
            this.duration = this.player?.getDuration() ?? 0;
            this.setStatus("ready");
            this.events.onReady?.();
            if (this.duration > 0) {
              this.events.onDurationChange?.(this.duration);
            }
            resolve();
          },
          onStateChange: (event) => {
            if (this.destroyed) return;
            const status = mapPlayerState(event.data);
            this.setStatus(status);
            // Duration becomes reliable once playback has begun.
            const nextDuration = this.player?.getDuration() ?? 0;
            if (nextDuration > 0 && nextDuration !== this.duration) {
              this.duration = nextDuration;
              this.events.onDurationChange?.(nextDuration);
            }
          },
          onPlaybackRateChange: (event) => {
            if (this.destroyed) return;
            this.events.onPlaybackRateChange?.(event.data);
          },
          onError: (event) => {
            if (this.destroyed) return;
            this.setStatus("error");
            this.events.onError?.(mapErrorCode(event.data));
            resolve();
          },
        },
      });
    });
  }

  play(): void {
    this.player?.playVideo();
  }

  pause(): void {
    this.player?.pauseVideo();
  }

  seekTo(seconds: number): void {
    // allowSeekAhead=true lets YouTube request unbuffered segments.
    this.player?.seekTo(Math.max(0, seconds), true);
  }

  getCurrentTime(): number {
    return this.player?.getCurrentTime() ?? 0;
  }

  getDuration(): number {
    const live = this.player?.getDuration() ?? 0;
    return live > 0 ? live : this.duration;
  }

  getPlaybackRate(): number {
    return this.player?.getPlaybackRate() ?? 1;
  }

  getAvailablePlaybackRates(): number[] {
    return this.player?.getAvailablePlaybackRates() ?? [1];
  }

  setPlaybackRate(rate: number): void {
    this.player?.setPlaybackRate(rate);
  }

  setVolume(volume: number): void {
    this.player?.setVolume(Math.max(0, Math.min(100, volume)));
  }

  getVolume(): number {
    return this.player?.getVolume() ?? 100;
  }

  mute(): void {
    this.player?.mute();
  }

  unmute(): void {
    this.player?.unMute();
  }

  isMuted(): boolean {
    return this.player?.isMuted() ?? false;
  }

  isReady(): boolean {
    return this.ready && !this.destroyed;
  }

  getStatus(): PlayerStatus {
    return this.status;
  }

  destroy(): void {
    this.destroyed = true;
    this.ready = false;
    try {
      this.player?.destroy();
    } catch {
      // The iframe may already be detached during a fast route change.
    }
    this.player = null;
  }
}
