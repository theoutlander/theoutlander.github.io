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

### Levels
6 levels with only the pipes needed for the path — no decoy tiles. Each puzzle has a single clear solution.

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
