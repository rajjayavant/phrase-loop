import type { ReactNode } from "react";
import Link from "next/link";

/**
 * The server-rendered content beneath the player.
 *
 * Exists so the root URL has something to index. The player itself is a client
 * island that renders as an empty shell to a crawler, which left `/` at ~76
 * words of interface chrome and no headings at all.
 *
 * Editorial rules, from Google's "creating helpful content" guidance:
 *   - Every claim here is verified against the code. Speed bounds come from
 *     `practice-params.ts`, shortcuts from `shortcut-definitions.ts`, and the
 *     privacy claim from the absence of any upload path in `src/`.
 *   - No em dashes anywhere in the copy (owner's standing instruction).
 *   - Written to be read. Headings carry search terms because that is how
 *     people phrase the problem, not because a keyword list demanded them.
 */

/** The three guides most worth reaching from the homepage. */
const FEATURED_GUIDES = [
  {
    href: "/guides/how-to-loop-a-section-of-a-youtube-video",
    label: "How to loop a section of a YouTube video",
  },
  {
    href: "/guides/how-to-slow-down-a-youtube-video",
    label: "How to slow down a YouTube video",
  },
  {
    href: "/guides/how-to-learn-a-guitar-solo",
    label: "How to learn a guitar solo",
  },
] as const;

interface Step {
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    title: "Load a video, or open a file",
    body: "Paste a YouTube link, or drag in a video or audio file from your own device. Both give you the same controls. Local files stay on your machine.",
  },
  {
    title: "Mark the passage with A and B",
    body: "Press A where the difficult part starts and B where it ends. The markers sit on the timeline and can be nudged in small steps once you are close.",
  },
  {
    title: "Slow it down until you can play it",
    body: "Drop the speed anywhere between 0.25x and 2x. The pitch stays where it was, so a guitar solo at half speed is still in the same key.",
  },
  {
    title: "Loop it until it stops being difficult",
    body: "Turn the loop on and the passage repeats without you touching anything. Bring the speed back up a little at a time as it gets easier.",
  },
];

interface Faq {
  q: string;
  a: ReactNode;
}

const FAQ: Faq[] = [
  {
    q: "How do I loop a section of a YouTube video?",
    a: (
      <>
        <p>
          YouTube itself can only repeat a whole video. Right click the player
          and choose Loop and you get the entire thing again from the top, with
          no way to set a start and end point. That is fine for a song you want
          on repeat, and no use at all for the four bars you are actually
          trying to learn.
        </p>
        <p className="mt-3">
          To repeat just one part, paste the link here, play until the start of
          the passage and press <Key>A</Key>, then play to the end of it and
          press <Key>B</Key>. Press <Key>L</Key> to turn the loop on and that
          section repeats on its own. Both markers can be moved afterwards
          without losing your place, and you can drop the speed while it loops.
        </p>
      </>
    ),
  },
  {
    q: "Does slowing a video down change the pitch?",
    a: (
      <>
        No. Both YouTube and your browser correct the pitch automatically when
        playback speed changes, so a passage at 0.5x sounds slower but stays in
        the same key. This is what makes slow practice useful for musicians:
        you can still hear the intervals correctly while you work out the
        fingering.
      </>
    ),
  },
  {
    q: "How slow can it go?",
    a: (
      <>
        Down to 0.25x, which is a quarter of the original speed, and up to 2x
        if you want to push a passage past tempo once you have it. Use{" "}
        <Key>⇧</Key> <Key>,</Key> and <Key>⇧</Key> <Key>.</Key> to step the
        speed down and up, the same keys YouTube uses.
      </>
    ),
  },
  {
    q: "Can I use my own recordings instead of YouTube?",
    a: (
      <>
        Yes. Drag any video or audio file onto the page and it opens in the
        same player with the same markers, speed control, and loop. This is
        useful for a lesson recording, a backing track, or anything not on
        YouTube.
      </>
    ),
  },
  {
    q: "Do my files get uploaded anywhere?",
    a: (
      <>
        No. Files you open stay in your browser and are never sent to a server.
        There is no upload step and no account. The tradeoff is that a link to
        a local file only reopens on the same browser, since the file never
        left it.
      </>
    ),
  },
  {
    q: "Can I share a loop with someone else?",
    a: (
      <>
        Yes, for YouTube videos. The address bar keeps the video, both markers,
        and the speed, so copying the link and sending it opens the same
        passage at the same speed for whoever receives it. Useful for a teacher
        pointing a student at one specific bar.
      </>
    ),
  },
  {
    q: "What are the keyboard shortcuts?",
    a: (
      <>
        <Key>Space</Key> plays and pauses. <Key>A</Key> and <Key>B</Key> set
        the markers, <Key>L</Key> toggles the loop, and <Key>R</Key> jumps back
        to the start of it. <Key>⇧</Key> <Key>,</Key> and <Key>⇧</Key>{" "}
        <Key>.</Key> change speed. Arrow keys seek. The full list is in the
        Shortcuts dialog in the header.
      </>
    ),
  },
  {
    q: "Is it free?",
    a: (
      <>
        Yes, and there is no account to create. Open the page and start
        practicing.
      </>
    ),
  },
];

