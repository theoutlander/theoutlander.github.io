import { executeCommand } from "./commands";
import { recordTrace } from "./trace";
import { cellAt, inBounds, stepFacing } from "./arena";
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
  const SHOOT_RANGE = 5; // squares a shot travels before fizzling

  // Static blockers (never change): crates + villain obstacles like Sprocket's tank.
  const staticBlocked = new Set<string>();
  for (const c of arena.crates) staticBlocked.add(key(c));
  for (const o of arena.obstacles ?? []) staticBlocked.add(key(o.pos));

  // Gates are mutable — honking on a pad opens one. The world reads their live state.
  const gates: GateSpec[] = arena.gates.map((g) => ({ ...g, gateCells: [...g.gateCells] }));

  // Targets are mutable — shoot() destroys them, so the blocker check reads this live set.
  const targets = new Set<string>((arena.targets ?? []).map(key));

  const world: MoveWorld = {
    isBlocked(p) {
      if (!inBounds(arena, p)) return true;
      if (cellAt(arena, p) === "wall") return true;
      if (staticBlocked.has(key(p))) return true;
      if (targets.has(key(p))) return true; // a standing barrel blocks until shot
      // a closed gate cell blocks; open ones are passable
      return gates.some((g) => !g.open && g.gateCells.some((c) => c.x === p.x && c.y === p.y));
    },
    isPit: (p) => inBounds(arena, p) && cellAt(arena, p) === "pit",
    isWater: (p) => inBounds(arena, p) && cellAt(arena, p) === "water",
    isMud: (p) => inBounds(arena, p) && cellAt(arena, p) === "mud",
  };

  function atBeacon(s: BotState): boolean {
    const onBeacon = s.pos.x === arena.beacon.x && s.pos.y === arena.beacon.y;
    if (!onBeacon) return false;
    if (arena.beaconRequiresFacing) return s.facing === arena.beaconRequiresFacing;
    return true;
  }

  // A cell blocks forward progress if you'd bump, fall, or splash entering it.
  function stopsProgress(p: Vec2): boolean {
    return world.isBlocked(p) || world.isPit(p) || world.isWater(p);
  }

  /** Sensors: read live state, return a value, never mutate the world. */
  function sense(name: string): boolean {
    const ahead = stepFacing(state.pos, state.facing);
    switch (name) {
      case "blocked":
        return stopsProgress(ahead);
      case "targetAhead":
        return targets.has(key(ahead));
      case "atBeacon":
        return atBeacon(state);
      default:
        return false;
    }
  }

  /** shoot(): fire a bolt in the facing direction. Destroys the first barrel in range; a shot
   *  that meets a wall/edge (or nothing) first is a defined miss — never a crash. */
  function fire(): void {
    tick += 1;
    let p = state.pos;
    let hit: Vec2 | null = null;
    for (let i = 0; i < SHOOT_RANGE; i++) {
      p = stepFacing(p, state.facing);
      if (!inBounds(arena, p)) break;
      if (targets.has(key(p))) {
        hit = p;
        targets.delete(key(p));
        break;
      }
      // a wall/crate/tank/closed-gate stops the bolt short of any target behind it
      if (world.isBlocked(p)) break;
    }
    log.push({ tick, type: "shoot", from: state.pos, facing: state.facing, hit });
    if (hit) {
      log.push({ tick, type: "targetDestroyed", at: hit });
      trace.push(recordTrace(arena, state, tick));
    }
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
      // Sensors return a value from live state (the driver feeds it back into the generator).
      if (cmd.name === "blocked" || cmd.name === "targetAhead" || cmd.name === "atBeacon") {
        return sense(cmd.name);
      }
      if (cmd.name === "shoot") {
        fire();
        return undefined;
      }

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
        } else if (outcome.splashed) {
          tick += 1;
          log.push({ tick, type: "splash", at: from });
          trace.push(recordTrace(arena, next, tick));
        } else if (outcome.bumped) {
          tick += 1;
          log.push({ tick, type: "bump", at: from });
          log.push({ tick, type: "score", delta: -15, total: next.score, at: from });
          trace.push(recordTrace(arena, next, tick));
        }
        state = next; // fold in armor/score/bumps bookkeeping (position already = last step)
      } else if (outcome.kind === "turn") {
        // one turn event per 90° step, so left(n)/right(n) visibly turn n times
        for (const f of outcome.facings) {
          tick += 1;
          state = { ...state, facing: f };
          log.push({ tick, type: "turn", facing: f });
          trace.push(recordTrace(arena, state, tick));
        }
        state = next;
      } else {
        // honk(n) — n horns (rising pitch via seq); then open a gate if we're on its pad
        state = next;
        for (let k = 0; k < outcome.count; k++) {
          tick += 1;
          log.push({ tick, type: "honk", at: state.pos, seq: k });
          trace.push(recordTrace(arena, state, tick));
        }
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
