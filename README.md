# Looper

**Master difficult passages, one loop at a time.**

Looper is a focused practice instrument for musicians. It opens straight into
the player — a default video is loaded so there is nothing to set up. Paste a
link to swap in any YouTube video, mark the exact section you need, slow it
down, and loop it continuously until it feels natural. It is designed to feel
calm, precise, and keyboard-driven — not like a generic YouTube utility.

**Defaults & memory:**

- The app root (`/`) is the player, not a landing page. First-time visitors get
  a default video with a whole-clip A→B loop already armed (A at the start, B at
  the end, looping on) — drag the handles inward to narrow it.
- The most recently opened video is cached in the browser, so returning to `/`
  reopens **your last link**, not the default.
- Each video's markers, speed, loop, and volume are saved per video ID and
  **restored silently** when you return to that video.

> Looper streams video through the **official YouTube IFrame Player API**. It
> does not download, proxy, scrape, or host any content, and it never accesses
> the contents of the cross-origin player iframe.

---

## Stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | Next.js 15 (App Router), React 19                  |
| Language           | TypeScript (strict, `noUncheckedIndexedAccess`)    |
| Styling            | Tailwind CSS 3 + CSS custom-property design tokens |
| UI primitives      | Radix UI (dialog, popover, tooltip, slider, slot)  |
| Icons              | lucide-react                                       |
| Client state       | Zustand                                            |
| Validation         | Zod (URL params + persisted sessions)              |
| Unit tests         | Vitest + Testing Library                           |
| E2E tests          | Playwright (mock adapter)                          |
| Lint / format      | ESLint (next + prettier) / Prettier                |

No unofficial YouTube libraries are used.

---

## Setup

```bash
pnpm install
cp .env.example .env.local   # optional; no secrets required
pnpm dev                     # http://localhost:3000
```

The YouTube IFrame API is loaded from `https://www.youtube.com/iframe_api` on
the client and needs **no API key**.

### Commands

| Command                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| `pnpm dev`                 | Start the dev server                            |
| `pnpm build` / `pnpm start`| Production build / serve                        |
| `pnpm typecheck`           | `tsc --noEmit` (strict)                          |
| `pnpm lint`                | ESLint                                           |
| `pnpm format`              | Prettier write                                  |
| `pnpm test`                | Unit tests (Vitest)                             |
| `pnpm test:watch`          | Unit tests in watch mode                        |
| `pnpm test:e2e`            | Playwright critical-flow tests                  |
| `pnpm test:e2e:install`    | Install the Playwright browser (first run)      |

E2E tests drive a deterministic **mock player** via `?mock=1`, so they never
depend on live YouTube playback.

---

## Architecture

The codebase enforces clear boundaries between YouTube integration, playback
state, loop logic, UI, and URL/session serialization.

```
src/
  app/
    page.tsx                 Root — client redirect to last/default video
    practice/
      page.tsx               Validates params → workspace or invalid-link state
      loading.tsx            Skeleton while the route loads
      error.tsx              Route error boundary
  components/
    brand/                   Wordmark
    ui/                      Design-system primitives (Button, Slider, Dialog…)
  features/
    link-input/              Paste-a-link entry point
    player/
      adapters/              YouTubePlayerAdapter, MockPlayerAdapter, API loader
      components/            Player surface, transport, speed, workspace shell
      hooks/                 use-player-mount, use-playhead (rAF clock)
      stores/                Zustand player store + pure speed-state model
      types/                 PlayerAdapter contract
    loop/
      engine/                Pure A–B loop state machine (no React)
      components/            Timeline, loop toggle, marker controls
      hooks/                 Timeline pointer-drag
    shortcuts/               Keyboard registry + handler + dialog
    session/                 localStorage persistence, URL sync, copy-link,
                             last-video cache, analytics, aria-live announcer
  lib/
    youtube/                 parseYouTubeUrl + video-ID validation
    validation/              Zod schemas for practice params
    formatting/              Timestamp format/parse (MM:SS.mmm / HH:MM:SS.mmm)
    utilities/               cn(), clamp(), round()
  styles/tokens.css          Design tokens (colors, type, space, motion…)
```

### Data-flow principles

- **The playhead never lives in React state.** A single
  `requestAnimationFrame` clock (`use-playhead`) reads the adapter's current
  time and pushes it imperatively to the timeline and timestamp DOM nodes, and
  drives the loop engine. Playback at 60fps therefore causes **zero** React
  re-renders across the tree.
- **Discrete state lives in one Zustand store** (`player-store`): status,
  duration, loop, speed, volume, and preferences. The UI and keyboard layer
  call intent-level actions (`setMarkerA`, `toggleLoop`, `requestSpeed`, …).
- **Loop logic is a pure state machine** (`loop/engine/loop-state.ts`) with no
  React and no player references — fully unit-tested in isolation.

### Player-adapter design

All playback goes through a source-independent contract
(`features/player/types/player-adapter.ts`):

```ts
interface PlayerAdapter {
  load(videoId, startSeconds?): Promise<void>;
  play(); pause(); seekTo(seconds);
  getCurrentTime(); getDuration();
  getPlaybackRate(); getAvailablePlaybackRates();
  setPlaybackRate(rate); setVolume(v); getVolume(); mute(); unmute(); isMuted();
  isReady(); getStatus(); destroy();
}
```

- `YouTubePlayerAdapter` is the only production implementation. **Every**
  YouTube-specific concern — the `YT.Player` object, its numeric state codes,
  and its error codes — is confined to this class. No presentational component
  imports anything from YouTube.
