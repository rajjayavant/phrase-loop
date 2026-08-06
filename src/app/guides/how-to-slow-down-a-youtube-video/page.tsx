import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/features/guides/guide-page";
import { AUTHOR } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "How to Slow Down a YouTube Video | Built In and Beyond",
  description:
    "YouTube's speed control goes to 0.25x in fixed steps. Here is how to use it, what it cannot do, and how to slow down just one section instead.",
  alternates: { canonical: "/guides/how-to-slow-down-a-youtube-video" },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: "article",
    title: "How to Slow Down a YouTube Video | Built In and Beyond",
    description:
      "YouTube's speed control goes to 0.25x in fixed steps. Here is how to use it, what it cannot do, and how to slow down just one section instead.",
    url: "/guides/how-to-slow-down-a-youtube-video",
    authors: [AUTHOR.name],
  },
};

export default function Page() {
  return (
    <GuidePage
      slug="how-to-slow-down-a-youtube-video"
      title="How to slow down a YouTube video"
      intro={
        <>
          YouTube has a speed control built in, and for many purposes it is
          all you need. It has two limits that matter if you are using it to
          learn something: it applies to the whole video, and it only offers
          fixed steps.
        </>
      }
    >
      <h2>Using YouTube&rsquo;s own speed control</h2>
      <p>
        On desktop, click the gear icon in the player, choose{" "}
        <strong>Playback speed</strong>, and pick a value. The options run from
        0.25x to 2x. On mobile, tap the screen, then the settings icon, then
        Playback speed.
      </p>
      <p>
        There is also a keyboard shortcut: <kbd>Shift</kbd> <kbd>,</kbd> slows
        playback down and <kbd>Shift</kbd> <kbd>.</kbd> speeds it up, stepping
        through the same values.
      </p>

      <h2>Does it change the pitch?</h2>
      <p>
        No. YouTube corrects the pitch when the speed changes, so a video at
        0.5x sounds slower but stays in the same key. This is what makes slow
        playback useful for music rather than a novelty. The detail is in{" "}
        <Link href="/guides/does-slowing-down-a-video-change-the-pitch">
          does slowing down a video change the pitch
        </Link>
        .
      </p>

      <h2>The two limitations</h2>
      <h3>It applies to the whole video</h3>
      <p>
        The speed setting is global. If you want one difficult passage at half
        speed and the rest at normal, you are changing the setting back and
        forth manually every time you reach it.
      </p>
      <h3>It only offers fixed steps</h3>
      <p>
        The menu gives you a handful of preset values. If 0.5x is too slow and
        0.75x is too fast for the passage you are working on, there is nothing
        in between.
      </p>

      <h2>Slowing down one section instead</h2>
      <p>
        For learning, what you usually want is a specific passage, slowed, on
        repeat. That is three things at once, and YouTube gives you a partial
        version of one of them.
      </p>
      <p>
        <Link href="/">PhraseLoop</Link> handles the combination: mark the
        start and end of the passage, set the speed anywhere between 0.25x and
        2x, and it loops that section at that speed until you change it.
        Because the markers persist, you can raise the speed step by step as
        the passage gets easier without losing your place.
      </p>

      <h2>Practical speeds for learning</h2>
      <p>
        For working out notes by ear, half speed is usually the sweet spot:
        slow enough to separate a fast run into individual notes, fast enough
        that the phrase still hangs together musically.
      </p>
      <p>
        For playing along, use the fastest speed at which you play accurately.
        That is often higher than you expect, and practicing below it wastes
        time. There is a fuller treatment in{" "}
        <Link href="/guides/how-to-practice-slowly-and-speed-up">
          how to practice slowly and speed up
        </Link>
        .
      </p>

      <h2>Very slow playback</h2>
      <p>
        Below about a quarter speed, audio quality degrades noticeably whatever
        tool you use. Pitch correction works by stretching the audio in time,
        and stretching it very far introduces artefacts.
      </p>
      <p>
        If a passage is unusable even at 0.25x, the problem is usually that the
        section is too long rather than too fast. Shorten it to a couple of
        bars and it becomes tractable.
      </p>
    </GuidePage>
  );
}
