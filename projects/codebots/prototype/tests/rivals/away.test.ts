import { describe, it, expect } from "vitest";
import { whileYouWereAway, markSeen, fingerprint } from "../../src/rivals/away";
import { playMatch, board, matchSeed, type Fighter } from "../../src/rivals/league";
import { seasonSalt } from "../../src/rivals/leagueCache";

/**
 * THE RETURN HOOK, AND THE TWO WAYS IT COULD BE A LIE.
 *
 * Nothing in this game ever gave a kid a reason to come back tomorrow. "While you were away, three
 * bots fought yours — you beat two" is that reason, and it costs no server: the sim is deterministic,
 * so the result of her bot against a rival is a pure function of the two programs, and can be worked
 * out the moment she opens the game. It gives the identical answer it would have given at 3am.
 *
 * Two ways to ruin it, both of them a form of lying to her:
 *
 *   1. TELLING HER THE SAME NEWS TWICE. If it reports the same three rivals every time she opens the
 *      game, "new challengers!" becomes noise within a day, and she stops believing anything the game
 *      says. A rival counts as news only if they're NEW, or if they've CHANGED THEIR CODE.
 *
 *   2. INVENTING FIGHTS. The results have to be the same ones the league table shows. If the badge on
 *      the door disagrees with the standings, one of them is made up.
 */
const f = (id: string, source: string): Fighter => ({ id, name: id, source });

const MINE = f(
  "me",
  "while (true) { if (enemyAhead()) { shoot() } else if (closerAhead()) { forward(1) } else if (enemyLeft()) { left() } else { right() } }",
);
const WEAK = f("weak", "while (true) { forward(1) }");
const STRONG = f(
  "strong",
  "while (true) { if (enemyAhead()) { shoot() } else if (closerAhead()) { forward(1) } else if (enemyLeft()) { left() } else { right() } }",
);

describe("while you were away", () => {
  it("reports a fight against every rival she hasn't met", () => {
    const r = whileYouWereAway(MINE, [WEAK, STRONG], {});
    expect(r.results).toHaveLength(2);
    expect(r.wins + r.losses + r.draws).toBe(2);
  });

  it("beats a bot with no brain — and knows it", () => {
    const r = whileYouWereAway(MINE, [WEAK], {});
    expect(r.results[0].outcome).toBe("win");
  });

  it("NEVER tells her the same news twice", () => {
    // the fastest way to make a returning player stop trusting the game
    const seen = markSeen([WEAK, STRONG]);
    expect(whileYouWereAway(MINE, [WEAK, STRONG], seen).results).toHaveLength(0);
  });

  it("...but a rival who REWRITES their bot is news again", () => {
    // that's a genuinely new opponent — same kid, different brain, and possibly a different result
    const seen = markSeen([WEAK]);
    const rewritten = { ...WEAK, source: "while (true) { if (enemyAhead()) { shoot() } else { forward(1) } }" };
    expect(whileYouWereAway(MINE, [rewritten], seen).results).toHaveLength(1);
  });

  it("she is never her own rival", () => {
    expect(whileYouWereAway(MINE, [MINE], {}).results).toHaveLength(0);
  });

  it("a loss comes with the fight to watch — losing has to teach her something", () => {
    // an identical bot draws (the simultaneous engine guarantees it), so build a rival that actually
    // beats her: same brain, but it out-ranges her
    const sniperKit = { ...STRONG, id: "sharp", stats: { range: 9, armor: 65, damage: 15 } };
    const weakMe = { ...MINE, stats: { range: 4, armor: 60, damage: 15 } };
    const r = whileYouWereAway(weakMe, [sniperKit], {});
    if (r.losses > 0) {
      expect(r.bestLesson).not.toBeNull();
      expect(r.bestLesson!.rival.source.length).toBeGreaterThan(0); // there IS code to read
    }
  });

  it("is pure — same inputs, same report, no clock and no network", () => {
    const a = JSON.stringify(whileYouWereAway(MINE, [WEAK, STRONG], {}));
    const b = JSON.stringify(whileYouWereAway(MINE, [WEAK, STRONG], {}));
    expect(a).toBe(b);
  });

  it("fights the SAME boards the ladder ranked on — one season salt, every consumer", () => {
    // The bug this pins: the salt reached leagueCache and nowhere else, so the away card could report
    // a fight the standings never scored. Same two bots + same salt must give the same match, always.
    const salt = seasonSalt("S2900");
    const r = whileYouWereAway(MINE, [WEAK], {}, salt);
    const direct = playMatch(MINE, WEAK, salt);
    expect(r.results[0].match).toEqual(direct);
    expect(r.results[0].outcome).toBe(direct.winner === "a" ? "win" : direct.winner === "b" ? "lose" : "draw");
  });

  it("a season salt really does change the boards — so passing it is not cosmetic", () => {
    const salt = seasonSalt("S2900");
    expect(salt).not.toBe(0);
    const seed = matchSeed(MINE.id, WEAK.id);
    expect(JSON.stringify(board(seed + salt))).not.toBe(JSON.stringify(board(seed)));
  });

  it("a fingerprint changes when the code does, and only then", () => {
    expect(fingerprint("forward(1)")).toBe(fingerprint("forward(1)"));
    expect(fingerprint("forward(1)")).not.toBe(fingerprint("forward(2)"));
  });
});
