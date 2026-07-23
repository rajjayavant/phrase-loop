import { z } from "zod";
import { isValidVideoId } from "@/lib/youtube/parse-url";

/**
 * Validation and (de)serialization for the shareable practice URL state.
 *
 * URL shape: /practice?v=VIDEO_ID&a=43.12&b=49.87&speed=0.75&loop=1
 *
 * Every parameter is validated defensively — invalid values fall back to a
 * safe default rather than throwing, so a hand-edited or truncated link never
 * crashes the practice route.
 */

export const MIN_SPEED = 0.25;
export const MAX_SPEED = 2;

/** A finite, non-negative number of seconds, coerced from a string. */
const secondsSchema = z
  .string()
  .transform((value) => Number.parseFloat(value))
  .refine((value) => Number.isFinite(value) && value >= 0, {
    message: "Must be a non-negative number of seconds",
  });

const speedSchema = z
  .string()
  .transform((value) => Number.parseFloat(value))
  .refine(
    (value) =>
      Number.isFinite(value) && value >= MIN_SPEED && value <= MAX_SPEED,
    { message: `Speed must be between ${MIN_SPEED} and ${MAX_SPEED}` },
  );

const videoIdSchema = z.string().refine(isValidVideoId, {
  message: "Malformed YouTube video ID",
});

const loopSchema = z
  .string()
  .transform((value) => value === "1" || value.toLowerCase() === "true");

/**
 * Raw params as they may appear in the URL. Everything is optional; `v` is the
 * only required field to render the practice route.
 */
export const rawPracticeParamsSchema = z.object({
  v: z.string().optional(),
  a: z.string().optional(),
  b: z.string().optional(),
  speed: z.string().optional(),
  loop: z.string().optional(),
});

export interface PracticeParams {
  videoId: string | null;
  a: number | null;
  b: number | null;
  speed: number | null;
  loop: boolean | null;
}

/** Safely coerce a single optional param, returning `fallback` on failure. */
function safe<Out, Fallback>(
  schema: z.ZodType<Out, z.ZodTypeDef, string>,
  value: string | undefined,
  fallback: Fallback,
): Out | Fallback {
  if (value == null) return fallback;
  const result = schema.safeParse(value);
  return result.success ? result.data : fallback;
}

/**
 * Parse loosely-typed search params (from Next.js) into a validated
 * `PracticeParams`. Never throws.
 */
export function parsePracticeParams(
  input: Record<string, string | string[] | undefined>,
): PracticeParams {
  const pick = (key: string): string | undefined => {
    const value = input[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const videoId = safe(videoIdSchema, pick("v"), null);
  let a = safe(secondsSchema, pick("a"), null);
  let b = safe(secondsSchema, pick("b"), null);

  // If markers are present but incoherent (b <= a), drop them rather than
  // seeding an invalid loop. The practice UI will treat markers as unset.
  if (a != null && b != null && b <= a) {
    a = null;
    b = null;
  }

  return {
    videoId,
    a,
    b,
    speed: safe(speedSchema, pick("speed"), null),
    loop: safe(loopSchema, pick("loop"), null),
  };
}

export interface SerializablePracticeState {
  videoId: string;
  a: number | null;
  b: number | null;
  speed: number;
  loop: boolean;
}

/**
 * Serialize practice state into a `URLSearchParams`. Marker times are rounded
 * to millisecond precision to keep links short and stable.
 */
export function serializePracticeParams(
  state: SerializablePracticeState,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("v", state.videoId);

  const round3 = (n: number) => Math.round(n * 1000) / 1000;

  if (state.a != null) params.set("a", String(round3(state.a)));
  if (state.b != null) params.set("b", String(round3(state.b)));
  if (state.speed !== 1) params.set("speed", String(round3(state.speed)));
  if (state.loop) params.set("loop", "1");

  return params;
}
