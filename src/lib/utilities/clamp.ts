/** Clamp `value` to the inclusive `[min, max]` range. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

/** Round a number to a fixed number of decimal places (default 3). */
export function round(value: number, decimals = 3): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
