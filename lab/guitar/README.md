# Handoff: Guitar — an interactive guitar primer

## Overview
A single-page interactive tool that takes an absolute beginner from an untuned guitar to playing a first song, with everything audible (real sampled guitar). Structure: an always-visible outline of **1 intro + 6 core steps + 5 optional deep-dives**, one lesson shown at a time. Destination: a page on karnik.io (suggested route `/learn/guitar`), the first of a growing set of interactive "learn" pages.

## What's in this bundle
| File | What it is |
|---|---|
| `learn-guitar-standalone.html` | **Production-viable, self-contained build (~700 KB).** All markup, styles, JS, and runtime inlined. Ships as-is on any static host. |
| `Learn Guitar.dc.html` + `support.js` | The editable source: an HTML component file plus its small runtime. Open the `.dc.html` in a browser with `support.js` beside it. |
| `README.md` | This document. |

Runtime network needs (standalone build): Google Fonts (Newsreader, JetBrains Mono), the `soundfont-player` CDN lib, and MusyngKite sampled-guitar audio fetched on first sound. If samples fail to load, a built-in Karplus–Strong synth pluck plays instead, so audio never silently breaks.

## Two integration paths
1. **Ship the file (recommended).** Copy `learn-guitar-standalone.html` into the site's static/public directory and route `/learn/guitar` to it (or link it directly). Add a card to a `/learn` index page. No build step, no dependencies.
2. **Recreate natively** in the site's framework only if there's a reason to (shared nav/layout, SSR). Treat the HTML as a high-fidelity reference; the specs below are complete enough to rebuild from.

## Fidelity
**High-fidelity, working.** Colors, typography, spacing, copy, and interactions are final. This is not a wireframe.

## Architecture (as built)
- One React-style class component (inside `<script data-dc-script>` in the `.dc.html`) renders all interactive views; the page shell is plain HTML with inline styles.
- **Navigation model:** a flat `ITEMS` list — `welcome` intro, 6 `basic` steps, 5 `extra` modules. Single state value = current item id.
- **Persistence:** `localStorage.fc_item_v1` stores the current item so a returning visitor resumes where they left off. **There is deliberately no progress/completion tracking** — the tool cannot verify real-world skill, so it makes no claims (a counter and checkmarks were removed by design; do not reintroduce them).
- **Layout:** sticky header (brand + tagline, ~56 px) → `#app` section (max-width 1200 px, padding 34px 26px 90px) → `.app-grid`: CSS grid `262px minmax(0,1fr)`, gap 40 px. Sidebar is `position:sticky; top:76px`. Below 920 px viewport width: single column, sidebar becomes a static block above the lesson.

## The 12 lesson-pane states
Each lesson renders: kicker → title → one-paragraph "why" → interactive widget card → optional "How to practice" tip → prev/next footer.

**Intro** — *Meet your guitar* (“Start with six strings.”): the tone bench — a live canvas oscilloscope (520×150 logical px, dark #16140f) over Note / Frequency / String readout cells, six pluckable strings (E A D G B e), and a "Strum all ↓" button.

**The basics (kicker "Step N of 6"):**
1. *Tune up* — six string tiles play reference pitches (E2 A2 D3 G3 B3 E4); "Play all six".
2. *Find the notes* — clickable 12-fret SVG fretboard; click = hear note + see name; "Show all notes" toggle.
3. *Your first chords* — 8 open chords (C A G E D Am Em Dm) with finger-numbered diagrams; strum ↓/↑; chip grid to jump.
4. *Switch between them* — pick two chords, 4-beat metronome bar, strum lands on beat 1, "Switch now" cue on beat 4.
5. *Keep time* — 8-slot down/up strum pattern (D · D U · U D U) with moving highlight, metronome, tempo control.
6. *Play a song* — Em → C → G → D loop, one bar each; active bar tile + beat pips; tempo control.

**Go deeper (kicker "Optional · go deeper"):** *How music works* (intervals → major-scale pattern → harmonized chords, any root), *The chord lab* (root × 10 qualities → formula, notes, movable playable shape, all-positions neck map), *Scales* (5 scale types, ascending playback, neck map), *Reading the staff* (clickable C-major octave on a treble staff), *Tab & paste-your-own* (demo tab playback + parser that auto-detects pasted ASCII tab or note letters and plays it).

## Interactions & behavior
- Sidebar/prev/next navigation swaps the lesson, saves to localStorage, and scrolls to the top of `#app` (`window.scrollTo`, −58 px header offset). Crossing from basics into extras labels the button "Go deeper · ‹name›".
- **Audio:** Web Audio; master gain 0.92 → `AnalyserNode` (fftSize 2048) → destination. Sampled instrument via soundfont-player 0.12.0, MusyngKite `acoustic_guitar_steel` (or `_nylon` via the `tone` prop). Strums are humanized: per-string timing jitter, downstrokes accent bass strings, upstrokes catch only the top strings, lighter.
- **Tone-bench scope:** rAF loop draws the live analyser waveform when signal is present (max−min > 6), otherwise an idle traveling sine at 50% alpha — the scope must never look dead. First paint is synchronous (rAF alone is throttled in hidden tabs).
- **Tempo:** shared 50–160 BPM control; changing tempo restarts any running player at the new rate. All play buttons toggle to "■ Stop" and clear their intervals.
- **Tweakable props** (`data-props` on the source component): `tone` steel/nylon, `showFingerNumbers`, `noteNaming` sharps/flats, `startWithAllNotes`.

## Design tokens
- **Color:** accent `#b3582f` · ink `#2a2520` · soft text `#6f665a` · body text `#4f483f` · paper `#fbfaf8` · panel `#f3f0e9` · line `#e8e4db` · dark band (footer/scope) `#221e19` / `#16140f` · error `#b3402f`.
- **Type:** Newsreader (serif; 400/500/600 + italic) for titles, buttons, chord names; JetBrains Mono (400/500/600) for labels, numbers, readouts. Mono labels are uppercase, letter-spacing .12–.16em, 10.5–12.5 px. Lesson titles `clamp(28px, 4vw, 42px)` weight 600, line-height 1.05. Body 17px/1.6, max 62ch.
- **Shape:** cards 16–18 px radius with 1 px `#e8e4db` border on white; chips 8–12 px; pill buttons 999 px (13.5 px/600, padding 9px 16px). Shadows essentially none (one 1px hairline shadow on cards).

## Assets
None local. Fonts from Google Fonts; guitar samples from the MusyngKite soundfont CDN; every diagram (fretboards, chord charts, staff) is code-drawn SVG; the scope is a `<canvas>`.

## Site mapping
- This joins the site's existing **lab** collection, alongside the robotic hand and trigonometry pieces — same pattern: one self-contained page + one card on the lab index.
- Route: `/lab/guitar` (or `/lab/first-chords`) — serve the standalone file there.
- Card copy suggestion: "Guitar — a hands-on primer. Tune up, learn six chords, play a song — and hear all of it."
