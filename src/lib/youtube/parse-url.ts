/**
 * Pure YouTube URL parsing and video-ID validation.
 *
 * Supported input shapes:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://m.youtube.com/watch?v=VIDEO_ID
 *   - a bare 11-character video ID
 *   - any of the above with extra query parameters (e.g. &t=90s, ?list=...)
 *
 * Unsupported domains and malformed IDs return `null`.
 */

export interface ParsedYouTubeUrl {
  videoId: string;
  /** Start time in seconds, when a `t`/`start` parameter is present. */
  startTime?: number;
}

// YouTube video IDs are exactly 11 characters of [A-Za-z0-9_-].
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const ALLOWED_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

/** Return `true` when `value` is a syntactically valid YouTube video ID. */
export function isValidVideoId(value: string): boolean {
  return VIDEO_ID_PATTERN.test(value);
}

/**
 * Parse a YouTube start-time token. Accepts a raw number of seconds ("90") or
 * the `1h2m3s` / `2m30s` / `45s` shorthand YouTube uses. Returns `null` for
 * anything unrecognized.
 */
export function parseStartTime(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed === "") return null;

  // Plain seconds, e.g. "90" or "90.5".
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const seconds = Number.parseFloat(trimmed);
    return Number.isFinite(seconds) ? seconds : null;
  }

  // Colon clock form "1:30" or "1:02:03".
  if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(trimmed)) {
    const parts = trimmed.split(":").map((p) => Number.parseInt(p, 10));
    const seconds = parts.reduce((acc, part) => acc * 60 + part, 0);
    return Number.isFinite(seconds) ? seconds : null;
  }

  // Shorthand "1h2m3s".
  const shorthand = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i.exec(trimmed);
  if (shorthand && shorthand[0] !== "") {
    const [, h, m, s] = shorthand;
    const seconds =
      (h ? Number.parseInt(h, 10) * 3600 : 0) +
      (m ? Number.parseInt(m, 10) * 60 : 0) +
      (s ? Number.parseInt(s, 10) : 0);
    return seconds > 0 ? seconds : null;
  }

  return null;
}

function normalizeHost(host: string): string {
  return host.toLowerCase();
}

/**
 * Parse a pasted YouTube URL (or bare video ID) into a normalized
 * `{ videoId, startTime? }`. Returns `null` for anything unsupported.
 */
export function parseYouTubeUrl(input: string): ParsedYouTubeUrl | null {
  const raw = input.trim();
  if (raw === "") return null;

  // Bare video ID.
  if (isValidVideoId(raw)) {
    return { videoId: raw };
  }

  // Add a protocol if the user pasted a scheme-less URL.
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }

  const host = normalizeHost(url.hostname);
  if (!ALLOWED_HOSTS.has(host)) return null;

  const startTime =
    parseStartTime(url.searchParams.get("t")) ??
    parseStartTime(url.searchParams.get("start")) ??
    undefined;

  const withStart = (videoId: string): ParsedYouTubeUrl =>
    startTime != null ? { videoId, startTime } : { videoId };

  // youtu.be/VIDEO_ID
  if (host === "youtu.be" || host === "www.youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && isValidVideoId(id) ? withStart(id) : null;
  }

  // youtube.com/watch?v=VIDEO_ID
  const vParam = url.searchParams.get("v");
  if (vParam && isValidVideoId(vParam)) {
    return withStart(vParam);
  }

  // Path-based forms: /shorts/ID, /embed/ID, /v/ID, /live/ID
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const [prefix, candidate] = segments;
    if (
      (prefix === "shorts" ||
        prefix === "embed" ||
        prefix === "v" ||
        prefix === "live") &&
      candidate &&
      isValidVideoId(candidate)
    ) {
      return withStart(candidate);
    }
  }

  return null;
}
