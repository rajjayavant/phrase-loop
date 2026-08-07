import { beforeEach, describe, expect, it } from "vitest";
import {
  listSavedLoops,
  upsertSavedLoop,
  removeSavedLoop,
  youtubeLoopKey,
  localLoopKey,
  MAX_SAVED_LOOPS,
  type SavedLoop,
} from "./saved-loops-storage";

function makeEntry(overrides: Partial<SavedLoop> = {}): SavedLoop {
  return {
    key: youtubeLoopKey("dQw4w9WgXcQ"),
    kind: "youtube",
    id: "dQw4w9WgXcQ",
    title: "Test video",
    markerA: 10,
    markerB: 20,
    speed: 0.75,
    loopEnabled: true,
    duration: 180,
    thumb: null,
    updatedAt: 1000,
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("saved loops index", () => {
  it("starts empty and lists what was upserted, newest first", () => {
    expect(listSavedLoops()).toEqual([]);
    upsertSavedLoop(makeEntry({ key: "yt:a", id: "a" }));
    upsertSavedLoop(makeEntry({ key: "yt:b", id: "b" }));
    expect(listSavedLoops().map((e) => e.key)).toEqual(["yt:b", "yt:a"]);
  });

  it("dedupes by key, keeping only the last configuration", () => {
    upsertSavedLoop(makeEntry({ markerA: 10, markerB: 20, speed: 0.75 }));
    upsertSavedLoop(makeEntry({ markerA: 30, markerB: 45, speed: 0.5 }));
    const entries = listSavedLoops();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.markerA).toBe(30);
    expect(entries[0]?.speed).toBe(0.5);
  });

  it("moves an updated entry back to the front", () => {
    upsertSavedLoop(makeEntry({ key: "yt:a", id: "a" }));
    upsertSavedLoop(makeEntry({ key: "yt:b", id: "b" }));
    upsertSavedLoop(makeEntry({ key: "yt:a", id: "a", speed: 1 }));
    expect(listSavedLoops().map((e) => e.key)).toEqual(["yt:a", "yt:b"]);
  });

  it("keeps a previously-known title and thumb when an update carries null", () => {
    upsertSavedLoop(makeEntry({ title: "Known title", thumb: "data:x" }));
    upsertSavedLoop(makeEntry({ title: null, thumb: null, speed: 1 }));
    const entry = listSavedLoops()[0];
    expect(entry?.title).toBe("Known title");
    expect(entry?.thumb).toBe("data:x");
    expect(entry?.speed).toBe(1);
  });

  it("a re-uploaded local file (new cache id, same fingerprint) stays one entry", () => {
    const file = { name: "solo.mp3", size: 123, lastModified: 456 };
    upsertSavedLoop(
      makeEntry({ key: localLoopKey(file), kind: "local", id: "cache-1" }),
    );
    upsertSavedLoop(
      makeEntry({ key: localLoopKey(file), kind: "local", id: "cache-2" }),
    );
    const entries = listSavedLoops();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.id).toBe("cache-2");
  });

  it("caps the index and drops the oldest", () => {
    for (let i = 0; i < MAX_SAVED_LOOPS + 3; i++) {
      upsertSavedLoop(makeEntry({ key: `yt:v${i}`, id: `v${i}` }));
    }
    const entries = listSavedLoops();
    expect(entries).toHaveLength(MAX_SAVED_LOOPS);
    expect(entries[0]?.key).toBe(`yt:v${MAX_SAVED_LOOPS + 2}`);
    expect(entries.some((e) => e.key === "yt:v0")).toBe(false);
  });

  it("removes by key", () => {
    upsertSavedLoop(makeEntry({ key: "yt:a", id: "a" }));
    upsertSavedLoop(makeEntry({ key: "yt:b", id: "b" }));
    removeSavedLoop("yt:a");
    expect(listSavedLoops().map((e) => e.key)).toEqual(["yt:b"]);
  });

  it("reads corrupt storage as empty instead of throwing", () => {
    window.localStorage.setItem("looper:saved-loops", "{not json");
    expect(listSavedLoops()).toEqual([]);
    window.localStorage.setItem(
      "looper:saved-loops",
      JSON.stringify({ version: 99, entries: [{ bogus: true }] }),
    );
    expect(listSavedLoops()).toEqual([]);
  });
});
