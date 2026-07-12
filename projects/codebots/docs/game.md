# The Game

*What CodeBots is. For how it looks and sounds → [design.md](design.md). For how it's built → [engine.md](engine.md). For what it teaches → [curriculum.md](curriculum.md).*

---

## 1. The premise

> **Write the code. Press RUN. Watch it go.**

A kid writes real JavaScript, hits RUN, and her bot comes alive and does **exactly** what she told it — brilliantly, or hilariously wrong. She watches it happen, **live**, in a bright world she can see: treads kicking dust, juddering over rock, sliding right past the square she meant it to stop on.

**That moment is the entire game.** Watching your own machine obey you is the most reliably delightful thing in computing, and almost every "learn to code" product buries it under a curriculum.

> **The rule everything else serves:** the code is not the price of the fun. **The code *is* the fun.**

### What follows from that

- **She watches it run. Live. Always.** Never a report, never a summary, never footage after the fact. **Any design that puts a layer of remove between her and her running program is wrong**, however clever it sounds.
- **The world is bright and legible.** She can see the whole arena, plan a route, then watch her plan collide with reality. No fog, no darkness, no gimmick that hides the fun.
- **The gap between instruction and consequence is seconds, and it is *visible*.** She doesn't read an error — **she watches the mistake happen.** That is the fastest debugging loop a nine-year-old will ever get, and it is the pedagogical engine of the whole product.
- **Being wrong is funny.** The bot drives cheerfully into a wall because she said so. That's a joke the game tells *with* her, never at her.

---

## 2. The six laws

1. **A bot is a body plus parts.** Parts cost weight and add commands.
2. **Lessons unlock, coins build** — you can never buy what you haven't learned.
3. **Every trap has an exit you can code.**
4. **Nothing dies** — tagged bots reboot.
5. **A number never appears before the kid has felt what it does.**
6. **The engine knows no story** — so a new world is a content drop, not a sequel. → [engine.md](engine.md)

---

## 3. The core loop

| Step | | Zone |
|---|---|---|
| **1 · Read** | Three sentences and a map. What's out there, and what she's after. | Workbench |
| **2 · Write** | Real JavaScript. Autocomplete offers only the commands her installed parts actually grant. | Workbench |
| **3 · Watch** | **RUN.** The bot rolls out and does precisely what she wrote. Live. **This is the game.** | World |
| **4 · Fix line 6** | She *saw* where it went wrong. She doesn't need an error message — she needs one more turn. | Workbench |

**~15 minutes per mission. Stars, never timers.**

---

## 4. The language

**Real JavaScript, shown to the kid as just "code."** No invented language: nothing she learns should ever need unlearning, and we never own a compiler. `forward(3)` is already a real function call.

- **Training wheels:** `repeat 3 { }` in Worlds 1–2 (the World 2 boss ceremonially upgrades it to `for`), forgiving semicolons, and `when bumped { }` event blocks from World 4.
- **Kid-worded errors** that point at the line. **Errors never cost points. Trying is always free.**
- **Reactive code is event-based.** Driving is a script; reactions are when-blocks: `when bumped { back(2) }`. Events: bumped · hit · spotted · frozen · tangled · chestOpened · treadPopped · tick. **World 6 reveals that a when-block is just a function handed to the game** — and the battle `tick` is one more event. One model, no magic.
- **Code stays small, always.** Her own functions collect in a **MOVES tab** — a personal library that follows her everywhere. Later worlds add **modes**: each is a card of when-blocks, switched with `setMode("chase")`, and the HUD highlights the live mode during a run — **a state machine she can watch think.** Any card past ~30 lines gets a nudge: *"make a move out of it."*
- Python / TypeScript: someday shelf.

---

## 5. The bot

**One body** (the data model keeps a `body` field, so future bodies are a content drop, not a rewrite).

It is a **small, sturdy rover** — treads, a dome, an antenna, a claw, and **expressive eyes.** Not a tank: no turret, no barrel silhouette.

