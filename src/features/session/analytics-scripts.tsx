import Script from "next/script";

/** GA4 measurement ID. */
const GA_ID = "G-WEND9HDK6Q";

/**
 * Google Analytics 4.
 *
 * Uses `next/script` with `lazyOnload` rather than `@next/third-parties`,
 * which hard-codes `afterInteractive`. Lighthouse measured 67KB of unused
 * gtag.js being fetched while the player was still starting, and analytics has
 * no deadline where the player does. `lazyOnload` defers it until the browser
 * is idle.
 *
 * A plain server component: next/script renders fine from the server and
 * nothing here is interactive.
 *
 * Note: this sets cookies. The analytics section of the privacy policy
 * describes it; keep the two in sync if the setup changes.
 */
export function AnalyticsScripts() {
  // Skip in development so local work does not pollute production stats.
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
