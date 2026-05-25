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
23 levels (21 main + finale + secret). **Par** is the minimum number of pipe rotations to solve; shown in the HUD as `Level N · Par P`.

| Tier | Levels | Par (min moves) | What’s new |
|------|--------|-----------------|------------|
| Tutorial | 1–2 | 1 | Straight pipes, one corner |
| Easy | 3–6 | 2 | Longer paths, T-junction |
| Medium | 7–11 | 3 | Forks, snakes, more pipes |
| Hard | 12–15 | 4 | Wide grids, many corners |
| Mechanics | 16–21 | 1–3 | Two gardens, rocks, leaks, valves, colors, timer |
| Finale | 22 End of the World | 4 | All mechanics, apocalypse theme, 90s timer |
| Secret | 🤫 Secret Garden | 2 | Unlock after beating the finale; tap menu title 5× |

**Visual themes** shift by tier (dawn → meadow → garden → greenhouse → workshop → sunset; apocalypse/secret for bonus levels).

**Combo reactions** pop up when multiple gardens soak at once, on first bloom in multi-goal levels, or on a par-or-better win.

**Wilting hint** — on timed levels, under 15s the status nudges you toward 💡 Hint and the hint button pulses.

### Water physics & leaks
- Water **flows through the whole connected network** (animated pulses, droplets along pipes, path highlight).
- **Leaks** spray from open ports into empty grass, off the edge, or through **cracked `B` pipes** (must spin to seal). Misaligned joints **drip** visually but do not block the win.
- **Puddles** grow under serious leaks until you fix them.
- **Overflow** — watered gardens spout extra droplets upward.
- **Win rule:** all gardens watered **and** no blocking leaks (`soak` / `crack` / `edge`). Status shows leak count; “Seal N leaks to win!” when the path is right but pipes still spray.

Each level is verified solvable (`verify-pipe-levels.mjs` for 1–15, `verify-pipe-mechanics.mjs` for 16–23). Win screen shows stars based on moves vs par.

### Persistence today
- **No save slot / campaign progress** — each visit starts at level 1 unless you use in-session play-through.
- **Secret unlock** — the only stored flag: `localStorage.pipeflow_secret` after beating End of the World (so the 5× title tap works on return visits). Everything else is in-memory for the session.

### Deferred (needs persistence — design later, not now)
Static hosting with no backend means these wait until we have an agreed store (localStorage schema, optional sync, or server):

| Feature | Why it needs persist |
|---------|----------------------|
| **Save progress** | Resume level index, stars per level, finale/secret flags |
| **Meta replay** | Best moves, total stars, completion %, “pipe master” stats |
| **Daily puzzle** | One shared seed/layout per calendar day + “already played today” |

Ideas sketched for when we add storage:
- **Daily** — `YYYYMMDD` seed → pick level template + scramble rot; show streak / today’s par on menu.
- **Meta** — aggregate stars, perfect-count, fastest timer clears; optional replay ghost (move list) on par levels.
- **Save** — `{ level, stars: Record<level,1|2|3>, secret, dailyLast }` in `localStorage` or Maya progress hub if the portal gets a shared save API.

Until then: level themes, combos, finale, and secret stay session-first; no daily board.

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
