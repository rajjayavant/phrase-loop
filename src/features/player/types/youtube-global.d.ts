/**
 * The YouTube IFrame API expects a global ready callback that its loader
 * script invokes. `@types/youtube` declares `YT` but not this window hook.
 */
export {};

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: (() => void) | undefined;
    YT?: typeof YT;
  }
}
