"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui";
import { ACCEPTED_MEDIA } from "@/features/player/stores/local-source";
import { useOpenLocalFile } from "./use-open-local-file";
import { cn } from "@/lib/utilities/cn";

interface FilePickerButtonProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  /** Icon-only compact rendering (for the header). */
  compact?: boolean;
}

/**
 * Opens a local video/audio file the user supplies, registers it, and routes to
 * the practice workspace in local mode. This is the sanctioned way to loop a
 * clip you already have on your device — full seek/loop/speed, no downloading.
 */
export function FilePickerButton({
  size = "md",
  variant = "secondary",
  className,
  compact = false,
}: FilePickerButtonProps) {
  const openFile = useOpenLocalFile();
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MEDIA}
        className="sr-only"
        onChange={(e) => openFile(e.target.files?.[0])}
        tabIndex={-1}
        aria-hidden="true"
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn("gap-1.5", className)}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        {compact ? (
          <>
            {/* Visible from sm up; below that the label is still exposed to
                assistive tech, or the button would be an unnamed icon. */}
            <span className="hidden sm:inline">Upload video</span>
            <span className="sr-only sm:hidden">Upload video</span>
          </>
        ) : (
          "Upload video"
        )}
      </Button>
    </>
  );
}