/** A keyboard key, styled as a physical cap. */
function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-block rounded border border-border bg-elevated px-1.5 py-0.5 font-mono text-[0.8em] text-primary">
      {children}
    </kbd>
  );
}

export function HomeContent() {
  return (
    <section
      aria-labelledby="about-phraseloop"
      className="mx-auto w-full max-w-3xl px-5 pb-16 pt-4"
    >
      <h1
        id="about-phraseloop"
        className="font-display text-page-title font-semibold tracking-[-0.03em] text-primary"
      >
        Loop and slow down any section of a YouTube video, pitch intact
      </h1>

      <p className="mt-3 text-body text-secondary">
        Practicing a difficult bar means hearing it slowly, hearing it often,
        and not breaking your concentration to rewind. PhraseLoop marks the
        passage once, drops the speed as far as you need, and repeats it until
        it feels natural. It works with any YouTube video or a file from your
        own device.
      </p>

      <h2 className="mt-10 font-display text-section-title font-semibold text-primary">
        How it works
      </h2>
      <ol className="mt-4 space-y-5">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-elevated font-mono text-label text-accent"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="font-medium text-primary">{step.title}</h3>
              <p className="mt-1 text-body text-secondary">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-10 font-display text-section-title font-semibold text-primary">
        Who it is for
      </h2>
      <p className="mt-3 text-body text-secondary">
        It was built for musicians working a phrase up to tempo: a guitar solo
        that moves too fast to hear, a piano passage where the left hand keeps
        losing its place, a drum fill you can almost play. The same approach
        works anywhere repetition is the point, which is why people use it for
        language pronunciation, dance choreography, and technique in sport.
      </p>
      <p className="mt-3 text-body text-secondary">
        The loop anticipates the end point slightly rather than waiting to
        overshoot it, so it comes round cleanly instead of clipping the first
        note of the phrase.
      </p>

      <h2 className="mt-10 font-display text-section-title font-semibold text-primary">
        Practice guides
      </h2>
      <p className="mt-3 text-body text-secondary">
        Longer pieces on how to use the time you spend with the instrument.
      </p>
      <ul className="mt-4 space-y-2">
        {FEATURED_GUIDES.map((guide) => (
          <li key={guide.href}>
            <Link
              href={guide.href}
              className="text-body text-accent underline-offset-4 hover:underline"
            >
              {guide.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/guides"
            className="text-body text-secondary underline-offset-4 hover:text-primary hover:underline"
          >
            All guides
          </Link>
        </li>
      </ul>

      <h2 className="mt-10 font-display text-section-title font-semibold text-primary">
        Questions
      </h2>
      <dl className="mt-4 space-y-6">
        {FAQ.map((item) => (
          <div key={item.q}>
            <dt>
              <h3 className="font-medium text-primary">{item.q}</h3>
            </dt>
            <dd className="mt-1 text-body text-secondary">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
