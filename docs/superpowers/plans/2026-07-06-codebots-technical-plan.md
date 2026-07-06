# CodeBots — Technical Plan (HANDOFF step 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Scope note:** This plan covers HANDOFF's build-order step 1 only — the architecture
> proposal, repo scaffold, sim-core skeleton, and enough of it working end-to-end (one real
> mission, replayed from JSON, through the worker sandbox, asserted by a golden test) to prove
> the approach out. It deliberately stops before World 1's five remaining missions, the
> Phaser view, the CodeMirror mission shell, HUD wiring, and bot.json integration — those are
> steps 2–4 of the build order and get their own plan once this one is approved, per the
> user's explicit "wait for my approval on the plan, then build the World 1 vertical slice."

**Goal:** Stand up CodeBots as a self-contained sub-app in this repo with a deterministic,
renderer-free sim core, a Web-Worker-sandboxed kid-code runtime, and a mission/part content
pipeline — proven by replaying World 1 Mission 1's author solution from CONTENT_SPEC.md as a
golden test.

**Architecture:** Pure TypeScript sim core (grid physics, commands, missions) with zero
rendering or DOM dependencies. Kid code is textually desugared (`repeat n {}` → `for`) and
AST-transformed into a generator function whose motion/sensor calls `yield` a command
descriptor; a driver loop inside a Web Worker steps the generator once per resolved sim tick,
so kid code reads as plain synchronous JavaScript while staying cooperatively interleaved
with the deterministic tick engine — no `SharedArrayBuffer`/`Atomics`, no real threads.
Phaser (later) is a pure view over sim-state snapshots; it never touches sim state.

**Tech Stack:** TypeScript, Vite (build), Vitest (tests), Zod (mission/part schema
validation), acorn + astring (parse/transform kid code). Phaser 3, CodeMirror 6, Howler.js —
declared now, wired in the Phase 2 plan.

## Global Constraints

- Real JavaScript only — no invented language; `repeat n { }` is textual sugar removed before
  the kid's code is treated as JS (PRODUCT_SPEC §3).
- Sim is deterministic: fixed ticks, seeded, same code + same build = same result, always
  (PRODUCT_SPEC §11).
- Sim core is renderer-free; Phaser 3 is view-only (PRODUCT_SPEC §11, non-negotiable).
- Missions, parts, and arenas are data (JSON), never hardcoded per-mission engine branches
  (PRODUCT_SPEC §11, CONTENT_SPEC §9 rule 8).
- Par is measured in editor lines, not moves (CONTENT_SPEC §1).
- A part is one data card `{ name, slot, weight, grants, teaches, tradeoff }` (PRODUCT_SPEC §5).
- Kid-worded errors point at the line; errors never cost points (PRODUCT_SPEC §3).
- No emoji anywhere in UI or copy (SKILL.md / readme.md).
- Everything free/open-source; no paid services in v1 (PRODUCT_SPEC §11).
- Site is deployed as static output behind Cloudflare on GitHub Pages (gh-pages branch); no
  server-rendered backend for the game.

---

## 1. Decisions that need sign-off

### 1.1 Execution model: generator transform, not `SharedArrayBuffer`/`Atomics`

The hard problem: kid code must look like flat synchronous JavaScript
(`forward(2); if (radar().dist < 3) { left(); }`) while every motion/sensor call needs a
value that depends on the *live, mid-run* sim state — so the kid's script and the tick engine
must interleave, not run as two separate batch passes.

The classic fix for this class of game (Screeps-style) is to run kid code in a Worker and
block it with `Atomics.wait` on a `SharedArrayBuffer` until the main thread finishes
simulating the requested ticks. **Rejected.** Two independent reasons, in priority order:

1. **Determinism by construction.** A single-threaded cooperative generator that the driver
   steps one `yield` at a time has no scheduling nondeterminism to reason about — the same
   script always produces the same sequence of driver decisions. `Atomics.wait` still relies
   on real OS thread scheduling between two agents; it's *usually* deterministic in practice
   but isn't deterministic *by construction*, which matters for ghost replay and golden tests.
2. **Portability.** `SharedArrayBuffer` requires the page to be cross-origin-isolated
   (`Cross-Origin-Opener-Policy` / `Cross-Origin-Embedder-Policy`). This site is fronted by
   Cloudflare (confirmed: `server: cloudflare` on `nick.karnik.io`), so those headers *could*
   be injected via a Transform Rule — this isn't a hard blocker — but it's an extra piece of
   infra the game would depend on forever, for a feature (real blocking) we don't need.

Instead: desugar `repeat n { }` to `for (...)` textually, then AST-transform the kid's script
into a generator function where every call to a sim API function becomes
`yield __call("name", [args])`. A driver loop (`gen.next(resultValue)`) steps the generator,
asks the sim core to execute the yielded command, advances exactly the ticks that command
costs, and resumes the generator with the command's return value (sensors) or `undefined`
(motion). One thread, no shared memory, fully deterministic, works on any static host
including `file://`.

**This is the one architectural decision in this whole project that's expensive to reverse
later** (every mission-authoring and UI decision downstream assumes it), so flagging it as the
thing to push back on now if there's a reason not to.

### 1.2 Scope the transform to what World 1 actually needs — and de-risk the rest cheaply

World 1 (all 6 missions, per CONTENT_SPEC §4) only ever uses: sequential statements,
`repeat n { }`, and calls to `forward/back/left/right/honk`. No sensors, no `if/else`, no
events, no user functions — those don't show up until Worlds 3–6. So the transform this plan
builds only needs to handle: `ExpressionStatement` calls to known API names, and `for` loops
(post-`repeat`-desugar) whose bodies contain those calls.

That's a trap on its own, though: the *hard* property of this design — that a sensor read
mid-script reflects live sim state, not a stale snapshot — is exactly the thing World 1 never
exercises. If this plan only ships golden tests against W1 missions, it will have built the
risky mechanism and validated the safe one. So Task 6 below includes one synthetic test that
has nothing to do with any mission: a fake API function that returns the driver's internal
tick counter, called twice inside a loop, asserting the two calls return different values.
That's the cheapest possible proof the generator is actually pausing/resuming per call and
not batching the whole script up front. The full event/sensor/multi-thread scheduler (for
`when bumped { }` et al.) is real work but isn't needed until the Worlds 3–4 plan — building
it now against zero real missions would be speculative, so it's out of scope here.

### 1.3 Sub-app layout, not a raw static folder

`projects/maya`, `projects/lab`, and `projects/judgement` are served as raw folders (no
bundler — judgement's client is React-via-in-browser-Babel by design, for a throwaway
prototype). CodeBots needs actual bundling (Web Worker entry, npm deps: acorn, astring, zod,
later Phaser/CodeMirror/Howler) and a real test runner for the golden tests HANDOFF asks for,
so it gets its own sub-package: `projects/codebots/app/` with its own `package.json` and
lockfile (same pattern as `projects/judgement/server`), **not** added to the root
`pnpm-workspace.yaml` — keeps the root site's install/build untouched.

Integration points with the parent site:
- `vite.config.ts` (root): add
  `staticFolderDevPlugin("/codebots", path.join(__dirname, "projects/codebots/app/dist"))` —
  note this serves the **built** `dist/`, not the source tree (unlike maya/lab/judgement,
  which have nothing to build). Local iteration on the game itself happens via the sub-app's
  own `vite dev` on its own port (HMR); the parent's plugin is only for checking the built
  output integrates correctly under `/codebots`.
- `src/ssr-renderer.tsx` (root): add
  `{ source: "projects/codebots/app/dist", destinations: ["dist/codebots"] }` to the
  `standaloneFolders` list (~line 875), so production copies the built bundle, not the
  TypeScript source, `node_modules`, or the design-system/spec files that live alongside it in
  `projects/codebots/`.
