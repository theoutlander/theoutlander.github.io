import { describe, it, expect } from "vitest";
import { PRESETS, BATTLE_API } from "../../src/content/enemies";
import { runBattle, type Entrant } from "../../src/sim/battle";
import type { Arena, Facing } from "../../src/sim/types";

/** The real Battle Arena (mirrors ui/BattleScreen): the rival stands BETWEEN you and the beacon. */
function arena(): Arena {
  const cols = 11, rows = 7;
  const cells = Array.from({ length: rows }, () => Array<string>(cols).fill("floor"));
  for (const [x, y] of [[4, 1], [4, 2], [4, 5], [7, 0], [7, 4], [7, 5]] as [number, number][]) cells[y][x] = "wall";
  return { cols, rows, cells: cells as Arena["cells"], crates: [], coins: [], chests: [], gates: [], targets: [], beacon: { x: 10, y: 3 } };
}
const PS = { pos: { x: 0, y: 3 }, facing: "E" as Facing };
const ES = { pos: { x: 7, y: 3 }, facing: "W" as Facing };

const NAIVE = "while (!atBeacon()) { forward(1) }";
const SMART = "while (!atBeacon()) { if (enemyAhead()) { shoot() } else if (blocked()) { right() } else { forward(1) } }";

const fight = (playerSrc: string, p: (typeof PRESETS)[number]) =>
  runBattle(
    arena(),
    [{ id: "me", source: playerSrc, isPlayer: true }, { id: p.id, source: p.source, stats: p.stats } as Entrant],
    [PS, ES],
    BATTLE_API,
    "both",
  );

/**
 * THE ARENA'S WHOLE POINT: better CODE wins. These bots used to be broken — they fired ZERO shots
 * (a bot could only see a rival perfectly lined up on a row/column, so it spun in place forever),
 * and the beacon was closer to the player than the enemy was, so you just strolled past and the
 * fight never happened. These tests pin both halves of the fix.
 */
describe("the arena is a real fight, and good code wins it", () => {
  for (const p of PRESETS) {
    it(`${p.name} actually engages — it moves/tracks and FIRES`, () => {
      const res = fight(NAIVE, p);
      const shots = res.events.filter((e) => e.type === "shoot" && e.bot === 1).length;
      expect(shots, `${p.name} never fired a shot — it isn't fighting`).toBeGreaterThan(0);
    });

    it(`${p.name} WRECKS a player who just walks at the beacon`, () => {
      // if a naive walk wins, the fight is decorative and combat means nothing
      expect(fight(NAIVE, p).outcome, `${p.name} lost to a bot that just walks forward`).toBe("lose");
    });

    it(`${p.name} LOSES to a player who shoots on sight (better code wins)`, () => {
      expect(fight(SMART, p).outcome, `${p.name} is unbeatable — the arena isn't winnable by thinking`).toBe("win");
    });

    it(`${p.name} fights last long enough for tactics to matter (not a first-shot coin flip)`, () => {
      expect(fight(SMART, p).rounds).toBeGreaterThan(4);
    });
  }

  it("enemies see SHORTER than you — that's the tactical lesson (shoot on sight, don't charge)", () => {
    for (const p of PRESETS) expect(p.stats?.range ?? 6).toBeLessThan(6);
  });

  it("battles stay deterministic with the new sensors", () => {
    const a = fight(SMART, PRESETS[0]);
    const b = fight(SMART, PRESETS[0]);
    expect(JSON.stringify(a.events)).toBe(JSON.stringify(b.events));
  });
});
