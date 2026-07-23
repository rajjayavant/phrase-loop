import { describe, expect, it } from "vitest";
import {
  parsePracticeParams,
  serializePracticeParams,
} from "./practice-params";

const ID = "dQw4w9WgXcQ";

describe("parsePracticeParams", () => {
  it("parses a full valid query", () => {
    const result = parsePracticeParams({
      v: ID,
      a: "43.12",
      b: "49.87",
      speed: "0.75",
      loop: "1",
    });
    expect(result.videoId).toBe(ID);
    expect(result.a).toBeCloseTo(43.12);
    expect(result.b).toBeCloseTo(49.87);
    expect(result.speed).toBe(0.75);
    expect(result.loop).toBe(true);
  });

  it("falls back safely on invalid values", () => {
    const result = parsePracticeParams({
      v: "bad-id",
      a: "not-a-number",
      b: "-5",
      speed: "99",
      loop: "maybe",
    });
    expect(result.videoId).toBeNull();
    expect(result.a).toBeNull();
    expect(result.b).toBeNull();
    expect(result.speed).toBeNull();
    expect(result.loop).toBe(false);
  });

  it("drops incoherent marker pairs (b <= a)", () => {
    const result = parsePracticeParams({ v: ID, a: "50", b: "20" });
    expect(result.a).toBeNull();
    expect(result.b).toBeNull();
  });

  it("handles array-valued params", () => {
    const result = parsePracticeParams({ v: [ID, "other"] });
    expect(result.videoId).toBe(ID);
  });

  it("handles missing params", () => {
    const result = parsePracticeParams({});
    expect(result.videoId).toBeNull();
    expect(result.speed).toBeNull();
    expect(result.loop).toBeNull();
  });
});

describe("serializePracticeParams", () => {
  it("round-trips through parse", () => {
    const params = serializePracticeParams({
      videoId: ID,
      a: 43.12,
      b: 49.87,
      speed: 0.75,
      loop: true,
    });
    const parsed = parsePracticeParams(Object.fromEntries(params));
    expect(parsed.videoId).toBe(ID);
    expect(parsed.a).toBeCloseTo(43.12);
    expect(parsed.b).toBeCloseTo(49.87);
    expect(parsed.speed).toBe(0.75);
    expect(parsed.loop).toBe(true);
  });

  it("omits default speed and disabled loop", () => {
    const params = serializePracticeParams({
      videoId: ID,
      a: null,
      b: null,
      speed: 1,
      loop: false,
    });
    expect(params.has("speed")).toBe(false);
    expect(params.has("loop")).toBe(false);
    expect(params.has("a")).toBe(false);
    expect(params.get("v")).toBe(ID);
  });
});
