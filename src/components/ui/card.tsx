import * as React from "react";
import { cn } from "@/lib/utilities/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use the raised elevated surface instead of the default surface. */
  elevated?: boolean;
}

export function Card({ className, elevated, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border",
        elevated ? "bg-elevated" : "bg-surface",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between gap-3", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-label font-medium uppercase tracking-wide text-muted",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}
