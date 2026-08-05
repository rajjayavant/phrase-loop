import { GoogleAnalytics } from "@next/third-parties/google";

/** GA4 measurement ID. */
const GA_ID = "G-WEND9HDK6Q";

/**
 * Google Analytics 4.
 *
 * Uses Next's first-party `@next/third-parties` wrapper rather than hand-rolled
 * script tags: it loads gtag.js with the right strategy, sets up `dataLayer`
 * and the `gtag` shim, and keeps analytics off the critical path. The player is
 * the point of the page and should not wait on a measurement library.
 *
 * App Router handles pageviews on client-side navigation automatically, so
 * there is no route-change listener to write here.
 *
 * Note: this sets cookies. The analytics section of the privacy policy
 * describes it; keep the two in sync if the setup changes.
 */
export function AnalyticsScripts() {
  // Skip in development so local work does not pollute production stats.
  if (process.env.NODE_ENV !== "production") return null;

  return <GoogleAnalytics gaId={GA_ID} />;
}
