import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SiteFooter } from "@/components/site-footer";
import { GUIDES } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "Practice Guides | PhraseLoop",
  description:
    "How to learn a solo, practice slowly and speed up, work a song out by ear, and get more out of the time you spend with your instrument.",
  alternates: { canonical: "/guides" },
  openGraph: {
    type: "website",
    title: "Practice Guides | PhraseLoop",
    description:
      "How to learn a solo, practice slowly and speed up, work a song out by ear, and get more out of the time you spend with your instrument.",
    url: "/guides",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
};

export default function GuidesIndexPage() {
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
          Practice guides
        </h1>
        <p className="mt-3 max-w-prose text-body text-secondary">
          Most practice advice stops at &ldquo;play it slowly and speed
          up&rdquo;. These go further: what tempo to start at, how much to
          raise it, and what to do with the two bars that keep going wrong.
        </p>

        <ul className="mt-10 space-y-7">
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <h2 className="font-display text-section-title font-semibold">
                <Link
                  href={`/guides/${guide.slug}`}
                  className="text-primary underline-offset-4 hover:text-accent hover:underline"
                >
                  {guide.linkTitle}
                </Link>
              </h2>
              <p className="mt-1 text-body text-secondary">{guide.summary}</p>
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />
    </div>
  );
}
