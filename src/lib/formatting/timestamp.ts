/**
 * Timestamp formatting and parsing.
 *
 * Display format:
 *   - `MM:SS.mmm`      for durations under one hour
 *   - `HH:MM:SS.mmm`   for durations of one hour or more
 *
 * All functions operate on a floating-point number of seconds. Millisecond
 * precision is preserved so markers can be nudged in 10ms increments.
 */

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;

function pad(value: number, length: number): string {
  return Math.floor(value).toString().padStart(length, "0");
}

export interface FormatTimestampOptions {
  /** Include the `.mmm` milliseconds portion (default true). */
  showMilliseconds?: boolean;
  /**
   * Force the `HH:MM:SS` layout even for short durations. When omitted the
   * layout is chosen automatically from the value.
   */
  forceHours?: boolean;
}

/**
 * Format a number of seconds as a human-readable timestamp.
 * Negative or non-finite inputs are treated as 0.
 */
export function formatTimestamp(
  totalSeconds: number,
  options: FormatTimestampOptions = {},
): string {
  const { showMilliseconds = true, forceHours = false } = options;

  const safe =
    Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;

  // Work in whole milliseconds so seconds and the fractional part stay in
  // sync — computing ms independently could desync when it rounds to 1000.
  const totalMs = showMilliseconds
    ? Math.round(safe * 1000)
    : Math.floor(safe) * 1000;

  const hours = Math.floor(totalMs / (SECONDS_PER_HOUR * 1000));
  const minutes = Math.floor(
    (totalMs % (SECONDS_PER_HOUR * 1000)) / (SECONDS_PER_MINUTE * 1000),
  );
  const seconds = Math.floor((totalMs % (SECONDS_PER_MINUTE * 1000)) / 1000);
  const milliseconds = totalMs % 1000;

  const showHours = forceHours || hours > 0;

  const core = showHours
    ? `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`
    : `${pad(minutes, 2)}:${pad(seconds, 2)}`;

  if (!showMilliseconds) return core;
  return `${core}.${pad(milliseconds, 3)}`;
}

/**
 * Format a compact timestamp without milliseconds — used for the timeline
 * hover preview and duration labels where sub-second precision is noise.
 */
export function formatClock(totalSeconds: number, forceHours = false): string {
  return formatTimestamp(totalSeconds, {
    showMilliseconds: false,
    forceHours,
  });
}

// Accepts: SS(.mmm), MM:SS(.mmm), HH:MM:SS(.mmm). Milliseconds optional and
// may be 1-3 digits (interpreted as tenths/hundredths/thousandths).
const TIMESTAMP_PATTERN =
  /^(?:(?:(\d{1,2}):)?(\d{1,2}):)?(\d{1,2})(?:\.(\d{1,3}))?$/;

/**
 * Parse a timestamp string into seconds. Returns `null` when the input cannot
 * be interpreted as a valid time. Whitespace is trimmed.
 *
 * Examples:
 *   "49.87"       -> 49.87
 *   "1:23.500"    -> 83.5
 *   "01:02:03.25" -> 3723.25
 */
export function parseTimestamp(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;

  const match = TIMESTAMP_PATTERN.exec(trimmed);
  if (!match) return null;

  const [, hoursStr, minutesStr, secondsStr, msStr] = match;

  const hours = hoursStr ? Number.parseInt(hoursStr, 10) : 0;
  const minutes = minutesStr ? Number.parseInt(minutesStr, 10) : 0;
  const seconds = secondsStr ? Number.parseInt(secondsStr, 10) : 0;

  // A colon-delimited seconds/minutes field above 59 is ambiguous; reject it
  // so "1:75" doesn't silently normalize to 2:15.
  if (minutesStr && seconds > 59) return null;
  if (hoursStr && minutes > 59) return null;

  let milliseconds = 0;
  if (msStr) {
    // Right-pad so "5" -> 500ms, "05" -> 50ms, "005" -> 5ms.
    milliseconds = Number.parseInt(msStr.padEnd(3, "0"), 10);
  }

  const total =
    hours * SECONDS_PER_HOUR +
    minutes * SECONDS_PER_MINUTE +
    seconds +
    milliseconds / 1000;

  return Number.isFinite(total) ? total : null;
}
