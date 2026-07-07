/**
 * Builds the six World 4 missions (functions). Teaching arc: NAME a sequence of commands, then
 * CALL it — reuse it, loop it, and compose functions from other functions. Scope: command-
 * composition functions only (no return values), per the spec. Author solutions are deterministic
 * open-floor courses; the verify oracle confirms each clears with 3 stars.
 * Run: npx tsx scripts/gen-world4.ts   then   npx tsx scripts/verify.ts content/missions/world4/*.json
 */
import { writeFileSync, mkdirSync } from "node:fs";

const V = (x: number, y: number) => ({ x, y });

interface Build {
  id: string; index: number; title: string; teaches: string;
  cols: number; rows: number;
  targets?: [number, number][];
  start: { x: number; y: number; facing: "N" | "E" | "S" | "W" };
  beacon: [number, number]; beaconStyle?: "beacon" | "chest";
  parLines: number; starterCode: string; hints: [string, string, string];
  briefing: string; authorSolution: string;
  bonus: { kind: "zeroBumps" } | { kind: "honkOnBeacon" } | { kind: "exactHonks"; count: number };
  unlock?: { part: string; cost: number };
}

function build(b: Build) {
  const cells = Array.from({ length: b.rows }, () => Array<string>(b.cols).fill("floor"));
  return {
    id: b.id, world: 4, index: b.index, title: b.title, teaches: b.teaches,
    arena: {
      cols: b.cols, rows: b.rows, cells,
      crates: [], coins: [], chests: [], gates: [],
      targets: (b.targets ?? []).map(([x, y]) => V(x, y)),
      beacon: V(b.beacon[0], b.beacon[1]),
      ...(b.beaconStyle ? { beaconStyle: b.beaconStyle } : {}),
    },
    start: { pos: V(b.start.x, b.start.y), facing: b.start.facing },
    parLines: b.parLines, starterCode: b.starterCode, hints: b.hints,
    briefing: b.briefing, authorSolution: b.authorSolution, bonusStar: b.bonus,
    ...(b.unlock ? { unlock: b.unlock } : {}),
  };
}

// stair(): +1 east, +1 south, ends facing east — a single diagonal step.
const STAIR = "function stair() {\n  forward(1)\n  right()\n  forward(1)\n  left()\n}";

