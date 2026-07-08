import type { Mission } from "../sim/engine";
import type { Arena, Vec2, CellKind, Facing } from "../sim/types";

/**
 * Open Field: endless randomized practice challenges. Each is a fresh arena the kid solves by
 * writing a program with the full command set. CRITICAL invariant — every generated challenge is
 * GUARANTEED solvable: after scattering obstacles we BFS a route from start to beacon and only keep
 * layouts where one exists, so a kid can never be handed an impossible field. (Barrels also block,
 * but the route avoids them, so navigation alone always works; shooting them is an optional shortcut.)
 */

const key = (x: number, y: number) => `${x},${y}`;
const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(arr: T[]): T => arr[rnd(arr.length)];

interface Layout {
  cols: number;
  rows: number;
  cells: CellKind[][];
  crates: Vec2[];
  targets: Vec2[];
  start: Vec2;
  beacon: Vec2;
  facing: Facing;
}

/** Cells the bot can stand on / pass through when just navigating (no shooting needed). */
function passable(l: Layout, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= l.cols || y >= l.rows) return false;
  const c = l.cells[y][x];
  if (c === "wall" || c === "pit" || c === "water") return false;
  if (l.crates.some((p) => p.x === x && p.y === y)) return false;
  if (l.targets.some((p) => p.x === x && p.y === y)) return false;
  return true;
}

/** Is there any obstacle-free route from start to beacon? (4-directional BFS.) */
function solvable(l: Layout): boolean {
  if (!passable(l, l.start.x, l.start.y) || !passable(l, l.beacon.x, l.beacon.y)) return false;
  const seen = new Set<string>([key(l.start.x, l.start.y)]);
  const queue: Vec2[] = [l.start];
  while (queue.length) {
    const p = queue.shift()!;
    if (p.x === l.beacon.x && p.y === l.beacon.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = p.x + dx, ny = p.y + dy;
      if (passable(l, nx, ny) && !seen.has(key(nx, ny))) {
        seen.add(key(nx, ny));
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return false;
}

function randomLayout(difficulty: number): Layout {
  const cols = 7 + rnd(4); // 7–10
  const rows = 5 + rnd(3); // 5–7
  const cells: CellKind[][] = Array.from({ length: rows }, () => Array<CellKind>(cols).fill("floor"));

  // start in a corner facing into the field; beacon somewhere on the far side.
  const corners: { pos: Vec2; facing: Facing }[] = [
    { pos: { x: 0, y: rows - 1 }, facing: "E" },
    { pos: { x: 0, y: 0 }, facing: "E" },
    { pos: { x: cols - 1, y: 0 }, facing: "S" },
  ];
  const { pos: start, facing } = pick(corners);
  let beacon: Vec2;
  do {
    beacon = { x: rnd(cols), y: rnd(rows) };
  } while (Math.abs(beacon.x - start.x) + Math.abs(beacon.y - start.y) < Math.max(cols, rows) - 1);

  const isReserved = (x: number, y: number) =>
    (x === start.x && y === start.y) || (x === beacon.x && y === beacon.y);

  // obstacle budget scales gently with difficulty (bounded so fields stay open).
  const cellCount = cols * rows;
  const wallN = Math.min(Math.floor(cellCount * (0.08 + difficulty * 0.015)), Math.floor(cellCount * 0.22));
  const crates: Vec2[] = [];
  const targets: Vec2[] = [];

  for (let i = 0; i < wallN; i++) {
    const x = rnd(cols), y = rnd(rows);
    if (isReserved(x, y) || cells[y][x] !== "floor") continue;
    const roll = Math.random();
    if (roll < 0.5) cells[y][x] = "wall";
    else if (roll < 0.65) cells[y][x] = "mud";
    else if (roll < 0.75) cells[y][x] = "pit";
    else crates.push({ x, y });
  }
  // a couple of shootable barrels for flavor (also just obstacles to route around)
  const barrelN = Math.min(1 + rnd(2), 3);
  for (let i = 0; i < barrelN; i++) {
    const x = rnd(cols), y = rnd(rows);
    if (isReserved(x, y) || cells[y][x] !== "floor") continue;
    if (crates.some((p) => p.x === x && p.y === y)) continue;
    targets.push({ x, y });
  }

  return { cols, rows, cells, crates, targets, start, beacon, facing };
}

function toMission(l: Layout, n: number): Mission {
  const arena: Arena = {
    cols: l.cols,
    rows: l.rows,
    cells: l.cells,
    crates: l.crates,
    coins: [],
    chests: [],
    gates: [],
    targets: l.targets,
    beacon: l.beacon,
  };
  return {
    id: `field-${n}`,
    world: 4, // full command set available
    index: 1,
    title: "OPEN FIELD",
    teaches: "free play",
    arena,
    start: { pos: l.start, facing: l.facing },
    parLines: 99, // no par pressure in free play
    starterCode: "// Reach the beacon! Use any command you know.\n// Barrels? shoot() them. Not sure how far? while (!atBeacon()) { ... }\n",
    hints: [
      "Find the beacon, then plan a route around the walls to it.",
      "blocked() checks for a wall ahead; shoot() clears a barrel; while (!atBeacon()) drives until you arrive.",
      "A wall-follower works on lots of fields: while (!atBeacon()) { if (blocked()) right(); else forward(1) }",
    ],
    briefing: "The Open Field — a fresh challenge every time. No stars, no par: just get your bot to the beacon however you like. Solve it, and a new one rolls in.",
    authorSolution: "",
    bonusStar: { kind: "zeroBumps" },
  };
}

/** A fresh, guaranteed-solvable Open Field challenge. `n` seeds the id + nudges difficulty upward. */
export function generateChallenge(n: number): Mission {
  const difficulty = Math.min(n, 8);
  for (let attempt = 0; attempt < 80; attempt++) {
    const layout = randomLayout(difficulty);
    if (solvable(layout)) return toMission(layout, n);
  }
  // Fallback: an open field with no obstacles is trivially solvable.
  const cols = 8, rows = 6;
  const layout: Layout = {
    cols, rows,
    cells: Array.from({ length: rows }, () => Array<CellKind>(cols).fill("floor")),
    crates: [], targets: [],
    start: { x: 0, y: rows - 1 }, beacon: { x: cols - 1, y: 0 }, facing: "E",
  };
  return toMission(layout, n);
}
