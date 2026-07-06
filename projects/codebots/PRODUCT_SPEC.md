# CODEBOTS — Product Spec v1.0
July 5, 2026 · Status: ready for Claude Code
Design source of truth: the CodeBots design project (spec doc + exploration canvas + design system). Implementation: Claude Code. Chief creative consultant: Asha, age 10.

Kids learn to really code by **programming** a little robot. The bot grows more capable, the programs grow more powerful, the obstacles grow meaner — all three rise together.

## 1. What it is
For kids 9–13. **V1 is single player**: a campaign of coding missions themed as a pirate story — the **Rust Pirate League** has scattered treasure across the sectors; each world ends with a pirate captain boss. Plus treasure raids for coins and time trials against your own ghost. One robot per kid: named, painted, and above all programmed — every upgrade is a new command to master, not a stat to buy. Competitive, never violent — bots get tagged, dented, netted and towed; nothing dies. Multiplayer (hot-seat duels, then 4-bot arenas) comes after v1.

## 2. The five laws
1. A bot is a body plus parts. Parts cost weight and add commands.
2. Lessons unlock, coins build — you can never buy what you haven't learned.
3. Every trap has an exit you can code.
4. Nothing dies — tagged bots reboot.
5. A number never appears before the kid has felt what it does.

## 3. The language
**Real JavaScript, shown to the kid as just "code."** No invented language: nothing she learns should need unlearning, and we never own a compiler. `forward(3)` is already a real function call.

- Training wheels: `repeat 3 { }` in Worlds 1–2 (the World 2 boss ceremonially upgrades it to `for`), forgiving semicolons, and `when bumped { }` event blocks from World 4.
- Kid-worded errors that point at the line; errors never cost points.
- Sandboxed worker execution with a per-tick step budget; deterministic sim — same code, same result, always.
- **Reactive code is event-based.** Driving is a script; reactions are when-blocks: `when bumped { back(2) }`. V1 events: bumped · hit · spotted · frozen · tangled · chest opened · tick · mishaps (e.g. treadPopped). World 6 reveals a when-block is just a function handed to the game — and the battle `tick` is one more event. One model, no magic.
- **Code stays small, always.** Each mission is a short fresh script; reactive code is one card per when-block (a stack of small blocks, never a wall of text); her own functions collect in a **MOVES tab** — a personal library that follows her everywhere. Later worlds add **modes**: each mode is its own card of when-blocks, switched with `setMode("chase")`; the HUD highlights the live mode during a run — a state machine she can watch think. Any card past ~30 lines gets a nudge: "make a move out of it."
- Python / TypeScript: someday shelf.

## 4. The campaign — 8 worlds, no more
| World | Teaches | Unlocks |
|---|---|---|
| 01 FIRST ROLL | commands & sequences; turns, speed | AIR HORN · honk() |
| 02 ROUND & ROUND | repeat → for, nested patterns | TURBO TREADS · boost() |
| 03 TREASURE COUNT | variables, math — first chests & coins | CARGO CLAW · grab() |
| 04 EYES ON | if/else, radar & touch sensors, events | RADAR DISH · radar() |
| 05 SMART LOOPS | loops + ifs; patrols that react | ZAPPER · fire() |
| 06 MY OWN MOVES | functions & parameters | MACRO CHIP · function |
| 07 ROUTE PLANNER | lists & waypoints; treasure maps — X marks (x, y) | NAV LOG · waypoints |
| 08 THE GAUNTLET | everything — Captain Cogbeard's gauntlet | LEAGUE KEY → battles |

Rhythm per world: **1 guided → 3 practices → 1 remix → 1 boss** (a pirate captain). ~15 min each; stars, never timers. **Difficulty floor:** Mission 1 is already a real navigation puzzle (forward, both turns, a speed choice, a par) — going straight is not an accomplishment. **The spiral:** each world turns three dials at once — what the bot can do, what the code must do, what the arena throws back. **Cut from scope:** algorithms, pro/legend tiers, adult leagues.

## 5. The bot & its parts
**One body in v1**, endlessly upgradable (data model keeps a body field so future bodies are a content drop, not a rewrite). Identity lives in `bot.json`: player name, bot name, paint (body + dome), and a personal paintbox of named hex colors the kid extends herself — the Bot Maker's color wheel teaches hex as a bonus.

Five slots: **BLASTER** (zapper → twin → swivel → scope → gyro) · **SIDE PODS** (side zappers, mortar) · **GIZMO POCKET ×2** (grapple crane, magnet arm, net, chaff, headlights) · **TREADS** · **CORE**.

A part is one data card: `{ name, slot, weight, grants, teaches, tradeoff }` — new parts are content, never engine work. Armory rule: if a part doesn't add one new word or one new decision, it doesn't ship.

