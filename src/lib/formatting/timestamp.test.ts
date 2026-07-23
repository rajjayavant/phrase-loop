import { describe, expect, it } from "vitest";
import { formatClock, formatTimestamp, parseTimestamp } from "./timestamp";

describe("formatTimestamp", () => {
  it("formats sub-hour durations as MM:SS.mmm", () => {
    expect(formatTimestamp(49.87)).toBe("00:49.870");
    expect(formatTimestamp(83.5)).toBe("01:23.500");
    expect(formatTimestamp(0)).toBe("00:00.000");
  });

  it("formats hour+ durations as HH:MM:SS.mmm", () => {
    expect(formatTimestamp(3723.25)).toBe("01:02:03.250");
  });

  it("respects forceHours", () => {
    expect(formatTimestamp(5, { forceHours: true })).toBe("00:00:05.000");
  });

  it("omits milliseconds when requested", () => {
    expect(formatTimestamp(83.5, { showMilliseconds: false })).toBe("01:23");
  });

  it("treats negative and non-finite input as zero", () => {
    expect(formatTimestamp(-5)).toBe("00:00.000");
    expect(formatTimestamp(Number.NaN)).toBe("00:00.000");
    expect(formatTimestamp(Number.POSITIVE_INFINITY)).toBe("00:00.000");
  });

  it("carries millisecond rounding into seconds consistently", () => {
    // Rounds up cleanly rather than producing a desynced ".1000".
    expect(formatTimestamp(0.9999)).toBe("00:01.000");
    expect(formatTimestamp(59.9995)).toBe("01:00.000");
    expect(formatTimestamp(0.4994)).toBe("00:00.499");
  });
});

describe("formatClock", () => {
  it("drops milliseconds", () => {
    expect(formatClock(83.5)).toBe("01:23");
    expect(formatClock(3723)).toBe("01:02:03");
  });
});

describe("parseTimestamp", () => {
  it("parses plain seconds", () => {
    expect(parseTimestamp("49.87")).toBeCloseTo(49.87, 5);
    expect(parseTimestamp("5")).toBe(5);
  });

  it("parses MM:SS(.mmm)", () => {
    expect(parseTimestamp("1:23.500")).toBe(83.5);
    expect(parseTimestamp("00:49.870")).toBeCloseTo(49.87, 5);
  });

  it("parses HH:MM:SS(.mmm)", () => {
    expect(parseTimestamp("01:02:03.250")).toBeCloseTo(3723.25, 5);
  });

  it("right-pads partial millisecond digits", () => {
    expect(parseTimestamp("0:01.5")).toBe(1.5);
    expect(parseTimestamp("0:01.05")).toBe(1.05);
    expect(parseTimestamp("0:01.005")).toBe(1.005);
  });

  it("round-trips with formatTimestamp", () => {
    const value = 3723.25;
    const formatted = formatTimestamp(value);
    expect(parseTimestamp(formatted)).toBeCloseTo(value, 3);
  });

  it("rejects out-of-range colon fields", () => {
    expect(parseTimestamp("1:75")).toBeNull();
    expect(parseTimestamp("1:99:00")).toBeNull();
  });

  it("rejects garbage", () => {
    expect(parseTimestamp("")).toBeNull();
    expect(parseTimestamp("abc")).toBeNull();
    expect(parseTimestamp("1:2:3:4")).toBeNull();
  });

  it("trims whitespace", () => {
    expect(parseTimestamp("  1:23.500  ")).toBe(83.5);
  });
});
