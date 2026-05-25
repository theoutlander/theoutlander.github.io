# Castle Defenders — Game Spec

**File:** `maya/castle-defenders.html`
**Framework:** Phaser 4.1.0 (CDN)
**Status:** Live in Phaser — polish and bugfixes only unless explicitly rebuilding

---

## Concept
A side-scrolling day/night survival game. Castle on the left, zombies march in from the right.
During the day you gather wood and forge weapons. At night you fight off the horde.

---

## Game Loop

```
Morning → Forge → Night → Morning (repeat, harder each day)
```

### Morning phase 🌅
- 2 chop actions per morning (increases slightly each day)
- Two trees on the right side of screen, each has 3 logs
- Tap a tree → get 1 wood, use 1 action
- Run out of actions → automatically go to Forge phase
- Sky: bright blue, sun visible

### Forge phase ⚒️
- Use wood to craft weapons before night
- Three weapons available:

| Weapon | Cost | Damage | Notes |
|--------|------|--------|-------|
| 🏹 Bow | 2 wood | 1 hit | Cheap, basic |
| ⚔️ Sword | 3 wood | 1 hit | Balanced |
| 🪓 Axe | 4 wood | 2 hits | Expensive, powerful |

- Can only craft each weapon once per day
- Must have at least 1 weapon to proceed to night
- "To Battle!" button sends you to Night phase

### Night phase 🌙
- `zombiesTotal = 20 + day * 10` zombies per night (Day 1 = 30, Day 2 = 40, etc.)
- Zombies march left from off-screen right
- Tap a zombie to hit it — uses best available weapon's damage
- Zombie HP: `1 + floor(day/3)` — gets tankier each day
- Zombie speed: `0.5 + day * 0.12` — gets faster each day
- If zombie reaches castle → castle loses 8 HP, camera shake
- Castle HP: starts at 100, castle falls at 0 → game over
- Kill all zombies → survive, day counter increases, back to morning
- Sky: dark purple/navy, stars, moon

---

## Scenes (Phaser 4)

```
MenuScene → MorningScene → ForgeScene → NightScene → MenuScene/GameOverScene
```

All graphics drawn with Phaser Graphics primitives + emoji text objects.
No external image files.

### MenuScene
- Night sky, stars, castle silhouette
- Title + instructions
- "Defend the Castle!" button

### MorningScene
- Day sky (0x87ceeb)
- Castle on left (drawn with graphics)
- Two trees on right (emoji 🌲🌳, interactive)
- Wood counter, action pips
- Auto-transitions to ForgeScene when actions run out

### ForgeScene
- Day sky
- Forge graphic (drawn) with fire effect
- Three weapon cards (interactive rectangles)
- Wood counter
- "To Battle!" button

### NightScene
- Night sky, stars, moon
- Castle with candle glow effects
- Castle HP bar
- Zombie spawner (timed wave)
- Weapon bar at bottom
- Score counter
- Transitions to GameOverScene or back to MorningScene

### GameOverScene
- Dark background
- Stats: days survived, zombies killed, score
- Try Again + Menu buttons

---

## Phaser 4 Implementation Notes
- CDN: `https://cdnjs.cloudflare.com/ajax/libs/phaser/4.0.0/phaser.min.js`
- Scale mode: `Phaser.Scale.FIT` + `CENTER_BOTH`
- Width/Height: `window.innerWidth` × `window.innerHeight`
- Input: touch enabled, `activePointers: 2`
- All text: Fredoka One font (loaded via Google Fonts in HTML head)
- Audio: Web Audio API directly (not Phaser audio) — simple tones

---

## Known Issues
- Current plain HTML version is buggy — forge button doesn't always appear
- Zombie march loop can stall after scene restart
- Needs full Phaser 4 rebuild from scratch

---

## Improvement Ideas
- Animated zombie walk cycle (Phaser tweens)
- Castle crumbling visually as HP drops
- Different zombie types (fast tiny ones, slow giant ones)
- Upgrade system (spend score between days on castle repairs/upgrades)
- Boss zombie every 5 days
- Day/night sky transition using Phaser tweens on background colour
- Sound effects per action (chop, craft, zombie hit, castle hit)
