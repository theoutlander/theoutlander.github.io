import { describe, it, expect } from "vitest";
import { createSim } from "../../src/sim/engine";
import type { Arena, Facing } from "../../src/sim/types";

/** A blank floor arena with a wall on the right edge, a barrel, and the beacon at the far end. */
function makeArena(overrides: Partial<Arena> = {}): Arena {
  return {
    cols: 8,
    rows: 3,
    cells: Array.from({ length: 3 }, () => Array(8).fill("floor")),
    crates: [],
    coins: [],
    chests: [],
    gates: [],
    beacon: { x: 7, y: 1 },
    ...overrides,
  };
}

function makeMission(arena: Arena, facing: Facing = "E", pos = { x: 0, y: 1 }) {
  return {
    id: "t", world: 2, index: 1, title: "T", teaches: "sensors",
    arena, start: { pos, facing },
    parLines: 6, starterCode: "", hints: ["", "", ""], briefing: "",
    authorSolution: "", bonusStar: { kind: "zeroBumps" as const },
  };
}

describe("sensors", () => {
  it("blocked() is true facing a crate, false down an open lane", () => {
    const arena = makeArena({ crates: [{ x: 1, y: 1 }] });
    const sim = createSim(makeMission(arena)); // at (0,1) facing E, crate at (1,1)
    expect(sim.execute({ name: "blocked", args: [] })).toBe(true);

    const open = createSim(makeMission(makeArena())); // no crate ahead
    expect(open.execute({ name: "blocked", args: [] })).toBe(false);
  });

  it("blocked() is true at the arena edge", () => {
    const sim = createSim(makeMission(makeArena(), "W")); // at x=0 facing W → edge
    expect(sim.execute({ name: "blocked", args: [] })).toBe(true);
  });

  it("blocked() is true facing water or a pit (would splash/fall)", () => {
    const water = makeArena();
    water.cells[1][1] = "water";
    expect(createSim(makeMission(water)).execute({ name: "blocked", args: [] })).toBe(true);
    const pit = makeArena();
    pit.cells[1][1] = "pit";
    expect(createSim(makeMission(pit)).execute({ name: "blocked", args: [] })).toBe(true);
  });

  it("targetAhead() detects a barrel one cell ahead only", () => {
    const arena = makeArena({ targets: [{ x: 1, y: 1 }] });
    const sim = createSim(makeMission(arena));
    expect(sim.execute({ name: "targetAhead", args: [] })).toBe(true);

    const far = createSim(makeMission(makeArena({ targets: [{ x: 3, y: 1 }] })));
    expect(far.execute({ name: "targetAhead", args: [] })).toBe(false); // 2 cells away
  });

  it("atBeacon() flips true once the bot stands on the beacon", () => {
    const sim = createSim(makeMission(makeArena({ beacon: { x: 2, y: 1 } })));
    expect(sim.execute({ name: "atBeacon", args: [] })).toBe(false);
    sim.execute({ name: "forward", args: [2] });
    expect(sim.execute({ name: "atBeacon", args: [] })).toBe(true);
  });

  it("sensors never mutate position/facing", () => {
    const sim = createSim(makeMission(makeArena({ targets: [{ x: 1, y: 1 }] })));
    const before = sim.state();
    sim.execute({ name: "blocked", args: [] });
    sim.execute({ name: "targetAhead", args: [] });
    sim.execute({ name: "atBeacon", args: [] });
    expect(sim.state().pos).toEqual(before.pos);
    expect(sim.state().facing).toBe(before.facing);
  });
});

describe("shoot()", () => {
  it("destroys a barrel in range and clears the path", () => {
    const arena = makeArena({ targets: [{ x: 2, y: 1 }] });
    const sim = createSim(makeMission(arena)); // at (0,1) facing E, barrel at (2,1)
    sim.execute({ name: "shoot", args: [] });
    const shot = sim.events().find((e) => e.type === "shoot");
    expect(shot).toMatchObject({ type: "shoot", hit: { x: 2, y: 1 } });
    expect(sim.events().some((e) => e.type === "targetDestroyed")).toBe(true);
    // barrel gone → the bot can now roll straight through where it stood
    sim.execute({ name: "forward", args: [3] });
    expect(sim.state().pos).toEqual({ x: 3, y: 1 });
  });

  it("shooting a wall/empty lane is a defined miss, not a crash", () => {
    const sim = createSim(makeMission(makeArena())); // nothing ahead but open floor + edge
    expect(() => sim.execute({ name: "shoot", args: [] })).not.toThrow();
    const shot = sim.events().find((e) => e.type === "shoot");
    expect(shot).toMatchObject({ hit: null });
    expect(sim.events().some((e) => e.type === "targetDestroyed")).toBe(false);
  });

  it("a crate in front of the barrel blocks the bolt (barrel survives)", () => {
    const arena = makeArena({ crates: [{ x: 1, y: 1 }], targets: [{ x: 2, y: 1 }] });
    const sim = createSim(makeMission(arena));
    sim.execute({ name: "shoot", args: [] });
    expect(sim.events().find((e) => e.type === "shoot")).toMatchObject({ hit: null });
    // barrel still stands → still blocks
    expect(sim.execute({ name: "targetAhead", args: [] })).toBe(false); // crate is what's ahead
  });
});
