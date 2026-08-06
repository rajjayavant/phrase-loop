# CLAUDE.md

Orientation for agents working in this repo. Read this before searching the
codebase; it covers the things that are expensive to rediscover.

`README.md` is the long-form reference (URL format, measured YouTube findings,
accessibility notes). `DESIGN_SYSTEM.md` covers tokens and components.
`MANUAL_TESTING.md` is the checklist against the real player.
**`SEO.md`** covers search: what is set up, the keyword and competitor data
measured in August 2026, and the decisions taken. Read it before changing
metadata, `home-content.tsx`, `robots.ts`, `sitemap.ts`, or writing any
user-facing marketing copy. It will save you from redoing paid research.

---

## What this is

**PhraseLoop** (`phraseloop.online`) — a practice tool for musicians. Mark a
passage of a video or audio track, slow it down, and loop it until it feels
natural.

The app root `/` **is the player**, not a landing page. A first-time visitor
gets a default video with a whole-clip A→B loop already armed. Returning
visitors reopen their last video with its markers, speed, loop, and volume
restored silently.

Source-agnostic by design: a YouTube link and a local video/audio file give
the **identical** experience.

Below the player, and above the footer, `/` also renders `HomeContent` (the
`h1`, an intro, how-it-works, and an FAQ). It is passed to `PracticeWorkspace`
as a child so it lands inside that component's layout, since the workspace
owns the footer. It exists so the root URL has something to index; the tool
still comes first on the page. The local-file route renders none of it. See
`SEO.md` before touching it.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript (strict, with
`noUncheckedIndexedAccess`) · Tailwind 3 + CSS custom-property tokens ·
Radix primitives · Zustand · Zod · Vitest · Playwright.

## Commands

```bash
npm run dev         # dev server
npm run typecheck   # tsc --noEmit
npm test            # vitest run (94 unit tests)
npm run test:e2e    # playwright, uses the mock adapter
npm run lint
npm run format
```

There is **no CI**. Run `typecheck` and `test` yourself before claiming done.

---

## Architecture: the one thing to understand

Everything hangs off the **player-adapter interface**
(`src/features/player/types/player-adapter.ts`).

UI components and the loop engine talk *only* to that interface, never to
YouTube directly. Three implementations exist:

| Adapter | Purpose |
| --- | --- |
| `youtube-adapter.ts` | The real IFrame Player API |
| `local-file-adapter.ts` | A `blob:` URL from an uploaded file — same-origin, so full control |
| `mock-adapter.ts` | Deterministic virtual clock for tests; enable with `?mock=1` |

**Implication:** to change playback behaviour, change the adapter, not the UI.
To add a source (Vimeo, Instagram), write a new adapter — no UI changes needed.

### Layer boundaries, and why they matter

- `src/features/loop/engine/loop-state.ts` is **pure** — no React, no player
  references. It answers "given an action, what's the next valid loop state?"
  and "given a position, should we wrap, and to where?". Keep it that way; it
  is the most heavily tested file in the repo.
- `src/features/player/stores/` — Zustand stores for player, speed, and local
  source.
- `src/lib/` — pure helpers (URL parsing, timestamp formatting, Zod
  validation). No React.

---

## Non-obvious things that will bite you

**YouTube quantizes playback rate to the nearest 0.05.** This is measured, not
documented. Request `0.34` and you get `0.30`. The speed model therefore tracks
`requestedRate` and `appliedRate` **separately**, listens for
`onPlaybackRateChange`, and displays what was actually applied. Never display a
rate the player did not confirm. Details and the measurement table are in
`README.md`.

**Loop wrapping uses a ~40 ms look-ahead** on a rAF clock evaluating roughly
every 30 ms, because YouTube seeking is not frame-accurate. This optimizes
*perceived* tightness. Do not claim frame accuracy anywhere in UI copy.

**The dialog needs `dialog-in`, not `content-in`.** A centred dialog is
positioned with `-translate-x-1/2 -translate-y-1/2`, and an animation's
`transform` **replaces** that rather than composing with it. Using `content-in`
on a centred element makes it fly in from off-centre. Tooltips, popovers, and
toasts are not transform-centred, so `content-in` is correct for them.

**Local files never leave the device.** They live in IndexedDB as `local:<id>`.
A shared `?src=local:...` link only reopens on the same browser. Do not add
upload.

**The playhead is never written to the URL.** Shareable state is mirrored with
debounced `history.replaceState` (400 ms). Writing the playhead would thrash
history and break sharing.

**Every URL param is Zod-validated** in `src/lib/validation/practice-params.ts`.
Invalid values fall back safely; the route must never crash on a bad link.

---

## Conventions

- Keyboard-first. Shortcuts pause inside inputs, textareas, and
  contenteditable. Every interactive element has a visible focus ring.
- Marker identity is **never colour-only** — A and B carry letters too.
- One polite `aria-live` region announces meaningful changes (marker set, loop
  toggled, speed adjusted). Playhead updates are **never** announced.
- `prefers-reduced-motion` collapses motion tokens to `0ms`.
- Targeting WCAG 2.2 AA.
- Styling goes through the design tokens in `src/styles/tokens.css` — avoid
  raw hex values.

## Brand

The product is **PhraseLoop**. The wordmark
(`src/components/brand/wordmark.tsx`) is repeat barlines from music notation
enclosing an uneven two-bar waveform — a phrase, marked to repeat. `icon.png`,
`apple-icon.png`, and `opengraph-image.png` in `src/app/` use the same glyph;
regenerate all of them together if it changes.

The repo was renamed from `loop-practice` on 2026-07-29, and the product from
"Looper" to "PhraseLoop". `src/` is clean of the old name, but `README.md`
(5 mentions) and `DESIGN_SYSTEM.md` (2) have not been rewritten yet.

## Deployment

Runs on an EC2 instance behind Nginx with PM2, provisioned by
[nextdeploy](https://github.com/rajjayavant/nextdeploy). `~/redeploy.sh` on
that box pulls, installs, builds, and restarts.

---

## Working agreements

- **Do not commit, and do not push**, unless explicitly asked. Finish the work
  and leave it in the working tree for the owner to review and commit. Say
  plainly what you changed and which files are dirty.
- Note: something in this environment has auto-committed and pushed on file
  save before, so a clean `git status` does **not** prove your work is
  uncommitted. Check `git log origin/main..HEAD` and the branch tip before
  reporting where things stand — and if it happened, say so rather than
  letting it pass silently.
- Prefer SVG you author over generated raster images for icons, diagrams, and
  anything containing text.
- The engine is well tested; if you change loop or speed behaviour, extend
  `loop-state.test.ts` or `speed-state.test.ts` rather than testing through
  the UI.
