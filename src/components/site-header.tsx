import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

const LINKS = [
  { href: "/guides", label: "Guides" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * The sitewide header for content pages.
 *
 * Every content page used to render a bare wordmark and nothing else, which
 * left the ten guides reachable only from links below the player's fold on
 * `/`. That matters for two audiences: crawlers, which weight sitewide
 * navigation more heavily than one in-body link, and AdSense reviewers, who
 * check whether a site's content is actually navigable. Google's site-quality
 * guidance calls out navigation that "directs users to relevant content"
 * explicitly.
 *
 * The practice screen (`practice-header.tsx`) keeps its own header, because it
 * carries the link input and the shortcuts dialog. This one is for pages that
 * are read rather than used.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          aria-label="PhraseLoop home"
          className="rounded-control transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Wordmark size="sm" />
        </Link>

        <nav aria-label="Main">
          <ul className="flex items-center gap-x-5 sm:gap-x-6">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-sm text-small-body text-secondary transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
