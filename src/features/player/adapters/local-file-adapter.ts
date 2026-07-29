/**
 * LocalFilePlayerAdapter — plays a media file the user supplies from their own
 * device (a video or audio file, e.g. a reel they downloaded themselves).
 *
 * Because the media is a same-origin element we control, this adapter delivers
 * the FULL practice contract — real `seekTo`, `setPlaybackRate`, loop,
 * duration, volume — identical to YouTube, with frame-accurate seeking.
 *
 * Audio files use an `<audio>` element rather than `<video>`. A `<video>` would
 * play them perfectly well, but it reserves the full faceplate for a permanently
 * black rectangle; using `<audio>` frees that space for the waveform (see
 * `isAudio` and `AudioVisualizer`).
 *
 * All local-file specifics (the object URL, the media element, its events) are
 * confined here; the store and UI see only `PlayerAdapter`.
 */

import type {
  PlayerAdapter,
  PlayerAdapterEvents,
  PlayerStatus,
} from "../types/player-adapter";

// HTMLMediaElement supports arbitrary playback rates; we mirror the app's own
// requested range rather than YouTube's quantized list, so speed is truly free.
const SUPPORTED_RATES = [0.25, 0.5, 0.75, 0.9, 1, 1.25, 1.5, 2];

/**
 * True when the file is audio-only. MIME type is authoritative; the extension
 * is a fallback for files the OS typed as `application/octet-stream` or left
 * blank, which happens often enough on Windows and with AirDropped files.
 */
export function isAudioFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  if (file.type.startsWith("video/")) return false;
  return /\.(mp3|wav|m4a|aac|flac|oga|opus|weba)$/i.test(file.name);
}

export class LocalFilePlayerAdapter implements PlayerAdapter {
  private media: HTMLMediaElement | null = null;
  private objectUrl: string | null = null;
  private ready = false;
  private status: PlayerStatus = "idle";
  private destroyed = false;
  private pendingStart = 0;
  private readonly container: HTMLElement;
  private readonly events: PlayerAdapterEvents;
  private readonly file: File;
  /** Audio-only sources have no picture, so the UI shows a waveform instead. */
  readonly isAudio: boolean;

  constructor(container: HTMLElement, file: File, events: PlayerAdapterEvents = {}) {
    this.container = container;
    this.file = file;
    this.events = events;
    this.isAudio = isAudioFile(file);
  }

  /** The live media element, for a visualizer that needs to read playback. */
  getMediaElement(): HTMLMediaElement | null {
    return this.media;
  }

  private setStatus(status: PlayerStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.events.onStatusChange?.(status);
  }

  async load(_videoId?: string, startSeconds?: number): Promise<void> {
    void _videoId;
    if (this.destroyed) return;
    this.setStatus("loading");
    this.pendingStart = startSeconds ?? 0;

    let media: HTMLMediaElement;
    if (this.isAudio) {
      // An <audio> element still needs to be in the DOM to play, but it has no
      // picture to show — the waveform overlay renders on top of it.
      const audio = document.createElement("audio");
      audio.className = "sr-only";
      media = audio;
    } else {
      const video = document.createElement("video");
      video.playsInline = true;
      video.className = "h-full w-full bg-black object-contain";
      media = video;
    }
    media.preload = "auto";
    media.controls = false;
    // A local file is same-origin (blob:) so this is safe and unlocks control.
    this.objectUrl = URL.createObjectURL(this.file);
    media.src = this.objectUrl;

    media.addEventListener("loadedmetadata", () => {
      if (this.destroyed) return;
      this.ready = true;
      if (this.pendingStart > 0 && Number.isFinite(media.duration)) {
        media.currentTime = Math.min(this.pendingStart, media.duration);
      }
      this.setStatus("ready");
      this.events.onReady?.();
      if (Number.isFinite(media.duration)) {
        this.events.onDurationChange?.(media.duration);
      }
    });
    media.addEventListener("durationchange", () => {
      if (!this.destroyed && Number.isFinite(media.duration)) {
        this.events.onDurationChange?.(media.duration);
      }
    });
    media.addEventListener("play", () => this.setStatus("playing"));
    media.addEventListener("playing", () => this.setStatus("playing"));
    media.addEventListener("pause", () => {
      if (!this.destroyed && !media.ended) this.setStatus("paused");
    });
    media.addEventListener("waiting", () => this.setStatus("buffering"));
    media.addEventListener("ended", () => this.setStatus("ended"));
    media.addEventListener("ratechange", () => {
      if (!this.destroyed) this.events.onPlaybackRateChange?.(media.playbackRate);
    });
    media.addEventListener("error", () => {
      if (this.destroyed) return;
      this.setStatus("error");
      this.events.onError?.({
        kind: "html5-error",
        message:
          "This file couldn't be played. Try a common format such as MP4, WebM, MOV, or MP3.",
      });
    });

    this.container.appendChild(media);
    this.media = media;

    // Kick off loading; readiness is signalled by `loadedmetadata` above.
    try {
      media.load();
    } catch {
      // load() rarely throws; the error event handles real failures.
    }
  }

  play(): void {
    // Playback must follow a user gesture; the promise rejection is non-fatal.
    void this.media?.play().catch(() => undefined);
  }

  pause(): void {
    this.media?.pause();
  }

  seekTo(seconds: number): void {
    if (!this.media) return;
    const duration = this.media.duration;
    const clamped = Number.isFinite(duration)
      ? Math.min(Math.max(0, seconds), duration)
      : Math.max(0, seconds);
    this.media.currentTime = clamped;
  }

  getCurrentTime(): number {
    return this.media?.currentTime ?? 0;
  }

  getDuration(): number {
    const d = this.media?.duration ?? 0;
    return Number.isFinite(d) ? d : 0;
  }

  getPlaybackRate(): number {
    return this.media?.playbackRate ?? 1;
  }

  getAvailablePlaybackRates(): number[] {
    return [...SUPPORTED_RATES];
  }

  setPlaybackRate(rate: number): void {
    if (this.media) this.media.playbackRate = rate;
  }

  setVolume(volume: number): void {
    if (this.media) this.media.volume = Math.max(0, Math.min(1, volume / 100));
  }

  getVolume(): number {
    return this.media ? Math.round(this.media.volume * 100) : 100;
  }

  mute(): void {
    if (this.media) this.media.muted = true;
  }

  unmute(): void {
    if (this.media) this.media.muted = false;
  }

  isMuted(): boolean {
    return this.media?.muted ?? false;
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
    if (this.media) {
      this.media.pause();
      this.media.removeAttribute("src");
      try {
        this.media.load();
      } catch {
        // ignore
      }
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.media = null;
  }
}
