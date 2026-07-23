import * as React from "react";
import { cn } from "@/lib/utilities/cn";

export interface NumberFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "value"
> {
  value: number;
  onValueChange: (value: number) => void;
  invalid?: boolean;
  /** Fired on blur/Enter with the committed value (for validation). */
  onCommit?: (value: number) => void;
}

/**
 * A numeric input that keeps a local string draft so the user can type freely
 * (including transient states like "0." or ""), committing a parsed number on
 * change. Uses tabular numerals for stable width.
 */
export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      className,
      value,
      onValueChange,
      onCommit,
      invalid,
      step = 0.01,
      min,
      max,
      ...props
    },
    ref,
  ) => {
    const [draft, setDraft] = React.useState(String(value));
    const [focused, setFocused] = React.useState(false);

    // Sync external changes only while the field is not being edited.
    React.useEffect(() => {
      if (!focused) setDraft(String(value));
    }, [value, focused]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setDraft(next);
      const parsed = Number.parseFloat(next);
      if (Number.isFinite(parsed)) onValueChange(parsed);
    };

    const commit = () => {
      const parsed = Number.parseFloat(draft);
      const committed = Number.isFinite(parsed) ? parsed : value;
      setDraft(String(committed));
      onCommit?.(committed);
    };

    return (
      <input
        ref={ref}
        type="number"
        inputMode="decimal"
        value={draft}
        step={step}
        min={min}
        max={max}
        aria-invalid={invalid || undefined}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          commit();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commit();
            (event.target as HTMLInputElement).blur();
          }
        }}
        className={cn(
          "tabular w-full rounded-control bg-canvas text-primary",
          "h-10 border border-border px-3 text-numeric",
          "transition-colors duration-hover ease-standard",
          "hover:border-border-strong",
          "focus-visible:ring-focus/40 focus:outline-none focus-visible:border-accent focus-visible:ring-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          invalid && "border-destructive focus-visible:border-destructive",
          className,
        )}
        {...props}
      />
    );
  },
);
NumberField.displayName = "NumberField";
