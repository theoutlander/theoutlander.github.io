# CODEBOTS — Retheme & Reconciliation Spec v1.0
July 12, 2026 · Companion to `PRODUCT_SPEC.md` v1.0 and `CONTENT_SPEC.md` v1.0

**This is not a mechanics redesign.** It is three things:
1. A **visual and audio retheme** that retires the blueprint-room identity.
2. A **reconciliation** of code that drifted away from `PRODUCT_SPEC`.
3. **v1.5 annotations** to parts and elements that are already specced.

**`CONTENT_SPEC.md` is untouched.** All 24 authored missions, their briefings, hint ladders, pars and verified traces stand exactly as written. The pirate voice in those briefings is already the tone this document is chasing.

---

## 1. The contradiction we are resolving

Two source documents disagreed with each other, and the code split the difference badly.

| Document | Says |
|---|---|
| `PRODUCT_SPEC.md` §1 | The fiction is **pirates** — the Rust Pirate League, treasure, chests, C-coins, eight worlds, a pirate captain boss each, Captain Cogbeard's gauntlet. |
| `readme.md` (design brief) | The look is a **military blueprint room** — "deep navy, 2px outlines, mono type, amber signal — playful-military ('cadet', 'mission')." |

A pirate treasure hunt rendered as a navy-blue military CAD drawing is an incoherent object. Faced with that, the implementation resolved the tension by defaulting to the thing game engines always default to: **everything became a tank.**

**Resolution: pirates win.** Pirates are the most Nintendo-compatible fiction available — treasure, chests, goofy captains, comic defeat, a coin that goes *ting*. The military/blueprint layer is deleted. Nothing about the campaign changes, because the campaign was never military in the first place.

---

## 2. The new design law

Replaces the one-line brief in `readme.md`.

> **Old:** Blueprint-room for kids: deep navy, 2px outlines, mono type, amber signal — playful-military ("cadet", "mission"), never violent, never babyish.

> **New:** A Nintendo-grade pirate workshop: chunky outlines, hard offset shadows, treasure amber, and a bot with a face. **Joyful, never condescending.** Competitive, never violent. Nothing dies.

**"Never babyish" → "never condescending."** This is a deliberate upgrade, not a synonym. "Never babyish" pushed the design toward austerity, and austerity is what produced the blueprint room. Nintendo's actual standard is that a game can be warm, loud and funny while still respecting the player completely — adults play Mario Kart at a high level and nobody feels talked down to. That is a higher bar than "not babyish," and it is the one we hold.

---

## 3. Rules lifted and rules kept

| Rule (from `readme.md`) | Verdict | Why |
|---|---|---|
| **No shadows** | **LIFT** | Hard offset shadows are the new depth model — a sticker/decal language, not soft blur. Depth from offset, never from a blur stack. |
| **No gradients** | **LIFT** | The arena world needs to breathe — sky, sea, distance. UI surfaces stay flat. |
| **Geometric primitives only** (icons and the bot built from `div`s) | **LIFT** | **This rule is why the bot looks like a tank.** If a character can only be composed from rectangles, you get treads, a hull, a dome and a barrel. You cannot draw an expressive salvage bot, a treasure chest, or a pirate captain out of `div`s. The bot needs a face, and faces are where the warmth lives. |
| **Emoji: never** | **KEEP** | Emoji is the lazy shortcut to "fun," and it is the single thing most likely to make this read babyish. Excitement comes from the bot's face, from motion, and above all from sound. |
| **Everything outlines / no borderless cards** | **KEEP, thickened** | The outline signature survives — but chunky (3px) and confident, not thin (2px) and austere. |
| **Mono for code and data** | **KEEP** | Non-negotiable. This is a coding game; code is always set in mono and code words are never renamed. |
| **Kid words in game, real words in code** | **KEEP** | `function`, `variable`, `loop` stay real. That is the knowledge that transfers. |
| **Numbers appear only after they're felt** (Law 5) | **KEEP** | Unchanged. |
| Space Grotesk as the display face | **OPEN** | See §11. It is a safe default and carries no pirate energy. Needs a design pass. |

---

