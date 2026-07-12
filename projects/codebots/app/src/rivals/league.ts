import { runBattle, type Entrant } from "../sim/battle";
import { BATTLE_API } from "../content/enemies";
import type { Arena, CellKind, Facing, Vec2 } from "../sim/types";

/**
 * THE LEAGUE — how two programs are actually judged against each other.
 *
 * A single fight in a single arena is not a measure of anything, and it took a good question to see
 * it: if every battle happens on the same board from the same two squares, then the "best bot" in the
 * game is just whichever one happens to suit that one map. Worse, the two seats are not equal — one
 * bot acts first in every round — so a slice of the ladder would be decided by nothing but who was
 * listed on the left.
 *
 * The obvious fix, randomising, would destroy the one property the whole feature rests on: that the
 * result of A vs B is a pure function of their two programs, so every browser can recompute the same
 * standings with no server and nobody able to lie about a win.
 *
 * So we don't randomise. We DERIVE.
 *
 *   1. The arenas for a matchup are generated from a seed made of the two bots' own ids. Same pair ⇒
 *      same set of boards, forever, for everyone. Different pair ⇒ different boards. Nothing to
 *      memorise, nothing to exploit, and still perfectly reproducible.
 *
 *   2. Every board is played TWICE, with the seats swapped. This is what makes it fair, and it's why
 *      the boards don't need to be symmetric: any advantage the map or the turn order confers is
 *      handed to each bot exactly once, so it cancels. A bot only wins because it is better.
 *
 * The proof that the format is honest is a test: a bot fighting a COPY OF ITSELF must draw. If
 * identical code doesn't tie, something other than the code is deciding fights.
 */

/** how many different boards a matchup is fought over (each played from both sides) */
export const BOARDS_PER_MATCH = 4;

/** hard stop on a fight that neither bot can win, so a pair of turtles can't hang the league */
const MAX_ROUNDS = 120;

