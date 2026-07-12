import { describe, it, expect } from "vitest";
import { WORLDS } from "../../src/content/missions";
import { runInSandbox } from "../../src/sandbox/driver";
import { countCodeLines } from "../../src/sandbox/lines";

/**
 * DATA-DRIVEN golden gate: every mission in every world must clear with its author solution,
 * earn all 3 stars in that single run, and fit within par — through the real transform+sim path.
 * Iterating WORLDS means a newly authored level is covered automatically; there is no per-mission
 * wiring to forget. A level with no golden test is impossible here by construction.
 */
describe("author solutions — all worlds (grid-verified)", () => {
  WORLDS.forEach((world, wi) => {
    world.forEach((mission) => {
      it(`W${wi + 1} ${mission.id} "${mission.title}" clears with 3 stars, within par`, () => {
        const res = runInSandbox(mission, mission.authorSolution);
        expect(res.cleared, `${mission.id} should clear`).toBe(true);
        expect(res.finalState.pos, `${mission.id} ends on beacon`).toEqual(mission.arena.beacon);
        expect(countCodeLines(mission.authorSolution), `${mission.id} within par`).toBeLessThanOrEqual(
          mission.parLines,
        );
        expect(res.stars, `${mission.id} earns all 3 stars`).toBe(3);
      });
    });
  });
});
