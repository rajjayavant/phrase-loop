import { parsePracticeParams } from "@/lib/validation/practice-params";
import { PracticeWorkspace } from "@/features/player/components/practice-workspace";
import { DEFAULT_VIDEO_ID } from "@/lib/youtube/default-video";

// Reads searchParams (?v=, ?a=, ?b=…), so it cannot be statically prerendered.
export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The app root: the player itself.
 *
 * This is a SERVER component; only `PracticeWorkspace` (the interactive
 * player) hydrates on the client. It used to be a client-side splash that
 * redirected to /practice — that redirect is gone and the player lives here.
 *
 * There is deliberately no marketing copy or h1 on this page: the root is the
 * instrument, and the UI is not being reshaped for search engines. Discovery
 * copy, if it is ever added, belongs on its own route rather than on top of
 * the tool.
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const rawParams = await searchParams;
  const params = parsePracticeParams(rawParams);
  const useMock = rawParams.mock === "1";

  // Local-file source: `?src=local:<id>`. The file lives client-side (memory /
  // IndexedDB), so the workspace resolves it after hydration.
  const srcParam = Array.isArray(rawParams.src)
    ? rawParams.src[0]
    : rawParams.src;
  const localId =
    srcParam && srcParam.startsWith("local")
      ? (srcParam.includes(":") ? srcParam.split(":")[1] : "") ?? ""
      : null;

  // With no ?v= the visitor gets the default video rather than an error: the
  // root must always be a working instrument, never a dead end.
  const videoId = params.videoId ?? DEFAULT_VIDEO_ID;

  return (
    <>
      {localId !== null ? (
        <PracticeWorkspace
          source="local"
          localId={localId}
          initialA={params.a}
          initialB={params.b}
          initialSpeed={params.speed}
          initialLoop={params.loop}
        />
      ) : (
        <PracticeWorkspace
          source={useMock ? "mock" : "youtube"}
          videoId={videoId}
          initialA={params.a}
          initialB={params.b}
          initialSpeed={params.speed}
          initialLoop={params.loop}
        />
      )}
    </>
  );
}
