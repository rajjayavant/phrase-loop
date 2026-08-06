# SEO.md

What is set up, what was measured, and what was decided. Written so a future
agent does not repeat research that has already been paid for.

Findings are dated because search data goes stale. Anything older than a few
months should be re-checked before acting on it.

---

## Read this first

**Search is not the growth channel for this product.** That is the conclusion
of the keyword research below, not a guess. Nineteen or more competing tools
are fighting over queries that are mostly under 100 monthly searches. Getting
the technical setup right is worth doing once, and it is done. Building a blog
or a link-building programme on top of it is not currently justified.

If you are asked to "improve SEO", check the **Open items** section at the
bottom before proposing new content. The remaining wins are operational, not
editorial.

---

## Current state

| Element | Status |
| --- | --- |
| `<title>`, description, canonical | Correct. Description is 149 chars, deliberately under 155. |
| Open Graph + Twitter card | Complete, with a 1200x630 image and explicit dimensions. |
| `robots.txt`, `sitemap.xml` | Served from `src/app/robots.ts` and `sitemap.ts`. Both 200. |
| Root page content | 847 words, 1 `h1`, 3 `h2`, 12 `h3`. Lives in `src/features/marketing/home-content.tsx`. |
| Structured data | `SoftwareApplication` only. See "Why not FAQPage" below. |
| `www` -> apex | 301 at nginx, single hop. |
| `/practice` -> `/` | 308 in `next.config.ts`, query strings preserved. |
| Compression | gzip on. |
| Search Console | **Not set up.** This is the largest remaining gap. |
| HTTP/2 | **Not enabled.** Server still negotiates HTTP/1.1. |

---

## Decisions, and the reasoning behind them

### The root is the player, and the content sits below it

`/` renders `PracticeWorkspace` first and `HomeContent` after it, passed as a
child so it lands above the footer that the workspace owns. The owner
explicitly did not want the tool pushed down the page for search engines.

Heading order does not need to match visual order. Google's SEO Starter Guide
says outright that headings out of semantic order do not matter for Search, so
placing the `h1` below the player costs nothing.

The local-file route (`?src=local:...`) deliberately renders **no** content.
That URL is reached by opening a file, never from a search result.

### Query parameters are handled with a canonical, not a redirect

`?v=`, `?a=`, `?b=` and friends are the sharing mechanism. Redirecting them
would break the product. The self-referencing canonical on `/` consolidates
them instead, which is exactly what Google recommends for parameter
duplicates.

Do **not** add `Disallow` rules for parameters in `robots.txt`. The player
lives at the root now, so that would block the homepage.

### Why not FAQPage structured data

Google restricted FAQ rich results to government and health sites in August
2023, then **deprecated them entirely on 7 May 2026**. FAQPage markup would be
valid and render nothing. `SoftwareApplication` is used instead because it is
still supported.

The FAQ *content* still matters. It can win featured snippets and People Also
Ask placements through ordinary content ranking, which does not depend on
schema.

### No `aggregateRating` in the structured data

There is no rating system in the product. Marking up ratings that were not
collected violates Google's structured data policy and risks a manual action.

### The meta keywords tag was removed

Google has ignored it since 2009. It also published the target keyword list to
competitors.

---

## Keyword research (August 2026)

Data from Ahrefs Keyword Generator, free tier. Volumes are buckets, not exact
counts. KD labels are Ahrefs' own.

### The one finding that matters

**Only the YouTube-looping cluster has meaningful volume.** Every other angle
tested came back under 100 searches per month, or with intent that cannot be
converted.

| Seed | Result |
| --- | --- |
| `loop youtube video` | 634 keywords. `how to loop a youtube video` is **>1000, Easy**. Several others >100, Easy. |
| `slow down youtube video` | 45 keywords, best is >100 Easy, rest <100. |
| `learn song by ear` | 11 keywords, **all <100**. |
| `learn guitar solo` | 13 keywords, **all <100**. |
| `slow down audio` | 216 keywords, **all <100**, and dominated by DAW support queries. |
| `loop audio file` | 14 keywords, **all <100**, mostly iPhone and Audacity questions. |

### Two traps in that data

