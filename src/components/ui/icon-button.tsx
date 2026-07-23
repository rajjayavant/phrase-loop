import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utilities/cn";

export const iconButtonVariants = cva(
  [
    "inline-flex items-center justify-center shrink-0",
    "rounded-control select-none",
    "transition-colors duration-hover ease-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "disabled:pointer-events-none disabled:opacity-40",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-contrast hover:bg-accent-hover active:bg-accent-pressed",
        secondary:
          "bg-elevated text-primary border border-border hover:border-border-strong hover:bg-subtle",
        ghost: "text-secondary hover:bg-subtle hover:text-primary",
        danger: "text-destructive hover:bg-destructive-surface",
      },
      size: {
        sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
        md: "h-10 w-10 [&_svg]:h-[1.15rem] [&_svg]:w-[1.15rem]",
        lg: "h-12 w-12 [&_svg]:h-6 [&_svg]:w-6",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        active: true,
        variant: "secondary",
        className: "border-accent text-accent bg-accent-surface",
      },
      {
        active: true,
        variant: "ghost",
        className: "text-accent bg-accent-surface",
      },
    ],
    defaultVariants: {
      variant: "ghost",
      size: "md",
      active: false,
    },
  },
);

export interface IconButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Required accessible name for icon-only controls. */
  label: string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant, size, active, label, type = "button", ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      // Toggle buttons (those given an explicit `active`) always expose
      // aria-pressed so both on and off states are announced; plain icon
      // buttons omit it entirely.
      aria-pressed={typeof active === "boolean" ? active : undefined}
      className={cn(iconButtonVariants({ variant, size, active }), className)}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";
