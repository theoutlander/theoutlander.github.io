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
21 levels with a rising difficulty curve. **Par** is the minimum number of pipe rotations to solve; shown in the HUD as `Level N · Par P`.

| Tier | Levels | Par (min moves) | What’s new |
|------|--------|-----------------|------------|
| Tutorial | 1–2 | 1 | Straight pipes, one corner |
| Easy | 3–6 | 2 | Longer paths, T-junction |
| Medium | 7–11 | 3 | Forks, snakes, more pipes |
| Hard | 12–15 | 4 | Wide grids, many corners |
| Mechanics | 16–21 | 1–3 | Two gardens, rocks, leaks, valves, colors, timer |

Levels 16–21 show a mechanic tip under the HUD. Level 21 adds a countdown (`timer` in level data); wilt overlay on timeout.

Each level is verified solvable (`maya/scripts/verify-pipe-levels.mjs` for 1–15, `verify-pipe-mechanics.mjs` for 16–21). Win screen shows stars based on moves vs par.

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
