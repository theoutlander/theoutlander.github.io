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
      "Trace the path to the beacon with your finger. It isn't a straight line — it's a staircase. Over a square, down a square, over, down. The same little move, again and again.",
      "Writing that move out over and over is a waste of your time. Give the move a name instead, so you can build it once and then use it every time you need a step.",
      "function ???() { ... } — the lines for ONE staircase step go inside. Then call it once per step. What do you NAME this move, and how many steps does the staircase have?",
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
      "This staircase is longer than the last one. Count the steps between your bot and the beacon. Do you want to type the same move out that many times?",
      "Name the one-step move like you did before. Then, instead of calling it by hand once per step, let a loop do the calling for you.",
      "repeat ??? { ??? } — a loop can call a command YOU made, not only the built-in ones. What goes inside the loop, and what number goes after repeat?",
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
      "Follow the route to the beacon. Part of it is a long straight run. Part of it is going up a level and carrying on. Two different kinds of move — and one of them shows up more than once.",
      "You can build more than one command. Give a name to the straight run, and a different name to the going-up move. Then your plan is only those two names, in the right order.",
      "function ???() { ... } and function ???() { ... }, then a few lines at the bottom that call them. Which lines belong inside each one, what do you name them, and which order do you call them in?",
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
      "The path to the beacon is an L: a straight run, one turn, then another straight run. Look closely at the two runs. How are they the same?",
      "Build one command that drives a whole straight run all on its own — the repeating is its job, not yours. Then your main code is a run, a turn, and a run.",
      "function ???() { repeat ??? { ??? } } — then three short lines below it. How long is one run, what repeats inside, and what do you name the command?",
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
      "You're walking around a block. Each side is the same: the same number of squares, then a turn at the corner. And a side is really one square, over and over.",
      "Give the one-square move a name. Then give a whole side a name too. When you write the side, you already have a command for the square — you don't need to start from scratch.",
      "function ???() { ... } for the tiny move, and function ???() { ??? } for a full side. Then repeat ??? { ??? } to walk the block. What lines fill the side, and what do you name each one?",
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
      "Look at the whole route to the chest. Staircase, then a flat dash straight across, then staircase again. The two staircases are made of the very same move.",
      "Name that one staircase step, once. Then use the name on both sides of the dash — a command you build works anywhere you need it, as many times as you like.",
      "Build your staircase function, then below it: some stairs, a dash straight across, then more stairs. How many stairs before the dash, how far is the dash, and how many stairs after?",
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
