import { describe, it, expect } from "vitest";
import { createSim } from "../../src/sim/engine";
import type { Arena } from "../../src/sim/types";

const arena: Arena = {
  cols: 9, rows: 6,
  cells: Array.from({ length: 6 }, () => Array(9).fill("floor")),
  crates: [{ x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 7, y: 3 }],
  coins: [], chests: [], gates: [],
  beacon: { x: 7, y: 1 },
};
arena.cells[2][1] = "mud";
arena.cells[3][1] = "mud";

function makeMission() {
  return {
    id: "test", world: 1, index: 1, teaches: "sequencing",
    arena, start: { pos: { x: 0, y: 4 }, facing: "E" as const },
    parLines: 6, starterCode: "", hints: ["", "", ""], briefing: "",
    authorSolution: "forward(2); left(); forward(3); right(); forward(5); honk();",
    bonusStar: { kind: "honkOnBeacon" as const },
  };
}

describe("engine", () => {
  it("clears W1M1 with the author solution's move sequence", () => {
    const sim = createSim(makeMission());
    sim.execute({ name: "forward", args: [2] });
    sim.execute({ name: "left", args: [] });
    sim.execute({ name: "forward", args: [3] });
    sim.execute({ name: "right", args: [] });
    sim.execute({ name: "forward", args: [5] });
    sim.execute({ name: "honk", args: [] });
    expect(sim.state().pos).toEqual({ x: 7, y: 1 });
    expect(sim.isCleared()).toBe(true);
  });

  it("records a trace entry per executed command", () => {
    const sim = createSim(makeMission());
    sim.execute({ name: "forward", args: [2] });
    expect(sim.trace().length).toBeGreaterThan(0);
    expect(sim.trace().at(-1)).toMatchObject({ x: 2, y: 4 });
  });
});
