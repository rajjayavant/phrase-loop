import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/features/guides/guide-page";
import { AUTHOR } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "How to Practice Slowly and Speed Up | The Method, Step by Step",
  description:
    "What tempo to start at, how much to raise it, and when to move up. The slow practice method applied to learning from a recording, not just a metronome.",
  alternates: { canonical: "/guides/how-to-practice-slowly-and-speed-up" },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: "article",
    title: "How to Practice Slowly and Speed Up | The Method, Step by Step",
    description:
      "What tempo to start at, how much to raise it, and when to move up. The slow practice method applied to learning from a recording, not just a metronome.",
    url: "/guides/how-to-practice-slowly-and-speed-up",
    authors: [AUTHOR.name],
  },
};

export default function Page() {
  return (
    <GuidePage
      slug="how-to-practice-slowly-and-speed-up"
      title="How to practice slowly and speed up"
      intro={
        <>
          Every teacher says to practice slowly and gradually speed up. Far
          fewer say what tempo to start at, how much to add each time, or how
          to tell when you have earned the increase. Those details are the
          difference between the method working and it feeling like a waste of
          an afternoon.
        </>
      }
    >
      <h2>Why slow practice works</h2>
      <p>
        Playing an instrument is a motor skill, and motor skills are learned by
        repeating a movement accurately. Repeating it inaccurately also teaches
        something, just not what you wanted. Your hands do not know which
        repetitions were the good ones.
      </p>
      <p>
        Slowing down does two things. It gives you time to make the correct
        movement rather than an approximation of it, and it gives you time to
        notice what you are doing while you do it. At tempo, a difficult
        passage happens faster than you can pay attention to it, which is
        precisely why it is difficult.
      </p>

      <h2>What tempo to start at</h2>
      <p>
        The useful rule is not a number, it is a test:{" "}
        <strong>
          start at the fastest tempo where you can play the passage accurately,
          with no hesitation, three times in a row.
        </strong>
      </p>
      <p>
        In practice that often lands near half speed, which is why half speed
        is the number most often quoted. But it depends on the passage and on
        you. If you are making mistakes, it is still too fast, and it does not
        matter how slow that means. Some passages need a quarter speed to start
        with, and there is nothing wrong with that.
      </p>
      <p>
        The mistake to avoid is choosing a tempo that feels respectable rather
        than one where you play accurately. Slow practice only works if it is
        actually slow enough.
      </p>

      <h2>How much to raise it</h2>
      <p>
        Around ten percent per step. Small enough that each increase feels
        almost unnoticeable, large enough that you get somewhere.
      </p>
      <p>
        The point of small increments is that you should never be practicing at
        a tempo you cannot play. Every repetition should be a correct one. Big
        jumps mean spending time at a speed where you fumble, which is the
        thing the whole method exists to avoid.
      </p>

      <h2>When to move up</h2>
      <p>
        The same test as before: three clean repetitions in a row. Not one
        lucky one. Three, consecutively, with no hesitation and nothing
        approximated.
      </p>
      <p>
        If you get two clean and fumble the third, that counts as zero. This
        sounds harsh and it is the part that makes the method work, because it
        stops you from advancing on the strength of a repetition that happened
        to go well.
      </p>

      <h2>When it goes wrong, go back down</h2>
      <p>
        You will hit a tempo where the passage falls apart. The instinct is to
        keep playing it at that speed until it improves. It will not. You are
        practicing the failure.
      </p>
      <p>
        Drop back to the last speed where you were clean, play it a few more
        times, and try the increase again. Often the second attempt succeeds
        because the extra repetitions at the lower tempo were what you actually
        needed.
      </p>

      <h2>Doing this with a recording</h2>
      <p>
        Most advice on this assumes a metronome, which works when you are
        reading from notation. It does not help when you are learning from a
        video or a track, which is how most people learn now. For that you need
        to slow the recording itself.
      </p>
      <p>
        Two things make it practical. The audio has to stay in the same key
        when you slow it, or you cannot play along. And the passage has to
        repeat without you reaching for the mouse every twenty seconds, because
        stopping to rewind breaks exactly the concentration you are trying to
        build.
      </p>
      <p>
        <Link href="/">PhraseLoop</Link> does both: mark the passage once, set
        the speed anywhere from a quarter to double, and it loops on its own
        with the pitch unchanged. Raise the speed a step when the passage is
        clean, without losing your markers.
      </p>

      <h2>How long to spend at each tempo</h2>
      <p>
        Less than you would expect. Three clean repetitions and move on. Long
        stretches at one speed feel productive and mostly build tolerance for
        that speed rather than progress towards the next.
      </p>
      <p>
        Short daily sessions beat long occasional ones by a wide margin. Twenty
        minutes a day for a week will get you further than three hours on a
        Sunday, because the consolidation happens between sessions, not during
        them.
      </p>

      <h2>What this does not fix</h2>
      <p>
        If a passage is failing because of a fingering choice, a technique you
        have not learned, or an instrument set up badly, slow practice will not
        rescue it. It will just make the wrong solution very reliable.
      </p>
      <p>
        Before starting the tempo ladder, play the passage once very slowly and
        ask whether the movement itself is sensible. Fix that first. There is
        more on diagnosing this in{" "}
        <Link href="/guides/how-to-practice-a-difficult-passage">
          how to practice a difficult passage
        </Link>
        .
      </p>
    </GuidePage>
  );
}
