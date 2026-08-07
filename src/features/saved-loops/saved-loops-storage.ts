/**
 * The Saved Loops index (localStorage).
 *
 * One entry per piece of media the user has practiced, newest first, capped.
 * Identity is the `key`:
 *   - YouTube:    `yt:<videoId>` — one entry per video however it was opened.
 *   - Local file: `file:<name>:<size>:<mtime>` — a fingerprint of the file
 *     itself, NOT the cache id. Re-uploading the same file gets a fresh cache
 *     id every time; the fingerprint keeps it one entry whose `id` (and so its
 *     open-URL) always points at the newest cached copy.
 *
 * Only the *last* configuration is kept — an upsert replaces the entry
 * wholesale and moves it to the front. All reads are defensive: corrupt
 * payloads are dropped, never thrown.
 */

import { z } from "zod";
import { MAX_SPEED, MIN_SPEED } from "@/lib/validation/practice-params";

export interface SavedLoop {
  /** Dedupe identity — see module docs. */
  key: string;
  kind: "youtube" | "local";
  /** YouTube video id, or the *current* local cache id (`?src=local:<id>`). */
  id: string;
  /** Media title when known (YouTube title, or the file name). */
  title: string | null;
  markerA: number | null;
  markerB: number | null;
  speed: number;
  loopEnabled: boolean;
  /** Media duration in seconds; 0 when it never became known. */
  duration: number;
  /**
   * Small data-URL poster for local *video* files, captured once when the
   * entry is first recorded. Null for audio (icon tile) and YouTube (CDN
   * thumbnail).
   */
  thumb: string | null;
  updatedAt: number;
}

const STORAGE_KEY = "looper:saved-loops";
const SCHEMA_VERSION = 1;
/** Enough for a shelf of current practice material without hoarding. */
export const MAX_SAVED_LOOPS = 12;

const entrySchema = z.object({
  key: z.string().min(1),
  kind: z.union([z.literal("youtube"), z.literal("local")]),
  id: z.string().min(1),
  title: z.string().nullable(),
  markerA: z.number().nonnegative().nullable(),
  markerB: z.number().nonnegative().nullable(),
  speed: z.number().min(MIN_SPEED).max(MAX_SPEED),
  loopEnabled: z.boolean(),
  duration: z.number().nonnegative(),
  thumb: z.string().nullable(),
  updatedAt: z.number(),
});

const indexSchema = z.object({
  version: z.literal(SCHEMA_VERSION),
  entries: z.array(entrySchema),
});

export function youtubeLoopKey(videoId: string): string {
  return `yt:${videoId}`;
}

/** Fingerprint of the file itself, so re-uploads collapse to one entry. */
export function localLoopKey(file: {
  name: string;
  size: number;
  lastModified: number;
}): string {
  return `file:${file.name}:${file.size}:${file.lastModified}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** All saved loops, newest first. Corrupt storage reads as empty. */
export function listSavedLoops(): SavedLoop[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = indexSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return [];
    return parsed.data.entries;
  } catch {
    return [];
  }
}

function write(entries: SavedLoop[]): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, entries }),
    );
  } catch {
    // Quota or private mode — saved loops are a convenience, never fatal.
  }
}

/**
 * Insert or replace by `key` and move to the front, pruning past the cap.
 * `title` and `thumb` are sticky: an update carrying null keeps the previous
 * value, so a title learned once (or a thumbnail captured once) survives
 * later saves that happen not to know it.
 */
export function upsertSavedLoop(entry: SavedLoop): void {
  if (!isBrowser()) return;
  const entries = listSavedLoops();
  const existing = entries.find((e) => e.key === entry.key);
  const merged: SavedLoop = {
    ...entry,
    title: entry.title ?? existing?.title ?? null,
    thumb: entry.thumb ?? existing?.thumb ?? null,
  };
  write([
    merged,
    ...entries.filter((e) => e.key !== entry.key),
  ].slice(0, MAX_SAVED_LOOPS));
}

export function removeSavedLoop(key: string): void {
  if (!isBrowser()) return;
  write(listSavedLoops().filter((e) => e.key !== key));
}
