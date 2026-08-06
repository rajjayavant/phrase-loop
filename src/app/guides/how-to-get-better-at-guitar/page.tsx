import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/features/guides/guide-page";
import { AUTHOR } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "How to Get Better at Guitar | The Habits That Actually Work",
  description:
    "Practical advice on improving at guitar: practice the hard part rather than the whole song, work slowly, and keep sessions short and frequent.",
  alternates: { canonical: "/guides/how-to-get-better-at-guitar" },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: "article",
    title: "How to Get Better at Guitar | The Habits That Actually Work",
    description:
      "Practical advice on improving at guitar: practice the hard part rather than the whole song, work slowly, and keep sessions short and frequent.",
    url: "/guides/how-to-get-better-at-guitar",
    authors: [AUTHOR.name],
  },
};

export default function Page() {
  return (
    <GuidePage
      slug="how-to-get-better-at-guitar"
      title="How to get better at guitar"
      intro={
        <>
          Most advice on this is a list of twenty things, all of them true and
          none of them ranked. This is shorter and ordered, starting with the
          change that makes the largest difference to most players.
        </>
      }
    >
      <h2>Stop playing songs from the top</h2>
      <p>
        This is the single biggest change available to most intermediate
        players. The default practice session is: start the song, play until
        the difficult part, make a mess of it, go back to the beginning.
      </p>
      <p>
        Count the repetitions in that. You play the easy opening twenty times
        and the hard bar twice, badly. Your practice time is being spent almost
        entirely on material you already know.
      </p>
      <p>
        Instead, find the two bars that fail and work on those alone. Ten
        minutes on the hard bar is worth an hour of running the song. The
        method is in{" "}
        <Link href="/guides/how-to-practice-a-difficult-passage">
          how to practice a difficult passage
        </Link>
        .
      </p>

      <h2>Practice slower than feels reasonable</h2>
      <p>
        Everyone knows they should practice slowly. Almost nobody practices
        slowly enough, because a genuinely slow tempo feels like it cannot be
        productive.
      </p>
      <p>
        The test is not how the tempo feels, it is whether you play accurately.
        If you are making mistakes, it is too fast, and this remains true no
        matter how slow that turns out to be. Speed comes from accumulated
        correct repetitions, and there is no route to it through inaccurate
        fast ones.
      </p>

      <h2>Short and daily beats long and occasional</h2>
      <p>
        Twenty minutes a day will take you further than three hours on Sunday.
        The consolidation that turns conscious effort into automatic movement
        happens between sessions, so more sessions means more consolidation.
      </p>
      <p>
        It is also the difference between a habit and an event. Twenty minutes
        is short enough to do on a bad day, which is what makes it survive
        contact with an actual week.
      </p>

      <h2>Know what you are working on before you sit down</h2>
      <p>
        Sessions without a target become playing rather than practicing.
        Playing is worth doing and it is not the same activity, and confusing
        the two is why some people practice for years without improving much.
      </p>
      <p>
        A target should be specific enough to fail: &ldquo;get bars 17 to 20
        clean at 80 percent&rdquo; rather than &ldquo;work on the
        solo&rdquo;.
      </p>

      <h2>Record yourself, occasionally</h2>
      <p>
        Playing and listening critically are hard to do simultaneously. A
        recording separates them, and it is reliably uncomfortable: timing
        problems and inconsistent tone are far more audible on playback than
        they are from behind the instrument.
      </p>
      <p>
        Once a month is enough. It is a diagnostic tool, not a practice
        activity.
      </p>

      <h2>Learn things by ear sometimes</h2>
      <p>
        Tab is efficient and it outsources the listening. Working something out
        by ear, even something simple, builds the connection between hearing
        and finding that eventually lets you play what you imagine.
      </p>
      <p>
        Start small: a bass line, a vocal melody, a two bar riff. The method is
        in{" "}
        <Link href="/guides/how-to-learn-a-song-by-ear">
          how to learn a song by ear
        </Link>
        .
      </p>

      <h2>Use the recording as your teacher</h2>
      <p>
        When you are learning from a video or a track, being able to slow it
        down and repeat one part changes what is possible to learn from it. A
        run that is a blur at full speed is a series of individual notes at
        half.
      </p>
      <p>
        <Link href="/">PhraseLoop</Link> exists for this: mark the passage, set
        the speed, and it repeats while you work on it. The pitch stays where
        it was, so what you hear at half speed is still in the original key.
      </p>

      <h2>Be patient with the plateau</h2>
      <p>
        Improvement is not linear. Long stretches of no apparent progress
        followed by sudden jumps is the normal shape, and the stretches are
        where the consolidation is happening.
      </p>
      <p>
        The players who get good are not the ones who improved steadily. They
        are the ones who kept practicing through the flat parts.
      </p>
    </GuidePage>
  );
}
