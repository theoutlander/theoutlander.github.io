# Legend of the Rainbow Dragon — Game Spec

**File:** `maya/legend-of-the-rainbow-dragon.html`
**Framework:** Plain HTML/CSS/JS (DOM)
**Status:** Phase 1 shipped (solo); Phase 2 API designed, not implemented
**Inspired by:** BBS door game LORD (fan homage, not official)

---

## Concept

A kid-safe daily-turn fantasy RPG. Spend turns in town and the forest, level up, visit the Snack Bar for jokes and riddles, and defeat the Rainbow Dragon when strong enough.

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
Forest, Weapon Shop, Healer, Inn, Snack Bar, Rainbow Dragon (level 12+), End Day.

### Forest
- 70% common mob (by level tier)
- 20% tough mob (+2 level tier)
- 10% funny event (no combat, +gold or +charm)
- Fight: auto-resolve rounds until win, flee, or knockout
- Flee: 65% success; fail = forced fight

### Weapon shop
| Item | STR | Cost | Min level |
|------|-----|------|-----------|
| Stick | 0 | (start) | 1 |
| Wooden Sword | 5 | 150 | 2 |
| Silver Blade | 12 | 400 | 5 |
| Rainbow Saber | 20 | 900 | 10 |

### Healer
Full heal for `20 + level * 5` gold.

### Inn
Restore HP to MaxHP. If turns = 0, also rolls day (same as End Day).

### Snack Bar
Random: joke (+1 charm), riddle (correct +15 gold), NPC ally (+5 XP), muffin (+3 HP).

### Rainbow Dragon (boss)
- Unlock at **level 12**
- 500 HP solo pool (saved on hero as `dragonHp`)
- Each attack turn: hero damage based on STR+weapon; dragon counter-attacks
- Win: victory flag, hall of fame log entry

---

## Combat

```
playerDmg = max(1, floor(STR + weaponStr) - floor(monster.def * 0.5))
monsterDmg = max(1, floor(monster.atk) - floor(DEF * 0.4))
```

Rounds alternate until monster HP ≤ 0 (win: XP + gold) or player HP ≤ 0 (**knocked out**: wake at inn, lose 25% gold, no death screen gore).

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
| Death | Knocked out → inn |

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

- Large tap buttons (min 48px)
- Scrollable BBS-style log
- iPad-first; `touch-action: manipulation` on buttons
