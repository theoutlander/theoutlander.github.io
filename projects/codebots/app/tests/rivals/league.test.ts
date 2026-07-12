import { describe, it, expect } from "vitest";
import { playMatch, standings, board, matchSeed, BOARDS_PER_MATCH, type Fighter } from "../../src/rivals/league";

/**
 * IS THE LADDER HONEST?
 *
 * Every fight used to happen on ONE board, from the SAME two squares. That makes the "best bot" in the
 * game whichever one happens to suit that single map — and it's worse than that, because the two seats
 * aren't equal: one bot acts first in every round. A slice of the ladder would have been decided by
 * nothing but who got listed on the left.
 *
 * Randomising would have fixed the map and destroyed the thing the whole feature rests on: that A vs B
 * is a pure function of two programs, so every browser recomputes the same standings and nobody can
 * lie about a win. So we don't randomise — we DERIVE the boards from the two bots' own ids, and play
 * each board from BOTH seats.
 *
 * The mirror match is the proof. A bot fighting a copy of itself must draw. If identical code does not
 * tie, then something other than the code is deciding fights, and the ladder is a lie.
 */
const fighter = (id: string, source: string): Fighter => ({ id, name: id, source });

const BRAINLESS = fighter("brainless", "while (true) { forward(1) }");
const THINKER = fighter(
  "thinker",
  "while (true) { if (enemyAhead()) { shoot() } else if (closerAhead()) { forward(1) } else if (enemyLeft()) { left() } else { right() } }",
);
const TURTLE = fighter("turtle", "while (true) { honk() }");

describe("the league is fair", () => {
  it("A BOT FIGHTING A COPY OF ITSELF DRAWS — nothing but the code decides a fight", () => {
    // The single most important test in the arena. Identical programs, so any difference in the
    // result could only come from the map or from who moves first — exactly the two biases the
    // seat-swap exists to cancel.
    for (const src of [THINKER, BRAINLESS, TURTLE]) {
      const clone = { ...src, id: `${src.id}-clone`, name: `${src.name}-clone` };
      const m = playMatch(src, clone);
      expect(
        m.winner,
        `${src.id} beat an identical copy of itself ${m.wins}-${m.losses} — the board or the turn order is deciding fights, not the code`,
      ).toBe("draw");
    }
  });

  it("better code beats worse code, across a whole set of boards", () => {
    expect(playMatch(THINKER, BRAINLESS).winner).toBe("a");
    expect(playMatch(BRAINLESS, THINKER).winner).toBe("b");
  });

  it("is deterministic — the same two programs give the same result, always", () => {
    // this is what lets every browser compute the same table with no server, and makes a fake win
    // impossible: anyone can recompute the truth from the source
    const a = JSON.stringify(playMatch(THINKER, BRAINLESS));
    const b = JSON.stringify(playMatch(THINKER, BRAINLESS));
    expect(a).toBe(b);
  });

  it("the pairing decides the boards, not who was listed first", () => {
    expect(matchSeed("a", "b")).toBe(matchSeed("b", "a"));
  });

  it("a matchup is fought over several DIFFERENT boards — one map is not a measure of anything", () => {
    const seed = matchSeed("x", "y");
    const shapes = new Set(
      Array.from({ length: BOARDS_PER_MATCH }, (_, i) => JSON.stringify(board(seed + i * 7919).arena)),
    );
    expect(shapes.size, "every board in the match is identical — there's nothing to generalise to").toBeGreaterThan(1);
    expect(BOARDS_PER_MATCH).toBeGreaterThan(1);
  });

  it("different pairs get different boards, so nobody can drill one map", () => {
    expect(JSON.stringify(board(matchSeed("a", "b")).arena)).not.toBe(
      JSON.stringify(board(matchSeed("c", "d")).arena),
    );
  });

  it("every board leaves the centre lane open — a walled middle means the bots never meet", () => {
    // we shipped this once: cover across the lane, and every fight ended a scoreless 200-round draw.
    // A very quiet way to have no game at all.
    for (let i = 0; i < 30; i++) {
      const bd = board(i * 104729 + 7);
      const mid = (bd.arena.rows - 1) / 2;
      expect(bd.arena.cells[mid].every((c) => c !== "wall"), `board ${i} walls off the lane they meet in`).toBe(true);
    }
  });

  it("two bots that cannot hurt each other draw, and don't hang the league", () => {
    const other = { ...TURTLE, id: "turtle2", name: "turtle2" };
    const m = playMatch(TURTLE, other);
    expect(m.winner).toBe("draw");
    expect(m.draws).toBe(BOARDS_PER_MATCH * 2);
  });

  it("the standings are a FUNCTION of the programs — same bots in, same table out", () => {
    const bots = [THINKER, BRAINLESS, TURTLE];
    const once = standings(bots).map((s) => s.fighter.id);
    const twice = standings([...bots].reverse()).map((s) => s.fighter.id);
    // even listed in a different order, the table is the same: no server needed, and no cheating
    expect(once).toEqual(twice);
    expect(once[0]).toBe("thinker"); // and the best code is on top
  });
});
