import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "About PhraseLoop — Why This Practice Tool Exists",
  description:
    "PhraseLoop is a free practice tool for musicians: mark a passage of a video or audio file, slow it down, and loop it until it feels natural. Built by a working engineer and musician.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <LegalPage title="About PhraseLoop">
      <p>
        PhraseLoop is a free practice tool for musicians. You mark the start and
        end of a passage, slow it down if you need to, and it loops that section
        cleanly until your hands catch up. It works with any YouTube video, or
        with a video or audio file from your own device.
      </p>

      <h2>Why it exists</h2>
      <p>
        Learning a difficult phrase means hearing it many times in a row. Doing
        that with an ordinary video player is genuinely tedious: you drag the
        progress bar back, overshoot, drag again, miss the start, and repeat.
        Most of the session goes on scrubbing rather than playing.
      </p>
      <p>
        This tool removes that. Set the two markers once and the passage repeats
        on its own, at whatever tempo you can actually play it, for as long as
        you want. When it gets comfortable you nudge the speed back up.
      </p>

      <h2>What it does</h2>
      <ul>
        <li>
          <strong>A–B looping.</strong> Mark any two points and the section
          repeats continuously.
        </li>
        <li>
          <strong>Speed control.</strong> Slow a passage down to learn it, then
          bring it back to tempo.
        </li>
        <li>
          <strong>Any source.</strong> Paste a YouTube link, or open a video or
          audio file from your own device.
        </li>
        <li>
          <strong>Shareable links.</strong> A practice link opens on the exact
          passage, at the exact speed — useful for teachers setting work.
        </li>
        <li>
          <strong>Keyboard-first.</strong> Every control has a shortcut, so you
          can keep your hands near your instrument.
        </li>
        <li>
          <strong>It remembers.</strong> Your markers, speed, and loop settings
          come back when you reopen a video.
        </li>
      </ul>

      <h2>How it works</h2>
      <p>
        YouTube videos play through YouTube&apos;s official embedded player, so
        views count for the creator and nothing is downloaded, copied, or
        re-hosted. Files you open from your own device are read directly by your
        browser and never uploaded anywhere — they stay on your machine.
      </p>

      <h2>Who made it</h2>
      <p>
        PhraseLoop was built by Raj Jayavant, a software engineer who plays
        music and got tired of rewinding the same four bars. It started as a
        tool for personal practice and was made public because the problem
        turned out to be universal.
      </p>
      <p>
        It is free, has no accounts, and shows no ads on the practice screen.
        If it saves you a session, the best thanks is sending it to another
        player.
      </p>

      <h2>Get in touch</h2>
      <p>
        Bug reports, feature requests, and general feedback are all welcome —
        see the <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
