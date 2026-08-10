"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui";
import {
  isMediaFile,
  useLocalSourceStore,
} from "@/features/player/stores/local-source";
import { hintLoadMethod } from "@/features/session/load-method";

/**
 * The one way a local file enters the app: validate, register with the local
 * source store, route to the practice workspace. Shared by the file-picker
 * button and the drag-and-drop zone so the two paths cannot drift apart.
 */
export function useOpenLocalFile() {
  const router = useRouter();
  const setFile = useLocalSourceStore((s) => s.setFile);

  return React.useCallback(
    (file: File | null | undefined): boolean => {
      if (!file) return false;
      if (!isMediaFile(file)) {
        toast.show({
          title: "Unsupported file",
          description: "Choose a video or audio file (MP4, WebM, MOV, MP3…).",
        });
        return false;
      }
      const id = setFile(file);
      hintLoadMethod("upload");
      router.push(`/?src=local:${id}`);
      return true;
    },
    [router, setFile],
  );
}
