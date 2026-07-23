import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utilities/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-label font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-subtle text-secondary border border-border",
        accent: "bg-accent-surface text-accent border border-accent/30",
        success: "bg-success-surface text-success border border-success/30",
        warning: "bg-warning-surface text-warning border border-warning/30",
        danger:
          "bg-destructive-surface text-destructive border border-destructive/30",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
