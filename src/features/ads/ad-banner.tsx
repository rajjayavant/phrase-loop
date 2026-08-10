"use client";

import * as React from "react";
import Script from "next/script";

/** AdSense publisher id — must match public/ads.txt. */
const AD_CLIENT = "ca-pub-2835923206229583";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdBannerProps {
  /** AdSense ad-unit slot id. */
  slot: string;
}

/**
 * A responsive AdSense display unit — the ad and nothing else: no heading,
 * no placeholder, and outside production it renders nothing at all.
 *
 * The wrapper reserves `min-height` before the ad fills, because a responsive
 * unit popping in is exactly the layout shift the player facade work spent so
 * long killing. If the unit does NOT fill — AdSense returns unfilled, or an
 * ad blocker keeps the script from ever running — the whole block removes
 * itself rather than leaving an empty hole in the page.
 */
export function AdBanner({ slot }: AdBannerProps) {
  const pushed = React.useRef(false);
  const insRef = React.useRef<HTMLModElement>(null);
  // Optimistic: render the reserved box, collapse on failure. Better a rare
  // below-the-fold collapse than a permanent hole for ad-blocking visitors.
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    // One push per <ins> for the page's lifetime. The guard matters under
    // StrictMode's double-invoked effects: a second push on the same unit
    // makes adsbygoogle.js throw.
    if (!pushed.current) {
      pushed.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        setVisible(false);
        return;
      }
    }

    // AdSense stamps data-ad-status="filled" | "unfilled" once it decides.
    const ins = insRef.current;
    if (!ins) return;
    const check = () => {
      const status = ins.getAttribute("data-ad-status");
      if (status === "unfilled") setVisible(false);
      return status != null;
    };
    if (check()) return;
    const observer = new MutationObserver(() => {
      if (check()) observer.disconnect();
    });
    observer.observe(ins, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });
    // No status at all after a generous wait means the script never ran —
    // almost always an ad blocker. Collapse rather than sit empty forever.
    const timer = window.setTimeout(() => {
      if (!ins.getAttribute("data-ad-status")) setVisible(false);
    }, 8000);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  if (process.env.NODE_ENV !== "production" || !visible) return null;

  return (
    <div className="min-h-[100px] overflow-hidden rounded-card">
      <Script
        id="adsbygoogle-js"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
