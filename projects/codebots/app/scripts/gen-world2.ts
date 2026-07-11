/**
 * Builds the six World 2 missions (sensors, if/else, shoot) as JSON. Generating them from a small
 * DSL beats hand-typing 40-cell arrays: fewer coordinate typos, and the arena reads like a picture.
 * Run: npx tsx scripts/gen-world2.ts   then   npx tsx scripts/verify.ts content/missions/world2/*.json
 */
import { writeFileSync, mkdirSync } from "node:fs";

type Cell = "floor" | "wall" | "mud" | "pit" | "water";
const V = (x: number, y: number) => ({ x, y });

function grid(cols: number, rows: number): Cell[][] {
  return Array.from({ length: rows }, () => Array<Cell>(cols).fill("floor"));
}

interface Build {
  id: string; index: number; title: string; teaches: string;
  cols: number; rows: number;
  walls?: [number, number][]; mud?: [number, number][];
  crates?: [number, number][]; targets?: [number, number][];
  start: { x: number; y: number; facing: "N" | "E" | "S" | "W" };
  beacon: [number, number]; beaconStyle?: "beacon" | "chest";
  parLines: number; starterCode: string; hints: [string, string, string];
  briefing: string; authorSolution: string;
  bonus: { kind: "zeroBumps" } | { kind: "honkOnBeacon" } | { kind: "exactHonks"; count: number };
  unlock?: { part: string; cost: number };
}

function build(b: Build) {
  const cells = grid(b.cols, b.rows);
  for (const [x, y] of b.walls ?? []) cells[y][x] = "wall";
  for (const [x, y] of b.mud ?? []) cells[y][x] = "mud";
  const mission = {
    id: b.id, world: 2, index: b.index, title: b.title, teaches: b.teaches,
    arena: {
      cols: b.cols, rows: b.rows, cells,
      crates: (b.crates ?? []).map(([x, y]) => V(x, y)),
      coins: [],
      chests: [],
      gates: [],
      targets: (b.targets ?? []).map(([x, y]) => V(x, y)),
      beacon: V(b.beacon[0], b.beacon[1]),
      ...(b.beaconStyle ? { beaconStyle: b.beaconStyle } : {}),
    },
    start: { pos: V(b.start.x, b.start.y), facing: b.start.facing },
    parLines: b.parLines,
    starterCode: b.starterCode,
    hints: b.hints,
    briefing: b.briefing,
    authorSolution: b.authorSolution,
    bonusStar: b.bonus,
    ...(b.unlock ? { unlock: b.unlock } : {}),
  };
  return mission;
}

