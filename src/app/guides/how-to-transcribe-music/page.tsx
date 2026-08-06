import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/features/guides/guide-page";
import { AUTHOR } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "How to Transcribe Music | Getting a Part Off a Recording",
  description:
    "A working method for transcribing: what order to do it in, how to handle fast passages, and the tools that make it bearable.",
  alternates: { canonical: "/guides/how-to-transcribe-music" },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: "article",
    title: "How to Transcribe Music | Getting a Part Off a Recording",
    description:
      "A working method for transcribing: what order to do it in, how to handle fast passages, and the tools that make it bearable.",
    url: "/guides/how-to-transcribe-music",
    authors: [AUTHOR.name],
  },
};

export default function Page() {
  return (
    <GuidePage
      slug="how-to-transcribe-music"
      title="How to transcribe music"
      intro={
        <>
          Transcribing is learning by ear with the extra step of writing it
          down. That step changes the process: you need not just the notes but
          the rhythm, precisely enough to notate. Here is an order of work that
          keeps it tractable.
        </>
      }
    >
      <h2>Decide how exact you need to be</h2>
      <p>
        A lead sheet for yourself and a note-for-note transcription for
        publication are different jobs. Deciding which you are doing prevents a
        great deal of wasted effort.
      </p>
      <p>
        For most practical purposes, chords and melody with approximate rhythm
        is enough, and takes a fraction of the time. Reserve full detail for
        material where the articulation is the point, like a solo you are
        studying.
      </p>

      <h2>Map the form before any notes</h2>
      <p>
        Listen through and write down the sections and their lengths: intro
        eight bars, verse sixteen, chorus eight. Do this before transcribing
        anything.
      </p>
      <p>
        You will usually find large parts of the piece repeat exactly, which
        means the actual transcription work is much smaller than the duration
        of the track suggests. It also stops you from discovering in hour three
        that the second verse was identical to the first.
      </p>

      <h2>Get the harmony down next</h2>
      <p>
        Work out the bass note of each bar, then whether the chord above it is
        major, minor, or something else. This gives you a frame that constrains
        every melodic decision afterwards.
      </p>
      <p>
        The approach is the same one described in{" "}
        <Link href="/guides/how-to-learn-a-song-by-ear">
          how to learn a song by ear
        </Link>
        , which covers finding the key and working in short sections.
      </p>

      <h2>Then the melody, in two passes</h2>
      <p>
        First pass, get the pitches. Second pass, fix the rhythm. Trying to
        capture both at once is where transcription usually stalls, because
        each one requires a different kind of attention.
      </p>
      <p>
        For rhythm, count out loud along with the recording while it plays
        slowly. Rhythms that are ambiguous at tempo are usually obvious at half
        speed, particularly the difference between a triplet and a dotted
        figure.
      </p>

      <h2>Slow down anything you cannot hear</h2>
      <p>
        This is the whole technical difficulty of transcribing, and it is
        solved. A fast run contains notes that are perfectly identifiable at
        half or quarter speed, and modern playback preserves the pitch when you
        slow it, so what you hear stays in the original key.
      </p>
      <p>
        The two things that make this workable in practice are looping a short
        section so it repeats while you work, and being able to change speed
        without losing your place.{" "}
        <Link href="/">PhraseLoop</Link> does both, and works with a YouTube
        link or an audio file from your own machine, which matters when the
        recording you are transcribing is not online.
      </p>

      <h2>Check by playing along</h2>
      <p>
        Play your transcription against the recording at reduced speed. Errors
        that are invisible on paper are obvious when your version and the
        original sound simultaneously.
      </p>
      <p>
        Do this section by section as you go rather than at the end. A mistake
        caught immediately costs a minute; the same mistake found after you
        have written the next thirty bars around it costs considerably more.
      </p>

      <h2>Notate what is played, then decide what to keep</h2>
      <p>
        Real performances are full of small deviations: notes slightly ahead of
        the beat, a bend that does not quite reach, an implied rather than
        stated rhythm. Transcribing every one produces something unreadable.
      </p>
      <p>
        Write what you hear first, then simplify deliberately for whoever will
        read it. The simplification is an editorial decision, and it is better
        made knowingly than by failing to hear the detail.
      </p>
    </GuidePage>
  );
}