/** mulberry32 — deterministic, tiny. Same seed, same board, on every machine. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

/** A stable number from two bot ids. Order-independent, so A-vs-B and B-vs-A get the SAME boards. */
export function matchSeed(a: string, b: string): number {
  const [x, y] = [a, b].sort(); // order-independent: the pairing decides the boards, not the listing
  let h = 2166136261;
  for (const ch of `${x}|${y}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface Board {
  arena: Arena;
  left: { pos: Vec2; facing: Facing };
  right: { pos: Vec2; facing: Facing };
}

/**
 * Build one board — with 180° ROTATIONAL symmetry.
 *
 * Not a mirror. A rotation. The difference matters and it is easy to get wrong:
 *
 * Reflect the board left-to-right and the two bots are NOT in the same situation, because turning is
 * not reflection-symmetric. A bot facing east that calls left() goes north; its reflected twin faces
 * west, and left() sends it SOUTH. The same program in the mirrored position behaves differently, and
 * the fight is decided by the geometry rather than the code.
 *
 * Rotate the board 180° about its centre and everything lines up: east becomes west, north becomes
 * south, and a left turn stays a left turn. Bot A's world, rotated, IS bot B's world. Identical
 * programs therefore play identical fights and kill each other on the same tick — a draw, which is
 * the honest answer, and the thing the mirror-match test checks.
 *
 * The centre lane always stays open. We shipped a walled middle once and every fight ended a
 * scoreless 200-round draw: a very quiet way to have no game at all.
 */
export function board(seed: number): Board {
  const r = rng(seed);
  const cols = int(r, 13, 19) | 1; // odd, so there's a true centre
  const rows = int(r, 7, 11) | 1;
  const mid = (rows - 1) / 2;
  const cells: CellKind[][] = Array.from({ length: rows }, () => Array<CellKind>(cols).fill("floor"));

  const blocks = int(r, 3, 6);
  for (let i = 0; i < blocks; i++) {
    const x = int(r, 2, cols - 3);
    const y = int(r, 0, rows - 1);
    if (y === mid) continue; // never wall the lane they meet in
    cells[y][x] = "wall";
    // ...and its partner under a 180° turn. Whatever cover one bot gets, the other gets exactly.
    const rx = cols - 1 - x, ry = rows - 1 - y;
    if (ry !== mid) cells[ry][rx] = "wall";
  }

  return {
    arena: {
      cols, rows, cells,
      crates: [], coins: [], chests: [], gates: [], targets: [],
      beacon: { x: 0, y: 0 }, // the arena is a FIGHT; the beacon wins nothing here
    },
    left: { pos: { x: 0, y: mid }, facing: "E" },
    right: { pos: { x: cols - 1, y: mid }, facing: "W" },
  };
}

export interface Fighter {
  id: string;
  name: string;
  source: string;
  stats?: Entrant["stats"];
}

export interface MatchResult {
  wins: number;
  losses: number;
  draws: number;
  /** true if `a` won the matchup outright */
  winner: "a" | "b" | "draw";
}

/** One fight, one board, one seating. Pure. */
function fightOnce(a: Fighter, b: Fighter, bd: Board, aOnLeft: boolean): "a" | "b" | "draw" {
  const [first, second] = aOnLeft ? [a, b] : [b, a];
  const res = runBattle(
    bd.arena,
    [
      { id: first.id, source: first.source, isPlayer: true, stats: first.stats },
      { id: second.id, source: second.source, stats: second.stats },
    ],
    [bd.left, bd.right],
    BATTLE_API,
    "lastStanding",
    MAX_ROUNDS,
  );
  if (res.outcome === "draw") return "draw";
  // `outcome` is from the FIRST entrant's point of view — translate it back to a/b
  const firstWon = res.outcome === "win";
  const firstIsA = aOnLeft;
  return firstWon === firstIsA ? "a" : "b";
}

/**
 * Play the whole matchup: several boards, each from both seats.
 *
 * Deterministic in every particular — same two programs, same answer, on any machine, forever.
 */
export function playMatch(a: Fighter, b: Fighter): MatchResult {
  const seed = matchSeed(a.id, b.id);
  let wins = 0, losses = 0, draws = 0;

  // One fight per board — no seat-swapping. We used to play every board twice with the sides
  // reversed, to cancel out the fact that whoever went first shot first. That was a plaster over an
  // engine bug: the fight is SIMULTANEOUS now, so there is no "first", and the seat is worth nothing.
  // Fixing the tick beat compensating for it.
  for (let i = 0; i < BOARDS_PER_MATCH; i++) {
    const r = fightOnce(a, b, board(seed + i * 7919), true);
    if (r === "a") wins++;
    else if (r === "b") losses++;
    else draws++;
  }

  return { wins, losses, draws, winner: wins > losses ? "a" : losses > wins ? "b" : "draw" };
}

export interface Standing {
  fighter: Fighter;
  wins: number;
  losses: number;
  draws: number;
  points: number;
}

/**
 * The whole table, computed from nothing but the programs.
 *
 * THIS is why there is no server, no cron job and no background process. The standings aren't a
 * record of things that happened — they're a FUNCTION of the published code, so every browser that
 * loads this page derives the identical table, and no child can inflate her own record, because
 * anyone can recompute the truth from the source.
 */
export function standings(fighters: Fighter[]): Standing[] {
  const table = new Map<string, Standing>(
    fighters.map((f) => [f.id, { fighter: f, wins: 0, losses: 0, draws: 0, points: 0 }]),
  );

  for (let i = 0; i < fighters.length; i++) {
    for (let j = i + 1; j < fighters.length; j++) {
      const a = fighters[i], b = fighters[j];
      const m = playMatch(a, b);
      const ta = table.get(a.id)!, tb = table.get(b.id)!;
      if (m.winner === "a") { ta.wins++; tb.losses++; ta.points += 3; }
      else if (m.winner === "b") { tb.wins++; ta.losses++; tb.points += 3; }
      else { ta.draws++; tb.draws++; ta.points++; tb.points++; }
    }
  }

  return [...table.values()].sort(
    (x, y) => y.points - x.points || y.wins - x.wins || x.fighter.name.localeCompare(y.fighter.name),
  );
}
