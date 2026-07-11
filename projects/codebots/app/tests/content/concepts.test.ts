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
/**
 * REGRESSION GUARD. Inserting a level (w2m2s) once shifted every later World-2 index by one while
 * concepts.ts kept the old numbers — so the if/else level showed the atBeacon card, the atBeacon
 * level showed NOTHING, and the "OR ELSE" card never rendered at all (two concepts collided on one
 * slot and `.find()` silently returned the first). The old test passed because it only checked a
 * concept mapped to SOME mission. These two tests make that impossible to ship again.
 */
describe("concept cards point at the RIGHT level", () => {
  it("no two concepts share a (world, level) slot — a collision silently swallows a card", () => {
    const slots = CONCEPTS.map((c) => `${c.world}-${c.level}`);
    const dupes = slots.filter((s, i) => slots.indexOf(s) !== i);
    expect(dupes, `two concepts on the same level: ${dupes.join(", ")}`).toEqual([]);
  });

  it("each concept lands on a mission that actually teaches it", () => {
    // the mission's own `teaches` string must mention the concept's subject
    const expectTeaches: Record<string, string> = {
      sequencing: "sequencing", repeat: "repeat", deciding: "blocked", shoot: "shoot",
      targetahead: "targetAhead", orelse: "else", arrived: "atBeacon",
      keepgoing: "while", chain: "shoot", functions: "function",
    };
    for (const c of CONCEPTS) {
      const mission = ALL.find((m) => m.world === c.world && m.index === c.level);
      expect(mission, `concept "${c.key}" points at W${c.world}L${c.level} — no such mission`).toBeDefined();
      const needle = expectTeaches[c.key];
      if (needle) {
        expect(
          mission!.teaches.toLowerCase(),
          `concept "${c.key}" is on "${mission!.title}" (teaches: ${mission!.teaches}) — wrong level`,
        ).toContain(needle.toLowerCase());
      }
    }
  });
});

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
