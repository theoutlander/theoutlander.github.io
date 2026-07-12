import { stepFacing } from "./arena";
import type { BotState, Facing, Vec2 } from "./types";

/**
 * The movable world as physics sees it — decoupled from the Arena so runtime-mutable things
 * (honk-gates opening) and hazards (pits, water, mud) are just predicates. The engine builds this
 * with closures over the live gate state, so a gate that opens mid-run immediately stops blocking.
 */
export interface MoveWorld {
  /** wall / crate / tank / closed-gate cell / out of bounds */
  isBlocked(pos: Vec2): boolean;
  /** a pit: entering it is a fall (−40 + tow), not a step */
  isPit(pos: Vec2): boolean;
  /** water: the bot would sink — can't cross (splash, no damage) */
  isWater(pos: Vec2): boolean;
  /** mud costs 2 ticks to cross instead of 1 */
  isMud(pos: Vec2): boolean;
}

export interface MoveResult {
  state: BotState;
  ticksSpent: number;
  /** squares actually entered, in order, each with its tick cost */
  path: { to: Vec2; cost: number }[];
  /** stopped early against a wall/crate/tank/gate/edge */
  bumped: boolean;
  /** stopped early at a pit's edge (−40 applied) */
  fell: boolean;
  /** stopped early at water's edge (splash, no penalty) */
  splashed: boolean;
}

export function resolveMove(
  world: MoveWorld,
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
  let fell = false;
  let splashed = false;
  const path: { to: Vec2; cost: number }[] = [];

  for (let i = 0; i < squares; i++) {
    const next = stepFacing(pos, facing);
    if (world.isPit(next)) {
      // The pit guards the way — the bot lurches to the edge and is towed back. −40, no crossing.
      score -= 40;
      fell = true;
      break;
    }
    if (world.isWater(next)) {
      // Water — the bot would sink. It stops at the bank with a splash; no damage, water's gentle.
      splashed = true;
      break;
    }
    if (world.isBlocked(next)) {
      score -= 15;
      armor = Math.max(0, armor - 8);
      bumps += 1;
      bumped = true;
      break;
    }
    pos = next;
    const cost = world.isMud(next) ? 2 : 1;
    ticksSpent += cost;
    path.push({ to: pos, cost });
  }

  return {
    state: { ...state, pos, facing, bumps, score, armor },
    ticksSpent: ticksSpent || 1, // a blocked/fallen attempt still costs the tick it took to try
    path,
    bumped,
    fell,
    splashed,
  };
}