- **The face is the primary emotional channel.** It reacts: pleased, confused, alarmed, smug. **This is where a kid's attachment to her bot actually forms.**
- **Armor is readable from the silhouette.** Hits knock visible plating panels off. She should never need the ARMOR meter to know her bot is in trouble — **she should see it.**
- Identity lives in `bot.json`: player name, bot name, paint (body + dome), and a personal paintbox of named hex colors she extends herself — **the color wheel teaches hex as a bonus.**
- Her bot's name in the campaign is **Sparkplug**.

### Slots

**EMITTER** (zapper → twin → swivel → scope → gyro) · **SIDE PODS** (side emitters, mortar) · **GIZMO POCKET ×2** (grapple crane, magnet arm, net, smoke, headlights) · **TREADS** · **CORE**

A part is one data card: `{ name, slot, weight, grants, teaches, tradeoff }`. **New parts are content, never engine work.**

> **Armory rule:** if a part doesn't add **one new word** or **one new decision**, it doesn't ship.

---

## 6. Physics, points, winning

- **Physics.** Grid world, fixed ticks, fully deterministic. Every part adds weight; **speed = engine ÷ weight**; lighter turns quicker; **the heavier bot wins a shove and both dent.**
- **Terrain is felt before it is read** (Law 5). **Rock:** the bot judders, treads bounce, the camera shakes a hair. **Mud:** it labours, splatters, and the SPEED meter visibly sags. **Ice:** it slides *past* the square it meant to stop on and she **sees** the overshoot. **Every terrain must be legible from motion alone**, before a single number appears.
- **Earning.** Objective +100 · target hit +25 · crate +10 · under-par code = an extra star · cores pay **C-coins** (amber rounded squares with a "C" face — Asha's spec).
- **Losing.** Wall ram: −15 pts, −8 armor (CLUNK + the bot's confused boop) · pit fall: −40 pts + 5s tow · armor at 0: **disabled → towed → rebooted** in 5s · **code errors cost nothing.**
- **Winning.** Mission: complete the objective (stars for par + a bonus goal). Trial: beat the clock, or your own ghost. Battle (v1.5+): most points at the bell, or last bot rolling.

---

## 7. The HUD — four meters

Always visible, each with its own sound and animation. **Feedback is how she debugs.**

| Meter | Does |
|---|---|
| **SCORE** | Points ticker; floaters (+25 / −15) fly off the bot the moment they happen. |
| **ARMOR %** | Dents per hit; 0% = towed → reboot. Regens only at repair pads. *(Also visible on the bot itself — §5.)* |
| **SPEED** | Live, derived from weight. Sags under cargo, drops when frozen, spikes on `boost()`. |
| **CHARGE** | **The energy pool.** Every shot spends it; every dash spends it; a hit forces a brief recharge. **One resource, every action a trade.** No spamming `fire()`. |

**Status chips** over the bot and in the HUD: **ON FIRE · FROZEN · TANGLED · SOAKED · GUSTED · BLINDED · RECHARGING · REBOOTING.**

Programs can read them — `if (status() == "tangled") fire()` — so **every status is also a conditionals lesson** (Law 3).

---

## 8. The toybox

**Shots go forward. Drops go behind.** Two genuinely different kinds of thinking — *aim now* versus *plan ahead* — and a kid feels the difference in the shape of her code.

### Shots — `fire(ammo)`

| Ammo | Trick | The coded exit |
|---|---|---|
| FIREBALL | sizzles 3 ticks after the hit | keep rolling — or a splash of water |
| ICE BALL | freezes treads 1.5s | fire thaws you — elements interact |
| WATER BALL | knockback; douses fire; slippery floor (+1 slide) | heavy bots barely budge |
| VINE BALL | tangles the bot | shoot the vines to cut free early |
| GUST | shoves bots *and shots* off course; clears smoke | weight resists; hug a wall |
| **PAINT** *(v1.5)* | **splatters the lens — `radar()` returns garbage for N ticks. No damage at all.** | wait it out, or drive by memory |

### Drops

| Drop | Trick |
|---|---|
| **SMOKE** — `dropSmoke()` | a cloud on your square; anything chasing through it goes blind |
| **OIL** — `dropOil()` *(v1.5)* | the banana peel: whoever hits it spins out and loses a turn |

**All ammo lands the same base dent — you choose for the trick, not the damage. Nothing is ever lethal.**

> **PAINT is the most valuable item in the design.** It is the only thing in the armory that attacks the **program** rather than the robot, and it teaches **defensive programming: your inputs can lie to you.** A genuinely advanced idea, arriving as the funniest toy in the box.

### `dash(n)` *(v1.5)*

Burst 1–3 squares, **costing CHARGE proportional to `n`.** `forward(n)` already takes a number, so this is not her first argument — it is her **first argument with a price.** Over-dash and she sails into the pit herself, which is funny and entirely her fault. Dash *into* a bot and you shove it (§6).

> **OPEN:** overlaps `boost()` (Turbo Treads, W2). Keep both **only** if boost is *sustained speed* and dash is a *charged burst that shoves*. Otherwise merge. **Decide before building.**

---

## 9. The world

**Bright, open, legible.** She sees the whole arena, plans a route, then watches the plan collide with reality. **Static, handcrafted arenas** — deterministic, learnable puzzles beat random ones for teaching.

**Furniture:** steel walls · crates · pits (−40 + tow) · repair pads · beacons · cores · spawn pads.

**Terrain:** rock (judder) · mud (half speed) · ice (slide one extra) · streams with narrow bridges · trees and roots (block shots, not bots) · bushes (hide inside; radar can't find you).

**Mishaps** are authored story moments, never random: a tread pops mid-mission, cargo spills, radar fogs — **each fires an event** (`when treadPopped { }`) **with a coded exit** (Law 3).

**Ghosts, three ways** (Prince-of-Persia energy): time trials race your translucent past run · **echo missions** replay your previous run as a second bot you must cooperate with — *past-you holds the door for present-you* · beaten rivals return as **ghost crews**, same map, sharper code. Ghost data is just a recorded input log — **free, thanks to the deterministic sim.**

---

## 10. Screens

**BOOT** → **HQ** (doors unlock progressively — never all at once) → **CAMPAIGN MAP** → **MISSION** (the core loop) · **GARAGE** (coins, weight bar, equip slots) · **BOT MAKER** (name, color lab, eyes, decal → writes `bot.json`) · **SALVAGE RUN** · **TIME TRIAL**

v1.5 adds **DUEL**. v2 adds **LEAGUE**. → [design.md](design.md) for the two-zone visual system.

---

## 11. Safety

**The only thing a kid ever publishes is a program.** No bio, no description, no message, no chat. **There is nothing to moderate because there is nothing to say.**

**Nothing dies** — a law (§2), enforced by a test ([engine.md](engine.md)).

**It's real code** — she exports her bot as an actual `.js` file with type declarations. What she learned transfers the day she outgrows us.

---

## 12. Roadmap

- **V1** — Worlds 1–4 · Bot Maker · garage · salvage runs · time trials + ghost · full HUD, sound and feel.
- **V1.5** — Worlds 5–8 · hot-seat duel · replay · echo missions · ghost crews · **the toybox** (paint, oil, `dash(n)`, the panel loop).
- **V2** — 4-bot arenas · teams 2v2 · the league · level remix sharing.
- **V3+** — new theme packs as content drops ([engine.md](engine.md)) · 2.5D.

**Idea box** (parked, not dead): an OLED part granting `display("GG!")` · more bot bodies · Python & TypeScript modes · hover/spider bodies · co-op ops · an algorithm dojo for grown-ups · **"Bot & Seek"** hide-and-seek mode (Asha's name is too good to waste).

---

## 13. Open decisions

| # | Decision |
|---|---|
| 1 | **The world's fiction.** *Bright and legible* is settled; **what it actually is** — a workshop, an island, a rally circuit, a garden gone wild — is not. **This is the next creative call, and a good one to make with Asha.** |
| 2 | **The rival.** Who opposes her? Recommend a rival outfit — another engineer with their own bot — comic rather than hostile. |
| 3 | **`boost()` vs `dash(n)`** (§8). Merge, or make them genuinely different. |
| 4 | **Display typeface.** Space Grotesk is a safe default carrying no character. Mono stays for code regardless. |
