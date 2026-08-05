import * as React from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SiteFooter } from "@/components/site-footer";

interface StatusPageProps {
  /** Big monospace code — "404", "500". Doubles as the visual anchor. */
  code: string;
  title: string;
  children: React.ReactNode;
  /** Primary/secondary actions, rendered as a row under the copy. */
  actions?: React.ReactNode;
  /** Omit the footer where it cannot be rendered (see global-error). */
  footer?: boolean;
}

/**
 * Shared layout for 404 and 5xx screens.
 *
 * These are the two pages a visitor sees at their least patient, so they get
 * the same treatment as the rest of the app rather than a bare stack trace:
 * the wordmark, one plain sentence about what happened, and a way onward.
 * The footer keeps the policy links reachable even from a dead URL.
 */
export function StatusPage({
  code,
  title,
  children,
  actions,
  footer = true,
}: StatusPageProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center px-4 py-4 sm:px-6">
        <Link
          href="/"
          aria-label="PhraseLoop home"
          className="rounded-control transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Wordmark size="sm" />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 pb-10 text-center sm:px-6">
        <span className="tabular text-[4rem] font-medium leading-none text-accent sm:text-[5rem]">
          {code}
        </span>
        <h1 className="mt-3 font-display text-page-title font-semibold tracking-[-0.03em] text-primary">
          {title}
        </h1>
        <div className="mt-3 space-y-3 text-body text-secondary">{children}</div>
        {actions && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {actions}
          </div>
        )}
      </main>

      {footer && <SiteFooter />}
    </div>
  );
}