## 4. Visual tokens — proposed, pending a design pass

The palette derives from the game's own elements rather than being chosen abstractly, so the item colors and the UI categorical colors are the same system.

| Token | Value | Role |
|---|---|---|
| Outline | near-black, 3px solid | The signature. Everything outlines. |
| Shadow | `6px 6px 0`, hard, no blur | Depth. Sticker/decal offset. |
| **Signal** | amber `#ffb020` | Action, score, unlocks, treasure. The one bold color. |
| Ice | cyan `#3fd2e8` | ICE element + info/beacons |
| Vine | lime `#b6f04a` | VINE element + success/ready |
| Fire / Paint | magenta `#ff4d9d` | FIRE + PAINT elements + hazard |
| Gust / Smoke | violet `#a9a7e0` | GUST + SMOKE |

**Spend the boldness in one place.** Amber is the signal; everything around it stays quiet. Element colors are semantic (they mean an element), never decorative.

---

## 5. The bot

- **The bot is not a tank.** It is a small pirate salvage robot: treads, a dome, an antenna, a claw — and **expressive eyes**. There is no turret and no barrel silhouette.
- **The face is the primary emotional channel.** It reacts: pleased, confused, alarmed, smug. This is where a kid's attachment to her bot actually forms, and the current div-built mascot cannot do it.
- **One body**, exactly as `PRODUCT_SPEC` §5 already specifies. Identity lives in `bot.json` (name, paint, paintbox).
- **Armor is readable from the silhouette.** Hits knock visible plating panels off. She should never need to read the ARMOR meter to know her bot is in trouble — she should be able to *see* it.

---

## 6. Sound and feel

Expands `PRODUCT_SPEC` §10, whose existing rule already stands and is better than anything we would have invented:

> *"Every command has a sound… She should be able to close her eyes and hear her program run."*

### 6.1 The reward is the bot, not a coin

A coin sound is **transactional** — it says *you scored*. But what actually happens when her code runs correctly is that **a machine understood her**, which is the entire fantasy of programming. A coin ding throws that away.

