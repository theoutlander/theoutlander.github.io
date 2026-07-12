# CODEBOTS — Retheme & Reconciliation Spec v2.0
July 12, 2026 · Companion to `PRODUCT_SPEC.md` v1.0 and `CONTENT_SPEC.md` v1.0
Supersedes RETHEME_SPEC v1.0 (which resolved in favour of the pirate fiction — since dropped).

This document does four things:

1. Establishes a **new premise** that replaces the pirate story.
2. Establishes a **three-layer architecture** so the fiction can never leak into the engine again.
3. Retires the **blueprint-room / playful-military** design brief and replaces it with a two-zone visual system.
4. Records a **reconciliation list** for code that drifted away from `PRODUCT_SPEC`, plus **v1.5 annotations** for parts already specced.

---

## 1. The premise

> **The bot goes where you cannot follow.**

There is no live signal down there. You cannot steer it, you cannot react, you cannot take the controls when it goes wrong. All you can do is **write its program, send it in, and wait for the footage to come back.**

### Why this and not something else

Every coding game has a plot hole: *why can't the kid just drive the bot?* If a joystick would work, the code is homework — a mechanic the game imposes rather than one the world demands. Pirates never answered this. A racing league doesn't answer it. A nature world doesn't answer it.

**No signal answers it.** Programming stops being a mechanic and becomes *the only thing that is possible.* That is the difference between a coding game and a game with coding bolted onto it, and a kid feels it even if she can never articulate it.

### What it makes true, for free

Everything already built stops being a compromise and starts being the point:

| Already built | Under the old fiction | Under this premise |
|---|---|---|
| **Replay** (`ReplayViewer.tsx`) | A debug tool | **The payoff.** You weren't there. The footage coming back *is* the reward. |
| **Async League** (no live lobbies) | A limitation we worked around | **The premise.** Your bot goes in while you're at school. You watch what came back. |
| **Deterministic sim** | An engineering choice | **The fiction.** The program is all there is. Same program, same run, every time. |
| **The workbench UI** (technical, mono, dark) | An aesthetic that fought the pirates | **Mission control.** Of course it looks like this. You're the engineer; the bot is the only thing that goes. |
| **Elements** (fire/ice/water/vine/gust) | Ammo | **The environment.** It's what's *down there*. Your bot survives it and uses it. |
| **Rivals** | Enemies to defeat | **Other kids' rovers.** You're not at war — you're both trying to bring back more. There is no violence to remove because there was never any. |

### The generator

The premise is a **frame, not a place.** Every world is the same truth wearing different clothes:

*deep caves · a storm · a sealed ruin · Mars · the ocean floor · a reactor · deep space*

Same rule every time: **no signal → send a program → wait for the footage.** The fiction changes; the reason she is typing never does. That is what makes future worlds a content drop instead of a sequel.

---

## 2. The three layers

The war vocabulary (`wrecked`, `3-hit kill`, `SNIPER`, a bot drawn with a *barrel*) did not leak in through carelessness. It leaked in because **the simulator owns themed nouns.** Once fiction lives inside the engine, drift is not a mistake — it is inevitable, and find-and-replace only holds until the next commit.

**Extract the theme and the drift becomes structurally impossible.**

`PRODUCT_SPEC` §11 already separates *rules* from *rendering* (*"Phaser 3 draws, a pure sim decides"*). This is the next seam over: separating **rules from fiction.**

### Layer 1 — CORE (invariant)

The sim: grid, ticks, weight, armor, shove physics, determinism. **And the JavaScript API** — `forward()`, `left()`, `fire()`, `if`, `for`, `function`.

**The API is never themed. Not even a little.** A rover on Mars does not get `drive()`. A ship does not get `sail()`. This is not architectural fussiness — it is the educational mission. `forward(3)` must be `forward(3)` in every skin, because **the transferable knowledge is the product.**

### Layer 2 — WORKBENCH (invariant)

The editor, the garage, the HUD chrome, the mission brief panel. **This is the tool, and a tool does not change when the world changes.** She is at mission control whether the bot is in a cave or on Mars.

### Layer 3 — THEME PACK (swappable)

Art, sound, copy, names, world fiction. **Everything a kid sees and hears; nothing she reasons about.**

### The i18n model

The sim emits **stable semantic keys**; a pack maps them to strings, sprites and sounds. Exactly like localization — and it makes real localization nearly free later.

