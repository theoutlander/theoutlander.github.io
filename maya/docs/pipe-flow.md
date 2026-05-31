# Pipe Flow! — Game Spec

**Files:** `maya/pipe-flow.html` + `maya/pipe-flow-garden.js` (sibling script, like the `lord-*.js` set)
**Framework:** Plain HTML/CSS/Canvas
**Status:** ✅ Shipped — now with **Pip's Rainbow Garden** meta layer

---

## Concept
Connect garden hoses to thirsty flowers, then watch your reward bloom! The puzzle
engine is unchanged — wrapped in a meta-game ("Pip's Rainbow Garden") that gives
Maya a reason to come back every day: earn Dewdrops, grow a forever-garden, hunt
collectibles, and keep a daily streak alive with **Pip**, a baby rainbow dragon.

> **Architecture note:** the original puzzle engine lives untouched inside
> `pipe-flow.html`. All meta features live in `pipe-flow-garden.js`, which shares
> the same global scope and attaches via a handful of one-line hooks edited into
> the engine (`onWin`, `onMenu`, `onNext`, `onStartGame`, `onHintUsed`, plus a
> `pipHintUsed` reset in `loadLevel`). To deploy, copy **both** files into `maya/`.

---

## Meta layer — Pip's Rainbow Garden

### Pip the dragon 🐉
Mascot on the home screen — bobs, glows, wears a hat (changeable in Collection),
and speaks rotating warm messages (some from Dad). Nods to *Legend of the Rainbow
Dragon*.

### Dewdrops 💧 (currency)
Earned on every win:
- ⭐ stars: 3★ = +12, 2★ = +8, 1★ = +5
- 🌟 First clear of a level: +8
- 🧠 No-Hint bonus: +5 (skill incentive — adds challenge)
- ☀️ Daily Challenge: +20
Spent in the **Garden Shop** on flowers, decorations, Pip hats, and critters.

### Forever Garden 🌈 — now with a goal
A persistent plot (saved forever) that the puzzles are *for*. Three reasons to care:
- **Grow it → it levels up & transforms.** A **Bloom Meter** fills with every flower
  grown (one per win). Hitting the next of **7 Garden Levels** (Sprout Patch →
  Little Meadow → Flower Bed → Blossom Garden → Rainbow Garden → Starlit Garden →
  Pip's Paradise) upgrades the whole scene — petals fall, a rainbow arcs over it,
  day turns to starry night — and grants bonus 💧 + a guaranteed collectible.
- **Harvest it → it pays you.** Flowers ripen (💧 sparkle) after each win; tap them
  or hit **🧺 Harvest** to collect dewdrops. A reason to tend it between puzzles.
- **Complete it → a finale.** A live **% complete** (collectibles + garden level);
  fill it out for a screen-filling "Garden Complete!" celebration.

Tap any plot to plant/replace/clear from owned flowers & decorations; owned critters
roam the scene. Reached from the home **🌈 Garden** tile (which shows your level).

### Collection sticker book 📖
38 collectibles across **Flowers / Critters / Pip Hats / Decor**. Owned shown in
colour; locked shown as ❓. Tap an owned hat to put it on Pip. Unlocked via shop,
mystery win-gifts, and daily rewards.

### Daily Challenge ☀️ + streak 🔥
A tougher puzzle each day (curated pool of larger levels, picked by date). Win once
per day for +20 💧, a guaranteed gift, and **+1 streak**; miss a day and the streak
resets. Tracks best streak. Daily play snapshots and restores the campaign save so
it never disturbs normal progress.

### Win rewards / juice
Win overlay now shows a big **+N 💧** with the bonus breakdown, a "new bloom" line,
and a tappable **mystery gift box** that pops open to reveal a new collectible.
Coin / unlock / plant SFX.

### Music 🎵
Gentle looping pentatonic ambient (Web Audio, no files), toggle on the home bar and
in the play HUD. Starts on first tap; preference saved.

### Persistence (`localStorage`)
- **`pipeflow_save`** — engine campaign (unchanged): `{ nextLevel, stars, maxBeaten }`
- **`pipeflow_secret`** — secret-level unlock (unchanged)
- **`pipeflow_meta`** — meta: `{ dew, owned, garden, gardenSize, hat, seen, music, bloomXP, harvested, completed, daily:{streak,best,lastDay,claimedDate} }`

---

## Core puzzle (unchanged)

### Mechanic
- **Win:** every flower has water (matching colour on rainbow levels). Open ends & drips are visual only.
- **Kit levels:** drag ━ └ ┳ onto **+** cells; drag to move; drag to 🗑 to remove & refund; tap to rotate.
- **Classic levels:** tap any non-fixed pipe to rotate 90°.
- Water flows automatically (BFS from source). **Reset** restores; **Hint** solves one step.

### Pipe types
Straight `I`, Corner `L`, T-junction `T`, Cross `X`, Hose `S`, Field `G`, Rock `#`,
Broken `B`, Valve `V`, Side garden `g`, Colored `Sb0/Gb0/...`.

### Levels
27 levels (tutorial → mechanics → finale → build → secret). Board auto-scales for iPad.
Each verified solvable. Stars by moves vs par.

---

## Controls
- **Tap pipe** — rotate · **drag** kit pipes onto + · **Reset** · **Hint**
- Home tiles: **☀️ Daily · 🌈 Garden · 📖 Collection** · 🎵 music
- iPad-first: 44px+ targets, touch + click handlers

## Tech notes
- Two self-contained files, no build step, no external assets (all emoji + CSS + canvas).
- Web Audio for SFX + ambient music.
- Engine still exposes `window.render_game_to_text` / `window.advanceTime` for tests.
- Meta exposes `window.PipMeta` (hooks + `.meta` for debugging).
