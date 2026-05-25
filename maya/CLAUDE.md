# Maya's Game Lab — Claude Code Spec

## What This Is
A personal game studio website built by Nick Karnik and his daughter Maya.
Live at: `maya.karnik.io` → proxied via Cloudflare Worker to `nick.karnik.io/maya`
GitHub: `theoutlander/theoutlander.github.io` in the `/maya` folder

Nick and Maya have a 5-10 minute phone call every evening. They brainstorm game ideas together,
Nick builds them here, and Maya plays them on her iPad. The site is her creative space.

---

## Maya's Profile
- Age: ~8-12 (exact grade not confirmed, assume Grade 2-3 level)
- Plays on: **iPad** (primary), also browser on desktop
- Attention span: short — games must be immediately playable, no long tutorials
- Loves: bright colors, explosions, rainbows, candy, ghosts, animals, music
- Learning: spelling, reading — educational games should feel fun not like school
- Dad calls every evening — games are their shared creative project

---

## Tech Stack

### Current approach (single HTML files)
All games are **self-contained single HTML files** — no build step, no npm, no bundler.
They load from CDN and work by just opening in a browser or deploying to GitHub Pages.

### Framework choice (read this before starting a game)

**Future games do NOT have to use Phaser.** Pick the stack by game type:

| Use **Phaser 4** | Use **plain HTML/CSS/JS** (DOM and/or canvas) |
|------------------|-----------------------------------------------|
| Real-time action: movement, aiming, collision, many moving sprites | UI-heavy: shops, menus, modals, tycoon loops |
| Continuous game loop with scenes (menu → play → game over) | Turn-based or tap puzzles (pipe connect, word spell) |
| Side-scrollers, shooters, platformers, horde survival | Music/rhythm tap (piano keys) |
| When physics/tweens/scene management would dominate the code | Educational / reading games |
| | Short canvas effects only (confetti, one mini animation) |

**Default for new ideas:** vanilla unless Nick or Maya explicitly want an arcade/action game — then Phaser.

**Do not migrate a working vanilla game to Phaser** unless there is a concrete reason (bugs from hand-rolled loop, need for physics, major feature rewrite). Migration is costly; prefer polish in place.

### Frameworks in use
- **Phaser 4.1.0** — action/arcade games
  - CDN: `https://cdn.jsdelivr.net/npm/phaser@4.1.0/dist/phaser.min.js`
  - Use scenes: `preload()`, `create()`, `update()`
  - Draw with graphics primitives + emoji text — no external image files needed
  - Arcade physics when collision matters
  - Audio: Web Audio API directly (simple tones), not Phaser audio
  - **In production:** `castle-defenders.html`
- **Plain HTML/CSS/Canvas** — everything else
  - DOM for layouts; canvas when a small draw loop is enough
  - **In production:** `pinata-piano-v2.html`, `dust-chasers.html`, `letter-tumble.html`, `pipe-flow.html`, `mayas-kitchen.html`, `skyline-builder.html`
- **Babylon.js** — future 3D only (not required for 2D)
  - CDN: `https://cdn.babylonjs.com/babylon.js`

### Phaser migration backlog (optional, not mandatory)

| Game | Status | Notes |
|------|--------|-------|
| Castle Defenders | **Already Phaser 4** | Stabilize/polish only; do not rebuild unless broken |
| Dust Chasers | Stay vanilla unless major rework | Canvas loop works; migrate only if adding heavy physics |
| Piñata Piano, Spell It, Pipe Flow, Maya's Kitchen, City Builder | **Keep vanilla** | Wrong fit for Phaser (UI, puzzle, words, tycoon, creative builder) |

### Fonts (always load from Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap" rel="stylesheet">
```
- Headings/titles: `Fredoka One`
- Body/UI: `Nunito`

### Colour palette (use consistently)
```
--pink:   #ff6eb4
--yellow: #ffe14d
--green:  #5dffb0
--blue:   #5bc8ff
--purple: #c77dff
--orange: #ff9a3c
--bg:     #0f0a1e  (dark purple background)
--card:   #1e1440
--text:   #f0e6ff
--muted:  rgba(240,230,255,0.4)
```

---

## Design Principles

1. **iPad-first** — all touch targets min 44px, `touch-action:none`, no hover-only interactions
2. **Immediately playable** — no more than 2 taps to start playing
3. **Kid-friendly** — no violence, no scary content, fun explosions and rainbows not blood
4. **Responsive** — works on iPad (768px+), iPhone (375px+), desktop
5. **No external assets** — all graphics drawn with code or emoji, no image files to host
6. **Sound via Web Audio API** — simple tones only, no audio files needed
7. **Self-contained** — each game is one HTML file, deployable anywhere

---

## Deployment
```bash
# Push a new or updated game
git add maya/
git commit -m "🎮 description of what changed"
git push

