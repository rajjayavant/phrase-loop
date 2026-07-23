/**
 * MockPlayerAdapter — a deterministic, dependency-free `PlayerAdapter` for
 * Playwright and unit tests, where real YouTube playback is unreliable.
 *
 * It advances a virtual clock with `requestAnimationFrame`-free timers so the
 * loop engine, timeline, and controls can be exercised without a network.
 * Enable it in the practice route via `?mock=1`.
 */

import type {
  PlayerAdapter,
  PlayerAdapterEvents,
  PlayerStatus,
} from "../types/player-adapter";

const MOCK_DURATION = 180; // 3 minutes
const MOCK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export class MockPlayerAdapter implements PlayerAdapter {
  private currentTime = 0;
  private duration = MOCK_DURATION;
  private rate = 1;
  private volume = 100;
  private muted = false;
  private ready = false;
  private status: PlayerStatus = "idle";
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastTick = 0;
  private readonly events: PlayerAdapterEvents;
  private readonly container: HTMLElement;

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
    this.setStatus("loading");
    this.currentTime = startSeconds ?? 0;

    // Render a placeholder so the region is never blank in tests.
    const placeholder = document.createElement("div");
    placeholder.dataset.mockPlayer = videoId;
    placeholder.style.cssText =
      "width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#14171c;color:#7d8592;font:600 14px sans-serif;";
    placeholder.textContent = `Mock player · ${videoId}`;
    this.container.appendChild(placeholder);

    await Promise.resolve();
    this.ready = true;
    this.setStatus("ready");
    this.events.onReady?.();
    this.events.onDurationChange?.(this.duration);
  }

  private startTicking(): void {
    if (this.timer) return;
    this.lastTick = Date.now();
    this.timer = setInterval(() => {
      const now = Date.now();
      const delta = ((now - this.lastTick) / 1000) * this.rate;
      this.lastTick = now;
      this.currentTime = Math.min(this.currentTime + delta, this.duration);
      if (this.currentTime >= this.duration) {
        this.pause();
        this.setStatus("ended");
      }
    }, 100);
  }

  private stopTicking(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  play(): void {
    if (!this.ready) return;
    this.startTicking();
    this.setStatus("playing");
  }

  pause(): void {
    this.stopTicking();
    this.setStatus("paused");
  }

  seekTo(seconds: number): void {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
  }

  getCurrentTime(): number {
    return this.currentTime;
  }
  getDuration(): number {
    return this.duration;
  }
  getPlaybackRate(): number {
    return this.rate;
  }
  getAvailablePlaybackRates(): number[] {
    return [...MOCK_RATES];
  }
  setPlaybackRate(rate: number): void {
    // Snap to the nearest supported rate to emulate YouTube's quantization.
    const nearest = MOCK_RATES.reduce((prev, curr) =>
      Math.abs(curr - rate) < Math.abs(prev - rate) ? curr : prev,
    );
    this.rate = nearest;
    this.events.onPlaybackRateChange?.(nearest);
  }
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(100, volume));
  }
  getVolume(): number {
    return this.volume;
  }
  mute(): void {
    this.muted = true;
  }
  unmute(): void {
    this.muted = false;
  }
  isMuted(): boolean {
    return this.muted;
  }
  isReady(): boolean {
    return this.ready;
  }
  getStatus(): PlayerStatus {
    return this.status;
  }
  destroy(): void {
    this.stopTicking();
    this.ready = false;
    this.container.replaceChildren();
  }
}
