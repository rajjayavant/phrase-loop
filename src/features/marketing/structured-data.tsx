/**
 * schema.org SoftwareApplication markup for the root page.
 *
 * Deliberately NOT FAQPage: Google restricted FAQ rich results to government
 * and health sites in August 2023 and deprecated them outright in May 2026,
 * so that markup would render nothing. SoftwareApplication is still live and
 * can surface a price annotation on the listing.
 *
 * No `aggregateRating` here. Google's structured data policy prohibits marking
 * up ratings that were not actually collected, and PhraseLoop has no rating
 * system. Inventing one risks a manual action.
 *
 * Structured data is not a ranking factor. This is eligibility for a richer
 * listing, nothing more.
 */
const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhraseLoop",
  url: "https://phraseloop.online",
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Music practice tool",
  operatingSystem: "Any modern web browser",
  description:
    "Loop a section of any YouTube video or local file and slow it down to practise it, without changing the pitch.",
  featureList: [
    "A and B loop markers",
    "Playback speed from 0.25x to 2x with pitch preserved",
    "Works with YouTube links and local video or audio files",
    "Shareable links that keep the markers and speed",
    "Keyboard shortcuts",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  isAccessibleForFree: true,
} as const;

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      // The object is a module constant with no user input, so there is
      // nothing here that could be injected.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
    />
  );
}
