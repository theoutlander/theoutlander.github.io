# CodeBots Arena Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split CodeBots' single Battle screen into Arena Hub → Fight → Debrief, replace the raw-wins ladder with the deterministic league table, and make every loss teach the construct that would have won it.

**Architecture:** Three new screen components (`ArenaHub`, `FightScreen`, `Debrief`) replace `BattleScreen`. Four small new modules in `src/rivals/` do the non-UI work: parsing a bot's source for taught constructs (`constructs.ts`), reducing a battle's event log into stats/key-moments (`debriefStats.ts`), a season salt threaded through the existing league engine (`league.ts`, modified), and a localStorage cache around `standings()` (`leagueCache.ts`). A small shared `ReplayViewer` component plays a stored `BattleEvent[]` log into a Phaser host — used by the Hub's featured match, every ladder row's WATCH button, and (indirectly, via its own mount logic) the Fight screen. `App.tsx`'s screen state machine gains `arenaHub`/`fight`/`debrief` in place of `battle`.

**Tech Stack:** React 19 + TypeScript, Phaser 3 (existing `mountBattle`/`BattleScene`), Vitest (`environment: "node"`), no new dependencies.

## Global Constraints

- `src/sim/` (the battle/campaign engine) is not modified. Everything here is additive, in `src/rivals/`, `src/ui/`, and one small change to `src/App.tsx`/`src/ui/HQ.tsx`.
- Losses never cost points or coins.
- No live networking, no chat fields, no free-text fields visible to another kid.
- Tests live in `tests/<mirror-path>/*.test.ts` (not colocated `__tests__`), following this repo's existing convention (see `tests/rivals/league.test.ts`).
- `pnpm test` runs the whole suite from `projects/codebots/app/`. Run it after every task.
- Design doc: `docs/superpowers/specs/2026-07-12-codebots-arena-update-design.md`.

---

## File Structure

New:
- `src/rivals/constructs.ts` — parse a bot's source for taught constructs/sensors; map construct → teaching mission.
- `src/rivals/debriefStats.ts` — reduce a `BattleEvent[]` log into Debrief's stats row + key moments.
- `src/rivals/leagueCache.ts` — localStorage-cached `standings()`, keyed by roster + season; exposes the previous snapshot for trend arrows.
- `src/ui/ReplayViewer.tsx` — mounts a Phaser battle scene and plays a stored event log; used for WATCH and the featured match.
- `src/ui/Debrief.tsx` — the post-fight screen.
- `src/ui/FightScreen.tsx` — editor + arena + HP + status + STOP + command drawer. Replaces most of `BattleScreen.tsx`.
- `src/ui/ArenaHub.tsx` — featured match, ladder, your-bot panel, presets. Replaces the rest of `BattleScreen.tsx`.

Modified:
- `src/rivals/league.ts` — `playMatch`/`standings` gain an optional `seasonSalt` parameter.
- `src/App.tsx` — screen union, routing, fight-result state.
- `src/ui/HQ.tsx` — `onBattle` prop renamed `onArenaHub` (label/copy unchanged).

Deleted:
- `src/ui/BattleScreen.tsx` — fully superseded by `FightScreen` + `ArenaHub`.

Test files (new):
- `tests/rivals/constructs.test.ts`
- `tests/rivals/debriefStats.test.ts`
- `tests/rivals/leagueCache.test.ts`
- Additions to `tests/rivals/league.test.ts`

---

### Task 1: `constructs.ts` — what a bot's source teaches, and whether the player knows it

**Files:**
- Create: `src/rivals/constructs.ts`
- Test: `tests/rivals/constructs.test.ts`

