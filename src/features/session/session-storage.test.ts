import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSession,
  hasRestorableSession,
  loadSession,
  saveSession,
  type PracticeSession,
} from "./session-storage";

const ID = "dQw4w9WgXcQ";

function makeSession(
  overrides: Partial<PracticeSession> = {},
): PracticeSession {
  return {
    videoId: ID,
    markerA: 12,
    markerB: 20,
    loopEnabled: true,
    requestedSpeed: 0.75,
    appliedSpeed: 0.75,
    volume: 80,
    muted: false,
    nudgePrecision: 0.1,
    timelineMode: "full",
    updatedAt: 1_700_000_000_000,
    ...overrides,
  };
}

describe("session storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips a saved session", () => {
    const session = makeSession();
    saveSession(session);
    expect(loadSession(ID)).toEqual(session);
  });

  it("returns null for an unknown video", () => {
    expect(loadSession(ID)).toBeNull();
  });

  it("returns null for an invalid video id", () => {
    expect(loadSession("bad")).toBeNull();
  });

  it("ignores corrupt payloads", () => {
    localStorage.setItem(`looper:session:${ID}`, "{not json");
    expect(loadSession(ID)).toBeNull();
  });

  it("ignores payloads failing schema validation", () => {
    localStorage.setItem(
      `looper:session:${ID}`,
      JSON.stringify({ version: 1, videoId: ID, requestedSpeed: 99 }),
    );
    expect(loadSession(ID)).toBeNull();
  });

  it("clears a session", () => {
    saveSession(makeSession());
    clearSession(ID);
    expect(loadSession(ID)).toBeNull();
  });

  describe("hasRestorableSession", () => {
    it("is true when markers or non-default speed exist", () => {
      saveSession(makeSession());
      expect(hasRestorableSession(ID)).toBe(true);
    });

    it("is false for a pristine session", () => {
      saveSession(
        makeSession({ markerA: null, markerB: null, requestedSpeed: 1 }),
      );
      expect(hasRestorableSession(ID)).toBe(false);
    });

    it("is false when nothing is stored", () => {
      expect(hasRestorableSession(ID)).toBe(false);
    });
  });
});
