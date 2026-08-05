"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Link2 } from "lucide-react";
import { Button, StatusMessage, TextField } from "@/components/ui";
import { parseYouTubeUrl } from "@/lib/youtube/parse-url";
import { cn } from "@/lib/utilities/cn";

export interface LinkInputProps {
  /** Optional prefilled value (e.g. from a shared link). */
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}

/**
 * The primary "paste a YouTube link" entry point. Validates on submit and
 * routes to /practice with a normalized video ID (and preserved start time).
 */
export function LinkInput({
  defaultValue = "",
  className,
  autoFocus,
}: LinkInputProps) {
  const router = useRouter();
  const [value, setValue] = React.useState(defaultValue);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = parseYouTubeUrl(value);
    if (!parsed) {
      setError(
        "That doesn't look like a YouTube link. Paste a video URL such as youtube.com/watch?v=… or youtu.be/…",
      );
      inputRef.current?.focus();
      return;
    }
    setError(null);
    const params = new URLSearchParams({ v: parsed.videoId });
    if (parsed.startTime != null) {
      // Seed marker A with the pasted timestamp so a shared "start here" link
      // lands the practice region where the sender intended.
      params.set("a", String(Math.round(parsed.startTime * 1000) / 1000));
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full", className)}
      noValidate
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Link2
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <TextField
            ref={inputRef}
            value={value}
            autoFocus={autoFocus}
            invalid={!!error}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste a YouTube link"
            aria-label="YouTube video link"
            aria-describedby={error ? "link-input-error" : undefined}
            className="h-12 pl-9 text-body"
            enterKeyHint="go"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
        <Button type="submit" size="lg" className="shrink-0">
          Start practicing
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      {error ? (
        <StatusMessage
          tone="danger"
          id="link-input-error"
          className="mt-3"
          role="alert"
        >
          {error}
        </StatusMessage>
      ) : null}
    </form>
  );
}
