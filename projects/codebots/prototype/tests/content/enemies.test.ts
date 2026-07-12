import { describe, it, expect } from "vitest";
import { PRESETS, BATTLE_API } from "../../src/content/enemies";
import { runBattle, type Entrant } from "../../src/sim/battle";
import type { Arena, CellKind, Facing } from "../../src/sim/types";

/**
 * THE ARENA HAS TO BE A FIGHT.
 *
 * It wasn't. Three things were wrong at once, and only one of them was a bug:
 *
 *   1. THE FIGHT COULD NOT HAPPEN. The room had two win conditions — reach the beacon, or wreck your
 *      rival — and the beacon sat 7 squares away while a bot shoots 6. So you could WALK to the goal
 *      and win before a single shot was ever possible. Measured: every strategy beat every house bot,
 *      including one whose entire program was `forward(1)` in a loop. It is a battle arena now. Last
 *      bot standing, no beacon. Navigation is what the campaign is for.
 *
 *   2. SNIPER FIRED ZERO SHOTS, EVER. It spun on the spot seven times and died. Its brain had no
 *      answer for "a rival is dead ahead but out of range", so it fell through to `right()`, forever.
 *
 *   3. THE OLD TEST MISSED IT — and that's the part worth remembering. It only pitted the presets
 *      against a NAIVE player, and against a naive player the sniper happened to line up by luck. A
 *      test that only tries the easy case is not a test. Every preset is now checked against a
 *      COMPETENT opponent too: the case where a broken brain has nowhere to hide.
 */
function arena(): Arena {
  const cols = 15, rows = 9;
  const cells = Array.from({ length: rows }, () => Array<CellKind>(cols).fill("floor"));
  const walls: [number, number][] = [
    [5, 3], [5, 5], [9, 3], [9, 5], [7, 2], [7, 6], [3, 1], [3, 7], [11, 1], [11, 7],
  ];
  for (const [x, y] of walls) cells[y][x] = "wall";
  return { cols, rows, cells, crates: [], coins: [], chests: [], gates: [], targets: [], beacon: { x: 0, y: 0 } };
}
const PS = { pos: { x: 0, y: 4 }, facing: "E" as Facing };
const ES = { pos: { x: 14, y: 4 }, facing: "W" as Facing };

/** no brain at all: drives forward until something kills it */
const BRAINLESS = "while (true) { forward(1) }";
/** a competent bot: closes the gap, fires when it has a shot */
const THINKER =
  "while (true) { if (enemyAhead()) { shoot() } else if (closerAhead()) { forward(1) } else if (enemyLeft()) { left() } else { right() } }";

const fight = (playerSrc: string, p: (typeof PRESETS)[number]) =>
  runBattle(
    arena(),
    [{ id: "me", source: playerSrc, isPlayer: true }, { id: p.id, source: p.source, stats: p.stats } as Entrant],
    [PS, ES],
    BATTLE_API,
    "lastStanding",
  );

describe("the house bots are worth fighting", () => {
  for (const p of PRESETS) {
    it(`${p.name} FIRES — even against a player who knows what they're doing`, () => {
      // THE test. SNIPER passed the old version of this while firing literally zero shots in any real
      // fight, because the old version only ever tried a naive opponent.
      for (const [who, src] of [["a brainless bot", BRAINLESS], ["a competent bot", THINKER]] as const) {
        const shots = fight(src, p).events.filter((e) => e.bot === 1 && e.type === "shoot").length;
        expect(shots, `${p.name} never fired a shot against ${who} — it isn't fighting`).toBeGreaterThan(0);
      }
    });

    it(`${p.name} BEATS a bot with no brain`, () => {
      // if driving forward in a straight line wins, the arena is decorative
      expect(fight(BRAINLESS, p).outcome, `${p.name} lost to a bot whose whole program is forward(1)`).toBe("lose");
    });

    it(`${p.name} LOSES to a bot that thinks — the arena is winnable by CODE`, () => {
      expect(fight(THINKER, p).outcome, `${p.name} is unbeatable; there is nothing to out-think`).toBe("win");
    });

    it(`${p.name} — the fight lasts long enough to watch, and to learn from`, () => {
      // it used to be over in about two seconds. That isn't a fight, it's a coin toss.
      expect(fight(THINKER, p).rounds).toBeGreaterThan(6);
    });

    it(`${p.name} tells the kid how to beat it`, () => {
      // a house bot that can't be beaten by an IDEA is a dice roll wearing a name
      expect(p.weakness.length).toBeGreaterThan(20);
    });
  }

  it("fights are deterministic — the same two programs always give the same fight", () => {
    // a published bot is fought hundreds of times while its owner sleeps; every one of those must agree
    const a = fight(THINKER, PRESETS[0]);
    const b = fight(THINKER, PRESETS[0]);
    expect(JSON.stringify(a.events)).toBe(JSON.stringify(b.events));
  });
});
