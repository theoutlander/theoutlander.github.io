# Legend of the Rainbow Dragon — Game Spec

**File:** `maya/legend-of-the-rainbow-dragon.html`
**Framework:** Plain HTML/CSS/JS (DOM)
**Status:** Phase 1+ shipped (solo, expanded content); Phase 2 API designed, not implemented
**Inspired by:** LORD (fan homage for adults; kids see **Sparkle Dragon 3000** as the in-game console name)

---

## Concept

A kid-safe daily-turn fantasy RPG (**Legend of the Rainbow Dragon**; family nickname **LORD**). Cartoon “play-fighting” tone: monsters are fluffy or silly rivals; nobody dies; dragon ends as a friend; no blood, crude humor, bombs, skulls, or scary phrasing ("dark forest", phantom, etc.). Console UI name: **Sparkle Dragon 3000**.

---

## Hero stats

| Stat | Role |
|------|------|
| Level | Unlocks monsters, boss, shop tiers |
| XP | Level up at thresholds |
| HP / MaxHP | Combat; inn restores |
| STR | Damage (plus weapon bonus) |
| DEF | Reduces incoming damage |
| Gold | Shop & healer |
| Charm | Snack Bar rewards |
| Weapon | Equipped shop item (bonus STR) |

**New hero:** Level 1, HP 10/10, STR 10, DEF 5, Charm 5, Gold 200, Stick (+0 STR).

---

## Daily turns

- **MAX_TURNS:** 18 per calendar day (local date `YYYY-MM-DD`)
- Each location action costs **1 turn** (forest fight/flee, shop buy, healer, inn rest, snack bar, dragon attack)
- When turns hit 0, only **End Day** (free) or view log — next calendar day refills turns
- Save stores `turnDay` + `turnsLeft`

---

## Locations

### Town hub
Forest, Weapon Shop (weapons + armor), Healer, Inn, Snack Bar, **Bard's Stage** (once/day buff), **Mailbox**, **Hero Stats** (achievements), Rainbow Dragon (level 12+), **New Game+** after first dragon kill, End Day.

### Forest
- ~62% combat (common/tough/elite)
- 8% treasure chest
- 10% funny event (no combat)
- **Star** monsters (orange tag): bonus loot, framed as sparkly friends — not Elite/gory
- **Adventure Buddy** helps every 3rd combat round (+2 dmg)
- **Charm:** better flee chance; +1 gold per 3 Charm on victory
- Flee: 65% + 1% per Charm (max 90%); fail = forced fight

### Weapon shop
| Item | STR | Cost | Min level |
|------|-----|------|-----------|
| Stick | 0 | (start) | 1 |
| Wooden Sword | 5 | 150 | 2 |
| Silver Blade | 12 | 400 | 5 |
| Rainbow Saber | 20 | 900 | 10 |
| Starlight Dagger | 28 | 1500 | 15 |

### Armor shop
| Item | DEF | Cost | Min level |
|------|-----|------|-----------|
| Leather Vest | 3 | 120 | 3 |
| Chain Mail | 7 | 350 | 6 |
| Rainbow Shield | 12 | 800 | 10 |

### Healer
Full heal for `20 + level * 5` gold.

### Inn
Restore HP to MaxHP. If turns = 0, also rolls day (same as End Day).

### Snack Bar
Random: joke (+1 charm), riddle (39 kid-friendly riddles, correct +15 gold), recruit **Adventure Buddy** (permanent combat help), muffin (+3 HP).

### Bard's Stage
Once per day: random song buff (STR, HP, gold, Charm, or DEF).

### Mailbox
Free to read; new letter each day; spend 1 turn to request extra mail.

### Achievements (local)
First Victory, level 5/10, 500 gold, 15 Charm, buddy, Rainbow Champion / NG+, 50 silly monsters defeated (🏅 emoji, not skulls).

### Rainbow Dragon (boss)
- Unlock at **level 12**
- 500 HP solo pool (saved on hero as `dragonHp`)
- Each attack turn: hero damage based on STR+weapon; dragon counter-attacks
- Win: victory flag; **New Game+** respawns dragon at 750 HP
- Web Audio tones for fight, win, level-up, shop, bard

---

## Combat

```
playerDmg = max(1, floor(STR + weaponStr) - floor(monster.def * 0.5))
monsterDmg = max(1, floor(monster.atk) - floor(DEF * 0.4))
```

Rounds alternate until monster HP ≤ 0 (**win**) or hero HP ≤ 0 (**sleepy scrape**: wake at inn, lose gold; no scary defeat screen).

---

## Leveling

| Level | XP needed (cumulative from previous) |
|-------|--------------------------------------|
| 2 | 50 |
| 3+ | 50 + (level-1) * 40 |

On level up: +2 MaxHP, +1 STR, +1 DEF, full heal.

---

## Kid-safe mapping

| LORD | This game |
|------|-----------|
| Tavern / flirt | Snack Bar (jokes, riddles) |
| Marriage | Adventure Buddy mention only (flavor) |
| Red Dragon | Rainbow Dragon |
| Death | Too tired → rest at inn (no death) |

---

## Save

- Key: `lord_rainbow_dragon_v1`
- JSON via `localStorage`; export not required for Phase 1

---

## Testing hooks

- `window.render_game_to_text()` — JSON snapshot for automation
- `window.advanceTime(ms)` — no-op (turn-based); reserved for future

---

## Phase 2 API (design only — Railway or Cloudflare Worker)

**Realm:** `karnik` (family invite PIN in env)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/register` | `{realm, pin, name, avatar}` → create hero |
| POST | `/action` | `{heroId, action, ...}` authoritative turn + combat |
| GET | `/realm/:id` | Leaderboard, shared `dragonHp`, recent events |
| POST | `/mail` | `{from, to, text}` postcard (max 200 chars) |

**CORS:** `https://maya.karnik.io`, `https://nick.karnik.io`

**Game client:** `?realm=karnik` switches from localStorage to API; offline solo without query param.

**Auth:** Shared family PIN + per-hero password (no OAuth).

---

## Controls

- Large tap buttons (min 44–48px by device)
- Scrollable adventure log (Sparkle Dragon 3000); main area scrolls if buttons overflow
- Responsive: iPhone (narrow + landscape), iPad (2-column town buttons), Mac (wider layout, hover, centered card at 1200px+)
- Safe-area padding for notched iPhones
- iPad-first; `touch-action: manipulation` on buttons
