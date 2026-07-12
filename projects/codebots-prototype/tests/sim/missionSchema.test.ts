import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MissionSchema } from "../../src/sim/missionSchema";

describe("MissionSchema", () => {
  it("parses W1M1's authored content JSON", () => {
    const raw = JSON.parse(
      readFileSync(new URL("../../content/missions/world1/m1.json", import.meta.url), "utf-8"),
    );
    const mission = MissionSchema.parse(raw);
    expect(mission.id).toBe("w1m1");
    expect(mission.arena.beacon).toEqual({ x: 7, y: 1 });
  });

  it("rejects a mission missing a required field", () => {
    expect(() => MissionSchema.parse({ id: "bad" })).toThrow();
  });
});
