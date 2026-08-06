import type { Metadata } from "next";
import Link from "next/link";
import { GuidePage } from "@/features/guides/guide-page";
import { AUTHOR } from "@/features/guides/guides";

export const metadata: Metadata = {
  title: "How to Loop a Section of a YouTube Video",
  description:
    "YouTube's built in loop repeats the whole video. Here is how to repeat just one part of it, with exact start and end points.",
  alternates: {
    canonical: "/guides/how-to-loop-a-section-of-a-youtube-video",
  },
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  openGraph: {
    type: "article",
    title: "How to Loop a Section of a YouTube Video",
    description:
      "YouTube's built in loop repeats the whole video. Here is how to repeat just one part of it, with exact start and end points.",
    url: "/guides/how-to-loop-a-section-of-a-youtube-video",
    authors: [AUTHOR.name],
  },
};

export default function Page() {
  return (
    <GuidePage
      slug="how-to-loop-a-section-of-a-youtube-video"
      title="How to loop a section of a YouTube video"
      intro={
        <>
          YouTube has a loop feature, and it repeats the entire video. If you
          want one part to repeat, a chorus, a solo, a phrase in a language
          lesson, you need something else. Here is what YouTube does, what it
          does not do, and how to get a section on repeat.
        </>
      }
    >
      <h2>What YouTube&rsquo;s own loop does</h2>
      <p>
        On desktop, right click inside the video player and choose{" "}
        <strong>Loop</strong>. The video repeats continuously from the
        beginning. For a playlist, open the playlist panel and click Loop
        there.
      </p>
      <p>
        That is the whole feature. There is no way to set a start and end
        point, so it repeats the entire video every time. Useful for putting a
        song on repeat, no use at all for the four bars you are trying to
        learn.
      </p>

      <h2>The URL parameter approach, and why it disappoints</h2>
      <p>
        You will find advice suggesting <strong>&amp;start=</strong> and{" "}
        <strong>&amp;end=</strong> parameters on the video URL. These do work
        for setting where playback begins and ends, but they do not loop. When
        playback reaches the end point it stops, and you refresh the page to go
        again.
      </p>
      <p>
        That is manual repetition with extra steps, and it breaks the thing
        that makes looping useful, which is not having to touch anything
        between repetitions.
      </p>

      <h2>Looping a section properly</h2>
      <p>
        To repeat one part you need a player that accepts two markers and
        returns to the first when it reaches the second.{" "}
        <Link href="/">PhraseLoop</Link> does exactly that:
      </p>
      <ol>
        <li>Paste the YouTube link.</li>
        <li>
          Play up to the start of the section and press <kbd>A</kbd>.
        </li>
        <li>
          Play to the end of it and press <kbd>B</kbd>.
        </li>
        <li>
          Press <kbd>L</kbd> to turn the loop on.
        </li>
      </ol>
      <p>
        The section now repeats on its own. Both markers can be moved
        afterwards without losing your place, and you can change the playback
        speed while it is looping, which is the reason most people want this in
        the first place.
      </p>

      <h2>Does it work on mobile?</h2>
      <p>
        The web tool works in a mobile browser, so you can set markers and loop
        a section on a phone or tablet. YouTube&rsquo;s own app loop, like the
        desktop one, still only repeats whole videos.
      </p>

      <h2>Sharing a looped section</h2>
      <p>
        A useful side effect of markers living in the address bar: copying the
        link and sending it opens the same video at the same section for
        whoever receives it. That is how a teacher points a student at one
        specific bar rather than saying &ldquo;around three minutes in&rdquo;.
      </p>

      <h2>Slowing the section down</h2>
      <p>
        Looping and slowing usually go together, because the reason a passage
        needs repeating is that it is too fast to absorb. Playback speed goes
        down to a quarter of the original and the pitch is preserved, so the
        music stays in the same key. There is more in{" "}
        <Link href="/guides/how-to-slow-down-a-youtube-video">
          how to slow down a YouTube video
        </Link>
        .
      </p>

      <h2>Browser extensions</h2>
      <p>
        Extensions exist that add section looping to YouTube itself. They work,
        with two trade-offs: they only run in the browser you installed them
        in, and they require granting an extension access to your browsing.
        A web page requires neither, which is the reason this one exists.
      </p>
    </GuidePage>
  );
}
