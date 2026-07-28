import Link from "next/link";
import { VideoOff } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { parsePracticeParams } from "@/lib/validation/practice-params";
import { LinkInput } from "@/features/link-input/link-input";
import { PracticeWorkspace } from "@/features/player/components/practice-workspace";

export const dynamic = "force-dynamic";

interface PracticePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PracticePage({
  searchParams,
}: PracticePageProps) {
  const rawParams = await searchParams;
  const params = parsePracticeParams(rawParams);
  const useMock = rawParams.mock === "1";

  // Local-file source: `?src=local:<id>`. The file itself lives client-side
  // (in-memory / IndexedDB), so the workspace resolves it after hydration.
  const srcParam = Array.isArray(rawParams.src)
    ? rawParams.src[0]
    : rawParams.src;
  if (srcParam && srcParam.startsWith("local")) {
    const localId = srcParam.includes(":") ? srcParam.split(":")[1] : "";
    return (
      <PracticeWorkspace
        source="local"
        localId={localId ?? ""}
        initialA={params.a}
        initialB={params.b}
        initialSpeed={params.speed}
        initialLoop={params.loop}
      />
    );
  }

  if (!params.videoId) {
    return <InvalidLink />;
  }

  return (
    <PracticeWorkspace
      source={useMock ? "mock" : "youtube"}
      videoId={params.videoId}
      initialA={params.a}
      initialB={params.b}
      initialSpeed={params.speed}
      initialLoop={params.loop}
    />
  );
}

function InvalidLink() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center px-5 py-4">
        <Link href="/" aria-label="Looper home">
          <Wordmark size="sm" />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-subtle text-muted">
          <VideoOff className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-page-title text-primary">
          No video to practice
        </h1>
        <p className="mt-2 text-body text-secondary">
          This link is missing a valid YouTube video. Paste one below to start a
          new practice session.
        </p>
        <div className="mt-6 w-full">
          <LinkInput />
        </div>
      </main>
    </div>
  );
}
