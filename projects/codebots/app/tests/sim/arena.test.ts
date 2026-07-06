import { describe, it, expect } from "vitest";
import { cellAt, inBounds, stepFacing } from "../../src/sim/arena";
import type { Arena } from "../../src/sim/types";

const arena: Arena = {
  cols: 3, rows: 3,
  cells: [
    ["floor", "floor", "floor"],
    ["floor", "wall", "floor"],
    ["floor", "floor", "floor"],
  ],
  crates: [], coins: [], chests: [], gates: [],
  beacon: { x: 2, y: 2 },
};

describe("arena", () => {
  it("looks up cell kind by position", () => {
    expect(cellAt(arena, { x: 1, y: 1 })).toBe("wall");
    expect(cellAt(arena, { x: 0, y: 0 })).toBe("floor");
  });

  it("reports in-bounds correctly", () => {
    expect(inBounds(arena, { x: 2, y: 2 })).toBe(true);
    expect(inBounds(arena, { x: 3, y: 0 })).toBe(false);
    expect(inBounds(arena, { x: 0, y: -1 })).toBe(false);
  });

  it("steps a position one square in a facing direction", () => {
    expect(stepFacing({ x: 1, y: 1 }, "E")).toEqual({ x: 2, y: 1 });
    expect(stepFacing({ x: 1, y: 1 }, "N")).toEqual({ x: 1, y: 0 });
    expect(stepFacing({ x: 1, y: 1 }, "S")).toEqual({ x: 1, y: 2 });
    expect(stepFacing({ x: 1, y: 1 }, "W")).toEqual({ x: 0, y: 1 });
  });
});
