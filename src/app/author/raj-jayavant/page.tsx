import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SiteFooter } from "@/components/site-footer";
import { AUTHOR, GUIDES } from "@/features/guides/guides";
import { InstagramEmbeds } from "@/features/author/instagram-embeds";

export const metadata: Metadata = {
  title: "Raj Jayavant | Musician and Builder of PhraseLoop",
  description:
    "Raj Jayavant builds PhraseLoop, a practice tool for musicians. Guides on learning solos, practicing slowly, and working songs out by ear.",
  alternates: { canonical: "/author/raj-jayavant" },
  openGraph: {
    type: "profile",
    title: "Raj Jayavant | Musician and Builder of PhraseLoop",
    description:
      "Musician and developer. Builder of PhraseLoop, a practice tool for looping and slowing down passages.",
    url: "/author/raj-jayavant",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
};

/**
 * Author page.
 *
 * Exists for two reasons: the guides carry a byline and a byline should lead
 * somewhere, and Google's quality guidance leans on clear authorship for
 * instructional content. `Person` structured data ties the name, the site, and
 * the social profile together.
 *
 * The Instagram posts use Instagram's own embed markup; see
 * `features/author/instagram-embeds` for why it needs a re-process on mount.
 */
export default function AuthorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://phraseloop.online/author/raj-jayavant#person",
    name: AUTHOR.name,
    url: "https://phraseloop.online/author/raj-jayavant",
    sameAs: [AUTHOR.instagram],
    jobTitle: "Software developer",
    knowsAbout: [
      "Music practice",
      "Guitar",
      "Ear training",
      "Web development",
    ],
    worksFor: {
      "@type": "Organization",
      name: "PhraseLoop",
      url: "https://phraseloop.online",
    },
  };

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
          Raj Jayavant
        </h1>
        <p className="mt-2 text-body text-secondary">
          Musician and developer. I built PhraseLoop.
        </p>

        <div className="mt-8 space-y-5 text-body text-secondary">
          <p>
            PhraseLoop started as something I wanted for my own practice. I kept
            hitting the same problem everyone who learns from recordings hits:
            the passage you need is four bars long, it goes past too fast to
            hear, and every tool available makes you rewind by hand and change
            the speed for the whole track.
          </p>
          <p>
            So the tool does the obvious thing. Mark the passage once, drop the
            speed as far as you need, and let it repeat while you keep both
            hands on the instrument. The pitch stays where it was, so what you
            hear at half speed is still in the key the record is in.
          </p>
          <p>
            The{" "}
            <Link
              href="/guides"
              className="text-accent underline-offset-4 hover:underline"
            >
              guides
            </Link>{" "}
            are the other half of it. Most practice advice stops at &ldquo;play
            it slowly and speed up&rdquo;, which is correct and not actionable.
            What tempo? Raise it by how much? When have you earned the
            increase? Those pages try to answer the version of the question you
            actually have while sitting with the instrument.
          </p>
          <p>
            Outside of this I write software, mostly on the web. I also built{" "}
            <a
              href="https://github.com/rajjayavant/nextdeploy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-4 hover:underline"
            >
              nextdeploy
            </a>
            , a one-command deploy for Next.js apps onto a fresh Ubuntu server,
            which is what PhraseLoop itself runs on.
          </p>
        </div>

        <h2 className="mt-12 font-display text-section-title font-semibold text-primary">
          Elsewhere
        </h2>
        <p className="mt-3 text-body text-secondary">
          I post on Instagram at{" "}
          <a
            href={AUTHOR.instagram}
            target="_blank"
            rel="noopener noreferrer me"
            className="text-accent underline-offset-4 hover:underline"
          >
            @raj_jayavant
          </a>
          . A few recent posts:
        </p>
        <InstagramEmbeds />

        <h2 className="mt-12 font-display text-section-title font-semibold text-primary">
          Guides I have written
        </h2>
        <ul className="mt-4 space-y-2">
          {GUIDES.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="text-body text-accent underline-offset-4 hover:underline"
              >
                {guide.linkTitle}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-12 text-body text-secondary">
          If you want to reach me, the{" "}
          <Link
            href="/contact"
            className="text-accent underline-offset-4 hover:underline"
          >
            contact page
          </Link>{" "}
          has the details.
        </p>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
