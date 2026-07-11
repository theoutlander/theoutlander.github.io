import { describe, it, expect } from "vitest";
import { runBattle, type Entrant } from "../../src/sim/battle";
import type { Arena, Facing } from "../../src/sim/types";

const API = ["forward", "back", "left", "right", "honk", "shoot", "blocked", "atBeacon", "targetAhead", "enemyAhead", "enemyNear"];

function lane(cols = 8, rows = 3, beacon = { x: 7, y: 1 }): Arena {
  return {
    cols, rows,
    cells: Array.from({ length: rows }, () => Array(cols).fill("floor")),
    crates: [], coins: [], chests: [], gates: [], targets: [], beacon,
  };
}

const start = (x: number, y: number, facing: Facing) => ({ pos: { x, y }, facing });

describe("battle engine", () => {
  it("is DETERMINISTIC — same programs + arena ⇒ identical event log", () => {
    const arena = lane();
    const entrants: Entrant[] = [
      { id: "me", source: "while (!atBeacon()) { if (enemyAhead()) { shoot() } else { forward(1) } }", isPlayer: true },
      { id: "sniper", source: "repeat 30 { if (enemyAhead()) { shoot() } else { honk() } }" },
    ];
    const starts = [start(0, 1, "E"), start(6, 1, "W")];
    const a = runBattle(arena, entrants, starts, API, "both");
    const b = runBattle(arena, entrants, starts, API, "both");
    expect(JSON.stringify(a.events)).toBe(JSON.stringify(b.events));
    expect(a.outcome).toBe(b.outcome);
    expect(a.rounds).toBe(b.rounds);
  });

  it("reaching the beacon wins (reachBeacon)", () => {
    const arena = lane();
    const entrants: Entrant[] = [
      { id: "me", source: "while (!atBeacon()) { forward(1) }", isPlayer: true },
      { id: "dummy", source: "repeat 50 { honk() }" }, // sits at the far corner, never fights
    ];
    const res = runBattle(arena, entrants, [start(0, 1, "E"), start(3, 0, "E")], API, "reachBeacon");
    expect(res.outcome).toBe("win");
    expect(res.events.some((e) => e.type === "reach")).toBe(true);
  });

  it("shooting an enemy enough times wrecks it, and last-standing wins", () => {
    const arena = lane();
    const entrants: Entrant[] = [
      { id: "me", source: "repeat 6 { shoot() }", isPlayer: true },
      { id: "sitting-duck", source: "repeat 50 { honk() }" }, // never moves, never shoots back
    ];
    // enemy 3 cells ahead of the player, in the lane
    const res = runBattle(arena, entrants, [start(0, 1, "E"), start(3, 1, "E")], API, "lastStanding");
    expect(res.events.some((e) => e.type === "wreck" && e.bot === 1)).toBe(true);
    expect(res.outcome).toBe("win");
  });

  it("if the player's bot is wrecked, the player loses", () => {
    const arena = lane();
    const entrants: Entrant[] = [
      { id: "me", source: "repeat 50 { honk() }", isPlayer: true }, // just sits there
      { id: "killer", source: "repeat 6 { shoot() }" }, // guns the player down
    ];
    const res = runBattle(arena, entrants, [start(0, 1, "E"), start(3, 1, "W")], API, "lastStanding");
    expect(res.events.some((e) => e.type === "wreck" && e.bot === 0)).toBe(true);
    expect(res.outcome).toBe("lose");
  });

  it("enemyAhead() only sees a bot in the lane, not one off to the side", () => {
    const arena = lane(8, 3);
    // enemy directly ahead → true
    const ahead = runBattle(arena, [
      { id: "me", source: "if (enemyAhead()) { shoot() } else { honk() }", isPlayer: true },
      { id: "e", source: "repeat 30 { honk() }" },
    ], [start(0, 1, "E"), start(3, 1, "E")], API, "lastStanding");
    expect(ahead.events.some((e) => e.type === "shoot")).toBe(true);
    // enemy on a different row → false (player honks instead of shooting)
    const side = runBattle(arena, [
      { id: "me", source: "if (enemyAhead()) { shoot() } else { honk() }", isPlayer: true },
      { id: "e", source: "repeat 30 { honk() }" },
    ], [start(0, 1, "E"), start(3, 0, "E")], API, "lastStanding");
    expect(side.events.some((e) => e.type === "shoot")).toBe(false);
  });

  it("never hangs — a while(true) sensor spinner just forfeits its turns", () => {
    const arena = lane();
    const res = runBattle(arena, [
      { id: "me", source: "while (!atBeacon()) { forward(1) }", isPlayer: true },
      { id: "spinner", source: "while (true) { enemyNear() }" }, // thinks forever, never acts
    ], [start(0, 1, "E"), start(5, 0, "E")], API, "reachBeacon");
    expect(res.outcome).toBe("win"); // player still reaches the beacon; spinner just idles
  });
});
