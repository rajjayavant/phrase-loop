"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  KeyboardKey,
} from "@/components/ui";
import { VISIBLE_SHORTCUTS } from "./shortcut-definitions";

const GROUP_ORDER = [
  "Transport",
  "Markers & Loop",
  "Speed",
  "General",
] as const;

export function ShortcutsDialog({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        title="Keyboard shortcuts"
        description="Work hands-on-keys. Shortcuts pause while you type in a field."
      >
        <div className="space-y-5">
          {GROUP_ORDER.map((group) => {
            const items = VISIBLE_SHORTCUTS.filter((s) => s.group === group);
            if (items.length === 0) return null;
            return (
              <section key={group}>
                <h3 className="mb-2 text-label uppercase tracking-wide text-muted">
                  {group}
                </h3>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li
                      key={`${item.action}-${item.keys.join("+")}`}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="text-small-body text-secondary">
                        {item.description}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        {item.keys.map((key, index) => (
                          <React.Fragment key={key}>
                            {index > 0 && (
                              <span className="text-helper text-muted">+</span>
                            )}
                            <KeyboardKey>{key}</KeyboardKey>
                          </React.Fragment>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
