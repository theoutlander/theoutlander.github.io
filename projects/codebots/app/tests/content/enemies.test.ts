import { describe, it, expect } from "vitest";
import { PRESETS, BATTLE_API } from "../../src/content/enemies";
import { runBattle, type Entrant } from "../../src/sim/battle";
import type { Arena, Facing } from "../../src/sim/types";

const arena: Arena = {
  cols: 8, rows: 5,
  cells: Array.from({ length: 5 }, () => Array(8).fill("floor")),
  crates: [], coins: [], chests: [], gates: [], targets: [], beacon: { x: 7, y: 2 },
};
const start = (x: number, y: number, f: Facing) => ({ pos: { x, y }, facing: f });

describe("preset enemy brains", () => {
  for (const p of PRESETS) {
    it(`${p.id} runs a battle without throwing and terminates`, () => {
      const entrants: Entrant[] = [
        { id: "me", source: "while (!atBeacon()) { if (enemyAhead()) { shoot() } else if (blocked()) { right() } else { forward(1) } }", isPlayer: true },
        { id: p.id, source: p.source },
      ];
      const starts = [start(0, 2, "E"), start(5, 2, "W")];
      let res: ReturnType<typeof runBattle> | null = null;
      expect(() => { res = runBattle(arena, entrants, starts, BATTLE_API, "both"); }).not.toThrow();
      expect(["win", "lose", "draw"]).toContain(res!.outcome);
      expect(res!.rounds).toBeGreaterThan(0);
    });
  }

  it("is deterministic with a preset opponent", () => {
    const entrants: Entrant[] = [
      { id: "me", source: "while (!atBeacon()) { if (enemyAhead()) { shoot() } else { forward(1) } }", isPlayer: true },
      { id: "sniper", source: PRESETS.find((p) => p.id === "sniper")!.source },
    ];
    const starts = [start(0, 2, "E"), start(5, 2, "W")];
    const a = runBattle(arena, entrants, starts, BATTLE_API, "both");
    const b = runBattle(arena, entrants, starts, BATTLE_API, "both");
    expect(JSON.stringify(a.events)).toBe(JSON.stringify(b.events));
  });

  it("the sniper actually fires when the player is in its line", () => {
    const entrants: Entrant[] = [
      { id: "me", source: "while (!atBeacon()) { forward(1) }", isPlayer: true },
      { id: "sniper", source: PRESETS.find((p) => p.id === "sniper")!.source },
    ];
    // sniper starts facing the approaching player
    const res = runBattle(arena, entrants, [start(0, 2, "E"), start(5, 2, "W")], BATTLE_API, "both");
    expect(res.events.some((e) => e.type === "shoot" && e.bot === 1)).toBe(true);
  });
});
