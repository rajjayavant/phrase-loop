"use client";

/**
 * How the current media load was initiated, for `media_loaded`'s `method`.
 *
 * The initiating control (link paste, upload, recent-loop tile) knows the
 * answer but the mount hook that fires the event does not, so the initiator
 * leaves a hint here and the event consumes it. One-shot: consuming clears
 * it, and a load with no hint is either a shared link (markers in the URL)
 * or the default video — the seed effect hints `shared_link`, so the final
 * fallback is `default`.
 */

import type { MediaLoadMethod } from "./analytics";

let pending: MediaLoadMethod | null = null;

export function hintLoadMethod(method: MediaLoadMethod): void {
  pending = method;
}

/**
 * Weak variant: only records when no stronger hint is already pending.
 * Used by the URL-seed effect, which runs after click handlers that know
 * better (a recent-loop tile also produces marker params in the URL).
 */
export function hintLoadMethodIfUnset(method: MediaLoadMethod): void {
  if (pending === null) pending = method;
}

export function consumeLoadMethod(): MediaLoadMethod {
  const method = pending ?? "default";
  pending = null;
  return method;
}
