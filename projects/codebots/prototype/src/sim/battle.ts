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
  /** cap the fight. The league runs thousands of these, and two turtles that can't hurt each other
   *  would otherwise burn 200 rounds apiece for a draw we could have called far sooner. */
  maxRounds: number = MAX_ROUNDS,
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
      /**
       * "Am I in trouble?"
       *
       * The arena wasn't winnable by thinking, it was winnable by shooting first — and the reason was
       * this: a bot had no way to KNOW it was losing, so retreating was literally unwritable. There
       * was no word for it. Escaping wasn't a hard strategy, it was an impossible one.
       *
       * hurt() is that word. With it, "back off behind cover when you're hurt" and "kite the thing
       * that has to get close" become programs a kid can actually write — which is the difference
       * between a shoot-out and a fight.
       */
      case "hurt":
        return self.armor <= self.maxArmor * 0.4;
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
    "enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight", "hurt",
  ]);

  /**
   * Step a bot's program until it wants to DO something — but don't do it yet.
   *
   * This is the half that makes the fight simultaneous. Every bot chooses its action while the world
   * still looks exactly as it did at the start of the tick, so nobody is reacting to a move their
   * opponent has already made. Deciding and acting are separate phases; see the round loop.
   */
  function chooseAction(self: Bot): Command | null {
    if (self.wrecked || self.done || !self.gen) return null;
    let result: unknown = undefined;
    for (let think = 0; think < MAX_THINK; think++) {
      const step = self.gen.next(result);
      if (step.done) { self.done = true; return null; }
      const cmd = step.value;
      if (SENSORS.has(cmd.name)) { result = sense(self, cmd.name); continue; }
      return cmd;
    }
    // thought too long without acting (e.g. while(true) sensing) — forfeit the tick rather than hang
    return null;
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
    // Simultaneous fire means both bots can die on the SAME tick — each one's shot was already in
    // the air when the other's landed. That is a draw. Calling it a loss for the player would be
    // handing the win to whoever we happened to list second, which is the exact bias we removed.
    const enemiesAllWrecked = bots.filter((b) => !b.isPlayer).every((b) => b.wrecked);
    if (player.wrecked && enemiesAllWrecked) return "draw";
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

  /**
   * THE TICK. Everybody moves at once.
   *
   * It used to be strictly sequential — bot 0 took a whole turn, then bot 1 took a whole turn — and
   * that quietly decided fights. Bot 0 always shot first, so against an identical opponent it won
   * every single time. Measured: same program on both sides, 20 fights, the left seat won 20-0. In a
   * league, that means children would have been ranked by which side of the board they were listed
   * on. No amount of arena balancing fixes that, because the bias isn't in the arena.
   *
   * Real bot-battle games (Robocode, Screeps, and friends) don't take turns. A tick has two phases:
   *
   *   DECIDE   every bot picks its action against the SAME unchanged world. Nobody has moved yet, so
   *            nobody is reacting to a move their opponent made "earlier this tick" — there is no
   *            earlier. Sensors all read the same snapshot.
   *
   *   RESOLVE  every action lands together. Shots are fired at where their targets WERE when the
   *            trigger was pulled, which is the only symmetric rule: you cannot dodge a bullet aimed
   *            at you this tick, and neither can they. Two bots can kill each other on the same tick,
   *            and that is a draw, and it is correct.
   *
   * Movement is resolved against pre-tick occupancy, so a bot may roll into a square another bot is
   * leaving. But two bots may never end up in the same square, and they may never swap through each
   * other — those cancel, and both bump.
   */
  for (round = 1; round <= maxRounds; round++) {
    // ---- DECIDE: everyone chooses, blind to what the others chose ----
    const intents = bots.map((b) => (b.wrecked || b.done ? null : chooseAction(b)));

    // ---- RESOLVE (1): shots, all at once, all aimed at the pre-tick world ----
    //
    // Note `aliveAtTickStart`, and not `!b.wrecked`. If we checked liveness AS WE FIRED, the bot we
    // happened to iterate first could kill the second and the second's shot would never leave the
    // barrel — the sequential bias creeping straight back in through the shooting phase. Both
    // triggers were pulled at the same instant. Both bullets fly, even if one of them is fired by a
    // bot that is already dead by the time it lands. That's what makes mutual destruction possible,
    // and mutual destruction is exactly what two identical bots deserve.
    const aliveAtTickStart = bots.map((b) => !b.wrecked);
    bots.forEach((b, i) => {
      if (intents[i]?.name === "shoot" && aliveAtTickStart[i]) fire(b);
    });

    // ---- RESOLVE (2): movement, with collisions cancelled rather than raced ----
    const movers = bots.filter((b, i) => intents[i] && intents[i]!.name !== "shoot" && !b.wrecked);
    const before = new Map(bots.map((b) => [b.index, { ...b.pos }]));
    const planned = new Map<number, { pos: Vec2; facing: Facing; cmd: Command }>();

    for (const b of movers) {
      const cmd = intents[b.index]!;
      const { state: next } = executeCommand(worldFor(b), { ...botState(b) }, cmd);
      planned.set(b.index, { pos: next.pos, facing: next.facing, cmd });
    }

    // two bots may not land on the same square, and may not swap straight through one another
    const cancelled = new Set<number>();
    for (const a of movers) {
      for (const c of movers) {
        if (a.index >= c.index) continue;
        const pa = planned.get(a.index)!, pc = planned.get(c.index)!;
        const sameSquare = pa.pos.x === pc.pos.x && pa.pos.y === pc.pos.y;
        const swapped =
          pa.pos.x === before.get(c.index)!.x && pa.pos.y === before.get(c.index)!.y &&
          pc.pos.x === before.get(a.index)!.x && pc.pos.y === before.get(a.index)!.y;
        if (sameSquare || swapped) { cancelled.add(a.index); cancelled.add(c.index); }
      }
    }

    for (const b of movers) {
      if (cancelled.has(b.index)) {
        events.push({ round, bot: b.index, type: "bump", at: { ...b.pos } });
        continue;
      }
      applyAction(b, intents[b.index]!);
      if (b.isPlayer && atBeacon(b) && (winRule === "reachBeacon" || winRule === "both")) {
        events.push({ round, bot: b.index, type: "reach", at: { ...b.pos } });
      }
    }

    const decided = decide();
    if (decided) {
      return { outcome: decided, events, rounds: round, survivors: bots.filter((x) => !x.wrecked).map((x) => x.index) };
    }
    // everyone finished their program without a decision → stop (draw)
    if (bots.every((b) => b.done || b.wrecked)) break;
  }

  const final = decide();
  return {
    outcome: final ?? "draw",
    events,
    rounds: Math.min(round, maxRounds),
    survivors: bots.filter((x) => !x.wrecked).map((x) => x.index),
  };
}
