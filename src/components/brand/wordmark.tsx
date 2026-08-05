import * as React from "react";
import { cn } from "@/lib/utilities/cn";

export interface WordmarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  /** Render only the glyph badge (no wordmark text). */
  markOnly?: boolean;
}

/**
 * The PhraseLoop wordmark: an accent glyph badge (a hardware-style logo tile)
 * beside the Poppins wordmark set tight. The mark is drawn inline so the brand
 * needs no image asset and scales crisply.
 *
 * The glyph is a pair of repeat barlines from music notation joined by a staff
 * line — the mark a player already knows means "play this again". It borrows
 * the musician's own vocabulary rather than the generic loop-arrow every media
 * player uses.
 *
 * The barlines used to enclose a small waveform, which read as clutter at
 * favicon size. Removing it left the two halves floating apart as separate
 * `:|` and `|:` glyphs, so the staff line does the joining instead: one mark,
 * far less ink.
 *
 * Known trade-off: this is six elements, and it is softer at 16px than a
 * single silhouette would be. A bracket-and-play-triangle version tested
 * better at favicon size but lost the musical vocabulary, which is the more
 * important quality here.
 */
export function Wordmark({
  className,
  size = "md",
  markOnly = false,
  ...props
}: WordmarkProps) {
  const badge =
    size === "lg" ? "h-9 w-9" : size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const glyph =
    size === "lg" ? "h-5 w-5" : size === "sm" ? "h-4 w-4" : "h-[1.15rem]";
  const text =
    size === "lg"
      ? "text-[1.6rem]"
      : size === "sm"
        ? "text-[1.05rem]"
        : "text-[1.25rem]";

  return (
    <span
      className={cn("inline-flex items-center gap-2.5 text-primary", className)}
      {...props}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-[0.7em] bg-accent text-accent-contrast",
          "shadow-[0_2px_10px_-2px_rgba(224,86,31,0.55)]",
          badge,
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className={glyph} fill="none">
          {/* Opening repeat barline: heavy rule plus the two dots. */}
          <path
            d="M4.2 5.4v13.2"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="7.4" cy="9.6" r="1.2" fill="currentColor" />
          <circle cx="7.4" cy="14.4" r="1.2" fill="currentColor" />
          {/* Closing repeat barline, mirrored. */}
          <circle cx="16.6" cy="9.6" r="1.2" fill="currentColor" />
          <circle cx="16.6" cy="14.4" r="1.2" fill="currentColor" />
          <path
            d="M19.8 5.4v13.2"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* A single staff line between the dot pairs. It ties the two
              barlines into one mark — without it the wide spacing lets them
              read as separate `:|` and `|:` glyphs. Kept dot-to-dot rather
              than spanning the full width, which would cross the dots and
              look like a strikethrough. */}
          <path
            d="M9.4 12h5.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!markOnly && (
        <span
          className={cn(
            "font-display font-semibold tracking-[-0.04em]",
            text,
          )}
        >
          PhraseLoop
        </span>
      )}
    </span>
  );
}
