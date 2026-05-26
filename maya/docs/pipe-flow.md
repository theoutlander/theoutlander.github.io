# Pipe Flow! — Game Spec

**File:** `maya/pipe-flow.html`
**Framework:** Plain HTML/CSS/Canvas
**Status:** ✅ Shipped

---

## Concept
Connect garden hoses to thirsty flowers! On kit levels, **drag pipes from the bar** onto **+** grass; on classic levels, **tap pipes to spin** them. Water flows from the hose through connected pipes.

---

## How It Works

### Core mechanic
- **Win:** every flower has water (matching color on rainbow levels). Open ends and drips are **visual only** — they do not block winning.
- **Kit levels:** drag ━ └ ┳ onto **+** cells; drag placed pipes to move; drag to the **trash zone** (or off the board) to remove and refund; **tap** a pipe to rotate.
- **Classic levels:** tap any **non-fixed pipe** to rotate 90° clockwise.
- Water flows automatically (BFS from source).
- **Reset** restores the starting layout; **Hint** places or rotates toward a solution.

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
After **End of the World**, two **designer** challenges use a large empty grid:
- **Pipe palette** — drag ━ └ ┳ onto **+** cells; tap to rotate; trash zone to remove and refund.
- **Longest Hose** — reach every flower with **at least N pipes** in the connected route.
- **Shortest Hose** — same layout, but **at most N pipes**.
- HUD **🛤** meter tracks pipe count vs target.

**Visual themes** shift by tier (dawn → meadow → garden → greenhouse → workshop → sunset; apocalypse/secret for bonus levels).

**Combo reactions** pop up when multiple gardens soak at once, on first bloom in multi-goal levels, or on a par-or-better win.

**Wilting hint** — on timed levels, under 15s the status nudges you toward 💡 Hint and the hint button pulses.

### Water physics
- Water **flows through connected pipes** (animated pulses, droplets, path highlight).
- **Open ends** spray puddles for juice; they do **not** block winning.
- HUD **🌻** shows flowers watered (`n/total`).
- **Win rule:** all flowers watered (+ route min/max on build levels). Valves must be open; broken pipes need one spin to clear.

**Controls:** drag kit pipes onto **+**; drag placed pipes to move or trash; tap to spin (valves: double-tap to open). Hose, flowers, rocks, and animals stay put.

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
