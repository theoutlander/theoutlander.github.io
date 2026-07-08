import { describe, it, expect } from "vitest";
import { earnedBadges, newlyEarned, BADGES } from "../../src/content/badges";
import { WORLDS, ALL } from "../../src/content/missions";
import type { SaveData } from "../../src/state/save";

function save(clears: { id: string; stars: number }[]): SaveData {
  const missions: SaveData["missions"] = {};
  for (const c of clears) missions[c.id] = { cleared: true, stars: c.stars };
  return { missions, coins: 0, unlocked: [], badges: [] };
}

const cleared3 = (ids: string[]) => ids.map((id) => ({ id, stars: 3 }));

describe("badges", () => {
  it("a fresh save has earned nothing", () => {
    expect(earnedBadges(save([]))).toEqual([]);
  });

  it("clearing the first level earns IGNITION", () => {
    expect(earnedBadges(save([{ id: "w1m1", stars: 1 }]))).toContain("first-program");
  });

  it("concept badges tie to the level that teaches the concept", () => {
    expect(earnedBadges(save([{ id: "w2m1", stars: 1 }]))).toContain("decider"); // first if
    expect(earnedBadges(save([{ id: "w2m2", stars: 1 }]))).toContain("sharpshooter"); // first shoot
    expect(earnedBadges(save([{ id: "w3m1", stars: 1 }]))).toContain("never-quit"); // first while
    expect(earnedBadges(save([{ id: "w4m1", stars: 1 }]))).toContain("toolmaker"); // first function
  });

  it("clearing a whole world earns its world badge", () => {
    const w1 = WORLDS[0].map((m) => ({ id: m.id, stars: 1 }));
    expect(earnedBadges(save(w1))).toContain("world-1");
    // but not before the last one
    expect(earnedBadges(save(w1.slice(0, -1)))).not.toContain("world-1");
  });

  it("all 3 stars in a world earns PERFECTIONIST", () => {
    const w1perfect = cleared3(WORLDS[0].map((m) => m.id));
    expect(earnedBadges(save(w1perfect))).toContain("perfectionist");
    const w1ok = WORLDS[0].map((m) => ({ id: m.id, stars: 2 }));
    expect(earnedBadges(save(w1ok))).not.toContain("perfectionist");
  });

  it("clearing all 24 earns GRADUATE and STAR COLLECTOR at 3 stars", () => {
    const all3 = cleared3(ALL.map((m) => m.id));
    const earned = earnedBadges(save(all3));
    expect(earned).toContain("graduate");
    expect(earned).toContain("star-collector"); // 72 stars >= 50
    // every badge is earnable (nothing orphaned)
    expect(earned.length).toBe(BADGES.length);
  });

  it("newlyEarned returns only badges not already recorded", () => {
    const s = save([{ id: "w1m1", stars: 1 }]);
    s.badges = ["first-program"]; // already have it
    expect(newlyEarned(s).map((b) => b.id)).not.toContain("first-program");
    // clearing w2m1 now newly earns decider
    s.missions.w2m1 = { cleared: true, stars: 1 };
    expect(newlyEarned(s).map((b) => b.id)).toContain("decider");
  });
});