**The high-volume loop queries are answered by YouTube itself.** Someone
searching "how to loop a youtube video" usually wants the native right-click
Loop, which is why Google's own Help page ranks first. The addressable framing
is looping a **section**, which YouTube genuinely cannot do (confirmed against
Google's own documentation: its Loop repeats the entire video or playlist,
with no start and end points).

**The "Easy" terms are mostly one query in many phrasings.** `how to loop a
youtube video`, `how to loop a video on youtube`, `how to make a youtube video
loop`, `how to put a youtube video on loop` and so on are the same intent.
Google matches on meaning, so answer it once, well. Writing a block per
phrasing is keyword stuffing and would fail the helpful content guidance.

### Local files: covered in content, not targeted in search

Local-file support is the product's strongest differentiator (almost no
competitor has it) and its **weakest** search angle. The queries that exist
belong to Audacity, Premiere, GarageBand and the iPhone Files app. Someone
searching "how to slow down audio in audacity" already has Audacity open.

Keep it in the FAQ and intro as a conversion argument. Do not build a page or
keyword strategy around it.

---

## The guide pages, and why they exist (August 2026)

This reverses an earlier decision in this file. The first pass concluded "no
blog, the volume does not justify it." That conclusion was drawn from
**tool-intent** keywords only (`loop youtube video`, `slow down audio`), and
it was too narrow.

### What changed

Searching the way a musician actually phrases a problem, rather than the way
someone shopping for a tool phrases it, turns up a large and active content
ecosystem: Fender, National Guitar Academy, TakeLessons, Musical U, Guitar
Chalk and others all rank for queries like "how to get better at guitar" and
"best way to learn a guitar solo."

**Every one of those articles converges on the same advice**, in almost the
same words:

- "Learn them at half-speed and then slowly speed up"
- "Start at half your target tempo"
- "Break complex passages into smaller sections and master each slowly"
- "Only increase tempo when you can play the passage perfectly"

**And none of them give the reader a way to actually do it with a recording.**
They describe the method and stop. Metronome articles cover this for playing
from notation, but not for learning from a video or audio track, which is how
most people learn now.

That gap is the entire content strategy. PhraseLoop *is* that method
mechanised, so the tool belongs inside step two of the instructions, not as a
call to action bolted on at the end.

### The trade-off, stated honestly

- **Competition is much higher** than for the tool-intent queries. Fender and
  National Guitar Academy have real domain authority. DR 0 will not outrank
  them quickly.
- **Conversion is softer.** Someone asking "how to get better at guitar" is
  browsing, not looking for a tool.
- **These pages must be genuinely useful.** A thin article that exists to
  funnel traffic is precisely what Google's helpful content system demotes. If
  a page cannot stand on its own without the product mention, it should not
  ship.

The advantage that makes it worth doing anyway: **specificity.** The
incumbents can only say "practise slowly." This site can say "loop bars 17 to
20 at 50 percent, raise to 60 when you can play it clean three times," because
the tool that does it was built here.

### The ten pages

Grouped by intent. Workflow pages first: those are the ones where looping is
intrinsic to the answer rather than an add-on.

| URL | Intent |
| --- | --- |
| `/guides/how-to-learn-a-guitar-solo` | Workflow. The strongest fit. |
| `/guides/how-to-practice-slowly-and-speed-up` | Workflow. The method itself. |
| `/guides/how-to-learn-a-song-by-ear` | Workflow. Transcription requires looping. |
| `/guides/how-to-practice-a-difficult-passage` | Workflow, instrument agnostic. |
| `/guides/how-to-transcribe-music` | Workflow, for the serious end. |
| `/guides/how-to-get-better-at-guitar` | Broad, contested, high demand. |
| `/guides/how-to-get-better-at-piano` | Broad, separate audience. |
| `/guides/how-to-loop-a-section-of-a-youtube-video` | Tool intent. The one proven >1000 query. |
| `/guides/how-to-slow-down-a-youtube-video` | Tool intent, >100 Easy. |
| `/guides/does-slowing-down-a-video-change-the-pitch` | Factual. Best featured-snippet candidate. |

`/guides` is an index page listing all ten.

### Rules for these pages specifically

- The advice must be correct and useful **on its own**. Someone who never
  clicks through should still leave better informed.
- Link to `/` with descriptive anchor text, at the point in the instructions
  where looping is the thing being described. Not a banner, not a footer CTA.
- Cross-link two or three related guides so the cluster passes authority
  around internally.
