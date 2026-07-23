"use client";

import Link from "next/link";
import { Keyboard, Link2 } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { Button, Tooltip } from "@/components/ui";
import { CopyLinkButton } from "@/features/session/copy-link-button";
import { ShortcutsDialog } from "@/features/shortcuts/shortcuts-dialog";
import { HeaderLinkInput } from "@/features/link-input/header-link-input";

export function PracticeHeader() {
  return (
    <header className="bg-canvas/85 sticky top-0 z-30 border-b border-border backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
        <Link
          href="/"
          aria-label="Looper home"
          className="rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Wordmark size="sm" />
        </Link>

        {/* Link input: inline on wide screens, own row on narrow ones. */}
        <div className="order-3 w-full min-w-0 sm:order-none sm:w-auto sm:max-w-md sm:flex-1">
          <HeaderLinkInput />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Keyboard shortcuts are desktop-only; hide the entry on mobile. */}
          <ShortcutsDialog
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-1.5 sm:inline-flex"
              >
                <Keyboard className="h-4 w-4" />
                <span className="hidden sm:inline">Shortcuts</span>
              </Button>
            }
          />
          <Tooltip content="Copy a link to this practice setup">
            <CopyLinkButton
              trigger={
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <Link2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy link</span>
                </Button>
              }
            />
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
