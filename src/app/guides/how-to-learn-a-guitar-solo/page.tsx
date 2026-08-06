import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/features/guides/guide-page";
import { AUTHOR } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "How to Learn a Guitar Solo (Without Giving Up Halfway)",
  description:
    "A practical method for learning a guitar solo: pick the right one, break it into phrases, slow each one down, and bring it back to tempo.",
  alternates: { canonical: "/guides/how-to-learn-a-guitar-solo" },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: "article",
    title: "How to Learn a Guitar Solo (Without Giving Up Halfway)",
    description:
      "A practical method for learning a guitar solo: pick the right one, break it into phrases, slow each one down, and bring it back to tempo.",
    url: "/guides/how-to-learn-a-guitar-solo",
    authors: [AUTHOR.name],
  },
};

export default function Page() {
  return (
    <GuidePage
      slug="how-to-learn-a-guitar-solo"
      title="How to learn a guitar solo"
      intro={
        <>
          Most people learn a solo by playing along with the record until the
          hard bit arrives, fumbling it, and starting again from the top. That
          is a lot of repetitions of the part you already know. Here is a
          method that spends the time where the difficulty actually is.
        </>
      }
    >
      <h2>Pick a solo you can nearly play</h2>
      <p>
        The most common reason people abandon a solo is that they chose one two
        or three years beyond their current playing. Ambition is not the
        problem, timescale is: a solo that takes six months of daily work will
        be dropped in week three.
      </p>
      <p>
        A good target is one where you can already play perhaps half the
        phrases at tempo, and the rest are recognisably difficult rather than
        impossible. You want a solo with two or three hard spots, not twenty.
      </p>

      <h2>Listen to it properly before you touch the guitar</h2>
      <p>
        Play the solo through several times without your instrument. You are
        listening for structure: where the phrases begin and end, which ideas
        repeat, where the player breathes. Most solos are far more repetitive
        than they sound, and spotting that early can halve the amount you
        actually have to learn.
      </p>
      <p>
        If you can hum the solo from memory, learning it on the instrument
        becomes a matter of finding notes you already know rather than
        discovering them one at a time.
      </p>

      <h2>Break it into phrases, not bars</h2>
      <p>
        Bars are a notation convenience. Phrases are how the music is actually
        built, and how your memory will store it. A phrase is usually two to
        four bars: a musical sentence with a beginning and an end.
      </p>
      <p>
        Work on one phrase at a time and finish it before moving on. Learning
        the whole solo badly is slower than learning a third of it properly,
        because everything you play badly has to be unlearned later.
      </p>

      <h2>Slow the phrase down until it is easy</h2>
      <p>
        This is the step people skip, and it is the one that does the work.
        Take the phrase and slow it to the point where you can play it
        accurately with no hesitation. For most players and most solos that is
        somewhere around half speed, and for a genuinely fast run it can be
        slower still.
      </p>
      <p>
        Playing it slowly is not a lesser version of playing it fast. It is how
        the movement gets encoded. If you cannot play it cleanly slowly, you
        cannot play it cleanly quickly, you can only play it quickly and
        approximately.
      </p>
      <p>
        This is what{" "}
        <Link href="/">PhraseLoop</Link> was built for: mark the start and end
        of the phrase, drop the speed as far as you need, and it repeats on its
        own so you can keep both hands on the guitar. Point it at whatever
        video or recording you are learning from.
      </p>

      <h2>Raise the tempo in small steps</h2>
      <p>
        Once the phrase is clean three times in a row, raise the speed a
        little. Ten percent is a sensible step. Play it again until it is clean
        three times, then raise it again.
      </p>
      <p>
        When a step goes wrong, go back one level rather than pushing through.
        Practicing a phrase you cannot yet play at that tempo teaches your
        hands to make the mistake reliably. There is more on the mechanics of
        this in{" "}
        <Link href="/guides/how-to-practice-slowly-and-speed-up">
          how to practice slowly and speed up
        </Link>
        .
      </p>

      <h2>Join the phrases back together</h2>
      <p>
        Learning phrases separately creates a specific problem: the joins. You
        can play phrase one and phrase two, and fall apart in the half second
        between them.
      </p>
      <p>
        Fix it by practicing the join itself. Loop from the last two notes of
        one phrase into the first two of the next, and nothing else. It feels
        absurdly narrow, and it is much faster than running the whole solo and
        hoping.
      </p>

      <h2>Play it slightly faster than the record</h2>
      <p>
        When the solo is comfortable at tempo, spend a few minutes above it.
        Coming back to the original speed afterwards buys you headroom, and a
        solo that feels slightly easy is one you can still play when you are
        nervous or the drummer rushes.
      </p>

      <h2>How long it should take</h2>
      <p>
        A moderately difficult solo, worked this way for twenty minutes a day,
        usually comes together in one to two weeks. The first two days feel
        slow because you are working on small fragments and have nothing that
        sounds like the solo yet. That is the method working, not failing.
      </p>
    </GuidePage>
  );
}
