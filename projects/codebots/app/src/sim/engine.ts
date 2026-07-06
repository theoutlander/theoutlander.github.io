import { executeCommand } from "./commands";
import { recordTrace } from "./trace";
import { cellAt, inBounds } from "./arena";
import type { MoveWorld } from "./physics";
import type { Command, BotState, TraceEntry, Arena, Vec2, Facing, GateSpec } from "./types";
import type { SimEvent } from "./events";

export interface Mission {
  id: string;
  world: number;
  index: number;
  title: string;
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
  cutscene?: string;
}

export interface Sim {
  execute(cmd: Command): unknown;
  state(): Readonly<BotState>;
  trace(): readonly TraceEntry[];
  events(): readonly SimEvent[];
  isCleared(): boolean;
}

const key = (p: Vec2) => `${p.x},${p.y}`;

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

  const OBJECTIVE_POINTS = 100; // PRODUCT_SPEC §6: completing the objective is +100

  // Static blockers (never change): crates + villain obstacles like Sprocket's tank.
  const staticBlocked = new Set<string>();
  for (const c of arena.crates) staticBlocked.add(key(c));
  for (const o of arena.obstacles ?? []) staticBlocked.add(key(o.pos));

  // Gates are mutable — honking on a pad opens one. The world reads their live state.
  const gates: GateSpec[] = arena.gates.map((g) => ({ ...g, gateCells: [...g.gateCells] }));

  const world: MoveWorld = {
    isBlocked(p) {
      if (!inBounds(arena, p)) return true;
      if (cellAt(arena, p) === "wall") return true;
      if (staticBlocked.has(key(p))) return true;
      // a closed gate cell blocks; open ones are passable
      return gates.some((g) => !g.open && g.gateCells.some((c) => c.x === p.x && c.y === p.y));
    },
    isPit: (p) => inBounds(arena, p) && cellAt(arena, p) === "pit",
    isMud: (p) => inBounds(arena, p) && cellAt(arena, p) === "mud",
  };

  function atBeacon(s: BotState): boolean {
    const onBeacon = s.pos.x === arena.beacon.x && s.pos.y === arena.beacon.y;
    if (!onBeacon) return false;
    if (arena.beaconRequiresFacing) return s.facing === arena.beaconRequiresFacing;
    return true;
  }

  /** If the bot just satisfied the beacon at `at`, emit `clear` and return the objective points. */
  function maybeClear(at: Vec2): number {
    if (!cleared && atBeacon(state)) {
      cleared = true;
      log.push({ tick, type: "clear", at });
      return OBJECTIVE_POINTS;
    }
    return 0;
  }

  return {
    execute(cmd: Command) {
      const before = state;
      const { state: next, ticksSpent, outcome } = executeCommand(world, before, cmd);
      let objective = 0;
      let clearAt: Vec2 | null = null;

      if (outcome.kind === "move") {
        let from = outcome.from;
        const facing = next.facing;
        for (const step of outcome.path) {
          tick += step.cost;
          log.push({ tick, type: "move", from, to: step.to, facing, cost: step.cost });
          from = step.to;
          state = { ...state, pos: step.to };
          trace.push(recordTrace(arena, state, tick));
          const award = maybeClear(step.to);
          if (award) {
            objective += award;
            clearAt = step.to;
          }
        }
        if (outcome.fell) {
          tick += 1;
          log.push({ tick, type: "fall", at: from });
          log.push({ tick, type: "score", delta: -40, total: next.score, at: from });
          trace.push(recordTrace(arena, next, tick));
        } else if (outcome.bumped) {
          tick += 1;
          log.push({ tick, type: "bump", at: from });
          log.push({ tick, type: "score", delta: -15, total: next.score, at: from });
          trace.push(recordTrace(arena, next, tick));
        }
        state = next; // fold in armor/score/bumps bookkeeping (position already = last step)
      } else if (outcome.kind === "turn") {
        tick += ticksSpent;
        state = next;
        log.push({ tick, type: "turn", facing: next.facing });
        trace.push(recordTrace(arena, state, tick));
      } else {
        // honk — advance, emit the honk, then open a gate if we're standing on its pad
        tick += ticksSpent;
        state = next;
        log.push({ tick, type: "honk", at: state.pos });
        trace.push(recordTrace(arena, state, tick));
        for (const g of gates) {
          if (!g.open && g.pad.x === state.pos.x && g.pad.y === state.pos.y) {
            g.open = true;
            log.push({ tick, type: "gateOpen", pad: g.pad, gateCells: g.gateCells });
          }
        }
        const award = maybeClear(state.pos);
        if (award) {
          objective += award;
          clearAt = state.pos;
        }
      }

      // Fold the objective award onto the final state and emit its score event.
      if (objective && clearAt) {
        state = { ...state, score: state.score + objective };
        log.push({ tick, type: "score", delta: objective, total: state.score, at: clearAt });
      }

      return undefined;
    },
    state: () => state,
    trace: () => trace,
    events: () => log,
    isCleared: () => cleared || atBeacon(state),
  };
}