const missions: Build[] = [
  // ── L1 — define + call ──────────────────────────────────────────────────────
  {
    id: "w4m1", index: 1, title: "NAME A MOVE", teaches: "define + call a function",
    cols: 5, rows: 5,
    start: { x: 0, y: 0, facing: "E" }, beacon: [3, 3],
    parLines: 10,
    starterCode: "// You can make your OWN command! function stair() { ... } names a move.\n// Then call it by name: stair()\n",
    hints: [
      "The staircase is the same move over and over: forward, turn, forward, turn back.",
      "Name it once with function stair() { ... }, then call stair() three times.",
      "function stair() { forward(1); right(); forward(1); left() }  then  stair(); stair(); stair()",
    ],
    briefing: "Time to build your own commands. A function gives a name to a bunch of moves. Name the staircase step 'stair', then just call stair() to use it — again and again.",
    authorSolution: `${STAIR}\nstair()\nstair()\nstair()`,
    bonus: { kind: "zeroBumps" },
    unlock: { part: "FUNCTION KEYS", cost: 0 },
  },
  // ── L2 — call your function inside a loop ───────────────────────────────────
  {
    id: "w4m2", index: 2, title: "CALL IT IN A LOOP", teaches: "function + repeat",
    cols: 7, rows: 7,
    start: { x: 0, y: 0, facing: "E" }, beacon: [5, 5],
    parLines: 10,
    starterCode: "// Your own command works anywhere — even inside a loop.\n",
    hints: [
      "Make stair() again, then don't call it five times by hand…",
      "…put it inside a repeat!",
      "function stair() { ... }  then  repeat 5 { stair() }",
    ],
    briefing: "A longer staircase — five steps. Name the step once, then let repeat call your stair() five times. Your commands and loops work together.",
    authorSolution: `${STAIR}\nrepeat 5 {\n  stair()\n}`,
    bonus: { kind: "zeroBumps" },
  },
  // ── L3 — two functions ──────────────────────────────────────────────────────
  {
    id: "w4m3", index: 3, title: "TWO TOOLS", teaches: "more than one function",
    cols: 8, rows: 6,
    start: { x: 0, y: 4, facing: "E" }, beacon: [6, 2],
    parLines: 14,
    starterCode: "// You can make as many commands as you want. Here: one to dash, one to climb.\n",
    hints: [
      "dash() rolls forward 3. climb() goes up 2 and faces east again.",
      "Then use them in order: dash(), climb(), dash().",
      "function dash() { forward(3) }  function climb() { left(); forward(2); right() }  then dash(); climb(); dash()",
    ],
    briefing: "Two jobs, two tools. Build dash() to sprint and climb() to go up a level, then snap them together like LEGO to reach the beacon.",
    authorSolution:
      "function dash() {\n  forward(3)\n}\nfunction climb() {\n  left()\n  forward(2)\n  right()\n}\ndash()\nclimb()\ndash()",
    bonus: { kind: "zeroBumps" },
  },
  // ── L4 — a function that contains a loop ────────────────────────────────────
  {
    id: "w4m4", index: 4, title: "A TOOL THAT LOOPS", teaches: "loops inside functions",
    cols: 6, rows: 6,
    start: { x: 0, y: 0, facing: "E" }, beacon: [4, 4],
    parLines: 10,
    starterCode: "// A function can hold a loop inside it. row() rolls a whole row.\n",
    hints: [
      "row() should drive forward 4 using a repeat inside it.",
      "Then: row(), turn right, row() — an L in three short lines.",
      "function row() { repeat 4 { forward(1) } }  then  row(); right(); row()",
    ],
    briefing: "Put a loop INSIDE a function. row() rolls four squares by itself. Call row(), turn the corner, call row() again — the loop hides inside your command.",
    authorSolution: "function row() {\n  repeat 4 {\n    forward(1)\n  }\n}\nrow()\nright()\nrow()",
    bonus: { kind: "zeroBumps" },
  },
  // ── L5 — functions calling functions (composition) ──────────────────────────
  {
    id: "w4m5", index: 5, title: "TOOLS FROM TOOLS", teaches: "functions calling functions",
    cols: 5, rows: 5,
    start: { x: 0, y: 0, facing: "E" }, beacon: [0, 3],
    parLines: 14,
    starterCode: "// Your commands can use your OTHER commands. leg() is built from step().\n",
    hints: [
      "step() moves forward 1. leg() calls step() three times, then turns right.",
      "Trace three legs to walk three sides of a square.",
      "function step(){ forward(1) }  function leg(){ step(); step(); step(); right() }  then repeat 3 { leg() }",
    ],
    briefing: "Commands built from commands. step() is tiny; leg() calls step() three times and turns. Three legs walk you around the block — small tools stacking into big ones.",
    authorSolution:
      "function step() {\n  forward(1)\n}\nfunction leg() {\n  step()\n  step()\n  step()\n  right()\n}\nrepeat 3 {\n  leg()\n}",
    bonus: { kind: "zeroBumps" },
  },
  // ── L6 — BOSS: build a routine, solve the factory ───────────────────────────
  {
    id: "w4m6", index: 6, title: "THE FACTORY", teaches: "functions: name it once, use it anywhere",
    cols: 9, rows: 8,
    start: { x: 0, y: 0, facing: "E" }, beacon: [7, 5], beaconStyle: "chest",
    parLines: 14,
    starterCode: "// Sprocket's factory floor. Name your staircase once — then use it in TWO places.\n",
    hints: [
      "Build stair() once. You'll use it before AND after a straight dash.",
      "repeat 3 { stair() }, then forward(2), then repeat 2 { stair() }.",
      "function stair(){...}  then  repeat 3 { stair() }  forward(2)  repeat 2 { stair() }",
    ],
    briefing: "The final run through Sprocket's factory. Name your staircase move once, and reuse it on both sides of the conveyor dash — one command, used wherever you need it, all the way to the treasure.",
    authorSolution: `${STAIR}\nrepeat 3 {\n  stair()\n}\nforward(2)\nrepeat 2 {\n  stair()\n}`,
    bonus: { kind: "zeroBumps" },
  },
];

mkdirSync(new URL("../content/missions/world4/", import.meta.url), { recursive: true });
for (const b of missions) {
  writeFileSync(new URL(`../content/missions/world4/${b.id}.json`, import.meta.url), JSON.stringify(build(b), null, 2) + "\n");
  console.log(`wrote ${b.id}.json`);
}
