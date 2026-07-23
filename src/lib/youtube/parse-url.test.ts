import { describe, expect, it } from "vitest";
import { isValidVideoId, parseStartTime, parseYouTubeUrl } from "./parse-url";

describe("isValidVideoId", () => {
  it("accepts an 11-char id", () => {
    expect(isValidVideoId("dQw4w9WgXcQ")).toBe(true);
    expect(isValidVideoId("jNQXAC9IVRw")).toBe(true);
    expect(isValidVideoId("_-aB3cD4eF5")).toBe(true);
  });

  it("rejects wrong lengths and bad chars", () => {
    expect(isValidVideoId("short")).toBe(false);
    expect(isValidVideoId("waytoolongvideoid")).toBe(false);
    expect(isValidVideoId("dQw4w9WgXc!")).toBe(false);
    expect(isValidVideoId("")).toBe(false);
  });
});

describe("parseYouTubeUrl", () => {
  const ID = "dQw4w9WgXcQ";

  it("parses watch URLs", () => {
    expect(parseYouTubeUrl(`https://www.youtube.com/watch?v=${ID}`)).toEqual({
      videoId: ID,
    });
  });

  it("parses youtu.be short links", () => {
    expect(parseYouTubeUrl(`https://youtu.be/${ID}`)).toEqual({ videoId: ID });
  });

  it("parses shorts URLs", () => {
    expect(parseYouTubeUrl(`https://www.youtube.com/shorts/${ID}`)).toEqual({
      videoId: ID,
    });
  });

  it("parses embed URLs", () => {
    expect(parseYouTubeUrl(`https://www.youtube.com/embed/${ID}`)).toEqual({
      videoId: ID,
    });
  });

  it("parses /live/ URLs", () => {
    expect(parseYouTubeUrl(`https://www.youtube.com/live/${ID}`)).toEqual({
      videoId: ID,
    });
  });

  it("accepts a bare video id", () => {
    expect(parseYouTubeUrl(ID)).toEqual({ videoId: ID });
  });

  it("handles extra query parameters", () => {
    expect(
      parseYouTubeUrl(
        `https://www.youtube.com/watch?v=${ID}&list=PLxyz&index=3`,
      ),
    ).toEqual({ videoId: ID });
  });

  it("preserves a numeric start time (t=90)", () => {
    expect(
      parseYouTubeUrl(`https://www.youtube.com/watch?v=${ID}&t=90`),
    ).toEqual({ videoId: ID, startTime: 90 });
  });

  it("preserves the 1m30s shorthand", () => {
    expect(parseYouTubeUrl(`https://youtu.be/${ID}?t=1m30s`)).toEqual({
      videoId: ID,
      startTime: 90,
    });
  });

  it("preserves a start on youtu.be with trailing s", () => {
    expect(parseYouTubeUrl(`https://youtu.be/${ID}?t=43s`)).toEqual({
      videoId: ID,
      startTime: 43,
    });
  });

  it("handles scheme-less and mobile hosts", () => {
    expect(parseYouTubeUrl(`youtube.com/watch?v=${ID}`)).toEqual({
      videoId: ID,
    });
    expect(parseYouTubeUrl(`https://m.youtube.com/watch?v=${ID}`)).toEqual({
      videoId: ID,
    });
  });

  it("trims surrounding whitespace", () => {
    expect(parseYouTubeUrl(`  https://youtu.be/${ID}  `)).toEqual({
      videoId: ID,
    });
  });

  it("rejects non-YouTube domains", () => {
    expect(parseYouTubeUrl(`https://vimeo.com/${ID}`)).toBeNull();
    expect(parseYouTubeUrl("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("rejects malformed ids", () => {
    expect(parseYouTubeUrl("https://www.youtube.com/watch?v=short")).toBeNull();
    expect(parseYouTubeUrl("https://youtu.be/short")).toBeNull();
  });

  it("rejects empty and garbage input", () => {
    expect(parseYouTubeUrl("")).toBeNull();
    expect(parseYouTubeUrl("not a url at all")).toBeNull();
  });
});

describe("parseStartTime", () => {
  it("parses plain seconds", () => {
    expect(parseStartTime("90")).toBe(90);
    expect(parseStartTime("90.5")).toBe(90.5);
  });

  it("parses clock form", () => {
    expect(parseStartTime("1:30")).toBe(90);
    expect(parseStartTime("1:02:03")).toBe(3723);
  });

  it("parses shorthand", () => {
    expect(parseStartTime("1h2m3s")).toBe(3723);
    expect(parseStartTime("2m30s")).toBe(150);
    expect(parseStartTime("45s")).toBe(45);
  });

  it("returns null for garbage", () => {
    expect(parseStartTime("abc")).toBeNull();
    expect(parseStartTime("")).toBeNull();
    expect(parseStartTime(null)).toBeNull();
  });
});
