"use client";

import * as React from "react";
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
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <Wordmark size="lg" />
      <p className="text-small-body text-muted">Opening your practice space…</p>
      <span className="sr-only" role="status">
        Loading Looper
      </span>
    </div>
  );
}
