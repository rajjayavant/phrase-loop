"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utilities/cn";

export const TooltipProvider = TooltipPrimitive.Provider;

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  /** Optional keyboard hint rendered as a `<kbd>` after the label. */
  shortcut?: string;
  delayDuration?: number;
}

/**
 * A lightweight tooltip wrapper. Tooltips are supplementary only — every
 * control they annotate also carries an accessible name, so screen-reader
 * users never depend on tooltip content.
 */
export function Tooltip({
  content,
  children,
  side = "top",
  shortcut,
  delayDuration = 300,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            "z-50 flex items-center gap-2 rounded-control px-2.5 py-1.5",
            "border border-border bg-elevated text-helper text-primary shadow-tooltip",
            "data-[state=delayed-open]:animate-[content-in_var(--duration-menu)_var(--ease-standard)]",
          )}
        >
          <span>{content}</span>
          {shortcut ? (
            <kbd className="tabular rounded-sm border border-border bg-canvas px-1.5 py-0.5 text-[0.65rem] font-medium text-secondary">
              {shortcut}
            </kbd>
          ) : null}
          <TooltipPrimitive.Arrow className="fill-[var(--color-elevated)]" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
