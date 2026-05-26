# Star Squads! — Game Spec

**File:** `maya/star-squads.html`  
**Framework:** Phaser 4.1.0  
**Status:** Shipped

---

## Concept

Team space battle inspired by Netrek — pick **Federation** or **Klingons**, fly your ship Asteroids-style, shoot enemies, and capture planets for your squad.

---

## How it works

### Teams
- **Federation** (blue) vs **Klingons** (orange)
- You fight the other team’s bot ships

### Controls
| Input | Action |
|-------|--------|
| **Mouse / finger in sky** | Ship points at cursor; **hold** to thrust |
| ◀ / ▶ buttons | Rotate (hold) |
| 🚀 button | Thrust (hold) |
| 💥 button | Fire |
| Arrow keys / A D | Rotate |
| W or ↑ | Thrust |
| Space (hold) | Fire |
| iPad | One finger in sky to fly; other finger on 💥 to shoot |

### Win
- Capture **all 3 planets** for your team, **or**
- Destroy all enemy ships

### Lose
- Lose all **3 lives** (100 HP each life)

### Planets
- Fly within range and hold to capture (progress ring grows)
- Neutral planets turn your team color when captured

---

## Tech notes
- Single HTML file, Phaser 4 CDN
- Arcade physics: ship drag, bounce off walls and asteroids
- Web Audio beeps for shoot / hit / win
- iPad-first: 52px touch buttons, `activePointers: 4`
