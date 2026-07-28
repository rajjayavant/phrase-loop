"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui";
import { toast } from "@/components/ui";
import {
  ACCEPTED_MEDIA,
  isMediaFile,
  useLocalSourceStore,
} from "@/features/player/stores/local-source";
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
  const router = useRouter();
  const setFile = useLocalSourceStore((s) => s.setFile);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!isMediaFile(file)) {
      toast.show({
        title: "Unsupported file",
        description: "Choose a video or audio file (MP4, WebM, MOV, MP3…).",
      });
      return;
    }
    const id = setFile(file);
    router.push(`/practice?src=local:${id}`);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_MEDIA}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
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
        <FolderOpen className="h-4 w-4" />
        {compact ? (
          <span className="hidden sm:inline">Open file</span>
        ) : (
          "Open a file"
        )}
      </Button>
    </>
  );
}
