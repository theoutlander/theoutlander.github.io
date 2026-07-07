# CodeBots — Worlds 2–4: Sensors, Loops, Functions (+ combat)

**Date:** 2026-07-07
**Status:** Approved direction (4 decisions locked with owner before an unattended overnight build)
**Owner:** Nick (building for daughter Asha, ages 9–13)

## Goal

Extend CodeBots from "sequencing + `repeat`" (World 1, shipped) up the real
computer-science ladder, teaching **actual JavaScript** one concept at a time:

- **World 2 — EYES OPEN:** booleans, sensors, `if` / `else`, and `shoot()`.
- **World 3 — NEVER GIVE UP:** `while` loops (loop until a condition), wall-following.
- **World 4 — BUILD YOUR OWN:** define and call your own commands (functions), then parameters.

Each world is 6 levels (5 + a boss). ~18 new levels total.

## Locked decisions (owner, 2026-07-07)

1. **Scope:** Full new worlds W2/W3/W4 (not one deep world, not more W1-style levels).
2. **Combat:** Yes — add `shoot()`. It lives in W2, paired with a `targetAhead()` sensor
   ("if there's a barrel ahead, shoot it"), so combat *is* one of the conditional reactions
   rather than a bolt-on.
3. **Syntax:** Real JavaScript — `if (blocked()) { … }`, `while (!atBeacon()) { … }`,
   `function spin() { … }`. Sensors are real functions returning `true`/`false`.
4. **Delivery:** Deploy-as-I-go — merge to `main` + deploy each world once it is green.

## Why the existing architecture already supports this

The sandbox driver steps a generator and feeds each command's result back in:

```js
let step = gen.next();
while (!step.done) {
  const result = sim.execute(step.value); // computed from LIVE sim state
  step = gen.next(result);                // resumes the generator WITH the value
}
```

A **sensor** is therefore just a `__call` whose return value the sim computes from the
current bot position/facing/arena — no new execution model. `MAX_STEPS` already guards
runaway `while` loops. The *only* real engine work is:

- **Transform reach:** today `toGeneratorSource` rewrites only statement-level command
  calls. `if (blocked())` is a call inside an `if`-test, so the transform must rewrite
  **every** API call (statement- and expression-position) into `yield __call(...)`.
- **W4 functions:** user `function`s that contain commands must themselves become
  generators, and calls to them must become `yield*`.

## Architecture

### 1. Engine is built and FROZEN before any authoring

The single biggest risk in an unattended build: touching the transform in a later phase
regresses a world Asha is already playing. Mitigation: build the **complete** engine
(sensors + `shoot` + user functions) up front, lock it with level-independent unit tests,
then author all three worlds on frozen ground. If the engine is ever touched after a world
ships, re-run the **entire** golden suite across **all** worlds before the next deploy.

### 2. Sensors (queries) vs. actions

`Sim.execute(cmd)` branches on `cmd.name`:

- **Actions** (`forward`, `back`, `left`, `right`, `honk`, `shoot`): mutate state, emit
  events, return `undefined` (unchanged behavior for W1 commands).
- **Queries / sensors**: compute a boolean/number from the *current* state, emit no
  state-changing events (optionally a lightweight `look` event for a subtle view cue),
  and **return the value**. The generator receives it via `gen.next(result)`.

Sensor vocabulary (all real functions, return `boolean` unless noted):

| Sensor          | Meaning                                                             | World |
|-----------------|--------------------------------------------------------------------|-------|
| `blocked()`     | is the cell directly ahead a wall / crate / closed gate / edge?    | W2    |
| `coinHere()`    | is the bot standing on a coin?                                      | W2    |
| `atBeacon()`    | is the bot on the beacon (and facing-correct if required)?         | W2/W3 |
| `targetAhead()` | is a shootable target the next cell ahead (within range)?          | W2    |
| `onMud()`       | is the current cell mud? (optional flavor sensor)                  | W2    |

Negation (`!blocked()`) and short-circuit (`if (a() && b())`) must work — they fall out of
transforming the underlying calls to `yield`, but are covered by explicit unit tests.

### 3. `shoot()` + targets

- New arena entity `targets: Vec2[]` (breakable barrels), added to `ArenaSchema` (optional,
  defaults `[]` so W1 content is unaffected).
- `shoot()` fires in the facing direction; the first `target` within range (small fixed
  range, e.g. up to 4 cells until a wall) is destroyed and removed from the blocker set so
  the bot can pass. Hitting a wall / nothing is a **defined no-op** (no crash), a wasted shot.
