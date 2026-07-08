import { describe, it, expect } from "vitest";
import { CONCEPTS } from "../../src/content/concepts";
import { ALL } from "../../src/content/missions";
import { runInSandbox } from "../../src/sandbox/driver";

/**
 * New executable content that the author-solution golden test never touches: every concept's
 * demoCode (the "WATCH IT" snippet) and every level's starterCode. Both run through the real
 * sandbox for the kid, so both must at least PARSE and run without throwing — a broken demo or a
 * malformed starter would ship green off the golden test and blow up in Asha's face.
 */
describe("concept demoCode — runs clean and never spoils the level", () => {
  for (const c of CONCEPTS) {
    const mission = ALL.find((m) => m.world === c.world && m.index === c.level);
    it(`${c.key} (W${c.world}L${c.level}) maps to a real mission`, () => {
      expect(mission, `no mission for concept ${c.key}`).toBeDefined();
    });
    // demoCode is optional (some ideas can't be demoed without giving the answer away). When a
    // concept HAS one, it must run clean and not solve the level.
    if (mission && c.demoCode) {
      it(`${c.key} demo runs without throwing`, () => {
        expect(() => runInSandbox(mission, c.demoCode!)).not.toThrow();
      });
      it(`${c.key} demo does NOT clear the level (no spoiler)`, () => {
        const res = runInSandbox(mission, c.demoCode!);
        expect(res.cleared, `${c.key} demo must not solve the level`).toBe(false);
      });
    }
  }
});

describe("level starterCode — parses and runs clean", () => {
  for (const mission of ALL) {
    it(`${mission.id} starterCode runs without a parse/lint error`, () => {
      expect(() => runInSandbox(mission, mission.starterCode)).not.toThrow();
    });
  }
});
