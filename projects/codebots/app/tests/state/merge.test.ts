import { describe, it, expect } from "vitest";
import { mergeSaves, type SaveData } from "../../src/state/save";

const base: SaveData = { missions: {}, coins: 0, unlocked: [], badges: [], loadout: { kit: "scout", owned: ["scout"] } };
const make = (o: Partial<SaveData>): SaveData => ({ ...base, ...o });

/**
 * The merge is the safety-critical bit of cloud sync: logging in on a second device must NEVER
 * lose progress. Every field takes the more-advanced value, and the merge is order-independent.
 */
describe("mergeSaves — non-destructive best-of-both", () => {
  it("keeps the higher star count and cleared-if-either per mission", () => {
    const local = make({ missions: { w1m1: { cleared: true, stars: 3 }, w1m2: { cleared: true, stars: 1 } } });
    const cloud = make({ missions: { w1m2: { cleared: true, stars: 3 }, w2m1: { cleared: true, stars: 2 } } });
    const m = mergeSaves(local, cloud);
    expect(m.missions.w1m1).toEqual({ cleared: true, stars: 3 });
    expect(m.missions.w1m2).toEqual({ cleared: true, stars: 3 }); // higher wins
    expect(m.missions.w2m1).toEqual({ cleared: true, stars: 2 }); // only in cloud, kept
  });

  it("a stale device never wipes newer progress (union, not overwrite)", () => {
    const newer = make({ missions: { w1m1: { cleared: true, stars: 3 } }, coins: 100, badges: ["decider"], unlocked: ["BLASTER"] });
    const stale = make({}); // empty (fresh device)
    const m = mergeSaves(stale, newer);
    expect(m.missions.w1m1).toEqual({ cleared: true, stars: 3 });
    expect(m.coins).toBe(100);
    expect(m.badges).toEqual(["decider"]);
    expect(m.unlocked).toEqual(["BLASTER"]);
  });

  it("unions badges + unlocks and takes max coins", () => {
    const a = make({ coins: 50, badges: ["decider"], unlocked: ["SCANNER"] });
    const b = make({ coins: 80, badges: ["sharpshooter", "decider"], unlocked: ["BLASTER"] });
    const m = mergeSaves(a, b);
    expect(m.coins).toBe(80);
    expect([...m.badges].sort()).toEqual(["decider", "sharpshooter"]);
    expect([...m.unlocked].sort()).toEqual(["BLASTER", "SCANNER"]);
  });

  it("is order-independent (merge(a,b) === merge(b,a))", () => {
    const a = make({ missions: { w1m1: { cleared: true, stars: 2 } }, coins: 30, badges: ["x"] });
    const b = make({ missions: { w1m1: { cleared: true, stars: 3 }, w2m1: { cleared: true, stars: 1 } }, coins: 10, badges: ["y"] });
    const ab = mergeSaves(a, b);
    const ba = mergeSaves(b, a);
    expect(ab.missions).toEqual(ba.missions);
    expect(ab.coins).toEqual(ba.coins);
    expect([...ab.badges].sort()).toEqual([...ba.badges].sort());
  });
});
