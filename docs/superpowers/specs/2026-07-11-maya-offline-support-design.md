# Maya's Game Lab — Offline Support

## Problem

Maya plays on her iPad in the car, where there's often no internet. The Game
Lab (`projects/maya/`) and all 16 games are served over the network with no
offline fallback today — no service worker, no web app manifest. If she opens
Safari with no signal, nothing loads.

## Goal

Every game in the Lab works with zero signal, including ones Maya hasn't
opened yet — not just ones she's already played. Updates to games should
reach her automatically next time she's on WiFi, with no prompts or taps
required from her.

## Non-goals

- Offline support for the "send a doodle to Dad" / family chat feature. That
  needs a live connection to actually deliver a message; it should fail
  gracefully offline, not be made to work offline.
- Vendoring the CDN-hosted game engines (Phaser, Babylon.js) into the repo.
  They're cached at runtime instead (see below) — see "CDN handling" for why.
- Changing anything about how games are added to the Lab today (still a
  manual step: add to `GLIST` in `projects/maya/index.html`). This spec adds
  one more small manual step alongside it (see "Game registry").

## Current state (relevant facts)

- `projects/maya/` is a static folder, mounted at `/maya` in dev via
  `staticFolderDevPlugin`, and copied wholesale to `dist/maya` at build time
  (`ssr-renderer.tsx`). No build step for the games themselves.
- All 16 games' own code totals ~2MB combined. No image/binary assets — all
  art is CSS/canvas/emoji.
