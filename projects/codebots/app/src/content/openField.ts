import type { Mission } from "../sim/engine";
import type { Arena, Vec2, CellKind, Facing } from "../sim/types";

/**
 * Open Field: endless randomized practice. Each challenge is one of several TYPES (obstacle field,
 * maze, barrel gauntlet, long haul, hazard run) on a big arena, solved by writing any program.
 * CRITICAL invariant — every generated challenge is GUARANTEED solvable: after building a layout we
 * BFS a route from start to beacon and only keep ones where a route exists, so a kid can never be
 * handed an impossible field. (Barrels also block; the route avoids them, so navigation always works.)
 */

const key = (x: number, y: number) => `${x},${y}`;
const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(arr: T[]): T => arr[rnd(arr.length)];

interface Layout {
  label: string; // the challenge type name, shown to the kid
  cols: number;
  rows: number;
  cells: CellKind[][];
  crates: Vec2[];
  targets: Vec2[];
  start: Vec2;
  beacon: Vec2;
  facing: Facing;
}

function floorGrid(cols: number, rows: number, fill: CellKind = "floor"): CellKind[][] {
  return Array.from({ length: rows }, () => Array<CellKind>(cols).fill(fill));
}

/** Cells the bot can navigate through (no shooting needed). */
function passable(l: Layout, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= l.cols || y >= l.rows) return false;
  const c = l.cells[y][x];
  if (c === "wall" || c === "pit" || c === "water") return false;
  if (l.crates.some((p) => p.x === x && p.y === y)) return false;
  if (l.targets.some((p) => p.x === x && p.y === y)) return false;
  return true;
}

function solvable(l: Layout): boolean {
  if (!passable(l, l.start.x, l.start.y) || !passable(l, l.beacon.x, l.beacon.y)) return false;
  const seen = new Set<string>([key(l.start.x, l.start.y)]);
  const q: Vec2[] = [l.start];
  while (q.length) {
    const p = q.shift()!;
    if (p.x === l.beacon.x && p.y === l.beacon.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = p.x + dx, ny = p.y + dy;
      if (passable(l, nx, ny) && !seen.has(key(nx, ny))) { seen.add(key(nx, ny)); q.push({ x: nx, y: ny }); }
    }
  }
  return false;
}

function farBeacon(cols: number, rows: number, start: Vec2): Vec2 {
  let b: Vec2;
  do { b = { x: rnd(cols), y: rnd(rows) }; }
  while (Math.abs(b.x - start.x) + Math.abs(b.y - start.y) < Math.floor((cols + rows) / 2));
  return b;
}

// ── challenge types ──────────────────────────────────────────────────────────

/** Scattered walls, mud, pits and a few barrels across a big field. */
function genObstacles(diff: number): Layout {
  const cols = 10 + rnd(5), rows = 7 + rnd(4);
  const cells = floorGrid(cols, rows);
  const start: Vec2 = { x: 0, y: rows - 1 };
  const beacon = farBeacon(cols, rows, start);
  const reserved = (x: number, y: number) => (x === start.x && y === start.y) || (x === beacon.x && y === beacon.y);
  const crates: Vec2[] = [];
  const targets: Vec2[] = [];
  const n = Math.floor(cols * rows * (0.1 + diff * 0.012));
  for (let i = 0; i < n; i++) {
    const x = rnd(cols), y = rnd(rows);
    if (reserved(x, y) || cells[y][x] !== "floor") continue;
    const r = Math.random();
    if (r < 0.5) cells[y][x] = "wall";
    else if (r < 0.65) cells[y][x] = "mud";
    else if (r < 0.75) cells[y][x] = "pit";
    else if (r < 0.9) crates.push({ x, y });
    else targets.push({ x, y });
  }
  return { label: "OBSTACLE FIELD", cols, rows, cells, crates, targets, start, beacon, facing: "E" };
}

/** A long open run with a far beacon and only a few scattered barrels — big but breezy. */
function genHaul(diff: number): Layout {
  const cols = 12 + rnd(4), rows = 6 + rnd(3);
  const cells = floorGrid(cols, rows);
  const start: Vec2 = { x: 0, y: rnd(rows) };
  const beacon = farBeacon(cols, rows, start);
  const reserved = (x: number, y: number) => (x === start.x && y === start.y) || (x === beacon.x && y === beacon.y);
  const targets: Vec2[] = [];
  const crates: Vec2[] = [];
  for (let i = 0; i < 3 + diff; i++) {
    const x = rnd(cols), y = rnd(rows);
    if (reserved(x, y) || cells[y][x] !== "floor") continue;
    (Math.random() < 0.5 ? targets : crates).push({ x, y });
  }
  return { label: "THE LONG HAUL", cols, rows, cells, crates, targets, start, beacon, facing: "E" };
}

