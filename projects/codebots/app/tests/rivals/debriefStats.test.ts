import { describe, it, expect } from "vitest";
import { computeDebriefStats } from "../../src/rivals/debriefStats";
import type { BattleEvent } from "../../src/sim/battle";

const at = { x: 0, y: 0 };

describe("computeDebriefStats", () => {
  it("counts wasted shots — shoot events with no hit", () => {
    const events: BattleEvent[] = [
      { round: 1, bot: 0, type: "shoot", from: at, facing: "E", hit: null, at: null },
      { round: 2, bot: 0, type: "shoot", from: at, facing: "E", hit: null, at: null },
    ];
    const stats = computeDebriefStats(events, 2, 0, 1, 100);
    expect(stats.wastedShots).toBe(2);
    expect(stats.hitsAttempted).toBe(2);
    expect(stats.hitsLanded).toBe(0);
  });

  it("counts hits landed on the opponent and the damage dealt", () => {
    const events: BattleEvent[] = [
      { round: 1, bot: 0, type: "shoot", from: at, facing: "E", hit: 1, at },
      { round: 1, bot: 0, type: "hit", target: 1, at, armor: 66 },
      { round: 2, bot: 0, type: "shoot", from: at, facing: "E", hit: 1, at },
      { round: 2, bot: 0, type: "hit", target: 1, at, armor: 32 },
    ];
    const stats = computeDebriefStats(events, 2, 0, 1, 100);
    expect(stats.hitsLanded).toBe(2);
    expect(stats.hitsAttempted).toBe(2);
    expect(stats.wastedShots).toBe(0);
    expect(stats.damageDealt).toBe(68); // 100->66 (34) + 66->32 (34)
  });

  it("ignores the opponent's own shots when counting the player's attempts", () => {
    const events: BattleEvent[] = [
      { round: 1, bot: 1, type: "shoot", from: at, facing: "W", hit: 0, at },
      { round: 1, bot: 1, type: "hit", target: 0, at, armor: 85 },
    ];
    const stats = computeDebriefStats(events, 1, 0, 1, 100);
    expect(stats.hitsAttempted).toBe(0);
    expect(stats.wastedShots).toBe(0);
    expect(stats.damageDealt).toBe(0);
  });

  it("flags the first hit taken by the player as a key moment, and only the first", () => {
    const events: BattleEvent[] = [
      { round: 1, bot: 1, type: "shoot", from: at, facing: "W", hit: 0, at },
      { round: 1, bot: 1, type: "hit", target: 0, at, armor: 85 },
      { round: 3, bot: 1, type: "shoot", from: at, facing: "W", hit: 0, at },
      { round: 3, bot: 1, type: "hit", target: 0, at, armor: 70 },
    ];
    const stats = computeDebriefStats(events, 3, 0, 1, 100);
    const firstHits = stats.keyMoments.filter((m) => m.kind === "firstHit");
    expect(firstHits).toEqual([{ round: 1, kind: "firstHit" }]);
  });

  it("flags a wreck as a key moment", () => {
    const events: BattleEvent[] = [{ round: 5, bot: 0, type: "wreck", at }];
    const stats = computeDebriefStats(events, 5, 0, 1, 100);
    expect(stats.keyMoments).toContainEqual({ round: 5, kind: "wreck" });
  });

  it("flags every wasted shot as its own key moment", () => {
    const events: BattleEvent[] = [
      { round: 1, bot: 0, type: "shoot", from: at, facing: "E", hit: null, at: null },
      { round: 4, bot: 0, type: "shoot", from: at, facing: "E", hit: null, at: null },
    ];
    const stats = computeDebriefStats(events, 4, 0, 1, 100);
    expect(stats.keyMoments).toEqual([
      { round: 1, kind: "wastedShot" },
      { round: 4, kind: "wastedShot" },
    ]);
  });

  it("carries rounds survived straight through", () => {
    const stats = computeDebriefStats([], 17, 0, 1, 100);
    expect(stats.roundsSurvived).toBe(17);
  });
});
