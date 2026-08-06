import Script from "next/script";

/**
 * Layout for /guides and everything under it.
 *
 * Exists solely to scope the AdSense script to the guides. Auto ads let Google
 * decide placement by scanning the page, which is right for an article and
 * wrong for the player: on `/` the region it would treat as "content" contains
 * the timeline, transport and speed controls, and an injected unit there would
 * break the instrument. Loading the script only here means auto ads cannot
 * reach the root at all, whatever the dashboard is set to.
 *
 * `lazyOnload` keeps the ad script off the critical path, the same reasoning
 * as analytics: Lighthouse measured third-party JS as the dominant cost of
 * this site's LCP.
 */
export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Script
        id="adsense"
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2835923206229583"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
    </>
  );
}
