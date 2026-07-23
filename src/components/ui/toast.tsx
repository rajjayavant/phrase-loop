"use client";

import * as React from "react";
import { create } from "zustand";
import { CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utilities/cn";

export type ToastTone = "info" | "success";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  duration: number;
}

interface ToastStore {
  toasts: Toast[];
  seq: number;
  push: (toast: Omit<Toast, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  seq: 0,
  push: (toast) => {
    const seq = get().seq + 1;
    const id = toast.id ?? `toast-${seq}`;
    set((state) => ({
      seq,
      toasts: [...state.toasts.filter((t) => t.id !== id), { ...toast, id }],
    }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/**
 * Imperative toast API usable from anywhere (including non-React callers such
 * as the keyboard-shortcut layer).
 */
export const toast = {
  show(input: {
    title: string;
    description?: string;
    tone?: ToastTone;
    duration?: number;
    id?: string;
  }): string {
    return useToastStore.getState().push({
      title: input.title,
      description: input.description,
      tone: input.tone ?? "info",
      duration: input.duration ?? 2600,
      id: input.id,
    });
  },
  success(title: string, description?: string): string {
    return this.show({ title, description, tone: "success" });
  },
  dismiss(id: string): void {
    useToastStore.getState().dismiss(id);
  },
};

const iconFor: Record<ToastTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
};

function ToastItem({ item }: { item: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = iconFor[item.tone];

  React.useEffect(() => {
    if (item.duration <= 0) return;
    const timer = window.setTimeout(() => dismiss(item.id), item.duration);
    return () => window.clearTimeout(timer);
  }, [item.id, item.duration, dismiss]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-2.5 rounded-card border border-border",
        "bg-elevated px-3.5 py-3 shadow-floating",
        "animate-[content-in_var(--duration-menu)_var(--ease-standard)]",
        "w-[min(22rem,calc(100vw-2rem))]",
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 h-4 w-4 shrink-0",
          item.tone === "success" ? "text-success" : "text-accent",
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-small-body font-medium text-primary">{item.title}</p>
        {item.description ? (
          <p className="mt-0.5 text-helper text-secondary">
            {item.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismiss(item.id)}
        className="rounded-sm text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Toast viewport. Rendered once near the app root. Doubles as a polite
 * `aria-live` region so toast content is announced to screen readers.
 */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:left-auto sm:right-0 sm:items-end"
    >
      <div aria-live="polite" aria-atomic="false" className="contents">
        {toasts.map((item) => (
          <ToastItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
