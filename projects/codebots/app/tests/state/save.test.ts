import { describe, it, expect } from "vitest";
import { recordResult, type SaveData } from "../../src/state/save";

const fresh: SaveData = { missions: {}, coins: 0, unlocked: [], badges: [] };

describe("recordResult economy", () => {
  it("pays 10 for first clear + 5 per star, and records the unlock", () => {
    const { save, coinsEarned, firstClear, newlyUnlocked } = recordResult(fresh, "w1m1", 3, "AIR HORN");
    expect(firstClear).toBe(true);
    expect(coinsEarned).toBe(10 + 3 * 5); // 25
    expect(save.coins).toBe(25);
    expect(save.missions.w1m1).toEqual({ cleared: true, stars: 3 });
    expect(newlyUnlocked).toBe("AIR HORN");
    expect(save.unlocked).toContain("AIR HORN");
  });

  it("does not re-pay the clear or already-earned stars on replay", () => {
    const first = recordResult(fresh, "w1m1", 1, "AIR HORN").save;
    const replay = recordResult(first, "w1m1", 3, "AIR HORN");
    // clear already paid; only the 2 new stars pay (2 * 5 = 10)
    expect(replay.coinsEarned).toBe(10);
    expect(replay.save.coins).toBe(first.coins + 10);
    expect(replay.save.missions.w1m1.stars).toBe(3);
    expect(replay.newlyUnlocked).toBeNull(); // already unlocked
  });

  it("never lowers a stored star count on a worse replay", () => {
    const best = recordResult(fresh, "w1m1", 3, undefined).save;
    const worse = recordResult(best, "w1m1", 1, undefined);
    expect(worse.save.missions.w1m1.stars).toBe(3);
    expect(worse.coinsEarned).toBe(0);
  });
});
