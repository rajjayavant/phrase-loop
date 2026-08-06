import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/features/guides/guide-page";
import { AUTHOR } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "How to Get Better at Piano | Practice That Actually Works",
  description:
    "Hands separate, small sections, slow tempo. Why the standard piano practice advice works, and how to apply it properly.",
  alternates: { canonical: "/guides/how-to-get-better-at-piano" },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: "article",
    title: "How to Get Better at Piano | Practice That Actually Works",
    description:
      "Hands separate, small sections, slow tempo. Why the standard piano practice advice works, and how to apply it properly.",
    url: "/guides/how-to-get-better-at-piano",
    authors: [AUTHOR.name],
  },
};

export default function Page() {
  return (
    <GuidePage
      slug="how-to-get-better-at-piano"
      title="How to get better at piano"
      intro={
        <>
          The standard advice is hands separate, small sections, slow tempo. It
          is standard because it works, and it is widely ignored because it is
          slower and less enjoyable than playing through the piece. Here is how
          to apply it so it actually pays off.
        </>
      }
    >
      <h2>Hands separately, for longer than you want to</h2>
      <p>
        Piano asks each hand to do something independent, and the difficulty of
        a passage is often entirely in one of them. Practicing hands together
        means the easy hand gets the same attention as the hard one.
      </p>
      <p>
        Work the difficult hand alone until it is genuinely automatic. Most
        people stop hands-separate practice as soon as the notes are learned,
        which is well before the movement is reliable. Automatic means you can
        play it while thinking about something else.
      </p>

      <h2>Then hands together, slower than either hand alone</h2>
      <p>
        Combining two automatic parts is a third skill, not the sum of the
        first two. Expect to drop the tempo substantially when you first put
        them together, and do not treat that as a setback.
      </p>

      <h2>Work in sections of two to four bars</h2>
      <p>
        A section should be short enough that you can repeat it many times in a
        few minutes. Repetitions are what change anything, and long sections
        produce very few of them per session.
      </p>
      <p>
        This is also how memorisation actually happens. A piece memorised in
        small overlapping sections is far more robust under pressure than one
        memorised as a single continuous run, which tends to fail completely at
        the first slip.
      </p>

      <h2>Slow enough to be accurate, every time</h2>
      <p>
        The tempo to practice at is the fastest one where you play accurately
        with no hesitation, three times in a row. If you are making mistakes,
        it is too fast.
      </p>
      <p>
        Raise it about ten percent when you have earned it, and drop back when
        a step fails. The reasoning behind those numbers is in{" "}
        <Link href="/guides/how-to-practice-slowly-and-speed-up">
          how to practice slowly and speed up
        </Link>
        .
      </p>

      <h2>Practice the joins between sections</h2>
      <p>
        Sections learned separately create weak points at their boundaries. You
        can play section A and section B and stumble in the gap.
      </p>
      <p>
        Fix it explicitly: practice the last beat of one section into the first
        beat of the next, and nothing else. It is a small drill that removes a
        problem which otherwise persists indefinitely.
      </p>

      <h2>Fingering is a decision, not a detail</h2>
      <p>
        A passage that keeps failing is often a fingering problem rather than a
        difficulty problem. Once a fingering is in your hands it is expensive
        to change, so decide it early and write it down.
      </p>
      <p>
        Test candidate fingerings slowly. The one that feels easiest at slow
        tempo is almost always the one that holds up at speed.
      </p>

      <h2>Learning from a recording</h2>
      <p>
        If you are working from a video rather than a score, the same
        principles apply and the practical problem is different: you need to
        hear one passage repeatedly, slowly enough to see what the hands are
        doing.
      </p>
      <p>
        <Link href="/">PhraseLoop</Link> lets you mark the section and loop it
        at reduced speed with the pitch unchanged, so you can watch and listen
        to the same four bars as many times as you need without rewinding.
      </p>

      <h2>Short daily sessions</h2>
      <p>
        Thirty minutes a day beats a long weekly session by a wide margin.
        Difficult passages improve noticeably between days, which only helps if
        there are days between your sessions.
      </p>
      <p>
        When accuracy starts dropping within a session, stop working on that
        passage. Continuing past that point practices the tired version of it.
      </p>
    </GuidePage>
  );
}
