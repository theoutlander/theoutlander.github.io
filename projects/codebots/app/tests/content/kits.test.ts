import { describe, it, expect } from "vitest";
import { KITS, computeStats, buyKit, equipKit, FRESH_LOADOUT } from "../../src/content/parts";
import { runBattle } from "../../src/sim/battle";
import { BATTLE_API } from "../../src/content/enemies";
import type { Arena, CellKind, Facing } from "../../src/sim/types";

/**
 * CODE BEATS PARTS. ALWAYS.
 *
 * This is the rule the whole game stands on. The moment a bought upgrade can beat a better-written
 * program, we are telling children to grind coins instead of think, and every hour they spend here is
 * an hour spent learning the wrong lesson. Gear picks your STYLE. Code decides who wins.
 *
 * The garage used to be an RPG — three chassis, a weight budget, slot counts, part weights, an
 * overload rule, and two kinds of part — which a six-year-old had to reason about before she could
 * equip anything. Worse, it sold CAPABILITY parts: a blaster that "lets you shoot()". That made
 * shoot() a purchase, which made the campaign a coin farm. It's one decision now, with three answers.
 */
function arena(): Arena {
  const cols = 15, rows = 9;
  const cells = Array.from({ length: rows }, () => Array<CellKind>(cols).fill("floor"));
  for (const [x, y] of [[5,3],[5,5],[9,3],[9,5],[7,2],[7,6],[3,1],[3,7],[11,1],[11,7]] as [number, number][]) cells[y][x] = "wall";
  return { cols, rows, cells, crates: [], coins: [], chests: [], gates: [], targets: [], beacon: { x: 0, y: 0 } };
}
const A = { pos: { x: 0, y: 4 }, facing: "E" as Facing };
const B = { pos: { x: 14, y: 4 }, facing: "W" as Facing };

const BRAINLESS = "while (true) { forward(1) }";
const THINKER =
  "while (true) { if (enemyAhead()) { shoot() } else if (closerAhead()) { forward(1) } else if (enemyLeft()) { left() } else { right() } }";

const duel = (mine: string, myKit: string, theirs: string, theirKit: string) =>
  runBattle(
    arena(),
    [
      { id: "me", source: mine, isPlayer: true, stats: computeStats({ kit: myKit, owned: [myKit] }) },
      { id: "them", source: theirs, stats: computeStats({ kit: theirKit, owned: [theirKit] }) },
    ],
    [A, B],
    BATTLE_API,
    "lastStanding",
  );

describe("the garage", () => {
  it("A WELL-WRITTEN STOCK BOT BEATS A BADLY-WRITTEN EXPENSIVE ONE — in every kit money can buy", () => {
    for (const k of KITS) {
      const res = duel(THINKER, "scout", BRAINLESS, k.id);
      expect(
        res.outcome,
        `a brainless bot in a ${k.name} beat a well-coded SCOUT — the game now rewards grinding coins over thinking`,
      ).toBe("win");
    }
  });

  it("asks the kid exactly ONE question", () => {
    // no weights, no slots, no overload, no second kind of part. One decision, three answers.
    expect(KITS).toHaveLength(3);
    for (const k of KITS) {
      expect(Object.keys(k).sort()).toEqual(["armor", "cost", "damage", "desc", "id", "name", "range", "tradeoff"]);
    }
  });

  it("every kit says out loud what it COSTS you — a choice with no downside isn't a choice", () => {
    for (const k of KITS.filter((k) => k.cost > 0)) {
      expect(k.tradeoff.length, `${k.name} has no stated downside`).toBeGreaterThan(15);
      // and it must genuinely be worse at something than the stock bot
      const scout = KITS[0];
      const worseSomewhere = k.armor < scout.armor || k.range < scout.range || k.damage < scout.damage;
      expect(worseSomewhere, `${k.name} is strictly better than SCOUT — that's pay-to-win`).toBe(true);
    }
  });

  it("never sells an ABILITY — commands are earned by learning, never bought", () => {
    // the old garage sold a "blaster that lets you shoot()". That made shoot() a purchase and turned
    // the campaign into a coin farm. A kit may change numbers. It may never grant a verb.
    for (const k of KITS) {
      expect(JSON.stringify(k)).not.toMatch(/shoot\(\)|blocked\(\)|atBeacon\(\)|lets you/i);
    }
  });

  it("she starts owning SCOUT, and swapping between owned kits is free forever", () => {
    expect(FRESH_LOADOUT.owned).toContain("scout");
    const l = { kit: "scout", owned: ["scout", "tank"] };
    expect(equipKit(l, "tank").kit).toBe("tank");
    expect(equipKit(l, "longshot").kit).toBe("scout"); // can't drive what you don't own
  });

  it("can't buy what she can't afford", () => {
    expect(buyKit(FRESH_LOADOUT, 10, "tank")).toBeNull();
    const ok = buyKit(FRESH_LOADOUT, 500, "tank");
    expect(ok?.loadout.owned).toContain("tank");
    expect(ok?.coins).toBe(500 - 120);
  });
});
