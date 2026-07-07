/**
 * Builds the six World 3 missions (while loops). The teaching arc: one navigator program
 *   while (!atBeacon()) { if (targetAhead()) shoot(); else if (blocked()) right(); else forward() }
 * solves ANY clockwise-turning corridor of ANY length — the whole point of while over repeat.
 * Corridors are carved as a 1-wide floor path on an all-wall grid, so they're branchless and the
 * right-hand rule is unambiguous. The verify oracle proves each actually terminates on the beacon.
 * Run: npx tsx scripts/gen-world3.ts   then   npx tsx scripts/verify.ts content/missions/world3/*.json
 */
import { writeFileSync, mkdirSync } from "node:fs";

type Cell = "floor" | "wall";
const V = (x: number, y: number) => ({ x, y });

/** Inclusive straight segment between two points (horizontal or vertical). */
function line(x1: number, y1: number, x2: number, y2: number): [number, number][] {
  const out: [number, number][] = [];
  const dx = Math.sign(x2 - x1);
  const dy = Math.sign(y2 - y1);
  let x = x1, y = y1;
  out.push([x, y]);
  while (x !== x2 || y !== y2) { x += dx; y += dy; out.push([x, y]); }
  return out;
}

/** Join segments into one path, dropping the duplicated corner cell where segments meet. */
function join(...segs: [number, number][][]): [number, number][] {
  const out: [number, number][] = [];
  for (const seg of segs) {
    for (const c of seg) {
      const last = out[out.length - 1];
      if (last && last[0] === c[0] && last[1] === c[1]) continue;
      out.push(c);
    }
  }
  return out;
}

interface Build {
  id: string; index: number; title: string; teaches: string;
  cols: number; rows: number;
  /** if given, the arena is all wall except these floor cells (a branchless corridor) */
  path?: [number, number][];
  open?: boolean; // all floor (no walls) — for the simple straight lanes
  targets?: [number, number][];
  start: { x: number; y: number; facing: "N" | "E" | "S" | "W" };
  beacon: [number, number]; beaconStyle?: "beacon" | "chest";
  parLines: number; starterCode: string; hints: [string, string, string];
  briefing: string; authorSolution: string;
  bonus: { kind: "zeroBumps" } | { kind: "honkOnBeacon" } | { kind: "exactHonks"; count: number };
  unlock?: { part: string; cost: number };
}

