import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service — PhraseLoop",
  description:
    "The terms for using PhraseLoop: acceptable use, how YouTube content is handled, your own files, intellectual property, and the limits of the service.",
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    title: "Terms of Service — PhraseLoop",
    description:
      "The terms for using PhraseLoop: acceptable use, how YouTube content is handled, your own files, intellectual property, and the limits of the service.",
    url: "/terms",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" meta="Last updated 5 August 2026">
      <p>
        These terms govern your use of PhraseLoop (&ldquo;the Service&rdquo;,
        phraseloop.online). By using the Service you agree to them. If you do
        not, please do not use it.
      </p>

      <h2>What the Service is</h2>
      <p>
        PhraseLoop is a free, browser-based practice tool for musicians. It lets
        you mark a section of a video or audio source, adjust its playback
        speed, and repeat that section. It requires no account and is provided
        free of charge.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Use the Service to infringe anyone&apos;s copyright or other rights.
        </li>
        <li>
          Attempt to download, capture, rip, or re-host content that is streamed
          through the Service.
        </li>
        <li>
          Interfere with the Service, attempt to gain unauthorised access to it,
          or use it to distribute malware.
        </li>
        <li>Use automated systems to overload or scrape the Service.</li>
        <li>Use the Service where doing so would break the law where you are.</li>
      </ul>

      <h2>YouTube content</h2>
      <p>
        YouTube videos play through YouTube&apos;s official embedded player. The
        Service does <strong>not</strong> download, store, copy, or re-host
        YouTube content — playback happens inside YouTube&apos;s own player, so
        views are counted normally and creators are unaffected.
      </p>
      <p>
        Your use of that player is also subject to the{" "}
        <a
          href="https://www.youtube.com/t/terms"
          target="_blank"
          rel="noreferrer noopener"
        >
          YouTube Terms of Service
        </a>
        . PhraseLoop is not affiliated with, endorsed by, or sponsored by
        YouTube or Google.
      </p>
      <p>
        Some videos will not play here. Owners can disable embedding, and
        videos may be age-restricted or unavailable in your region. That is
        decided by the rights holder and YouTube, not by us.
      </p>

      <h2>Your own files</h2>
      <p>
        When you open a video or audio file from your device, it is processed
        entirely within your browser and is never uploaded to us. You keep all
        rights to your files, and you are responsible for having the right to
        use any file you open.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Service&apos;s name, design, and code belong to their author. These
        terms give you the right to use the Service as a tool; they do not
        transfer ownership of it.
      </p>
      <p>
        Content you play through the Service belongs to its respective owners.
        Nothing here grants you any right to that content.
      </p>

      <h2>Availability</h2>
      <p>
        The Service is provided free and is offered <strong>as is</strong>. It
        may be changed, interrupted, or discontinued at any time without notice.
        We do not guarantee that it will be available, error-free, or compatible
        with every browser, device, or network. Some corporate and school
        networks block the YouTube player, which will prevent playback here
        through no fault of the Service.
      </p>

      <h2>Disclaimer and liability</h2>
      <p>
        To the fullest extent permitted by law, the Service is provided without
        warranties of any kind, express or implied, including fitness for a
        particular purpose. We are not liable for any indirect, incidental, or
        consequential loss arising from your use of it. Because the Service is
        free, our total liability to you is limited to zero.
      </p>
      <p>
        Nothing in these terms limits liability that cannot be limited by law.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        These terms may be updated. When they are, the date at the top of this
        page changes. Continuing to use the Service afterwards means you accept
        the revised terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms are welcome — see the{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
