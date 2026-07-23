/**
 * Loads the official YouTube IFrame Player API exactly once on the client.
 *
 * The API injects a single global (`window.YT`) and invokes
 * `window.onYouTubeIframeAPIReady` when ready. Because that callback is a
 * process-wide singleton, we must never overwrite it if another consumer set
 * it. This module guards all of that behind one cached promise so repeated
 * calls (including React StrictMode double-invokes) are safe.
 */

let loadPromise: Promise<typeof YT> | null = null;

const SCRIPT_ID = "youtube-iframe-api";
const SCRIPT_SRC = "https://www.youtube.com/iframe_api";

export function loadYouTubeApi(): Promise<typeof YT> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("YouTube API can only be loaded in the browser"),
    );
  }

  // Already available.
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<typeof YT>((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      // Preserve any previously-registered ready handler.
      previousReady?.();
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube API loaded without a Player constructor"));
      }
    };

    // Reuse an existing script tag if one is already present.
    if (document.getElementById(SCRIPT_ID)) {
      // The tag exists but the ready callback hasn't fired yet — our handler
      // above will resolve when it does.
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load the YouTube IFrame API script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** For tests: reset the cached loader promise. */
export function __resetYouTubeApiLoaderForTests(): void {
  loadPromise = null;
}
