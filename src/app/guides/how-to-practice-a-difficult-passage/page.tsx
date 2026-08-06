import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/features/guides/guide-page";
import { AUTHOR } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "How to Practise a Difficult Passage | Fix the Bar That Keeps Failing",
  description:
    "What to do with the two bars that keep going wrong: diagnose the real problem, isolate it, slow it down, and rebuild it at tempo.",
  alternates: { canonical: "/guides/how-to-practice-a-difficult-passage" },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: "article",
    title: "How to Practise a Difficult Passage | Fix the Bar That Keeps Failing",
    description:
      "What to do with the two bars that keep going wrong: diagnose the real problem, isolate it, slow it down, and rebuild it at tempo.",
    url: "/guides/how-to-practice-a-difficult-passage",
    authors: [AUTHOR.name],
  },
};

export default function Page() {
  return (
    <GuidePage
      slug="how-to-practice-a-difficult-passage"
      title="How to practise a difficult passage"
      intro={
        <>
          Every piece has one. Two bars that fall apart every time, while
          everything around them is fine. Playing the piece from the top again
          will not fix it, and it is what most of us do anyway.
        </>
      }
    >
      <h2>Find out where it actually goes wrong</h2>
      <p>
        The place a passage falls apart is usually not the place that caused
        it. A fumble on beat three often begins with an awkward hand position
        set up on beat one.
      </p>
      <p>
        Play the passage slowly several times and watch for the earliest moment
        something feels uncomfortable. That is the spot to work on. Fixing the
        visible collapse without fixing its cause produces a passage that works
        in practice and fails on stage.
      </p>

      <h2>Ask whether it is a technique problem</h2>
      <p>
        Before drilling anything, consider whether the passage is hard because
        it is hard, or because you are approaching it wrongly. Common culprits:
      </p>
      <ul>
        <li>A fingering that works for the first note and traps you later</li>
        <li>A shift placed on a strong beat instead of a weak one</li>
        <li>Trying to play legato something that needs a position change</li>
        <li>Tension: gripping harder as the passage approaches</li>
      </ul>
      <p>
        If any of those apply, repetition will not help. It will make the wrong
        solution automatic. Try two or three alternative fingerings first and
        pick the one that feels easiest slowly. The easiest one slowly is
        almost always the one that survives at tempo.
      </p>

      <h2>Shrink it until it is easy</h2>
      <p>
        Take the smallest fragment that still contains the difficulty. Often
        that is three or four notes, not two bars. If the problem is a shift,
        the fragment is the note before it and the note after it, and nothing
        else.
      </p>
      <p>
        This feels excessive. It is the fastest route, because a small fragment
        can be repeated many times per minute, and repetitions are what
        actually change anything.
      </p>

      <h2>Slow it to where it is correct</h2>
      <p>
        Take the fragment to a tempo where you can play it accurately every
        time. Then repeat it, staying at that tempo for longer than feels
        necessary, before starting to raise it.
      </p>
      <p>
        The rule for raising it is three clean repetitions in a row, then ten
        percent faster. When a step fails, drop back rather than pushing. The
        detail is in{" "}
        <Link href="/guides/how-to-practice-slowly-and-speed-up">
          how to practise slowly and speed up
        </Link>
        .
      </p>
      <p>
        If you are working from a recording rather than notation,{" "}
        <Link href="/">PhraseLoop</Link> lets you mark the fragment once and
        loop it at whatever speed you need, so the repetitions happen without
        you stopping to rewind between each one.
      </p>

      <h2>Put it back in context</h2>
      <p>
        A fragment you can play perfectly in isolation will still fail inside
        the piece, because the surrounding music changes what your hands are
        doing when they arrive.
      </p>
      <p>
        Once the fragment is solid, practise it with one bar before and one bar
        after. That is usually where the remaining problem lives, and it is a
        different problem from the one you just solved.
      </p>

      <h2>Stop before it degrades</h2>
      <p>
        There is a point in every session where repetitions start getting worse
        rather than better. Continuing past it practises the deteriorated
        version.
      </p>
      <p>
        When you notice accuracy dropping, stop working on that passage. Come
        back tomorrow. Difficult passages improve between sessions at least as
        much as during them, which is why five short days beat one long one.
      </p>

      <h2>Expect it to feel unsolved for a while</h2>
      <p>
        A passage worked this way often feels no better on day two, noticeably
        better on day four, and fine by the end of the week. The flat start is
        normal and is the most common point at which people conclude the method
        is not working and go back to playing from the top.
      </p>
    </GuidePage>
  );
}
