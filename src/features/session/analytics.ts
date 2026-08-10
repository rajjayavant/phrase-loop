/**
 * Typed product analytics.
 *
 * Every event name reads as a literal description of the user action that
 * fired it; "which control" is always a property, never a new event. Server
 * components never track — all call sites are client code, and page views
 * come from GA4 itself.
 *
 * In production the default sink forwards to GA4 via the gtag queue (see
 * `AnalyticsScripts`; the queue works even before gtag.js has loaded, so the
 * lazy script strategy loses nothing). In development events go to the
 * console instead of polluting production stats.
 */

export type MediaSource = "youtube" | "local_video" | "local_audio";
export type MediaLoadMethod =
  | "default"
  | "link_paste"
  | "upload"
  | "shared_link"
  | "recent_loop";

export type ProductEvent =
  // --- media ---
  | {
      name: "media_loaded";
      source: MediaSource;
      method: MediaLoadMethod;
      video_id?: string;
    }
  | { name: "media_played"; first_play: boolean }
  | { name: "media_paused" }
  | { name: "media_failed"; kind: string; video_id?: string }
  // --- practice ---
  | { name: "marker_set"; marker: "A" | "B" }
  | { name: "loop_turned_on"; loop_length: number }
  | { name: "loop_turned_off" }
  | { name: "speed_changed"; requested: number; applied: number }
  // --- recently looped ---
  | { name: "recent_loop_opened"; kind: "youtube" | "local" }
  | { name: "recent_loop_removed"; kind: "youtube" | "local" }
  // --- sharing ---
  | { name: "share_link_copied"; has_loop: boolean };

type EventSink = (event: ProductEvent) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let sink: EventSink = (event) => {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event.name, event);
    return;
  }
  if (typeof window === "undefined") return;
  const { name, ...params } = event;
  // Same queueing shim as Google's own snippet: pushes land in dataLayer and
  // are flushed when (or if) gtag.js finishes loading.
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      // gtag.js requires the Arguments object itself; an array is ignored.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  window.gtag("event", name, params);
};

/** Swap the sink (e.g. for tests) without touching call sites. */
export function setAnalyticsSink(next: EventSink): void {
  sink = next;
}

export function trackEvent(event: ProductEvent): void {
  try {
    sink(event);
  } catch {
    // Analytics must never break the app.
  }
}
