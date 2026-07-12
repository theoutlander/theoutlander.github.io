import { describe, it, expect } from "vitest";
import { ALL } from "../../src/content/missions";
import { countCodeLines } from "../../src/sandbox/lines";

/**
 * THE PAR TRAP. Par is scored in LINES. If an author solution is crammed onto one line
 * (`repeat 3 { forward(2); honk(); }`), par gets set to that cramped count — and a kid who writes
 * the SAME logic the way the editor's own autocomplete formats it (a multi-line block) blows past
 * par and loses a star. That happened on THE LOOP: par 3, natural loop 5 lines. She used a loop
 * correctly for the first time and the game said "can you do it in fewer lines?"
 *
 * So: author solutions must be written the way a kid writes them, and par must fit that.
 */
describe("par is fair — no level punishes readable code", () => {
  for (const m of ALL) {
    it(`${m.id} "${m.title}" — author solution isn't crammed onto one line`, () => {
      const crammed = m.authorSolution
        .split("\n")
        .filter((l) => l.includes("{") && l.includes("}") && l.includes(";"));
      expect(
        crammed,
        `${m.id} crams a block onto one line, which sets an unreachable par:\n  ${crammed.join("\n  ")}`,
      ).toEqual([]);
    });

    it(`${m.id} — par fits the author solution as written`, () => {
      expect(
        countCodeLines(m.authorSolution),
        `${m.id}: par ${m.parLines} is smaller than its own solution`,
      ).toBeLessThanOrEqual(m.parLines);
    });
  }
});
