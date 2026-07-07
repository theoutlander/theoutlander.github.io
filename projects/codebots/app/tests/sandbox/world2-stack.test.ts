import { describe, it, expect } from "vitest";
import { runInSandbox } from "../../src/sandbox/driver";
import type { Arena, Facing } from "../../src/sim/types";

/**
 * End-to-end through the REAL stack (per-world API → transform → generator → sim): a World 2
 * program that senses and reacts. Proves sensors/if/while/shoot work together the way a kid's
 * code actually runs, not just in isolation.
 */
function mission(arena: Arena, code: string, facing: Facing = "E", pos = { x: 0, y: 1 }) {
  return {
    id: "w2t", world: 2, index: 1, title: "T", teaches: "sensors",
    arena, start: { pos, facing },
    parLines: 12, starterCode: "", hints: ["", "", ""], briefing: "",
    authorSolution: code, bonusStar: { kind: "zeroBumps" as const },
  };
}

function lane(targets: { x: number; y: number }[] = [], beacon = { x: 6, y: 1 }): Arena {
  return {
    cols: 7, rows: 3,
    cells: Array.from({ length: 3 }, () => Array(7).fill("floor")),
    crates: [], coins: [], chests: [], gates: [], targets, beacon,
  };
}

describe("World 2 — sensor programs through the full stack", () => {
  it("if (targetAhead()) shoot(): clears a barrel then reaches the beacon", () => {
    const code = [
      "repeat 6 {",
      "  if (targetAhead()) { shoot() }",
      "  forward(1)",
      "}",
    ].join("\n");
    const res = runInSandbox(mission(lane([{ x: 3, y: 1 }]), code), code);
    expect(res.cleared).toBe(true);
    expect(res.finalState.pos).toEqual({ x: 6, y: 1 });
    expect(res.events.some((e) => e.type === "targetDestroyed")).toBe(true);
  });

  it("while (!atBeacon()) forward(): drives until it arrives (World 3 style)", () => {
    const code = "while (!atBeacon()) { forward(1) }";
    const res = runInSandbox(mission(lane(), code), code);
    expect(res.cleared).toBe(true);
    expect(res.finalState.pos).toEqual({ x: 6, y: 1 });
  });

  it("if (blocked()) turns instead of bumping — a wall-aware detour", () => {
    // wall at (3,1); go up and around: sense blocked, step to y=0, forward past, back down.
    const arena = lane();
    arena.cells[1][3] = "wall";
    const code = [
      "forward(2)",              // to (2,1), wall ahead at (3,1)
      "if (blocked()) {",
      "  left()",                // face N
      "  forward(1)",            // to (2,0)
      "  right()",               // face E
      "  forward(2)",            // to (4,0)
      "  right()",               // face S
      "  forward(1)",            // to (4,1)
      "  left()",                // face E
      "}",
      "forward(2)",              // to (6,1) beacon
    ].join("\n");
    const res = runInSandbox(mission(arena, code), code);
    expect(res.cleared).toBe(true);
    expect(res.finalState.bumps).toBe(0);
  });

  it("a user function composes commands (World 4 style)", () => {
    const code = [
      "function hop() { forward(1); honk() }",
      "repeat 6 { hop() }",
    ].join("\n");
    const res = runInSandbox(mission(lane(), code), code);
    expect(res.cleared).toBe(true);
    expect(res.finalState.honks).toBe(6);
  });
});
