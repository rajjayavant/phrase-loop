import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Contact — PhraseLoop",
  description:
    "Get in touch about PhraseLoop: bug reports, feature requests, privacy questions, or anything else about the practice tool.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    title: "Contact — PhraseLoop",
    description:
      "Get in touch about PhraseLoop: bug reports, feature requests, privacy questions, or anything else about the practice tool.",
    url: "/contact",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        PhraseLoop is built and maintained by one person, so messages come
        straight to me. Bug reports and feature requests are genuinely welcome —
        most of what the tool does now came from someone pointing out that
        something was awkward.
      </p>

      <h2>Email</h2>
      <p>
        <a href="mailto:rajjayavant@gmail.com">rajjayavant@gmail.com</a>
      </p>
      <p>
        For a bug, it helps enormously to include your browser, whether you were
        using a YouTube link or your own file, and what you expected to happen.
        If a specific video failed, the link to it is the single most useful
        thing you can send.
      </p>

      <h2>Elsewhere</h2>
      <ul>
        <li>
          <a
            href="https://x.com/9819304846qr"
            target="_blank"
            rel="noreferrer noopener"
          >
            X (Twitter)
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/in/rajjayavant/"
            target="_blank"
            rel="noreferrer noopener"
          >
            LinkedIn
          </a>
        </li>
        <li>
          <a
            href="https://github.com/rajjayavant"
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub
          </a>
        </li>
      </ul>

      <h2>A note on videos that will not play</h2>
      <p>
        The most common report is a YouTube video that plays on YouTube but not
        here. That is usually because the owner disabled embedding, the video is
        age-restricted or region-locked, or a school or workplace network is
        filtering YouTube. Trying the same link on a different network is a
        quick way to tell which it is.
      </p>
    </LegalPage>
  );
}