- Do not repeat the same page under multiple phrasings. Google matches on
  meaning; `how to loop a youtube video` and `how to put a youtube video on
  loop` are one page, not two.

---

## Competitive landscape (Domain Rating, August 2026)

Measured via the Ahrefs free DR endpoint.

| Site | DR | Homepage words | FAQ |
| --- | --- | --- | --- |
| looptube.io | **38** | 200-250 | No |
| looptube.xyz | 9 | 1200-1500 | 6 questions |
| riffloop.app | 9 | - | - |
| looper.tube | 8 | - | - |
| slowdownpractice.com | 5 | - | - |
| infinitelooper.tube | 2.4 | 650-700 | 5 questions |
| loopab.com | 0 | - | - |
| **phraseloop.online** | **0** | 847 | 8 questions |

**looptube.io is the only real incumbent.** It ranks on authority, not
content. Competing for its head terms (`loop youtube video`, `ab repeat
youtube`) from DR 0 is not winnable in the near term.

Everything else in the niche is DR 0-9, which means **content, not links, is
what separates you from them.** LoopAB ranks at DR 0. That is the evidence
that the gap is pages, not authority.

The convergent content shape across the sites that rank: `h1` -> intro ->
numbered steps -> audiences -> FAQ. `home-content.tsx` follows it.

---

## Rules for writing content here

- **Verify every product claim against the code.** Speed bounds come from
  `src/lib/validation/practice-params.ts` (0.25x to 2x). Shortcuts come from
  `src/features/shortcuts/shortcut-definitions.ts`. The "files never leave
  your device" claim holds because `src/` contains no `fetch` or `FormData`
  upload path; re-check that before repeating it.
- **Never claim frame accuracy.** See CLAUDE.md. The loop uses a look-ahead
  because seeking is not frame-accurate, and UI copy must not imply otherwise.
- **No em dashes anywhere in user-facing copy.** Standing instruction from the
  owner.
- **One `h1` per page.**
- **Never add hidden text for crawlers.** No `sr-only` headings that exist
  only for search engines.
- Write for a reader first, then check the keyword landed somewhere natural.
  Keyword density has not been a ranking signal for over a decade.

---

## Open items

In priority order.

1. **Set up Google Search Console and submit the sitemap.** Nothing else
   matters until this is done. The site currently returns no results for its
   own brand name, meaning it is not indexed. Free, and it becomes the source
   of truth that replaces every estimate in this document.
2. **Enable HTTP/2 in nginx.** Change `listen 443 ssl;` to
   `listen 443 ssl http2;` in the apex server block, then `sudo nginx -t &&
   sudo systemctl reload nginx`. Not a direct ranking factor, but a real speed
   gain.
3. **Bing Webmaster Tools.** Small direct traffic, but it feeds ChatGPT
   search. Can be imported from Search Console in a few clicks.
4. **Re-read this file in 4 to 8 weeks against Search Console data.** The
   Performance report shows queries the site actually appears for, which is
   ground truth and beats both the Ahrefs estimates and the reasoning here.

### Deliberately not doing

- Link building. Premature at this stage.
- Per-instrument *landing* pages (`/for-guitar`, `/piano-practice`) that are
  just the tool with different copy. Competitors have them, but the underlying
  tool-intent queries measured under 100. The `/guides` pages cover the same
  audience with genuine content instead.
- Additional schema types beyond `SoftwareApplication`.
- Writing a separate page per keyword phrasing. See the rules above.

**Superseded:** "no blog, the volume does not justify it." That was based on
tool-intent keywords only. See "The guide pages" above for what changed and
why.

---

## Where things live

| File | Contains |
| --- | --- |
| `src/app/layout.tsx` | Title, description, Open Graph, Twitter, canonical. |
| `src/features/marketing/home-content.tsx` | The `h1`, intro, steps, and FAQ. |
| `src/features/marketing/structured-data.tsx` | `SoftwareApplication` JSON-LD. |
| `src/app/sitemap.ts` | Sitemap. Exports `BASE_URL`, which `robots.ts` imports. |
| `src/app/robots.ts` | robots.txt. Nothing is disallowed, on purpose. |
| `next.config.ts` | The `/practice` -> `/` 308 redirect. |
| nginx, on the EC2 box | `www` -> apex 301. Not in this repo. |
