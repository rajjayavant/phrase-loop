"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { getLastVideoId } from "@/features/session/session-storage";
import { DEFAULT_VIDEO_ID } from "@/lib/youtube/default-video";

/**
 * The app root is the loader itself — there is no separate marketing landing
 * page. On arrival we send the user straight into the practice workspace:
 *   - their most recently used video, if they have one, or
 *   - the default sample video otherwise.
 *
 * The redirect runs on the client because the "last used video" lives in
 * localStorage. A brief branded splash covers the hop so there is no flash.
 */
export default function RootPage() {
  const router = useRouter();

  React.useEffect(() => {
    const target = getLastVideoId() ?? DEFAULT_VIDEO_ID;
    router.replace(`/practice?v=${target}`);
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5">
      <div className="animate-[rise-in_500ms_var(--ease-emphasized)]">
        <Wordmark size="lg" />
      </div>
      <div className="flex items-center gap-2 text-small-body text-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
        Tuning your practice space…
      </div>
      <span className="sr-only" role="status">
        Loading PhraseLoop
      </span>

      {/* The root redirects into /practice within a frame or two, so a human
          rarely reads this. It matters for anything that does NOT run the
          redirect — crawlers, and ad-network reviewers — which would otherwise
          see a splash screen with no content and no policy links at all. */}
      <nav
        aria-label="Site"
        className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-6 text-helper text-muted"
      >
        <Link href="/about" className="hover:text-secondary">
          About
        </Link>
        <Link href="/privacy" className="hover:text-secondary">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-secondary">
          Terms of Service
        </Link>
        <Link href="/contact" className="hover:text-secondary">
          Contact
        </Link>
      </nav>
    </div>
  );
}
