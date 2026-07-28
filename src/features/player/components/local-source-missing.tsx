"use client";

import * as React from "react";
import Link from "next/link";
import { FileVideo } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { FilePickerButton } from "@/features/link-input/file-picker-button";

/**
 * Shown when a `?src=local:<id>` link is opened but the cached file is gone
 * (e.g. the browser cache was cleared). Invites the user to open a file again,
 * mirroring the "no video to practice" YouTube state.
 */
export function LocalSourceMissing() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center px-5 py-4">
        <Link href="/" aria-label="PhraseLoop home">
          <Wordmark size="sm" />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-subtle text-muted">
          <FileVideo className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-page-title text-primary">
          That file isn&apos;t loaded anymore
        </h1>
        <p className="mt-2 text-body text-secondary">
          Local files live in this browser only and this one is no longer
          cached. Open a video or audio file to start practicing again.
        </p>
        <div className="mt-6">
          <FilePickerButton size="lg" />
        </div>
      </main>
    </div>
  );
}
