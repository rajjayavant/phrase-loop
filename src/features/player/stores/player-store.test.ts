import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePlayerStore } from "./player-store";
import type { PlayerAdapter } from "../types/player-adapter";

vi.mock("@/features/session/announcer", () => ({
  announce: vi.fn(),
}));

function makeFakeAdapter(
  overrides: Partial<PlayerAdapter> = {},
): PlayerAdapter {
  let time = 0;
  return {
    load: vi.fn(async () => {}),
    play: vi.fn(),
    pause: vi.fn(),
    seekTo: vi.fn((s: number) => {
      time = s;
    }),
    getCurrentTime: vi.fn(() => time),
    getDuration: vi.fn(() => 180),
    getPlaybackRate: vi.fn(() => 1),
    getAvailablePlaybackRates: vi.fn(() => [0.25, 0.5, 0.75, 1, 1.5, 2]),
    setPlaybackRate: vi.fn(),
    setVolume: vi.fn(),
    getVolume: vi.fn(() => 100),
    mute: vi.fn(),
    unmute: vi.fn(),
    isMuted: vi.fn(() => false),
    isReady: vi.fn(() => true),
    getStatus: vi.fn((): "ready" => "ready"),
    destroy: vi.fn(),
    ...overrides,
  };
}

function reset() {
  const s = usePlayerStore.getState();
  s.detachAdapter();
  s.clearLoop();
  s.resetSpeed();
  usePlayerStore.setState({ duration: 0, error: null, status: "idle" });
}

describe("player store", () => {
  beforeEach(reset);

  it("sets markers at the playhead", () => {
    const adapter = makeFakeAdapter();
    adapter.seekTo(30);
    usePlayerStore.getState().attachAdapter(adapter, "dQw4w9WgXcQ");
    usePlayerStore.getState().setDuration(180);

    usePlayerStore.getState().setMarkerA();
    expect(usePlayerStore.getState().loop.markerA).toBe(30);

    adapter.seekTo(45);
    usePlayerStore.getState().setMarkerB();
    expect(usePlayerStore.getState().loop.markerB).toBe(45);
  });

  it("enables and wraps the loop on tick", () => {
    const adapter = makeFakeAdapter();
    usePlayerStore.getState().attachAdapter(adapter, "dQw4w9WgXcQ");
    usePlayerStore.getState().setDuration(180);
    usePlayerStore.getState().hydrate({
      markerA: 10,
      markerB: 20,
      loopEnabled: true,
    });

    // Reaching B wraps to A and counts an iteration.
    usePlayerStore.getState().onTick(19.99);
    expect(adapter.seekTo).toHaveBeenLastCalledWith(10);
    expect(usePlayerStore.getState().loop.iterationCount).toBe(1);
  });

  it("requests speed through the adapter", () => {
    const adapter = makeFakeAdapter();
    usePlayerStore.getState().attachAdapter(adapter, "dQw4w9WgXcQ");
    usePlayerStore.getState().requestSpeed(0.75);
    expect(adapter.setPlaybackRate).toHaveBeenCalledWith(0.75);
    expect(usePlayerStore.getState().speed.requestedRate).toBe(0.75);
    expect(usePlayerStore.getState().speed.status).toBe("applying");
  });

  it("reconciles applied speed and detects adjustment", () => {
    const adapter = makeFakeAdapter();
    usePlayerStore.getState().attachAdapter(adapter, "dQw4w9WgXcQ");
    usePlayerStore.getState().requestSpeed(0.34);
    usePlayerStore.getState().onAppliedRate(0.35);
    expect(usePlayerStore.getState().speed.status).toBe("adjusted");
    expect(usePlayerStore.getState().speed.appliedRate).toBe(0.35);
  });

  it("does not wrap when loop is disabled", () => {
    const adapter = makeFakeAdapter();
    usePlayerStore.getState().attachAdapter(adapter, "dQw4w9WgXcQ");
    usePlayerStore.getState().setDuration(180);
    usePlayerStore
      .getState()
      .hydrate({ markerA: 10, markerB: 20, loopEnabled: false });
    (adapter.seekTo as ReturnType<typeof vi.fn>).mockClear();
    usePlayerStore.getState().onTick(25);
    expect(adapter.seekTo).not.toHaveBeenCalled();
  });

  it("toggles mute through the adapter", () => {
    const adapter = makeFakeAdapter();
    usePlayerStore.getState().attachAdapter(adapter, "dQw4w9WgXcQ");
    usePlayerStore.getState().toggleMute();
    expect(adapter.mute).toHaveBeenCalled();
    expect(usePlayerStore.getState().muted).toBe(true);
    usePlayerStore.getState().toggleMute();
    expect(adapter.unmute).toHaveBeenCalled();
    expect(usePlayerStore.getState().muted).toBe(false);
  });
});
