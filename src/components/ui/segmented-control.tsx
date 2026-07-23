"use client";

import * as React from "react";
import { cn } from "@/lib/utilities/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  /** Accessible label when `label` is an icon or otherwise non-descriptive. */
  ariaLabel?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onValueChange: (value: T) => void;
  /** Accessible group name. */
  label: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A radiogroup-style segmented control with roving focus and arrow-key
 * navigation. Selection is never conveyed by color alone — the active segment
 * also gets an elevated surface and bold weight.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  label,
  size = "md",
  className,
}: SegmentedControlProps<T>) {
  const refs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % options.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + options.length) % options.length;
    }
    if (nextIndex != null) {
      event.preventDefault();
      const option = options[nextIndex];
      if (option) {
        onValueChange(option.value);
        refs.current[nextIndex]?.focus();
      }
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-control border border-border bg-canvas p-0.5",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            tabIndex={selected ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "rounded-[calc(var(--radius-control)-2px)] font-medium",
              "transition-colors duration-hover ease-standard",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              size === "sm" ? "h-7 px-2.5 text-helper" : "h-8 px-3 text-label",
              selected
                ? "bg-elevated text-primary shadow-tooltip"
                : "text-muted hover:text-secondary",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
