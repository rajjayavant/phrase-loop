import * as React from "react";
import { cn } from "@/lib/utilities/cn";

export type KeyboardKeyProps = React.HTMLAttributes<HTMLElement>;

/** A single keycap. Compose several for chords (e.g. Shift + ←). */
export function KeyboardKey({
  className,
  children,
  ...props
}: KeyboardKeyProps) {
  return (
    <kbd
      className={cn(
        "tabular inline-flex h-6 min-w-[1.5rem] items-center justify-center",
        "rounded-sm border border-border-strong bg-canvas px-1.5",
        "text-helper font-medium text-secondary",
        "shadow-[inset_0_-1px_0_rgba(0,0,0,0.4)]",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
