import { describe, it, expect } from "vitest";
import { fight, replay, type FightSetup } from "../../src/pvp/challenge";
import { BATTLE_API } from "../../src/content/enemies";
import type { Arena, CellKind } from "../../src/sim/types";

/**
 * The entire PvP feature rests on ONE property: the sim is deterministic.
 *
 * We don't record fights, we RE-RUN them. A replay is two strings and a re-derivation, which is why
 * player-vs-player costs a few kilobytes of text and no game server at all. It's also the thing that
 * would quietly poison everything if it broke: if the sim ever stopped being deterministic, every
 * replay would show a fight that never happened, and every single leaderboard entry would be a lie
 * that nobody could detect.
 *
 * The other half is safety. A published bot is a program written by a nine-year-old and reviewed by
 * nobody. It can throw. It can spin forever. It can be gibberish. None of that may crash — or hang —
 * the game of the kid on the other side. "The other kid's bot froze my game" is the fastest possible
 * way to lose a player, and it would be OUR bug, not hers.
 */
function arena(): Arena {
  const cols = 11, rows = 7;
  const cells = Array.from({ length: rows }, () => Array<CellKind>(cols).fill("floor"));
  for (const [x, y] of [[4, 1], [4, 2], [4, 5], [7, 0], [7, 4], [7, 5]] as [number, number][]) cells[y][x] = "wall";
  return { cols, rows, cells, crates: [], coins: [], chests: [], gates: [], targets: [], beacon: { x: 10, y: 3 } };
}

const setup = (): FightSetup => ({
  arena: arena(),
  api: BATTLE_API,
  myStart: { pos: { x: 0, y: 3 }, facing: "E" },
  theirStart: { pos: { x: 7, y: 3 }, facing: "W" },
});

const SMART =
  "while (!atBeacon()) { if (enemyAhead()) { shoot() } else if (blocked()) { right() } else { forward(1) } }";
const NAIVE = "while (!atBeacon()) { forward(1) }";

describe("PvP fights", () => {
  it("A REPLAY IS THE SAME FIGHT — re-running a record reproduces it exactly", () => {
    // If this ever fails, every replay in the game is showing a fight that didn't happen.
    const first = fight(SMART, NAIVE, setup());
    const again = replay({ mine: first.mine, theirs: first.theirs, outcome: first.outcome, rounds: first.rounds }, setup());

    expect(again.outcome).toBe(first.outcome);
    expect(again.rounds).toBe(first.rounds);
    expect(JSON.stringify(again.events)).toBe(JSON.stringify(first.events));
  });

  it("better code wins — that's the entire promise of the arena", () => {
    expect(fight(SMART, NAIVE, setup()).outcome).toBe("win");
    expect(fight(NAIVE, SMART, setup()).outcome).toBe("lose");
  });

  it("an opponent's bot that CRASHES forfeits — it never takes the other kid down with it", () => {
    const broken = "this is not even code (((";
    const res = fight(SMART, broken, setup());
    expect(res.outcome).toBe("win"); // she still gets her fight, and her win
    expect(res.events.length).toBeGreaterThan(0);
  });

  it("an opponent's bot that SPINS FOREVER forfeits its turns — the game never hangs", () => {
    // a kid WILL publish this, on purpose or by accident. It must be boring, not fatal.
    const spinner = "while (true) { enemyNear() }"; // thinks forever, never acts
    const res = fight(SMART, spinner, setup());
    expect(res.outcome).toBe("win");
  });

  it("an opponent's bot that does nothing at all is simply beaten", () => {
    const res = fight(SMART, "", setup());
    expect(res.outcome).toBe("win");
  });

  it("the same two programs always give the same answer, no matter how often they meet", () => {
    // her bot will be fought hundreds of times while she sleeps; every one of those must agree
    const runs = Array.from({ length: 5 }, () => fight(SMART, NAIVE, setup()));
    const first = JSON.stringify(runs[0].events);
    for (const r of runs) expect(JSON.stringify(r.events)).toBe(first);
  });
});
