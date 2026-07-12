import { runBattle, type Entrant } from "../sim/battle";
import type { Arena, Facing, Vec2 } from "../sim/types";
import type { BattleEvent } from "../sim/battle";

/**
 * A fight between two kids' programs — and the replay of it.
 *
 * There is no game server here, and there doesn't need to be one. The battle sim is deterministic:
 * the same two programs, in the same arena, produce a byte-identical event log every single time
 * (tests/sim/battle.test.ts pins this). So a REPLAY is not a recording — it's a re-run. We store the
 * two programs and re-derive the entire fight, frame for frame, on demand.
 *
 * That's what makes a whole PvP feature cost a few kilobytes of text and no infrastructure. It's also
 * the thing that would quietly poison everything if it ever broke: if the sim stopped being
 * deterministic, every replay would show a fight that didn't happen and every leaderboard entry would
 * be a lie. Hence the test.
 */

export interface FightRecord {
  /** the challenger's program (hers) */
  mine: string;
  /** the defender's published program */
  theirs: string;
  /** who won, from the challenger's point of view */
  outcome: "win" | "lose" | "draw";
  rounds: number;
}

export interface FightResult extends FightRecord {
  events: readonly BattleEvent[];
}

export interface FightSetup {
  arena: Arena;
  api: string[];
  myStart: { pos: Vec2; facing: Facing };
  theirStart: { pos: Vec2; facing: Facing };
  myStats?: Entrant["stats"];
  theirStats?: Entrant["stats"];
}

/**
 * Run the fight. Pure: same inputs, same outputs, no clock, no randomness.
 *
 * A published bot is a program written by a nine-year-old and never reviewed by anyone. It may throw,
 * it may spin in an infinite loop, it may be nonsense. None of that may crash the fight for the kid on
 * the other side — a hostile or broken opponent simply forfeits its turns and loses. The sim already
 * caps a bot's thinking per round and never lets a program run away; we lean on that and pin it with a
 * test, because "the other kid's bot froze my game" is the fastest way to lose a player.
 */
export function fight(mine: string, theirs: string, setup: FightSetup): FightResult {
  const entrants: Entrant[] = [
    { id: "me", source: mine, isPlayer: true, stats: setup.myStats },
    { id: "them", source: theirs, stats: setup.theirStats },
  ];
  const res = runBattle(setup.arena, entrants, [setup.myStart, setup.theirStart], setup.api, "both");
  return { mine, theirs, outcome: res.outcome, rounds: res.rounds, events: res.events };
}

/**
 * Replay a fight from its record. This re-RUNS it rather than playing back a stored film, which is
 * why a replay costs two strings instead of a video — and why it can never drift out of sync with
 * what the sim would actually do.
 */
export function replay(record: FightRecord, setup: FightSetup): FightResult {
  return fight(record.mine, record.theirs, setup);
}
