/**
 * The canonical keyboard-shortcut registry. A single source of truth for both
 * the runtime handler (see `use-keyboard-shortcuts`) and the shortcuts dialog,
 * so the two can never drift.
 *
 * Conflict resolution decisions (per spec):
 *   - `L` is reserved for toggling the loop and is NOT used for seeking.
 *   - `K` mirrors Space/`J`-`K` transport convention for play/pause.
 *   - `J` reduces speed (paired with a symmetric increase; see below).
 *   - `[` / `]` move the *selected* marker; plain arrows seek.
 */

export type ShortcutAction =
  | "toggle-play"
  | "set-marker-a"
  | "set-marker-b"
  | "toggle-loop"
  | "seek-back-1s"
  | "seek-forward-1s"
  | "seek-back-100ms"
  | "seek-forward-100ms"
  | "seek-back-5s"
  | "seek-forward-5s"
  | "speed-down"
  | "speed-up"
  | "nudge-marker-back"
  | "nudge-marker-forward"
  | "restart-loop"
  | "escape";

export interface ShortcutDefinition {
  action: ShortcutAction;
  /** Human-readable key combo for display (e.g. "Shift + ←"). */
  keys: string[];
  description: string;
  /** Group for the shortcuts dialog. */
  group: "Transport" | "Markers & Loop" | "Speed" | "General";
  /** Hide from the dialog (still active) — used for aliases. */
  hidden?: boolean;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  {
    action: "toggle-play",
    keys: ["Space"],
    description: "Play or pause",
    group: "Transport",
  },
  {
    action: "toggle-play",
    keys: ["K"],
    description: "Play or pause",
    group: "Transport",
    hidden: true,
  },
  {
    action: "seek-back-1s",
    keys: ["←"],
    description: "Seek back 1 second",
    group: "Transport",
  },
  {
    action: "seek-forward-1s",
    keys: ["→"],
    description: "Seek forward 1 second",
    group: "Transport",
  },
  {
    action: "seek-back-100ms",
    keys: ["Shift", "←"],
    description: "Seek back 100 ms",
    group: "Transport",
  },
  {
    action: "seek-forward-100ms",
    keys: ["Shift", "→"],
    description: "Seek forward 100 ms",
    group: "Transport",
  },
  {
    action: "set-marker-a",
    keys: ["A"],
    description: "Set marker A at the playhead",
    group: "Markers & Loop",
  },
  {
    action: "set-marker-b",
    keys: ["B"],
    description: "Set marker B at the playhead",
    group: "Markers & Loop",
  },
  {
    action: "toggle-loop",
    keys: ["L"],
    description: "Toggle looping",
    group: "Markers & Loop",
  },
  {
    action: "nudge-marker-back",
    keys: ["["],
    description: "Move the selected marker earlier",
    group: "Markers & Loop",
  },
  {
    action: "nudge-marker-forward",
    keys: ["]"],
    description: "Move the selected marker later",
    group: "Markers & Loop",
  },
  {
    action: "restart-loop",
    keys: ["R"],
    description: "Restart the loop from marker A",
    group: "Markers & Loop",
  },
  {
    action: "speed-down",
    keys: ["J"],
    description: "Reduce playback speed",
    group: "Speed",
  },
  {
    action: "speed-up",
    keys: ["Shift", "J"],
    description: "Increase playback speed",
    group: "Speed",
  },
  {
    action: "escape",
    keys: ["Esc"],
    description: "Close menus or exit the focused precision control",
    group: "General",
  },
];

export const VISIBLE_SHORTCUTS = SHORTCUTS.filter((s) => !s.hidden);