- Sub-app's Vite `base: '/codebots/'`.
- Nothing in `scripts/deploy.sh` changes — deploys go through CI on push to `main`, per
  existing project convention.

### 1.4 Schema validation: Zod

Missions/parts/arenas are data (constraint above). Zod gives one definition that's both the
TypeScript type and the runtime validator, so a malformed mission JSON fails loudly at content
load time with a pointed error instead of a confusing runtime crash mid-mission — same spirit
as the kid-worded-errors rule, just for content authors instead of players. Zero-dependency
alternative (hand-rolled validators) was considered and rejected only because Zod is tiny,
already familiar tooling, and removes an entire class of hand-written boilerplate.

---

## 2. Repo layout (this plan's scope in bold; rest is where later plans land)

```
projects/codebots/app/
  package.json
  tsconfig.json
  vite.config.ts              # base: '/codebots/', builds to ./dist
  vitest.config.ts
  index.html                  # Phase 2
  **src/**
  **  sim/**
  **    types.ts**             # Vec2, Facing, Arena, BotState, Command, TraceEntry, ...
  **    arena.ts**              # grid model: cell lookup, in-bounds, furniture queries
  **    physics.ts**            # movement resolution, dents/armor, mud tick cost
  **    commands.ts**           # forward/back/left/right/honk execution against sim state
  **    engine.ts**             # createSim(mission): step one command, tick bookkeeping
  **    trace.ts**              # trace-mode recorder: {tick, x, y, hazards}[]
  **    missionSchema.ts**      # Zod schema + inferred types for Mission/Arena/Part JSON
  **    index.ts**              # public barrel export
  **  sandbox/**
  **    transform.ts**          # repeat-desugar + AST-to-generator transform (W1 grammar subset)
  **    driver.ts**             # steps the generator against the sim, step-budget guard
  **    lines.ts**              # countCodeLines: one par line-counter shared by driver + tests
  **    sandbox.worker.ts**     # Worker entry: postMessage protocol wrapping driver.ts
  **    sandboxClient.ts**      # main-thread API: run(code) -> Promise<SimResult>
  **    errors.ts**             # kid-worded error mapping (parse errors, step-budget exceeded)
    editor/                    # Phase 2 — CodeMirror 6
    view/                      # Phase 2 — Phaser 3 scenes
    ui/                        # Phase 2 — Mission shell (BRIEF/CODE/RUN/RESULT), HUD
  **content/**
  **    missions/world1/m1.json**   # authored from CONTENT_SPEC §4 W1M1
    parts.json                 # Phase 2 (garage) — PartSchema shape is locked now, data later
  App.tsx / main.tsx            # Phase 2
**tests/**
**  golden/world1.test.ts**       # replays W1M1's author solution, asserts it clears
**  sandbox/transform.test.ts**   # interleaving de-risk test (§1.2) + repeat-desugar tests
**  sim/**                       # physics/commands/engine unit tests
```

---

## 3. Sim-core API

```ts
// src/sim/types.ts
export type Facing = "N" | "E" | "S" | "W";
export interface Vec2 { x: number; y: number; }

export type CellKind =
  | "floor" | "wall" | "pit" | "mud" | "ice" | "bush" | "tree" | "water"
  | "repairPad" | "spawnPad";

export interface GateSpec {
  pad: Vec2;
  gateCells: Vec2[];
  /** opens permanently once honk() is called while standing on `pad` */
  open: boolean;
}

export interface Arena {
  cols: number;
  rows: number;
  /** cells[y][x] */
  cells: CellKind[][];
  crates: Vec2[];
  coins: Vec2[];
  chests: { id: string; pos: Vec2 }[];
  gates: GateSpec[];
  beacon: Vec2;
  /** if set, arriving at the beacon also requires this facing (W1M3 rule) */
  beaconRequiresFacing?: Facing;
}

export interface Mission {
  id: string;              // "w1m1"
  world: number;
  index: number;
  teaches: string;
  arena: Arena;
  start: { pos: Vec2; facing: Facing };
  parLines: number;
  starterCode: string;
  hints: string[];
  briefing: string;
  authorSolution: string;  // real JS source (post repeat-sugar), used by golden tests
  bonusStar: { kind: "honkOnBeacon" } | { kind: "zeroBumps" } | { kind: "exactHonks"; count: number };
  unlock?: { part: string; cost: number };
}

export interface BotState {
  pos: Vec2;
  facing: Facing;
  armor: number;   // 0-100
  score: number;
  bumps: number;
  honks: number;
  wrecked: boolean;
}
// NOTE: `speed`/`weight` are deliberately absent. CONTENT_SPEC makes SPEED a felt, discrete
// meter that debuts at W3M2, and weight only exists once grab() lands in W3. In World 1 weight
// is always 0, so any speed model here would be untested fiction. Reintroduced with the W3 plan.

export interface TraceEntry {
  tick: number;
  x: number;
  y: number;
  hazards: string[]; // e.g. ["mud"], ["pit"], [] — cell kinds the bot is currently on/in
}

export interface SimResult {
  cleared: boolean;
  stars: number;         // 1-3, computed from bonusStar + parLines vs. actual source lines
  ticks: number;
  trace: TraceEntry[];
  finalState: BotState;
}

export type CommandName = "forward" | "back" | "left" | "right" | "honk";
export interface Command { name: CommandName; args: number[]; }
```

```ts
// src/sim/engine.ts
export interface Sim {
  /** Executes one command to completion (may span multiple ticks, e.g. mud). Returns void for
   *  W1's motion/honk commands; later worlds' sensor commands return their reading here. */
  execute(cmd: Command): unknown;
  state(): Readonly<BotState>;
  trace(): readonly TraceEntry[];
  isCleared(): boolean;
}

export function createSim(mission: Mission): Sim;
```

`createSim` owns all physics: mud costs 2 ticks/square, wall/crate/steel collision costs `-15`
score/`-8` armor and doesn't move the bot, pit entry costs `-40` score + tow, honk-gates open
permanently once honked from their pad, `honk()` on the beacon satisfies the bonus-star
condition. Only the behaviors World 1's six missions actually use are implemented in this
plan; `grab/drop/fire/radar/touch/...` get typed in `CommandName`'s eventual full union (§4
below) but are NOT implemented until the plans that need them, per §1.2.

---

## 4. Full command surface (typed now, implemented incrementally)

CONTENT_SPEC §1 says the v1 API surface is complete and shouldn't be casually extended, so the
type union is worth locking in now even though this plan only implements the World-1 slice of
it:

```ts
export type CommandName =
  | "forward" | "back" | "left" | "right" | "boost"          // motion
  | "honk" | "grab" | "drop" | "fire" | "dropChaff"
  | "grapple" | "mortar"                                      // actions
  | "radar" | "touch" | "position" | "heading" | "status"
  | "coins" | "carrying";                                     // sensors (no tick cost)
```

This plan implements `forward | back | left | right | honk`. Everything else throws
`"not implemented yet"` from `commands.ts` until its corresponding world plan lands —
explicit and typed, not a silent no-op.

---

## 5. Kid-code transform (World 1 grammar subset)

Two passes, run in the main thread before the code ever reaches the Worker (parse errors are
reported here, as kid-worded messages, before anything executes):

**Pass 1 — textual `repeat` desugar** (`transform.ts:desugarRepeat`): a brace-matching scan
(not regex — nesting must be handled correctly) rewrites
`repeat <expr> { <body> }` → `for (let i = 0; i < (<expr>); i++) { <body> }`. Runs before
parsing because `repeat n { }` isn't valid JavaScript syntax.

