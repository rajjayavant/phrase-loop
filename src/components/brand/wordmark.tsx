import * as React from "react";
import { cn } from "@/lib/utilities/cn";

export interface WordmarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
  /** Render only the glyph badge (no wordmark text). */
  markOnly?: boolean;
}

/**
 * The Looper wordmark: an accent glyph badge (a hardware-style logo tile) beside
 * the Poppins wordmark set tight. The looping mark is drawn inline so the brand
 * needs no image asset and scales crisply.
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
          <path
            d="M6.5 8.2a3.6 3.6 0 1 0 0 7.2c2.3 0 3.5-1.9 5.3-3.6 1.8-1.7 2.9-3.6 5.2-3.6a3.6 3.6 0 1 1 0 7.2c-2.3 0-3.4-1.9-5.2-3.6C10.1 10.1 8.9 8.2 6.5 8.2Z"
            stroke="currentColor"
            strokeWidth="2"
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
          Looper
        </span>
      )}
    </span>
  );
}
