import * as React from "react";
import { cn } from "@/lib/utilities/cn";

export interface WordmarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
}

/**
 * The Looper wordmark. The looping "∞"-style glyph is drawn inline so the
 * brand needs no image asset and scales crisply.
 */
export function Wordmark({ className, size = "md", ...props }: WordmarkProps) {
  const dims =
    size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const text =
    size === "lg"
      ? "text-page-title"
      : size === "sm"
        ? "text-small-body"
        : "text-section-title";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight text-primary",
        text,
        className,
      )}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn(dims, "text-accent")}
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 8.5a3.5 3.5 0 1 0 0 7c2.2 0 3.3-1.8 5-3.5 1.7-1.7 2.8-3.5 5-3.5a3.5 3.5 0 1 1 0 7c-2.2 0-3.3-1.8-5-3.5-1.7-1.7-2.8-3.5-5-3.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      <span>Looper</span>
    </span>
  );
}