/** A straight-ish lane packed with barrels to blast. */
function genGauntlet(diff: number): Layout {
  const cols = 12 + rnd(4), rows = 5 + rnd(2);
  const cells = floorGrid(cols, rows);
  const lane = rnd(rows);
  const start: Vec2 = { x: 0, y: lane };
  const beacon: Vec2 = { x: cols - 1, y: lane };
  const targets: Vec2[] = [];
  for (let x = 2; x < cols - 1; x++) {
    if (Math.random() < 0.35 + diff * 0.03) targets.push({ x, y: lane });
  }
  // a few walls off the lane so it's not a pure corridor
  const crates: Vec2[] = [];
  for (let i = 0; i < rows; i++) {
    const x = 2 + rnd(cols - 3), y = rnd(rows);
    if (y !== lane && cells[y][x] === "floor") cells[y][x] = "wall";
  }
  return { label: "BARREL GAUNTLET", cols, rows, cells, crates, targets, start, beacon, facing: "E" };
}

/** A carved perfect maze (recursive backtracker) — always connected, so always solvable. */
function genMaze(): Layout {
  const cw = 4 + rnd(3), ch = 3 + rnd(2); // maze cells
  const cols = cw * 2 + 1, rows = ch * 2 + 1;
  const cells = floorGrid(cols, rows, "wall");
  const visited = new Set<string>();
  const carve = (cx: number, cy: number) => {
    visited.add(key(cx, cy));
    cells[cy * 2 + 1][cx * 2 + 1] = "floor";
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = cx + dx, ny = cy + dy;
      if (nx >= 0 && ny >= 0 && nx < cw && ny < ch && !visited.has(key(nx, ny))) {
        cells[cy * 2 + 1 + dy][cx * 2 + 1 + dx] = "floor"; // knock down the wall between
        carve(nx, ny);
      }
    }
  };
  carve(0, 0);
  const start: Vec2 = { x: 1, y: 1 };
  const beacon: Vec2 = { x: cols - 2, y: rows - 2 };
  return { label: "THE MAZE", cols, rows, cells, crates: [], targets: [], start, beacon, facing: "E" };
}

function toMission(l: Layout, n: number): Mission {
  const arena: Arena = {
    cols: l.cols, rows: l.rows, cells: l.cells,
    crates: l.crates, coins: [], chests: [], gates: [], targets: l.targets,
    beacon: l.beacon,
  };
  return {
    id: `field-${n}`,
    world: 4, // full command set
    index: 1,
    title: l.label,
    teaches: "free play",
    arena,
    start: { pos: l.start, facing: l.facing },
    parLines: 99,
    starterCode: "// Reach the beacon! Use any command you know.\n// Barrels? shoot() them. A maze? while (!atBeacon()) { if (blocked()) right(); else forward(1) }\n",
    hints: [
      "Find the beacon, then plan a route to it around the walls.",
      "blocked() checks a wall ahead; shoot() clears a barrel; while (!atBeacon()) drives until you arrive.",
      "A wall-follower solves lots of these: while (!atBeacon()) { if (blocked()) right(); else forward(1) }",
    ],
    briefing: `${l.label} — a fresh challenge. No stars, no par: get your bot to the beacon however you like. Solve it, and a new one rolls in.`,
    authorSolution: "",
    bonusStar: { kind: "zeroBumps" },
  };
}

const TYPES = [genObstacles, genHaul, genGauntlet, genMaze] as const;

/** A fresh, guaranteed-solvable Open Field challenge. `n` rotates the type + nudges difficulty. */
export function generateChallenge(n: number): Mission {
  const diff = Math.min(n, 8);
  for (let attempt = 0; attempt < 100; attempt++) {
    const gen = attempt < 60 ? TYPES[(n + Math.floor(attempt / 12)) % TYPES.length] : genObstacles;
    const layout = gen === genMaze ? gen(diff) : (gen as (d: number) => Layout)(diff);
    if (solvable(layout)) return toMission(layout, n);
  }
  // Fallback: an open field with no obstacles is trivially solvable.
  const cols = 10, rows = 7;
  return toMission(
    { label: "OPEN FIELD", cols, rows, cells: floorGrid(cols, rows), crates: [], targets: [],
      start: { x: 0, y: rows - 1 }, beacon: { x: cols - 1, y: 0 }, facing: "E" },
    n,
  );
}
