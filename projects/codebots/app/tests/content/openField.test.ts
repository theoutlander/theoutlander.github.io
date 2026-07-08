import { describe, it, expect } from "vitest";
import { generateChallenge } from "../../src/content/openField";
import { runInSandbox } from "../../src/sandbox/driver";
import type { Mission } from "../../src/sim/engine";
import type { Facing } from "../../src/sim/types";

/** Independent BFS (re-implemented here, NOT the generator's own check) over the generated arena:
 *  can the bot reach the beacon by navigating obstacle-free cells? This is the guarantee the whole
 *  Open Field mode rests on — a kid must never be handed an impossible field. */
function hasRoute(m: Mission): boolean {
  const a = m.arena;
  const blocked = new Set<string>();
  for (const c of a.crates) blocked.add(`${c.x},${c.y}`);
  for (const t of a.targets ?? []) blocked.add(`${t.x},${t.y}`);
  const passable = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= a.cols || y >= a.rows) return false;
    const k = a.cells[y][x];
    if (k === "wall" || k === "pit" || k === "water") return false;
    return !blocked.has(`${x},${y}`);
  };
  const start = m.start.pos;
  if (!passable(start.x, start.y) || !passable(a.beacon.x, a.beacon.y)) return false;
  const seen = new Set([`${start.x},${start.y}`]);
  const q = [start];
  while (q.length) {
    const p = q.shift()!;
    if (p.x === a.beacon.x && p.y === a.beacon.y) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = p.x + dx, ny = p.y + dy;
      if (passable(nx, ny) && !seen.has(`${nx},${ny}`)) { seen.add(`${nx},${ny}`); q.push({ x: nx, y: ny }); }
    }
  }
  return false;
}

/** BFS the shortest cell path start→beacon (or null). Mirrors hasRoute but returns the route. */
function route(m: Mission): { x: number; y: number }[] | null {
  const a = m.arena;
  const blocked = new Set<string>();
  for (const c of a.crates) blocked.add(`${c.x},${c.y}`);
  for (const t of a.targets ?? []) blocked.add(`${t.x},${t.y}`);
  const passable = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= a.cols || y >= a.rows) return false;
    const k = a.cells[y][x];
    if (k === "wall" || k === "pit" || k === "water") return false;
    return !blocked.has(`${x},${y}`);
  };
  const start = m.start.pos;
  const prev = new Map<string, string | null>([[`${start.x},${start.y}`, null]]);
  const q = [start];
  while (q.length) {
    const p = q.shift()!;
    if (p.x === a.beacon.x && p.y === a.beacon.y) {
      const path: { x: number; y: number }[] = [];
      let cur: string | null = `${p.x},${p.y}`;
      while (cur) { const [x, y] = cur.split(",").map(Number); path.unshift({ x, y }); cur = prev.get(cur)!; }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = p.x + dx, ny = p.y + dy, k = `${nx},${ny}`;
      if (passable(nx, ny) && !prev.has(k)) { prev.set(k, `${p.x},${p.y}`); q.push({ x: nx, y: ny }); }
    }
  }
  return null;
}

/** Turn a cell path into a bot program (turns + forwards), starting from the mission's facing. */
function pathToProgram(path: { x: number; y: number }[], facing: Facing): string {
  const dirOf = (dx: number, dy: number): Facing => (dx === 1 ? "E" : dx === -1 ? "W" : dy === 1 ? "S" : "N");
  const RIGHT: Record<Facing, Facing> = { N: "E", E: "S", S: "W", W: "N" };
  let cur = facing;
  const out: string[] = [];
  for (let i = 1; i < path.length; i++) {
    const want = dirOf(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    let guard = 0;
    while (cur !== want && guard++ < 4) { out.push("right()"); cur = RIGHT[cur]; }
    out.push("forward(1)");
  }
  return out.join("\n");
}

describe("Open Field generator", () => {
  it("a routed program actually clears the field through the real sim (100 fields)", () => {
    for (let i = 0; i < 100; i++) {
      const m = generateChallenge(i % 8);
      const path = route(m);
      expect(path, `field #${i} has a route`).not.toBeNull();
      const program = pathToProgram(path!, m.start.facing);
      const res = runInSandbox(m, program);
      expect(res.cleared, `field #${i} program should reach the beacon`).toBe(true);
    }
  });

  it("every generated challenge is solvable (200 random fields)", () => {
    for (let i = 0; i < 200; i++) {
      const m = generateChallenge(i % 10);
      expect(hasRoute(m), `challenge #${i} should have a route to the beacon`).toBe(true);
    }
  });

  it("start and beacon are distinct, in bounds, and not on an obstacle", () => {
    for (let i = 0; i < 100; i++) {
      const m = generateChallenge(i);
      const { start, arena } = m;
      const b = arena.beacon;
      expect(start.pos).not.toEqual(b);
      expect(start.pos.x).toBeGreaterThanOrEqual(0);
      expect(start.pos.x).toBeLessThan(arena.cols);
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x).toBeLessThan(arena.cols);
      const onObstacle = (p: { x: number; y: number }) =>
        arena.cells[p.y][p.x] === "wall" ||
        arena.crates.some((c) => c.x === p.x && c.y === p.y) ||
        (arena.targets ?? []).some((t) => t.x === p.x && t.y === p.y);
      expect(onObstacle(start.pos)).toBe(false);
      expect(onObstacle(b)).toBe(false);
    }
  });
});
