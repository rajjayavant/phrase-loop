/**
 * Capture a small poster frame from a local *video* file, for the Saved Loops
 * shelf. Returns a JPEG data URL sized for a tile, or null for audio files,
 * unsupported codecs, or any failure — callers fall back to an icon tile.
 *
 * Runs entirely off-screen and off the practice path: one seek into a muted,
 * detached <video>, one canvas draw, then everything is released.
 */

const THUMB_WIDTH = 320;
const JPEG_QUALITY = 0.7;
/** Seek a little way in: frame 0 of many videos is black or a fade-in. */
const CAPTURE_AT_FRACTION = 0.25;
const TIMEOUT_MS = 5000;

export function captureLocalVideoThumbnail(
  file: File,
): Promise<string | null> {
  if (!file.type.startsWith("video/")) return Promise.resolve(null);

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    let settled = false;

    const finish = (result: string | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
      resolve(result);
    };

    // Codec quirks and detached-element seeking are flaky territory; a stuck
    // capture must never wedge the recorder.
    const timer = window.setTimeout(() => finish(null), TIMEOUT_MS);

    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      video.currentTime = duration > 0 ? duration * CAPTURE_AT_FRACTION : 0;
    };
    video.onseeked = () => {
      try {
        const scale = THUMB_WIDTH / (video.videoWidth || THUMB_WIDTH);
        const canvas = document.createElement("canvas");
        canvas.width = THUMB_WIDTH;
        canvas.height = Math.max(
          1,
          Math.round((video.videoHeight || THUMB_WIDTH * 0.5625) * scale),
        );
        const ctx = canvas.getContext("2d");
        if (!ctx) return finish(null);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      } catch {
        finish(null);
      }
    };
    video.onerror = () => finish(null);

    video.src = url;
  });
}
