import * as React from "react";
import { cn } from "@/lib/utilities/cn";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const baseInput = [
  "w-full rounded-control bg-canvas text-primary",
  "border border-border px-3 h-10 text-small-body",
  "placeholder:text-muted",
  "transition-colors duration-hover ease-standard",
  "hover:border-border-strong",
  "focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-focus/40",
  "disabled:opacity-50 disabled:pointer-events-none",
];

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, invalid, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        baseInput,
        invalid && "border-destructive focus-visible:border-destructive",
        className,
      )}
      {...props}
    />
  ),
);
TextField.displayName = "TextField";