- `MockPlayerAdapter` implements the same contract with a virtual clock for
  deterministic tests.
- **Adding another source later** (Instagram, Vimeo, a local file) means
  writing one new class that satisfies `PlayerAdapter` and registering it in
  `use-player-mount`. No UI, store, or loop code changes.

---

## URL-state format

The practice route is fully shareable:

```
/practice?v=VIDEO_ID&a=43.12&b=49.87&speed=0.75&loop=1
```

| Param   | Meaning                        | Validation / fallback                     |
| ------- | ------------------------------ | ----------------------------------------- |
| `v`     | YouTube video ID (required)    | Must match `[A-Za-z0-9_-]{11}` or → error |
| `a`     | Loop start (seconds)           | Non-negative finite number, else dropped  |
| `b`     | Loop end (seconds)             | Non-negative; dropped if `b ≤ a`          |
| `speed` | Requested playback rate        | Clamped to `[0.25, 2]`, else dropped      |
| `loop`  | Loop enabled                   | `1`/`true` → on                           |
| `mock`  | Use the mock adapter (testing) | `1` → mock                                |

Every parameter is validated with Zod; invalid values fall back safely and
never crash the route. Shareable state is mirrored into the URL with debounced
`history.replaceState` (400 ms) — the playhead is **never** written to the URL.

### Seeding precedence (what you see when a video opens)

The workspace decides its initial markers/speed/loop once, in this order:

1. **URL markers win.** A shared `?a=…&b=…` link opens exactly as sent (looping
   on by default when markers are present).
2. **Saved session.** Otherwise, if this video was practiced before, its saved
   markers/speed/loop/volume are **restored silently** (a polite screen-reader
   announcement, no interrupting prompt).
3. **Fresh video.** Otherwise a **whole-clip loop** is armed: marker A at 0,
   marker B at the full duration (set once the player reports it), looping on.

Sessions are stored per video ID in `localStorage`. Separately, the most recent
video ID is cached so a bare visit to `/` reopens your last link rather than the
default video.

---

## YouTube playback-rate findings (measured)

Requirement: never display a requested rate the player did not actually apply.
We measured the real embedded player (`jNQXAC9IVRw`) directly:

- `getAvailablePlaybackRates()` reports **8 discrete rates**:
  `0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2`.
- **But the API accepts far finer values than that list.** Requesting `0.9`,
  `1.1`, or `1.75` applied exactly, even though some are not in the reported
  list.
- **Requested rates are quantized to the nearest 0.05**, rounding down at the
  midpoint. Confirmed samples:

  | Requested | Applied | Requested | Applied |
  | --------- | ------- | --------- | ------- |
  | 0.25      | 0.25    | 0.63      | 0.60    |
  | 0.34      | 0.30    | 0.67      | 0.65    |
  | 0.36      | 0.35    | 1.13      | 1.10    |
  | 0.50      | 0.50    | 1.17      | 1.15    |
  | 0.75      | 0.75    | 1.75      | 1.75    |

**How Looper handles this:** the speed model tracks `requestedRate` and
`appliedRate` separately. On every request we call `setPlaybackRate`, listen
for `onPlaybackRateChange`, read the *actual* applied rate, and display that.
When they diverge we show a compact, non-disruptive status such as:

> YouTube applied 0.35× instead of 0.34×.

We never fabricate custom-rate support, and never make frame-accuracy claims.
The speed model is modular so a future adapter can offer a wider range.

---

## Loop accuracy

YouTube seeking is not guaranteed frame-accurate. To keep the perceived loop
tight, the engine wraps with a small look-ahead (~40 ms before marker B) and
the rAF clock evaluates the wrap decision roughly every 30 ms. This optimizes
perceived quality without claiming precision the player cannot deliver.

---

## Accessibility notes

- Full keyboard operation; shortcuts pause inside inputs/textareas/contenteditable.
- Visible focus rings on every interactive element (design-token focus ring).
- Icon-only buttons carry `aria-label`s; the slider and timeline expose
  `aria-valuetext`.
- Marker identity is never color-only — A/B are also labeled with letters.
- A single polite `aria-live` region announces significant changes (marker set,
  loop enabled, speed adjusted, invalid range, link copied). Playhead updates
  are **never** announced.
- `prefers-reduced-motion` collapses motion tokens to `0ms`.
- Targeting WCAG 2.2 AA where practical.

See `DESIGN_SYSTEM.md` for the full token and component reference, and
`MANUAL_TESTING.md` for the manual checklist against the real player.

---

## Current limitations

- **YouTube only.** Instagram, uploads, auth, payments, and cloud storage are
  intentionally out of scope for this version.
- Playback rate is bounded to `[0.25×, 2×]` and quantized by YouTube to 0.05.
- Loop wrap precision is bounded by YouTube seek accuracy (see above).
- Sessions persist in `localStorage` only (per-video, this browser).
- Videos with embedding disabled, age restrictions, or that are private/removed
  cannot be played — Looper detects these and shows an explanatory state with a
  link to open the video on YouTube.

---

## Future Instagram-adapter direction

Because playback is behind `PlayerAdapter`, an Instagram adapter would be a new
class implementing the same interface (`load`, `play`, `seekTo`,
`getCurrentTime`, rate controls, …). The store, loop engine, timeline, and all
controls would work unchanged. The main new work would be Instagram's embed/API
constraints (which may not support arbitrary seeking or rate control) — the
speed model already represents an `"unsupported"` status for exactly this case,
and the loop engine already tolerates imperfect seeking.
