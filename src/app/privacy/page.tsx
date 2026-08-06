import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — PhraseLoop",
  description:
    "How PhraseLoop handles your data: no accounts, no uploads, no tracking of your practice. Files you open stay on your device. Details on browser storage, analytics, and embeds.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    title: "Privacy Policy — PhraseLoop",
    description:
      "How PhraseLoop handles your data: no accounts, no uploads, no tracking of your practice. Files you open stay on your device. Details on browser storage, analytics, and embeds.",
    url: "/privacy",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" meta="Last updated 5 August 2026">
      <p>
        This policy explains what PhraseLoop (&ldquo;the Service&rdquo;,
        phraseloop.online) does and does not collect. It is written to be read,
        not to be skimmed past.
      </p>

      <h2>The short version</h2>
      <ul>
        <li>There are no accounts, and we do not ask for your name or email.</li>
        <li>
          Video and audio files you open are never uploaded. They are read by
          your browser and stay on your device.
        </li>
        <li>
          Your practice settings are stored in your own browser, not on our
          servers.
        </li>
        <li>
          YouTube videos play through YouTube&apos;s embedded player, so
          Google&apos;s own privacy terms apply to that playback.
        </li>
      </ul>

      <h2>Information we collect</h2>
      <p>
        <strong>We do not collect personal information.</strong> The Service has
        no sign-up, no login, and no user profiles. We do not ask for your name,
        email address, phone number, or payment details, because nothing in the
        Service requires them.
      </p>
      <p>
        Like virtually all websites, our hosting provider records standard
        server logs when a page is requested. These may include your IP address,
        browser type, and the time of the request. They are used to keep the
        site running and secure, and are not used to build a profile of you.
      </p>

      <h2>Files you open</h2>
      <p>
        When you open a video or audio file from your device, that file is
        <strong> not uploaded to any server</strong>. Your browser reads it
        locally and stores it in your browser&apos;s own IndexedDB storage
        (database <code>looper</code>) so that reloading the page does not lose
        your work. It never leaves your machine, and we cannot access it.
      </p>
      <p>
        Because the file lives only in that browser, a shared link to a local
        file will not open for anyone else — by design.
      </p>

      <h2>Browser storage</h2>
      <p>
        The Service stores your practice settings in your browser&apos;s
        localStorage so a video reopens the way you left it. This includes loop
        markers, playback speed, volume, and which video you last opened, under
        keys beginning <code>looper:</code>.
      </p>
      <p>
        This data stays in your browser. It is not transmitted to us and is not
        shared with anyone. You can erase all of it at any time by clearing site
        data for phraseloop.online in your browser settings.
      </p>

      <h2>Instagram embeds</h2>
      <p>
        The author page embeds a few Instagram posts. Those embeds load
        directly from Instagram, which means Instagram and Meta can see that
        your browser requested them and may set their own cookies, in the same
        way as if you had opened the posts on Instagram. No other page on this
        site loads anything from Instagram.
      </p>
      <p>
        That processing is outside our control and is governed by{" "}
        <a
          href="https://privacycenter.instagram.com/policy"
          target="_blank"
          rel="noreferrer noopener"
        >
          Instagram&rsquo;s privacy policy
        </a>
        . Blocking third-party scripts stops the embeds loading; the rest of
        the page still works, and each embed falls back to a plain link.
      </p>

      <h2>YouTube embedded player</h2>
      <p>
        YouTube videos are played using the official YouTube IFrame Player API.
        When you load a YouTube video, your browser communicates directly with
        YouTube and Google, who may set their own cookies and collect data
        according to their policies — exactly as if you were watching on
        YouTube itself.
      </p>
      <p>
        That processing is outside our control. It is governed by the{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noreferrer noopener"
        >
          Google Privacy Policy
        </a>{" "}
        and the{" "}
        <a
          href="https://www.youtube.com/t/terms"
          target="_blank"
          rel="noreferrer noopener"
        >
          YouTube Terms of Service
        </a>
        . We do not download, copy, or re-host any YouTube content.
      </p>

      <h2>Advertising</h2>
      <p>
        We may display advertising provided by Google AdSense to help cover
        running costs. Where we do:
      </p>
      <ul>
        <li>
          Third-party vendors, including Google, use cookies to serve ads based
          on your prior visits to this and other websites.
        </li>
        <li>
          Google&apos;s use of advertising cookies enables it and its partners
          to serve ads to you based on your visit to this and other sites.
        </li>
        <li>
          You can opt out of personalised advertising by visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noreferrer noopener"
          >
            Google Ads Settings
          </a>
          , or opt out of third-party vendor cookies at{" "}
          <a
            href="https://www.aboutads.info/choices/"
            target="_blank"
            rel="noreferrer noopener"
          >
            aboutads.info/choices
          </a>
          .
        </li>
      </ul>

      <h2>Analytics</h2>
      <p>
        We use Google Analytics 4 to understand how the site is used: which
        pages are visited, roughly where visitors come from, and which browsers
        and devices we need to support. It sets cookies in your browser and
        sends Google your approximate location, device and browser details, and
        the pages you view. Google processes this on our behalf.
      </p>
      <p>
        We do not send Google anything you type into the app. Video links,
        marker positions, playback speeds, and uploaded files are not part of
        what analytics collects.
      </p>
      <p>
        You can opt out with Google&rsquo;s{" "}
        <a
          href="https://tools.google.com/dlpage/gaoptout"
          target="_blank"
          rel="noopener noreferrer"
        >
          browser add-on
        </a>
        , or by blocking analytics cookies in your browser or an extension. The
        app works exactly the same either way.
      </p>

      <h2>Children</h2>
      <p>
        The Service is not directed at children under 13, and we do not
        knowingly collect personal information from them. Since we do not
        collect personal information from anyone, there is nothing of a
        child&apos;s to delete — but if you have a concern, please get in touch.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          <strong>Clear your data.</strong> Clearing site data for
          phraseloop.online in your browser removes every setting and cached
          file the Service has stored.
        </li>
        <li>
          <strong>Block cookies.</strong> The practice tool itself works with
          third-party cookies blocked, though the YouTube player may not.
        </li>
      </ul>

      <h2>Changes to this policy</h2>
      <p>
        If this policy changes materially, the date at the top of this page will
        be updated. Continuing to use the Service after a change means you
        accept the revised policy.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy are welcome — see the{" "}
        <Link href="/contact">contact page</Link>.
      </p>
    </LegalPage>
  );
}