## 6. Rulebook — physics, points, winning
- **Physics.** Grid world, fixed ticks, fully deterministic. Every part adds weight; speed = engine ÷ weight; lighter turns quicker; the heavier bot wins a shove and both dent.
- **Earning.** Objective +100 · target hit +25 · crate +10 · under-par code = extra star · chests pay C-coins (square gold, "C" face — Asha's spec).
- **Losing.** Wall ram: −15 pts, −8 armor (CLUNK + sad buzzer) · pit fall: −40 pts + 5s tow · armor at 0: wrecked → towed → rebooted in 5s · code errors cost nothing — trying is always free.
- **Winning · players.** Mission: complete the objective (stars for par + bonus goal). Trial: beat the clock or your ghost. Battle (v1.5+): most points at the bell, or last bot rolling. V1 single player · v1.5 hot-seat duel · v2 four bots, teams 2v2.

## 7. Meters & status — the HUD
Four meters, always visible, each with its own sound and animation. Feedback is how she debugs.
- **SCORE** — points ticker; floaters (+25 / −15) fly off the bot as they happen.
- **ARMOR %** — the health meter; dents per hit; 0% = wrecked → tow → reboot. Regens only at repair pads.
- **SPEED** — live, derived from weight; drops when frozen or loaded, spikes on boost().
- **CHARGE** — weapon recharge; every shot spends it, taking a hit knocks systems into a brief recharge too. No spamming fire().

Status chips over the bot and in the HUD: **ON FIRE · FROZEN · TANGLED · SOAKED · GUSTED · RECHARGING · REBOOTING.** Programs can read them — `if (status() == "tangled") fire()` — every status is also a conditionals lesson.

## 8. Elements — same punch, different trick
| Ammo | Trick | The coded exit |
|---|---|---|
| FIREBALL | sizzles 3 ticks after the hit | keep rolling — or a splash of water |
| ICE BALL | freezes treads 1.5s | fire thaws you — elements interact |
| WATER BALL | splash knockback; douses fire; slippery floor (+1 slide) | heavy bots barely budge |
| VINE BALL | tangles the bot (Asha's net, but alive) | shoot the vines to cut free early |
| GUST | shoves bots & shots off course; clears smoke | weight resists; hug a wall |

All ammo lands the same base dent — you choose for the **trick**, not the damage. Nothing is ever lethal.

## 9. Arenas & ghosts
**Static, handcrafted arenas in v1** — deterministic, learnable puzzles beat random ones for teaching. Furniture: steel walls, crates, pits (−40 + tow), repair pads, beacons, chests, spawn pads — plus nature: trees (block shots, not bots), bushes (hide inside; radar can't find you), mud (half speed), ice patches (slide one extra), streams with narrow bridges. **Night sectors** show only a small glow around the bot; the HEADLIGHTS part widens it — sight is a capability you earn. **Mishaps** are authored story moments, never random: a tread pops mid-mission (limp to a repair pad), cargo spills, radar fogs — each fires an event (`when treadPopped { }`) with a coded exit.

**Ghosts, three ways** (Prince-of-Persia energy): time trials race your translucent past run; **echo missions** replay your previous run as a second bot you must cooperate with — past-you holds the door for present-you; beaten pirate crews return as **ghost crews** — same map, sharper code. Ghost data is just a recorded input log — free, thanks to the deterministic sim.

Battle sectors (v1.5+) are authored big maps like THE FOUNDRY.

## 10. Screens & sound
**Flow:** BOOT (her bot rolls in; paintbox shuffle settles on her colors) → **HQ** (doors: CAMPAIGN · GARAGE · BOT MAKER · PLAY; coins & stars up top) → CAMPAIGN MAP (8 worlds, mission dots, next unlock teased) → **MISSION** (core loop: BRIEF → CODE → RUN → RESULT; arena + editor side by side) → GARAGE (spend coins, weight bar, equip slots) · BOT MAKER (name, color lab, eyes, decal → writes bot.json) · TREASURE RUN · TIME TRIAL. V1.5 adds DUEL SETUP and REPLAY ("black box").

**Sound rule: every command has a sound** — tread rumble pitched to speed, servo whirr on turns, pew/pop/sproing per element, CLUNK + sad buzzer on wall rams, coin clinks, chest fanfare, soft boing on code errors (friendly, never harsh), beep…boop…BEEP on reboot, jingle + confetti on mission clear. She should be able to close her eyes and hear her program run.

## 11. Engine & toolbox — all free, $0
**Phaser 3 draws, a pure sim decides.** Game rules live in one deterministic, renderer-free module (fixed ticks, seeded); Phaser is only the view — that separation buys ghosts, replays, fair battles, and a later 2.5D look for free. Editor: **CodeMirror 6** (syntax colors, kid-worded lint). Sandbox: **Web Worker** with per-tick step budget. Sound: **Howler.js** + **jsfxr**-generated retro effects. Fonts: Space Grotesk + IBM Plex Mono. Saves: localStorage with file export/import (cloud later). Everything open-source; no paid services in v1.

## 12. Roadmap, idea box & handoff
- **V1.** Worlds 1–4, Bot Maker + bot.json, garage (coins, weight), treasure runs, time trials + ghost, full HUD & sound.
- **V1.5.** Worlds 5–8, hot-seat duel, replay/black box, echo missions, ghost crews.
- **V2.** 4-bot arenas, teams 2v2, big sectors, level remix sharing.

**Idea box** (parked, not dead): OLED/LED screen part adding `display("GG!")` · more bot bodies · Python & TypeScript modes · hover/spider bodies · 2.5D look · online league · co-op ops · algorithm dojo for grown-ups · "Bot & Seek" hide-and-seek mode (Asha's name is too good to waste).

**Handoff.** This spec + the exploration canvas + the companion design system (colors, type, chips, meters, buttons, sound table) go to Claude Code. Claude Code owns the technical spec and the repo; the design project stays the source of truth for product and design.
