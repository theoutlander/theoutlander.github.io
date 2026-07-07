import { resolveMove, type MoveWorld } from "./physics";
import type { BotState, Command, Facing, Vec2 } from "./types";

const TURN_LEFT: Record<Facing, Facing> = { N: "W", W: "S", S: "E", E: "N" };
const TURN_RIGHT: Record<Facing, Facing> = { N: "E", E: "S", S: "W", W: "N" };
const REVERSE: Record<Facing, Facing> = { N: "S", S: "N", E: "W", W: "E" };

/** What a command did, so the engine can turn it into SimEvents. State/tick effects are already
 *  applied; this only describes the shape of what happened. Gate opening (a side effect of honk)
 *  is decided by the engine, which owns the gate state. */
export type CommandOutcome =
  | { kind: "move"; from: Vec2; path: { to: Vec2; cost: number }[]; bumped: boolean; fell: boolean }
  | { kind: "turn" }
  | { kind: "honk" };

export function executeCommand(
  world: MoveWorld,
  state: BotState,
  cmd: Command,
): { state: BotState; ticksSpent: number; outcome: CommandOutcome } {
  switch (cmd.name) {
    case "forward": {
      const r = resolveMove(world, state, state.facing, cmd.args[0] ?? 1);
      return {
        state: r.state,
        ticksSpent: r.ticksSpent,
        outcome: { kind: "move", from: state.pos, path: r.path, bumped: r.bumped, fell: r.fell },
      };
    }
    case "back": {
      const r = resolveMove(world, state, REVERSE[state.facing], cmd.args[0] ?? 1);
      // back() keeps the original facing — the bot reverses without turning.
      return {
        state: { ...r.state, facing: state.facing },
        ticksSpent: r.ticksSpent,
        outcome: { kind: "move", from: state.pos, path: r.path, bumped: r.bumped, fell: r.fell },
      };
    }
    case "left":
      return {
        state: { ...state, facing: TURN_LEFT[state.facing] },
        ticksSpent: 1,
        outcome: { kind: "turn" },
      };
    case "right":
      return {
        state: { ...state, facing: TURN_RIGHT[state.facing] },
        ticksSpent: 1,
        outcome: { kind: "turn" },
      };
    case "honk":
      return {
        state: { ...state, honks: state.honks + 1 },
        ticksSpent: 1,
        outcome: { kind: "honk" },
      };
    default:
      throw new Error(`"${cmd.name}" isn't implemented yet`);
  }
}
