import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utilities/cn";

const statusVariants = cva(
  "flex items-start gap-2.5 rounded-control px-3 py-2.5 text-small-body",
  {
    variants: {
      tone: {
        info: "bg-subtle text-secondary border border-border",
        success: "bg-success-surface text-success border border-success/25",
        warning: "bg-warning-surface text-warning border border-warning/25",
        danger:
          "bg-destructive-surface text-destructive border border-destructive/25",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

const iconFor: Record<
  NonNullable<VariantProps<typeof statusVariants>["tone"]>,
  LucideIcon
> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

export interface StatusMessageProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {
  /** Hide the leading icon (icon is decorative; text always carries meaning). */
  hideIcon?: boolean;
}

export function StatusMessage({
  className,
  tone = "info",
  hideIcon,
  children,
  ...props
}: StatusMessageProps) {
  const Icon = iconFor[tone ?? "info"];
  return (
    <div className={cn(statusVariants({ tone }), className)} {...props}>
      {!hideIcon && (
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