- Events: `{type:"shoot", from, dir, hit?}` and `{type:"targetDestroyed", at}` for the view
  (muzzle flash + projectile tween + barrel pop). Targets render via `furniture.ts`; a new
  ArenaKey icon.

### 4. World 4 — functions (scoped)

- Transform upgrade: every user `FunctionDeclaration` becomes `function*`; calls to
  user-defined function names become `yield* name(args)`; calls to API names stay
  `yield __call(...)`. User-defined names must **not** be flagged by `findUnknownCalls`.
- **Scope constraint (de-risk):** W4 teaches **command-composition** functions — functions
  that run commands, not functions that *return sensor values*. `function nearWall(){ return
  blocked() }` used in an `if` is out of scope for tonight (hairy `yield*` return
  propagation); the spec notes it and levels are authored so it's never needed. This is the
  ~90% kid case for a fraction of the transform surface.

### 5. Per-world API registry

The sandbox currently hardcodes `W1_API`. Replace with an API set derived from
`mission.world`: W1 = base commands; W2 = base + sensors + `shoot`; W3 = W2; W4 = W3 + user
functions allowed. The lint (`findUnknownCalls`) and the transform both use this per-world
set, so a sensor is "unknown" (misspell-linted) in a world that hasn't taught it.

### 6. Content, docs, UI

- `commandDocs.ts` becomes world-aware (each command/sensor carries the world+level it's
  introduced; the Mission screen shows the growing reference, badges the newest).
- `ArenaKey` gains a Target icon; autocomplete/linter (`assist.ts`) gain the new API with
  formatted signature/description/example cards.
- `CampaignMap` renders all four worlds with unlock/progression gates.

## Verification (this section substitutes for the missing human review gate)

Nothing ships to `main` unless all of the following are green.

### Engine unit tests (level-independent — the real safety net)

- **Transform:** `if (blocked())` takes both branches correctly; `if (!blocked())` (negation);
  `while (!atBeacon())` terminates on a solvable arena; `while (blocked()) {}` with no move hits
  `MAX_STEPS` and surfaces the **friendly** "loop that never stops" error (not a raw throw);
  short-circuit `if (a() && b())` does **not** query `b()` when `a()` is false; statement-level
  `forward(1)` still works unchanged. **Compile-and-run** the astring output (not just generate
  the string) so `yield` precedence/parenthesization is proven.
- **W4 functions:** `function spin(){ right(); right() } spin()` delegates via `yield*` and turns
  the bot 180°; user function names are not flagged by `findUnknownCalls`.
- **Sim / shoot:** `shoot()` at a target destroys it and clears the path; `shoot()` at a wall /
  empty lane is a no-op, not a crash; sensors return correct booleans from representative states.

### Golden tests (data-driven)

- Iterate over `WORLD1..WORLD4` arrays: **every** mission's `authorSolution` must run to
  `cleared === true` with **3 stars**. Data-driven so a newly authored level is auto-covered —
  no per-mission wiring to forget at 3am. A level with no golden test = an untested level; the
  loop makes that impossible.

### Browser verification (the surface golden tests cannot cover)

- Multi-world campaign map: each world's unlock/progression gate opens correctly as prior levels
  clear; you can navigate world→world. A broken gate would lock Asha out of content that tests
  green — this is verified live in Chrome once the maps are wired.
- Spot-check one W2 (sensor+`if`+`shoot`), one W3 (`while`), one W4 (function) level end-to-end
  in the browser (run author solution → clear overlay).

### Per-deploy gate

- `tsc --noEmit` clean, full `vitest` suite green, then commit + push. CI deploy watched to
  `success`; live URL spot-checked (HTTP 200) before starting the next world.

## Build phases (this doubles as the plan)

- **Phase 0 — Engine (freeze):** transform reach + user functions; sensors + `shoot` + `targets`
  in sim/schema; per-world API registry; view (targets, shoot FX); assist/docs/ArenaKey API.
  Land **all** engine unit tests green. Commit. *(No new levels yet.)*
- **Phase 1 — World 2** (sensors, `if`/`else`, `shoot`): author 6 levels + author solutions;
  golden green; browser spot-check; deploy.
- **Phase 2 — World 3** (`while`): author 6 levels; golden green; browser spot-check; deploy.
- **Phase 3 — World 4** (functions): author 6 levels; golden green; browser spot-check; deploy.
- **Phase 4 — Map/progression polish** across 4 worlds; browser-verify gates; final deploy.

## Out of scope tonight

- W4 functions returning sensor values (noted above).
- Moving/AI enemies and moving targets (a future world).
- New parts/economy beyond what unlocks naturally per world.
- Any change to Maya's games.