- 3 games load Phaser from jsdelivr (two different pinned versions, ~1.2MB +
  ~1.35MB). 2 games (Build On!, Maya's Sewing Museum) load Babylon.js from
  `https://cdn.babylonjs.com/babylon.js` — an *unversioned* "latest" URL,
  ~8.2MB. 2 games load EmailJS (small, two versions). Several games load
  Google Fonts CSS (small, and already gracefully degrades to system fonts
  if unavailable — not a hard dependency).
- All CDN hosts involved (jsdelivr, cdn.babylonjs.com, fonts.googleapis.com)
  send `Access-Control-Allow-Origin: *`, confirmed via `curl -I`. This makes
  them cacheable by a service worker without opaque-response complications.
- No existing service worker or web app manifest anywhere on the site.
- `package.json` already has `puppeteer` as a dependency, used today by
  `scripts/generate-og-cards.ts` to render branded images. The same approach
  can generate PWA icon PNGs.

## Design

### 1. Game registry for the service worker

Add `projects/maya/shared/offline-games.json`: a flat array of game folder
slugs, e.g. `["castle-defenders-2", "mayas-escape-room", ...]`.

This is the *only* new hand-maintained list. Adding a new game already
requires editing `GLIST` in `projects/maya/index.html` (for the grid card);
this adds one more line in the same moment, in the same spirit as that
existing manual step.

The service worker does **not** need a full per-game asset list. On install,
for each slug it fetches `games/<slug>/index.html` and regex-extracts every
`<script src="...">` and `<link rel="stylesheet" href="...">` reference —
local relative paths, `../../shared/...` paths, and absolute CDN URLs alike.
That becomes the precache list for that game. New local `.js` files a game
adds later are picked up automatically next time the service worker
re-installs (new version) — no manifest edits needed for that.

### 2. What gets cached

On first activation (and re-run on every version bump):

- The Lab shell (`index.html`), `manifest.webmanifest`, icon files.
- `shared/*.js`, `shared/*.css` (portal-bridge, ga-analytics,
  ios-audio-unlock, family-chat).
- Every game's own local files (discovered per §1).
- CDN engine files referenced by any game: Phaser (both versions in use),
  Babylon.js, EmailJS (both versions in use).

Google Fonts CSS/font files are cached opportunistically (best-effort, not
required for install to succeed) — offline behavior without them is just a
system-font fallback, which already happens today if the font request is
slow or blocked.

Each precache fetch runs independently via `Promise.allSettled` — one flaky
download (e.g., a CDN hiccup mid-install) doesn't prevent everything else
from getting cached.

**Babylon.js version pin:** change the script tag in `build-on/index.html`
and `mayas-sewing-museum/index.html` from the unversioned
`https://cdn.babylonjs.com/babylon.js` to a specific version's URL. Caching
an unversioned URL means whatever happens to be live at first-cache time
gets locked in silently; pinning makes that explicit and reproducible, and
means a future upstream Babylon.js release can't unexpectedly change what's
cached.

### 3. Runtime fetch behavior

- Same-origin requests under `/maya/` and the CDN hosts above: cache-first
  (instant offline response), refreshing the cache in the background when
  online (stale-while-revalidate) — this is what makes updates reach her
  automatically without a prompt.
- Navigation requests (opening a game) that miss the cache **and** the
  network is unavailable: serve a small custom offline fallback page instead
  of a browser error — e.g. "This one's not saved yet — try it next time
  you're on WiFi! 💕", styled to match the Lab. This only happens for a game
  added after her last online visit; anything cached at least once works
  normally.

### 4. Update mechanism

Standard versioned-cache-name service worker pattern:

- Cache name includes a version string (e.g. `maya-cache-v1`).
- On `activate`, delete any cache whose name doesn't match the current
  version.
- New service worker calls `self.skipWaiting()` on install and
  `clients.claim()` on activate, so a newly deployed version takes over on
  her *next* visit automatically — no "update available" prompt, matching
  the "auto-update silently" decision.
- Bumping the cache version is a one-line change in `sw.js` made whenever a
  meaningful update ships (new game, bug fix to a cached file).

### 5. Installable icon (Add to Home Screen)

- New `projects/maya/manifest.webmanifest`: name "Maya's Game Lab",
  `display: standalone`, `start_url: /maya/`, theme/background colors
  matching the Lab's existing dark space palette.
- New icon PNGs (192×192, 512×512, and a 180×180 `apple-touch-icon`),
  generated via Puppeteer following the same pattern as
  `scripts/generate-og-cards.ts` — a simple on-brand icon (dark background,
  Lab's existing color palette, a recognizable emoji/mark), not hand-drawn
  art.
- `<link rel="manifest">`, `<link rel="apple-touch-icon">`, and the
  `apple-mobile-web-app-*` / `theme-color` meta tags added to
  `projects/maya/index.html`'s `<head>`.
- One-time manual step (not something this spec automates): on Maya's iPad,
  open the Lab once on WiFi, tap Share → Add to Home Screen. After that she
  launches it from that icon.

### 6. Service worker registration

A short snippet in `projects/maya/index.html`:
`if ('serviceWorker' in navigator) navigator.serviceWorker.register('/maya/sw.js')`.
Registered only from the Lab shell — since its scope covers `/maya/`, it
controls navigation to every game once active, regardless of which page
Maya lands on first.

## Testing / verification

- Chrome DevTools → Application → Service Workers: confirm install/activate,
  inspect Cache Storage for expected entries after first load.
- Simulate offline (DevTools "Offline" throttling) and confirm: Lab loads,
  every game in `offline-games.json` opens and plays with sound.
- Confirm a version bump (change `sw.js` cache name) evicts the old cache on
  next activate and re-populates with updated files.
- Manually verify "Add to Home Screen" produces a standalone launch (no
  Safari chrome) with the correct icon, on an actual iOS device if possible.

## Open items for the implementation plan

- Exact regex/parsing approach for extracting `<script src>` / `<link href>`
  from each game's `index.html` inside the service worker (must handle the
  varied formatting seen across games — some multi-line/pretty-printed like
  `castle-defenders-2`, most single-line).
- Exact wording/styling of the offline fallback page.
- Which Babylon.js version to pin to (latest stable at implementation time).
