"use client";

import Link from "next/link";
import { Keyboard, Link2 } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { Button, Tooltip } from "@/components/ui";
import { CopyLinkButton } from "@/features/session/copy-link-button";
import { ShortcutsDialog } from "@/features/shortcuts/shortcuts-dialog";
import { HeaderLinkInput } from "@/features/link-input/header-link-input";
import { FilePickerButton } from "@/features/link-input/file-picker-button";

export function PracticeHeader() {
  return (
    <header className="sticky top-0 z-30">
      {/* Solid, with a soft fade only in the last few pixels. This was a
          gradient to transparent, which worked when the page ended at the
          player. Now that prose scrolls underneath, transparent meant body
          text was readable straight through the bar. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[calc(100%-0.75rem)] bg-canvas" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-b from-canvas to-transparent" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-4 sm:px-6">
        <Link
          href="/"
          aria-label="PhraseLoop home"
          className="rounded-control transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Wordmark size="sm" />
        </Link>

        {/* Load-a-link command field: inline on wide screens, own row on narrow. */}
        <div className="order-3 flex w-full min-w-0 items-center gap-2 sm:order-none sm:mx-2 sm:w-auto sm:max-w-md sm:flex-1">
          <HeaderLinkInput />
          <FilePickerButton compact className="shrink-0" />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <ShortcutsDialog
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-1.5 sm:inline-flex"
              >
                <Keyboard className="h-4 w-4" />
                <span>Shortcuts</span>
              </Button>
            }
          />
          <Tooltip content="Copy a link to this practice setup">
            <CopyLinkButton
              trigger={
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <Link2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy link</span>
                  {/* Keeps the button named when the label is hidden. */}
                  <span className="sr-only sm:hidden">Copy link</span>
                </Button>
              }
            />
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
