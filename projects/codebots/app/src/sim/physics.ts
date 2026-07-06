import { cellAt, inBounds, stepFacing } from "./arena";
import type { Arena, BotState, Facing, Vec2 } from "./types";

function isBlocked(arena: Arena, pos: { x: number; y: number }): boolean {
  if (!inBounds(arena, pos)) return true;
  if (cellAt(arena, pos) === "wall") return true;
  return arena.crates.some((c) => c.x === pos.x && c.y === pos.y);
}

export interface MoveResult {
  state: BotState;
  ticksSpent: number;
  /** the squares actually entered, in order, with each square's tick cost (mud = 2, else 1) */
  path: { to: Vec2; cost: number }[];
  /** true if the move stopped early because the next square was a wall/crate/edge */
  bumped: boolean;
}

/** Moves up to `squares` in `facing`, stopping at the first obstacle. Mud costs 2 ticks/sq. */
export function resolveMove(
  arena: Arena,
  state: BotState,
  facing: Facing,
  squares: number,
): MoveResult {
  let pos = state.pos;
  let ticksSpent = 0;
  let bumps = state.bumps;
  let score = state.score;
  let armor = state.armor;
  let bumped = false;
  const path: { to: Vec2; cost: number }[] = [];

  for (let i = 0; i < squares; i++) {
    const next = stepFacing(pos, facing);
    if (isBlocked(arena, next)) {
      score -= 15;
      armor = Math.max(0, armor - 8);
      bumps += 1;
      bumped = true;
      break;
    }
    pos = next;
    const cost = cellAt(arena, pos) === "mud" ? 2 : 1;
    ticksSpent += cost;
    path.push({ to: pos, cost });
  }

  return {
    state: { ...state, pos, facing, bumps, score, armor },
    ticksSpent: ticksSpent || 1, // a blocked attempt still costs the tick it took to try
    path,
    bumped,
  };
}
