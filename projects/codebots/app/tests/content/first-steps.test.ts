import { describe, it, expect } from "vitest";
import { FIRST_STEPS, stepMission, stepDone } from "../../src/content/firstSteps";
import { runInSandbox } from "../../src/sandbox/driver";

/**
 * FIRST STEPS is the one screen where failure is unrecoverable.
 *
 * A kid stuck on Level 9 has hints, SHOW ME, a map, and eight levels of proof that she can do this.
 * A kid stuck on beat 1 has none of that — she has "I can't do this", and she closes the tab, and we
 * never see her again. So every beat must be completable by exactly the program its own words tell
 * her to build, using only the chips it actually offers her.
 *
 * If any of these ever goes red, a beginner is sitting in front of a screen that cannot be beaten.
 */

/** the program the step's OWN text tells her to build — nothing more */
const SOLUTION: Record<string, string> = {
  "what-is-code": "", // the lesson IS that an empty program does nothing
  "a-command": "forward()",
  brackets: "forward()",
  numbers: "forward(3)",
  capitals: "forward(2)",
  "a-list": "forward(2)\nhonk()",
  literal: "forward(3)",
  turn: "forward(2)\nleft()\nforward(1)",
  "type-it": "forward(3)",
};

describe("FIRST STEPS — a beginner can actually finish every beat", () => {
  for (const step of FIRST_STEPS) {
    it(`${step.id} — the program the step asks for actually completes it`, () => {
      const source = SOLUTION[step.id];
      expect(source, `no expected solution written for ${step.id}`).toBeDefined();
      const m = stepMission(step);
      const res = runInSandbox(m, source);
      expect(
        stepDone(step, res.finalState.pos),
        `${step.id}: "${source.replace(/\n/g, " ; ")}" does NOT complete the beat — a beginner would be stranded here`,
      ).toBe(true);
    });

    it(`${step.id} — she is only ever asked for words she's been given`, () => {
      // a chip she doesn't have is a wall. The solution may only use this beat's vocabulary
      // (or the keyboard, on the final beat, where she types it herself).
      if (step.typing) return;
      const words = [...SOLUTION[step.id].matchAll(/([a-zA-Z]+)\s*\(/g)].map((m) => m[1]);
      const offered = new Set(step.chips.filter((c) => c.kind === "command").map((c) => c.emit));
      for (const w of words) {
        expect(offered.has(w), `${step.id} needs "${w}()" but never offers her that chip`).toBe(true);
      }
    });

    it(`${step.id} — it EXPLAINS the idea before asking for it`, () => {
      // the whole failure of the old Level 1: it showed `forward(3)` and explained nothing
      expect(step.teach.length, `${step.id} teaches nothing`).toBeGreaterThan(0);
      expect(step.task.length).toBeGreaterThan(0);
      // and a six-year-old has to be able to hear it in one breath
      for (const line of step.teach) {
        expect(line.length, `${step.id}: this line is a paragraph, not a sentence:\n  ${line}`).toBeLessThan(130);
      }
    });
  }

  it("teaches the ideas the old first level smuggled past her, in order", () => {
    const ids = FIRST_STEPS.map((s) => s.id);
    // each of these is a real, separate concept that was never once explained
    for (const needed of ["what-is-code", "brackets", "numbers", "capitals", "literal"]) {
      expect(ids, `FIRST STEPS never teaches "${needed}"`).toContain(needed);
    }
    // and the keyboard comes LAST — typing is a different skill from thinking
    expect(FIRST_STEPS[FIRST_STEPS.length - 1].typing).toBe(true);
    expect(FIRST_STEPS.filter((s) => s.typing)).toHaveLength(1);
  });

  it("never shows a beginner a star, a score, or a par", () => {
    // nothing in this track may be taken away from her
    for (const step of FIRST_STEPS) expect(stepMission(step).parLines).toBeGreaterThan(50);
  });
});