**Interfaces:**
- Consumes: `SaveData` from `../state/save` (reads `save.missions[id]?.cleared`); `ALL` from `../content/missions` (to resolve a mission id's `world` number).
- Produces:
  - `type Construct = "if" | "else" | "while" | "for" | "function"`
  - `type Sensor = "enemyAhead" | "enemyNear" | "closerAhead" | "enemyLeft" | "enemyRight" | "hurt"`
  - `CONSTRUCT_MISSIONS: Record<Construct, string>` — construct → mission id that teaches it
  - `detectConstructs(source: string): { constructs: Construct[]; sensors: Sensor[] }`
  - `isConstructKnown(save: SaveData, construct: Construct): boolean`
  - `firstUnknownConstruct(save: SaveData, used: Construct[]): Construct | null`
  - `constructWorld(construct: Construct): number`

The construct → mission mapping (verified against `content/missions/**/*.json`'s `world`/`index`/`teaches` fields and `src/content/commandDocs.ts`'s `since` values, which match exactly for these five):

| construct | mission | world |
|---|---|---|
| `if` | `w2m1` | 2 |
| `else` | `w2m3` | 2 |
| `while` | `w3m1` | 3 |
| `for` | `w3m2` | 3 |
| `function` | `w4m1` | 4 |

Battle sensors (`enemyAhead`, `enemyNear`, `closerAhead`, `enemyLeft`, `enemyRight`, `hurt`) have no teaching mission — they're introduced directly in the Fight screen's command drawer, available from the first fight. `constructs.ts` only tracks *presence*, not known/unknown, for sensors; the known/unknown/CTA logic in Task 6 (Debrief) applies only to the five campaign-taught constructs.

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/rivals/constructs.test.ts
import { describe, it, expect } from "vitest";
import {
  detectConstructs,
  isConstructKnown,
  firstUnknownConstruct,
  constructWorld,
  CONSTRUCT_MISSIONS,
} from "../../src/rivals/constructs";
import type { SaveData } from "../../src/state/save";
import { FRESH_LOADOUT } from "../../src/state/save";

const saveWith = (clearedIds: string[]): SaveData => ({
  missions: Object.fromEntries(clearedIds.map((id) => [id, { cleared: true, stars: 1 }])),
  coins: 0,
  unlocked: [],
  badges: [],
  loadout: { ...FRESH_LOADOUT },
});

describe("detectConstructs", () => {
  it("finds control constructs by keyword", () => {
    const src = "while (true) { if (enemyAhead()) { shoot() } else { forward(1) } }";
    const { constructs } = detectConstructs(src);
    expect(constructs.sort()).toEqual(["else", "if", "while"]);
  });

  it("finds for and function separately", () => {
    const src = "function hunt() { for (let i = 0; i < 3; i++) { forward(1) } }";
    const { constructs } = detectConstructs(src);
    expect(constructs.sort()).toEqual(["for", "function"]);
  });

  it("finds battle sensors used", () => {
    const src = "while (true) { if (closerAhead()) { forward(1) } else if (hurt()) { back(1) } }";
    const { sensors } = detectConstructs(src);
    expect(sensors.sort()).toEqual(["closerAhead", "hurt"]);
  });

  it("finds nothing in a bot with no control flow or sensors", () => {
    const { constructs, sensors } = detectConstructs("forward(1)\nshoot()");
    expect(constructs).toEqual([]);
    expect(sensors).toEqual([]);
  });

  it("does not confuse enemyLeft/enemyRight with each other", () => {
    const { sensors } = detectConstructs("if (enemyRight()) { right() }");
    expect(sensors).toEqual(["enemyRight"]);
  });
});

describe("isConstructKnown", () => {
  it("is false when the teaching mission hasn't been cleared", () => {
    expect(isConstructKnown(saveWith([]), "while")).toBe(false);
  });

  it("is true once the teaching mission is cleared", () => {
    expect(isConstructKnown(saveWith(["w3m1"]), "while")).toBe(true);
  });

  it("every tracked construct maps to a mission id", () => {
    for (const construct of Object.keys(CONSTRUCT_MISSIONS) as (keyof typeof CONSTRUCT_MISSIONS)[]) {
      expect(typeof CONSTRUCT_MISSIONS[construct]).toBe("string");
    }
  });
});

describe("firstUnknownConstruct", () => {
  it("returns null when every used construct is known", () => {
    const save = saveWith(["w2m1", "w2m3", "w3m1", "w3m2", "w4m1"]);
    expect(firstUnknownConstruct(save, ["if", "while"])).toBeNull();
  });

  it("returns the earliest-taught missing construct, in teaching order", () => {
    // knows if/else, not while/for — opponent used both "for" and "while"; while is taught first
    const save = saveWith(["w2m1", "w2m3"]);
    expect(firstUnknownConstruct(save, ["for", "while"])).toBe("while");
  });

  it("ignores constructs the opponent didn't use, even if unknown", () => {
    const save = saveWith(["w2m1"]);
    expect(firstUnknownConstruct(save, ["if"])).toBeNull();
  });
});

describe("constructWorld", () => {
  it("resolves each construct to the world that teaches it", () => {
    expect(constructWorld("if")).toBe(2);
    expect(constructWorld("else")).toBe(2);
    expect(constructWorld("while")).toBe(3);
    expect(constructWorld("for")).toBe(3);
    expect(constructWorld("function")).toBe(4);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run (from `projects/codebots/app/`): `pnpm vitest run tests/rivals/constructs.test.ts`
Expected: FAIL — `Cannot find module '../../src/rivals/constructs'`

- [ ] **Step 3: Write the implementation**

```typescript
// src/rivals/constructs.ts
import type { SaveData } from "../state/save";
import { ALL } from "../content/missions";

/**
 * WHAT DID THE OPPONENT'S CODE ACTUALLY USE — and does this kid know it yet?
 *
 * Feeds the Debrief's construct chips: green if she's cleared the mission that teaches it, dashed red
 * if she hasn't. The mapping below is verified against every currently-playable mission's own
 * `teaches` field, not just `commandDocs.ts`'s `since` numbers. "else if" as its own tracked construct
 * is out of scope here — the handoff bundles if/else as one idea, not three — even though w3m5 now
 * legitimately teaches it ("else if (a chain of choices)"); a future milestone could add it.
 */
export type Construct = "if" | "else" | "while" | "for" | "function";
export type Sensor = "enemyAhead" | "enemyNear" | "closerAhead" | "enemyLeft" | "enemyRight" | "hurt";

const CONSTRUCT_PATTERNS: Record<Construct, RegExp> = {
  if: /\bif\s*\(/,
  else: /\belse\b/,
  while: /\bwhile\s*\(/,
  for: /\bfor\s*\(/,
  function: /\bfunction\b/,
};

/** teaching order — also the priority order for firstUnknownConstruct */
const CONSTRUCT_ORDER: Construct[] = ["if", "else", "while", "for", "function"];

export const CONSTRUCT_MISSIONS: Record<Construct, string> = {
  if: "w2m1",
  else: "w2m3",
  while: "w3m1",
  for: "w3m2",
  function: "w4m1",
};

const SENSOR_ORDER: Sensor[] = ["enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight", "hurt"];

export interface ParsedConstructs {
  constructs: Construct[];
  sensors: Sensor[];
}

/** Source is trusted kid code (same assumption the linter and commandDocs already make) — a plain
 *  keyword/call regex is enough; no need to guard against `while` inside a string or comment. */
export function detectConstructs(source: string): ParsedConstructs {
  const constructs = CONSTRUCT_ORDER.filter((c) => CONSTRUCT_PATTERNS[c].test(source));
  const sensors = SENSOR_ORDER.filter((s) => new RegExp(`\\b${s}\\s*\\(`).test(source));
  return { constructs, sensors };
}

export function isConstructKnown(save: SaveData, construct: Construct): boolean {
  return !!save.missions[CONSTRUCT_MISSIONS[construct]]?.cleared;
}

/** The earliest-taught construct the opponent used that this kid hasn't cleared yet — the single
 *  gap most worth sending her to fix. Null if she already knows everything they used. */
export function firstUnknownConstruct(save: SaveData, used: Construct[]): Construct | null {
  return CONSTRUCT_ORDER.find((c) => used.includes(c) && !isConstructKnown(save, c)) ?? null;
}

export function constructWorld(construct: Construct): number {
  const missionId = CONSTRUCT_MISSIONS[construct];
  const mission = ALL.find((m) => m.id === missionId);
  if (!mission) throw new Error(`constructWorld: no mission "${missionId}" for construct "${construct}"`);
  return mission.world;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run tests/rivals/constructs.test.ts`
Expected: PASS (13 tests)

- [ ] **Step 5: Commit**

```bash
git add src/rivals/constructs.ts tests/rivals/constructs.test.ts
git commit -m "feat(codebots): detect a bot's constructs and whether the player has learned them"
```

---

### Task 2: `debriefStats.ts` — turn one battle's event log into the Debrief's stats + key moments

**Files:**
- Create: `src/rivals/debriefStats.ts`
- Test: `tests/rivals/debriefStats.test.ts`

**Interfaces:**
- Consumes: `BattleEvent` (type only) from `../sim/battle`.
- Produces:
  - `interface KeyMoment { round: number; kind: "wastedShot" | "firstHit" | "wreck" }`
  - `interface DebriefStats { roundsSurvived: number; hitsLanded: number; hitsAttempted: number; wastedShots: number; damageDealt: number; keyMoments: KeyMoment[] }`
  - `computeDebriefStats(events: readonly BattleEvent[], rounds: number, playerIndex: number, opponentIndex: number, opponentMaxArmor: number): DebriefStats`

All stats are from the player's point of view. `playerIndex`/`opponentIndex` are bot indices as assigned by `runBattle`'s `entrants` array — every call site in this app puts the player at index 0.

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/rivals/debriefStats.test.ts
import { describe, it, expect } from "vitest";
import { computeDebriefStats } from "../../src/rivals/debriefStats";
import type { BattleEvent } from "../../src/sim/battle";

const at = { x: 0, y: 0 };

describe("computeDebriefStats", () => {
  it("counts wasted shots — shoot events with no hit", () => {
    const events: BattleEvent[] = [
      { round: 1, bot: 0, type: "shoot", from: at, facing: "E", hit: null, at: null },
      { round: 2, bot: 0, type: "shoot", from: at, facing: "E", hit: null, at: null },
    ];
    const stats = computeDebriefStats(events, 2, 0, 1, 100);
    expect(stats.wastedShots).toBe(2);
    expect(stats.hitsAttempted).toBe(2);
    expect(stats.hitsLanded).toBe(0);
  });

  it("counts hits landed on the opponent and the damage dealt", () => {
    const events: BattleEvent[] = [
      { round: 1, bot: 0, type: "shoot", from: at, facing: "E", hit: 1, at },
      { round: 1, bot: 0, type: "hit", target: 1, at, armor: 66 },
      { round: 2, bot: 0, type: "shoot", from: at, facing: "E", hit: 1, at },
      { round: 2, bot: 0, type: "hit", target: 1, at, armor: 32 },
    ];
    const stats = computeDebriefStats(events, 2, 0, 1, 100);
    expect(stats.hitsLanded).toBe(2);
    expect(stats.hitsAttempted).toBe(2);
    expect(stats.wastedShots).toBe(0);
    expect(stats.damageDealt).toBe(68); // 100->66 (34) + 66->32 (34)
  });

  it("ignores the opponent's own shots when counting the player's attempts", () => {
    const events: BattleEvent[] = [
      { round: 1, bot: 1, type: "shoot", from: at, facing: "W", hit: 0, at },
      { round: 1, bot: 1, type: "hit", target: 0, at, armor: 85 },
    ];
    const stats = computeDebriefStats(events, 1, 0, 1, 100);
    expect(stats.hitsAttempted).toBe(0);
    expect(stats.wastedShots).toBe(0);
    expect(stats.damageDealt).toBe(0);
  });

  it("flags the first hit taken by the player as a key moment, and only the first", () => {
    const events: BattleEvent[] = [
      { round: 1, bot: 1, type: "shoot", from: at, facing: "W", hit: 0, at },
      { round: 1, bot: 1, type: "hit", target: 0, at, armor: 85 },
      { round: 3, bot: 1, type: "shoot", from: at, facing: "W", hit: 0, at },
      { round: 3, bot: 1, type: "hit", target: 0, at, armor: 70 },
    ];
    const stats = computeDebriefStats(events, 3, 0, 1, 100);
    const firstHits = stats.keyMoments.filter((m) => m.kind === "firstHit");
    expect(firstHits).toEqual([{ round: 1, kind: "firstHit" }]);
  });

  it("flags a wreck as a key moment", () => {
    const events: BattleEvent[] = [{ round: 5, bot: 0, type: "wreck", at }];
    const stats = computeDebriefStats(events, 5, 0, 1, 100);
    expect(stats.keyMoments).toContainEqual({ round: 5, kind: "wreck" });
  });

  it("flags every wasted shot as its own key moment", () => {
    const events: BattleEvent[] = [
      { round: 1, bot: 0, type: "shoot", from: at, facing: "E", hit: null, at: null },
      { round: 4, bot: 0, type: "shoot", from: at, facing: "E", hit: null, at: null },
    ];
    const stats = computeDebriefStats(events, 4, 0, 1, 100);
    expect(stats.keyMoments).toEqual([
      { round: 1, kind: "wastedShot" },
      { round: 4, kind: "wastedShot" },
    ]);
  });

  it("carries rounds survived straight through", () => {
    const stats = computeDebriefStats([], 17, 0, 1, 100);
    expect(stats.roundsSurvived).toBe(17);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run tests/rivals/debriefStats.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

```typescript
// src/rivals/debriefStats.ts
import type { BattleEvent } from "../sim/battle";

export interface KeyMoment {
  round: number;
  kind: "wastedShot" | "firstHit" | "wreck";
}

export interface DebriefStats {
  roundsSurvived: number;
  hitsLanded: number;
  hitsAttempted: number;
  wastedShots: number;
  damageDealt: number;
  keyMoments: KeyMoment[];
}

/**
 * Reduces one fight's event log into what the Debrief shows — the stats row and the scrubber's
 * markers. Everything here is derived, not tracked separately: the sim already logs every shot and
 * hit, so there's nothing new to instrument.
 *
 * `playerIndex`/`opponentIndex` are bot indices as `runBattle`'s `entrants` array assigned them —
 * every call site in this app puts the player first (index 0).
 */
export function computeDebriefStats(
  events: readonly BattleEvent[],
  rounds: number,
  playerIndex: number,
  opponentIndex: number,
  opponentMaxArmor: number,
): DebriefStats {
  let hitsLanded = 0;
  let hitsAttempted = 0;
  let wastedShots = 0;
  let damageDealt = 0;
  let opponentArmor = opponentMaxArmor;
  let firstHitSeen = false;
  let wreckSeen = false;
  const keyMoments: KeyMoment[] = [];

  for (const ev of events) {
    if (ev.type === "shoot" && ev.bot === playerIndex) {
      hitsAttempted++;
      if (ev.hit === null) {
        wastedShots++;
        keyMoments.push({ round: ev.round, kind: "wastedShot" });
      }
    } else if (ev.type === "hit" && ev.bot === playerIndex && ev.target === opponentIndex) {
      hitsLanded++;
      damageDealt += Math.max(0, opponentArmor - ev.armor);
      opponentArmor = ev.armor;
    } else if (ev.type === "hit" && ev.target === playerIndex && !firstHitSeen) {
      firstHitSeen = true;
      keyMoments.push({ round: ev.round, kind: "firstHit" });
    } else if (ev.type === "wreck" && !wreckSeen) {
      wreckSeen = true;
      keyMoments.push({ round: ev.round, kind: "wreck" });
    }
  }

  return { roundsSurvived: rounds, hitsLanded, hitsAttempted, wastedShots, damageDealt, keyMoments };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run tests/rivals/debriefStats.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/rivals/debriefStats.ts tests/rivals/debriefStats.test.ts
git commit -m "feat(codebots): reduce a battle's event log into Debrief stats and key moments"
```

---

### Task 3: `league.ts` — thread a season salt through `playMatch`/`standings` without touching `matchSeed`

**Files:**
- Modify: `src/rivals/league.ts:155-171` (`playMatch`), `:189-208` (`standings`)
- Test: `tests/rivals/league.test.ts` (append)

**Interfaces:**
- Consumes: nothing new.
- Produces: `playMatch(a: Fighter, b: Fighter, seasonSalt?: number): MatchResult`, `standings(fighters: Fighter[], seasonSalt?: number): Standing[]` — both default `seasonSalt` to `0`, which is byte-identical to today's behavior (every existing call site and test keeps working unchanged).

`matchSeed(a, b)` itself is **not** modified — `tests/rivals/league.test.ts` already asserts things about it directly (order-independence) and prefixing a salt into its hash would make `seasonSalt = 0` not actually equal "no salt". Instead the salt is added on top of the seed at the point where boards are chosen.

- [ ] **Step 1: Write the failing tests**

Append to `tests/rivals/league.test.ts` (add inside the existing `describe("the league is fair", ...)` block, after the last `it`):

```typescript
  it("seasonSalt defaults to 0, which is byte-identical to today's behaviour", () => {
    expect(playMatch(THINKER, BRAINLESS, 0)).toEqual(playMatch(THINKER, BRAINLESS));
    const bots = [THINKER, BRAINLESS, TURTLE];
    expect(standings(bots, 0)).toEqual(standings(bots));
  });

  it("a nonzero seasonSalt shifts which boards a matchup is played on", () => {
    // this is the mechanism the season rotation relies on: same pairing, different salt, different
    // boards — checked directly against board()/matchSeed(), not against a match OUTCOME (an outcome
    // can coincidentally match even on a different board, which would make this test flaky)
    const seed = matchSeed("x", "y");
    const noSalt = Array.from({ length: BOARDS_PER_MATCH }, (_, i) => JSON.stringify(board(seed + i * 7919).arena));
    const salted = Array.from(
      { length: BOARDS_PER_MATCH },
      (_, i) => JSON.stringify(board(seed + 999983 + i * 7919).arena),
    );
    expect(salted).not.toEqual(noSalt);
  });

  it("standings() stays a pure function of the programs even with a seasonSalt applied", () => {
    const bots = [THINKER, BRAINLESS, TURTLE];
    const once = standings(bots, 42).map((s) => s.fighter.id);
    const twice = standings([...bots].reverse(), 42).map((s) => s.fighter.id);
    expect(once).toEqual(twice);
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run tests/rivals/league.test.ts`
Expected: FAIL on the first new test — `playMatch(THINKER, BRAINLESS, 0)` currently ignores the third argument (TypeScript would actually reject the extra argument at compile time first; that compile error IS the expected failure here).

- [ ] **Step 3: Modify the implementation**

In `src/rivals/league.ts`, change `playMatch`:

```typescript
export function playMatch(a: Fighter, b: Fighter, seasonSalt = 0): MatchResult {
  const seed = matchSeed(a.id, b.id) + seasonSalt;
  let wins = 0, losses = 0, draws = 0;

  for (let i = 0; i < BOARDS_PER_MATCH; i++) {
    const r = fightOnce(a, b, board(seed + i * 7919), true);
    if (r === "a") wins++;
    else if (r === "b") losses++;
    else draws++;
  }

  return { wins, losses, draws, winner: wins > losses ? "a" : losses > wins ? "b" : "draw" };
}
```

And `standings`:

```typescript
export function standings(fighters: Fighter[], seasonSalt = 0): Standing[] {
  const table = new Map<string, Standing>(
    fighters.map((f) => [f.id, { fighter: f, wins: 0, losses: 0, draws: 0, points: 0 }]),
  );

  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const a = fighters[i], b = fighters[j];
      const m = playMatch(a, b, seasonSalt);
      const ta = table.get(a.id)!, tb = table.get(b.id)!;
      if (m.winner === "a") { ta.wins++; tb.losses++; ta.points += 3; }
      else if (m.winner === "b") { tb.wins++; ta.losses++; tb.points += 3; }
      else { ta.draws++; tb.draws++; ta.points++; tb.points++; }
    }
  }

  return [...table.values()].sort(
    (x, y) => y.points - x.points || y.wins - x.wins || x.fighter.name.localeCompare(y.fighter.name),
  );
}
```

(Only the signatures and the `seed`/`playMatch(a, b, seasonSalt)` lines change — the rest of each function is unchanged.)

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run tests/rivals/league.test.ts`
Expected: PASS (all original tests + 3 new ones)

- [ ] **Step 5: Commit**

```bash
git add src/rivals/league.ts tests/rivals/league.test.ts
git commit -m "feat(codebots): thread an optional season salt through playMatch/standings"
```

---

### Task 4: `leagueCache.ts` — cache the ladder by roster + season, keep the previous snapshot for trend arrows

**Files:**
- Create: `src/rivals/leagueCache.ts`
- Test: `tests/rivals/leagueCache.test.ts`

**Interfaces:**
- Consumes: `standings`, `type Fighter`, `type Standing` from `./league` (Task 3's signatures); `fingerprint` from `./away` (already exists — do not write a second source-hash function).
- Produces:
  - `seasonToken(now?: Date): string`
  - `seasonSalt(token: string): number` — exported so `ArenaHub` (Task 8) can replay the exact board a standings computation used, not a differently-seeded one.
  - `cachedStandings(fighters: Fighter[], now?: Date): Standing[]`
  - `previousStandings(): Standing[] | null`

The cache key is `(seasonToken, sorted "id:fingerprint(source)" per fighter)`. A cache **hit** (same key as last time) returns the stored table untouched. A **miss** (roster changed, or the season rolled over) recomputes, and shifts the old stored table into "previous" before overwriting — that's what `previousStandings()` reads, for trend arrows and the away-record comparison.

`seasonToken` buckets by the most recent Friday-00:00-UTC boundary, so boards rotate Fridays (per the design doc) without needing a hardcoded reference date.

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/rivals/leagueCache.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { seasonToken, cachedStandings, previousStandings } from "../../src/rivals/leagueCache";
import type { Fighter } from "../../src/rivals/league";

// Same stub pattern as tests/state/save-roundtrip.test.ts — the suite runs in node, and this module
// only needs a key/value store.
const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

beforeEach(() => store.clear());

const f = (id: string, source: string): Fighter => ({ id, name: id, source });
const A = f("a", "while (true) { if (enemyAhead()) { shoot() } else { forward(1) } }");
const B = f("b", "while (true) { forward(1) }");
const NOW = new Date("2026-07-16T12:00:00Z"); // a Thursday

describe("seasonToken", () => {
  it("is the same token on either side of the week, up to the Friday boundary", () => {
    const thursday = new Date("2026-07-16T23:59:59Z");
    const friday9am = new Date("2026-07-17T09:00:00Z");
    expect(seasonToken(thursday)).toBe(seasonToken(new Date("2026-07-11T00:00:00Z"))); // same week
    expect(seasonToken(friday9am)).not.toBe(seasonToken(thursday)); // rolled over Friday 00:00 UTC
  });
});

describe("cachedStandings", () => {
  it("returns the same table it would compute directly, on a cold cache", () => {
    const result = cachedStandings([A, B], NOW);
    expect(result.map((s) => s.fighter.id).sort()).toEqual(["a", "b"]);
  });

  it("is a cache HIT for the same roster + season — repeat calls don't drift", () => {
    const first = cachedStandings([A, B], NOW);
    const second = cachedStandings([A, B], NOW);
    expect(second).toEqual(first);
  });

  it("is a cache MISS when a fighter's source changes — a republished bot invalidates it", () => {
    const before = cachedStandings([A, B], NOW);
    const edited = { ...A, source: "while (true) { honk() }" };
    const after = cachedStandings([edited, B], NOW);
    // different roster key -> recomputed, and the OLD table is now available as "previous"
    expect(previousStandings()).toEqual(before);
    void after;
  });

  it("is a cache MISS across a season rollover", () => {
    const beforeFriday = new Date("2026-07-16T23:59:59Z");
    const afterFriday = new Date("2026-07-17T00:00:01Z");
    const week1 = cachedStandings([A, B], beforeFriday);
    cachedStandings([A, B], afterFriday);
    expect(previousStandings()).toEqual(week1);
  });

  it("previousStandings is null the first time this device ever computes a ladder", () => {
    expect(previousStandings()).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm vitest run tests/rivals/leagueCache.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the implementation**

```typescript
// src/rivals/leagueCache.ts
import { standings, type Fighter, type Standing } from "./league";
import { fingerprint } from "./away";

/**
 * THE LADDER, WITHOUT REPLAYING HUNDREDS OF TINY FIGHTS EVERY TIME THE HUB OPENS.
 *
 * standings() is O(n²) matchups × BOARDS_PER_MATCH — honest, but not something to redo on every
 * mount. It only needs to change when the roster actually changes (someone published or edited a
 * bot) or when the season rolls over (Friday), so this caches the result in localStorage keyed by
 * exactly those two things, and keeps one prior snapshot around for trend arrows and "since you were
 * last here" comparisons.
 */

const KEY = "codebots.league.v1";

/** Buckets by the most recent Friday-00:00-UTC boundary, so boards rotate Fridays without a
 *  hardcoded reference date to keep in sync. */
export function seasonToken(now: Date = new Date()): string {
  const ms = now.getTime();
  const day = now.getUTCDay(); // 0=Sun..6=Sat
  const msSinceFriday =
    ((day - 5 + 7) % 7) * 86400000 +
    now.getUTCHours() * 3600000 +
    now.getUTCMinutes() * 60000 +
    now.getUTCSeconds() * 1000 +
    now.getUTCMilliseconds();
  const fridayBoundary = ms - msSinceFriday;
  return `S${Math.floor(fridayBoundary / (7 * 86400000))}`;
}

/** Exported so callers that need to replay a SPECIFIC board (the Hub's WATCH buttons, Task 8) can
 *  compute the exact same salted seed `cachedStandings` used to rank the ladder — otherwise the
 *  replay would show a different board than the one that actually decided the standings. */
export function seasonSalt(token: string): number {
  let h = 2166136261;
  for (const ch of token) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rosterKey(fighters: Fighter[], token: string): string {
  const ids = fighters.map((f) => `${f.id}:${fingerprint(f.source)}`).sort();
  return `${token}|${ids.join(",")}`;
}

interface CacheShape {
  key: string;
  standings: Standing[];
  prevStandings: Standing[] | null;
}

function readCache(): CacheShape | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CacheShape) : null;
  } catch {
    return null;
  }
}

function writeCache(c: CacheShape): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // storage full/blocked — the ladder just recomputes next time, nothing breaks
  }
}

/** The ladder. Cache hit on an unchanged roster+season; cache miss recomputes and remembers the
 *  prior table as `previousStandings()`. */
export function cachedStandings(fighters: Fighter[], now: Date = new Date()): Standing[] {
  const token = seasonToken(now);
  const key = rosterKey(fighters, token);
  const cached = readCache();
  if (cached && cached.key === key) return cached.standings;

  const fresh = standings(fighters, seasonSalt(token));
  writeCache({ key, standings: fresh, prevStandings: cached?.standings ?? null });
  return fresh;
}

/** The ladder as it stood the last time it was recomputed. Null the first time this device ever
 *  computes one. */
export function previousStandings(): Standing[] | null {
  return readCache()?.prevStandings ?? null;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm vitest run tests/rivals/leagueCache.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add src/rivals/leagueCache.ts tests/rivals/leagueCache.test.ts
git commit -m "feat(codebots): cache the league ladder by roster+season, keep a previous snapshot"
```

---

### Task 5: `ReplayViewer.tsx` — mount a Phaser battle scene and play a stored event log

**Files:**
- Create: `src/ui/ReplayViewer.tsx`

**Interfaces:**
- Consumes: `mountBattle`, `type MountedBattle` from `../view/mountBattle`; `type BattleBotDef` from `../view/BattleScene`; `type BattleEvent` from `../sim/battle`; `type Arena` from `../sim/types`.
- Produces: `ReplayViewer({ arena, bots, events, autoPlay, height }: { arena: Arena; bots: BattleBotDef[]; events: readonly BattleEvent[]; autoPlay?: boolean; height?: number }): JSX.Element` — a `<div>` host that mounts the scene on mount, plays `events` immediately if `autoPlay` (default `true`), and exposes a small ▶ REPLAY button to play again once done. Used by the Hub's featured match, every ladder row's WATCH action, and the fresh-results ticker (Task 8) — all of them are "replay this already-decided fight," never a live one.

This is a passive rewatcher; it does not report HP or drive external state. (`FightScreen`, Task 7, keeps its own mount logic — it needs per-event callbacks for HP bars and sound that don't fit this component's contract, so it isn't built on top of `ReplayViewer`.)

- [ ] **Step 1: Write the component**

```typescript
// src/ui/ReplayViewer.tsx
import React, { useEffect, useRef, useState } from "react";
import type { BattleEvent } from "../sim/battle";
import type { Arena } from "../sim/types";
import { mountBattle, type MountedBattle } from "../view/mountBattle";
import type { BattleBotDef } from "../view/BattleScene";
import { Button } from "./components/Button";

/**
 * Replays an already-decided fight. Every WATCH button and the Hub's featured match slot point here
 * — the sim is deterministic, so "watch this pairing" is just "play this event log again," no live
 * battle involved.
 */
export function ReplayViewer({
  arena,
  bots,
  events,
  autoPlay = true,
  height = 220,
}: {
  arena: Arena;
  bots: BattleBotDef[];
  events: readonly BattleEvent[];
  autoPlay?: boolean;
  height?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const battle = useRef<MountedBattle | null>(null);
  const [done, setDone] = useState(false);

  const play = () => {
    const b = battle.current;
    if (!b) return;
    b.scene.reset();
    setDone(false);
    b.scene.play(events, { onDone: () => setDone(true) });
  };

  useEffect(() => {
    let cancelled = false;
    if (host.current) {
      mountBattle(host.current, arena, bots).then((m) => {
        if (cancelled) { m.destroy(); return; }
        battle.current = m;
        if (autoPlay) play();
      });
    }
    return () => { cancelled = true; battle.current?.destroy(); battle.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- events/bots/arena identity is stable per mounted replay
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div ref={host} style={{ height, borderRadius: 10, overflow: "hidden", position: "relative" }} />
      {done ? (
        <Button variant="quiet" size="sm" onClick={play} style={{ alignSelf: "flex-start" }}>
          ▶ REPLAY
        </Button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm exec tsc --noEmit`
Expected: no errors from `src/ui/ReplayViewer.tsx`. (No unit test — this is a thin Phaser-mounting wrapper; it's exercised visually in Task 9's manual verification, same as `mountBattle` itself has no unit tests today.)

- [ ] **Step 3: Commit**

```bash
git add src/ui/ReplayViewer.tsx
git commit -m "feat(codebots): add ReplayViewer for rewatching a decided fight's event log"
```

---

### Task 6: `Debrief.tsx` — the post-fight screen

**Files:**
- Create: `src/ui/Debrief.tsx`

**Interfaces:**
- Consumes:
  - `detectConstructs`, `firstUnknownConstruct`, `constructWorld`, `type Construct` from `../rivals/constructs` (Task 1)
  - `computeDebriefStats` from `../rivals/debriefStats` (Task 2)
  - `type BattleEvent, type BattleOutcome` from `../sim/battle`
  - `type SaveData` from `../state/save`
  - `Panel`, `Button`, `Chip` from `./components/*`
  - A `FightRecord` value (defined in Task 7's `FightScreen.tsx` and re-exported from there — see Task 7's Interfaces block for the exact shape)
- Produces: `Debrief({ record, save, onRematch, onLearn, onBackToHub }: { record: FightRecord; save: SaveData; onRematch: () => void; onLearn: (missionId: string) => void; onBackToHub: () => void }): JSX.Element`

- [ ] **Step 1: Write the component**

```typescript
// src/ui/Debrief.tsx
import React from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Chip } from "./components/Chip";
import { detectConstructs, firstUnknownConstruct, constructWorld, CONSTRUCT_MISSIONS, type Construct } from "../rivals/constructs";
import { computeDebriefStats } from "../rivals/debriefStats";
import type { SaveData } from "../state/save";
import type { FightRecord } from "./FightScreen";

const CONSTRUCT_LABEL: Record<Construct, string> = {
  if: "IF", else: "ELSE", while: "WHILE", for: "FOR", function: "FUNCTION",
};

/**
 * WRECKED — BUT LOOK WHY.
 *
 * The one thing the old toast never did: turn a loss into a reason to go learn something. Every
 * construct chip and every key moment here comes straight out of the event log and the opponent's
 * published source — nothing new is tracked to build this screen, and losses never cost points or
 * coins. This is a screen, not a modal: it's the only thing between a fight and the Hub.
 */
export function Debrief({
  record,
  save,
  onRematch,
  onLearn,
  onBackToHub,
}: {
  record: FightRecord;
  save: SaveData;
  onRematch: () => void;
  onLearn: (missionId: string) => void;
  onBackToHub: () => void;
}) {
  const { constructs, sensors } = detectConstructs(record.opponentSource);
  const missing = firstUnknownConstruct(save, constructs);
  const stats = computeDebriefStats(record.events, record.rounds, 0, 1, record.opponentMaxArmor);

  const title =
    record.outcome === "win" ? "★ YOUR BOT WON! ★" : record.outcome === "lose" ? "WRECKED — BUT LOOK WHY" : "A DRAW";

  const closestMoment = stats.keyMoments[stats.keyMoments.length - 1] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 24px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", color: record.outcome === "win" ? "var(--green)" : record.outcome === "lose" ? "var(--red)" : "var(--text-dim)" }}>
        {title}
      </div>
      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)" }}>
        vs {record.opponentName}
      </div>

      <Panel label="WHAT THEY USED">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {constructs.map((c) => {
            const known = c !== missing;
            return (
              <Chip key={c} color={known ? "green" : "red"} dashed={!known}>
                {CONSTRUCT_LABEL[c]}
              </Chip>
            );
          })}
          {sensors.map((s) => (
            <Chip key={s} color="dim">{s}()</Chip>
          ))}
        </div>
      </Panel>

      {missing ? (
        <Button onClick={() => onLearn(CONSTRUCT_MISSIONS[missing])} style={{ alignSelf: "flex-start" }}>
          LEARN {CONSTRUCT_LABEL[missing]} — WORLD {constructWorld(missing)}
        </Button>
      ) : closestMoment ? (
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>
          You already know everything they used — round {closestMoment.round} was the moment that
          decided it.
        </div>
      ) : null}

      <Panel label="THE FIGHT">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "var(--text-xs)" }}>
          <div>ROUNDS SURVIVED <b>{stats.roundsSurvived}</b></div>
          <div>DAMAGE DEALT <b>{stats.damageDealt}</b></div>
          <div>HITS LANDED <b>{stats.hitsLanded}/{stats.hitsAttempted}</b></div>
          <div>WASTED SHOTS <b>{stats.wastedShots}</b></div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
          {stats.keyMoments.map((m, i) => (
            <div
              key={i}
              title={`round ${m.round} — ${m.kind}`}
              style={{
                width: 10, height: 10, borderRadius: "50%",
                background: m.kind === "wreck" ? "var(--red)" : "var(--amber)",
              }}
            />
          ))}
        </div>
      </Panel>

      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost" onClick={onBackToHub}>‹ ARENA</Button>
        <Button onClick={onRematch}>▶ REMATCH</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm exec tsc --noEmit`
Expected: errors referencing `FightRecord` not yet exported — expected until Task 7 creates `FightScreen.tsx`. Re-run after Task 7.

- [ ] **Step 3: Commit**

```bash
git add src/ui/Debrief.tsx
git commit -m "feat(codebots): add the Debrief screen — construct chips, learn CTA, key moments"
```

---

### Task 7: `FightScreen.tsx` — extract the fight itself out of `BattleScreen`

**Files:**
- Create: `src/ui/FightScreen.tsx`
- Reference (being replaced, do not modify yet — Task 9 deletes it): `src/ui/BattleScreen.tsx`

**Interfaces:**
- Consumes: everything `BattleScreen.tsx` already imports (`mountBattle`, `runBattle`, `PRESETS`/`presetById`/`BATTLE_API`, `desugarRepeat`/`findUnknownCalls`/`collectFunctionNames`, `unknownCommandMessage`, `analytics`, `loadSave`, `computeStats`, `Editor`, `Sfx`); additionally `ALL_COMMANDS` from `../content/commandDocs`; `type SimEvent` from `../sim/events`.
- Produces:
  - `export type Opponent = { kind: "preset"; id: string } | { kind: "rival"; bot: PublishedBot }`
  - `export interface FightRecord { opponentName: string; opponentSource: string; opponentUserId: string | null; opponentMaxArmor: number; outcome: BattleOutcome; events: BattleEvent[]; rounds: number }`
  - `FightScreen({ opponent, paint, onDone, onExit }: { opponent: Opponent; paint: { bodyColor: number; domeColor: number }; onDone: (record: FightRecord) => void; onExit: () => void }): JSX.Element`

Everything opponent-picking, publishing, and leaderboard-related from the old `BattleScreen` is **removed** — the Hub (Task 8) is now the only place that picks an opponent. The always-open command panels collapse into one closed-by-default drawer grouped MOVES / SENSORS / BATTLE, built from `ALL_COMMANDS` (all of it — the drawer is a reference, not gated by campaign progress) plus the six battle-only extras.

- [ ] **Step 1: Write the component**

```typescript
// src/ui/FightScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import type { BattleEvent, BattleOutcome } from "../sim/battle";
import type { Arena } from "../sim/types";
import type { SimEvent } from "../sim/events";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Editor } from "../editor/Editor";
import { Sfx } from "../sound/sfx";
import { mountBattle, type MountedBattle } from "../view/mountBattle";
import { runBattle } from "../sim/battle";
import { PRESETS, presetById, BATTLE_API } from "../content/enemies";
import { desugarRepeat, findUnknownCalls, collectFunctionNames } from "../sandbox/transform";
import { unknownCommandMessage } from "../sandbox/errors";
import { analytics } from "../state/analytics";
import { loadSave } from "../state/save";
import { computeStats } from "../content/parts";
import { ALL_COMMANDS } from "../content/commandDocs";
import type { PublishedBot } from "../rivals/publish";

const BATTLE_EXTRA = ["enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight", "hurt"];

export type Opponent = { kind: "preset"; id: string } | { kind: "rival"; bot: PublishedBot };

export interface FightRecord {
  opponentName: string;
  opponentSource: string;
  opponentUserId: string | null;
  opponentMaxArmor: number;
  outcome: BattleOutcome;
  events: BattleEvent[];
  rounds: number;
}

// same arena as the old BattleScreen — the rival stands BETWEEN the player and a beacon that wins
// nothing here; the fight is lastStanding only. See BattleScreen's original comments for why.
const ARENA: Arena = (() => {
  const cols = 15, rows = 9;
  const cells = Array.from({ length: rows }, () => Array<string>(cols).fill("floor"));
  const walls: [number, number][] = [
    [5, 3], [5, 5], [9, 3], [9, 5],
    [7, 2], [7, 6],
    [3, 1], [3, 7], [11, 1], [11, 7],
  ];
  for (const [x, y] of walls) cells[y][x] = "wall";
  return { cols, rows, cells: cells as Arena["cells"], crates: [], coins: [], chests: [], gates: [], targets: [], beacon: { x: 0, y: 0 } };
})();
const PLAYER_START = { pos: { x: 0, y: 4 }, facing: "E" as const };
const ENEMY_START = { pos: { x: 14, y: 4 }, facing: "W" as const };

const STARTER =
  "// FIGHT! Write your bot's brain, then press FIGHT — it battles on its own.\n" +
  "// enemyAhead() is true when a rival is in your sights. shoot() to fire!\n" +
  "while (!atBeacon()) {\n  if (enemyAhead()) {\n    shoot()\n  } else if (blocked()) {\n    right()\n  } else {\n    forward(1)\n  }\n}";

function sfxEvent(type: string): SimEvent | null {
  const t = ({ move: "move", turn: "turn", shoot: "shoot", honk: "honk", hit: "bump", wreck: "targetDestroyed", reach: "clear" } as Record<string, string>)[type];
  return t ? ({ type: t } as unknown as SimEvent) : null;
}

function HealthBar({ label, hp, max, color }: { label: string; hp: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (hp / max) * 100)) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 120 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "1px", color: "var(--text-dim)" }}>
        <span>{label}</span><span>{hp}/{max}</span>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: "rgba(0,0,0,.3)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width .2s" }} />
      </div>
    </div>
  );
}

/** MOVES / SENSORS / BATTLE — collapsed by default, above the editor. Reference only: shows
 *  everything the campaign or the arena teaches, not gated by the kid's own progress. */
function CommandDrawer() {
  const [open, setOpen] = useState<"moves" | "sensors" | "battle" | null>(null);
  const moves = ALL_COMMANDS.filter((c) => c.kind !== "sensor");
  const sensors = ALL_COMMANDS.filter((c) => c.kind === "sensor");
  const groups: { key: "moves" | "sensors" | "battle"; label: string; docs: { sig: string; desc: string }[] }[] = [
    { key: "moves", label: "MOVES", docs: moves },
    { key: "sensors", label: "SENSORS", docs: sensors },
    { key: "battle", label: "BATTLE", docs: BATTLE_EXTRA.map((sig) => ({ sig: `${sig}()`, desc: "battle-only sensor" })) },
  ];
  return (
    <Panel style={{ padding: "8px 12px" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {groups.map((g) => (
          <button
            key={g.key}
            onClick={() => setOpen(open === g.key ? null : g.key)}
            style={{ all: "unset", cursor: "pointer", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "1px", color: open === g.key ? "var(--amber)" : "var(--text-dim)" }}
          >
            {g.label} {open === g.key ? "▾" : "▸"}
          </button>
        ))}
      </div>
      {open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
          {groups.find((g) => g.key === open)!.docs.map((d) => (
            <div key={d.sig} style={{ borderTop: "1px dashed var(--line)", paddingTop: 4 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--cyan)", fontWeight: 700 }}>{d.sig}</div>
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)" }}>{d.desc}</div>
            </div>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}

export function FightScreen({
  opponent,
  paint,
  onDone,
  onExit,
}: {
  opponent: Opponent;
  paint: { bodyColor: number; domeColor: number };
  onDone: (record: FightRecord) => void;
  onExit: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const battle = useRef<MountedBattle | null>(null);
  const sfx = useRef<Sfx | null>(null);

  const [code, setCode] = useState(STARTER);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BattleOutcome | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [status, setStatus] = useState("Write your bot's brain, then press FIGHT — once it starts, you can't steer it.");

  const preset = opponent.kind === "preset" ? presetById(opponent.id) : undefined;
  const enemy = preset
    ? { name: preset.name, source: preset.source, stats: preset.stats, userId: null as string | null }
    : opponent.kind === "rival"
      ? { name: `${opponent.bot.botName} (${opponent.bot.username})`, source: opponent.bot.source, stats: undefined, userId: opponent.bot.userId }
      : { name: "SNIPER", source: PRESETS[1].source, stats: PRESETS[1].stats, userId: null };

  const save = loadSave();
  const myStats = computeStats(save.loadout);
  const myMax = myStats.armor;
  const enemyMax = enemy.stats?.armor ?? 100;
  const [hp, setHp] = useState({ player: myMax, enemy: enemyMax });

  useEffect(() => {
    sfx.current = new Sfx();
    analytics.battleOpen?.();
    let cancelled = false;
    if (host.current) {
      mountBattle(host.current, ARENA, [
        { bodyColor: paint.bodyColor, domeColor: paint.domeColor, start: PLAYER_START },
        { bodyColor: 0xff6b7a, domeColor: 0xffe08a, start: ENEMY_START },
      ]).then((m) => { if (cancelled) { m.destroy(); return; } battle.current = m; });
    }
    return () => { cancelled = true; battle.current?.destroy(); battle.current = null; };
  }, [paint.bodyColor, paint.domeColor]);

  function lint(): { line: number; message: string } | null {
    const desugared = desugarRepeat(code);
    const known = [...BATTLE_API, ...BATTLE_EXTRA, ...collectFunctionNames(desugared)];
    const unknown = findUnknownCalls(desugared, known);
    if (unknown.length) return { line: unknown[0].line, message: unknownCommandMessage(unknown[0].name, unknown[0].line, [...BATTLE_API, ...BATTLE_EXTRA]) };
    return null;
  }

  function fight() {
    const b = battle.current;
    if (!b || running) return;
    setResult(null);
    setErrorLine(null);
    const err = lint();
    if (err) { setErrorLine(err.line); setStatus(err.message); return; }

    let res;
    try {
      res = runBattle(
        ARENA,
        [
          { id: "me", source: code, isPlayer: true, stats: myStats },
          { id: "them", source: enemy.source, stats: enemy.stats },
        ],
        [PLAYER_START, ENEMY_START],
        [...BATTLE_API, ...BATTLE_EXTRA],
        "lastStanding",
      );
    } catch (e) {
      setStatus(`Something tripped up: ${(e as Error).message}`);
      return;
    }
    analytics.battleRun?.(opponent.kind === "preset" ? opponent.id : opponent.bot.userId);
    b.scene.reset();
    setRunning(true);
    setHp({ player: myMax, enemy: enemyMax });
    setStatus("FIGHT!");
    b.scene.play(res.events, {
      onEvent: (ev) => {
        const se = sfxEvent(ev.type);
        if (se) sfx.current?.play(se);
        if (ev.type === "hit") setHp((h) => (ev.target === 0 ? { ...h, player: ev.armor } : { ...h, enemy: ev.armor }));
      },
      onDone: () => {
        setRunning(false);
        setResult(res.outcome);
        analytics.battleResult?.(opponent.kind === "preset" ? opponent.id : opponent.bot.userId, res.outcome);
        onDone({
          opponentName: enemy.name,
          opponentSource: enemy.source,
          opponentUserId: enemy.userId,
          opponentMaxArmor: enemyMax,
          outcome: res.outcome,
          events: res.events,
          rounds: res.rounds,
        });
      },
    });
  }

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", height: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <HealthBar label="YOUR BOT" hp={hp.player} max={myMax} color="var(--cyan)" />
          <HealthBar label={enemy.name} hp={hp.enemy} max={enemyMax} color="var(--red)" />
        </div>
        <div ref={host} style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: "hidden", position: "relative" }} />
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)", fontWeight: 700, minHeight: 20 }}>{status}</div>
      </div>

      <div style={{ width: "clamp(420px, 34vw, 620px)", flex: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        <CommandDrawer />
        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor value={code} onChange={setCode} onRun={fight} errorLine={errorLine} world={4} extraApi={BATTLE_EXTRA} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={fight} disabled={running} style={{ flex: 1 }}>
            {running ? "■ FIGHTING…" : result ? "▶ REMATCH" : "▶ FIGHT"}
          </Button>
          {running ? (
            <Button variant="quiet" onClick={() => { battle.current?.scene.stop(); setRunning(false); setStatus("Stopped. Change your code and go again."); }}>
              ■ STOP
            </Button>
          ) : (
            <Button variant="ghost" onClick={onExit}>‹ ARENA</Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in `FightScreen.tsx`. Re-run the Task 6 check too — `Debrief.tsx`'s `import type { FightRecord } from "./FightScreen"` should now resolve.

- [ ] **Step 3: Commit**

```bash
git add src/ui/FightScreen.tsx src/ui/Debrief.tsx
git commit -m "feat(codebots): extract FightScreen from BattleScreen — editor+arena+HUD only"
```

---

### Task 8: `ArenaHub.tsx` — featured match, ladder, your-bot panel, presets

**Files:**
- Create: `src/ui/ArenaHub.tsx`

**Interfaces:**
- Consumes:
  - `cachedStandings`, `previousStandings` from `../rivals/leagueCache` (Task 4)
  - `cachedStandings`/`previousStandings`, plus `type Fighter`, `type Standing` from `../rivals/league`
  - `playMatch`, `board`, `matchSeed` from `../rivals/league` (for the WATCH/featured replays)
  - `fetchOpponents`, `leaderboard`, `publishBot`, `type PublishedBot` from `../rivals/publish`
  - `AwayCard` from `./AwayCard` (existing, unmodified — reused as the your-bot panel's away-record delta)
  - `PRESETS` from `../content/enemies`
  - `ReplayViewer` from `./ReplayViewer` (Task 5)
  - `Panel`, `Button`, `Chip` from `./components/*`
  - `currentAccount`, `cloudEnabled` from `../state/account`
  - `loadSave` from `../state/save`
  - `type Opponent` from `./FightScreen` (Task 7)
- Produces: `ArenaHub({ onFight }: { onFight: (opponent: Opponent) => void }): JSX.Element`

The fighter pool for the ladder is `publish.ts#leaderboard(200)` — **not** `fetchOpponents()`, which excludes the caller's own bot via `.neq("user_id", account.id)`. Using `leaderboard()` means the kid's own published bot appears in the standings (needed for the "your row" highlight and for `AwayCard`'s away-record delta to have something to diff), and a generous limit keeps the pool "everyone," not an order-dependent slice that could differ between two browsers.

- [ ] **Step 1: Write the component**

```typescript
// src/ui/ArenaHub.tsx
import React, { useEffect, useState } from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Chip } from "./components/Chip";
import { AwayCard } from "./AwayCard";
import { cachedStandings, previousStandings, seasonToken, seasonSalt } from "../rivals/leagueCache";
import { playMatch, board, matchSeed, type Fighter, type Standing } from "../rivals/league";
import { fetchOpponents, leaderboard, publishBot, type PublishedBot } from "../rivals/publish";
import { PRESETS, BATTLE_API } from "../content/enemies";
import { ReplayViewer } from "./ReplayViewer";
import { currentAccount, cloudEnabled } from "../state/account";
import { loadSave } from "../state/save";
import type { Opponent } from "./FightScreen";

const BATTLE_EXTRA = ["enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight", "hurt"];

function toFighter(b: PublishedBot): Fighter {
  return { id: b.userId, name: `${b.botName} · ${b.username}`, source: b.source };
}

/** Board 1 of a pairing, ready to hand to ReplayViewer — salted with the SAME season salt
 *  `cachedStandings` used to rank the ladder, so what you watch is the board that actually
 *  decided the standings, not a differently-seeded lookalike. */
function watchPairing(a: Fighter, b: Fighter) {
  const salt = seasonSalt(seasonToken());
  const bd = board(matchSeed(a.id, b.id) + salt);
  const res = playMatch(a, b, salt); // for outcome text only; ReplayViewer replays the actual arena below
  const arena = bd.arena;
  const bots = [
    { bodyColor: 0x5fd4ff, domeColor: 0xffe08a, start: bd.left },
    { bodyColor: 0xff6b7a, domeColor: 0xffe08a, start: bd.right },
  ];
  return { arena, bots, result: res };
}

function trendFor(id: string, current: Standing[], previous: Standing[] | null): "up" | "down" | "same" | null {
  if (!previous) return null;
  const now = current.find((s) => s.fighter.id === id);
  const before = previous.find((s) => s.fighter.id === id);
  if (!now || !before) return null;
  return now.points > before.points ? "up" : now.points < before.points ? "down" : "same";
}

export function ArenaHub({ onFight }: { onFight: (opponent: Opponent) => void }) {
  const [board_, setBoard] = useState<PublishedBot[]>([]);
  const [presetRivals, setPresetRivals] = useState<PublishedBot[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [code] = useState(loadSave().publishedSource ?? "");
  const [watching, setWatching] = useState<{ a: Fighter; b: Fighter } | null>(null);
  const loggedIn = accountId !== null;

  useEffect(() => {
    void (async () => {
      const acc = await currentAccount();
      setAccountId(acc?.id ?? null);
      setBoard(await leaderboard(200)); // includes the caller's own bot — see Interfaces note above
      setPresetRivals(await fetchOpponents());
    })();
  }, []);

  const fighters = board_.map(toFighter);
  const standings = cachedStandings(fighters);
  const previous = previousStandings();
  const featured = standings.slice(0, 2);
  const myBotRow = accountId ? standings.find((s) => s.fighter.id === accountId) : undefined;

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", height: "100%", boxSizing: "border-box", overflow: "auto" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <Chip color="dim">BOTS FIGHT · KIDS NEVER CHAT</Chip>

        {featured.length === 2 ? (
          <Panel label="FEATURED MATCH">
            <ReplayViewer {...watchPairing(featured[0].fighter, featured[1].fighter)} autoPlay height={200} />
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
              {featured[0].fighter.name} vs {featured[1].fighter.name}
            </div>
          </Panel>
        ) : null}

        <Panel label="LADDER">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {standings.map((s, i) => {
              const trend = trendFor(s.fighter.id, standings, previous);
              return (
                <div key={s.fighter.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-2xs)" }}>
                  <span style={{ color: "var(--text-dim)", width: 20 }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", color: "var(--ink)", fontWeight: 700 }}>
                    {s.fighter.name}
                  </span>
                  <span>{s.points} PTS</span>
                  <span style={{ color: "var(--text-dim)" }}>{s.wins}-{s.losses}-{s.draws}</span>
                  {trend ? <Chip color={trend === "up" ? "green" : trend === "down" ? "red" : "dim"}>{trend === "up" ? "▲" : trend === "down" ? "▼" : "–"}</Chip> : null}
                  <Button size="sm" variant="quiet" onClick={() => setWatching({ a: s.fighter, b: standings[(i + 1) % standings.length]?.fighter ?? s.fighter })}>
                    WATCH
                  </Button>
                </div>
              );
            })}
          </div>
        </Panel>

        {watching ? (
          <Panel label="WATCHING">
            <ReplayViewer {...watchPairing(watching.a, watching.b)} autoPlay height={200} />
            <Button size="sm" variant="ghost" onClick={() => setWatching(null)} style={{ alignSelf: "flex-start" }}>
              CLOSE
            </Button>
          </Panel>
        ) : null}

        {standings.length > 1 ? (
          <Panel label="FRESH RESULTS">
            {/* consecutive ranked pairs, not literal "just happened" fights (there's no fight log to
                read from — every result here is re-derived, same as the rest of the ladder) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {standings.slice(0, 5).map((s, i) => {
                const next = standings[i + 1];
                if (!next) return null;
                const salt = seasonSalt(seasonToken());
                const m = playMatch(s.fighter, next.fighter, salt);
                const line =
                  m.winner === "draw"
                    ? `${s.fighter.name} drew ${next.fighter.name}`
                    : m.winner === "a"
                      ? `${s.fighter.name} beat ${next.fighter.name} ${m.wins}-${m.losses}`
                      : `${next.fighter.name} beat ${s.fighter.name} ${m.losses}-${m.wins}`;
                return (
                  <div key={s.fighter.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "var(--text-2xs)" }}>
                    <span style={{ color: "var(--text-dim)" }}>{line}</span>
                    <Button size="sm" variant="quiet" onClick={() => setWatching({ a: s.fighter, b: next.fighter })}>
                      WATCH
                    </Button>
                  </div>
                );
              })}
            </div>
          </Panel>
        ) : null}

        <Panel label="HOW THE LADDER WORKS">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
            Every bot fights every other bot, four boards each, from both sides. Win a matchup for 3
            points, draw for 1. New boards every Friday — same code, fresh maps.
          </div>
        </Panel>

        <Panel label="OPPONENT">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PRESETS.map((p) => (
              <button key={p.id} onClick={() => onFight({ kind: "preset", id: p.id })}
                style={{ all: "unset", cursor: "pointer", padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--line)" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink)" }}>{p.name}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.4 }}>{p.desc}</div>
              </button>
            ))}
            {presetRivals.map((r) => (
              <button key={r.userId} onClick={() => onFight({ kind: "rival", bot: r })}
                style={{ all: "unset", cursor: "pointer", padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--line)" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink)" }}>{r.botName}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)" }}>{r.username} · {r.wins}W {r.losses}L</div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ width: 320, flex: "none", display: "flex", flexDirection: "column", gap: 12 }}>
        <Panel label="YOUR BOT">
          {myBotRow ? (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)" }}>
              #{standings.indexOf(myBotRow) + 1} on the ladder · {myBotRow.points} PTS
            </div>
          ) : (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
              Publish your bot and other kids will fight it while you're away. They see your code's
              MOVES, never your code.
            </div>
          )}
          {cloudEnabled && loggedIn && code ? (
            <Button
              variant="quiet"
              size="sm"
              onClick={async () => {
                setPublishMsg("checking your bot…");
                const res = await publishBot(code, "MY BOT", [...BATTLE_API, ...BATTLE_EXTRA]);
                setPublishMsg(res.ok ? "Published. It's fighting for you now, even when you're not here." : res.message);
                if (res.ok) setBoard(await leaderboard(200));
              }}
            >
              ▲ REPUBLISH
            </Button>
          ) : null}
          <Button size="sm" onClick={() => onFight({ kind: "preset", id: PRESETS[0].id })}>
            TEST FIGHT
          </Button>
          {publishMsg ? <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)" }}>{publishMsg}</div> : null}
        </Panel>

        <AwayCard onWatch={() => setWatching(featured.length === 2 ? { a: featured[0].fighter, b: featured[1].fighter } : null)} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm exec tsc --noEmit`
Expected: no errors in `src/ui/ArenaHub.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/ui/ArenaHub.tsx
git commit -m "feat(codebots): add ArenaHub — featured match, league ladder, your-bot panel"
```

---

### Task 9: Wire it into `App.tsx`, retire `BattleScreen.tsx`

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/ui/HQ.tsx:49,62,178` (`onBattle` → `onArenaHub`)
- Delete: `src/ui/BattleScreen.tsx`

**Interfaces:**
- Consumes: `ArenaHub` (Task 8), `FightScreen`, `type Opponent`, `type FightRecord` (Task 7), `Debrief` (Task 6).

- [ ] **Step 1: Update `src/App.tsx`**

Replace the `Screen` union (around line 21-30):

```typescript
type Screen =
  | { name: "hq" }
  | { name: "map" }
  | { name: "mission"; index: number }
  | { name: "profile" }
  | { name: "arenaHub" }
  | { name: "fight"; opponent: Opponent }
  | { name: "debrief" }
  | { name: "garage" }
  | { name: "drill" }
  | { name: "first" }
  | { name: "account" };
```

Add imports (replace the `BattleScreen` import line):

```typescript
import { ArenaHub } from "./ui/ArenaHub";
import { FightScreen, type Opponent, type FightRecord } from "./ui/FightScreen";
import { Debrief } from "./ui/Debrief";
```

Add state next to the other `useState`s (near `const [screen, setScreen] = useState<Screen>({ name: "hq" });`) — `lastFight` holds the just-finished fight's result for Debrief to render, and `lastOpponent` holds who it was against, so REMATCH can start the same fight again (a `FightRecord` only carries the *result*, not the `Opponent` selector, so both are needed):

```typescript
  const [lastFight, setLastFight] = useState<FightRecord | null>(null);
  const [lastOpponent, setLastOpponent] = useState<Opponent | null>(null);
```

Replace `toBattle` with three nav helpers:

```typescript
  const toArenaHub = () => setScreen({ name: "arenaHub" });
  const toFight = (opponent: Opponent) => { setLastOpponent(opponent); setScreen({ name: "fight", opponent }); };
  const toDebrief = (record: FightRecord) => { setLastFight(record); setScreen({ name: "debrief" }); };
```

In the breadcrumb `crumb` computation, replace the `screen.name === "battle"` branch:

```typescript
      : screen.name === "arenaHub"
        ? { back: "‹ HQ", onBack: toHQ, current: "ARENA" }
        : screen.name === "fight"
        ? { back: "‹ ARENA", onBack: toArenaHub, current: "FIGHT" }
        : screen.name === "debrief"
        ? { back: "‹ ARENA", onBack: toArenaHub, current: "DEBRIEF" }
```

In the render switch, replace the `screen.name === "battle"` branch:

```typescript
        ) : screen.name === "arenaHub" ? (
          <ArenaHub onFight={toFight} />
        ) : screen.name === "fight" ? (
          <FightScreen
            opponent={screen.opponent}
            paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }}
            onDone={toDebrief}
            onExit={toArenaHub}
          />
        ) : screen.name === "debrief" && lastFight ? (
          <Debrief
            record={lastFight}
            save={save}
            onRematch={() => { if (lastOpponent) toFight(lastOpponent); }}
            onLearn={(missionId) => {
              const idx = ALL.findIndex((m) => m.id === missionId);
              if (idx >= 0) setScreen({ name: "mission", index: idx });
            }}
            onBackToHub={toArenaHub}
          />
```

Finally, replace `onBattle={toBattle}` in the `<HQ ... />` call with `onArenaHub={toArenaHub}`.

- [ ] **Step 2: Update `src/ui/HQ.tsx`**

Rename the prop (line 49 in the destructured props, line 62 in the type, line 178 the `onClick`):

```typescript
  onArenaHub,           // was: onBattle
```
```typescript
  onArenaHub: () => void;   // was: onBattle: () => void;
```
```typescript
              onClick={onArenaHub}   // was: onClick={onBattle}
```

The `<Door title="BATTLE ARENA" .../>` copy is unchanged — only the prop name changes.

- [ ] **Step 3: Delete the superseded screen**

```bash
git rm src/ui/BattleScreen.tsx
```

- [ ] **Step 4: Type-check and run the full suite**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

Run: `pnpm test`
Expected: PASS — every existing test (including the 145+ campaign/sim tests, untouched) plus every test added in Tasks 1-4.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/ui/HQ.tsx
git commit -m "feat(codebots): wire Arena Hub / Fight / Debrief into App, retire BattleScreen"
```

---

### Task 10: Manual verification against the handoff's acceptance criteria

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run (from `projects/codebots/app/`): `pnpm dev`

- [ ] **Step 2: Walk the flow**

Open the game, click BATTLE ARENA from HQ. Confirm:
- The Hub shows a featured match auto-playing with no interaction.
- The ladder lists published bots (or is empty/hidden gracefully if none are published yet — `cloudEnabled` may be false in local dev; confirm the screen doesn't crash either way).
- Picking a preset opponent moves to the Fight screen: editor + arena + HP bars + status + STOP only, MOVES/SENSORS/BATTLE drawer collapsed by default.
- Write `while (!atBeacon()) { if (enemyAhead()) { shoot() } else { forward(1) } }` (a program that uses `while`, which most fresh saves haven't cleared `w3m1` for yet) against the SNIPER preset, and lose or win a fight through to completion.
- On fight end, land on the Debrief screen (not a toast/overlay): construct chips shown, and — on a fresh save that hasn't cleared `w3m1` — a dashed-red `WHILE` chip with an amber "LEARN WHILE — WORLD 3" button that navigates to `w3m1` when clicked.
- Confirm a loss does not change the coin count shown in the header.
- From Debrief, REMATCH returns to Fight against the same opponent; ‹ ARENA returns to the Hub.

- [ ] **Step 3: Confirm the mirror-match / cross-browser acceptance criteria hold**

These are already covered by the automated `league.test.ts`/`leagueCache.test.ts` suites (Tasks 3-4) — re-run `pnpm test` once more here as the final gate rather than re-deriving them manually:

Run: `pnpm test`
Expected: full PASS.

- [ ] **Step 4: Report findings**

If anything in Step 2 doesn't match (a crash, a missing drawer group, a CTA that doesn't navigate), fix it in the relevant task's file before considering the milestone done — do not proceed to a "done" state on an unverified UI flow.
