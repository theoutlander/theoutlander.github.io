# Maya's Game Lab — End-to-End Test Suite

**Date:** 2026-07-12
**Status:** Design, pending approval

## Why

Maya reported that Dust Chasers "won't let her go in." The cause: an unguarded top-level
`localStorage.getItem()` read. On iPad Safari that call *throws* when site data is blocked —
most likely Settings → Safari → **Block All Cookies**, or Private Browsing. The throw aborted the
game's entire `<script>`, leaving every `let` below it uninitialized. The start button rendered
fine (it's static HTML) but was dead on tap.

Note: the portal opens games in an iframe, but that iframe is **same-origin** (`MAYA_BASE` is
built from `location.pathname`), so third-party storage partitioning / ITP is *not* involved. The
unguarded read would have died the same way as a top-level page. The iframe is not the culprit.

It worked perfectly on desktop. Nobody would have caught this by clicking around on a Mac.

Piñata Piano had the identical bug. Both are now fixed. This suite exists so the next one is
caught by CI instead of by an eight-year-old.

## Scope

This spec covers **the test suite only**, against the games as they exist today.

Standardizing sound (background music + a mute toggle in every game) is a **separate project**.
An audit found only 4 games have anything resembling background music, and 5 have no mute at
all. Sound cannot be hard-asserted until that work lands, so this suite *reports* sound
readiness without failing on it. See "Sound" below.

## What it tests

Three layers, cheapest first.

### Layer 1 — Portal integrity (no browser needed beyond a page load)

- The landing page renders and lists **every** game.
- Every game in `GLIST` has a card and a working play button.
- **No game folder exists that is missing from the portal**, and no portal entry points at a
  folder that doesn't exist. This is the check that would have caught a renamed folder.
- Every game's declared `window.MAYA_GAME` play-key matches its actual path.

### Layer 2 — Entry (the check Maya cares about)

For each game, driven from a manifest:

1. Load the **portal**, tap the game's Play button, and assert the iframe navigates to the game.
2. Inside the iframe, tap the game's start control.
3. Assert the game actually started — the manifest names the element that proves it.
4. Assert **zero uncaught JS errors** throughout.

This runs through the portal iframe because that is the path Maya actually takes — the click-through
is itself part of what we're asserting works (the card, the play button, the modal, the iframe
navigating to the right URL, the Back button returning her to the lab).

It is *not* required for storage-correctness reasons: the iframe is same-origin, so a game behaves
the same there as it does loaded directly. Direct-URL loads are therefore a valid and faster way to
run Layers 2 and 3 per-game; the portal click-through is asserted once per game to cover the
navigation itself.

### Layer 3 — The regression guard (storage-hostile mode)

Every game is loaded again with `localStorage` rigged to throw `SecurityError`, via a Playwright
`addInitScript` that runs before any game code:

```js
Object.defineProperty(window, 'localStorage', {
  get() { throw new DOMException('The operation is insecure.', 'SecurityError'); }
});
```

Then: assert no uncaught error, and assert the game still starts.

This needs **no per-game knowledge** and generalizes the exact bug that broke Dust Chasers and
Piñata Piano across all 18 games and any future one. It is the highest-value check in the suite.

**Honest limitation:** this reproduces our *model* of the failure, not Maya's iPad. We inferred
the mechanism (a stubbed getter, plus the fact that only these two games read storage unguarded
at top level, matching her reporting only this one broken). We have not confirmed her iPad
actually blocks storage — check Settings → Safari → Block All Cookies. The fix is defensively
correct regardless. But a green Layer 3 proves "not this mechanism" — not "Maya can get in."
Confirm that by having her open the deployed fix.

## Devices

Playwright, three projects:

| Project | Device | Engine | Why |
|---|---|---|---|
| `ipad` | iPad Pro 11 | **WebKit** | Maya's actual device. Real Safari engine + real touch. |
| `iphone` | iPhone 13 | **WebKit** | Mobile viewport. |
| `desktop` | Desktop Chrome | Chromium | What Nick develops on. |

WebKit is non-negotiable: the Dust Chasers bug is a Safari-engine behavior. A Chromium-only
suite would have run green while the game was dead on her iPad.

## The manifest

`projects/maya/tests/games.manifest.ts` — one entry per game:

```ts
{
  slug:    'dust-chasers',
  start:   'button:has-text("Enter the Room")',
  started: '#start-screen.hidden',   // proves we got in
  sound:   'none',                   // reported, not failed
}
```

A guard test asserts the manifest covers every folder under `games/` — a new game with no entry
**fails the suite** rather than being silently skipped. `_template` and retired games are
explicitly excluded by name, so exclusion is a deliberate act.

## Sound

Audio is stubbed: `AudioContext` is replaced with a recording fake. For each game we assert that
interacting produces audio nodes, and that the iOS unlock gesture calls `resume()`.

**This verifies audio code runs. It does not verify anything is audible.** A green sound check
must not be read as "Maya will hear it." Per-game music/mute coverage is reported as a table,
not asserted, until the sound-standardization project lands — at which point these become hard
assertions.

## CI

GitHub Actions on **every push to main**, blocking the deploy. A broken game cannot reach Maya's
iPad. Failures upload Playwright traces + screenshots.

No nightly run (explicitly declined). Note the tradeoff: these games load Google Fonts, Phaser,
and jsdelivr from CDNs, so an external change can break a game with no code change, and
push-only CI won't notice until the next push.

## Layout

```
projects/maya/
├── playwright.config.ts
└── tests/
    ├── games.manifest.ts      # per-game entry selectors
    ├── portal.spec.ts         # Layer 1
    ├── enter-game.spec.ts     # Layer 2 (portal → iframe → start)
    ├── storage-blocked.spec.ts# Layer 3 (the regression guard)
    ├── sound.spec.ts          # reports readiness
    └── helpers/
        ├── storage.ts         # the throwing-localStorage init script
        └── audio.ts           # AudioContext recording fake
```

Run with `pnpm test:maya`. Playwright is a new dev dependency; **no game files change.**

## Non-goals

- Testing gameplay correctness (can you win, is scoring right). Entry and non-breakage only.
- Real-device iPad testing. Playwright WebKit is the pragmatic proxy.
- Verifying audible sound output.
- Any change to the 18 games in this project.
