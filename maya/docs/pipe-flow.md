# Pipe Flow! — Game Spec

**File:** `maya/pipe-flow.html`
**Framework:** Plain HTML/CSS/Canvas
**Status:** ✅ Shipped

---

## Concept
Connect garden hoses to thirsty fields! Tap pipe tiles to rotate them until water flows from the 🚿 hose to the 🌾 field.

---

## How It Works

### Core mechanic
- Tap any **non-fixed pipe** to rotate it 90° clockwise
- Water flows automatically through connected pipes (BFS from source)
- Win when water reaches the goal field
- **Reset** restores the starting layout
- **Hint** auto-rotates one pipe toward a solution

### Pipe types
| Type | Symbol | Behaviour |
|------|--------|-----------|
| Straight | `I` | Connects two opposite sides |
| Corner | `L` | L-shaped bend |
| T-junction | `T` | Three-way split |
| Cross | `X` | All four directions |
| Hose | `S` | Fixed source — water starts here |
| Field | `G` | Fixed goal — water must reach here |
| Rock | `#` | Blocks flow and placement |
| Broken | `B` | No flow until you rotate it once |
| Valve | `V` | Tap to rotate; double-tap to open/close |
| Side garden | `g` | Sprinkler goal — watered by an adjacent wet pipe |
| Colored | `Sb0`, `Gb0`, `Sr0`, `Gr0` | Blue/red hose and matching flowers only |

### Levels
26 levels. **Par** is the minimum number of pipe rotations to solve. Large grids show **rows×cols** on the badge (e.g. `7×6`).

| Tier | Levels | Grid growth | What’s new |
|------|--------|-------------|------------|
| Tutorial | 1–3 | 3×2 – 4×2 | Basics |
| Easy | 4–6 | 4×2 – 5×2 | T-junctions, corners |
| Medium | 7–11 | 5×3 – 6×4 | Forks, snakes (wider boards) |
| Hard | 12–15 | 6×4 – 8×6 | **Much larger** puzzles (padding + wider paths) |
| Mechanics | 16–21 | 3×4 – 7×4 | Rocks, leaks, valves, colors |
| Wide | 22 Big Backyard | **7×6** | Big open lawn before the finale |
| Finale | 23 End of the World | **8×6** | All mechanics, 100s timer |
| Build | 24–25 Longest / Shortest | **8×8** | Pick pipes from a kit; longest vs shortest route |
| Secret | 🤫 Secret Garden | 3×2 | Tap menu title 5× after finale |

Board **auto-scales**: bigger grids use slightly smaller cells (down to 32px on 8×8) so the whole field fits on iPad.

### Build levels (longest & shortest)
After **End of the World**, two **designer** challenges use the same **8×8** empty grid:
- **Pipe palette** — tap ━ └ ┳ to choose, tap **+** grass to place, tap a pipe to rotate, 🗑 to remove and refund.
- **Longest Hose** — water must reach the garden with **at least 16 pipes** in the connected route (snake the big field!).
- **Shortest Hose** — same **8×8** layout, but **at most 7 pipes** (direct path).
- HUD **🛤** meter tracks pipe count vs target. Teaches path length, planning, and tradeoffs.

**Visual themes** shift by tier (dawn → meadow → garden → greenhouse → workshop → sunset; apocalypse/secret for bonus levels).

**Combo reactions** pop up when multiple gardens soak at once, on first bloom in multi-goal levels, or on a par-or-better win.

**Wilting hint** — on timed levels, under 15s the status nudges you toward 💡 Hint and the hint button pulses.

### Water physics, buckets & Pour Back
- Water **flows through the whole connected network** (animated pulses, droplets along pipes, path highlight).
- **Garden buckets** 🌻 — each goal has a bucket that **fills up** when water arrives (HUD shows `full/total`).
- **Leak catch buckets** — bad leaks spawn small **🪣 buckets** on the board that fill; **tap a bucket** to pour the water back toward the hose.
- **Spill bucket** (HUD) — leakage fills one meter; turns orange when high. **Pour Back** button sends it back toward the hose (kid-friendly: don’t waste water).
- **Closed loop rule:** blocking leaks are gaps, cracks, edge spills, and misaligned joints. Extra T-arms pointing at empty grass still spray but **do not block** winning.
- Water sprays from any open end until you spin pipes to **close the loop**. Pour Back moves spilled water but **cannot win** until blocking leaks are fixed (`open ends = 0`).
- **Puddles** at open ends; **overflow** droplets when gardens are full.
- **Win rule:** gardens watered, **garden buckets full**, **closed loop** (zero open ends), plus route length on build levels.

Each level is verified solvable (`verify-pipe-levels.mjs` for 1–15, `verify-pipe-mechanics.mjs` for 16–23). Win screen shows stars based on moves vs par.

### Persistence today (`localStorage`)
- **`pipeflow_save`** — `{ nextLevel, stars, maxBeaten }`: resume campaign, star totals on menu, **Continue · Level N** button.
- **`pipeflow_secret`** — set after beating End of the World; 5× menu title tap opens Secret Garden.
- Menu **Start from Level 1** clears campaign save (not the secret flag).

### Deferred (later)
| Feature | Notes |
|---------|--------|
| **Meta replay** | Best moves per level, completion %, replay ghosts |
| **Daily puzzle** | Date-seeded layout + “played today” flag |

---

## Controls
- **Tap pipe** — rotate
- **Reset** — restart level
- **Hint** — solve one pipe rotation
- iPad-first: 44px+ cells, touch + click handlers

---

## Tech notes
- Single self-contained HTML file
- Canvas rendering with animated water glow on connected pipes
- Web Audio API for rotate / hint / win sounds
- Exposes `window.render_game_to_text` and `window.advanceTime` for automated testing