```
core event            →  theme pack resolves
─────────────────────────────────────────────
unit.disabled         →  "TOWED"    + tow-hook sprite + slide-whistle
unit.blocked          →  "CLUNK!"   + dust puff      + thud
projectile.fired(ice) →  ice bolt   + freeze crackle
objective.reached     →  "SIGNAL!"  + the motif
```

Furniture is a **core kind** with themed art. The one-to-one mapping is the proof the seam is real:

| Core kind | Cave pack | (future) Mars pack |
|---|---|---|
| obstacle | crate | supply drum |
| wall | steel | rock face |
| hazard-pit | pit | crevasse |
| slow-terrain | mud | dust drift |
| slide-terrain | ice | scree |
| cover | bush | boulder |
| goal | beacon | relay |

**Same 24 arenas. Same verified grid traces. Same pars. A completely different game.**

### The discipline, not the machinery

> ⚠️ **Do NOT build a theme-switching system now.** Designing seams before there is a second theme means designing the *wrong* seams. Build **one pack**, and enforce three rules:
>
> 1. **The sim contains no themed noun.** Ever. `disabled`, not `wrecked`. `emitter`, not `blaster`.
> 2. **All copy lives behind keys** in a string bundle.
> 3. **All assets resolve through a manifest**, never a hardcoded path.
>
> Three rules, not a framework. Costs almost nothing today; makes the Mars pack a content drop.

This is the same philosophy as the existing parts system — *"new parts are content, never engine work"* — one level up.

---

## 3. The two zones

The blueprint aesthetic and the playful-military voice were conflated. They are different problems, and only one of them has to die.

The **war coding was in the words** (cadet, mission-control, tank, *"Tank online"*). The **austerity was in the rules** (no shadows, no gradients, div-only icons). Navy + mono + amber + crisp outlines was never what made this feel military — **it is simply a good technical design system**, and it is kept.

| Zone | Where | Look | Why |
|---|---|---|---|
| **THE WORKBENCH** | Editor · Garage · HUD chrome · Briefing panel | Deep navy · IBM Plex Mono · amber signal · crisp outlines · flat, no shadows | This is where she **thinks**. It is mission control, and a dark monospaced editor is what real code looks like. The blueprint room was always right here — it just never had a reason. Now it does. |
| **THE WORLD** | Arena · the bot · hazards · cutscenes · results | Warm colour · chunky outlines · hard offset shadows · dust · squash-and-stretch · a bot with a **face** · sound everywhere | This is where she **watches**. This is the footage coming back. |

**The RUN button is the portal between them.** She writes in the cool, quiet control room; she presses RUN; the warm world blooms into motion.

The contrast does not dilute either zone — **it amplifies both.** The world feels more alive precisely because it erupts out of a calm technical surface.

**The through-line:** amber. The signal colour in the workbench; the glow of a recovered core in the world. One token, two jobs. The outline signature carries across too — thin and precise on the workbench, thick and chunky in the world.

---

## 4. The design law

> **Old** (`readme.md`): Blueprint-room for kids: deep navy, 2px outlines, mono type, amber signal — playful-military ("cadet", "mission"), never violent, never babyish.

> **New:** Mission control, and the world on the other side of the signal. A calm technical workbench; a warm, loud, physical world. **Joyful, never condescending.** Competitive, never violent. Nothing dies.

**"Never babyish" → "never condescending"** is a deliberate upgrade, not a synonym. "Never babyish" is what produced the austerity, and the austerity is what produced the blueprint room. Nintendo's real standard is that a game can be warm, loud and funny while completely respecting the player — adults play Mario Kart at a high level and nobody feels talked down to. That is a higher bar, and it is the one we hold.

---

## 5. Rules lifted and rules kept

Applies to **the world zone**. The workbench stays flat, shadowless and disciplined — that is correct for a tool.

