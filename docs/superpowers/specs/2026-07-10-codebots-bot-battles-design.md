# CodeBots — Bot Battles

**Date:** 2026-07-10
**Status:** Direction approved (owner: preset opponents → publish → PvP; arenas mix mission + combat)

## Goal

Turn the single-bot sim into **battles**: the kid writes her bot's brain, presses RUN, and it fights
autonomous enemy bots *on its own* — she can't intervene. This makes the lesson she's missing
visceral: **your program is the bot's brain; a bad program loses.** Arenas mix the goal she already
understands (reach the beacon) with combat (enemies roam and shoot).

## The core lesson (why this matters pedagogically)

Solving puzzles never forces the "autonomous agent" idea — she can retry instantly. A fight does:
the enemy is *also* a program, both run at once, and once RUN is pressed neither can be steered.
Winning = better code, not better reflexes.

## Phasing (owner wants all of it; built in order)

- **Phase 1 — Local battles (build now).** A new BATTLE arena type: her bot + 1–3 **preset** enemy
  bots (authored brains), on a shared deterministic clock, with combat. Win = reach the beacon
  while surviving (armor > 0) and/or wreck the enemies. Delivers the whole lesson locally.
- **Phase 2 — Publish & PvP (later, on the accounts we just built).** Save her bot's brain to her
  Supabase account; a shared pool of published bots; pick an opponent and watch the two brains
  fight. Same deterministic engine, so a battle is reproducible from the two programs + arena seed.

## Architecture — additive, never touches the campaign engine

The existing `createSim` (single actor) and all its tests stay exactly as they are. Battles are a
**new layer** on top of the same primitives.

### Deterministic multi-actor model: round-based interleaving

Each actor (player + enemies) is a program compiled to the existing command generator. A battle
runs in **rounds**:

1. Step the **player** generator for one command → apply to shared battle state → emit events.
2. For **each enemy** (fixed order), step its generator for one command → apply → emit events.
3. Resolve combat that happened this round; check win/loss.
4. Repeat until someone wins, everyone's out, or a step cap is hit.

Round-based (not real-time physics) keeps it **fully deterministic and simple**: same programs +
same arena ⇒ same battle, every time. Enemies act "between" her commands, which reads as a live
fight but is reproducible (critical for PvP replays and for golden tests).

### Battle state + combat

- Shared `BattleState`: a list of bots `{ id, pos, facing, armor, wrecked, program }`, plus the
  arena. The player is bot 0.
- `shoot()` fires down the facing lane; the **first bot** hit (before any wall) takes damage; at
  armor 0 it's `wrecked` and removed from play (stops acting, drawn as scrap).
- Sensors gain battle-awareness (additive, only in battle arenas): `enemyAhead()` (a bot in the
  lane ahead), `enemyNear()` — so her code can decide to shoot/dodge. Campaign sensors unchanged.
- Win rule (per arena): `reachBeacon` (survive + arrive), `lastStanding` (wreck all enemies), or
  `both`.

### Preset enemy brains (Phase 1 content)

Authored programs, deterministic:
- **PATROLLER** — walks a fixed loop (harmless unless you block it).
- **CHASER** — turns toward the player and advances (`if (enemyAhead)` style, but authored).
- **SNIPER** — holds a lane and `shoot()`s when the player is in front.

Because enemy brains are just programs in the same language, "publish your bot" (Phase 2) reuses
this exact slot — a published bot is an enemy brain.

### View + UI

- `ArenaScene` renders N bots (reuse `createBot`, distinct colors/markers per bot), plays the new
  events: enemy moves/turns/shoots, hit/wreck FX. Event log stays the single source of truth.
- A BATTLE screen (variant of the mission screen): her editor on the right; the battle plays with a
  health readout per bot; win/lose overlay ("YOUR BOT WON" / "wrecked — fix your code and rematch").
- Entry points: Open Field gets a "BATTLE" challenge type (preset enemies); later a dedicated Arena.

## Verification (this is safety-critical — everything rests on the sim staying deterministic)

- **Determinism test:** run a fixed player program + fixed enemies twice; assert byte-identical
  event logs. This is the property PvP and golden replays depend on.
- **Combat unit tests:** shoot hits the first bot in the lane not a wall behind it; armor→0 wrecks
  and the bot stops acting; a wrecked bot can't be hit again / doesn't block oddly.
- **Preset-brain golden tests:** each preset enemy runs without throwing on a representative arena;
  a known player program beats each preset (proves winnable).
- **Round cap** surfaces as a friendly "the battle went on too long" (like the loop guard), never a
  hang.
- Campaign untouched: all existing 145 tests must stay green (battles are a separate path).

## Out of scope for Phase 1

- PvP publishing / matchmaking (Phase 2, on Supabase accounts).
- Real-time physics, projectiles-as-entities, diagonal movement.
- Enemy AI beyond authored preset brains.

## Open question deferred to build

Exact combat numbers (armor totals, damage per shot, shoot range in battle) — tuned during build so
fights last a satisfying handful of rounds, not one shot or forever.
