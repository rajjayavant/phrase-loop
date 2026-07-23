/**
 * The default video shown when a first-time visitor arrives with no previously
 * used link. It should be a public, embeddable video that suits practice — a
 * guitar lesson works well as a musician-facing default. Overridable via env.
 */
export const DEFAULT_VIDEO_ID =
  process.env.NEXT_PUBLIC_DEFAULT_VIDEO_ID ?? "jNQXAC9IVRw";
