# Dust Chasers — Game Spec

**File:** `maya/dust-chasers.html`
**Framework:** Plain HTML/CSS/Canvas
**Status:** ✅ Shipped, mostly working

---

## Concept
Invisible ghost-like "dust people" drift around a dark room. You only see them as
glowing motion trails and air disturbances. Use a flashlight (your cursor/finger)
to reveal them, click to vacuum them up, dodge the dangerous chasers.

---

## How It Works

### Core mechanic
- Mouse/finger position controls the flashlight
- Ghosts are dim normally, **bright when inside your cursor ring**
- **Click/tap on a ghost or its trail** to vacuum it (pop animation)
- **SPACEBAR or 💥 button** fires a shockwave that kills everything in range
- Survive 60 seconds or get caught = game over

### Ghost types
| Type | Colour | Behaviour | Points |
|------|--------|-----------|--------|
| Drifter | Green | Slow wander, bounce walls | 150 |
| Chaser | Red | Hunts your cursor, evil grin | 300 |
| Bouncy | Yellow | Fast, unpredictable bouncing | 200 |
| Sneaky | Purple | Slow creep + goes invisible | 250 |

### Ghost visibility
- Base alpha: `0.10` (very dim)
- Inside cursor ring (90px): `0.75` (bright)
- Each ghost has: glow aura, blob body, eyes, motion trails, speed lines
- Scared state (after shockwave): shrinks, wobbles, runs away

### Danger zone
- Chasers/sneaky within ~140px → cursor ring turns red + pulses
- Dashed ring appears around the ghost showing it's in danger zone
- Only killed if ghost hits the tiny cursor dot (14px) — not the outer ring

### Shockwave
- SPACEBAR or 💥 touch button
- Cooldown bar shows recharge (SHOCK_MAX = 280 frames)
- Kills all ghosts within 400px radius
- Triple pop burst, screen flash orange, screen shake
- Surviving ghosts get "scared" state for 120 frames

### Scoring
- +150 per ghost vacuumed
- +300 per chaser
- +5 per second survived
- Combo system for rapid kills

### Ghost spawn schedule
- Start: 2 drifters
- Frame 150: first chaser
- Frame 300: bouncy added
- Frame 480: sneaky added
- Every ~200 frames: new ghost (max 10)

---

## Controls
| Action | Desktop | iPad |
|--------|---------|------|
| Move flashlight | Mouse move | Touch/drag |
| Vacuum ghost | Click | Tap |
| Shockwave | Spacebar | 💥 button (bottom right) |

---

## Known Issues
- Occasional ghost gets stuck off-screen
- Sneaky ghost blink timing could be more dramatic

---

## Improvement Ideas
- Sound effects for each ghost type
- More ghost types (tiny fast ones, giant slow one)
- Boss ghost on day 3
- Room gets dustier as time goes on (visual fog)
