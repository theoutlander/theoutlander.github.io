# CODEBOTS — Product Spec v2.0
July 12, 2026 · Status: ready to build, from scratch
Companion: `CONTENT_SPEC.md` (missions, arenas, author solutions). Chief creative consultant: Asha, age 10.
*Supersedes v1.0 (July 5) — the pirate fiction and the blueprint-room design brief are retired. v1.0 lives in git history; the v1 implementation at `app/` is a read-only reference, not a maintained product.*

Kids learn to really code by **programming** a little robot. The bot grows more capable, the programs grow more powerful, the dark grows deeper — all three rise together.

---

## 1. The premise

> **The bot goes where you cannot follow.**

There is no signal down there. You cannot steer it, you cannot react, you cannot grab the controls when it goes wrong. All you can do is **write its program, send it in, and wait for the footage to come back.**

**Why this premise and no other.** Every coding game has a plot hole: *why can't the kid just drive?* If a joystick would work, the code is homework — a mechanic the game imposes rather than one the world demands. **No signal closes the hole.** Programming stops being a mechanic and becomes the only thing that is *possible*. A kid feels that even if she can never articulate it.

**And it makes everything else true for free:**

| The thing | Becomes |
|---|---|
| The replay | **The payoff.** You weren't there. The footage coming back *is* the reward. |
| The async league | **The premise.** Your bot goes in while you're at school. |
| The deterministic sim | **The fiction.** The program is all there is. |
| The technical, monospaced UI | **Mission control.** You're the engineer; the bot is the only thing that goes. |
| The elements (fire, ice, water, vine, gust) | **The environment.** It's what's *down there*. |
| Rivals | **Other kids' rovers.** Not enemies — competitors. There is no violence to remove, because there never was any. |

**For kids 9–13.** V1 is single player: a campaign of coding missions **descending into the dark**. One robot per kid: named, painted, and above all programmed — every upgrade is a new command to master, not a stat to buy. Competitive, never violent — bots get tagged, dented, towed and rebooted; **nothing dies.** Multiplayer (hot-seat duels, then arenas and the league) comes after v1.

**The premise is a generator, not a place.** Caves today; Mars, the ocean floor, and deep space later. Same truth every time — *no signal → send a program → wait for the footage.* The fiction changes; the reason she is typing never does. That is what makes future worlds a **content drop** instead of a sequel (see §3).

---

## 2. The six laws

1. **A bot is a body plus parts. Parts cost weight and add commands.**
2. **Lessons unlock, coins build** — you can never buy what you haven't learned.
3. **Every trap has an exit you can code.**
4. **Nothing dies** — tagged bots reboot.
5. **A number never appears before the kid has felt what it does.**
6. **The engine knows no story.** *(New — see §3.)*

---

## 3. The three layers

The engine must never know what the game is about. This is not architectural fussiness; it is the fix for a failure mode already observed once — when fiction lives inside the simulator, vocabulary drift is not a mistake, it is inevitable.

### Layer 1 — CORE (invariant)

The sim: grid, ticks, weight, armor, shove physics, determinism. **And the JavaScript API** — `forward()`, `left()`, `fire()`, `if`, `for`, `function`.

**The API is never themed.** A rover on Mars does not get `drive()`. A ship does not get `sail()`. This is the educational mission, not a preference: **the transferable knowledge is the product.** `forward(3)` must be `forward(3)` in every skin.

### Layer 2 — WORKBENCH (invariant)

Editor, garage, HUD chrome, briefing panel. **The tool does not change when the world changes.** She is at mission control whether the bot is in a cave or on Mars.

### Layer 3 — THEME PACK (swappable)

Art, sound, copy, names, world fiction. **Everything a kid sees and hears; nothing she reasons about.**

### The i18n model

Core emits **stable semantic keys**; a pack resolves them to strings, sprites and sounds. Identical in shape to localization — which it makes nearly free later.

