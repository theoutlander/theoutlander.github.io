import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { handleRequest } from "../../src/sandbox/protocol";
import { MissionSchema } from "../../src/sim/missionSchema";

function loadMission() {
  const raw = JSON.parse(
    readFileSync(new URL("../../content/missions/world1/m1.json", import.meta.url), "utf-8"),
  );
  return MissionSchema.parse(raw);
}

describe("handleRequest (sandbox brain)", () => {
  it("returns ok + event log + result for a good program", () => {
    const mission = loadMission();
    const res = handleRequest({ id: 7, code: mission.authorSolution, mission });
    expect(res.id).toBe(7);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.run.cleared).toBe(true);
      expect(res.run.stars).toBe(3);
      expect(res.run.events.at(-1)).toMatchObject({ type: "honk" });
    }
  });

  it("returns ok:false with a friendly, line-pointed error for a syntax mistake", () => {
    const mission = loadMission();
    const res = handleRequest({ id: 8, code: "forward(2", mission }); // missing )
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toMatch(/opened but never closed|confused|tripped/i);
      expect(res.error.line).toBe(1);
    }
  });

  it("returns ok:false with the kid-worded step-budget message for an endless loop", () => {
    const mission = loadMission();
    const res = handleRequest({ id: 9, code: "repeat 999999 { forward(1) }", mission });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.message).toMatch(/ran for a very long time/i);
    }
  });
});
