import { executeCommand } from "./commands";
import { recordTrace } from "./trace";
import type { Command, BotState, TraceEntry, Arena, Vec2, Facing } from "./types";
import type { SimEvent } from "./events";

export interface Mission {
  id: string;
  world: number;
  index: number;
  teaches: string;
  arena: Arena;
  start: { pos: Vec2; facing: Facing };
  parLines: number;
  starterCode: string;
  hints: string[];
  briefing: string;
  authorSolution: string;
  bonusStar:
    | { kind: "honkOnBeacon" }
    | { kind: "zeroBumps" }
    | { kind: "exactHonks"; count: number };
  unlock?: { part: string; cost: number };
}

export interface Sim {
  execute(cmd: Command): unknown;
  state(): Readonly<BotState>;
  trace(): readonly TraceEntry[];
  events(): readonly SimEvent[];
  isCleared(): boolean;
}

export function createSim(mission: Mission): Sim {
  const arena = mission.arena;
  let state: BotState = {
    pos: mission.start.pos,
    facing: mission.start.facing,
    armor: 100,
    score: 0,
    bumps: 0,
    honks: 0,
    wrecked: false,
  };
  let tick = 0;
  let cleared = false;
  const trace: TraceEntry[] = [recordTrace(arena, state, tick)];
  const log: SimEvent[] = [];

  function atBeacon(s: BotState): boolean {
    const onBeacon = s.pos.x === arena.beacon.x && s.pos.y === arena.beacon.y;
    if (!onBeacon) return false;
    if (arena.beaconRequiresFacing) return s.facing === arena.beaconRequiresFacing;
    return true;
  }

  /** Emit a `clear` event the first tick the bot satisfies the beacon condition. */
  function maybeClear(at: Vec2): void {
    if (!cleared && atBeacon(state)) {
      cleared = true;
      log.push({ tick, type: "clear", at });
    }
  }

  return {
    execute(cmd: Command) {
      const before = state;
      const { state: next, ticksSpent, outcome } = executeCommand(arena, before, cmd);

      if (outcome.kind === "move") {
        // One move event per square entered, ticks advancing by each square's cost. This gives
        // the view smooth per-square motion and per-square tread sound without any game logic.
        let from = outcome.from;
        let facing = next.facing;
        for (const step of outcome.path) {
          tick += step.cost;
          log.push({ tick, type: "move", from, to: step.to, facing, cost: step.cost });
          from = step.to;
          state = { ...state, pos: step.to };
          trace.push(recordTrace(arena, state, tick));
          maybeClear(step.to);
        }
        if (outcome.bumped) {
          tick += 1;
          log.push({ tick, type: "bump", at: from });
          log.push({ tick, type: "score", delta: -15, total: next.score, at: from });
          trace.push(recordTrace(arena, next, tick));
        }
        state = next; // fold in armor/score/bumps bookkeeping
      } else if (outcome.kind === "turn") {
        tick += ticksSpent;
        state = next;
        log.push({ tick, type: "turn", facing: next.facing });
        trace.push(recordTrace(arena, state, tick));
      } else {
        // honk
        tick += ticksSpent;
        state = next;
        log.push({ tick, type: "honk", at: state.pos });
        trace.push(recordTrace(arena, state, tick));
        maybeClear(state.pos);
      }

      return undefined;
    },
    state: () => state,
    trace: () => trace,
    events: () => log,
    isCleared: () => cleared || atBeacon(state),
  };
}
