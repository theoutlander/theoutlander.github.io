import { resolveMove } from "./physics";
import type { Arena, BotState, Command, Facing } from "./types";

const TURN_LEFT: Record<Facing, Facing> = { N: "W", W: "S", S: "E", E: "N" };
const TURN_RIGHT: Record<Facing, Facing> = { N: "E", E: "S", S: "W", W: "N" };

export function executeCommand(
  arena: Arena,
  state: BotState,
  cmd: Command,
): { state: BotState; ticksSpent: number } {
  switch (cmd.name) {
    case "forward":
      return resolveMove(arena, state, state.facing, cmd.args[0] ?? 1);
    case "back": {
      const reverseFacing: Record<Facing, Facing> = { N: "S", S: "N", E: "W", W: "E" };
      const opposite = reverseFacing[state.facing];
      const { state: moved, ticksSpent } = resolveMove(arena, state, opposite, cmd.args[0] ?? 1);
      return { state: { ...moved, facing: state.facing }, ticksSpent };
    }
    case "left":
      return { state: { ...state, facing: TURN_LEFT[state.facing] }, ticksSpent: 1 };
    case "right":
      return { state: { ...state, facing: TURN_RIGHT[state.facing] }, ticksSpent: 1 };
    case "honk":
      return { state: { ...state, honks: state.honks + 1 }, ticksSpent: 1 };
    default:
      throw new Error(`"${cmd.name}" isn't implemented yet`);
  }
}
