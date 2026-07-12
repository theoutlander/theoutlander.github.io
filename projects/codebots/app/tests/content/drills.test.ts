import { describe, it, expect } from "vitest";
import { DRILLS, drillArenas, drillPassed, solutionFor } from "../../src/content/drills";
import { CONCEPTS } from "../../src/content/concepts";
import { runInSandbox } from "../../src/sandbox/driver";
import { countCodeLines } from "../../src/sandbox/lines";

/**
 * THIS IS HOW THE GAME PROVES A KID LEARNED SOMETHING.
 *
 * Finishing a level proves nothing. Every campaign arena is fixed and visible, so a kid can beat a
 * sensor level by reading the board, counting squares and hardcoding `forward(3); shoot()`. Three
 * stars, zero learning. That is not a hypothetical — it's the hole these drills exist to plug.
 *
 * Learning means TRANSFER: she can do it on a problem she has never seen. So a drill runs ONE program
 * against fields generated fresh, and she passes only by parking on every beacon. Counting cannot
 * survive that. **Passing a drill IS transfer, and transfer is the definition of having learned it.**
 * It is the only real mastery signal in the product.
 *
 * Two assertions carry the whole thing:
 *   1. the concept-using solution passes            (the drill is beatable)
 *   2. the hardcoded solution FAILS                 (the drill cannot be faked)
 *
 * If (2) ever goes green, that drill has quietly become another level you can beat by looking, and it
 * has stopped proving anything at all.
 */
const SEEDS = [1, 2, 3, 7, 11, 42, 99, 123, 777, 2024, 31337, 60613];

describe("PROVE IT — the concept is the only way through", () => {
  it("EVERY concept the game teaches has a drill that can prove it", () => {
    // The point of the whole exercise. A concept with no drill is a concept the game CANNOT tell you
    // whether she learned — she may have counted squares the entire way and we'd never know.
    const covered = new Set(DRILLS.map((d) => d.concept));
    const missing = CONCEPTS.map((c) => c.key).filter((k) => !covered.has(k));
    expect(
      missing,
      `these concepts have no way to prove mastery: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  for (const family of DRILLS) {
    it(`${family.title} — the concept-using solution passes every field, on every seed`, () => {
      for (const seed of SEEDS) {
        const arenas = drillArenas(family, seed);
        expect(arenas).toHaveLength(family.fields);
        arenas.forEach((m, i) => {
          const source = solutionFor(family, m);
          const res = runInSandbox(m, source);
          expect(
            drillPassed(m, res.finalState.pos),
            `${family.title} seed ${seed} field ${i + 1}: the intended solution does not park on the beacon — the drill is BROKEN and a kid cannot pass it`,
          ).toBe(true);
        });

        // and it must fit its own budget, or we're asking for something impossible
        if (family.maxLines) {
          const lines = countCodeLines(solutionFor(family, arenas[0]));
          expect(
            lines,
            `${family.title}: the intended solution is ${lines} lines but the budget is ${family.maxLines}`,
          ).toBeLessThanOrEqual(family.maxLines);
        }
      }
    });

    it(`${family.title} — HARDCODING FAILS: it cannot be beaten without the concept`, () => {
      if (!family.hardcodedTrap) return; // sequencing has no shortcut to close — writing the sequence IS the skill
      for (const seed of SEEDS) {
        const fields = drillArenas(family, seed);
        const cheat = family.hardcodedTrap(fields[0]); // tuned perfectly to field 1: she counted

        if (family.maxLines) {
          // A BUDGET drill: brute force is defeated by not fitting. That IS the trap failing.
          const lines = countCodeLines(cheat);
          expect(
            lines,
            `${family.title} seed ${seed}: longhand is ${lines} lines and the budget is ${family.maxLines} — it FITS, so she never needs the loop`,
          ).toBeGreaterThan(family.maxLines);
          continue;
        }

        // A SENSING drill: the cheat works on the field it was written for...
        expect(
          drillPassed(fields[0], runInSandbox(fields[0], cheat).finalState.pos),
          `${family.title} seed ${seed}: the hardcoded answer should at least work on the field it was written for`,
        ).toBe(true);

        // ...and must fall apart on another, or the sensor is optional and the drill teaches nothing.
        const survived = fields
          .slice(1)
          .filter((m) => drillPassed(m, runInSandbox(m, cheat).finalState.pos)).length;
        expect(
          survived,
          `${family.title} seed ${seed}: hardcoded code beat ${survived}/${fields.length - 1} of the other fields — it BEATS the drill without ever using the concept, so this drill proves nothing`,
        ).toBeLessThan(fields.length - 1);
      }
    });

    it(`${family.title} — a required construct is actually required by the answer`, () => {
      for (const word of family.mustUse ?? []) {
        const source = solutionFor(family, drillArenas(family, 42)[0]);
        expect(
          source.includes(word),
          `${family.title} demands "${word}" but its own solution doesn't use it`,
        ).toBe(true);
      }
    });

    it(`${family.title} — the fields really are different every time`, () => {
      for (const seed of SEEDS) {
        const shapes = drillArenas(family, seed).map((m) =>
          JSON.stringify([m.arena.cols, m.arena.beacon, m.arena.targets, m.arena.cells, m.arena.gates]),
        );
        if (family.fields > 1) {
          expect(new Set(shapes).size, `${family.title} seed ${seed} handed out duplicate fields`).toBeGreaterThan(1);
        }
      }
      // and across seeds — otherwise she'd just memorise the one field
      const a = JSON.stringify(drillArenas(family, 1)[0].arena);
      const b = JSON.stringify(drillArenas(family, 999)[0].arena);
      expect(a, `${family.title} generates the same field for every seed — there's nothing to transfer`).not.toBe(b);
    });

    it(`${family.title} — same seed, same drill (reproducible, so it can be shared)`, () => {
      expect(JSON.stringify(drillArenas(family, 42))).toBe(JSON.stringify(drillArenas(family, 42)));
    });
  }
});
