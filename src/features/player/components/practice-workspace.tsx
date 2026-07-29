"use client";

import * as React from "react";
import Link from "next/link";
import { usePlayerMount } from "../hooks/use-player-mount";
import { usePlayheadClock } from "../hooks/use-playhead";
import { usePlayerStore } from "../stores/player-store";
import {
  useLocalSourceStore,
  loadCachedFile,
} from "../stores/local-source";
import { PlayerSurface } from "./player-surface";
import { isAudioFile } from "../adapters/local-file-adapter";
import { TransportControls } from "./transport-controls";
import { Timeline } from "@/features/loop/components/timeline";
import { SpeedRow } from "./speed-row";
import { AdvancedSettings } from "./advanced-settings";
import { PracticeHeader } from "./practice-header";
import { LocalSourceMissing } from "./local-source-missing";
import { useKeyboardShortcuts } from "@/features/shortcuts/use-keyboard-shortcuts";
import { useSessionSync } from "@/features/session/use-session-sync";
import { useUrlSync } from "@/features/session/use-url-sync";
import {
  loadSession,
  setLastVideoId,
} from "@/features/session/session-storage";
import { announce } from "@/features/session/announcer";

export type PracticeSource = "youtube" | "mock" | "local";

export interface PracticeWorkspaceProps {
  source: PracticeSource;
  /** YouTube id (youtube/mock sources). */
  videoId?: string;
  /** Local source id (local source). */
  localId?: string;
  initialA: number | null;
  initialB: number | null;
  initialSpeed: number | null;
  initialLoop: boolean | null;
}

/**
 * The main practice instrument. Composes the player surface, timeline,
 * transport, loop/marker/speed controls, and wires the shared behaviors
 * (keyboard, session, URL sync). One integrated unit — not a dashboard.
 *
 * Source-agnostic: a YouTube id or a local file both render the exact same UX,
 * differing only in which adapter backs the player.
 */
export function PracticeWorkspace(props: PracticeWorkspaceProps) {
  if (props.source === "local") {
    return <LocalWorkspace {...props} />;
  }
  return <SourceWorkspace {...props} file={null} kind={props.source} />;
}

/**
 * Resolves the local file (from the in-memory store, else the IndexedDB cache)
 * before mounting the shared workspace. Shows a friendly picker if the file is
 * gone (e.g. cleared cache after a reload).
 */
function LocalWorkspace(props: PracticeWorkspaceProps) {
  const current = useLocalSourceStore((s) => s.current);
  const restore = useLocalSourceStore((s) => s.restore);
  const [status, setStatus] = React.useState<
    "resolving" | "ready" | "missing"
  >(current ? "ready" : "resolving");

  const localId = props.localId ?? "";

  React.useEffect(() => {
    if (current) {
      setStatus("ready");
      return;
    }
    let cancelled = false;
    void loadCachedFile(localId).then((file) => {
      if (cancelled) return;
      if (file) {
        restore({ id: localId, file, name: file.name });
        setStatus("ready");
      } else {
        setStatus("missing");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [current, localId, restore]);

  if (status === "missing") {
    return <LocalSourceMissing />;
  }
  if (status === "resolving" || !current) {
    return (
      <div className="flex min-h-dvh flex-col">
        <PracticeHeader />
      </div>
    );
  }

  return <SourceWorkspace {...props} file={current.file} kind="local" />;
}

interface SourceWorkspaceProps extends PracticeWorkspaceProps {
  file: File | null;
  kind: "youtube" | "mock" | "local";
}

function SourceWorkspace({
  source,
  videoId,
  localId,
  initialA,
  initialB,
  initialSpeed,
  initialLoop,
  file,
  kind,
}: SourceWorkspaceProps) {
  // A stable key for this source, used for the mount effect and session.
  const sourceKey = source === "local" ? `local:${localId ?? ""}` : videoId ?? "";

  // Seed the store once per source (reset first, so a prior source's markers /
  // duration never leak in). Runs in a layout effect — not during render — so
  // it never triggers a setState-in-render warning. Precedence:
  //   1. Markers in the URL (a shared link) always win.
  //   2. Otherwise a previously saved session (YouTube only) is restored.
  //   3. Otherwise it's fresh: arm a whole-clip A→B loop once duration is known.
  const seededKey = React.useRef<string | null>(null);
  React.useLayoutEffect(() => {
    if (seededKey.current === sourceKey) return;
    seededKey.current = sourceKey;

    const store = usePlayerStore.getState();
    store.resetForNewSource();

    if (initialA != null || initialB != null) {
      store.hydrate({
        markerA: initialA,
        markerB: initialB,
        loopEnabled: initialLoop ?? true,
        requestedSpeed: initialSpeed ?? 1,
      });
      return;
    }

    const saved = source === "local" ? null : loadSession(videoId ?? "");
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
      return;
    }

    if (initialSpeed != null) {
      store.hydrate({ requestedSpeed: initialSpeed });
    }
    store.requestWholeClipLoop();
  }, [sourceKey, source, videoId, initialA, initialB, initialSpeed, initialLoop]);

  // Remember the most recently used YouTube video so a bare visit to "/"
  // reopens it. (Local files aren't remembered this way — they live in cache.)
  React.useEffect(() => {
    if (source !== "local" && videoId) setLastVideoId(videoId);
  }, [source, videoId]);

  const { containerRef } = usePlayerMount({
    videoId: sourceKey,
    kind,
    file,
  });
  usePlayheadClock();
  useKeyboardShortcuts();
  useSessionSync(source === "local" ? null : (videoId ?? null));
  useUrlSync(
    source === "local"
      ? { localId: localId ?? "" }
      : { videoId: videoId ?? "" },
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <PracticeHeader />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 pb-32 pt-1 sm:px-6 lg:pb-10">
        <PlayerSurface
          containerRef={containerRef}
          audioFile={file && isAudioFile(file) ? file : null}
        />

        {/* The console: timeline, transport and speed read as one continuous
            control deck rather than a stack of separate cards. */}
        <div className="grain relative overflow-hidden rounded-card border border-border bg-surface shadow-faceplate">
          <div className="relative z-[1] flex flex-col">
            <div className="px-4 pt-4 sm:px-6 sm:pt-5">
              <Timeline />
            </div>

            {/* Transport lives in the console on desktop; docked on mobile. */}
            <div className="hidden border-t border-border px-4 py-3 sm:px-6 lg:block">
              <TransportControls />
            </div>

            <div className="border-t border-border px-4 py-3.5 sm:px-6">
              <SpeedRow />
            </div>
          </div>
        </div>

        <AdvancedSettings />
      </main>

      {/* Mobile transport dock */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-3 py-2.5 backdrop-blur lg:hidden">
        <TransportControls />
      </div>

      <MobileFallbackFooter />
    </div>
  );
}

function MobileFallbackFooter() {
  return (
    <p className="sr-only">
      <Link href="/">Return to PhraseLoop home</Link>
    </p>
  );
}