# Files go in:
theoutlander.github.io/maya/
├── index.html          ← portal (always update when adding games)
├── pinata-piano-v2.html
├── dust-chasers.html
├── letter-tumble.html
├── castle-defenders.html
└── docs/               ← game specs (this folder)
```

---

## Portal (index.html)
The main page Maya visits. Key elements:
- **"Our Latest Creation"** banner — shows the most recently made game (manually set in `GLIST` array)
- **Games grid** — cards for all games, 3 columns desktop / 2 tablet / 1 mobile
- **Doodle pad** — canvas she can draw on and email to Dad
- **Wishlist** — she types game ideas, emails to Dad via EmailJS
- **Secret message** — tap the title 5 times to reveal a message from Dad + confetti
- **Dad bubble** — random warm message pops up 6 seconds after visiting

### EmailJS config (already set up)
```javascript
const EJS_KEY  = 'aobGgwT--7krdk9Qv';
const EJS_SVC  = 'service_08wvsfl';
const EJS_TPL  = 'template_b7g9ipp';
```
Always include these when updating index.html.

### EmailJS template (`template_b7g9ipp`) — required for doodles + wishlist

If **text or images are missing** in the inbox, the template usually does not expose the variables the portal sends.

1. **Content (email body)** — include at least:
   - `{{message}}` — plain text (wishlist text, or doodle summary).
   - Optional HTML: `{{{html_content}}}` or `{{{html_message}}}` (triple braces so tags are not escaped). If you omit this, you still get the plain `message`.

2. **Doodle image (inline)** — The portal **uploads the JPEG to [bytebin.lucko.me](https://bytebin.lucko.me)** (free, no API key) and puts an **https://** URL in `{{{html_content}}}`. That displays in **Gmail** and other clients that block `data:` URLs. Treat doodles as **public for anyone with the link** (fine for kid art; do not put secrets in drawings).

   **Fallback:** If the upload fails, the email uses an embedded `data:` image and may send **`doodle_image`** (raw base64) for an optional EmailJS Variable Attachment — same as before if you still use `cid:doodle_image` in the template.

   **Template:** include `{{message}}` and `{{{html_content}}}` (or `{{{html_message}}}`). You do **not** need a CID `<img>` in the dashboard for the happy path.

3. **Wishlist** — the portal sends the idea as `message`, and duplicates as `wish` and `idea` in case the template uses those names instead.

### Adding a new game to the portal
1. Add a card to the `.gg` games grid in index.html
2. Add to `GLIST` array (for "Our Latest Creation" rotation)
3. Put the new game first in GLIST so it shows as latest

---

## Games

### 1. Piñata Piano (`pinata-piano-v2.html`)
See: `docs/pinata-piano.md`

### 2. Dust Chasers (`dust-chasers.html`)
See: `docs/dust-chasers.md`

### 3. Spell It! (`letter-tumble.html`)
See: `docs/spell-it.md`

### 4. Castle Defenders (`castle-defenders.html`) — **Phaser 4**
See: `docs/castle-defenders.md`

### 5. Pipe Flow! (`pipe-flow.html`)
See: `docs/pipe-flow.md`

### 6. Maya's Kitchen (`mayas-kitchen.html`)
Cook-and-sell tycoon: customer orders, recipe unlocks, shop upgrades. **Plain HTML** (DOM UI).

### 7. City Builder (`skyline-builder.html`)
Skyline building toy. **Plain HTML/canvas**.

---

## Known Issues / Backlog
- Castle Defenders (Phaser): polish bugs (e.g. forge flow), not a framework migration
- Dust Chasers: shockwave could feel more impactful
- Spell It: could use more word variety per grade
- All games: need consistent audio volume levels

---

## Future Games Ideas (from Maya)
- A 3D game using Babylon.js (TBD concept)
- More word/spelling games
- Something with unicorns 🦄

---

## Notes for Claude Code
- Always check this file at session start
- Check individual game docs before modifying a game
- **Framework:** follow the table in “Framework choice” — Phaser is not the default for every new game
- Keep all games as single HTML files unless explicitly told otherwise (Phaser still = one `.html` + CDN script)
- Test logic in your head before writing — these games have had many bugs from rushed patches
- When fixing bugs, read the full relevant function first, don't patch blindly
- iPad: prefer `pointerup` delegation or both `click` and `touchend`; Phaser games use Phaser input
- Never use `localStorage` as the only save mechanism without a fallback