```
core event             →  theme pack resolves
──────────────────────────────────────────────────────
unit.disabled          →  "TOWED"   + tow-hook  + slide-whistle
unit.blocked           →  "CLUNK!"  + dust puff + thud
projectile.fired(ice)  →  ice bolt  + freeze crackle
objective.reached      →  "SIGNAL!" + the motif
```

Furniture is a **core kind** with themed art — the clean one-to-one mapping is the proof the seam is real:

| Core kind | Cave pack (v1) | Mars pack (future) |
|---|---|---|
| obstacle | crate | supply drum |
| wall | steel | rock face |
| hazard-pit | pit | crevasse |
| slow-terrain | mud | dust drift |
| slide-terrain | ice | scree |
| cover | bush | boulder |
| goal | beacon | relay |

**Same arenas. Same verified traces. Same pars. A completely different game.**

### Discipline, not machinery

> **Do NOT build a theme-switching system.** Designing seams before a second theme exists means designing the *wrong* seams. Build **one pack**, and enforce three rules:
> 1. **Core contains no themed noun.** `disabled`, not `wrecked`. `emitter`, not `blaster`.
> 2. **All copy lives behind keys.**
> 3. **All assets resolve through a manifest**, never a hardcoded path.
>
> Rule 1 is enforced by a test (§14). Three rules, not a framework.

---

## 4. The language

**Real JavaScript, shown to the kid as just "code."** No invented language: nothing she learns should need unlearning, and we never own a compiler. `forward(3)` is already a real function call.

- **Training wheels:** `repeat 3 { }` in Worlds 1–2 (the World 2 boss ceremonially upgrades it to `for`), forgiving semicolons, and `when bumped { }` event blocks from World 4.
- **Kid-worded errors** that point at the line. **Errors never cost points.**
- **Sandboxed worker execution** with a per-tick step budget. **Deterministic sim** — same code, same seed, same result, always.
- **Reactive code is event-based.** Driving is a script; reactions are when-blocks: `when bumped { back(2) }`. V1 events: bumped · hit · spotted · frozen · tangled · chest opened · tick · mishaps (e.g. `treadPopped`). World 6 reveals that a when-block is just a function handed to the game — and the battle `tick` is one more event. One model, no magic.
- **Code stays small, always.** Each mission is a short fresh script; reactive code is one card per when-block; her own functions collect in a **MOVES tab** — a personal library that follows her everywhere. Later worlds add **modes**: each mode is its own card of when-blocks, switched with `setMode("chase")`; the HUD highlights the live mode during a run — a state machine she can watch think. Any card past ~30 lines gets a nudge: *"make a move out of it."*
- Python / TypeScript: someday shelf.

---

## 5. The campaign — 8 worlds, no more

**Depth is the progression.** Eight worlds; eight levels deeper. This is the one setting where "no signal" is not a contrivance — **it is physics.** Rock blocks radio. The deeper she sends the bot, the less she can know, and by World 8 she is flying completely blind on a program written hours ago. **The fiction gets more true as the game gets harder.**

| World | Teaches | Unlocks |
|---|---|---|
| 01 FIRST ROLL | commands & sequences; turns, speed | AIR HORN · `honk()` |
| 02 ROUND & ROUND | `repeat` → `for`, nested patterns | TURBO TREADS · `boost()` |
| 03 CORE COUNT | variables, math — first cores & coins | CARGO CLAW · `grab()` |
| 04 EYES ON | if/else, radar & touch sensors, events | RADAR DISH · `radar()` |
| 05 SMART LOOPS | loops + ifs; patrols that react | EMITTER · `fire()` |
| 06 MY OWN MOVES | functions & parameters | MACRO CHIP · `function` |
| 07 ROUTE PLANNER | lists & waypoints; maps — X marks (x, y) | NAV LOG · waypoints |
| 08 THE DEEP | everything — the final descent | LEAGUE KEY → battles |

