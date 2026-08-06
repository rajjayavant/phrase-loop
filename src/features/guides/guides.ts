/**
 * The guide registry: one source of truth for the /guides index, the sitemap,
 * and the cross-links at the foot of each guide.
 *
 * Adding a guide means adding an entry here *and* creating the route. The
 * sitemap reads this list, so a page added without an entry will not be
 * submitted to search engines.
 *
 * `related` lists the slugs of guides that should link *to* this one. It is
 * written this way round so each entry declares its own inbound links, which
 * makes it obvious when a guide has none.
 */

export const GUIDE_SLUGS = [
  "how-to-learn-a-guitar-solo",
  "how-to-practice-slowly-and-speed-up",
  "how-to-learn-a-song-by-ear",
  "how-to-practice-a-difficult-passage",
  "how-to-transcribe-music",
  "how-to-get-better-at-guitar",
  "how-to-get-better-at-piano",
  "how-to-loop-a-section-of-a-youtube-video",
  "how-to-slow-down-a-youtube-video",
  "does-slowing-down-a-video-change-the-pitch",
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

/**
 * The author of every guide. Used for the byline, the author page link, and
 * the `author` metadata field.
 */
export const AUTHOR = {
  name: "Raj Jayavant",
  url: "/author/raj-jayavant",
  instagram: "https://www.instagram.com/raj_jayavant/",
} as const;

export interface Guide {
  slug: GuideSlug;
  /** Title used on the index and in cross-links. Shorter than the h1. */
  linkTitle: string;
  /** One line on the index page. */
  summary: string;
  /** Slugs of guides this one should be offered alongside. */
  related: GuideSlug[];
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-learn-a-guitar-solo",
    linkTitle: "How to learn a guitar solo",
    summary:
      "A step by step method for taking a solo apart, learning it slowly, and bringing it up to tempo.",
    related: [
      "how-to-practice-slowly-and-speed-up",
      "how-to-learn-a-song-by-ear",
      "how-to-get-better-at-guitar",
      "how-to-practice-a-difficult-passage",
    ],
  },
  {
    slug: "how-to-practice-slowly-and-speed-up",
    linkTitle: "How to practise slowly and speed up",
    summary:
      "Why slow practice works, what tempo to start at, and how much to raise it each time.",
    related: [
      "how-to-learn-a-guitar-solo",
      "how-to-practice-a-difficult-passage",
      "how-to-get-better-at-guitar",
      "how-to-get-better-at-piano",
      "how-to-learn-a-song-by-ear",
    ],
  },
  {
    slug: "how-to-learn-a-song-by-ear",
    linkTitle: "How to learn a song by ear",
    summary:
      "Working out a part from a recording, without tab, one phrase at a time.",
    related: [
      "how-to-transcribe-music",
      "how-to-learn-a-guitar-solo",
      "how-to-get-better-at-guitar",
    ],
  },
  {
    slug: "how-to-practice-a-difficult-passage",
    linkTitle: "How to practise a difficult passage",
    summary:
      "What to do with the two bars that keep going wrong, whatever you play.",
    related: [
      "how-to-practice-slowly-and-speed-up",
      "how-to-get-better-at-piano",
      "how-to-get-better-at-guitar",
      "how-to-learn-a-guitar-solo",
    ],
  },
  {
    slug: "how-to-transcribe-music",
    linkTitle: "How to transcribe music",
    summary:
      "Getting a part off a recording and onto paper, and the tools that make it bearable.",
    related: ["how-to-learn-a-song-by-ear", "how-to-slow-down-a-youtube-video"],
  },
  {
    slug: "how-to-get-better-at-guitar",
    linkTitle: "How to get better at guitar",
    summary:
      "The practice habits that actually move the needle, and the one most players skip.",
    related: [
      "how-to-learn-a-guitar-solo",
      "how-to-practice-slowly-and-speed-up",
      "how-to-practice-a-difficult-passage",
    ],
  },
  {
    slug: "how-to-get-better-at-piano",
    linkTitle: "How to get better at piano",
    summary:
      "Hands separate, small sections, slow tempo. Why the boring advice is the advice that works.",
    related: [
      "how-to-practice-a-difficult-passage",
      "how-to-practice-slowly-and-speed-up",
    ],
  },
  {
    slug: "how-to-loop-a-section-of-a-youtube-video",
    linkTitle: "How to loop a section of a YouTube video",
    summary:
      "YouTube can only repeat a whole video. Here is how to repeat just one part of it.",
    related: [
      "how-to-slow-down-a-youtube-video",
      "how-to-learn-a-guitar-solo",
      "how-to-practice-a-difficult-passage",
      "how-to-transcribe-music",
    ],
  },
  {
    slug: "how-to-slow-down-a-youtube-video",
    linkTitle: "How to slow down a YouTube video",
    summary:
      "The built in speed control, what it cannot do, and how to slow down just the hard part.",
    related: [
      "how-to-loop-a-section-of-a-youtube-video",
      "does-slowing-down-a-video-change-the-pitch",
      "how-to-learn-a-song-by-ear",
      "how-to-practice-slowly-and-speed-up",
    ],
  },
  {
    slug: "does-slowing-down-a-video-change-the-pitch",
    linkTitle: "Does slowing down a video change the pitch?",
    summary:
      "Short answer: no, not any more. The longer answer explains why, and when it does.",
    related: [
      "how-to-slow-down-a-youtube-video",
      "how-to-learn-a-song-by-ear",
      "how-to-transcribe-music",
    ],
  },
];

export function getGuide(slug: GuideSlug): Guide {
  const guide = GUIDES.find((g) => g.slug === slug);
  // The slug type makes this unreachable, but `noUncheckedIndexedAccess` and
  // future edits both benefit from it being explicit.
  if (!guide) throw new Error(`Unknown guide slug: ${slug}`);
  return guide;
}
