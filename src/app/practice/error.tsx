"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import { Wordmark } from "@/components/brand/wordmark";

export default function PracticeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center px-5 py-4">
        <Link href="/" aria-label="PhraseLoop home">
          <Wordmark size="sm" />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="bg-destructive-surface flex h-12 w-12 items-center justify-center rounded-pill text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-page-title text-primary">
          Something interrupted your session
        </h1>
        <p className="mt-2 text-body text-secondary">
          The practice workspace hit an unexpected error. Your saved markers and
          speed for this video are still stored — try reloading.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={reset}>Reload workspace</Button>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-control border border-border bg-elevated px-4 text-small-body font-medium text-primary transition-colors hover:border-border-strong hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            Back to start
          </Link>
        </div>
      </main>
    </div>
  );
}
