import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact" },
];

/**
 * The sitewide footer.
 *
 * Beyond being useful, this is a hard requirement for ad-network review:
 * reachable About / Privacy / Terms / Contact links from every page are among
 * the first things an AdSense reviewer checks for. Keep all four linked here.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Wordmark size="sm" />
            <p className="mt-3 text-small-body text-secondary">
              A practice tool for musicians. Loop any passage of a video or
              audio file, slow it down, and repeat it until it feels natural.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 sm:flex-col sm:gap-y-2.5">
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

        <p className="mt-8 text-helper text-muted">
          © {year} PhraseLoop. Not affiliated with YouTube or Google.
        </p>
      </div>
    </footer>
  );
}
