import { desugarRepeat, toGeneratorSource } from "../sandbox/transform";
import { executeCommand } from "./commands";
import { stepFacing, inBounds, cellAt } from "./arena";
import type { MoveWorld } from "./physics";
import type { Arena, Command, Facing, Vec2 } from "./types";

/**
 * Battle engine — an ADDITIVE layer on top of the same command primitives as the campaign. Several
 * bots each run a program (the kid's, plus preset/opponent brains) and fight. Fully deterministic:
 * same programs + arena ⇒ identical battle, every time (which is what makes fair fights, replays,
 * and PvP possible). The campaign's single-actor createSim is untouched.
 *
 * Turn model: rounds. Each round, every living bot (in fixed order) takes ONE action; a bot's
 * "turn" advances its generator until it performs a world action (move/turn/shoot/honk) or finishes
 * — sensors along the way are resolved inline against the LIVE battle state (free "thinking").
 */

const ARMOR_MAX = 100;
// ~7 hits to wreck. Deliberately NOT a 3-hit kill: with a 3-hit kill whoever fires first simply
// wins and tactics are irrelevant. A longer fight is what makes positioning, cover and RANGE matter
// — i.e. what makes better CODE win.
const SHOOT_DAMAGE = 15;
const SHOOT_RANGE = 6;
const MAX_ROUNDS = 200; // a battle that never resolves ends in a draw, never hangs
const MAX_THINK = 200; // per-turn cap on sensor calls before we force a pass (guards while(true))

export type BattleEvent =
  | { round: number; bot: number; type: "move"; from: Vec2; to: Vec2; facing: Facing; cost: number }
  | { round: number; bot: number; type: "turn"; facing: Facing }
  | { round: number; bot: number; type: "bump"; at: Vec2 }
  | { round: number; bot: number; type: "honk"; at: Vec2; seq?: number }
  | { round: number; bot: number; type: "shoot"; from: Vec2; facing: Facing; hit: number | null; at: Vec2 | null }
  | { round: number; bot: number; type: "hit"; target: number; at: Vec2; armor: number }
  | { round: number; bot: number; type: "wreck"; at: Vec2 }
  | { round: number; bot: number; type: "reach"; at: Vec2 };

export interface Entrant {
  id: string;
  source: string;
  isPlayer?: boolean;
  /** from the Garage loadout. Omitted = the stock bot (armour 100, damage 34, range 6). */
  stats?: { armor?: number; damage?: number; range?: number };
}

export type BattleOutcome = "win" | "lose" | "draw";
export interface BattleResult {
  outcome: BattleOutcome; // from the PLAYER's point of view
  events: BattleEvent[];
  rounds: number;
  survivors: number[]; // bot indices still rolling
}

/** Win rule for the arena: reach the beacon (surviving), wreck everyone else, or either. */
export type WinRule = "reachBeacon" | "lastStanding" | "both";

interface Bot {
  index: number;
  isPlayer: boolean;
  pos: Vec2;
  facing: Facing;
  armor: number;
  /** per-bot combat stats (from the Garage loadout) */
  maxArmor: number;
  damage: number;
  range: number;
  wrecked: boolean;
  gen: Generator<Command, void, unknown> | null;
  done: boolean;
}

/** Compile a program into a fresh command generator (reuses the campaign transform pipeline). */
function compile(source: string, api: string[]): () => Generator<Command, void, unknown> {
  const genSource = toGeneratorSource(desugarRepeat(source), api);
  return new Function("__call", `${genSource}\nreturn __main;`)(
    (name: string, args: unknown[]) => ({ name, args } as Command),
  ) as () => Generator<Command, void, unknown>;
}

/**
 * Compile a bot's program, and if it won't compile, let that bot simply DO NOTHING.
 *
 * In the campaign a broken program is the kid's own, and she needs to see the error — so it throws,
 * loudly, with a line number. In a battle the program might be SOMEBODY ELSE'S: a bot published by
 * another nine-year-old and reviewed by no one, which can be half-finished, mistyped, or outright
 * gibberish. Throwing there means her opponent's bad code crashes HER game, which is our bug and not
 * hers, and "the other kid's bot broke my game" is the fastest way to lose a player.
 *
 * So a rival that cannot compile forfeits. It sits there and loses, which is exactly what a broken
 * robot should do.
 */
function compileOrForfeit(source: string, api: string[]): Generator<Command, void, unknown> | null {
  try {
    return compile(source, api)();
  } catch {
    return null; // `gen: null` is already handled everywhere as "this bot takes no turns"
  }
}

const key = (p: Vec2) => `${p.x},${p.y}`;

