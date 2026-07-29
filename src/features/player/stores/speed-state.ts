/**
 * Playback-speed state model.
 *
 * The key invariant: we NEVER display a requested rate that the player did not
 * actually apply. We track the user's requested rate separately from the rate
 * the player reports it applied, and surface a status when they diverge.
 */

import { clamp, round } from "@/lib/utilities/clamp";
import { MAX_SPEED, MIN_SPEED } from "@/lib/validation/practice-params";

export type SpeedStatus =
  "idle" | "applying" | "applied" | "adjusted" | "unsupported";

export interface PlaybackSpeedState {
  requestedRate: number;
  appliedRate: number;
  availableRates: number[];
  status: SpeedStatus;
}

export const SPEED_PRESETS = [0.25, 0.5, 0.75, 0.9, 1, 1.25, 1.5, 2] as const;

export const SPEED_STEP = 0.01;

export const initialSpeedState: PlaybackSpeedState = {
  requestedRate: 1,
  appliedRate: 1,
  availableRates: [1],
  status: "idle",
};

export function normalizeRate(rate: number): number {
  return round(clamp(rate, MIN_SPEED, MAX_SPEED), 2);
}

/** Begin applying a requested rate. Marks the state `applying`. */
export function requestRate(
  state: PlaybackSpeedState,
  rate: number,
): PlaybackSpeedState {
  return {
    ...state,
    requestedRate: normalizeRate(rate),
    status: "applying",
  };
}

/**
 * Reconcile against the rate the player reports it actually applied. If the
 * applied rate matches the request (within a tolerance) the status is
 * `applied`; otherwise the player adjusted the value and we say so.
 */
export function reconcileAppliedRate(
  state: PlaybackSpeedState,
  appliedRate: number,
): PlaybackSpeedState {
  const applied = round(appliedRate, 2);
  const matches = Math.abs(applied - state.requestedRate) < 0.005;
  return {
    ...state,
    appliedRate: applied,
    status: matches ? "applied" : "adjusted",
  };
}

export function setAvailableRates(
  state: PlaybackSpeedState,
  rates: number[],
): PlaybackSpeedState {
  const unique = Array.from(new Set(rates.map((r) => round(r, 2)))).sort(
    (a, b) => a - b,
  );
  // A player offering only [1] is effectively "no custom rate support".
  const supportsCustom = unique.length > 1;
  return {
    ...state,
    availableRates: unique.length > 0 ? unique : [1],
    status: supportsCustom ? state.status : "unsupported",
  };
}

/** Adjust the requested rate by a signed delta (used by +/- and J/K). */
export function nudgeRate(
  state: PlaybackSpeedState,
  delta: number,
): PlaybackSpeedState {
  return requestRate(state, state.requestedRate + delta);
}

export function resetRate(state: PlaybackSpeedState): PlaybackSpeedState {
  return requestRate(state, 1);
}

// No status message is surfaced for speed. The player quantizes requested
// rates (see README), but the displayed number is always the *applied* rate,
// so what the user reads is already the truth. Explaining the discrepancy adds
// a line of API trivia they can neither act on nor care about — the tempo
// either sounds right or it doesn't.
//
// `status` is still tracked on the state: it drives nothing visible today, but
// it is what any future "rate unavailable" affordance would key off.

export function formatRate(rate: number): string {
  // Trim trailing zeros: 0.5 -> "0.5×", 1 -> "1×", 0.75 -> "0.75×".
  return `${Number.parseFloat(rate.toFixed(2))}×`;
}
