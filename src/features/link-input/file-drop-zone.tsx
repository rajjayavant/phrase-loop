"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { useOpenLocalFile } from "./use-open-local-file";

/**
 * Whole-page drag-and-drop for local media.
 *
 * Listens on `window` so a file can be dropped anywhere, and shows a
 * full-screen invitation (same scrim language as the dialog overlay) while a
 * file drag is over the page.
 *
 * Two classic traps handled here:
 *
 * - `dragenter`/`dragleave` fire for every child the cursor crosses, so a
 *   naive open/close flickers constantly. A depth counter opens on the first
 *   enter and closes only when the matching number of leaves has fired (or
 *   on drop / when the drag leaves the window).
 * - The overlay itself must be `pointer-events-none`, or its appearance
 *   changes what the cursor is "over", which re-fires drag events against
 *   the overlay and can wedge the whole page into thinking a drag is stuck.
 *
 * Only file drags count — text selections and link drags are ignored via
 * `DataTransfer.types`.
 */
export function FileDropZone() {
  const openFile = useOpenLocalFile();
  const [active, setActive] = React.useState(false);
  const depthRef = React.useRef(0);

  React.useEffect(() => {
    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes("Files");

    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depthRef.current += 1;
      setActive(true);
    };

    const onDragOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      // Without this the browser navigates to the dropped file.
      e.preventDefault();
    };

    const onDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depthRef.current = Math.max(0, depthRef.current - 1);
      if (depthRef.current === 0) setActive(false);
    };

    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depthRef.current = 0;
      setActive(false);
      openFile(e.dataTransfer?.files?.[0]);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [openFile]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm animate-[overlay-in_var(--duration-menu)_var(--ease-standard)]"
      role="status"
      aria-live="polite"
    >
      {/* Opaque like the dialog surface — a bright video title behind a
          translucent card ghosts through and muddies the invitation. */}
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-card border-2 border-dashed border-accent bg-surface px-8 py-10 text-center shadow-dialog">
        <span className="grid h-14 w-14 place-items-center rounded-pill bg-accent-soft text-accent">
          <Upload className="h-6 w-6" />
        </span>
        <p className="font-display text-section-title text-primary">
          Drop it here to practice
        </p>
        <p className="text-small-body text-secondary">
          Video or audio — it stays on your device.
        </p>
      </div>
    </div>
  );
}