- **Code works → the bot chirps, happily.** It is pleased with her. The reward is *relational*, not transactional. (Mario doesn't get a point sound when he does something great — he says "wa-hoo!" The character reacts.)
- **Code errors → a small, confused boop.** Never a buzzer. `PRODUCT_SPEC` already says *"soft boing on code errors (friendly, never harsh)"* — this makes it the bot's own voice. It is funny, it never shames, and it makes her want to fix it *for the bot*.
- **The clink stays — but where it belongs.** A chunky metallic *tink* is the sound of **collecting a coin or a fallen panel**. That is a physical pickup. It is not the sound of comprehension.

### 6.2 The bot has a voice

A **chirp language** — pitched square/triangle blips, not words. R2-D2, Wall-E, BB-8. Vocabulary to author: *acknowledge · confused · delighted · alarmed · smug · hurt · rebooting.*

This is also the single easiest thing on the list to synthesize (§6.4), and it is 100% ours.

### 6.3 An escalating motif, not a sound

Design **one three-or-four-note phrase** that becomes *the sound of your code working* — the thing a kid hums, the thing that goes in the trailer. Then play it at three sizes:

| Moment | Size |
|---|---|
| A line does what she wanted | Small chirp |
| Mission clear | Full phrase (+ the chest fanfare `PRODUCT_SPEC` already specs) |
| Boss / league win | Full fanfare |

### 6.4 Juice

- **Squash and stretch** on every bump, every landing, every stop.
- **Dust puffs** on movement; the treads should feel like they bite.
- **Panels tumble** off the bot on a hit and clatter to the floor.
- **Pitch-randomize repeated sounds ±10%.** A bump sound that plays byte-identical thirty times reads as cheap. This one line of code is most of the difference between "has audio" and "feels good."
- **Screen shake, small.** Scaled to the event, never gratuitous.
- Motion stays *snappy and physical* — `readme.md`'s existing motion rules are good and survive intact.

### 6.5 Audio sourcing — $0 in v1

`PRODUCT_SPEC` §11 already mandates "no paid services in v1," and that holds.

| Need | Source | Cost | License |
|---|---|---|---|
| **Bot's chirp language, all arcade hits** (dash, bump, spin-out, UI, the success motif) | **ChipTone / jsfxr / Bfxr** — already specced in `PRODUCT_SPEC` §11 | **$0** | **Owned outright. No training data → the cleanest possible provenance for a kids' product.** |
| Organic texture (tow-hook clank, treads on gravel, chest lid) | **Kenney.nl** (CC0) + **Sonniss GDC bundle** | **$0** | Perpetual, no attribution |
| Music | Kenney CC0 jingles / OpenGameArt chiptune; commission a chiptune artist later for a perpetual buyout | $0 now | Perpetual |
| **Post-v1 only:** bespoke splats/clanks | ElevenLabs **Starter, paid tier** — generate, then cancel | ~$6 once | Paid-tier generations keep commercial rights permanently |

**Hard avoid, for a shipped game:**
- **ElevenLabs free tier** — non-commercial only, attribution required. The 10,000 monthly credits are the *free* allowance; anything generated on them cannot ship.
- **Epidemic Sound · Artlist · Storyblocks Individual** — their licenses are Content-ID logic for video. A continuously-distributed game falls out of compliance the moment you cancel.
- **Meta AudioCraft / AudioGen / MusicGen** — MIT code but **CC-BY-NC weights**. Looks free; forbids commercial use. This is the trap in the open-source bucket.
- **Suno / Udio** — unresolved copyright litigation. Not a story to attach to a product for nine-year-olds.

### 6.6 Engine notes

Phaser 3 provides the Web Audio sound manager and **native audio sprites** (`load.audioSprite`) — Howler is optional and probably unnecessary; do not run both managers. Phaser provides **nothing** for mixing, ducking, or pitch variation — that is ours to build, and it is where the feel actually comes from. Pack SFX into one audio sprite; unlock the audio context on the first user gesture or mobile silently plays nothing.

---

## 7. Code reconciliation — the drift

The code wandered from the spec. This is the list. **None of these are spec changes; they are the implementation catching up.**

| In the code today | What the spec says | Action |
|---|---|---|
| **Three Kits: SCOUT / TANK / LONGSHOT** (`content/parts.ts`) — stat sliders (armor 170 vs 65, range 4 vs 9) | **Not in the spec at all.** `PRODUCT_SPEC` §5: **one body, five slots, weight as the budget.** Law #1: *"Parts cost weight and add commands."* | **Delete the kits.** They are a downgrade — a stat menu a kid picks before she understands the game, replaced by a system where every part grants a *command*. The spec's design is better; restore it. |
| `WRECKED` (Debrief UI) | Law #4: *"Nothing dies — tagged bots reboot."* | → **TOWED** |
| `wrecked: boolean`, `targetDestroyed` (`sim/types.ts`) | same | → `towed`, `targetTowed` |
| `"3-hit kill"`, `"kill each other on the same tick"`, `"dies on the way in"` (`sim/battle.ts` comments) | same | → tow / reboot language. **Especially in the comments** — that is where the tone actually rots. |
| Enemy named **SNIPER** (`content/enemies.ts`) | Pirate fiction | → a pirate crew name |
| `damage` / `hp` | `PRODUCT_SPEC` §7: the meter is **ARMOR %** | → armor / plating |
| "blaster" in `sdk.ts` copy | `PRODUCT_SPEC` §5 names the slot **BLASTER** | **Open** — see §11. `fire()` stays (it is in the CONTENT_SPEC API and 24 missions depend on it). The *slot name* is the question. |
| Bot mascot = treads + hull + dome + **barrel** (`botGraphics.ts`) | §5 above | → salvage bot with a face, no barrel |
| Sprocket's parked **"tank"** obstacle (`view/furniture.ts`, `sim/missionSchema.ts`) | Pirate fiction | → Sprocket's rustbucket / wreck |
| *"Your tank hit the wall on line 3"* (readme brand copy) | — | → *"Your bot hit the wall on line 3"* |
| **No sound at all** | `PRODUCT_SPEC` §10: *"every command has a sound"* | Build §6. This is the largest gap between spec and reality. |
| Full **League, seasons, standings, publishing** implemented | `PRODUCT_SPEC` §1: *"V1 is single player."* Battles are v1.5. | See §10 (scope). |

**Already correct in the code, do not touch:** `rivals/publish.ts` — *"the only thing published is a program. There is no bio, no description, no message, no chat."* That is the most important safety decision in the product.

---

## 8. New parts and ammo — v1.5

Extends `PRODUCT_SPEC` §8 (elements) and `CONTENT_SPEC` §2 (parts table).

### 8.1 The taxonomy — shots go forward, drops go behind

This is the new law, and it is worth stating plainly because it maps onto two genuinely different kinds of thinking:

- **SHOTS** travel forward from the bot: `fire("zap" | "fire" | "ice" | "water" | "vine" | "gust" | "paint")`. **Aiming now.**
- **DROPS** are left on your own square, for whoever is behind you: `dropSmoke()`, `dropOil()`. **Planning ahead.**

Mario Kart's shells-versus-bananas. A kid feels the difference in the shape of her code.

### 8.2 The three additions

| Ask | Already in the spec? | Decision |
|---|---|---|
| **PAINT** — blinds sensors | **No** | **NEW. The best idea in this document.** `fire("paint")` splatters the rival's lens: `radar()` returns garbage for N ticks. **No damage at all.** It is the only thing in the armory that attacks the *program* instead of the robot — and it teaches **defensive programming: your inputs can lie to you.** That is a genuinely advanced CS idea delivered as the funniest item in the game. Direct Nintendo ancestor: the Blooper. |
| **SMOKE** — blinds a pursuer behind you | **Yes, wearing a military coat** — `CHAFF POD` / `dropChaff()` already exists (gizmo, 2wt, 50 C, W8) and "breaks radar locks." | **RENAME.** CHAFF POD → **SMOKE POD**, `dropChaff()` → `dropSmoke()`. Same mechanic, same stats. Chaff is a military countermeasure; smoke is a pirate's escape. |
| **OIL** — makes them slide | **Partially.** `WATER BALL` already gives "slippery floor (+1 slide)" and ice patches slide — but both are *shots* or *terrain*. | **NEW as a drop.** **OIL POD** (gizmo), `dropOil()`. The banana peel: the bot that hits it slides and loses its turn. Teaches **prediction** — not *where are they*, but *where will they be*. |

### 8.3 Proposed part cards

| Part | Slot | WT | Grants | Unlock |
|---|---|---|---|---|
| PAINT AMMO PACK | blaster mod | 1 | `fire("paint")` | v1.5 |
| SMOKE POD *(was CHAFF POD)* | gizmo | 2 | `dropSmoke()` | W8 |
| OIL POD | gizmo | 2 | `dropOil()` | v1.5 |

Armory rule still binds: *if a part doesn't add one new word or one new decision, it doesn't ship.* All three do.

---

## 9. Dash, pickups, and the dash cam — v1.5

### 9.1 `dash(n)`

Burst 1–3 squares. **Costs CHARGE proportional to `n`.**

- **The tradeoff is the argument.** `forward(n)` already takes a number from World 1, so dash is not her first argument — but it is her first argument **with a price.** The bigger the number, the more it costs and the more you risk overshooting.
- **Overshoot is a real risk.** Dash too hard and you sail into the pit yourself. Self-owns are the funniest thing in Mario Kart and they are free here.
- **Dash into a bot and you shove them.** `PRODUCT_SPEC` §6 **already has shove physics**: *"the heavier bot wins a shove and both dent."* This is where the bumper-car instinct lives — correctly scoped as a *move*, not as the whole game.
- **CHARGE is already the energy pool.** §7 of the product spec: *"every shot spends it… No spamming `fire()`."* Dash draws from the same meter. One resource, every action a trade — no new system required.

> ⚠️ **OPEN — overlap with `boost()`.** `TURBO TREADS` already grants `boost()` (W2: "next forward covers 2 squares per tick"). Dash and boost may be the same idea twice. Options: (a) `boost()` is *sustained speed*, `dash(n)` is an *instant burst that costs charge and can shove* — genuinely different; (b) merge them. **Decide before building.**

### 9.2 The panel loop

A hit knocks a **plating panel** off the bot. It clatters to the arena floor and stays there.

- Drive over it to **reclaim** it (armor back, or banked as scrap → C-coins).
- This turns a visual effect all the way into a **coded decision**: *do I write logic to go grab that panel, exposing myself in the open, or hold position?* Real risk/reward, expressed in her program.
- Needs a sensor — `radar()` gains kind `"panel"`.
- **Open (v2):** can she steal a panel that fell off her *opponent*?

### 9.3 The replay is a dash cam

`PRODUCT_SPEC` calls the v1.5 replay the **"black box."** Rename it the **DASH CAM**: same system (`ReplayViewer.tsx` already exists), but presented as *footage from your bot's camera* — letterboxed, timestamped, a little lens warp.

Costs a rename and some UI treatment. Turns a debug tool into **something a kid wants to watch.** *(Open: black box vs. dash cam — §11.)*

---

## 10. Scope — what is actually next

**The code built the endgame before finishing the game.** The League, publishing, seasons, standings and rival analysis are all implemented — and `PRODUCT_SPEC` puts every one of them at **v1.5 or later**. Meanwhile **Worlds 5–8 are only sketched** in `CONTENT_SPEC` §8. The single-player campaign — which `PRODUCT_SPEC` §1 calls "V1" — is the unfinished half, and it is the product.

Everything in §8 and §9 of *this* document is **v1.5**. It should not displace the campaign.

**Recommended order:**

1. **The retheme** (§2–§6). It touches every surface, so it gets cheaper the earlier it lands and more expensive every week it waits.
2. **The code reconciliation** (§7). Mostly mechanical; removes the war vocabulary and restores the parts/weight model the spec already describes.
3. **Worlds 5–8 content** (`CONTENT_SPEC` §8), authored to the §9 authoring rules.
4. **Then** battles, the toybox, dash, and the panel loop.

---

## 11. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| 1 | **Display typeface.** Space Grotesk is a safe, generic default and carries no pirate energy. Mono (IBM Plex) stays for code and data regardless. | Needs a design pass. Wants something chunkier and more characterful. |
| 2 | **`boost()` vs `dash(n)`** — same idea twice? (§9.1) | Keep both only if boost is *sustained* and dash is a *charged burst that shoves*. Otherwise merge. |
| 3 | **BLASTER slot rename.** `fire()` stays (24 missions depend on it). The slot name is the question. | **CANNON** — impeccably pirate, reads as cartoon (Donkey Kong barrel cannons), and it lobs fireballs and vines, not bullets. |
| 4 | **"Black box" vs "dash cam"** (§9.3) | Dash cam. Funnier, and a kid knows what it is. |
| 5 | **Where does the Claude Design project live?** `DesignSync.list_projects` returns empty — the `tokens/`, `components/`, `ui_kits/` referenced by `readme.md` are not reachable from this login. | Locate it, or create a fresh design-system project and push the new tokens once §4 settles. |
| 6 | **League migration.** Bots already published to the League predate the toybox and the parts model. | Needs a versioning story before v1.5 ships. |
| 7 | **Sprocket's "tank."** He is a pirate captain. Why does he have a tank? | His rustbucket. A beached, barnacled wreck of a machine. |

---

## 12. What this document does not change

- **`CONTENT_SPEC.md` — all 24 missions.** Arenas, traces, pars, hint ladders, briefings, the Sprocket → Cogbeard arc. The voice in those briefings (*"Rise and shine, Sparkplug"*) is already the warm, funny, pirate-adventure tone this retheme is chasing. It was never the problem.
- **The five laws** (`PRODUCT_SPEC` §2). All five survive intact. Law #1 (*parts add commands*) and Law #4 (*nothing dies*) are the backbone of this document, not casualties of it.
- **The language ladder** and the real-JavaScript commitment (`PRODUCT_SPEC` §3).
- **The safety model** — no chat, no bio, no message; deterministic sim; exportable real `.js`.
