import { cellAt, inBounds, stepFacing } from "./arena";
import type { Arena, BotState, Facing } from "./types";

function isBlocked(arena: Arena, pos: { x: number; y: number }): boolean {
  if (!inBounds(arena, pos)) return true;
  if (cellAt(arena, pos) === "wall") return true;
  return arena.crates.some((c) => c.x === pos.x && c.y === pos.y);
}

/** Moves up to `squares` in `facing`, stopping at the first obstacle. Mud costs 2 ticks/sq. */
export function resolveMove(
  arena: Arena,
  state: BotState,
  facing: Facing,
  squares: number,
): { state: BotState; ticksSpent: number } {
  let pos = state.pos;
  let ticksSpent = 0;
  let bumps = state.bumps;
  let score = state.score;
  let armor = state.armor;

  for (let i = 0; i < squares; i++) {
    const next = stepFacing(pos, facing);
    if (isBlocked(arena, next)) {
      score -= 15;
      armor = Math.max(0, armor - 8);
      bumps += 1;
      break;
    }
    pos = next;
    ticksSpent += cellAt(arena, pos) === "mud" ? 2 : 1;
  }

  return {
    state: { ...state, pos, facing, bumps, score, armor },
    ticksSpent: ticksSpent || 1, // a blocked attempt still costs the tick it took to try
  };
}