function build(b: Build) {
  const fill: Cell = b.open ? "floor" : "wall";
  const cells: Cell[][] = Array.from({ length: b.rows }, () => Array<Cell>(b.cols).fill(fill));
  if (!b.open) for (const [x, y] of b.path ?? []) cells[y][x] = "floor";
  return {
    id: b.id, world: 3, index: b.index, title: b.title, teaches: b.teaches,
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

// The master navigator — used (in growing form) across the world.
const DRIVE_TO_BEACON = "while (!atBeacon()) {\n  forward(1)\n}";
const WALL_RULE =
  "while (!atBeacon()) {\n  if (blocked()) {\n    right()\n  } else {\n    forward(1)\n  }\n}";
const FULL_RULE =
  "while (!atBeacon()) {\n  if (targetAhead()) {\n    shoot()\n  } else if (blocked()) {\n    right()\n  } else {\n    forward(1)\n  }\n}";
const SHOOT_LANE =
  "while (!atBeacon()) {\n  if (targetAhead()) {\n    shoot()\n  } else {\n    forward(1)\n  }\n}";

const missions: Build[] = [
  // ── L1 — while (!atBeacon()) ────────────────────────────────────────────────
  {
    id: "w3m1", index: 1, title: "ROLL ON", teaches: "while (!atBeacon())",
    cols: 9, rows: 3, open: true,
    start: { x: 0, y: 1, facing: "E" }, beacon: [7, 1],
    parLines: 3,
    starterCode: "// New idea: while repeats AS LONG AS something is true.\n// You don't know how long the runway is — so just drive until you're there.\n",
    hints: [
      "while (!atBeacon()) means 'keep going until you reach the goal'.",
      "The ! means NOT. So: while NOT at the beacon, roll forward.",
      "while (!atBeacon()) { forward(1) }",
    ],
    briefing: "repeat needs a number. But what if you don't KNOW the number? while keeps going until a test stops being true. Drive until atBeacon() — no counting.",
    authorSolution: DRIVE_TO_BEACON,
    bonus: { kind: "zeroBumps" },
    unlock: { part: "AUTO-DRIVE", cost: 0 },
  },
  // ── L2 — while + shoot (unknown # of barrels) ───────────────────────────────
  {
    id: "w3m2", index: 2, title: "RUN THE BLOCKADE", teaches: "while + shoot",
    cols: 9, rows: 3, open: true,
    targets: [[2, 1], [3, 1], [6, 1]],
    start: { x: 0, y: 1, facing: "E" }, beacon: [8, 1],
    parLines: 7,
    starterCode: "// Same idea, but barrels in the way. Keep driving until you arrive —\n// blasting any barrel you meet.\n",
    hints: [
      "while (!atBeacon()) around the whole thing.",
      "Each pass: if there's a barrel, shoot it; otherwise roll forward.",
      "while (!atBeacon()) { if (targetAhead()) { shoot() } else { forward(1) } }",
    ],
    briefing: "Sprocket packed the runway with barrels — you can't count them all. Let while do the counting: keep going until atBeacon(), blasting whatever's in front.",
    authorSolution: SHOOT_LANE,
    bonus: { kind: "zeroBumps" },
  },
  // ── L3 — the right-hand rule: one corner ────────────────────────────────────
  {
    id: "w3m3", index: 3, title: "AROUND THE BEND", teaches: "while + if/else turning",
    cols: 7, rows: 6,
    path: join(line(0, 2, 4, 2), line(4, 2, 4, 4)),
    start: { x: 0, y: 2, facing: "E" }, beacon: [4, 4],
    parLines: 7,
    starterCode: "// The corridor turns. When you're blocked, turn right — otherwise roll on.\n",
    hints: [
      "Loop until you reach the beacon.",
      "Inside: if (blocked()) turn right; else forward. Let the loop handle the corner.",
      "while (!atBeacon()) { if (blocked()) { right() } else { forward(1) } }",
    ],
    briefing: "A corner you can't see the end of. The trick: when the wall stops you, turn right; otherwise keep rolling. One little loop drives the whole bend.",
    authorSolution: WALL_RULE,
    bonus: { kind: "zeroBumps" },
  },
  // ── L4 — same rule, more corners (⊐ shape) ──────────────────────────────────
  {
    id: "w3m4", index: 4, title: "THREE SIDES", teaches: "while handles ANY turns",
    cols: 7, rows: 6,
    path: join(line(1, 1, 5, 1), line(5, 1, 5, 4), line(5, 4, 1, 4)),
    start: { x: 1, y: 1, facing: "E" }, beacon: [1, 4],
    parLines: 7,
    starterCode: "// Two corners now. The SAME loop as before still works — that's the magic.\n",
    hints: [
      "Don't write more code for more corners.",
      "The exact same while + if (blocked()) right() else forward() drives all of it.",
      "while (!atBeacon()) { if (blocked()) { right() } else { forward(1) } }",
    ],
    briefing: "More corners, same loop. A while loop doesn't care if there's one turn or ten — 'blocked? turn right; else roll' handles them all.",
    authorSolution: WALL_RULE,
    bonus: { kind: "zeroBumps" },
  },
  // ── L5 — full rule: turns AND barrels ───────────────────────────────────────
  {
    id: "w3m5", index: 5, title: "TWISTS AND BARRELS", teaches: "while + shoot + turn",
    cols: 8, rows: 6,
    path: join(line(0, 1, 5, 1), line(5, 1, 5, 4), line(5, 4, 2, 4)),
    targets: [[3, 1], [5, 3]],
    start: { x: 0, y: 1, facing: "E" }, beacon: [2, 4],
    parLines: 9,
    starterCode: "// Corners AND barrels. One loop: shoot if you must, turn if blocked, else roll.\n",
    hints: [
      "Order matters: check for a barrel FIRST, then a wall, then just drive.",
      "if (targetAhead()) shoot(); else if (blocked()) right(); else forward().",
      "while (!atBeacon()) { if (targetAhead()) { shoot() } else if (blocked()) { right() } else { forward(1) } }",
    ],
    briefing: "The full navigator: barrels to blast and corners to round, length unknown. Chain the decisions — barrel? wall? open road? — inside one while.",
    authorSolution: FULL_RULE,
    bonus: { kind: "zeroBumps" },
  },
  // ── L6 — BOSS: the spiral vault ─────────────────────────────────────────────
  {
    id: "w3m6", index: 6, title: "THE SPIRAL VAULT", teaches: "while: the master navigator",
    cols: 9, rows: 9,
    path: join(
      line(1, 1, 7, 1), // top outer  E
      line(7, 1, 7, 7), // right outer S
      line(7, 7, 1, 7), // bottom outer W
      line(1, 7, 1, 3), // left outer N
      line(1, 3, 5, 3), // inner top  E
      line(5, 3, 5, 5), // inner right S
      line(5, 5, 3, 5), // inner bottom W
    ),
    targets: [[4, 1], [7, 4]],
    start: { x: 1, y: 1, facing: "E" }, beacon: [3, 5], beaconStyle: "chest",
    parLines: 9,
    starterCode: "// Sprocket's vault spirals inward. But your navigator already knows the way —\n// the same loop, all the way to the treasure.\n",
    hints: [
      "You already wrote this program. Don't overthink it.",
      "shoot the barrels, turn right at walls, roll otherwise — until atBeacon().",
      "while (!atBeacon()) { if (targetAhead()) { shoot() } else if (blocked()) { right() } else { forward(1) } }",
    ],
    briefing: "The treasure sits at the heart of a spiral vault — barrels on the arms, walls at every turn. One while loop, the navigator you built, winds all the way in.",
    authorSolution: FULL_RULE,
    bonus: { kind: "zeroBumps" },
  },
];

mkdirSync(new URL("../content/missions/world3/", import.meta.url), { recursive: true });
for (const b of missions) {
  writeFileSync(new URL(`../content/missions/world3/${b.id}.json`, import.meta.url), JSON.stringify(build(b), null, 2) + "\n");
  console.log(`wrote ${b.id}.json`);
}
