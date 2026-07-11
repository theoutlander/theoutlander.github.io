import { describe, it, expect } from "vitest";
import { PARTS, CHASSIS, computeStats, isPartOwnable, partById } from "../../src/content/parts";
import { buyChassis, buyPart, toggleEquip, mergeSaves, type SaveData } from "../../src/state/save";

const save = (o: Partial<SaveData> = {}): SaveData => ({
  missions: {}, coins: 0, unlocked: [], badges: [],
  loadout: { chassis: "scout", equipped: [], bought: [] },
  ...o,
});

/**
 * The Garage must never become pay-to-win. These tests pin the two rules that keep it a CODING
 * game: capability parts can ONLY be earned by learning, and stat parts always cost weight.
 */
describe("the anti-pay-to-win rules", () => {
  it("capability parts are NEVER purchasable — only earned by learning", () => {
    const blaster = partById("blaster")!;
    expect(blaster.kind).toBe("capability");
    expect(blaster.cost).toBe(0); // not for sale at any price
    // not unlocked by the campaign yet → you can't have it, no matter how many coins
    expect(isPartOwnable(blaster, [], [])).toBe(false);
    expect(isPartOwnable(blaster, [], ["blaster"])).toBe(false); // even if "bought"
    // clear the level that grants it → now it's yours
    expect(isPartOwnable(blaster, ["BLASTER"], [])).toBe(true);
  });

  it("every stat part costs weight (or trades weight away) — none are free upgrades", () => {
    for (const p of PARTS.filter((x) => x.kind === "stat")) {
      expect(p.weight, `${p.id} must have a weight cost/benefit`).not.toBe(0);
      expect(p.tradeoff, `${p.id} must state its downside`).toBeTruthy();
    }
  });

  it("stacking heavy parts busts the weight budget (you must choose)", () => {
    // scout: 2 slots, capacity 4
    const stats = computeStats("scout", ["plate", "big-barrel"]); // 3 + 3 = 6 weight
    expect(stats.weightUsed).toBe(6);
    expect(stats.capacity).toBe(4);
    expect(stats.overWeight).toBe(true); // can't have both on the starter frame
  });

  it("a bigger chassis buys room, not raw power", () => {
    const scout = computeStats("scout", []);
    const hauler = computeStats("hauler", []);
    expect(hauler.slots).toBeGreaterThan(scout.slots);
    expect(hauler.capacity).toBeGreaterThan(scout.capacity);
    // damage is identical bare — the frame doesn't hit harder, it just carries more
    expect(hauler.damage).toBe(scout.damage);
  });

  it("racing treads give weight back so you can carry more", () => {
    const withTreads = computeStats("scout", ["plate", "light-treads"]); // 3 + (-2) = 1
    expect(withTreads.weightUsed).toBe(1);
    expect(withTreads.overWeight).toBe(false);
  });
});

describe("garage economy", () => {
  it("you can't buy what you can't afford", () => {
    expect(buyPart(save({ coins: 10 }), "plate", 60)).toBeNull();
    expect(buyChassis(save({ coins: 10 }), "hauler", 300)).toBeNull();
  });

  it("buying spends coins and records the part", () => {
    const next = buyPart(save({ coins: 100 }), "plate", 60)!;
    expect(next.coins).toBe(40);
    expect(next.loadout.bought).toContain("plate");
    expect(buyPart(next, "plate", 60)).toBeNull(); // no double-buy
  });

  it("equipping is free and toggles", () => {
    const s = toggleEquip(save({ coins: 0, loadout: { chassis: "scout", equipped: [], bought: ["plate"] } }), "plate");
    expect(s.loadout.equipped).toContain("plate");
    expect(s.coins).toBe(0);
    expect(toggleEquip(s, "plate").loadout.equipped).not.toContain("plate");
  });

  it("syncing devices never loses a purchase or your built bot", () => {
    const built = save({ coins: 20, loadout: { chassis: "hauler", equipped: ["plate"], bought: ["plate", "gold-trim"] } });
    const fresh = save({ coins: 0 });
    const m = mergeSaves(fresh, built);
    expect(m.loadout.chassis).toBe("hauler"); // the better frame survives
    expect(m.loadout.bought.sort()).toEqual(["gold-trim", "plate"]);
    expect(m.loadout.equipped).toEqual(["plate"]); // an empty loadout never wipes a built one
  });
});

describe("catalog sanity", () => {
  it("the starter chassis is free and everything else costs coins", () => {
    expect(CHASSIS[0].cost).toBe(0);
    expect(CHASSIS.filter((c) => c.cost > 0).length).toBeGreaterThan(0);
  });
  it("every capability part names the unlock that grants it", () => {
    for (const p of PARTS.filter((x) => x.kind === "capability")) expect(p.unlockedBy).toBeTruthy();
  });
});
