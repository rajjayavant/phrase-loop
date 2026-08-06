"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * Instagram post embeds.
 *
 * Instagram's embed.js scans the document for `blockquote.instagram-media` and
 * replaces each one with an iframe. That scan runs once on load, so in a React
 * app it has to be re-triggered after hydration or the blockquotes stay as
 * bare fallback markup.
 *
 * Before the script runs (and if it is blocked by a tracker blocker, which is
 * common) each blockquote degrades to a plain link to the post. That fallback
 * is deliberate: the section is still useful with JavaScript off or Instagram
 * unreachable.
 *
 * This is a client component because `window.instgrm` only exists after the
 * third-party script loads.
 */

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

/** Reel shortcodes, in the order they should appear. */
const REELS = ["DbfzRtCzXS-", "Dap6kqJTxwr", "DaN4rZ9zG2f", "DWzeuhDk3iN"] as const;

export function InstagramEmbeds() {
  useEffect(() => {
    // Re-process on mount: the script may have loaded before these
    // blockquotes were in the DOM.
    window.instgrm?.Embeds.process();
  }, []);

  return (
    <>
      {/* Instagram's iframe is cross-origin, so its white card cannot be
          restyled from here. Instead each embed sits in a dark frame at a
          reduced width, which reads as a deliberate inset rather than a slab
          of white dropped into a dark page. */}
      <div className="ig-embeds mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
        {REELS.map((code) => (
          <div
            key={code}
            className="overflow-hidden rounded-card border border-border bg-elevated p-2"
          >
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={`https://www.instagram.com/reel/${code}/?utm_source=ig_embed&utm_campaign=loading`}
              data-instgrm-version="14"
              style={{
                background: "transparent",
                border: 0,
                borderRadius: 8,
                boxShadow: "none",
                margin: 0,
                maxWidth: "100%",
                minWidth: 0,
                padding: 0,
                width: "100%",
              }}
            >
              {/* Fallback until embed.js swaps this for an iframe. Also what
                  a tracker blocker leaves behind, so it has to stand alone. */}
              <a
                href={`https://www.instagram.com/reel/${code}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-4 text-small-body text-accent underline-offset-4 hover:underline"
              >
                View this reel on Instagram
              </a>
            </blockquote>
          </div>
        ))}
      </div>

      {/* embed.js writes inline width/min-width onto the iframe it injects,
          which beats any class we put on it. This is scoped to .ig-embeds and
          marked !important purely to win against those inline styles. */}
      <style>{`
        .ig-embeds iframe.instagram-media {
          min-width: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          border-radius: 8px !important;
          box-shadow: none !important;
        }
      `}</style>

      <Script src="https://www.instagram.com/embed.js" strategy="lazyOnload" />
    </>
  );
}
