import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/features/guides/guide-page";
import { AUTHOR } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "Does Slowing Down a Video Change the Pitch?",
  description:
    "Short answer: no, not in a modern browser or on YouTube. Here is why the pitch stays put, when it does shift, and what that means for practicing.",
  alternates: {
    canonical: "/guides/does-slowing-down-a-video-change-the-pitch",
  },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: "article",
    title: "Does Slowing Down a Video Change the Pitch?",
    description:
      "Short answer: no, not in a modern browser or on YouTube. Here is why the pitch stays put, when it does shift, and what that means for practicing.",
    url: "/guides/does-slowing-down-a-video-change-the-pitch",
    authors: [AUTHOR.name],
  },
};

export default function Page() {
  return (
    <GuidePage
      slug="does-slowing-down-a-video-change-the-pitch"
      title="Does slowing down a video change the pitch?"
      intro={
        <>
          <strong>No.</strong> On YouTube and in every current browser, slowing
          a video down keeps the audio at its original pitch. A song at half
          speed is slower but still in the same key. That was not always true,
          and the reason it is true now is worth understanding if you practice
          from recordings.
        </>
      }
    >
      <h2>Why it used to change</h2>
      <p>
        With tape or vinyl, speed and pitch are the same physical quantity.
        Playing a record at half its intended speed halves every frequency,
        which drops the pitch by an octave. Everyone recognises the effect.
      </p>
      <p>
        Early digital playback worked the same way, because the simplest way to
        slow audio is to play the samples more slowly, which stretches the
        waveform and lowers the pitch along with it. That approach is called
        resampling.
      </p>

      <h2>What changed</h2>
      <p>
        Modern players use time stretching instead. Rather than slowing the
        waveform, the software breaks the audio into very short segments and
        repeats or overlaps them to fill the extra time. The frequencies inside
        each segment are untouched, so the pitch stays where it was while the
        duration grows.
      </p>
      <p>
        In browsers this is controlled by a property called{" "}
        <strong>preservesPitch</strong>, and it{" "}
        <strong>defaults to true</strong>. You get pitch correction without
        asking for it. YouTube applies the same correction in its own player.
      </p>

      <h2>So when does the pitch still shift?</h2>
      <ul>
        <li>
          When software deliberately turns pitch correction off. Some audio
          editors expose this as a choice, because resampling is occasionally
          what you want.
        </li>
        <li>
          On physical media, for the reason above.
        </li>
        <li>
          In tools that offer pitch shifting as a separate feature, changing
          the key without changing the speed. That is the same technology
          applied to the other axis.
        </li>
      </ul>

      <h2>What it costs</h2>
      <p>
        Time stretching is not free. Because it works by splicing short
        segments together, extreme settings introduce artefacts: a slight
        smearing or warbling, most audible on sustained notes and cymbals.
      </p>
      <p>
        Between about 0.5x and 1.5x it is usually inaudible. At a quarter speed
        it is noticeable but perfectly usable for working out notes. Below
        that, quality degrades in every tool, because the algorithm is being
        asked to invent a great deal of audio that was never recorded.
      </p>

      <h2>Why this matters for practicing</h2>
      <p>
        It is the reason slow practice from a recording works at all. If
        slowing a track dropped it a fourth or a fifth, you could not play
        along with it, and you could not use it to work out notes, because
        every pitch you heard would be wrong.
      </p>
      <p>
        Because pitch is preserved, you can take a solo to half speed, find the
        notes, and play them on your instrument in the actual key of the
        recording. That is the whole basis of learning by ear from slowed
        audio, covered in{" "}
        <Link href="/guides/how-to-learn-a-song-by-ear">
          how to learn a song by ear
        </Link>
        .
      </p>

      <h2>Trying it</h2>
      <p>
        <Link href="/">PhraseLoop</Link> plays anywhere from a quarter speed to
        double, with pitch preserved throughout, and loops whatever section you
        mark. Point it at a song you know well and drop it to 0.5x: the tempo
        halves and the key does not move.
      </p>
    </GuidePage>
  );
}
