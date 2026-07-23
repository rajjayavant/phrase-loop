import { describe, expect, it } from "vitest";
import {
  formatRate,
  getSpeedStatusMessage,
  initialSpeedState,
  nudgeRate,
  reconcileAppliedRate,
  requestRate,
  resetRate,
  setAvailableRates,
} from "./speed-state";

describe("requestRate", () => {
  it("normalizes and clamps the requested rate", () => {
    expect(requestRate(initialSpeedState, 0.756).requestedRate).toBe(0.76);
    expect(requestRate(initialSpeedState, 5).requestedRate).toBe(2);
    expect(requestRate(initialSpeedState, 0.1).requestedRate).toBe(0.25);
  });

  it("moves status to applying", () => {
    expect(requestRate(initialSpeedState, 0.75).status).toBe("applying");
  });
});

describe("reconcileAppliedRate", () => {
  it("marks applied when the player matches", () => {
    const requested = requestRate(initialSpeedState, 0.75);
    const next = reconcileAppliedRate(requested, 0.75);
    expect(next.status).toBe("applied");
    expect(next.appliedRate).toBe(0.75);
  });

  it("marks adjusted when the player diverges", () => {
    const requested = requestRate(initialSpeedState, 0.34);
    const next = reconcileAppliedRate(requested, 0.35);
    expect(next.status).toBe("adjusted");
    expect(next.appliedRate).toBe(0.35);
  });
});

describe("setAvailableRates", () => {
  it("dedupes and sorts", () => {
    const next = setAvailableRates(initialSpeedState, [1, 0.5, 1, 2, 0.5]);
    expect(next.availableRates).toEqual([0.5, 1, 2]);
  });

  it("marks unsupported when only [1] is available", () => {
    expect(setAvailableRates(initialSpeedState, [1]).status).toBe(
      "unsupported",
    );
  });

  it("does not mark unsupported when a range exists", () => {
    const next = setAvailableRates(
      requestRate(initialSpeedState, 0.75),
      [0.25, 0.5, 1, 2],
    );
    expect(next.status).toBe("applying");
  });
});

describe("nudge / reset", () => {
  it("nudges by delta", () => {
    const next = nudgeRate(requestRate(initialSpeedState, 1), -0.05);
    expect(next.requestedRate).toBe(0.95);
  });

  it("resets to 1", () => {
    const next = resetRate(requestRate(initialSpeedState, 0.5));
    expect(next.requestedRate).toBe(1);
  });
});

describe("status message", () => {
  it("describes an adjustment", () => {
    const requested = requestRate(initialSpeedState, 0.34);
    const adjusted = reconcileAppliedRate(requested, 0.35);
    expect(getSpeedStatusMessage(adjusted)).toContain("0.35×");
    expect(getSpeedStatusMessage(adjusted)).toContain("0.34×");
  });

  it("describes unsupported", () => {
    const next = setAvailableRates(initialSpeedState, [1]);
    expect(getSpeedStatusMessage(next)).toMatch(/does not support/i);
  });

  it("returns null when nothing to report", () => {
    expect(getSpeedStatusMessage(initialSpeedState)).toBeNull();
  });
});

describe("formatRate", () => {
  it("trims trailing zeros", () => {
    expect(formatRate(1)).toBe("1×");
    expect(formatRate(0.5)).toBe("0.5×");
    expect(formatRate(0.75)).toBe("0.75×");
  });
});
