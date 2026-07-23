"use client";

import * as React from "react";
import Link from "next/link";
import { usePlayerMount, type AdapterKind } from "../hooks/use-player-mount";
import { usePlayheadClock } from "../hooks/use-playhead";
import { usePlayerStore } from "../stores/player-store";
import { PlayerSurface } from "./player-surface";
import { TransportControls } from "./transport-controls";
import { Timeline } from "@/features/loop/components/timeline";
import { SpeedRow } from "./speed-row";
import { AdvancedSettings } from "./advanced-settings";
import { PracticeHeader } from "./practice-header";
import { useKeyboardShortcuts } from "@/features/shortcuts/use-keyboard-shortcuts";
import { useSessionSync } from "@/features/session/use-session-sync";
import { useUrlSync } from "@/features/session/use-url-sync";
import {
  loadSession,
  setLastVideoId,
} from "@/features/session/session-storage";
import { announce } from "@/features/session/announcer";

export interface PracticeWorkspaceProps {
  videoId: string;
  initialA: number | null;
  initialB: number | null;
  initialSpeed: number | null;
  initialLoop: boolean | null;
  adapterKind: AdapterKind;
}

/**
 * The main practice instrument. Composes the player surface, timeline,
 * transport, loop/marker/speed controls, and wires the shared behaviors
 * (keyboard, session, URL sync). One integrated unit — not a dashboard.
 */
export function PracticeWorkspace({
  videoId,
  initialA,
  initialB,
  initialSpeed,
  initialLoop,
  adapterKind,
}: PracticeWorkspaceProps) {
  // Seed the store exactly once, before mount, with this precedence:
  //   1. Markers in the URL (a shared link) always win.
  //   2. Otherwise a previously saved session for this video is restored
  //      silently, so returning users find their setup intact.
  //   3. Otherwise this is a fresh video: arm a whole-clip A→B loop (A at the
  //      start, B at the end, looping on) once the duration is known.
  React.useState(() => {
    const store = usePlayerStore.getState();

    if (initialA != null || initialB != null) {
      store.hydrate({
        markerA: initialA,
        markerB: initialB,
        loopEnabled: initialLoop ?? true,
        requestedSpeed: initialSpeed ?? 1,
      });
      return null;
    }

    const saved = loadSession(videoId);
    if (
      saved &&
      (saved.markerA != null ||
        saved.markerB != null ||
        saved.requestedSpeed !== 1)
    ) {
      store.hydrate({
        markerA: saved.markerA,
        markerB: saved.markerB,
        loopEnabled: saved.loopEnabled,
        requestedSpeed: saved.requestedSpeed,
        volume: saved.volume,
        muted: saved.muted,
        nudgePrecision: saved.nudgePrecision,
        timelineMode: saved.timelineMode,
      });
      announce("Your previous practice settings were restored");
      return null;
    }

    // Fresh video → whole-clip loop by default.
    if (initialSpeed != null) {
      store.hydrate({ requestedSpeed: initialSpeed });
    }
    store.requestWholeClipLoop();
    return null;
  });

  // Remember this as the most recently used video immediately, so a later
  // visit to "/" reopens it even before any session-sync debounce fires.
  React.useEffect(() => {
    setLastVideoId(videoId);
  }, [videoId]);

  const { containerRef } = usePlayerMount({ videoId, kind: adapterKind });
  usePlayheadClock();
  useKeyboardShortcuts();
  useSessionSync(videoId);
  useUrlSync(videoId);

  return (
    <div className="flex min-h-dvh flex-col">
      <PracticeHeader />

      {/* Single centered column: video → timeline → transport → speed → advanced */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 pb-28 sm:px-5 lg:pb-8">
        <PlayerSurface containerRef={containerRef} />
        <Timeline />

        {/* Transport is inline on desktop; a fixed dock on mobile (below). */}
        <div className="hidden rounded-card border border-border bg-surface p-3 lg:block">
          <TransportControls />
        </div>

        <SpeedRow />
        <AdvancedSettings />
      </main>

      {/* Mobile transport dock */}
      <div className="bg-surface/95 fixed inset-x-0 bottom-0 z-40 border-t border-border px-3 py-2.5 backdrop-blur lg:hidden">
        <TransportControls />
      </div>

      <MobileFallbackFooter />
    </div>
  );
}

function MobileFallbackFooter() {
  return (
    <p className="sr-only">
      <Link href="/">Return to Looper home</Link>
    </p>
  );
}
