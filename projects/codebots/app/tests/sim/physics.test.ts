import { describe, it, expect } from "vitest";
import { resolveMove, type MoveWorld } from "../../src/sim/physics";
import type { BotState } from "../../src/sim/types";

const baseState = (): BotState => ({
  pos: { x: 0, y: 0 }, facing: "E", armor: 100,
  score: 0, bumps: 0, honks: 0, wrecked: false,
});

/** A tiny 1-row world for the horizontal move tests. `blocked`/`pit`/`mud` are cell x-coords. */
function world(opts: { blocked?: number[]; pit?: number[]; mud?: number[]; cols?: number } = {}): MoveWorld {
  const cols = opts.cols ?? 3;
  const has = (s: number[] | undefined, p: { x: number }) => !!s?.includes(p.x);
  return {
    isBlocked: (p) => p.x < 0 || p.x >= cols || has(opts.blocked, p),
    isPit: (p) => has(opts.pit, p),
    isMud: (p) => has(opts.mud, p),
  };
}

describe("physics", () => {
  it("moves forward one square on floor at 1 tick", () => {
    const { state, ticksSpent } = resolveMove(world(), baseState(), "E", 1);
    expect(state.pos).toEqual({ x: 1, y: 0 });
    expect(ticksSpent).toBe(1);
  });

  // Deliberate: W1M1's author path never enters its mud cells (matches the CONTENT_SPEC §4 trace),
  // so the golden test can't exercise mud. This isolated unit test is the ONLY thing verifying mud
  // tick-cost until the first mission whose solution crosses mud (W2M4).
  it("costs 2 ticks per square crossing mud", () => {
    const { ticksSpent } = resolveMove(world({ mud: [1] }), baseState(), "E", 1);
    expect(ticksSpent).toBe(2);
  });

  it("stops before a wall and penalizes score/armor", () => {
    const { state } = resolveMove(world({ blocked: [1] }), baseState(), "E", 1);
    expect(state.pos).toEqual({ x: 0, y: 0 });
    expect(state.score).toBe(-15);
    expect(state.armor).toBe(92);
    expect(state.bumps).toBe(1);
  });

  it("stops before a pit, loses 40, and does not cross", () => {
    const { state, fell } = resolveMove(world({ pit: [2] }), baseState(), "E", 3);
    expect(fell).toBe(true);
    expect(state.pos).toEqual({ x: 1, y: 0 }); // entered (1,0), stopped at the pit edge
    expect(state.score).toBe(-40);
  });
});
