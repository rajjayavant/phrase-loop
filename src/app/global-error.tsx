"use client";

import { StatusPage } from "@/features/legal/status-page";

/**
 * The last line of defence: a failure in the ROOT LAYOUT itself, which
 * `error.tsx` cannot catch because it renders inside that layout.
 *
 * Because the layout is what broke, this component has to supply its own
 * `<html>` and `<body>`, and it cannot rely on anything the layout provides —
 * no fonts, no theme attribute, no toast viewport. So the colours here are
 * inlined deliberately rather than using token classes: if the stylesheet is
 * the thing that failed, utility classes would render unstyled.
 *
 * The footer is omitted for the same reason — its links are useless if the
 * app shell is broken, and a plain reload is the only sensible action.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          backgroundColor: "#14100e",
          color: "#f7f3ee",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <StatusPage
          code="500"
          title="PhraseLoop failed to start"
          footer={false}
          actions={
            <button
              type="button"
              onClick={reset}
              style={{
                cursor: "pointer",
                borderRadius: "0.5rem",
                border: "none",
                backgroundColor: "#e0561f",
                color: "#fff",
                padding: "0.625rem 1.125rem",
                fontSize: "0.9375rem",
                fontWeight: 500,
              }}
            >
              Reload
            </button>
          }
        >
          <p>
            Something went wrong before the app could load. Reloading usually
            fixes it.
          </p>
          {error.digest && (
            <p style={{ fontSize: "0.875rem", opacity: 0.7 }}>
              Reference: {error.digest}
            </p>
          )}
        </StatusPage>
      </body>
    </html>
  );
}
