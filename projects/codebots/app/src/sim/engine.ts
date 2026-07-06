import { executeCommand } from "./commands";
import { recordTrace } from "./trace";
import type { Command, BotState, TraceEntry, Arena, Vec2, Facing } from "./types";

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
  const trace: TraceEntry[] = [recordTrace(arena, state, tick)];

  function atBeacon(): boolean {
    const onBeacon = state.pos.x === arena.beacon.x && state.pos.y === arena.beacon.y;
    if (!onBeacon) return false;
    if (arena.beaconRequiresFacing) return state.facing === arena.beaconRequiresFacing;
    return true;
  }

  return {
    execute(cmd: Command) {
      const { state: next, ticksSpent } = executeCommand(arena, state, cmd);
      state = next;
      for (let i = 0; i < ticksSpent; i++) {
        tick += 1;
        trace.push(recordTrace(arena, state, tick));
      }
      return undefined;
    },
    state: () => state,
    trace: () => trace,
    isCleared: () => atBeacon(),
  };
}
