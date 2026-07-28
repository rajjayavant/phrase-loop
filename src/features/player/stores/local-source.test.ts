import { describe, expect, it } from "vitest";
import { isMediaFile } from "./local-source";

function fakeFile(name: string, type: string): File {
  return new File([new Uint8Array([0])], name, { type });
}

describe("isMediaFile", () => {
  it("accepts video MIME types", () => {
    expect(isMediaFile(fakeFile("reel.mp4", "video/mp4"))).toBe(true);
    expect(isMediaFile(fakeFile("clip.webm", "video/webm"))).toBe(true);
  });

  it("accepts audio MIME types", () => {
    expect(isMediaFile(fakeFile("take.mp3", "audio/mpeg"))).toBe(true);
    expect(isMediaFile(fakeFile("take.wav", "audio/wav"))).toBe(true);
  });

  it("falls back to the extension when the MIME type is missing", () => {
    expect(isMediaFile(fakeFile("reel.mov", ""))).toBe(true);
    expect(isMediaFile(fakeFile("loop.m4a", ""))).toBe(true);
    expect(isMediaFile(fakeFile("song.flac", ""))).toBe(true);
  });

  it("rejects non-media files", () => {
    expect(isMediaFile(fakeFile("notes.txt", "text/plain"))).toBe(false);
    expect(isMediaFile(fakeFile("sheet.pdf", "application/pdf"))).toBe(false);
    expect(isMediaFile(fakeFile("image.png", "image/png"))).toBe(false);
  });
});
