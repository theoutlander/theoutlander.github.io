import { describe, it, expect } from "vitest";
import { DRILLS, drillArenas, drillPassed } from "../../src/content/drills";
import { runInSandbox } from "../../src/sandbox/driver";

/**
 * The drill's entire reason to exist is that YOU CANNOT FAKE IT.
 *
 * In the campaign, every arena is fixed and visible, so a kid can beat a sensor level without ever
 * touching a sensor — she reads the board, counts the squares, and hardcodes the answer. It clears.
 * She learns nothing. A drill runs ONE program against THREE random arenas, so counting is useless.
 *
 * These tests hold both ends of that claim, and the second one is the load-bearing one:
 *   1. the concept-using solution clears all three arenas          (the drill is beatable)
 *   2. the hardcoded solution — tuned perfectly to arena #1 — FAILS   (the drill cannot be faked)
 *
 * If (2) ever goes green, the drill has quietly become another level you can beat by looking, and it
 * has stopped teaching. That's the regression worth screaming about.
 */
const SEEDS = [1, 2, 3, 7, 11, 42, 99, 123, 777, 2024, 31337, 60613];

describe("PROVE IT drills — the concept is the only way through", () => {
  for (const family of DRILLS) {
    it(`${family.title} — the general solution clears all 3 arenas, on every seed`, () => {
      for (const seed of SEEDS) {
        const arenas = drillArenas(family, seed);
        expect(arenas).toHaveLength(3);
        arenas.forEach((m, i) => {
          const res = runInSandbox(m, family.authorSolution);
          expect(
            drillPassed(m, res.finalState.pos),
            `${family.title} seed ${seed} arena ${i + 1}: the concept-using solution did not park on the beacon — the drill is broken`,
          ).toBe(true);
        });
      }
    });

    it(`${family.title} — HARDCODING FAILS: an answer tuned to arena 1 does not clear arenas 2 and 3`, () => {
      for (const seed of SEEDS) {
        const [a1, ...rest] = drillArenas(family, seed);
        const cheat = family.hardcodedTrap(a1); // perfect for arena 1 — she counted the squares
        expect(
          drillPassed(a1, runInSandbox(a1, cheat).finalState.pos),
          `${family.title} seed ${seed}: the hardcoded answer should at least work on the field it was written for`,
        ).toBe(true);

        // ...and must fall apart somewhere else, or the kid never needs the sensor.
        // The bar is exactly the drill's own bar: you PASS only by parking on all three. A cheat may
        // luck into one more arena (a bump can stop it in the right place by accident) — it must
        // never survive both, because then hardcoding beats the drill and the concept is optional.
        const survived = rest.filter((m) => drillPassed(m, runInSandbox(m, cheat).finalState.pos)).length;
        expect(
          survived,
          `${family.title} seed ${seed}: hardcoded code passed ${survived}/2 of the other arenas — it BEATS the drill without ever using the concept, so this drill teaches nothing`,
        ).toBeLessThan(2);
      }
    });

    it(`${family.title} — the three arenas really are different`, () => {
      for (const seed of SEEDS) {
        const shapes = drillArenas(family, seed).map((m) =>
          JSON.stringify([m.arena.cols, m.arena.beacon, m.arena.targets, m.arena.cells]),
        );
        expect(new Set(shapes).size, `${family.title} seed ${seed} handed out duplicate arenas`).toBeGreaterThan(1);
      }
    });

    it(`${family.title} — same seed, same drill (reproducible, so it can be shared)`, () => {
      const a = JSON.stringify(drillArenas(family, 42));
      const b = JSON.stringify(drillArenas(family, 42));
      expect(a).toBe(b);
    });
  }
});
