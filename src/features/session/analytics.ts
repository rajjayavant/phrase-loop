/**
 * Typed internal analytics interface.
 *
 * No third-party service is wired up. Events are logged in development only.
 * The event shapes are designed so we can later measure the funnel described
 * in the product spec (visitors → loaded video → created loop → shared link)
 * without collecting personal information.
 */

export type ProductEvent =
  | { name: "video_loaded"; videoId: string }
  | { name: "marker_set"; marker: "A" | "B" }
  | { name: "loop_enabled"; loopLength: number }
  | { name: "speed_changed"; requested: number; applied: number }
  | { name: "practice_link_copied" }
  | { name: "session_restored"; videoId: string };

type EventSink = (event: ProductEvent) => void;

let sink: EventSink = (event) => {
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event.name, event);
  }
};

/** Swap the sink (e.g. to a real provider) later without touching call sites. */
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
