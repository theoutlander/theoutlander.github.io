# Spell It! — Game Spec

**File:** `maya/letter-tumble.html`
**Framework:** Plain HTML/CSS/JS
**Status:** ✅ Shipped, playable — some rough edges

---

## Concept
A spelling game where letters fall from the top of the screen. The player taps them
in the correct order to spell the mystery word. Get it right = rainbow and celebration.
Get it wrong = rain drops and lose a heart.

---

## How It Works

### Core mechanic
1. A mystery word is chosen (shown as `_ _ _` blanks at the bottom)
2. Emoji clue + hint text shown (e.g. 🐱 "Meows and purrs")
3. Letters fall continuously from the top — mix of needed letters + decoys
4. **Tap letters in order** — if the word is CAT, tap C first, then A, then T
5. Correct tap → letter slots into blank, lights up green, +points
6. Wrong order tap → red explosion, lose a heart (Lives mode only)
7. Random letter (not in word) → neutral pop, no penalty
8. Missed letter → falls off bottom, comes back around
9. Complete word → rainbow burst, confetti, next word

### Word display
- Blank slots at the bottom: `_ _ _`
- **"HINT ✨" button** toggles yellow glow on the next needed letter
- When hint on: "👉 Find the letter: C" shown below the word label
- Next blank slot pulses yellow when hint is on

### Letter spawning
- Columns system prevents overlapping
- Max 2 fallers at level 1, up to 6 at higher levels
- 55% chance the next needed letter spawns (if none already falling)
- Decoys avoid being the same letter as what's currently needed
- Speed: `0.45 + level * 0.1` pixels per frame

### Game modes
| Mode | Description |
|------|-------------|
| ❤️ Lives | 3 hearts, wrong order loses one, game over at 0 |
| ⏱️ Time | 60 seconds, spell as many words as possible |
| 🌈 Zen | No penalties, just tap in order, relaxed |

### Grade system
- Grade 1: 3-letter words (cat, dog, sun...)
- Grade 2: 4-letter words (cake, frog, star...)
- Grade 3: 5-letter words (magic, tiger, storm...)
- Grade 4: 6-letter words (planet, bridge, castle...)
- Grade 5: 7-letter words (captain, diamond, penguin...)
- 15 words per grade

### Scoring
- Correct tap: `(letterIndex + 1) * 10` points
- Word bonus: `wordLength * 100 * grade`
- Level increases on each word completed

---

## Known Issues
- Letter overlap still possible occasionally (spawn column logic imperfect)
- At high levels letters fall too fast for kids
- Grade level doesn't unlock progressively (any grade selectable)

---

## Improvement Ideas
- Dad can type a custom word list before Maya plays (secret word mode)
- Show the word in a picture (image clue) not just emoji + text
- Multiplayer: Dad says the word out loud, Maya spells it (current use case on calls)
- Audio pronunciation of the word when round starts
- Leaderboard across sessions
