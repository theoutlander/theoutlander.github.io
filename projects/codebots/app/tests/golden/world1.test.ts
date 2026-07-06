import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MissionSchema } from "../../src/sim/missionSchema";
import { runInSandbox } from "../../src/sandbox/driver";
import { countCodeLines } from "../../src/sandbox/lines"; // SAME counter the runtime scores with

function loadMission() {
  const raw = JSON.parse(
    readFileSync(new URL("../../content/missions/world1/m1.json", import.meta.url), "utf-8"),
  );
  return MissionSchema.parse(raw);
}

describe("World 1 Mission 1 — golden replay", () => {
  it("clears the mission running the author solution through the full sandbox path", () => {
    const mission = loadMission();

    const result = runInSandbox(mission, mission.authorSolution);

    expect(result.cleared).toBe(true);
    expect(result.finalState.pos).toEqual(mission.arena.beacon);
    expect(result.stars).toBe(3); // complete + par met + honk-on-beacon bonus

    // CONTENT_SPEC §10 #9: catch content drift between this file and the spec's stated par.
    expect(countCodeLines(mission.authorSolution)).toBeLessThanOrEqual(mission.parLines);
  });

  it("withholds the honkOnBeacon bonus when the honk isn't on the beacon", () => {
    const mission = loadMission();
    // Honk at the very start (on the spawn pad, not the beacon), then drive the winning route.
    // Clears + meets par → 2 stars, but NOT the bonus: the honk didn't land on the beacon.
    const result = runInSandbox(
      mission,
      "honk(); forward(2); left(); forward(3); right(); forward(5);",
    );
    expect(result.cleared).toBe(true);
    expect(result.stars).toBe(2);
  });

  it("aborts with a kid-worded error past the step budget", () => {
    const mission = loadMission();
    expect(() => runInSandbox(mission, "repeat 999999 { forward(1) }")).toThrow(
      /ran for a very long time/,
    );
  });
});
