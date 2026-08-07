/**
 * Source-independent player contract.
 *
 * The presentational controls and the loop engine talk only to this interface,
 * never to a concrete provider. Today the only implementation is
 * `YouTubePlayerAdapter`; an Instagram/Vimeo/local-file adapter can be added
 * later without changing any UI.
 */

export type PlayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "buffering"
  | "ended"
  | "error";

export type PlayerErrorKind =
  | "invalid-video"
  | "not-embeddable"
  | "not-found"
  | "html5-error"
  | "network"
  | "unknown";

export interface PlayerError {
  kind: PlayerErrorKind;
  message: string;
}

/** Events the adapter emits to its host (the store/hook layer). */
export interface PlayerAdapterEvents {
  onStatusChange?: (status: PlayerStatus) => void;
  onReady?: () => void;
  onDurationChange?: (duration: number) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onError?: (error: PlayerError) => void;
}

export interface PlayerAdapter {
  load(videoId: string, startSeconds?: number): Promise<void>;
  play(): void;
  pause(): void;
  seekTo(seconds: number): void;

  getCurrentTime(): number;
  getDuration(): number;
  getPlaybackRate(): number;
  getAvailablePlaybackRates(): number[];

  setPlaybackRate(rate: number): void;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unmute(): void;
  isMuted(): boolean;

  isReady(): boolean;
  getStatus(): PlayerStatus;
  destroy(): void;

  /**
   * Human-readable title of the loaded media, when the provider knows one
   * (YouTube's video title, a local file's name). Optional: consumers must
   * tolerate absence — used to label saved loops, never for playback.
   */
  getMediaTitle?(): string | null;
}
