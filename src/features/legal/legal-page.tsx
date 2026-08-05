import * as React from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SiteFooter } from "@/components/site-footer";

interface LegalPageProps {
  title: string;
  /** Shown under the title — e.g. "Last updated 5 August 2026". */
  meta?: string;
  children: React.ReactNode;
}

/**
 * Shared chrome for the About / Terms / Privacy pages: the same wordmark
 * header as the player, a readable measure, and the sitewide footer.
 *
 * Prose styling is applied here rather than in each page so the three stay
 * visually identical — they are read as a set.
 */
export function LegalPage({ title, meta, children }: LegalPageProps) {
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-4 sm:px-6">
        <h1 className="font-display text-page-title font-semibold tracking-[-0.03em] text-primary">
          {title}
        </h1>
        {meta && <p className="mt-2 text-helper text-muted">{meta}</p>}

        <div
          className={[
            "mt-8 space-y-5 text-body text-secondary",
            // Headings
            "[&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-section-title [&_h2]:font-semibold [&_h2]:text-primary",
            "[&_h2:first-child]:mt-0",
            // Lists
            "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:pl-1",
            // Inline
            "[&_strong]:font-medium [&_strong]:text-primary",
            "[&_a]:text-accent [&_a]:underline-offset-4 hover:[&_a]:underline",
            "[&_code]:rounded-sm [&_code]:bg-subtle [&_code]:px-1.5 [&_code]:py-0.5",
            "[&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-primary",
          ].join(" ")}
        >
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