**Rhythm per world:** 1 guided → 3 practices → 1 remix → 1 boss. ~15 min each; **stars, never timers.**

**Difficulty floor:** Mission 1 is already a real navigation puzzle (forward, both turns, a speed choice, a par) — going straight is not an accomplishment.

**The spiral:** each world turns three dials at once — what the bot can do, what the code must do, what the dark throws back.

**Cut from scope:** algorithms, pro/legend tiers, adult leagues.

---

## 6. The bot & its parts

**One body in v1**, endlessly upgradable (the data model keeps a `body` field so future bodies are a content drop, not a rewrite).

**The bot is a rover, not a tank.** Treads, a dome, an antenna, a claw — and **expressive eyes.** No turret; no barrel silhouette. **The face is the primary emotional channel** — it reacts: pleased, confused, alarmed, smug. This is where a kid's attachment forms.

**Armor is readable from the silhouette.** Hits knock visible plating panels off. She should never need to read the ARMOR meter to know her bot is in trouble — she should *see* it.

Identity lives in `bot.json`: player name, bot name, paint (body + dome), and a personal paintbox of named hex colors the kid extends herself — the Bot Maker's color wheel teaches hex as a bonus. **"Sparkplug"** — the bot's nickname throughout the campaign — stays.

**Five slots:** **EMITTER** (zapper → twin → swivel → scope → gyro) · **SIDE PODS** (side emitters, mortar) · **GIZMO POCKET ×2** (grapple crane, magnet arm, net, smoke, headlights) · **TREADS** · **CORE**.

A part is one data card: `{ name, slot, weight, grants, teaches, tradeoff }` — **new parts are content, never engine work.**

> **Armory rule:** if a part doesn't add **one new word** or **one new decision**, it doesn't ship.

---

## 7. Rulebook — physics, points, winning

