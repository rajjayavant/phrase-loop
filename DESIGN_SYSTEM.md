# Looper Design System — "Studio Instrument"

A documented, token-driven design language. Looper should feel like a **boutique
piece of studio gear** — warm, tactile, precise, and quiet — not a generic web
app or dashboard. The player is a lit **faceplate**; the timeline is a ruled
**tape**; timestamps read like instrument readouts.

All tokens live in [`src/styles/tokens.css`](src/styles/tokens.css) as CSS
custom properties and are exposed to Tailwind via
[`tailwind.config.ts`](tailwind.config.ts). **Components reference semantic
utilities (`bg-surface`, `text-secondary`, `text-marker-a`) — never raw hex.**

---

## Principles

1. **Instrument, not interface.** Controls are joined into a single "console"
   deck. Warmth (espresso graphite + ember accent + faint grain and glow) makes
   large dark surfaces read as a physical unit, not flat black.
2. **Precision over decoration.** One bold moment (the faceplate + big mono
   readouts); everything else is restrained. No glassmorphism-everywhere, no
   gradient soup.
3. **Calm by default, power on demand.** The default view is video → console
   (timeline + transport + speed). Precision controls (marker editing, nudge
   granularity, full speed presets, fullscreen) live in a collapsible
   **Advanced settings** panel.
4. **Warm dark-first, theme-ready.** Dark-first (practice happens in low light);
   a warm **cream** light theme lives under `:root[data-theme="light"]`.
5. **One system.** Reusable primitives, one radius scale, one motion scale.
6. **Never color-only.** State and identity are reinforced with text, shape, or
   iconography (e.g. A/B markers carry letters, not just hues).

---

## Color tokens

The base is a **warm espresso graphite** lit by a single **burnt-orange ember**
accent, with one cool sage note for success. Semantic name → token (dark values).

| Semantic          | Token                       | Dark                         |
| ----------------- | --------------------------- | ---------------------------- |
| Canvas            | `--color-canvas`            | `#14100e` (warm near-black)  |
| Surface           | `--color-surface`           | `#1c1815`                    |
| Elevated surface  | `--color-elevated`          | `#241f1b`                    |
| Subtle surface    | `--color-subtle`            | warm white @ 3.5%            |
| Primary text      | `--color-text-primary`      | `#f7f3ee`                    |
| Secondary text    | `--color-text-secondary`    | `#b8afa6`                    |
| Muted text        | `--color-text-muted`        | `#857b71`                    |
| Border            | `--color-border`            | warm white @ 8%              |
| Strong border     | `--color-border-strong`     | warm white @ 16%             |
| Accent (ember)    | `--color-accent`            | `#e0561f` (from `#c03403`)   |
| Accent hover      | `--color-accent-hover`      | `#f26a30`                    |
| Accent pressed    | `--color-accent-pressed`    | `#c03403` (brand base)       |
| Accent soft       | `--color-accent-soft`       | ember @ 14%                  |
| Success (sage)    | `--color-success`           | `#a9cc5a`                    |
| Warning           | `--color-warning`           | `#e6b455`                    |
| Destructive       | `--color-destructive`       | `#f26a5f`                    |
| Focus ring        | `--color-focus-ring`        | `#7fb2ff` (cool, for contrast) |
| Loop region       | `--color-loop-region`       | ember @ 16%                  |
| Marker A          | `--color-marker-a`          | `#5aa9ff` (blue)             |
| Marker B          | `--color-marker-b`          | `#c98cff` (violet)           |

`#c03403` is the brand base; on the dark canvas it's warmed to a glowing ember
(`#e0561f`) and used as the pressed state. The light theme uses `#c03403`
directly on cream. Markers use **distinct cool hues _and_ letter labels**.
`--glow-accent` powers the ambient bloom behind the faceplate.

---

## Typography

A three-voice system, all via `next/font`:

- **Poppins** (`--font-display`) — brand voice: the wordmark, dialog titles,
  and any display moment. Set tight (`-0.03/-0.04em`).
- **Inter** (`--font-sans`) — body and UI copy.
- **JetBrains Mono** (`--font-mono`) — every measurement (timestamps, speeds,
  keycaps). The `.tabular` utility maps to it with `tnum` on, so readouts read
  as instrument displays.

