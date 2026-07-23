/**
 * Per-video practice session persistence (localStorage).
 *
 * Sessions are keyed by YouTube video ID so returning to a video can offer to
 * restore the previous markers, speed, and preferences. All reads are
 * defensive: corrupt or outdated payloads are ignored rather than thrown.
 */

import { z } from "zod";
import { isValidVideoId } from "@/lib/youtube/parse-url";
import { MAX_SPEED, MIN_SPEED } from "@/lib/validation/practice-params";

export type NudgePrecision = 0.01 | 0.1 | 1;
export type TimelineMode = "full" | "precision";

export interface PracticeSession {
  videoId: string;
  markerA: number | null;
  markerB: number | null;
  requestedSpeed: number;
  appliedSpeed: number;
  loopEnabled: boolean;
  volume: number;
  muted: boolean;
  nudgePrecision: NudgePrecision;
  timelineMode: TimelineMode;
  /** Epoch ms of the last update — used to order/restore the most recent. */
  updatedAt: number;
}

const STORAGE_PREFIX = "looper:session:";
const LAST_VIDEO_KEY = "looper:last-video";
const SCHEMA_VERSION = 1;

const sessionSchema = z.object({
  version: z.literal(SCHEMA_VERSION),
  videoId: z.string().refine(isValidVideoId),
  markerA: z.number().nonnegative().nullable(),
  markerB: z.number().nonnegative().nullable(),
  requestedSpeed: z.number().min(MIN_SPEED).max(MAX_SPEED),
  appliedSpeed: z.number().min(MIN_SPEED).max(MAX_SPEED),
  loopEnabled: z.boolean(),
  volume: z.number().min(0).max(100),
  muted: z.boolean(),
  nudgePrecision: z.union([z.literal(0.01), z.literal(0.1), z.literal(1)]),
  timelineMode: z.union([z.literal("full"), z.literal("precision")]),
  updatedAt: z.number(),
});

type StoredSession = z.infer<typeof sessionSchema>;

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function keyFor(videoId: string): string {
  return `${STORAGE_PREFIX}${videoId}`;
}

/** Load and validate the stored session for a video, or `null`. */
export function loadSession(videoId: string): PracticeSession | null {
  if (!isBrowser() || !isValidVideoId(videoId)) return null;

  try {
    const raw = window.localStorage.getItem(keyFor(videoId));
    if (!raw) return null;
    const parsed = sessionSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    const { version: _version, ...session } = parsed.data;
    return session;
  } catch {
    return null;
  }
}

/** Persist a session. Silently no-ops on the server or on quota errors. */
export function saveSession(session: PracticeSession): void {
  if (!isBrowser() || !isValidVideoId(session.videoId)) return;

  const payload: StoredSession = {
    version: SCHEMA_VERSION,
    ...session,
  };

  try {
    window.localStorage.setItem(
      keyFor(session.videoId),
      JSON.stringify(payload),
    );
    // Remember this as the most recently used video so a bare visit to "/"
    // reopens it instead of the default.
    window.localStorage.setItem(LAST_VIDEO_KEY, session.videoId);
  } catch {
    // Storage full or unavailable (private mode) — non-fatal.
  }
}

/**
 * The most recently opened video ID, or null. Used to reopen the user's last
 * link when they return to the app root.
 */
export function getLastVideoId(): string | null {
  if (!isBrowser()) return null;
  try {
    const id = window.localStorage.getItem(LAST_VIDEO_KEY);
    return id && isValidVideoId(id) ? id : null;
  } catch {
    return null;
  }
}

export function setLastVideoId(videoId: string): void {
  if (!isBrowser() || !isValidVideoId(videoId)) return;
  try {
    window.localStorage.setItem(LAST_VIDEO_KEY, videoId);
  } catch {
    // ignore
  }
}

export function clearSession(videoId: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(keyFor(videoId));
  } catch {
    // ignore
  }
}

/** True when a non-trivial saved session exists (worth offering to restore). */
export function hasRestorableSession(videoId: string): boolean {
  const session = loadSession(videoId);
  if (!session) return false;
  return (
    session.markerA != null ||
    session.markerB != null ||
    session.requestedSpeed !== 1
  );
}
