# Looper Design System

A documented, token-driven design language. The product should feel **precise,
modern, quiet, professional, slightly technical, and warm enough for long
practice sessions** — a musical instrument, not a dashboard.

All tokens live in [`src/styles/tokens.css`](src/styles/tokens.css) as CSS
custom properties and are exposed to Tailwind via
[`tailwind.config.ts`](tailwind.config.ts). **Components reference semantic
utilities (`bg-surface`, `text-secondary`, `text-marker-a`) — never raw hex.**

---

## Principles

1. **Precision over decoration.** Every control has a clear, immediate purpose.
   No decorative animation, no glassmorphism-everywhere, no gradient soup.
2. **Calm by default, power on demand.** The default surface stays uncrowded —
   video, timeline, transport, and a slim speed row. Precision controls (marker
   editing, nudge granularity, full speed presets) live in a collapsible
   **Advanced settings** panel so they never dominate.
3. **Dark-first, theme-ready.** The palette is dark-first (practice happens in
   low light) but every color is a semantic token, and a `light` theme is
   already defined under `:root[data-theme="light"]`.
4. **One system.** Reusable primitives, consistent spacing, one radius scale,
   one motion scale. No one-off versions of common controls.
5. **Never color-only.** State and identity are always reinforced with text,
   shape, or iconography.

---

## Color tokens

Semantic name → token (dark theme value shown for reference).

| Semantic          | Token                       | Dark      |
| ----------------- | --------------------------- | --------- |
| Canvas            | `--color-canvas`            | `#0b0d10` |
| Surface           | `--color-surface`           | `#14171c` |
| Elevated surface  | `--color-elevated`          | `#1b1f26` |
| Subtle surface    | `--color-subtle`            | translucent |
| Primary text      | `--color-text-primary`      | `#f2f4f7` |
| Secondary text    | `--color-text-secondary`    | `#b3bac4` |
| Muted text        | `--color-text-muted`        | `#7d8592` |
| Border            | `--color-border`            | `#262b33` |
| Strong border     | `--color-border-strong`     | `#363d47` |
| Accent            | `--color-accent`            | `#e8a13a` (warm amber) |
| Accent hover      | `--color-accent-hover`      | `#f0b055` |
| Accent pressed    | `--color-accent-pressed`    | `#cf8c2c` |
| Success           | `--color-success`           | `#59c088` |
| Warning           | `--color-warning`           | `#e0b64a` |
| Destructive       | `--color-destructive`       | `#e0685f` |
| Focus ring        | `--color-focus-ring`        | `#7cb8ff` |
| Timeline track    | `--color-timeline-track`    | `#22272f` |
| Loop region       | `--color-loop-region`       | amber @ ~14% |
| Marker A          | `--color-marker-a`          | `#4ea1ff` (blue) |
| Marker B          | `--color-marker-b`          | `#f2748c` (rose) |

Markers use **distinct hues _and_ letter labels** so they are distinguishable
without color. Tinted status surfaces (`--color-*-surface`) back badges and
status messages.

---

## Typography

One variable sans — **Inter**, via `next/font` (`--font-inter`). Timestamps,
speeds, and measurements use **tabular numerals** (`.tabular`).

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