| Rule | Verdict | Why |
|---|---|---|
| **No shadows** | **LIFT** (world only) | Hard offset shadows are the world's depth model — a sticker/decal language. Depth from offset, never a blur stack. |
| **No gradients** | **LIFT** (world only) | The world needs distance and atmosphere. UI surfaces stay flat. |
| **Geometric primitives only** (icons and the bot built from `div`s) | **LIFT** | **This rule is why the bot looks like a tank.** A character composable only from rectangles gives you treads, a hull, a dome and a barrel. You cannot draw an expressive rover — or a face — out of `div`s. |
| **Emoji: never** | **KEEP** | Emoji is the lazy shortcut to "fun" and the single thing most likely to read babyish. Excitement comes from the bot's face, from motion, and above all from sound. |
| **Everything outlines** | **KEEP** | Thin and precise on the workbench; thick and chunky in the world. |
| **Mono for code and data** | **KEEP** | Non-negotiable. Code is always mono; code words are never renamed. |
| **Kid words in game, real words in code** | **KEEP** | `function`, `variable`, `loop` stay real. That is what transfers. |
| **Numbers appear only after they're felt** (Law 5) | **KEEP** | Unchanged. |
| Space Grotesk as display face | **OPEN** | See §12. A safe default carrying no character. |

---

## 6. Visual tokens — proposed, pending the design pass

The palette derives from the game's own elements, so item colours and UI categorical colours are one system.

| Token | Value | Role |
|---|---|---|
| Outline | near-black · 3px (world) / 2px (workbench) | The signature |
| Shadow | `6px 6px 0` · hard · no blur | World depth only |
| **Signal** | amber `#ffb020` | Action, score, unlocks — **and the glow of a recovered core** |
| Ice | cyan `#3fd2e8` | ICE element · info · beacons |
| Vine | lime `#b6f04a` | VINE element · success |
| Fire / Paint | magenta `#ff4d9d` | FIRE + PAINT · hazard |
| Gust / Smoke | violet `#a9a7e0` | GUST + SMOKE |

**Spend the boldness in one place.** Amber is the signal; everything else stays quiet. Element colours are semantic, never decorative.

Design project: **`41e196e7-28e3-43ef-b7d2-74af999644cd`** (claude.ai/design, "CodeBots"). Empty — tokens and component cards land there once §6 and §12 settle.

---

## 7. The bot

- **Not a tank.** A small, sturdy rover: treads, a dome, an antenna, a claw — and **expressive eyes.** No turret. No barrel silhouette.
- **The face is the primary emotional channel.** It reacts: pleased, confused, alarmed, smug. This is where a kid's attachment forms, and the current `div`-built mascot physically cannot do it.
- **One body**, exactly as `PRODUCT_SPEC` §5 specifies. Identity in `bot.json` (name, paint, paintbox).
- **Armor is readable from the silhouette.** Hits knock visible plating panels off. She should never need the ARMOR meter to know her bot is in trouble — she should *see* it.
- **"Sparkplug" survives.** The bot's nickname throughout `CONTENT_SPEC` is theme-neutral, affectionate, and good. Keep it.

---

## 8. Sound and feel

`PRODUCT_SPEC` §10's existing rule stands and is better than anything we would have invented:

> *"Every command has a sound… She should be able to close her eyes and hear her program run."*

### 8.1 The reward is the bot, not a coin

A coin sound is **transactional** — *you scored*. But what actually happens when her code runs correctly is that **a machine understood her.** That is the entire fantasy of programming, and a coin ding throws it away.

