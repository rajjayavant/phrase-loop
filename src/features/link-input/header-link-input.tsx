"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Link2, X } from "lucide-react";
import { TextField } from "@/components/ui";
import { parseYouTubeUrl } from "@/lib/youtube/parse-url";
import { usePlayerStore } from "@/features/player/stores/player-store";
import { cn } from "@/lib/utilities/cn";

/**
 * The compact "paste a link" field that lives in the practice header — the
 * primary way to open a new video, looptube-style. Submitting a valid link
 * navigates to that video in the same workspace; the previous video's markers
 * are already saved and this video's saved session (if any) is restored.
 */
export function HeaderLinkInput() {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseYouTubeUrl(value.trim());
    if (!parsed) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    setError(false);
    // Pasting a link is unambiguous play intent — dismiss the facade so the
    // pasted video loads its player immediately rather than showing another
    // "click to begin" gate.
    usePlayerStore.getState().activate();
    const params = new URLSearchParams({ v: parsed.videoId });
    if (parsed.startTime != null) {
      params.set("a", String(Math.round(parsed.startTime * 1000) / 1000));
    }
    setValue("");
    router.push(`/?${params.toString()}`);
    inputRef.current?.blur();
  };

  return (
    <form onSubmit={submit} className="min-w-0 flex-1" noValidate>
      <div className="relative">
        <Link2
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <TextField
          ref={inputRef}
          value={value}
          invalid={error}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          placeholder="Paste a YouTube link"
          aria-label="Load another YouTube video"
          aria-invalid={error}
          enterKeyHint="go"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="h-10 rounded-pill bg-subtle pl-9 pr-16 text-[0.85rem]"
        />
        {value ? (
          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
            <button
              type="button"
              aria-label="Clear link"
              onClick={() => {
                setValue("");
                setError(false);
                inputRef.current?.focus();
              }}
              className="rounded-sm p-1 text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              type="submit"
              aria-label="Load video"
              className={cn(
                "flex items-center gap-1 rounded-sm px-1.5 py-1 text-helper font-medium",
                "bg-accent text-accent-contrast transition-colors hover:bg-accent-hover",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              )}
            >
              <CornerDownLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </form>
  );
}
