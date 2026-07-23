/**
 * Pure A–B loop state model and transitions.
 *
 * This module contains NO React and NO player references. It answers two
 * questions:
 *   1. Given a user action, what is the next valid loop state?
 *   2. Given a playback position, should the loop wrap, and to where?
 *
 * The corrective rules (spec) are encoded here so the UI never has to reason
 * about invalid marker orderings.
 */

export interface LoopState {
  markerA: number | null;
  markerB: number | null;
  enabled: boolean;
  iterationCount: number;
}

export const initialLoopState: LoopState = {
  markerA: null,
  markerB: null,
  enabled: false,
  iterationCount: 0,
};

/**
 * The smallest meaningful loop length. Below this the loop would wrap faster
 * than YouTube can reliably seek, producing an unusable stutter.
 */
export const MIN_LOOP_LENGTH_SECONDS = 0.2;

export type LoopValidity =
  | "empty" // no markers
  | "incomplete" // exactly one marker
  | "too-short" // both set but region below the minimum length
  | "valid";

export function getLoopValidity(state: LoopState): LoopValidity {
  const { markerA, markerB } = state;
  if (markerA == null && markerB == null) return "empty";
  if (markerA == null || markerB == null) return "incomplete";
  if (markerB - markerA < MIN_LOOP_LENGTH_SECONDS) return "too-short";
  return "valid";
}

export function isLoopReady(state: LoopState): boolean {
  return getLoopValidity(state) === "valid";
}

export type LoopStatus =
  "empty" | "incomplete" | "invalid" | "ready" | "active";

/** Human-facing status combining validity and the enabled flag. */
export function getLoopStatus(state: LoopState): LoopStatus {
  const validity = getLoopValidity(state);
  if (validity === "empty") return "empty";
  if (validity === "incomplete") return "incomplete";
  if (validity === "too-short") return "invalid";
  return state.enabled ? "active" : "ready";
}

function clampToDuration(seconds: number, duration: number): number {
  if (duration <= 0) return Math.max(0, seconds);
  return Math.min(Math.max(0, seconds), duration);
}

/**
 * Set marker A at `seconds`. Corrective behavior: if A would land at or after
 * an existing B, B is cleared (the user is redefining the region from A).
 * Enabling the loop is left to the caller once the region is valid.
 */
export function setMarkerA(
  state: LoopState,
  seconds: number,
  duration: number,
): LoopState {
  const a = clampToDuration(seconds, duration);
  const clearB =
    state.markerB != null && a >= state.markerB - MIN_LOOP_LENGTH_SECONDS;
  return {
    ...state,
    markerA: a,
    markerB: clearB ? null : state.markerB,
    enabled: clearB ? false : state.enabled,
    iterationCount: 0,
  };
}

/**
 * Set marker B at `seconds`. Corrective behavior: if B would land at or before
 * an existing A, A is cleared (the user is redefining the region up to B).
 */
export function setMarkerB(
  state: LoopState,
  seconds: number,
  duration: number,
): LoopState {
  const b = clampToDuration(seconds, duration);
  const clearA =
    state.markerA != null && b <= state.markerA + MIN_LOOP_LENGTH_SECONDS;
  return {
    ...state,
    markerB: b,
    markerA: clearA ? null : state.markerA,
    enabled: clearA ? false : state.enabled,
    iterationCount: 0,
  };
}

/**
 * Move an already-placed marker (drag / nudge / exact entry). Unlike
 * `setMarkerA/B`, this preserves the *other* marker and instead clamps the
 * moved marker so it can never cross it — the correct behavior for fine
 * adjustment where the user does not want the opposite marker to vanish.
 */
export function moveMarker(
  state: LoopState,
  marker: "A" | "B",
  seconds: number,
  duration: number,
): LoopState {
  const target = clampToDuration(seconds, duration);
  if (marker === "A") {
    const max =
      state.markerB != null
        ? state.markerB - MIN_LOOP_LENGTH_SECONDS
        : duration > 0
          ? duration
          : Number.POSITIVE_INFINITY;
    return { ...state, markerA: Math.min(target, max), iterationCount: 0 };
  }
  const min =
    state.markerA != null ? state.markerA + MIN_LOOP_LENGTH_SECONDS : 0;
  return { ...state, markerB: Math.max(target, min), iterationCount: 0 };
}

export function clearMarkerA(state: LoopState): LoopState {
  return { ...state, markerA: null, enabled: false, iterationCount: 0 };
}

export function clearMarkerB(state: LoopState): LoopState {
  return { ...state, markerB: null, enabled: false, iterationCount: 0 };
}

export function clearLoop(): LoopState {
  return { ...initialLoopState };
}

/** Toggle the loop. Enabling is only permitted when the region is valid. */
export function toggleLoop(state: LoopState): LoopState {
  if (state.enabled) return { ...state, enabled: false };
  if (!isLoopReady(state)) return state;
  return { ...state, enabled: true, iterationCount: 0 };
}

export function setLoopEnabled(state: LoopState, enabled: boolean): LoopState {
  if (enabled && !isLoopReady(state)) return state;
  return {
    ...state,
    enabled,
    iterationCount: enabled ? 0 : state.iterationCount,
  };
}

/**
 * Loop wrap decision, evaluated on each playback tick.
 *
 * Returns the position to seek to (marker A) when the playhead has reached or
 * passed marker B while the loop is active, otherwise `null`. A small
 * look-ahead (`lookAheadSeconds`) triggers the seek slightly before B so the
 * perceived wrap is tight despite imperfect seek accuracy.
 */
export interface LoopTickDecision {
  shouldWrap: boolean;
  seekTo: number | null;
}

export function evaluateLoopTick(
  state: LoopState,
  currentTime: number,
  lookAheadSeconds = 0.04,
): LoopTickDecision {
  if (!state.enabled || !isLoopReady(state)) {
    return { shouldWrap: false, seekTo: null };
  }
  const { markerA, markerB } = state;
  // Guarded by isLoopReady above, but narrow for TypeScript.
  if (markerA == null || markerB == null) {
    return { shouldWrap: false, seekTo: null };
  }

  if (currentTime >= markerB - lookAheadSeconds) {
    return { shouldWrap: true, seekTo: markerA };
  }
  // If the playhead somehow ends up before A (e.g. manual seek out of region
  // is allowed — so we do NOT wrap on the lower bound). Seeking below A is a
  // deliberate user action and must remain possible.
  return { shouldWrap: false, seekTo: null };
}
