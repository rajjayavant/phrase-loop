import { describe, expect, it } from "vitest";
import {
  clearLoop,
  clearMarkerA,
  clearMarkerB,
  evaluateLoopTick,
  getLoopStatus,
  getLoopValidity,
  initialLoopState,
  isLoopReady,
  moveMarker,
  setLoopEnabled,
  setMarkerA,
  setMarkerB,
  toggleLoop,
  type LoopState,
} from "./loop-state";

const DURATION = 120;

function withMarkers(a: number | null, b: number | null): LoopState {
  return { ...initialLoopState, markerA: a, markerB: b };
}

describe("validity + status", () => {
  it("reports empty / incomplete / valid", () => {
    expect(getLoopValidity(initialLoopState)).toBe("empty");
    expect(getLoopValidity(withMarkers(10, null))).toBe("incomplete");
    expect(getLoopValidity(withMarkers(10, 20))).toBe("valid");
  });

  it("flags too-short regions", () => {
    expect(getLoopValidity(withMarkers(10, 10.1))).toBe("too-short");
    expect(isLoopReady(withMarkers(10, 10.1))).toBe(false);
  });

  it("computes human status", () => {
    expect(getLoopStatus(initialLoopState)).toBe("empty");
    expect(getLoopStatus(withMarkers(10, null))).toBe("incomplete");
    expect(getLoopStatus(withMarkers(10, 20))).toBe("ready");
    expect(getLoopStatus({ ...withMarkers(10, 20), enabled: true })).toBe(
      "active",
    );
  });
});

describe("setMarkerA / setMarkerB corrective behavior", () => {
  it("sets A within duration", () => {
    const next = setMarkerA(initialLoopState, 30, DURATION);
    expect(next.markerA).toBe(30);
  });

  it("clamps markers to duration bounds", () => {
    expect(setMarkerA(initialLoopState, -5, DURATION).markerA).toBe(0);
    expect(setMarkerB(initialLoopState, 999, DURATION).markerB).toBe(DURATION);
  });

  it("clears B when A is set after B", () => {
    const state = withMarkers(null, 20);
    const next = setMarkerA(state, 40, DURATION);
    expect(next.markerA).toBe(40);
    expect(next.markerB).toBeNull();
    expect(next.enabled).toBe(false);
  });

  it("clears A when B is set before A", () => {
    const state = withMarkers(40, null);
    const next = setMarkerB(state, 20, DURATION);
    expect(next.markerB).toBe(20);
    expect(next.markerA).toBeNull();
  });

  it("keeps both markers when ordering is valid", () => {
    let state = setMarkerA(initialLoopState, 10, DURATION);
    state = setMarkerB(state, 25, DURATION);
    expect(state.markerA).toBe(10);
    expect(state.markerB).toBe(25);
    expect(isLoopReady(state)).toBe(true);
  });
});

describe("moveMarker", () => {
  it("prevents A from crossing B", () => {
    const state = withMarkers(10, 20);
    const next = moveMarker(state, "A", 50, DURATION);
    expect(next.markerA).toBeLessThan(20);
    expect(next.markerB).toBe(20);
  });

  it("prevents B from crossing A", () => {
    const state = withMarkers(10, 20);
    const next = moveMarker(state, "B", 5, DURATION);
    expect(next.markerB).toBeGreaterThan(10);
    expect(next.markerA).toBe(10);
  });

  it("clamps to duration", () => {
    const state = withMarkers(10, 20);
    expect(moveMarker(state, "B", 999, DURATION).markerB).toBe(DURATION);
    expect(moveMarker(state, "A", -5, DURATION).markerA).toBe(0);
  });
});

describe("clearing", () => {
  it("clears individual markers and disables loop", () => {
    const state = { ...withMarkers(10, 20), enabled: true };
    expect(clearMarkerA(state).markerA).toBeNull();
    expect(clearMarkerA(state).enabled).toBe(false);
    expect(clearMarkerB(state).markerB).toBeNull();
  });

  it("clears the whole loop", () => {
    expect(clearLoop()).toEqual(initialLoopState);
  });
});

describe("toggle / enable", () => {
  it("cannot enable an invalid loop", () => {
    expect(toggleLoop(withMarkers(10, null)).enabled).toBe(false);
    expect(setLoopEnabled(withMarkers(10, null), true).enabled).toBe(false);
  });

  it("enables and disables a valid loop", () => {
    const state = withMarkers(10, 20);
    const enabled = toggleLoop(state);
    expect(enabled.enabled).toBe(true);
    expect(toggleLoop(enabled).enabled).toBe(false);
  });
});

describe("evaluateLoopTick", () => {
  const active: LoopState = { ...withMarkers(10, 20), enabled: true };

  it("does nothing when loop disabled", () => {
    const decision = evaluateLoopTick(withMarkers(10, 20), 25);
    expect(decision.shouldWrap).toBe(false);
  });

  it("wraps to A when reaching B (with look-ahead)", () => {
    const decision = evaluateLoopTick(active, 19.98);
    expect(decision.shouldWrap).toBe(true);
    expect(decision.seekTo).toBe(10);
  });

  it("does not wrap mid-region", () => {
    expect(evaluateLoopTick(active, 15).shouldWrap).toBe(false);
  });

  it("allows seeking below A without wrapping", () => {
    expect(evaluateLoopTick(active, 5).shouldWrap).toBe(false);
  });
});
