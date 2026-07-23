import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utilities/cn";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-control font-medium select-none",
    "transition-colors duration-hover ease-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-contrast hover:bg-accent-hover active:bg-accent-pressed",
        secondary:
          "bg-elevated text-primary border border-border hover:border-border-strong hover:bg-subtle",
        ghost: "text-secondary hover:bg-subtle hover:text-primary",
        danger:
          "bg-transparent text-destructive border border-border hover:bg-destructive-surface hover:border-destructive",
      },
      size: {
        sm: "h-8 px-3 text-small-body",
        md: "h-10 px-4 text-small-body",
        lg: "h-12 px-6 text-body",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
