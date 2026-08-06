import * as React from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SiteFooter } from "@/components/site-footer";
import { AUTHOR, GUIDES, type GuideSlug } from "./guides";

interface GuidePageProps {
  /** This guide's slug, so it can exclude itself from "related". */
  slug: GuideSlug;
  title: string;
  /** One or two sentences under the h1. Also used as the meta description. */
  intro: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shared chrome for the /guides pages.
 *
 * Mirrors `LegalPage` deliberately: same header, same measure, same prose
 * styling. The guides are a different kind of content but should not feel like
 * a different site.
 *
 * Prose styles live here so ten pages cannot drift apart. Each page supplies
 * only its headings and paragraphs.
 */
export function GuidePage({ slug, title, intro, children }: GuidePageProps) {
  const related = GUIDES.filter((g) => g.slug !== slug && g.related.includes(slug));
  // Fall back to the first few other guides if nothing links back to this one,
  // so a page is never a dead end.
  const shown = (related.length > 0 ? related : GUIDES.filter((g) => g.slug !== slug)).slice(0, 3);

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
        <nav aria-label="Breadcrumb" className="mb-4 text-helper text-muted">
          <Link
            href="/guides"
            className="text-accent underline-offset-4 hover:underline"
          >
            Guides
          </Link>
        </nav>

        {/* No decorative banner here on purpose. An abstract graphic above the
            title read as a broken image and pushed the first paragraph below
            the fold without telling the reader anything. The Open Graph image
            covers the social-preview case, which is where a visual is actually
            needed. */}
        <h1 className="font-display text-page-title font-semibold tracking-[-0.03em] text-primary">
          {title}
        </h1>

        <p className="mt-3 text-helper text-muted">
          By{" "}
          <Link
            href={AUTHOR.url}
            rel="author"
            className="text-accent underline-offset-4 hover:underline"
          >
            {AUTHOR.name}
          </Link>
        </p>

        <div className="mt-3 text-body text-secondary">{intro}</div>

        <div
          className={[
            "mt-8 space-y-5 text-body text-secondary",
            "[&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-section-title [&_h2]:font-semibold [&_h2]:text-primary",
            "[&_h2:first-child]:mt-0",
            "[&_h3]:mt-7 [&_h3]:font-medium [&_h3]:text-primary",
            "[&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:pl-1",
            "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
            "[&_strong]:font-medium [&_strong]:text-primary",
            "[&_a]:text-accent [&_a]:underline-offset-4 hover:[&_a]:underline",
            "[&_kbd]:rounded [&_kbd]:border [&_kbd]:border-border [&_kbd]:bg-elevated",
            "[&_kbd]:px-1.5 [&_kbd]:py-0.5 [&_kbd]:font-mono [&_kbd]:text-[0.8em]",
            "[&_kbd]:text-primary",
          ].join(" ")}
        >
          {children}
        </div>

        {shown.length > 0 && (
          <aside className="mt-14 border-t border-border pt-6">
            <h2 className="font-display text-section-title font-semibold text-primary">
              Related guides
            </h2>
            <ul className="mt-3 space-y-2">
              {shown.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="text-body text-accent underline-offset-4 hover:underline"
                  >
                    {g.linkTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
