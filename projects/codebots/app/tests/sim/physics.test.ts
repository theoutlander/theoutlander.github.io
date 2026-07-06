import { describe, it, expect } from "vitest";
import { resolveMove } from "../../src/sim/physics";
import type { Arena, BotState } from "../../src/sim/types";

const baseState = (): BotState => ({
  pos: { x: 0, y: 0 }, facing: "E", armor: 100,
  score: 0, bumps: 0, honks: 0, wrecked: false,
});

describe("physics", () => {
  it("moves forward one square on floor at 1 tick", () => {
    const arena: Arena = {
      cols: 3, rows: 1, cells: [["floor", "floor", "floor"]],
      crates: [], coins: [], chests: [], gates: [], beacon: { x: 2, y: 0 },
    };
    const { state, ticksSpent } = resolveMove(arena, baseState(), "E", 1);
    expect(state.pos).toEqual({ x: 1, y: 0 });
    expect(ticksSpent).toBe(1);
  });

  // Deliberate: W1M1's author path never enters its mud cells (matches the CONTENT_SPEC §4
  // trace note), so the golden test can't exercise mud. This isolated unit test is the ONLY
  // thing verifying mud tick-cost in this slice — a conscious call for a one-mission foundation,
  // not an oversight. The first mission whose solution crosses mud (W2M4) will add a golden path.
  it("costs 2 ticks per square crossing mud", () => {
    const arena: Arena = {
      cols: 3, rows: 1, cells: [["floor", "mud", "floor"]],
      crates: [], coins: [], chests: [], gates: [], beacon: { x: 2, y: 0 },
    };
    const { ticksSpent } = resolveMove(arena, baseState(), "E", 1);
    expect(ticksSpent).toBe(2);
  });

  it("stops before a wall and penalizes score/armor", () => {
    const arena: Arena = {
      cols: 3, rows: 1, cells: [["floor", "wall", "floor"]],
      crates: [], coins: [], chests: [], gates: [], beacon: { x: 2, y: 0 },
    };
    const { state } = resolveMove(arena, baseState(), "E", 1);
    expect(state.pos).toEqual({ x: 0, y: 0 });
    expect(state.score).toBe(-15);
    expect(state.armor).toBe(92);
    expect(state.bumps).toBe(1);
  });

  it("stops before a crate the same as a wall", () => {
    const arena: Arena = {
      cols: 3, rows: 1, cells: [["floor", "floor", "floor"]],
      crates: [{ x: 1, y: 0 }], coins: [], chests: [], gates: [], beacon: { x: 2, y: 0 },
    };
    const { state } = resolveMove(arena, baseState(), "E", 1);
    expect(state.pos).toEqual({ x: 0, y: 0 });
    expect(state.bumps).toBe(1);
  });
});