**Pass 2 — generator transform** (`transform.ts:toGenerator`, via `acorn` + `astring`): parses
the desugared source, wraps the program body as `function* __main() { ... }`, and rewrites
every top-level `ExpressionStatement` whose expression is a `CallExpression` to a known API
name into `yield __call("name", [args])`. Everything else (the `for` loop shell from Pass 1,
blocks) passes through untouched — generators support `yield` inside `for` bodies natively.

Example, W1M1's author solution:

```js
// input (author solution from CONTENT_SPEC §4 W1M1)
forward(2); left(); forward(3); right(); forward(5); honk();
```

```js
// output of Pass 2 (conceptually; astring emits equivalent JS)
function* __main() {
  yield __call("forward", [2]);
  yield __call("left", []);
  yield __call("forward", [3]);
  yield __call("right", []);
  yield __call("forward", [5]);
  yield __call("honk", []);
}
```

`driver.ts` compiles this via `new Function("__call", "return " + generatedSource + " __main;")`
executed inside the Worker (so the kid's code only ever sees `__call` and nothing else from
the outer scope), then steps it:

```ts
function run(mission: Mission, compiledMain: () => Generator<Command, void, unknown>) {
  const sim = createSim(mission);
  const gen = compiledMain();
  let step = gen.next();
  let stepsUsed = 0;
  const MAX_STEPS = 5000; // per-tick step budget guard against infinite loops
  while (!step.done) {
    if (++stepsUsed > MAX_STEPS) {
      throw new SandboxError("Your program ran for a very long time — check for a loop that never stops.");
    }
    const result = sim.execute(step.value);
    step = gen.next(result);
  }
  return { cleared: sim.isCleared(), trace: sim.trace(), finalState: sim.state() };
}
```

---

## 6. Mission & parts JSON schema (Zod)

```ts
// src/sim/missionSchema.ts
import { z } from "zod";

const Vec2Schema = z.object({ x: z.number().int(), y: z.number().int() });
const FacingSchema = z.enum(["N", "E", "S", "W"]);
const CellKindSchema = z.enum([
  "floor", "wall", "pit", "mud", "ice", "bush", "tree", "water", "repairPad", "spawnPad",
]);

export const ArenaSchema = z.object({
  cols: z.number().int().positive(),
  rows: z.number().int().positive(),
  cells: z.array(z.array(CellKindSchema)),
  crates: z.array(Vec2Schema),
  coins: z.array(Vec2Schema),
  chests: z.array(z.object({ id: z.string(), pos: Vec2Schema })),
  gates: z.array(z.object({
    pad: Vec2Schema,
    gateCells: z.array(Vec2Schema),
    open: z.boolean(),
  })),
  beacon: Vec2Schema,
  beaconRequiresFacing: FacingSchema.optional(),
});

export const MissionSchema = z.object({
  id: z.string(),
  world: z.number().int().min(1).max(8),
  index: z.number().int().min(1).max(6),
  teaches: z.string(),
  arena: ArenaSchema,
  start: z.object({ pos: Vec2Schema, facing: FacingSchema }),
  parLines: z.number().int().positive(),
  starterCode: z.string(),
  hints: z.array(z.string()).length(3),
  briefing: z.string(),
  authorSolution: z.string(),
  bonusStar: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("honkOnBeacon") }),
    z.object({ kind: z.literal("zeroBumps") }),
    z.object({ kind: z.literal("exactHonks"), count: z.number().int().positive() }),
  ]),
  unlock: z.object({ part: z.string(), cost: z.number().int().nonnegative() }).optional(),
});
export type Mission = z.infer<typeof MissionSchema>;

export const PartSchema = z.object({
  name: z.string(),
  slot: z.enum(["blaster", "blasterMod", "sidePod", "gizmo", "treads", "core"]),
  weight: z.number().int().nonnegative(),
  grants: z.string(),
  teaches: z.string().optional(),
  tradeoff: z.string().optional(),
  unlockedBy: z.string(),
  costC: z.number().int().nonnegative(),
});
export type Part = z.infer<typeof PartSchema>;
```

`content/missions/world1/m1.json` is authored directly from CONTENT_SPEC §4 W1M1: 9×6 arena,
start `(0,4)` facing `E`, beacon `(7,1)`, crates at `(3,4)(4,4)(5,4)(7,3)`, mud at
`(1,2)(1,3)`, `parLines: 6`, `bonusStar: { kind: "honkOnBeacon" }`,
`authorSolution: "forward(2); left(); forward(3); right(); forward(5); honk();"`.

---

## 7. Test strategy & trace mode

- **Unit tests** (`tests/sim/*`): physics (weight→speed, mud tick cost, wall/crate collision
  penalty, honk-gate open-on-pad), arena (in-bounds, cell lookup), commands (each of
  forward/back/left/right/honk in isolation).
- **Golden test** (`tests/golden/world1.test.ts`): loads `content/missions/world1/m1.json`
  through `MissionSchema.parse`, runs it through the *exact same* transform + driver + sandbox
  path the real game uses (not a shortcut sim call), asserts `cleared === true`,
  `stars === 3` (par met + honk-on-beacon bonus), and that the trace's final `{x,y}` matches
  the beacon. This is the proof that content, schema, transform, and sim core all agree.
- **Interleaving de-risk test** (`tests/sandbox/transform.test.ts`, per §1.2): a synthetic
  generator — not tied to any mission — where a fake `tick()` API call is made twice inside a
  `repeat 2 { }` loop; asserts the two returned values differ, proving the driver actually
  resumes the generator with fresh state per call rather than batching the whole script before
  executing anything.
