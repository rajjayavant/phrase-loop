import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * Shared Open Graph image for the guides.
 *
 * Generated at build time by `next/og` rather than drawn by hand, so ten
 * guides cannot drift apart and a new one needs no design work. Colours are
 * the literal token values from `src/styles/tokens.css`; the satori renderer
 * cannot resolve CSS custom properties, so they have to be inlined here. If
 * the palette changes, change it here too.
 */
const CANVAS = "#14100e";
const PRIMARY = "#f7f3ee";
const SECONDARY = "#b8afa6";
const ACCENT = "#e0561f";
const BORDER = "#241f1b";

export function guideOgImage(title: string, kicker = "Practice guide") {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: CANVAS,
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* The wordmark glyph: repeat barlines around a staff line. */}
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M4.2 5.4v13.2" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="7.4" cy="9.6" r="1.2" fill={ACCENT} />
            <circle cx="7.4" cy="14.4" r="1.2" fill={ACCENT} />
            <path d="M9.4 12h5.2" stroke={PRIMARY} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="16.6" cy="9.6" r="1.2" fill={ACCENT} />
            <circle cx="16.6" cy="14.4" r="1.2" fill={ACCENT} />
            <path d="M19.8 5.4v13.2" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", fontSize: 30, color: PRIMARY, fontWeight: 600 }}>
            PhraseLoop
          </div>
          <div style={{ display: "flex", fontSize: 26, color: SECONDARY }}>
            {`/ ${kicker}`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 46 ? 62 : 74,
            lineHeight: 1.1,
            color: PRIMARY,
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `2px solid ${BORDER}`,
            paddingTop: 28,
            fontSize: 26,
            color: SECONDARY,
          }}
        >
          <div style={{ display: "flex" }}>Raj Jayavant</div>
          <div style={{ display: "flex", color: ACCENT }}>phraseloop.online</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