- **Code works → the bot chirps, happily.** It is pleased with her. The reward is *relational*. (Mario doesn't get a point sound when he does something great — he says "wa-hoo!" The character reacts.)
- **Code errors → a small, confused boop.** Never a buzzer. `PRODUCT_SPEC` already says *"soft boing… friendly, never harsh"* — this makes it the bot's own voice. It is funny, it never shames, and it makes her want to fix it **for the bot**.
- **The clink stays, where it belongs** — the sound of collecting a core or a fallen panel. A physical pickup. Not the sound of comprehension.

### 8.2 The bot has a voice

A **chirp language** — pitched square/triangle blips, not words. R2-D2, Wall-E, BB-8. Vocabulary to author: *acknowledge · confused · delighted · alarmed · smug · hurt · rebooting.*

Under this premise the voice does double duty: **it is the only thing that comes back with the footage.** The bot's chirps *are* the telemetry.

### 8.3 An escalating motif, not a sound

Design **one three-or-four-note phrase** that becomes *the sound of your code working* — the thing a kid hums, the thing that goes in the trailer. Play it at three sizes:

| Moment | Size |
|---|---|
| A line does what she wanted | Small chirp |
| Mission clear | Full phrase |
| Boss / league win | Full fanfare |

### 8.4 Juice

- **Squash and stretch** on every bump, landing and stop.
- **Dust puffs** on movement; treads should bite.
- **Panels tumble** off the bot on a hit and clatter to the floor.
- **Pitch-randomize repeated sounds ±10%.** A bump that plays byte-identical thirty times reads as cheap. One line of code; most of the difference between "has audio" and "feels good."
- **Screen shake, small.** Scaled to the event, never gratuitous.
- `readme.md`'s existing motion rules (snappy, physical, nothing floats) are good and survive intact.

### 8.5 Audio sourcing — $0 in v1

`PRODUCT_SPEC` §11 mandates "no paid services in v1." That holds.

| Need | Source | Cost | License |
|---|---|---|---|
| **The bot's voice + every arcade hit** (dash, bump, spin-out, UI, the motif) | **ChipTone / jsfxr / Bfxr** — already specced in `PRODUCT_SPEC` §11 | **$0** | **Owned outright. No training data → the cleanest possible provenance for a kids' product.** |
| Organic texture (clank, treads on gravel, panel clatter) | **Kenney.nl** (CC0) + **Sonniss GDC bundle** | **$0** | Perpetual, no attribution |
| Music | Kenney CC0 / OpenGameArt chiptune now; commission a chiptune artist later for a perpetual buyout | $0 now | Perpetual |
| **Post-v1 only:** bespoke splats and clanks | **ElevenLabs Starter — PAID tier**, generate then cancel | ~$6 once | Paid-tier generations keep commercial rights permanently |

**Hard avoid, for a shipped game:**

- **ElevenLabs free tier** — non-commercial only, attribution required. The 10,000 monthly credits are the *free* allowance; **anything generated on them cannot ship.**
- **Epidemic Sound · Artlist · Storyblocks Individual** — Content-ID logic written for video. A continuously-distributed game falls out of compliance the moment you cancel.
- **Meta AudioCraft / AudioGen / MusicGen** — MIT code but **CC-BY-NC weights.** Looks free; forbids commercial use. The trap in the open-source bucket.
- **Suno / Udio** — unresolved copyright litigation. Not a story to attach to a product for nine-year-olds.

### 8.6 Engine notes

Phaser 3 provides the Web Audio manager and **native audio sprites** (`load.audioSprite`) — Howler is optional and probably unnecessary; never run both managers. Phaser provides **nothing** for mixing, ducking, or pitch variation — that is ours, and it is where the feel actually lives. Pack SFX into one sprite. Unlock the audio context on the first user gesture or mobile plays silence.

---

## 9. Code reconciliation — the drift

**None of these are spec changes.** They are the implementation catching up to a spec it wandered away from.

| In the code today | What the spec says | Action |
|---|---|---|
| **Three Kits: SCOUT / TANK / LONGSHOT** (`content/parts.ts`) — stat sliders (armor 170 vs 65, range 4 vs 9) | **Not in the spec at all.** `PRODUCT_SPEC` §5: **one body, five slots, weight as the budget.** Law #1: *"Parts cost weight and add commands."* | **Delete the kits.** A stat menu picked before she understands the game, replacing a system where every part grants a **command**. The spec's design is better. Restore it. |
| `WRECKED` (Debrief UI) | Law #4: *"Nothing dies — tagged bots reboot."* | → **TOWED** |
| `wrecked: boolean` · `targetDestroyed` (`sim/types.ts`) | same | → `disabled` (core), themed to "towed" by the pack |
| `"3-hit kill"` · `"kill each other on the same tick"` · `"dies on the way in"` (`sim/battle.ts` comments) | same | → disable / reboot language. **Especially the comments** — that is where tone actually rots. |
| Enemy named **SNIPER** (`content/enemies.ts`) | — | → a rival-rover name |
| `damage` / `hp` | `PRODUCT_SPEC` §7: the meter is **ARMOR %** | → armor / plating |
| Bot mascot = treads + hull + dome + **barrel** (`botGraphics.ts`) | §7 above | → rover with a face; no barrel |
| Sprocket's parked **"tank"** obstacle (`view/furniture.ts`, `sim/missionSchema.ts`) | — | → a wrecked rover / obstacle |
| *"Your tank hit the wall on line 3"* (readme copy) | — | → *"Your bot hit the wall on line 3"* |
| **No sound at all** | `PRODUCT_SPEC` §10: *"every command has a sound"* | Build §8. **The largest gap between spec and reality.** |
| Full **League, seasons, standings, publishing** implemented | `PRODUCT_SPEC` §1: *"V1 is single player."* Battles are v1.5. | See §11. |

**Already correct — do not touch:** `rivals/publish.ts` — *"the only thing published is a program. There is no bio, no description, no message, no chat."* The most important safety decision in the product.

---

## 10. New parts and ammo — v1.5

### 10.1 Shots go forward, drops go behind

- **SHOTS** travel forward: `fire("zap" | "fire" | "ice" | "water" | "vine" | "gust" | "paint")` — **aiming now.**
- **DROPS** are left on your own square, for whoever is behind you: `dropSmoke()`, `dropOil()` — **planning ahead.**

Two genuinely different kinds of thinking, and a kid feels the difference in the *shape of her code.*

### 10.2 The three additions

| Ask | Already specced? | Decision |
|---|---|---|
| **PAINT** — blinds sensors | **No** | **NEW, and the best idea in this document.** `fire("paint")` splatters the rival's lens: `radar()` returns garbage for N ticks. **No damage at all.** The only thing in the armory that attacks the *program* rather than the robot — and it teaches **defensive programming: your inputs can lie to you.** A genuinely advanced CS idea delivered as the funniest item in the game. |
| **SMOKE** — blinds a pursuer behind you | **Yes, in a military coat.** `CHAFF POD` / `dropChaff()` exists (gizmo, 2wt, 50 C, W8): "breaks radar locks." | **RENAME.** CHAFF POD → **SMOKE POD**; `dropChaff()` → `dropSmoke()`. Same mechanic, same stats. Chaff is a military countermeasure; smoke is an escape. |
| **OIL** — makes them slide | **Partially.** `WATER BALL` already gives "slippery floor (+1 slide)" — but it is a *shot*. | **NEW as a drop.** **OIL POD** (gizmo), `dropOil()`. The banana peel: whoever hits it slides and loses a turn. Teaches **prediction** — not *where are they*, but *where will they be*. |

| Part | Slot | WT | Grants | Unlock |
|---|---|---|---|---|
| PAINT AMMO PACK | blaster mod | 1 | `fire("paint")` | v1.5 |
| SMOKE POD *(was CHAFF POD)* | gizmo | 2 | `dropSmoke()` | W8 |
| OIL POD | gizmo | 2 | `dropOil()` | v1.5 |

Armory rule still binds: *if a part doesn't add one new word or one new decision, it doesn't ship.* All three do.

---

## 11. Dash, panels, and the footage — v1.5

### 11.1 `dash(n)`

Burst 1–3 squares. **Costs CHARGE proportional to `n`.**

- **The tradeoff is the argument.** `forward(n)` already takes a number from World 1, so this is not her first argument — it is her first argument **with a price.** Bigger number, bigger cost, bigger risk of overshooting.
- **Overshoot is real.** Dash too hard and you sail into the pit yourself. Self-owns are the funniest thing in Mario Kart and they are free here.
- **Dash into a bot and you shove them.** `PRODUCT_SPEC` §6 **already has shove physics** — *"the heavier bot wins a shove and both dent."* This is where the bumper-car instinct lives, correctly scoped as a *move* rather than the whole game.
- **CHARGE is already the energy pool** (`PRODUCT_SPEC` §7: *"every shot spends it… No spamming `fire()`"*). Dash draws from the same meter. One resource, every action a trade — **no new system required.**

> ⚠️ **OPEN — overlaps `boost()`.** `TURBO TREADS` already grants `boost()` in W2 ("next forward covers 2 squares per tick"). Dash and boost may be one idea twice. Either (a) boost is *sustained speed* and dash is a *charged burst that shoves* — genuinely different — or (b) merge them. **Decide before building.**

### 11.2 The panel loop

A hit knocks a **plating panel** off. It clatters to the floor and stays there.

- Drive over it to **reclaim** it (armor back, or banked as scrap → coins).
- Turns a visual effect all the way into a **coded decision**: *do I write logic to go grab that panel, exposing myself in the open, or hold position?* Real risk/reward, expressed in her program.
- Needs a sensor — `radar()` gains kind `"panel"`.
- **Open (v2):** can she steal a panel that fell off her *opponent*?

### 11.3 The footage

`PRODUCT_SPEC` calls the v1.5 replay the **"black box."** Under this premise it is simply **THE FOOTAGE** — what came back.

This is no longer a feature. **It is the core loop.** She wasn't there; the recording is the whole reason she sent the bot. Treat it as the emotional centre of the game, not a debug tool: letterboxed, timestamped, a little lens warp, the bot's chirps on the audio track.

---

## 12. Scope — what is actually next

**The code built the endgame before finishing the game.** The League, publishing, seasons, standings and rival analysis are all implemented — and `PRODUCT_SPEC` places every one of them at **v1.5 or later**. Meanwhile **Worlds 5–8 exist only as a sketch** (`CONTENT_SPEC` §8). The single-player campaign — what `PRODUCT_SPEC` §1 calls "V1" — is the unfinished half, **and it is the product.**

Everything in §10 and §11 is **v1.5**. It must not displace the campaign.

**Recommended order:**

1. **The retheme** (§1–§8). It touches every surface, so it is cheapest now and more expensive every week it waits.
2. **The code reconciliation** (§9). Mostly mechanical: remove the war vocabulary, restore the parts/weight model the spec already describes, enforce the §2 layer boundary.
3. **Re-skin `CONTENT_SPEC` copy** (§14) — briefings and names only. **The geometry does not move.**
4. **Author Worlds 5–8.**
5. **Then** battles, the toybox, dash, and the panel loop.

---

## 13. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| 1 | **The place.** Where does the bot go? (caves · a sealed ruin · a storm · under the ice) | Needs a name and a look. **This is the next creative decision.** |
| 2 | **The rival.** Sprocket and Cogbeard were pirate captains. Who opposes her now? | A **rival outfit** — another engineer with their own rover. Maps directly onto the League (other kids' bots) and keeps the antagonist comic rather than hostile. Sprocket was *"rusty, pompous, harmless"*; that comic register translates cleanly. |
| 3 | **Currency.** C-coins were pirate treasure (amber squares with a "C" — Asha's spec). | Keep the *shape* (Asha designed it); re-fiction it as **cores** or **cells** recovered from below. |
| 4 | **Display typeface.** Space Grotesk is a safe default carrying no character. Mono (IBM Plex) stays for code regardless. | Needs a design pass. |
| 5 | **`boost()` vs `dash(n)`** (§11.1) | Keep both only if boost is *sustained* and dash is a *charged burst that shoves*. Otherwise merge. |
| 6 | **BLASTER slot rename.** `fire()` stays — 24 missions depend on it. The *slot name* is the question. | **EMITTER** or **LAUNCHER.** It throws ice and vines, not bullets. |
| 7 | **League migration.** Bots already published predate the toybox and the parts model. | Needs a versioning story before v1.5 ships. |
| 8 | **World names.** The eight worlds are currently pirate-flavoured. | Re-fiction alongside §14. Teaching order does **not** change. |

---

## 14. What `CONTENT_SPEC` loses, and what it keeps

Dropping the pirate story costs **less than it looks**, and the split is worth stating precisely.

**KEPT — every expensive thing:**
- All 24 **arena geometries**: sizes, start positions and facings, furniture coordinates.
- All **hand-verified grid traces** and author solutions.
- All **pars** (measured in editor lines).
- The **hint-ladder structure** (nudge → concrete sub-goal → worked example of the first leg only).
- The **teaching order** — sequencing → loops → variables → conditionals → functions → lists.
- The **authoring rules** (§9) and the **flags** (§10).
- **"Sparkplug."** Theme-neutral, affectionate, good. It stays.

**REWRITTEN — the prose only:**
- 24 **briefings** (~3 sentences each).
- **Villain names** and the Sprocket → Cogbeard arc.
- **World names** and flavour nouns (chests, treasure, the Countinghouse).

That is roughly a day of writing, not a rebuild — and under §2 it is exactly what a **theme pack** is. Doing it once, properly, is what proves the architecture works.

---

## 15. What does not change

- **The five laws** (`PRODUCT_SPEC` §2). All five survive. Law #1 (*parts add commands*) and Law #4 (*nothing dies*) are the backbone of this document, not casualties of it.
- **The language ladder** and the real-JavaScript commitment (`PRODUCT_SPEC` §3).
- **The safety model** — no chat, no bio, no message; deterministic sim; exportable real `.js`.
- **The mission grid work.** See §14.