const missions: Build[] = [
  // ── L1 — blocked() + if ────────────────────────────────────────────────────
  {
    id: "w2m1", index: 1, title: "FIRST LOOK", teaches: "blocked() + if",
    cols: 8, rows: 5,
    walls: [[4, 2]],
    start: { x: 0, y: 2, facing: "E" }, beacon: [7, 2],
    parLines: 12,
    starterCode: "// New gadget: blocked() tells you if something's in the way.\n// Roll up to the wall, then go around it.\nforward(3)\n",
    hints: [
      "Roll up until you're right in front of the wall — that's when blocked() can feel it.",
      "Put your turn INSIDE if (blocked()) { } so the bot only turns when a wall is really there.",
      "After you round the wall, face east again and roll the last squares to the beacon.",
    ],
    briefing: "New chip installed: a SCANNER. blocked() looks one square ahead and says yes or no. Use it with if to go around Sprocket's wall — no crashing.",
    authorSolution: "forward(3)\nif (blocked()) {\n  left()\n  forward(1)\n  right()\n  forward(2)\n  right()\n  forward(1)\n  left()\n}\nforward(2)",
    bonus: { kind: "zeroBumps" },
    unlock: { part: "SCANNER", cost: 0 },
  },
  // ── L2 — shoot() ALONE (a barrel you can see is dead ahead) ────────────────
  {
    id: "w2m2s", index: 2, title: "TAKE THE SHOT", teaches: "shoot()",
    cols: 8, rows: 3,
    targets: [[2, 1], [4, 1]],
    start: { x: 0, y: 1, facing: "E" }, beacon: [7, 1],
    parLines: 4,
    starterCode: "// New gear: a BLASTER. shoot() fires straight ahead and smashes a barrel.\n// The barrels are right in your lane — blast them and roll on.\n",
    hints: [
      "The barrel is dead ahead — you don't need to check anything, just fire.",
      "shoot() smashes the first barrel in front of you. Then keep rolling.",
      "Blast, drive, blast the next one, then drive to the beacon.",
    ],
    briefing: "Your new BLASTER clears the way. See a barrel in your lane? shoot() smashes it. No sensors yet — just aim down the runway and fire.",
    authorSolution: "shoot()\nforward(2)\nshoot()\nforward(5)",
    bonus: { kind: "zeroBumps" },
    unlock: { part: "BLASTER", cost: 0 },
  },
  // ── L3 — targetAhead() (know WHEN to shoot, in a loop) ─────────────────────
  {
    id: "w2m2", index: 3, title: "BLAST IT", teaches: "targetAhead()",
    cols: 8, rows: 3,
    targets: [[2, 1], [5, 1]],
    start: { x: 0, y: 1, facing: "E" }, beacon: [7, 1],
    parLines: 6,
    starterCode: "// New sensor: targetAhead() tells you when a barrel is right ahead —\n// so your loop knows WHEN to shoot instead of firing blindly.\n",
    hints: [
      "The runway is a straight line — clear barrels only when there's one to clear.",
      "Before each roll, ask targetAhead(). If it's yes, shoot() before you move.",
      "Wrap 'check, maybe shoot, then forward' in a repeat so it handles every square.",
    ],
    briefing: "More barrels — but firing blindly wastes shots. targetAhead() is a yes/no sensor: it tells you when a barrel's right in front. Check it, then shoot only when you need to.",
    authorSolution: "repeat 7 {\n  if (targetAhead()) {\n    shoot()\n  }\n  forward(1)\n}",
    bonus: { kind: "zeroBumps" },
  },
  // ── L3 — if / else ─────────────────────────────────────────────────────────
  {
    id: "w2m3", index: 4, title: "THIS WAY OR THAT", teaches: "if / else",
    cols: 8, rows: 5,
    walls: [[4, 2]],
    start: { x: 0, y: 2, facing: "E" }, beacon: [7, 2],
    parLines: 14,
    starterCode: "// if does something WHEN true. else does something when it's NOT.\nforward(3)\n",
    hints: [
      "This time write BOTH paths: what to do when blocked, and what to do when the road's clear.",
      "if (blocked()) { …go around… } else { …drive straight… } — the bot picks one.",
      "In the blocked path, dip around the wall and come back to the same row before you finish.",
    ],
    briefing: "Sometimes the road's clear, sometimes it's not. if handles the blocked road; else handles the open one. Teach Sparkplug to do both.",
    authorSolution: "forward(3)\nif (blocked()) {\n  right()\n  forward(1)\n  left()\n  forward(2)\n  left()\n  forward(1)\n  right()\n} else {\n  forward(2)\n}\nforward(2)",
    bonus: { kind: "zeroBumps" },
  },
  // ── L4 — atBeacon() ────────────────────────────────────────────────────────
  {
    id: "w2m4", index: 5, title: "ARE WE THERE YET", teaches: "atBeacon()",
    cols: 8, rows: 3,
    mud: [[3, 1]],
    start: { x: 0, y: 1, facing: "E" }, beacon: [6, 1],
    parLines: 6,
    starterCode: "// atBeacon() is yes/no: are you standing on the goal yet?\n",
    hints: [
      "You don't know which step lands you on the goal — so check after every step.",
      "After each forward, ask if (atBeacon()) and honk() when it's true.",
      "Loop 'forward, then check' enough times to cover the whole lane.",
    ],
    briefing: "Learn to KNOW when you've arrived. Roll forward, and each step ask atBeacon(). When it's yes, sound the horn right on the goal.",
    authorSolution: "repeat 6 {\n  forward(1)\n  if (atBeacon()) {\n    honk()\n  }\n}",
    bonus: { kind: "honkOnBeacon" },
  },
  // ── L5 — combine: if/else with shoot in a loop ─────────────────────────────
  {
    id: "w2m5", index: 6, title: "MIXED BAG", teaches: "if / else + shoot",
    cols: 8, rows: 3,
    targets: [[3, 1], [6, 1]],
    start: { x: 0, y: 1, facing: "E" }, beacon: [7, 1],
    parLines: 7,
    starterCode: "// Put it together: if there's a barrel, shoot it — otherwise, drive on.\n",
    hints: [
      "One loop can handle the whole runway: some squares have a barrel, some are open.",
      "if (targetAhead()) { shoot() } else { forward(1) } — blast when there's a barrel, roll when there isn't.",
      "Repeat that one decision enough times to reach the far end.",
    ],
    briefing: "Two barrels, some open road. Each turn: if a barrel's ahead, blast it; else roll forward. One tidy loop clears the lot.",
    authorSolution: "repeat 9 {\n  if (targetAhead()) {\n    shoot()\n  } else {\n    forward(1)\n  }\n}",
    bonus: { kind: "zeroBumps" },
  },
  // ── L6 — BOSS: the gauntlet ────────────────────────────────────────────────
  {
    id: "w2m6", index: 7, title: "SPROCKET'S GAUNTLET", teaches: "everything: sense, shoot, decide",
    cols: 10, rows: 6,
    walls: [[6, 5], [6, 4], [6, 3], [6, 2]],
    targets: [[3, 5], [8, 1]],
    start: { x: 0, y: 5, facing: "E" }, beacon: [9, 0], beaconStyle: "chest",
    // Par must match the solution written the way a KID writes it (multi-line blocks), not crammed
    // onto one line — otherwise good, readable code loses the star.
    parLines: 15,
    starterCode: "// The gauntlet: barrels to blast, a wall to round, treasure at the top.\n// Sense before you act.\n",
    hints: [
      "Two jobs: blast the barrels, and get around the wall in the middle.",
      "Use targetAhead()/shoot() for the barrels, and turn at the wall to climb the open side.",
      "Bottom row to the wall, up the clear side, across the top (mind the barrel), then up to the chest.",
    ],
    briefing: "Sprocket's final trap: barrels AND a wall between you and the treasure. Use everything — blocked(), targetAhead(), shoot() — to reach the chest.",
    authorSolution: [
      "forward(2)",
      "if (targetAhead()) {",
      "  shoot()",
      "}",
      "forward(3)",
      "left()",
      "forward(4)",
      "right()",
      "forward(2)",
      "if (targetAhead()) {",
      "  shoot()",
      "}",
      "forward(2)",
      "left()",
      "forward(1)",
    ].join("\n"),
    bonus: { kind: "zeroBumps" },
  },
];

mkdirSync(new URL("../content/missions/world2/", import.meta.url), { recursive: true });
for (const b of missions) {
  const m = build(b);
  const path = new URL(`../content/missions/world2/${b.id}.json`, import.meta.url);
  writeFileSync(path, JSON.stringify(m, null, 2) + "\n");
  console.log(`wrote ${b.id}.json`);
}