- **Par-recompute smoke check** (folded into the golden test for now, CONTENT_SPEC §10 #9):
  the golden test asserts the author solution's line count is `<= mission.parLines`, using the
  exact same `countCodeLines` (`sandbox/lines.ts`) that the runtime scores stars with — one
  counter, imported in both places, so the test can't validate a different notion of "a line"
  than the game rewards. Content drift between this file and CONTENT_SPEC is caught immediately.
  A dedicated `scripts/verify-pars.ts` that does this across every mission file is Phase 2 scope,
  once more than one mission exists.
- **Trace mode** (CONTENT_SPEC §10 #2): `sim.trace()` already returns `{tick, x, y, hazards}[]`
  from every `execute()` call in this plan — the plumbing CONTENT_SPEC asks for exists from
  day one. It has nothing timing-critical to prove yet (W1 has no windmill/patrol); the W2M6
  and W4M6 boss missions that actually need tick-phase verification arrive in later plans and
  will consume this same `trace()` output.

---

## 8. Deferred to later plans (explicitly out of scope here)

- World 1 missions M2–M6 (content only — same schema, same engine, no new mechanics needed).
- Mission shell UI (BRIEF → CODE → RUN → RESULT), CodeMirror 6 editor + kid-worded lint
  surfacing, HUD (SCORE/ARMOR/SPEED/CHARGE meters), sound (Howler.js + jsfxr).
- Phaser 3 view/scenes.
- bot.json read/write (Bot Maker screen).
- Events/`when` blocks, sensors (`radar/touch/position/heading/status/coins/carrying`),
  `grab/drop/fire` and the rest of the `CommandName` union — arrive with Worlds 3–4's plan,
  which is also where the multi-thread (main-script + event-handler) cooperative scheduler
  gets built, once there are real missions to prove it against.
- Remix-mission validator (CONTENT_SPEC §10 #8) and the cross-mission `verify-pars.ts` script
  (§10 #9).

---

## 9. Tasks

### Task 1: Sub-app scaffold

**Files:**
- Create: `projects/codebots/app/package.json`
- Create: `projects/codebots/app/tsconfig.json`
- Create: `projects/codebots/app/vite.config.ts`
- Create: `projects/codebots/app/vitest.config.ts`
- Create: `projects/codebots/app/.gitignore`
- Modify: `vite.config.ts:23` (root) — add codebots dev-plugin entry
- Modify: `src/ssr-renderer.tsx:878` (root) — add codebots to `standaloneFolders`

**Interfaces:**
- Produces: a working `pnpm install && pnpm test` (inside the sub-app) and `pnpm build`
  producing `projects/codebots/app/dist/`.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "codebots",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run"
  },
  "dependencies": {},
  "devDependencies": {
    "acorn": "^8.15.0",
    "astring": "^1.9.0",
    "typescript": "^5.9.0",
    "vite": "^7.0.0",
    "vitest": "^3.0.0",
    "zod": "^3.24.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "WebWorker"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```ts
import { defineConfig } from "vite";

export default defineConfig({
  base: "/codebots/",
  build: { outDir: "dist" },
});
```

- [ ] **Step 4: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node" },
});
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
dist/
```

- [ ] **Step 6: Install dependencies**

Run: `cd projects/codebots/app && pnpm install`
Expected: lockfile created, `node_modules/` present, no errors.

- [ ] **Step 7: Wire the root site's dev plugin**

In `vite.config.ts` (repo root), add after the `judgement` line:

```ts
staticFolderDevPlugin("/codebots", path.join(__dirname, "projects/codebots/app/dist")),
```

- [ ] **Step 8: Wire the root site's production copy**

In `src/ssr-renderer.tsx`, add to the `standaloneFolders` array (~line 875):

```ts
{ source: "projects/codebots/app/dist", destinations: ["dist/codebots"] },
```

- [ ] **Step 9: Commit**

```bash
git add projects/codebots/app/package.json projects/codebots/app/tsconfig.json \
  projects/codebots/app/vite.config.ts projects/codebots/app/vitest.config.ts \
  projects/codebots/app/.gitignore vite.config.ts src/ssr-renderer.tsx
git commit -m "feat(codebots): scaffold self-contained sub-app"
```

### Task 2: Sim-core types and arena model

**Files:**
- Create: `projects/codebots/app/src/sim/types.ts`
- Create: `projects/codebots/app/src/sim/arena.ts`
- Test: `projects/codebots/app/tests/sim/arena.test.ts`

**Interfaces:**
- Consumes: nothing (foundation layer).
- Produces: `Vec2`, `Facing`, `CellKind`, `Arena`, `BotState`, `TraceEntry`, `SimResult`,
  `Command`, `CommandName` (types.ts); `cellAt(arena, pos): CellKind`,
  `inBounds(arena, pos): boolean`, `stepFacing(pos, facing): Vec2` (arena.ts) — used by every
  later task.

- [ ] **Step 1: Write the failing test**

```ts
// tests/sim/arena.test.ts
import { describe, it, expect } from "vitest";
import { cellAt, inBounds, stepFacing } from "../../src/sim/arena";
import type { Arena } from "../../src/sim/types";

const arena: Arena = {
  cols: 3, rows: 3,
  cells: [
    ["floor", "floor", "floor"],
    ["floor", "wall", "floor"],
    ["floor", "floor", "floor"],
  ],
  crates: [], coins: [], chests: [], gates: [],
  beacon: { x: 2, y: 2 },
};

describe("arena", () => {
  it("looks up cell kind by position", () => {
    expect(cellAt(arena, { x: 1, y: 1 })).toBe("wall");
    expect(cellAt(arena, { x: 0, y: 0 })).toBe("floor");
  });

  it("reports in-bounds correctly", () => {
    expect(inBounds(arena, { x: 2, y: 2 })).toBe(true);
    expect(inBounds(arena, { x: 3, y: 0 })).toBe(false);
    expect(inBounds(arena, { x: 0, y: -1 })).toBe(false);
  });

  it("steps a position one square in a facing direction", () => {
    expect(stepFacing({ x: 1, y: 1 }, "E")).toEqual({ x: 2, y: 1 });
    expect(stepFacing({ x: 1, y: 1 }, "N")).toEqual({ x: 1, y: 0 });
    expect(stepFacing({ x: 1, y: 1 }, "S")).toEqual({ x: 1, y: 2 });
    expect(stepFacing({ x: 1, y: 1 }, "W")).toEqual({ x: 0, y: 1 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/codebots/app && pnpm test tests/sim/arena.test.ts`
Expected: FAIL — `Cannot find module '../../src/sim/arena'`

- [ ] **Step 3: Write types.ts**

```ts
// src/sim/types.ts
export type Facing = "N" | "E" | "S" | "W";
export interface Vec2 { x: number; y: number; }

export type CellKind =
  | "floor" | "wall" | "pit" | "mud" | "ice" | "bush" | "tree" | "water"
  | "repairPad" | "spawnPad";

export interface GateSpec {
  pad: Vec2;
  gateCells: Vec2[];
  open: boolean;
}

export interface Arena {
  cols: number;
  rows: number;
  cells: CellKind[][];
  crates: Vec2[];
  coins: Vec2[];
  chests: { id: string; pos: Vec2 }[];
  gates: GateSpec[];
  beacon: Vec2;
  beaconRequiresFacing?: Facing;
}

export interface BotState {
  pos: Vec2;
  facing: Facing;
  armor: number;
  score: number;
  bumps: number;
  honks: number;
  wrecked: boolean;
}

export interface TraceEntry {
  tick: number;
  x: number;
  y: number;
  hazards: string[];
}

export interface SimResult {
  cleared: boolean;
  stars: number;
  ticks: number;
  trace: TraceEntry[];
  finalState: BotState;
}

export type CommandName =
  | "forward" | "back" | "left" | "right" | "boost"
  | "honk" | "grab" | "drop" | "fire" | "dropChaff"
  | "grapple" | "mortar"
  | "radar" | "touch" | "position" | "heading" | "status"
  | "coins" | "carrying";

export interface Command { name: CommandName; args: number[]; }
```

- [ ] **Step 4: Write arena.ts**

```ts
// src/sim/arena.ts
import type { Arena, Vec2, Facing, CellKind } from "./types";

export function inBounds(arena: Arena, pos: Vec2): boolean {
  return pos.x >= 0 && pos.x < arena.cols && pos.y >= 0 && pos.y < arena.rows;
}

export function cellAt(arena: Arena, pos: Vec2): CellKind {
  return arena.cells[pos.y][pos.x];
}

const FACING_DELTA: Record<Facing, Vec2> = {
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 },
};

export function stepFacing(pos: Vec2, facing: Facing): Vec2 {
  const d = FACING_DELTA[facing];
  return { x: pos.x + d.x, y: pos.y + d.y };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd projects/codebots/app && pnpm test tests/sim/arena.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add projects/codebots/app/src/sim/types.ts projects/codebots/app/src/sim/arena.ts \
  projects/codebots/app/tests/sim/arena.test.ts
git commit -m "feat(codebots): sim-core types and arena grid model"
```

### Task 3: Physics — weight, speed, movement resolution, collisions

**Files:**
- Create: `projects/codebots/app/src/sim/physics.ts`
- Test: `projects/codebots/app/tests/sim/physics.test.ts`

**Interfaces:**
- Consumes: `Arena`, `BotState`, `Vec2`, `Facing`, `cellAt`, `inBounds`, `stepFacing` (Task 2).
- Produces: `resolveMove(arena, state, facing, squares): { state: BotState; ticksSpent: number }`
  — used by `commands.ts` (Task 4).

- [ ] **Step 1: Write the failing test**

```ts
// tests/sim/physics.test.ts
import { describe, it, expect } from "vitest";
import { resolveMove } from "../../src/sim/physics";
import type { Arena, BotState } from "../../src/sim/types";

const baseState = (): BotState => ({
  pos: { x: 0, y: 0 }, facing: "E", armor: 100,
  score: 0, bumps: 0, honks: 0, wrecked: false,
});

describe("physics", () => {
  it("moves forward one square on floor at 1 tick", () => {
    const arena: Arena = {
      cols: 3, rows: 1, cells: [["floor", "floor", "floor"]],
      crates: [], coins: [], chests: [], gates: [], beacon: { x: 2, y: 0 },
    };
    const { state, ticksSpent } = resolveMove(arena, baseState(), "E", 1);
    expect(state.pos).toEqual({ x: 1, y: 0 });
    expect(ticksSpent).toBe(1);
  });

  // Deliberate: W1M1's author path never enters its mud cells (matches the CONTENT_SPEC §4
  // trace note), so the golden test can't exercise mud. This isolated unit test is the ONLY
  // thing verifying mud tick-cost in this slice — a conscious call for a one-mission foundation,
  // not an oversight. The first mission whose solution crosses mud (W2M4) will add a golden path.
  it("costs 2 ticks per square crossing mud", () => {
    const arena: Arena = {
      cols: 3, rows: 1, cells: [["floor", "mud", "floor"]],
      crates: [], coins: [], chests: [], gates: [], beacon: { x: 2, y: 0 },
    };
    const { ticksSpent } = resolveMove(arena, baseState(), "E", 1);
    expect(ticksSpent).toBe(2);
  });

  it("stops before a wall and penalizes score/armor", () => {
    const arena: Arena = {
      cols: 3, rows: 1, cells: [["floor", "wall", "floor"]],
      crates: [], coins: [], chests: [], gates: [], beacon: { x: 2, y: 0 },
    };
    const { state } = resolveMove(arena, baseState(), "E", 1);
    expect(state.pos).toEqual({ x: 0, y: 0 });
    expect(state.score).toBe(-15);
    expect(state.armor).toBe(92);
    expect(state.bumps).toBe(1);
  });

  it("stops before a crate the same as a wall", () => {
    const arena: Arena = {
      cols: 3, rows: 1, cells: [["floor", "floor", "floor"]],
      crates: [{ x: 1, y: 0 }], coins: [], chests: [], gates: [], beacon: { x: 2, y: 0 },
    };
    const { state } = resolveMove(arena, baseState(), "E", 1);
    expect(state.pos).toEqual({ x: 0, y: 0 });
    expect(state.bumps).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/codebots/app && pnpm test tests/sim/physics.test.ts`
Expected: FAIL — `Cannot find module '../../src/sim/physics'`

- [ ] **Step 3: Write physics.ts**

```ts
// src/sim/physics.ts
import { cellAt, inBounds, stepFacing } from "./arena";
import type { Arena, BotState, Facing } from "./types";

function isBlocked(arena: Arena, pos: { x: number; y: number }): boolean {
  if (!inBounds(arena, pos)) return true;
  if (cellAt(arena, pos) === "wall") return true;
  return arena.crates.some((c) => c.x === pos.x && c.y === pos.y);
}

/** Moves up to `squares` in `facing`, stopping at the first obstacle. Mud costs 2 ticks/sq. */
export function resolveMove(
  arena: Arena,
  state: BotState,
  facing: Facing,
  squares: number,
): { state: BotState; ticksSpent: number } {
  let pos = state.pos;
  let ticksSpent = 0;
  let bumps = state.bumps;
  let score = state.score;
  let armor = state.armor;

  for (let i = 0; i < squares; i++) {
    const next = stepFacing(pos, facing);
    if (isBlocked(arena, next)) {
      score -= 15;
      armor = Math.max(0, armor - 8);
      bumps += 1;
      break;
    }
    pos = next;
    ticksSpent += cellAt(arena, pos) === "mud" ? 2 : 1;
  }

  return {
    state: { ...state, pos, facing, bumps, score, armor },
    ticksSpent: ticksSpent || 1, // a blocked attempt still costs the tick it took to try
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd projects/codebots/app && pnpm test tests/sim/physics.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add projects/codebots/app/src/sim/physics.ts projects/codebots/app/tests/sim/physics.test.ts
git commit -m "feat(codebots): movement/collision physics"
```

### Task 4: Commands and engine (createSim)

**Files:**
- Create: `projects/codebots/app/src/sim/commands.ts`
- Create: `projects/codebots/app/src/sim/trace.ts`
- Create: `projects/codebots/app/src/sim/engine.ts`
- Test: `projects/codebots/app/tests/sim/engine.test.ts`

**Interfaces:**
- Consumes: `Arena`, `BotState`, `Command`, `resolveMove` (Tasks 2–3);
  `Mission` type (defined inline here, formalized with Zod in Task 5).
- Produces: `createSim(mission): Sim` with `execute(cmd): unknown`, `state(): BotState`,
  `trace(): TraceEntry[]`, `isCleared(): boolean` — consumed by the driver (Task 6) and the
  golden test (Task 7).

- [ ] **Step 1: Write the failing test**

```ts
// tests/sim/engine.test.ts
import { describe, it, expect } from "vitest";
import { createSim } from "../../src/sim/engine";
import type { Arena } from "../../src/sim/types";

const arena: Arena = {
  cols: 9, rows: 6,
  cells: Array.from({ length: 6 }, () => Array(9).fill("floor")),
  crates: [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 7, y: 3 }],
  coins: [], chests: [], gates: [],
  beacon: { x: 7, y: 1 },
};
arena.cells[2][1] = "mud";
arena.cells[3][1] = "mud";

function makeMission() {
  return {
    id: "test", world: 1, index: 1, teaches: "sequencing",
    arena, start: { pos: { x: 0, y: 4 }, facing: "E" as const },
    parLines: 6, starterCode: "", hints: ["", "", ""], briefing: "",
    authorSolution: "forward(2); left(); forward(3); right(); forward(5); honk();",
    bonusStar: { kind: "honkOnBeacon" as const },
  };
}

describe("engine", () => {
  it("clears W1M1 with the author solution's move sequence", () => {
    const sim = createSim(makeMission());
    sim.execute({ name: "forward", args: [2] });
    sim.execute({ name: "left", args: [] });
    sim.execute({ name: "forward", args: [3] });
    sim.execute({ name: "right", args: [] });
    sim.execute({ name: "forward", args: [5] });
    sim.execute({ name: "honk", args: [] });
    expect(sim.state().pos).toEqual({ x: 7, y: 1 });
    expect(sim.isCleared()).toBe(true);
  });

  it("records a trace entry per executed command", () => {
    const sim = createSim(makeMission());
    sim.execute({ name: "forward", args: [2] });
    expect(sim.trace().length).toBeGreaterThan(0);
    expect(sim.trace().at(-1)).toMatchObject({ x: 2, y: 4 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/codebots/app && pnpm test tests/sim/engine.test.ts`
Expected: FAIL — `Cannot find module '../../src/sim/engine'`

- [ ] **Step 3: Write trace.ts**

```ts
// src/sim/trace.ts
import type { Arena, BotState, TraceEntry } from "./types";
import { cellAt } from "./arena";

export function recordTrace(arena: Arena, state: BotState, tick: number): TraceEntry {
  const kind = cellAt(arena, state.pos);
  return { tick, x: state.pos.x, y: state.pos.y, hazards: kind === "floor" ? [] : [kind] };
}
```

- [ ] **Step 4: Write commands.ts**

```ts
// src/sim/commands.ts
import { resolveMove } from "./physics";
import type { Arena, BotState, Command, Facing } from "./types";

const TURN_LEFT: Record<Facing, Facing> = { N: "W", W: "S", S: "E", E: "N" };
const TURN_RIGHT: Record<Facing, Facing> = { N: "E", E: "S", S: "W", W: "N" };

export function executeCommand(
  arena: Arena,
  state: BotState,
  cmd: Command,
): { state: BotState; ticksSpent: number } {
  switch (cmd.name) {
    case "forward":
      return resolveMove(arena, state, state.facing, cmd.args[0] ?? 1);
    case "back": {
      const reverseFacing: Record<Facing, Facing> = { N: "S", S: "N", E: "W", W: "E" };
      const opposite = reverseFacing[state.facing];
      const { state: moved, ticksSpent } = resolveMove(arena, state, opposite, cmd.args[0] ?? 1);
      return { state: { ...moved, facing: state.facing }, ticksSpent };
    }
    case "left":
      return { state: { ...state, facing: TURN_LEFT[state.facing] }, ticksSpent: 1 };
    case "right":
      return { state: { ...state, facing: TURN_RIGHT[state.facing] }, ticksSpent: 1 };
    case "honk":
      return { state: { ...state, honks: state.honks + 1 }, ticksSpent: 1 };
    default:
      throw new Error(`"${cmd.name}" isn't implemented yet`);
  }
}
```

- [ ] **Step 5: Write engine.ts**

```ts
// src/sim/engine.ts
import { executeCommand } from "./commands";
import { recordTrace } from "./trace";
import type { Command, BotState, TraceEntry } from "./types";

export interface Mission {
  id: string;
  world: number;
  index: number;
  teaches: string;
  arena: import("./types").Arena;
  start: { pos: import("./types").Vec2; facing: import("./types").Facing };
  parLines: number;
  starterCode: string;
  hints: string[];
  briefing: string;
  authorSolution: string;
  bonusStar:
    | { kind: "honkOnBeacon" }
    | { kind: "zeroBumps" }
    | { kind: "exactHonks"; count: number };
  unlock?: { part: string; cost: number };
}

export interface Sim {
  execute(cmd: Command): unknown;
  state(): Readonly<BotState>;
  trace(): readonly TraceEntry[];
  isCleared(): boolean;
}

export function createSim(mission: Mission): Sim {
  const arena = mission.arena;
  let state: BotState = {
    pos: mission.start.pos,
    facing: mission.start.facing,
    armor: 100,
    score: 0,
    bumps: 0,
    honks: 0,
    wrecked: false,
  };
  let tick = 0;
  const trace: TraceEntry[] = [recordTrace(arena, state, tick)];

  function atBeacon(): boolean {
    const onBeacon = state.pos.x === arena.beacon.x && state.pos.y === arena.beacon.y;
    if (!onBeacon) return false;
    if (arena.beaconRequiresFacing) return state.facing === arena.beaconRequiresFacing;
    return true;
  }

  return {
    execute(cmd: Command) {
      const { state: next, ticksSpent } = executeCommand(arena, state, cmd);
      state = next;
      for (let i = 0; i < ticksSpent; i++) {
        tick += 1;
        trace.push(recordTrace(arena, state, tick));
      }
      return undefined;
    },
    state: () => state,
    trace: () => trace,
    isCleared: () => atBeacon(),
  };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd projects/codebots/app && pnpm test tests/sim/engine.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add projects/codebots/app/src/sim/commands.ts projects/codebots/app/src/sim/trace.ts \
  projects/codebots/app/src/sim/engine.ts projects/codebots/app/tests/sim/engine.test.ts
git commit -m "feat(codebots): commands, trace recorder, and sim engine"
```

### Task 5: Mission/part Zod schema + W1M1 content JSON

**Files:**
- Create: `projects/codebots/app/src/sim/missionSchema.ts`
- Create: `projects/codebots/app/content/missions/world1/m1.json`
- Test: `projects/codebots/app/tests/sim/missionSchema.test.ts`

**Interfaces:**
- Consumes: none beyond `zod`.
- Produces: `MissionSchema`, `Mission` (Zod-inferred type — this becomes the canonical
  `Mission` type; Task 4's inline `Mission` interface is a structural match, not a duplicate
  source of truth going forward), `ArenaSchema`, `PartSchema`, `Part` — consumed by the
  content loader in Task 7's golden test.

- [ ] **Step 1: Write the failing test**

```ts
// tests/sim/missionSchema.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MissionSchema } from "../../src/sim/missionSchema";

describe("MissionSchema", () => {
  it("parses W1M1's authored content JSON", () => {
    const raw = JSON.parse(
      readFileSync(new URL("../../content/missions/world1/m1.json", import.meta.url), "utf-8"),
    );
    const mission = MissionSchema.parse(raw);
    expect(mission.id).toBe("w1m1");
    expect(mission.arena.beacon).toEqual({ x: 7, y: 1 });
  });

  it("rejects a mission missing a required field", () => {
    expect(() => MissionSchema.parse({ id: "bad" })).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/codebots/app && pnpm test tests/sim/missionSchema.test.ts`
Expected: FAIL — module and content file don't exist yet

- [ ] **Step 3: Write missionSchema.ts**

```ts
// src/sim/missionSchema.ts
import { z } from "zod";

const Vec2Schema = z.object({ x: z.number().int(), y: z.number().int() });
const FacingSchema = z.enum(["N", "E", "S", "W"]);
const CellKindSchema = z.enum([
  "floor", "wall", "pit", "mud", "ice", "bush", "tree", "water", "repairPad", "spawnPad",
]);

export const ArenaSchema = z.object({
  cols: z.number().int().positive(),
  rows: z.number().int().positive(),
  cells: z.array(z.array(CellKindSchema)),
  crates: z.array(Vec2Schema),
  coins: z.array(Vec2Schema),
  chests: z.array(z.object({ id: z.string(), pos: Vec2Schema })),
  gates: z.array(z.object({
    pad: Vec2Schema,
    gateCells: z.array(Vec2Schema),
    open: z.boolean(),
  })),
  beacon: Vec2Schema,
  beaconRequiresFacing: FacingSchema.optional(),
});

export const MissionSchema = z.object({
  id: z.string(),
  world: z.number().int().min(1).max(8),
  index: z.number().int().min(1).max(6),
  teaches: z.string(),
  arena: ArenaSchema,
  start: z.object({ pos: Vec2Schema, facing: FacingSchema }),
  parLines: z.number().int().positive(),
  starterCode: z.string(),
  hints: z.array(z.string()).length(3),
  briefing: z.string(),
  authorSolution: z.string(),
  bonusStar: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("honkOnBeacon") }),
    z.object({ kind: z.literal("zeroBumps") }),
    z.object({ kind: z.literal("exactHonks"), count: z.number().int().positive() }),
  ]),
  unlock: z.object({ part: z.string(), cost: z.number().int().nonnegative() }).optional(),
});
export type Mission = z.infer<typeof MissionSchema>;

export const PartSchema = z.object({
  name: z.string(),
  slot: z.enum(["blaster", "blasterMod", "sidePod", "gizmo", "treads", "core"]),
  weight: z.number().int().nonnegative(),
  grants: z.string(),
  teaches: z.string().optional(),
  tradeoff: z.string().optional(),
  unlockedBy: z.string(),
  costC: z.number().int().nonnegative(),
});
export type Part = z.infer<typeof PartSchema>;
```

- [ ] **Step 4: Author content/missions/world1/m1.json from CONTENT_SPEC §4 W1M1**

```json
{
  "id": "w1m1",
  "world": 1,
  "index": 1,
  "teaches": "sequencing",
  "arena": {
    "cols": 9,
    "rows": 6,
    "cells": [
      ["floor","floor","floor","floor","floor","floor","floor","floor","floor"],
      ["floor","floor","floor","floor","floor","floor","floor","floor","floor"],
      ["floor","mud","floor","floor","floor","floor","floor","floor","floor"],
      ["floor","mud","floor","floor","floor","floor","floor","floor","floor"],
      ["floor","floor","floor","floor","floor","floor","floor","floor","floor"],
      ["floor","floor","floor","floor","floor","floor","floor","floor","floor"]
    ],
    "crates": [
      { "x": 3, "y": 4 }, { "x": 4, "y": 4 }, { "x": 5, "y": 4 }, { "x": 7, "y": 3 }
    ],
    "coins": [],
    "chests": [],
    "gates": [],
    "beacon": { "x": 7, "y": 1 }
  },
  "start": { "pos": { "x": 0, "y": 4 }, "facing": "E" },
  "parLines": 6,
  "starterCode": "// Wake up! forward(1) rolls 1 square.\nforward(1)",
  "hints": [
    "Count squares before the crates.",
    "forward(2), then face north — which turn is that?",
    "forward(2) left()"
  ],
  "briefing": "Rise and shine, Sparkplug. The pirates parked crates all over Dock 1. Roll to the beacon — the long way if you must, the smart way if you can.",
  "authorSolution": "forward(2); left(); forward(3); right(); forward(5); honk();",
  "bonusStar": { "kind": "honkOnBeacon" }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd projects/codebots/app && pnpm test tests/sim/missionSchema.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add projects/codebots/app/src/sim/missionSchema.ts \
  projects/codebots/app/content/missions/world1/m1.json \
  projects/codebots/app/tests/sim/missionSchema.test.ts
git commit -m "feat(codebots): mission/part Zod schema + W1M1 content"
```

### Task 6: Kid-code transform (repeat-desugar + generator) and the interleaving de-risk test

**Files:**
- Create: `projects/codebots/app/src/sandbox/transform.ts`
- Test: `projects/codebots/app/tests/sandbox/transform.test.ts`

**Interfaces:**
- Consumes: `acorn`, `astring` (npm deps from Task 1).
- Produces: `desugarRepeat(source: string): string`,
  `toGeneratorSource(source: string, apiNames: string[]): string` — consumed by the driver
  (Task 7).

- [ ] **Step 1: Write the failing test**

```ts
// tests/sandbox/transform.test.ts
import { describe, it, expect } from "vitest";
import { desugarRepeat, toGeneratorSource } from "../../src/sandbox/transform";

describe("desugarRepeat", () => {
  it("rewrites repeat n { } to a for loop", () => {
    const out = desugarRepeat("repeat 4 { forward(3) left() }");
    expect(out).toBe("for (let i = 0; i < (4); i++) { forward(3) left() }");
  });

  it("handles nested braces inside the body", () => {
    const out = desugarRepeat("repeat 2 { if (true) { honk() } }");
    expect(out).toContain("for (let i = 0; i < (2); i++)");
    expect(out).toContain("if (true) { honk() }");
  });
});

describe("toGeneratorSource", () => {
  const API = ["forward", "left", "right", "back", "honk"];

  it("wraps the program in a generator and yields known API calls", () => {
    const src = toGeneratorSource("forward(2); left(); honk();", API);
    const compiled = new Function(
      "__call",
      `${src}\nreturn __main;`,
    )((name: string, args: unknown[]) => ({ name, args }));
    const gen = compiled();
    expect(gen.next().value).toEqual({ name: "forward", args: [2] });
    expect(gen.next().value).toEqual({ name: "left", args: [] });
    expect(gen.next().value).toEqual({ name: "honk", args: [] });
    expect(gen.next().done).toBe(true);
  });

  it("proves the generator interleaves: a fake sensor call reflects driver-resumed state, not a batched snapshot", () => {
    const src = toGeneratorSource("for (let i = 0; i < 2; i++) { where(); }", ["where"]);
    const compiled = new Function("__call", `${src}\nreturn __main;`)(
      (name: string, args: unknown[]) => ({ name, args }),
    );
    const gen = compiled();
    let tick = 0;
    const seen: unknown[] = [];
    let step = gen.next();
    while (!step.done) {
      tick += 1; // driver "advances the sim" between each resumption
      seen.push(tick);
      step = gen.next(tick);
    }
    expect(seen).toEqual([1, 2]); // two distinct resumptions, not one batched pass
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/codebots/app && pnpm test tests/sandbox/transform.test.ts`
Expected: FAIL — `Cannot find module '../../src/sandbox/transform'`

- [ ] **Step 3: Write transform.ts**

```ts
// src/sandbox/transform.ts
import { parse } from "acorn";
import { generate } from "astring";
import type { Node, ExpressionStatement, CallExpression, Identifier } from "estree";

/** Textually rewrites `repeat <expr> { <body> }` to a `for` loop. Brace-matched, not regex,
 *  so nested `{ }` in the body (from if/else, later worlds) don't break the scan. */
export function desugarRepeat(source: string): string {
  const REPEAT = /repeat\s+/g;
  let match: RegExpExecArray | null;
  let out = source;

  while ((match = REPEAT.exec(out)) !== null) {
    const afterKeyword = match.index + match[0].length;
    const braceOpen = out.indexOf("{", afterKeyword);
    if (braceOpen === -1) break;
    const expr = out.slice(afterKeyword, braceOpen).trim();

    let depth = 0;
    let braceClose = -1;
    for (let i = braceOpen; i < out.length; i++) {
      if (out[i] === "{") depth++;
      if (out[i] === "}") {
        depth--;
        if (depth === 0) { braceClose = i; break; }
      }
    }
    if (braceClose === -1) break;

    const body = out.slice(braceOpen, braceClose + 1);
    const replacement = `for (let i = 0; i < (${expr}); i++) ${body}`;
    out = out.slice(0, match.index) + replacement + out.slice(braceClose + 1);
    // Resume from where this match started, NOT 0. The replacement's leading `for (...)` holds
    // no `repeat`, so we skip the already-processed prefix while still catching any nested
    // `repeat` now sitting inside `body`. Setting lastIndex = 0 would re-scan the whole string
    // per replacement — O(n²) in the number of repeats. This keeps it linear.
    REPEAT.lastIndex = match.index;
  }

  return out;
}

/** Parses (already repeat-desugared) source and rewrites top-level calls to known API names
 *  into `yield __call(name, [args])` inside a `function* __main() { ... }` wrapper. */
export function toGeneratorSource(source: string, apiNames: string[]): string {
  const ast = parse(source, { ecmaVersion: 2022 }) as unknown as { body: Node[] };
  const known = new Set(apiNames);

  function isKnownCall(stmt: Node): stmt is ExpressionStatement {
    if (stmt.type !== "ExpressionStatement") return false;
    const expr = (stmt as ExpressionStatement).expression as CallExpression;
    return expr.type === "CallExpression" && expr.callee.type === "Identifier" &&
      known.has((expr.callee as Identifier).name);
  }

  function transformStatement(stmt: Node): Node {
    if (isKnownCall(stmt)) {
      const expr = (stmt as ExpressionStatement).expression as CallExpression;
      const name = (expr.callee as Identifier).name;
      return {
        type: "ExpressionStatement",
        expression: {
          type: "YieldExpression",
          delegate: false,
          argument: {
            type: "CallExpression",
            callee: { type: "Identifier", name: "__call" },
            arguments: [
              { type: "Literal", value: name },
              { type: "ArrayExpression", elements: expr.arguments },
            ],
            optional: false,
          },
        },
      } as unknown as Node;
    }
    if ((stmt as { body?: Node }).body && Array.isArray((stmt as { body: unknown }).body)) {
      const withBody = stmt as unknown as { body: Node[] };
      return { ...stmt, body: withBody.body.map(transformStatement) } as Node;
    }
    // ForStatement's body is a single statement/block, not an array — recurse into it too.
    const forLike = stmt as unknown as { body?: Node };
    if (forLike.body && !Array.isArray(forLike.body)) {
      return { ...stmt, body: transformStatement(forLike.body) } as Node;
    }
    return stmt;
  }

  const transformedBody = ast.body.map(transformStatement);
  const mainFn = {
    type: "FunctionDeclaration",
    id: { type: "Identifier", name: "__main" },
    generator: true,
    async: false,
    params: [],
    body: { type: "BlockStatement", body: transformedBody },
  };

  return generate(mainFn as unknown as Node);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd projects/codebots/app && pnpm test tests/sandbox/transform.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add projects/codebots/app/src/sandbox/transform.ts \
  projects/codebots/app/tests/sandbox/transform.test.ts
git commit -m "feat(codebots): repeat-desugar + generator transform, de-risk interleaving"
```

### Task 7: Driver + golden test replaying W1M1's author solution end-to-end

**Files:**
- Create: `projects/codebots/app/src/sandbox/lines.ts`
- Create: `projects/codebots/app/src/sandbox/driver.ts`
- Create: `projects/codebots/app/src/sandbox/errors.ts`
- Test: `projects/codebots/app/tests/golden/world1.test.ts`

**Interfaces:**
- Consumes: `desugarRepeat`, `toGeneratorSource` (Task 6); `createSim` (Task 4);
  `MissionSchema` (Task 5).
- Produces: `countCodeLines(source): number` (lines.ts — the ONE par line-counter, imported by
  both `driver.ts`'s star scoring and the golden test's drift check so they can't diverge);
  `runInSandbox(mission, source): SimResult` — this is the same path the real Worker entry
  (Phase 2) will call into; `driver.ts` has no Worker/postMessage code itself so it's directly
  unit-testable on the main thread here.

- [ ] **Step 1: Write the failing test**

```ts
// tests/golden/world1.test.ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MissionSchema } from "../../src/sim/missionSchema";
import { runInSandbox } from "../../src/sandbox/driver";
import { countCodeLines } from "../../src/sandbox/lines"; // SAME counter the runtime scores with

describe("World 1 Mission 1 — golden replay", () => {
  it("clears the mission running the author solution through the full sandbox path", () => {
    const raw = JSON.parse(
      readFileSync(new URL("../../content/missions/world1/m1.json", import.meta.url), "utf-8"),
    );
    const mission = MissionSchema.parse(raw);

    const result = runInSandbox(mission, mission.authorSolution);

    expect(result.cleared).toBe(true);
    expect(result.finalState.pos).toEqual(mission.arena.beacon);
    expect(result.stars).toBe(3); // complete + par met + honk-on-beacon bonus

    // CONTENT_SPEC §10 #9: catch content drift between this file and the spec's stated par.
    expect(countCodeLines(mission.authorSolution)).toBeLessThanOrEqual(mission.parLines);
  });

  it("aborts with a kid-worded error past the step budget", () => {
    const raw = JSON.parse(
      readFileSync(new URL("../../content/missions/world1/m1.json", import.meta.url), "utf-8"),
    );
    const mission = MissionSchema.parse(raw);
    expect(() => runInSandbox(mission, "repeat 999999 { forward(1) }")).toThrow(
      /ran for a very long time/,
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd projects/codebots/app && pnpm test tests/golden/world1.test.ts`
Expected: FAIL — `Cannot find module '../../src/sandbox/driver'`

- [ ] **Step 3: Write lines.ts**

```ts
// src/sandbox/lines.ts
/** Counts par-relevant lines: non-blank, non-comment. This is the SINGLE source of truth for
 *  line counting — the runtime's star scoring (driver.ts) and the golden test's par-drift check
 *  both import it, so the "did the author solution meet par" question is answered one way and
 *  the two can never silently diverge. (Code review point #4.) */
export function countCodeLines(source: string): number {
  return source
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("//")).length;
}
```

- [ ] **Step 4: Write errors.ts**

```ts
// src/sandbox/errors.ts
export class SandboxError extends Error {}
```

- [ ] **Step 5: Write driver.ts**

```ts
// src/sandbox/driver.ts
import { desugarRepeat, toGeneratorSource } from "./transform";
import { createSim, type Mission } from "../sim/engine";
import { SandboxError } from "./errors";
import { countCodeLines } from "./lines";
import type { Command } from "../sim/types";

const W1_API = ["forward", "back", "left", "right", "honk"];
const MAX_STEPS = 5000;

function computeStars(mission: Mission, source: string, cleared: boolean, finalState: { honks: number; bumps: number }): number {
  if (!cleared) return 0;
  let stars = 1; // complete
  if (countCodeLines(source) <= mission.parLines) stars += 1;
  if (mission.bonusStar.kind === "honkOnBeacon" && finalState.honks > 0) stars += 1;
  if (mission.bonusStar.kind === "zeroBumps" && finalState.bumps === 0) stars += 1;
  if (mission.bonusStar.kind === "exactHonks" && finalState.honks === mission.bonusStar.count) stars += 1;
  return stars;
}

export function runInSandbox(mission: Mission, source: string) {
  const desugared = desugarRepeat(source);
  const generatorSource = toGeneratorSource(desugared, W1_API);
  const compiled = new Function(
    "__call",
    `${generatorSource}\nreturn __main;`,
  )((name: string, args: unknown[]) => ({ name, args } as Command));

  const sim = createSim(mission);
  const gen: Generator<Command, void, unknown> = compiled();
  let step = gen.next();
  let stepsUsed = 0;

  while (!step.done) {
    if (++stepsUsed > MAX_STEPS) {
      throw new SandboxError(
        "Your program ran for a very long time — check for a loop that never stops.",
      );
    }
    const result = sim.execute(step.value);
    step = gen.next(result);
  }

  const finalState = sim.state();
  const cleared = sim.isCleared();
  return {
    cleared,
    stars: computeStars(mission, source, cleared, finalState),
    ticks: sim.trace().length,
    trace: sim.trace(),
    finalState,
  };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd projects/codebots/app && pnpm test tests/golden/world1.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 7: Run the full test suite**

Run: `cd projects/codebots/app && pnpm test`
Expected: all tests across Tasks 2–7 PASS.

- [ ] **Step 8: Commit**

```bash
git add projects/codebots/app/src/sandbox/lines.ts projects/codebots/app/src/sandbox/driver.ts \
  projects/codebots/app/src/sandbox/errors.ts projects/codebots/app/tests/golden/world1.test.ts
git commit -m "feat(codebots): sandbox driver + W1M1 golden test end-to-end"
```

---

## Self-review

- **Spec coverage:** repo structure ✓ (§2), sim-core API ✓ (§3–4), mission/part JSON schema ✓
  (§6, Task 5), test strategy ✓ (§7), trace mode ✓ (§7, built into `engine.ts` from Task 4).
  Deliberately not covered here (see §8, own plan): Worlds 1 missions 2–6, Mission shell/HUD/
  Phaser/CodeMirror/sound, bot.json, events/sensors, remix validator, par-recompute script.
- **Placeholder scan:** no TBD/TODO-style steps; `commands.ts`'s `default: throw` for
  unimplemented command names is an explicit typed boundary, not a vague placeholder, and every
  step that exists has complete, runnable code.
- **Type consistency:** `Mission` is defined twice on purpose in Task 4 (inline, to get the
  engine compiling standalone) and formalized via Zod in Task 5 — Task 5's step notes this
  explicitly and Task 5's `Mission` becomes the type every later task (6, 7) imports. `Sim`,
  `Command`, `BotState`, `TraceEntry` are defined once in `types.ts`/`engine.ts` and reused
  identically by name across Tasks 4, 6, 7.

- **Code review incorporated (round 1):** (1) cut `speed`/`weight`/`speedForWeight` from the
  slice — dead code encoding an undesigned speed model; SPEED/weight return with the W3 plan
  where they're felt. (2) mud coverage rests on one unit test because W1M1's path never enters
  mud (matches the CONTENT_SPEC trace) — annotated as a deliberate call, W2M4 adds a golden mud
  path. (3) `desugarRepeat` resumes at `match.index`, not `0` — linear instead of O(n²). (4)
  `countCodeLines` extracted to `sandbox/lines.ts`, imported by both `driver.ts` and the golden
  test so the par-drift check and star scoring can't diverge.
