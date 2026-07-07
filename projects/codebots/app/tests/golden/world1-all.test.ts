import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MissionSchema } from "../../src/sim/missionSchema";
import { runInSandbox } from "../../src/sandbox/driver";
import { countCodeLines } from "../../src/sandbox/lines";

/**
 * Every World 1 author solution must clear its mission through the real transform+sim path, earn
 * all 3 stars in that single run, and fit within par. This grid-verifies the authored content —
 * the classic content bug is a solution that collides with its own furniture (CONTENT_SPEC §9).
 */
const IDS = ["m1", "m2", "m3", "m4", "m5", "m6"];

function load(id: string) {
  const raw = JSON.parse(
    readFileSync(new URL(`../../content/missions/world1/${id}.json`, import.meta.url), "utf-8"),
  );
  return MissionSchema.parse(raw);
}

describe("World 1 author solutions (grid-verified)", () => {
  for (const id of IDS) {
    it(`${id}: author solution clears, earns 3 stars, within par`, () => {
      const mission = load(id);
      const res = runInSandbox(mission, mission.authorSolution);
      expect(res.cleared, `${id} should clear`).toBe(true);
      expect(res.finalState.pos, `${id} ends on beacon`).toEqual(mission.arena.beacon);
      expect(countCodeLines(mission.authorSolution), `${id} within par`).toBeLessThanOrEqual(
        mission.parLines,
      );
      expect(res.stars, `${id} earns all 3 stars`).toBe(3);
    });
  }
});
