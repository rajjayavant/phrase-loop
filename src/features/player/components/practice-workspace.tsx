"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { toast } from "@/components/ui";
import { FileDropZone } from "@/features/link-input/file-drop-zone";
import { SiteFooter } from "@/components/site-footer";
import { useKeyboardShortcuts } from "@/features/shortcuts/use-keyboard-shortcuts";
import { SavedLoops } from "@/features/saved-loops/saved-loops";
import { useSavedLoopRecorder } from "@/features/saved-loops/use-saved-loop-recorder";
import {
  listSavedLoops,
  localLoopKey,
  youtubeLoopKey,
} from "@/features/saved-loops/saved-loops-storage";
import { hintLoadMethodIfUnset } from "@/features/session/load-method";
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
  /**
   * Server-rendered content placed between the instrument and the footer.
   * Passed through as a prop rather than rendered by the page so it lands
   * inside the workspace's own layout, above the footer this component owns.
   */
  children?: React.ReactNode;
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
  return (
    <>
      {/* Whole-page drop target: a dragged file works from any practice
          variant, exactly like the Upload button. */}
      <FileDropZone />
      {props.source === "local" ? (
        <LocalWorkspace {...props} />
      ) : (
        <SourceWorkspace {...props} file={null} kind={props.source} />
      )}
    </>
  );
}

/**
 * Resolves the local file (from the in-memory store, else the IndexedDB cache)
 * before mounting the shared workspace.
 *
 * When the file is gone (cleared cache, or a `local:` link opened on another
 * device) we do NOT show a dead-end page. A stale link is a dead end only if we
 * make it one: instead we send the user to the default video and explain what
 * happened in a toast, so they land somewhere they can immediately practice.
 */
function LocalWorkspace(props: PracticeWorkspaceProps) {
  const router = useRouter();
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

  React.useEffect(() => {
    if (status !== "missing") return;
    // `replace`, not `push`: the stale link should not sit in history for the
    // back button to return to.
    router.replace("/");
    toast.show({
      title: "That file isn't loaded anymore",
      description:
        "Local files stay in the browser that opened them. Upload it again to pick up where you left off.",
      duration: 6000,
      // A stable id keeps a double-mount (React strict mode) from stacking two
      // identical toasts.
      id: "local-source-missing",
    });
  }, [status, router]);

  if (status === "resolving" || status === "missing" || !current) {
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
  children,
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

    const saved = source === "local" ? null : loadSession(videoId ?? "");

    // The last known duration for this media, from the session or the
    // Recently looped shelf. It seeds the timeline scale so markers are
    // visible in the right place BEFORE the player loads (the facade defers
    // loading until the first play gesture). Needed by BOTH branches below:
    // the URL sync mirrors markers into the address bar, so even a plain
    // reload of a practiced video arrives through the URL-markers branch.
    const rememberedDuration = (() => {
      if (saved && saved.duration > 0) return saved.duration;
      const key =
        source === "local"
          ? file
            ? localLoopKey(file)
            : null
          : videoId
            ? youtubeLoopKey(videoId)
            : null;
      const entry = key
        ? listSavedLoops().find((e) => e.key === key)
        : undefined;
      return entry && entry.duration > 0 ? entry.duration : 0;
    })();

    if (initialA != null || initialB != null) {
      // Markers in the URL and no stronger hint pending: someone opened a
      // shared link. (A recent-loop tile also produces marker params, but
      // its click handler has already hinted `recent_loop`.)
      hintLoadMethodIfUnset("shared_link");
      store.hydrate({
        markerA: initialA,
        markerB: initialB,
        loopEnabled: initialLoop ?? true,
        requestedSpeed: initialSpeed ?? 1,
        duration: rememberedDuration,
      });
      return;
    }

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
        duration: rememberedDuration,
      });
      announce("Your previous practice settings were restored");
      // A session can exist without a loop — saved for its speed/volume, or
      // saved while the facade idled before the video ever loaded. Restoring
      // it must not cost the whole-clip default: without this, such a
      // session permanently suppresses marker B (a lone custom A marker is
      // the one shape that is deliberately kept as-is).
      if (
        saved.markerB == null &&
        (saved.markerA == null || saved.markerA === 0)
      ) {
        store.requestWholeClipLoop();
      }
      return;
    }

    if (initialSpeed != null) {
      store.hydrate({ requestedSpeed: initialSpeed });
    }
    store.requestWholeClipLoop();
  }, [
    sourceKey,
    source,
    videoId,
    file,
    initialA,
    initialB,
    initialSpeed,
    initialLoop,
  ]);

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
  useSavedLoopRecorder({ kind, videoId, localId, file });
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
          posterVideoId={kind === "youtube" ? (videoId ?? null) : null}
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

        {/* The shelf of previously practiced loops, one tile each. Below the
            instrument so the current session stays the focus; above the
            marketing content because it IS practice material. */}
        <SavedLoops
          currentKey={
            kind === "youtube" && videoId
              ? youtubeLoopKey(videoId)
              : kind === "local" && file
                ? localLoopKey(file)
                : null
          }
        />

        {/* No ad unit here, deliberately.

            AdSense rejected the site for "low value content" in August 2026.
            The ad used to sit at the foot of this workspace, which is the one
            screen on the site that is a tool rather than publisher content:
            its main content is an embedded YouTube video belonging to someone
            else. Google's Inventory Value policy prohibits ads on screens
            "without publisher content" and on embedded third-party content
            carried "without additional commentary, curation, or otherwise
            adding value", so monetising the player was the violation.

            Ads belong on the /guides pages, which are original writing. See
            `features/guides/guide-page.tsx`. Do not reintroduce an ad unit on
            the practice screen. */}
      </main>

      {/* Mobile transport dock */}
      {/* Fully opaque, not bg-surface/95: with page content below the player,
          body text scrolls under this dock and was legible through it. A
          backdrop blur does not rescue small text at 95% opacity. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-3 py-2.5 lg:hidden">
        <TransportControls />
      </div>

      {/* Extra bottom padding on mobile so the fixed transport dock never
          covers the footer links. */}
      <div className="pb-24 lg:pb-0">
        {/* Server-rendered page content, between the instrument and the
            footer. Empty on the local-file route, where the page passes
            nothing. */}
        {children}
        <SiteFooter />
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
