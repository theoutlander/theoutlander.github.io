# Piñata Piano — Game Spec

**File:** `maya/pinata-piano-v2.html`
**Framework:** Plain HTML/CSS/JS + Web Audio API
**Status:** ✅ Shipped and working

---

## Concept
A music learning game. Notes fall from a piñata as candy. The player taps piano keys
at the bottom in time to play a song. Each correct note pops candy and damages the piñata.
Spell the whole song correctly and the piñata explodes with a candy shower.

---

## How It Works

### Song selection screen
- 4 songs available: Twinkle Twinkle (⭐ Easy), Mary Had a Little Lamb (⭐⭐),
  Happy Birthday (⭐⭐), Baby Elephant Walk (⭐⭐⭐)
- Two modes: **Normal** and **Practice** (slower, hint always on)

### Core mechanic
1. A candy block falls from the piñata showing the note name (e.g. "C4")
2. The correct piano key glows yellow
3. Player taps the right key → candy POPS (shards fly, sparkles burst)
4. Player taps wrong key → candy MELTS (drips down, puddle appears)
5. Miss (runs out of time) → candy melts
6. Complete all notes → piñata explodes, confetti, win screen

### Piano layout
- 13 keys: C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5 A5
- Each key is a different colour
- Key labels fade after first few correct hits (learning progression)

### Scoring
- Points per hit × combo multiplier
- Combo builds on consecutive correct hits
- 3-star rating on win screen based on score
- Stars saved to localStorage per song

### Special mechanics
- **Golden candy** (15% chance) — worth 50pts, big starburst explosion
- **Combo system** — x2, x3 etc with screen shake at high combos
- **Hint system** — glowing key + "Find the letter: X" label, toggleable
- **Practice mode** — speed cut to 55%, always shows hints

---

## Songs Data Structure
```javascript
{name, notes: ['C4','D4',...], bpm, color}
```

---

## Audio
Web Audio API, triangle oscillator for piano notes.
Each note frequency hardcoded in `FREQS` object.

---

## Known Issues
- None currently

---

## Improvement Ideas
- Add more songs
- Difficulty setting that removes key labels entirely
- Two-player mode where Dad plays one hand
