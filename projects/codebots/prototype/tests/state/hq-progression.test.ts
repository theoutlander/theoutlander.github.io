import { describe, it, expect } from "vitest";
import type { SaveData } from "../../src/state/save";

/**
 * HQ opens as she grows into it.
 *
 * It used to show all seven rooms to a kid who had never written a line of code — the same mistake as
 * the old Level 1, one floor up. Everything at once, and no answer to the only question she actually
 * has: "what do I do NOW?"
 *
 * The rule is NOT beginner/intermediate/advanced. That makes her label herself, and kids are terrible
 * at it — she picks "beginner" and feels small, or picks "advanced" and drowns. Rooms simply appear
 * when they start to MEAN something.
 *
 * This mirrors the gating in ui/HQ.tsx. Two failure modes it guards against, both fatal:
 *   - a beginner drowning in doors on her first visit;
 *   - a room that, because of a bad condition, NEVER opens — a kid would simply never find it.
 */
type Rooms = ReturnType<typeof roomsFor>;

function roomsFor(save: Partial<SaveData>, cleared: number, drills: number) {
  const all = !!save.skipAhead;
  return {
    firstSteps: true,
    campaign: all || !!save.firstStepsDone || cleared > 0,
    maker: all || cleared >= 1,
    garage: all || cleared >= 1 || (save.coins ?? 0) > 0,
    field: all || cleared >= 2,
    drills: all || drills > 0,
    arena: all || cleared >= 8,
  };
}
const open = (r: Rooms) => Object.values(r).filter(Boolean).length;

describe("the HQ board opens as she grows into it", () => {
  it("a kid who has never coded sees exactly ONE door", () => {
    const r = roomsFor({}, 0, 0);
    expect(open(r), "a beginner is being shown more than one way in").toBe(1);
    expect(r.firstSteps).toBe(true);
  });

  it("finishing FIRST STEPS opens the campaign — and nothing else yet", () => {
    const r = roomsFor({ firstStepsDone: true }, 0, 0);
    expect(r.campaign).toBe(true);
    expect(r.arena).toBe(false);
    expect(r.garage).toBe(false);
  });

  it("the Garage stays shut until there's something to spend, then stays open FOREVER", () => {
    expect(roomsFor({ firstStepsDone: true }, 0, 0).garage).toBe(false);
    expect(roomsFor({ firstStepsDone: true, coins: 20 }, 1, 0).garage).toBe(true);
    // and crucially: it does NOT vanish when she spends the lot. A room that disappears after you
    // use it is worse than one that never opened.
    expect(roomsFor({ firstStepsDone: true, coins: 0 }, 3, 0).garage).toBe(true);
  });

  it("PROVE IT stays shut until a drill is actually winnable", () => {
    // before atBeacon() a drill cannot be beaten at all — a locked door she can't open is worse
    // than no door, and an OPEN door she can't beat is worse still
    expect(roomsFor({ firstStepsDone: true }, 5, 0).drills).toBe(false);
    expect(roomsFor({ firstStepsDone: true }, 10, 3).drills).toBe(true);
  });

  it("the Arena waits until she can write a bot worth fighting with", () => {
    expect(roomsFor({ firstStepsDone: true }, 4, 0).arena).toBe(false);
    expect(roomsFor({ firstStepsDone: true }, 8, 1).arena).toBe(true);
  });

  it("EVERY room opens eventually — none is stranded behind a condition that never fires", () => {
    // a room nobody can reach is a room we may as well not have built
    const late = roomsFor({ firstStepsDone: true, coins: 500 }, 24, 3);
    for (const [room, isOpen] of Object.entries(late)) {
      expect(isOpen, `"${room}" never opens, even for a finished player`).toBe(true);
    }
  });

  it('"I already know how to code" opens everything at once', () => {
    const r = roomsFor({ skipAhead: true }, 0, 0);
    for (const [room, isOpen] of Object.entries(r)) {
      expect(isOpen, `skipAhead left "${room}" shut`).toBe(true);
    }
  });

  it("the ramp is never a toll gate — skipping ahead needs no progress at all", () => {
    expect(open(roomsFor({ skipAhead: true }, 0, 0))).toBe(open(roomsFor({}, 24, 3)));
  });
});