| Role            | Token                        | Notes                        |
| --------------- | ---------------------------- | ---------------------------- |
| Display         | `--font-size-display`        | `clamp(2.25rem → 3.5rem)`    |
| Page title      | `--font-size-page-title`     | `clamp(1.75rem → 2.25rem)`   |
| Section title   | `--font-size-section-title`  | `1.125rem`                   |
| Body            | `--font-size-body`           | `1rem`                       |
| Small body      | `--font-size-small-body`     | `0.875rem`                   |
| Label           | `--font-size-label`          | `0.8125rem`, +tracking       |
| Numeric control | `--font-size-numeric`        | `1rem`, tabular              |
| Timestamp       | `--font-size-timestamp`      | `0.875rem`, tabular          |
| Helper          | `--font-size-helper`         | `0.75rem`                    |

---

## Spacing

4px base scale. Do not scatter arbitrary values.

`--space-0-5` (2px) · `--space-1` (4) · `2` (8) · `3` (12) · `4` (16) · `5`
(20) · `6` (24) · `8` (32) · `10` (40) · `12` (48) · `16` (64).

## Shape

| Token              | Value     | Use                         |
| ------------------ | --------- | --------------------------- |
| `--radius-sm`      | `0.25rem` | keycaps, small chips        |
| `--radius-control` | `0.5rem`  | buttons, inputs, segments   |
| `--radius-card`    | `0.875rem`| cards, dialogs, player      |
| `--radius-pill`    | `999px`   | badges, slider track, dots  |

## Elevation

Restrained shadows: `--elevation-menu`, `--elevation-dialog`,
`--elevation-tooltip`, `--elevation-floating`. Used only for menus, dialogs,
tooltips, and floating mobile controls.

## Motion

| Token                | Value   | Use              |
| -------------------- | ------- | ---------------- |
| `--duration-hover`   | 120ms   | hover            |
| `--duration-press`   | 80ms    | press            |
| `--duration-menu`    | 160ms   | menu / popover   |
| `--duration-dialog`  | 200ms   | dialog           |
| `--duration-feedback`| 240ms   | state feedback   |
| `--ease-standard`    | `cubic-bezier(0.2,0,0,1)`   |
| `--ease-emphasized`  | `cubic-bezier(0.3,0,0,1)`   |

All durations collapse to `0ms` under `prefers-reduced-motion: reduce`.

---

## Component variants

Primitives live in `src/components/ui`. Variants are expressed with
`class-variance-authority`.

**Button / IconButton**

- `variant`: `primary` · `secondary` · `ghost` · `danger`
- `size`: `sm` · `md` · `lg`
- `IconButton` also has an `active` state and **requires** a `label`.

**Other primitives:** `TextField`, `NumberField` (draft-string editing, tabular,
commit on blur/Enter), `Slider` (Radix, labeled thumb), `SegmentedControl`
(radiogroup, arrow-key roving focus), `Tooltip`/`Popover`/`Dialog` (Radix,
tokenized), `Badge` (tones), `StatusMessage` (info/success/warning/danger with
icon + text), `Card`, `KeyboardKey`, `Skeleton`, `Toast` (imperative + polite
live region).

---

## Interaction-state rules

- **Focus:** every interactive element shows a 2px focus ring
  (`--color-focus-ring`) with a 2px offset on `:focus-visible`.
- **Hover:** subtle surface/border shift only; no scale on general controls
  (only the slider thumb and dragged markers scale).
- **Active/pressed:** accent controls darken to `--color-accent-pressed`.
- **Disabled:** reduced opacity + `pointer-events: none`; never rely on color
  alone to signal disabled — disabled controls are also non-interactive.
- **Selected:** segmented/preset selections get an elevated surface **and** a
  weight/border change, not just a color.

---

## Accessibility rules

- Icon-only controls **must** pass a `label` (enforced by `IconButtonProps`).
- Sliders and the timeline expose `aria-valuetext` in human units.
- Significant changes announce through the single `aria-live="polite"` region
  (`features/session/announcer`). Never announce the playhead.
- Marker identity uses hue **+** letter; loop state uses badge text + icon.
- Maintain AA contrast: primary text on canvas/surface, accent-contrast text on
  accent fills.

---

## Correct vs incorrect usage

✅ **Correct**

```tsx
<IconButton label="Set marker A at the playhead" variant="secondary">
  <Flag />
</IconButton>

<span className="tabular text-timestamp text-primary">{formatTimestamp(t)}</span>
```

❌ **Incorrect**

```tsx
// No accessible name; raw color; non-tabular measurement.
<button className="bg-[#e8a13a]"><Flag /></button>
<span>{t.toFixed(3)}s</span>

// One-off control instead of the Button primitive.
<div onClick={...} className="cursor-pointer rounded bg-orange-500 px-4">Go</div>
```

Prefer the primitive + a semantic token every time; if a needed variant is
missing, add it to the primitive rather than styling inline.
