import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/features/guides/guide-page";
import { AUTHOR } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "How to Learn a Song by Ear | A Practical Method",
  description:
    "Working a part out from a recording without tab: what to listen for first, how to find the key, and how to handle the parts that move too fast to hear.",
  alternates: { canonical: "/guides/how-to-learn-a-song-by-ear" },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: "article",
    title: "How to Learn a Song by Ear | A Practical Method",
    description:
      "Working a part out from a recording without tab: what to listen for first, how to find the key, and how to handle the parts that move too fast to hear.",
    url: "/guides/how-to-learn-a-song-by-ear",
    authors: [AUTHOR.name],
  },
};

export default function Page() {
  return (
    <GuidePage
      slug="how-to-learn-a-song-by-ear"
      title="How to learn a song by ear"
      intro={
        <>
          Learning by ear has a reputation as a talent you either have or do
          not. It is a procedure. The players who are good at it are not
          hearing something you cannot, they are working through the recording
          in an order that makes each step easier than the last.
        </>
      }
    >
      <h2>Start with the bass, not the melody</h2>
      <p>
        The bass line tells you the harmony, and the harmony narrows down
        everything else. Once you know a bar is sitting on a G, the melody
        notes over it are far easier to place, because most of them will belong
        to that chord or the scale around it.
      </p>
      <p>
        Starting with the melody means guessing at notes with no context. It is
        the hardest possible entry point, and it is where most people start.
      </p>

      <h2>Find the key first</h2>
      <p>
        Play the song and hum whichever note feels like home. That is usually
        the root. Find it on your instrument, then work out whether the third
        above it sounds major or minor.
      </p>
      <p>
        With the key established you have narrowed the likely notes from twelve
        to seven, and the likely chords to a handful. Most popular music stays
        inside that set for long stretches, so a large part of the work is now
        recognising which of six or seven options you are hearing rather than
        identifying a note from nothing.
      </p>

      <h2>Work in short sections</h2>
      <p>
        Take two bars at a time. Not a verse, not a phrase you find musically
        satisfying: a chunk short enough to hold in your head accurately.
      </p>
      <p>
        Play the section, sing it back, then find it on the instrument. The
        singing step matters. If you cannot sing it you have not really heard
        it, and playing it will be guesswork with an instrument in the way.
      </p>

      <h2>Slow down the parts that move too fast</h2>
      <p>
        A run that goes past in half a second contains notes you can absolutely
        identify at half speed. This is where by-ear work either becomes
        possible or gets abandoned.
      </p>
      <p>
        Slow the recording rather than trying harder. Modern playback keeps the
        pitch where it was when you change the speed, so the notes stay in the
        same key and stay identifiable. If you want the detail on why, see{" "}
        <Link href="/guides/does-slowing-down-a-video-change-the-pitch">
          does slowing down a video change the pitch
        </Link>
        .
      </p>
      <p>
        <Link href="/">PhraseLoop</Link> is built for this part: mark the two
        bars, drop to half speed or slower, and let it repeat while you hunt
        for the notes. The loop keeps going so you are not restarting the
        passage every few seconds.
      </p>

      <h2>Repetition is the tool, not a sign of failure</h2>
      <p>
        Hearing a phrase twenty times is normal. Each pass you pick up
        something the previous one missed: first the contour, then the rhythm,
        then the actual notes, then the articulation.
      </p>
      <p>
        This is why looping matters more than any other single feature for
        ear work. Manually rewinding twenty times is tedious enough that most
        people stop after five and settle for approximately right.
      </p>

      <h2>Check your answer against the recording</h2>
      <p>
        When you think you have a section, play it along with the track at slow
        speed. Wrong notes are obvious when they are sounding at the same time
        as the correct ones, and almost impossible to spot when you play your
        version afterwards from memory.
      </p>

      <h2>Expect it to get faster</h2>
      <p>
        The first song is slow. The tenth is much faster, because you have
        started to recognise patterns rather than deducing each one: common
        chord movements, standard bass shapes, the intervals that turn up
        constantly in the style you play.
      </p>
      <p>
        That accumulated pattern recognition is what people mean when they say
        someone has a good ear. It is built, and this is how it gets built.
      </p>
    </GuidePage>
  );
}
