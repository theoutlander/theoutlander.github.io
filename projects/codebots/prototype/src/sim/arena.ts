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
