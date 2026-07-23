# Manual Testing Checklist — real embedded YouTube player

Automated tests use the mock adapter. These cases must be run by hand against
the **real** YouTube player, because embedded playback, seeking, and rate
quantization are non-deterministic.

Run `pnpm dev` and use `/practice?v=VIDEO_ID` (no `mock` param).

## Default video, header link input & memory

- [ ] Visiting `/` in a fresh browser opens the **default video** with a
      whole-clip loop (A at 0:00, B at the end) and looping **on**.
- [ ] The header link input loads another video in place.
- [ ] After loading a video, visiting `/` again reopens **that** video (cached
      last link), not the default.
- [ ] Returning to a previously practiced video restores its markers/speed/loop
      **silently** (no prompt); a screen reader announces the restore.

## YouTube URL types (via header link input)

- [ ] `https://www.youtube.com/watch?v=ID` opens practice with that video.
- [ ] `https://youtu.be/ID` opens correctly.
- [ ] `https://www.youtube.com/shorts/ID` opens correctly.
- [ ] `https://www.youtube.com/embed/ID` opens correctly.
- [ ] URL with extra params (`&list=…&index=…`) still resolves the ID.
- [ ] URL with a timestamp (`&t=90` or `?t=1m30s`) seeds marker A near 1:30.
- [ ] A bare 11-char ID is accepted.
- [ ] A non-YouTube URL marks the field invalid and does **not** navigate.

## Video variety

- [ ] **Long video (> 1 hour):** timestamps render as `HH:MM:SS.mmm`; timeline
      duration label shows hours.
- [ ] **Shorts:** vertical video loads and loops.
- [ ] **Standard music/tutorial video:** loads and loops.

## Unsupported / error states

- [ ] **Embedding disabled** (owner blocks off-site playback): error overlay
      reads "Playback disabled here" with an "Open on YouTube" link.
- [ ] **Unavailable / private / removed** video: "Video unavailable" overlay.
- [ ] **Age-restricted** video: shows an error overlay rather than a blank box.
- [ ] **Offline / network drop** during load: player region explains the
      problem; nothing is left blank.

## Playback & seeking

- [ ] Player does **not** autoplay; a "Start" overlay appears until the user
      clicks/presses Space.
- [ ] Play/pause via the button and via Space/K.
- [ ] Seek ±5s, ±1s, and fine ±100ms buttons all move the playhead.
- [ ] Arrow keys seek 1s; Shift+arrows seek 100ms.
- [ ] Native YouTube branding and controls remain visible and usable.

## Speed changes (rate quantization is real — see README)

- [ ] Presets (0.25×…2×) apply and the header shows the applied rate.
- [ ] Typing an exact rate like `0.34` and pressing Enter applies `0.30` and
      shows "YouTube applied 0.30× instead of 0.34×".
- [ ] `J` reduces speed, `Shift+J` increases; slider and +/- work.
- [ ] Reset (↺) returns to 1×.
- [ ] Changing speed does **not** clear the loop or markers.

## Markers & loops

- [ ] `A` sets marker A at the playhead; `B` sets marker B.
- [ ] Setting A after B (or B before A) clears the other with an announcement,
      rather than creating an inverted region.
- [ ] Drag marker A and marker B on the full timeline; they cannot cross or
      leave the video bounds.
- [ ] Enter an exact timestamp in a marker field (`MM:SS.mmm`); invalid text is
      rejected and the field reverts.
- [ ] Nudge a marker with the ◄ ► buttons and with `[` / `]` at 10ms / 100ms /
      1s precisions (selector top-right of the Markers card).
- [ ] **Very short loop** (< ~0.2s): loop shows "Region too short" and cannot be
      enabled.
- [ ] Enable loop (`L` or the button): playback wraps from B back to A
      continuously; the repetition count increments.
- [ ] Seeking outside the loop region is still possible while looping.
- [ ] Pausing does not clear the loop; resuming continues looping.
- [ ] Clear A, clear B, and clear-entire-loop actions each work.

## Timeline & layout

- [ ] Full-video timeline: click/drag empty track to seek; drag A and B handles
      to reshape the loop. The three controls never fight for the same pixels.
- [ ] Hover shows a time preview tooltip (desktop).
- [ ] Play/pause is centered horizontally under the video.
- [ ] The Loop toggle in the bottom bar turns looping on/off (on by default).
- [ ] Marker editing lives inside the **Advanced settings** dropdown.
- [ ] The Speed row sits under the timeline; full presets + exact entry are in
      Advanced settings.

## Mobile / touch

- [ ] Portrait: single column; transport docked at the bottom; no horizontal
      overflow.
- [ ] Landscape: player stays prominent; controls reachable.
- [ ] Dragging a marker does **not** scroll the page.
- [ ] Touch targets are comfortably large.

## Keyboard shortcuts

- [ ] Shortcuts dialog opens from the header and lists all bindings.
- [ ] No shortcut fires while typing in a marker/speed field.
- [ ] Escape closes menus/dialogs.

## Session restoration & shared URLs

- [ ] Set markers/speed, then reopen the bare `/practice?v=ID` URL → the saved
      markers/speed/loop are restored silently (no prompt, no surprise jump).
- [ ] A shared link with markers (`?a=…&b=…`) overrides the saved session.
- [ ] "Copy link" copies a URL that reopens with the same markers/speed/loop.
- [ ] Opening a shared link on another device reproduces the setup.

## Browser matrix

Repeat the core flow (load → mark → loop → speed → copy link → reload) on:

- [ ] Chrome (desktop) · [ ] Edge · [ ] Firefox · [ ] Safari
- [ ] Mobile Safari (iOS) · [ ] Chrome (Android)