export function runBattle(
  arena: Arena,
  entrants: Entrant[],
  starts: { pos: Vec2; facing: Facing }[],
  api: string[],
  winRule: WinRule = "reachBeacon",
): BattleResult {
  const bots: Bot[] = entrants.map((e, i) => {
    const armor = e.stats?.armor ?? ARMOR_MAX;
    return {
      index: i,
      isPlayer: !!e.isPlayer,
      pos: starts[i].pos,
      facing: starts[i].facing,
      armor,
      maxArmor: armor,
      damage: e.stats?.damage ?? SHOOT_DAMAGE,
      range: e.stats?.range ?? SHOOT_RANGE,
      wrecked: false,
      gen: compileOrForfeit(e.source, api),
      done: false,
    };
  });
  const targets = new Set<string>((arena.targets ?? []).map(key));
  const staticBlocked = new Set<string>();
  for (const c of arena.crates) staticBlocked.add(key(c));
  for (const o of arena.obstacles ?? []) staticBlocked.add(key(o.pos));

  const events: BattleEvent[] = [];
  let round = 0;

  const botAt = (p: Vec2): Bot | null =>
    bots.find((b) => !b.wrecked && b.pos.x === p.x && b.pos.y === p.y) ?? null;

  // The movable world as seen by one bot: walls/crates/barrels + every OTHER living bot block it.
  const worldFor = (self: Bot): MoveWorld => ({
    isBlocked: (p) => {
      if (!inBounds(arena, p)) return true;
      if (cellAt(arena, p) === "wall") return true;
      if (staticBlocked.has(key(p)) || targets.has(key(p))) return true;
      return bots.some((b) => b !== self && !b.wrecked && b.pos.x === p.x && b.pos.y === p.y);
    },
    isPit: (p) => inBounds(arena, p) && cellAt(arena, p) === "pit",
    isWater: (p) => inBounds(arena, p) && cellAt(arena, p) === "water",
    isMud: (p) => inBounds(arena, p) && cellAt(arena, p) === "mud",
  });

  const atBeacon = (b: Bot) => b.pos.x === arena.beacon.x && b.pos.y === arena.beacon.y;

  /** A sensor's value from live battle state (fed back into the bot's generator). */
  function sense(self: Bot, name: string): boolean {
    const ahead = stepFacing(self.pos, self.facing);
    switch (name) {
      case "blocked":
        return worldFor(self).isBlocked(ahead) || worldFor(self).isPit(ahead) || worldFor(self).isWater(ahead);
      case "targetAhead":
        return targets.has(key(ahead));
      case "atBeacon":
        return atBeacon(self);
      case "enemyAhead": {
        // any living other bot straight ahead within THIS bot's shot range (nothing solid between)
        let p = self.pos;
        for (let i = 0; i < self.range; i++) {
          p = stepFacing(p, self.facing);
          if (!inBounds(arena, p) || cellAt(arena, p) === "wall" || staticBlocked.has(key(p)) || targets.has(key(p))) return false;
          if (botAt(p)) return true;
        }
        return false;
      }
      case "enemyNear": {
        return bots.some((b) => b !== self && !b.wrecked && dist(self.pos, b.pos) <= 2);
      }
      // "Would rolling forward bring me CLOSER to my rival?" This is what lets a bot actually HUNT.
      // Without it, a bot can only see a rival perfectly lined up on a row/column — so it spins in
      // place forever and never engages (which is exactly what the presets were doing).
      case "closerAhead": {
        const foe = nearestFoe(self);
        if (!foe) return false;
        const ahead2 = stepFacing(self.pos, self.facing);
        if (stopsProgress(self, ahead2)) return false;
        return dist(ahead2, foe.pos) < dist(self.pos, foe.pos);
      }
      // Which side is the rival on? (relative to the way I'm facing)
      case "enemyLeft":
      case "enemyRight": {
        const foe = nearestFoe(self);
        if (!foe) return false;
        const dx = foe.pos.x - self.pos.x;
        const dy = foe.pos.y - self.pos.y;
        // sideways component in the bot's own frame: +ve = to its right
        const side =
          self.facing === "E" ? dy :
          self.facing === "W" ? -dy :
          self.facing === "S" ? -dx : dx;
        return name === "enemyRight" ? side > 0 : side < 0;
      }
      default:
        return false;
    }
  }

  const dist = (a: Vec2, b: Vec2) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

  function nearestFoe(self: Bot): Bot | null {
    const foes = bots.filter((b) => b !== self && !b.wrecked);
    if (!foes.length) return null;
    return foes.reduce((best, b) => (dist(self.pos, b.pos) < dist(self.pos, best.pos) ? b : best));
  }

  /** Can't roll into it (wall, crate, barrel, pit, water, edge, or another bot). */
  function stopsProgress(self: Bot, p: Vec2): boolean {
    const w = worldFor(self);
    return w.isBlocked(p) || w.isPit(p) || w.isWater(p);
  }

  /** shoot(): first living bot (or barrel) down the lane takes it. */
  function fire(self: Bot): void {
    let p = self.pos;
    let hitBot: Bot | null = null;
    let hitAt: Vec2 | null = null;
    for (let i = 0; i < self.range; i++) {
      p = stepFacing(p, self.facing);
      if (!inBounds(arena, p) || cellAt(arena, p) === "wall" || staticBlocked.has(key(p))) break;
      if (targets.has(key(p))) { targets.delete(key(p)); hitAt = { ...p }; break; }
      const b = botAt(p);
      if (b) { hitBot = b; hitAt = { ...p }; break; }
    }
    events.push({ round, bot: self.index, type: "shoot", from: { ...self.pos }, facing: self.facing, hit: hitBot?.index ?? null, at: hitAt });
    if (hitBot) {
      hitBot.armor = Math.max(0, hitBot.armor - self.damage);
      events.push({ round, bot: self.index, type: "hit", target: hitBot.index, at: { ...hitBot.pos }, armor: hitBot.armor });
      if (hitBot.armor === 0) {
        hitBot.wrecked = true;
        hitBot.done = true;
        events.push({ round, bot: hitBot.index, type: "wreck", at: { ...hitBot.pos } });
      }
    }
  }

  const SENSORS = new Set([
    "blocked", "targetAhead", "atBeacon",
    "enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight",
  ]);

  /** Advance one bot until it performs a world action (or finishes). Sensors resolved inline. */
  function takeTurn(self: Bot): void {
    if (self.wrecked || self.done || !self.gen) return;
    let result: unknown = undefined;
    for (let think = 0; think < MAX_THINK; think++) {
      const step = self.gen.next(result);
      if (step.done) { self.done = true; return; }
      const cmd = step.value;
      if (SENSORS.has(cmd.name)) { result = sense(self, cmd.name); continue; }
      // a world action — do it, then this bot's turn is over
      applyAction(self, cmd);
      return;
    }
    // thought too long without acting (e.g. while(true) sensing) — skip the turn to avoid a hang
  }

  function applyAction(self: Bot, cmd: Command): void {
    if (cmd.name === "shoot") { fire(self); return; }
    const { state: next, outcome } = executeCommand(worldFor(self), { ...botState(self) }, cmd);
    if (outcome.kind === "move") {
      let from = outcome.from;
      for (const s of outcome.path) {
        events.push({ round, bot: self.index, type: "move", from, to: s.to, facing: next.facing, cost: s.cost });
        from = s.to;
      }
      self.pos = next.pos;
      self.facing = next.facing;
      if (outcome.bumped) events.push({ round, bot: self.index, type: "bump", at: { ...self.pos } });
    } else if (outcome.kind === "turn") {
      for (const f of outcome.facings) { self.facing = f; events.push({ round, bot: self.index, type: "turn", facing: f }); }
      self.facing = next.facing;
    } else {
      // honk
      for (let k = 0; k < outcome.count; k++) events.push({ round, bot: self.index, type: "honk", at: { ...self.pos }, seq: k });
    }
  }

  const botState = (b: Bot) => ({ pos: b.pos, facing: b.facing, armor: b.armor, score: 0, bumps: 0, honks: 0, wrecked: b.wrecked });

  const player = bots.find((b) => b.isPlayer)!;

  function decide(): BattleOutcome | null {
    if (player.wrecked) return "lose";
    const enemies = bots.filter((b) => !b.isPlayer);
    const enemiesLeft = enemies.filter((b) => !b.wrecked).length;
    const reached = atBeacon(player);
    if (reached && (winRule === "reachBeacon" || winRule === "both")) return "win";
    if (enemiesLeft === 0 && (winRule === "lastStanding" || winRule === "both" || enemies.length > 0)) {
      return winRule === "reachBeacon" ? (reached ? "win" : null) : "win";
    }
    return null;
  }

  for (round = 1; round <= MAX_ROUNDS; round++) {
    for (const b of bots) {
      if (b.wrecked || b.done) continue;
      takeTurn(b);
      if (b.isPlayer && atBeacon(b) && (winRule === "reachBeacon" || winRule === "both")) {
        events.push({ round, bot: b.index, type: "reach", at: { ...b.pos } });
      }
      const decided = decide();
      if (decided) {
        return { outcome: decided, events, rounds: round, survivors: bots.filter((x) => !x.wrecked).map((x) => x.index) };
      }
    }
    // everyone finished their program without a decision → stop (draw)
    if (bots.every((b) => b.done || b.wrecked)) break;
  }

  const final = decide();
  return {
    outcome: final ?? "draw",
    events,
    rounds: Math.min(round, MAX_ROUNDS),
    survivors: bots.filter((x) => !x.wrecked).map((x) => x.index),
  };
}
