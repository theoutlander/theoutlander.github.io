# Handoff: /lab section + first entry (trig explainer)

## Overview
This adds a new top-level section to nick.karnik.io: **/lab** — a home for interactive,
self-contained pieces (explainers, tutorials, toys, experiments). The first entry is
"Meet Sine, Cosine & Tangent," an interactive trig lesson at **/lab/trig**.

## About these files — deploy as-is, do NOT rebuild in React
Unlike a normal design handoff, the `trig/` folder here is **finished, production-intended
static HTML**, not a design reference to recreate. It is deliberately built with no framework
and no build step, following the same pattern as the existing `/maya` and `/judgement` folders
in this repo: a self-contained directory of HTML + JS that deploys verbatim.

Do not port it to React/TanStack/Panda. The whole point of the /lab pattern is that each
piece is a standalone folder that never touches the SPA build.

## Target structure in the repo

```
/lab/trig/index.html      ← the page (works at /lab/trig/)
/lab/trig/styles.css      ← design tokens the page depends on
/lab/trig/lab/*.js        ← 6 small scripts (canvas figures + audio)
```

Later entries follow the same shape: /lab/guitar/, /lab/hand/, etc.
A /lab/index.html (the shelf listing all pieces) will come in a later handoff —
don't build one now unless asked.

## Integration tasks for Claude Code

1. **Find how /maya and /judgement reach the deployed site** (check `vite.config.ts`,
   `scripts/deploy.sh`, and `scripts/generate-static-pages.ts` / `render-static-pages.ts`).
   Static root folders may be copied into `dist/` at build time or served via the
   `public/` convention. Wire `/lab` the same way — do not invent a new mechanism.
2. **Place the `trig/` folder from this bundle at `lab/trig/` in the repo** (or wherever
   the static-folder convention requires so it serves at the URL path `/lab/trig/`).
3. **Register the route** in `scripts/site-routes.ts` (and anything fed by it: sitemap,
   `inject-404-routes.ts`) so the 404 page's did-you-mean and the sitemap know about
   `/lab/trig`.
4. **Nav link**: add "lab" to the site nav pointing at `/lab/trig` for now (only entry).
   When the /lab index page exists, repoint it to `/lab`. If adding a nav item is
   contentious, skip it and just deploy the URL — ask Nick.
5. **Verify**: page loads at `/lab/trig/`, fonts load (Google Fonts), canvases draw,
   audio plays after a click (Web Audio requires a user gesture — already handled).

## Notes on the files

- `index.html` — everything page-specific: markup + a `<style>` block. Links `styles.css`
  and the six `lab/*.js` scripts with relative paths, so the folder is location-independent.
- `styles.css` — the blog design-token sheet (--paper, --ink, --accent, --rule, --gap-*,
  --mono; aesthetic/theme/density/typeface data-attributes). It is duplicated into this
  folder ON PURPOSE so the piece is self-contained and immune to site refactors. If the
  repo already ships an identical tokens file at a stable URL, you MAY link that instead —
  but only if its URL is genuinely stable. When in doubt, keep the local copy.
- `lab/*.js` — plain IIFEs, no dependencies, no globals except `window.Lab` (shared Web
  Audio + canvas helpers in `lab-audio.js`). Load order matters: `lab-audio.js` first.
- The page is set to `data-theme="dark"`. It does not read the site's theme toggle; fine
  for v1. Hooking it to the site-wide theme (localStorage key) can be a later improvement.

## Fidelity
High-fidelity and final. Colors, type, spacing, and copy are exactly as intended.
Fonts: JetBrains Mono, Newsreader, Source Serif 4 (Google Fonts, linked in the HTML).

## Content of the page (for orientation)
Six step sections (angle → triangle sides → sine → cosine → tangent → unit circle),
each with a live canvas figure; a recap table; a 5-question quiz (`quiz.js`); and a
sound demo where a sine wave is played through the speaker and drawn live, with a
Play a note toggle, a stoppable "Play a little tune" button, and a pitch slider.
All interactions are self-contained; no analytics, no network calls beyond fonts.

## Open questions for Nick (decide during integration)
- URL: `/lab/trig` vs `/lab/sine-cosine-tangent`. Bundle assumes `/lab/trig`.
- Nav: add "lab" link now, or keep the URL unlisted until the index page exists?
- Companion blog post announcing the piece: separate task, not in this bundle.

## Files in this bundle
```
trig/index.html
trig/styles.css
trig/lab/lab-audio.js   (shared audio + scope-drawing helpers; load first)
trig/lab/angle.js       (step 1 figure)
trig/lab/triangle.js    (steps 2–5 figures)
trig/lab/unit-circle.js (step 6 figure)
trig/lab/sound.js       (sound demo)
trig/lab/quiz.js        (quiz)
```
