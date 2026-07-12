import { desugarRepeat, toGeneratorSource, findUnknownCalls, collectFunctionNames } from "../sandbox/transform";
import { unknownCommandMessage } from "../sandbox/errors";
import { runBattle, type Entrant } from "../sim/battle";
import type { Arena, Facing, Vec2 } from "../sim/types";

/**
 * CHECK A BOT BEFORE IT GOES OUT INTO THE WORLD.
 *
 * The battle sim already lets a broken rival forfeit rather than crash the other kid's game, and that
 * stays — it's the last line of defence, and it has to hold for rows that predate this check or for a
 * program that misbehaves in some way we haven't thought of.
 *
 * But forfeiting is a terrible thing to happen to the kid who PUBLISHED it. Her bot goes out, loses
 * every fight without moving, and she has no idea why: no error, no line number, nothing. She just
 * quietly sits at the bottom of a leaderboard wondering why everyone is better than her. That's a
 * miserable, invisible failure, and it's entirely avoidable — we know at publish time.
 *
 * So we check it while she's still standing in front of the editor that can fix it.
 */

export type Validation =
  | { ok: true }
  | { ok: false; message: string; line: number | null };

/** A tiny sparring arena. Nothing here is shown to anyone — we just need somewhere for the bot to move. */
function sparringArena(): Arena {
  const cols = 9, rows = 5;
  const cells = Array.from({ length: rows }, () => Array<string>(cols).fill("floor"));
  return {
    cols, rows, cells: cells as Arena["cells"],
    crates: [], coins: [], chests: [], gates: [], targets: [], beacon: { x: 8, y: 2 },
  };
}
const HERE: { pos: Vec2; facing: Facing } = { pos: { x: 0, y: 2 }, facing: "E" };
const THERE: { pos: Vec2; facing: Facing } = { pos: { x: 6, y: 2 }, facing: "W" };

export function validateBot(source: string, api: string[]): Validation {
  if (!source.trim()) {
    return { ok: false, message: "There's nothing to publish yet — write your bot's brain first.", line: null };
  }

  const desugared = desugarRepeat(source);

  // 1. A command that doesn't exist. Same kid-worded message she'd get in a level, so the wording she
  //    already trusts is the wording she sees here.
  const known = [...api, ...collectFunctionNames(desugared)];
  const unknown = findUnknownCalls(desugared, known);
  if (unknown.length) {
    const u = unknown[0];
    return { ok: false, message: unknownCommandMessage(u.name, u.line, api), line: u.line };
  }

  // 2. Does it even compile? A missing bracket here would otherwise become a bot that forfeits every
  //    fight it's ever in, silently, forever.
  try {
    const gen = toGeneratorSource(desugared, api);
    new Function("__call", `${gen}\nreturn __main;`)(() => ({ name: "noop", args: [] }));
  } catch (e) {
    const err = e as { message?: string; loc?: { line?: number } };
    return {
      ok: false,
      message: `Your bot won't start: ${err.message ?? "check for a missing ( ) or { }"}`,
      line: err.loc?.line ?? null,
    };
  }

  // 3. Does it actually DO anything?
  //
  // A bot that compiles perfectly but never moves — an empty loop, a program that only ever reads
  // sensors, a `while (true) {}` — is legal code and a useless rival. It would lose every fight
  // without ever twitching, and she'd never learn why. Give it a sparring partner and check it does
  // at least ONE thing in the world.
  try {
    const entrants: Entrant[] = [
      { id: "candidate", source, isPlayer: true },
      { id: "dummy", source: "repeat 40 { honk() }" }, // stands there honking; never fights back
    ];
    const res = runBattle(sparringArena(), entrants, [HERE, THERE], api, "both");
    const acted = res.events.some((e) => e.bot === 0);
    if (!acted) {
      return {
        ok: false,
        message:
          "Your bot compiles, but it never actually does anything — it would lose every fight without moving. Make sure it can move or shoot.",
        line: null,
      };
    }
  } catch {
    return { ok: false, message: "Your bot crashed when we tried it out. Run it in the arena first.", line: null };
  }

  return { ok: true };
}
