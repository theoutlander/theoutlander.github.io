import { describe, it, expect, beforeEach } from "vitest";
import { loadSave, saveSave, type SaveData } from "../../src/state/save";

// The suite runs in node (fast, no DOM). The save layer only needs a key/value store, so stub the
// four methods it touches rather than dragging in a whole jsdom for one file.
const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

/**
 * ANYTHING WE SAVE MUST COME BACK.
 *
 * loadSave() reads the save by whitelisting fields one at a time. That's a trap with a long fuse: add
 * a field to SaveData, write it in saveSave(), forget this one function, and the field is persisted
 * to disk and then thrown away on the very next load. Nothing errors. Nothing warns. It just quietly
 * doesn't work.
 *
 * It already happened, to three separate features at once:
 *   - firstStepsDone  → the game forgot she'd ever done the tutorial, and greeted her as a beginner
 *                       forever.
 *   - drillsPassed    → the same drill paid out its 25 coins again and again, unlimited.
 *   - skipAhead       → "I already know how to code — unlock everything" did precisely nothing.
 *
 * So this test doesn't check a list of fields I remembered to think of. It round-trips a save with
 * EVERY field populated and asserts nothing was lost — which fails automatically the next time
 * someone adds a field and forgets loadSave().
 */
const FULL: SaveData = {
  missions: { w1m1: { cleared: true, stars: 3 } },
  coins: 140,
  unlocked: ["blaster"],
  badges: ["first-loop"],
  loadout: { chassis: "scout", equipped: ["armor-plate"], bought: ["armor-plate"] },
  drillsPassed: ["drill:barrel-run"],
  firstStepsDone: true,
  skipAhead: true,
};

describe("the save round-trips", () => {
  beforeEach(() => localStorage.clear());

  it("every field written to the save survives being read back", () => {
    saveSave(FULL);
    const back = loadSave();
    for (const key of Object.keys(FULL) as (keyof SaveData)[]) {
      expect(
        back[key],
        `"${key}" was written to the save and LOST on load — add it to loadSave()'s whitelist`,
      ).toEqual(FULL[key]);
    }
  });

  it("she is never told to do FIRST STEPS again after finishing it", () => {
    saveSave({ ...FULL, firstStepsDone: true });
    expect(loadSave().firstStepsDone).toBe(true);
  });

  it("a drill can't be re-farmed for coins by reloading the page", () => {
    saveSave({ ...FULL, drillsPassed: ["drill:barrel-run"] });
    expect(loadSave().drillsPassed).toContain("drill:barrel-run");
  });

  it("unlocking everything survives a reload", () => {
    saveSave({ ...FULL, skipAhead: true });
    expect(loadSave().skipAhead).toBe(true);
  });

  it("a brand-new player starts with nothing unlocked and nothing done", () => {
    const fresh = loadSave();
    expect(fresh.firstStepsDone).toBeFalsy();
    expect(fresh.skipAhead).toBeFalsy();
    expect(fresh.drillsPassed ?? []).toHaveLength(0);
  });
});
