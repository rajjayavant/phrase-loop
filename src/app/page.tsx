import { parsePracticeParams } from "@/lib/validation/practice-params";
import { PracticeWorkspace } from "@/features/player/components/practice-workspace";
import { HomeContent } from "@/features/marketing/home-content";
import { StructuredData } from "@/features/marketing/structured-data";
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
 * `HomeContent` is passed as a child so it renders *below* the instrument and
 * above the footer: the tool stays the first thing a visitor sees, while the
 * page still has real indexable text. Crawlers do not care about source order
 * here, and neither does the reader who came to practice.
 *
 * The local-file route deliberately omits it. That URL is reached by opening
 * your own file, never from search, so marketing copy would be noise.
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
        >
          <HomeContent />
        </PracticeWorkspace>
      )}
      <StructuredData />
    </>
  );
}