- **Physics.** Grid world, fixed ticks, fully deterministic. Every part adds weight; speed = engine ÷ weight; lighter turns quicker; **the heavier bot wins a shove and both dent.**
- **Earning.** Objective +100 · target hit +25 · crate +10 · under-par code = extra star · cores pay **C-coins** (amber rounded squares with a "C" face — Asha's spec. The C now stands for *core*).
- **Losing.** Wall ram: −15 pts, −8 armor (CLUNK + the bot's confused boop) · pit fall: −40 pts + 5s tow · armor at 0: **disabled → towed → rebooted** in 5s · **code errors cost nothing — trying is always free.**
- **Winning.** Mission: complete the objective (stars for par + bonus goal). Trial: beat the clock or your ghost. Battle (v1.5+): most points at the bell, or last bot rolling.

---

## 8. Meters & status — the HUD

Four meters, always visible, each with its own sound and animation. **Feedback is how she debugs.**

- **SCORE** — points ticker; floaters (+25 / −15) fly off the bot as they happen.
- **ARMOR %** — dents per hit; 0% = towed → reboot. Regens only at repair pads. *(Also visible on the bot itself — §6.)*
- **SPEED** — live, derived from weight; drops when frozen or loaded, spikes on `boost()`.
- **CHARGE** — the energy pool. Every shot spends it; **every dash spends it**; taking a hit knocks systems into a brief recharge. **One resource, every action a trade.** No spamming `fire()`.

**Status chips** over the bot and in the HUD: **ON FIRE · FROZEN · TANGLED · SOAKED · GUSTED · BLINDED · RECHARGING · REBOOTING.** Programs can read them — `if (status() == "tangled") fire()` — **every status is also a conditionals lesson.**

---

## 9. Elements — same punch, different trick

**Shots go forward. Drops go behind.** Two genuinely different kinds of thinking, and a kid feels the difference in the *shape of her code.*

### Shots — `fire(ammo)` — *aiming now*

| Ammo | Trick | The coded exit |
|---|---|---|
| FIREBALL | sizzles 3 ticks after the hit | keep rolling — or a splash of water |
| ICE BALL | freezes treads 1.5s | fire thaws you — elements interact |
| WATER BALL | splash knockback; douses fire; slippery floor (+1 slide) | heavy bots barely budge |
| VINE BALL | tangles the bot | shoot the vines to cut free early |
| GUST | shoves bots & shots off course; clears smoke | weight resists; hug a wall |
| **PAINT** *(v1.5)* | **splatters the lens — `radar()` returns garbage for N ticks. No damage at all.** | **wait it out, or drive by memory** |

### Drops — *planning ahead*

| Drop | Trick | The coded exit |
|---|---|---|
| **SMOKE** — `dropSmoke()` | a cloud on your square; anyone chasing through it goes blind | go around, or `gust()` clears it |
| **OIL** — `dropOil()` *(v1.5)* | whoever hits it slides and loses a turn | read the floor before you commit |

**All ammo lands the same base dent — you choose for the trick, not the damage. Nothing is ever lethal.**

> **PAINT is the most valuable item in the design.** It is the only thing in the armory that attacks the *program* rather than the robot, and it teaches **defensive programming: your inputs can lie to you.** A genuinely advanced idea, delivered as the funniest item in the game.

---

## 10. Arenas & ghosts

**Static, handcrafted arenas in v1** — deterministic, learnable puzzles beat random ones for teaching.

**Furniture:** steel walls, crates, pits (−40 + tow), repair pads, beacons, cores, spawn pads — plus the living dark: trees and roots (block shots, not bots), bushes (hide inside; radar can't find you), mud (half speed), ice patches (slide one extra), streams with narrow bridges.

**Night sectors** are not a gimmick world — they are simply *deeper.* Sight is one adjacent square; the **HEADLIGHTS** part widens it to a 3-square cone. **Sight is a capability you earn.**

**Mishaps** are authored story moments, never random: a tread pops mid-mission (limp to a repair pad), cargo spills, radar fogs — each fires an event (`when treadPopped { }`) with a coded exit.

**Ghosts, three ways** (Prince-of-Persia energy): time trials race your translucent past run; **echo missions** replay your previous run as a second bot you must cooperate with — past-you holds the door for present-you; beaten rival rovers return as **ghost crews** — same map, sharper code. Ghost data is just a recorded input log — **free, thanks to the deterministic sim.**

---

## 11. Screens & the two zones

**Flow:** BOOT → **HQ** (doors: CAMPAIGN · GARAGE · BOT MAKER · PLAY; coins & stars up top) → CAMPAIGN MAP (8 worlds, mission dots, next unlock teased) → **MISSION** (core loop: BRIEF → CODE → RUN → FOOTAGE) → GARAGE (spend coins, weight bar, equip slots) · BOT MAKER (name, color lab, eyes, decal → writes `bot.json`) · SALVAGE RUN · TIME TRIAL. V1.5 adds DUEL SETUP.

### The two zones

| Zone | Where | Look |
|---|---|---|
| **THE WORKBENCH** | Editor · Garage · HUD chrome · Briefing | Deep navy · IBM Plex Mono · amber signal · crisp 2px outlines · **flat, no shadows.** This is where she **thinks** — and a dark monospaced editor is what real code looks like. |
| **THE WORLD** | Arena · the bot · hazards · results | Warm colour · chunky 3px outlines · **hard offset shadows** · dust · squash-and-stretch · a bot with a face · sound everywhere. This is where she **watches.** This is the footage. |

**The RUN button is the portal between them.** She writes in the cool, quiet control room; she presses RUN; the warm world blooms into motion. **The contrast amplifies both** — the world feels alive precisely because it erupts out of a calm technical surface.

**Through-line:** amber. The signal colour in the workbench; the glow of a recovered core in the world. One token, two jobs.

### The design law

> Mission control, and the world on the other side of the signal. **Joyful, never condescending.** Competitive, never violent. Nothing dies.

*"Never condescending," not "never babyish."* The latter produces austerity. Nintendo's standard is warm, loud and funny while completely respecting the player — adults play Mario Kart at a high level and nobody feels talked down to. **That is the bar.**

### Rules

| Rule | Verdict |
|---|---|
| Shadows · gradients · illustrated art | **Allowed in the world.** (The old "geometric primitives only" rule is what forced the tank silhouette — a character made of `div`s can only be rectangles. **The bot needs a face.**) |
| Workbench stays flat and shadowless | **Kept.** Correct for a tool. |
| **Emoji: never** | **Kept.** The lazy shortcut to "fun," and the one thing that would genuinely read babyish. Excitement comes from the bot's face, from motion, and above all from sound. |
| Everything outlines | **Kept.** Thin on the workbench, chunky in the world. |
| Mono for code and data | **Kept.** Non-negotiable. |
| Kid words in game, real words in code | **Kept.** `function`, `variable`, `loop` stay real. That is what transfers. |

### Tokens (proposed — pending design pass)

Derived from the game's own elements, so item colours and UI categorical colours are one system.

| Token | Value | Role |
|---|---|---|
| **Signal** | amber `#ffb020` | Action · score · unlocks · **the glow of a core** |
| Ice | cyan `#3fd2e8` | ICE · info · beacons |
| Vine | lime `#b6f04a` | VINE · success |
| Fire / Paint | magenta `#ff4d9d` | FIRE + PAINT · hazard |
| Gust / Smoke | violet `#a9a7e0` | GUST + SMOKE |

**Spend the boldness in one place.** Amber is the signal; everything else stays quiet.

Design project: `41e196e7-28e3-43ef-b7d2-74af999644cd` (claude.ai/design, "CodeBots").

---

## 12. Sound & feel

> **Every command has a sound. She should be able to close her eyes and hear her program run.**

### The reward is the bot, not a coin

A coin sound is **transactional** — *you scored.* But what actually happens when her code runs correctly is that **a machine understood her**, which is the entire fantasy of programming.

- **Code works → the bot chirps, happily.** It is *pleased with her.* The reward is relational, not transactional. (Mario doesn't get a point sound when he does something great — he says *"wa-hoo!"* The character reacts.)
- **Code errors → a small, confused boop.** Never a buzzer. It is funny, it never shames, and it makes her want to fix it **for the bot.**
- **The clink stays where it belongs** — the sound of collecting a core or a fallen panel. A physical pickup, not the sound of comprehension.

### The bot has a voice

A **chirp language** — pitched square/triangle blips, not words. R2-D2, Wall-E, BB-8. Vocabulary: *acknowledge · confused · delighted · alarmed · smug · hurt · rebooting.*

Under this premise the voice does double duty: **the chirps are the telemetry.** They are what comes back with the footage.

### One motif, three sizes

Design **one three-or-four-note phrase** that becomes *the sound of your code working* — the thing a kid hums, the thing that goes in the trailer.

| Moment | Size |
|---|---|
| A line does what she wanted | Small chirp |
| Mission clear | Full phrase |
| Boss / league win | Full fanfare |

### Juice

Squash-and-stretch on every bump and stop · dust puffs on movement · **panels tumble off the bot on a hit** · screen shake, small and scaled · motion snappy and physical — nothing floats.

> **Pitch-randomize repeated sounds ±10%.** A bump that plays byte-identical thirty times reads as cheap. One line of code; most of the difference between "has audio" and "feels good."

### Audio sourcing — $0

| Need | Source | License |
|---|---|---|
| **The bot's voice + every arcade hit** (dash, bump, UI, the motif) | **ChipTone / jsfxr / Bfxr** | **Owned outright. No training data → the cleanest provenance possible for a kids' product.** |
| Organic texture (clank, gravel, panel clatter) | **Kenney.nl** (CC0) + **Sonniss GDC bundle** | Perpetual, no attribution |
| Music | Kenney / OpenGameArt chiptune; commission a perpetual buyout later | Perpetual |
| *(Post-v1 only)* bespoke splats & clanks | **ElevenLabs Starter — PAID tier**, generate then cancel (~$6 once) | Paid-tier generations keep commercial rights permanently |

**Hard avoid, for a shipped game:**
- **ElevenLabs free tier** — non-commercial, attribution required. The 10,000 monthly credits are the *free* allowance; **nothing generated on them can ship.**
- **Epidemic Sound · Artlist · Storyblocks Individual** — Content-ID logic written for video. A continuously-distributed game falls out of compliance the moment you cancel.
- **Meta AudioCraft / AudioGen / MusicGen** — MIT code but **CC-BY-NC weights.** Looks free; forbids commercial use.
- **Suno / Udio** — unresolved copyright litigation. Not a story to attach to a product for nine-year-olds.

---

## 13. Engine & toolbox — all free, $0

**Phaser 3 draws, a pure sim decides.** Game rules live in one deterministic, renderer-free module (fixed ticks, seeded); Phaser is only the view — that separation buys ghosts, replays, fair battles, and a later 2.5D look for free.

- **Editor:** CodeMirror 6 (syntax colors, kid-worded lint).
- **Sandbox:** Web Worker with a per-tick step budget.
- **Sound:** Phaser's native audio manager + **audio sprites** (`load.audioSprite`). Howler is *not* needed — never run two managers. Phaser gives you **nothing** for mixing, ducking or pitch variation; that is ours, and it is where the feel lives. Unlock the audio context on first gesture or mobile plays silence.
- **Effects:** jsfxr-generated retro sounds.
- **Saves:** localStorage with file export/import (cloud later).
- Everything open-source; **no paid services in v1.**

---

## 14. Correct from the first line

**We start from scratch.** The v1 implementation at `app/` (10,684 lines, **zero tests**) is a **read-only reference** — not refactored, not maintained, not dual-tracked. `sim/` and `sandbox/` (~1,580 lines) are **ported by copy**, renaming themed nouns as they cross the boundary. `ui/` and `content/` were being rewritten regardless; `rivals/` is a v1.5 feature that was built early and is **shelved** until the campaign ships.

"Bug free" is not a wish. It is five mechanisms:

**1. TDD from line one.** No implementation code before a failing test.

**2. `CONTENT_SPEC`'s 24 author solutions are the golden suite.** Every mission already specifies the arena, the start position and facing, the furniture coordinates, the author's exact code, and the expected outcome. **Each one is an integration test that writes itself:**

```
run(authorSolution, arena) → assert objective reached
                           → assert line count ≤ par
                           → assert no furniture cell entered
```

This suite would have caught the v1 drift on day one — **a kit that appears nowhere in the spec cannot pass a spec-derived test.** It also closes `CONTENT_SPEC` §10 flags #2 and #9 (the windmill and patrol tick-phase checks that *"need the real engine"*).

**3. A test that forbids themed nouns in core.** Law 6 is **mechanically enforced**: a test greps `sim/` and `sandbox/` for a banned list — *wreck · kill · die · destroy · tank · blaster · weapon · gun · sniper · treasure · damage* — and fails the build. **The architecture defends itself**, and vocabulary drift becomes impossible rather than merely corrected.

**4. A determinism test.** Same program + same seed, run twice → byte-identical event logs. Plus a guard that `Math.random()`, `Date.now()` and `new Date()` appear nowhere in core. Determinism is what makes replays, ghosts, fair battles and reproducible bugs all work — and it is silently broken by a single careless call.

**5. Every bug becomes a test.** Determinism means every bug is perfectly reproducible from `(program, seed)`. **A bug report *is* a failing test case.** Nothing regresses twice.

### Build order

1. Port `sim` + `sandbox`, renaming themed nouns.
2. Stand up the golden suite — **before any UI exists.**
3. The workbench (editor, HUD chrome).
4. The world (Phaser view, the bot, juice, sound).
5. Re-skin `CONTENT_SPEC` copy — **the geometry does not move** (§16).
6. Author Worlds 5–8.
7. **Only then:** battles, the toybox, dash, the panel loop.

---

## 15. Roadmap

- **V1.** Worlds 1–4 · Bot Maker + `bot.json` · garage (coins, weight) · salvage runs · time trials + ghost · full HUD, sound & feel.
- **V1.5.** Worlds 5–8 · hot-seat duel · the footage (replay) · echo missions · ghost crews · **the toybox** (paint, oil, `dash(n)`, the panel loop).
- **V2.** 4-bot arenas · teams 2v2 · the league · big sectors · level remix sharing.
- **V3+.** New theme packs — **Mars · the ocean floor · deep space** — as content drops (§3). 2.5D.

### The toybox (v1.5, designed)

| Addition | Grants | Teaches |
|---|---|---|
| **PAINT AMMO PACK** (emitter mod, 1wt) | `fire("paint")` | **Defensive programming — your inputs can lie.** |
| **SMOKE POD** (gizmo, 2wt) | `dropSmoke()` | Planning ahead — a trap for a future tick. |
| **OIL POD** (gizmo, 2wt) | `dropOil()` | Prediction — not *where are they*, but *where will they be*. |
| **`dash(n)`** | burst 1–3 squares, costs CHARGE ∝ n | **The first argument with a price.** Overshoot into a pit and it's your own fault. Dash into a bot and you shove them (§7). |
| **The panel loop** | plating knocked off lands on the floor; drive over it to reclaim | **Risk/reward, written as code:** go grab it in the open, or hold position? |

> **OPEN — `boost()` vs `dash(n)`.** Turbo Treads already grants `boost()` in W2. Keep both **only** if boost is *sustained speed* and dash is a *charged burst that shoves*. Otherwise merge. **Decide before building.**

**Idea box** (parked, not dead): OLED screen part adding `display("GG!")` · more bot bodies · Python & TypeScript modes · hover/spider bodies · co-op ops · algorithm dojo for grown-ups · "Bot & Seek" hide-and-seek mode (Asha's name is too good to waste).

---

## 16. What `CONTENT_SPEC` keeps and what it loses

Retiring the pirate story costs **less than it looks.**

**KEPT — every expensive thing:**
- All 24 **arena geometries** — sizes, start positions and facings, furniture coordinates.
- All **hand-verified grid traces** and author solutions.
- All **pars** (measured in editor lines).
- The **hint-ladder structure** (nudge → concrete sub-goal → worked example of the first leg only).
- The **teaching order** — sequencing → loops → variables → conditionals → functions → lists.
- The **authoring rules** and the **flags**.
- **"Sparkplug."**

**REWRITTEN — the prose only:** 24 **briefings** (~3 sentences each) · **villain names** · **world names** and flavour nouns.

Roughly a day of writing, not a rebuild — and under §3 **that is precisely what a theme pack is.** Doing it once, properly, is what proves the architecture works.

---

## 17. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| 1 | **The rival.** Who opposes her? | A **rival outfit** — another engineer with their own rover, racing her to the bottom. Maps directly onto the league (other kids' bots) and keeps the antagonist comic rather than hostile. |
| 2 | **Display typeface.** Space Grotesk is a safe default carrying no character. (Mono stays for code regardless.) | Needs a design pass. |
| 3 | **`boost()` vs `dash(n)`** (§15) | Merge, or make them genuinely different. |
| 4 | **World names.** | Re-fiction alongside §16. **The teaching order does not change.** |
| 5 | **League migration.** | Moot for now — `rivals/` is shelved until the campaign ships. |
