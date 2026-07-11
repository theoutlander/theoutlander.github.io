import type { Mission } from "../sim/engine";
import { loadSave } from "../state/save";
import type { Arena, CellKind, Vec2 } from "../sim/types";

/**
 * PROVE IT — practice that cannot be faked.
 *
 * The campaign has a hole you can drive a bot through: every mission arena is FIXED and VISIBLE, so a
 * kid can beat the sensor levels without ever using a sensor. She can see where the barrel is, count
 * the squares, and write `forward(3); shoot(); forward(4)`. It clears, she gets three stars, and she
 * has learned nothing about `if` or `targetAhead()`. The lesson leaks straight out.
 *
 * A drill plugs it. ONE program is run against THREE randomly generated arenas from the same family,
 * and it has to clear all three. Counting squares now fails by construction — the squares are
 * different every time. The only code that survives is code that ASKS the world what's there. That's
 * the concept, and the drill makes it the only way through.
 *
 * Everything here is seeded, so a drill is reproducible (shareable, testable) rather than a slot
 * machine. Each family also carries the author's general solution, which is what SHOW ME plays and
 * what the tests use to prove the drill is beatable at all.
 */

/** mulberry32 — small, fast, deterministic. Same seed ⇒ same drill, always. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const int = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

const floor = (cols: number, rows: number): CellKind[][] =>
  Array.from({ length: rows }, () => Array<CellKind>(cols).fill("floor"));

function arenaOf(cols: number, rows: number, cells: CellKind[][], beacon: Vec2, targets: Vec2[] = []): Arena {
  return { cols, rows, cells, crates: [], coins: [], chests: [], gates: [], targets, beacon };
}

export interface DrillFamily {
  key: string;
  /** which concept this drill hammers home */
  concept: string;
  title: string;
  /** the mission that must be cleared first — a drill is never offered before its tools are.
   *  Every drill needs atBeacon() (you cannot "park on the beacon" without knowing you're on it),
   *  and that arrives in w2m4 "ARE WE THERE YET". */
  unlockAfter: string;
  /** what the kid is told — always states the ONE rule that makes hardcoding pointless */
  brief: string;
  /** the general program that clears ANY arena in this family */
  authorSolution: string;
  /** a plausible WRONG answer: hardcoded for one specific field. Tests prove it fails the others. */
  hardcodedTrap: (m: Mission) => string;
  build: (seed: number) => Mission;
}

/**
 * A drill is PASSED only if the bot ends its program parked ON the beacon.
 *
 * The campaign is looser: it counts a clear the moment the bot so much as touches the beacon, even
 * in passing. That looseness quietly destroys a drill. Because the beacon sits at the end of the
 * lane, `forward(99)` barges down the whole runway, gets clamped by the wall, and lands on the
 * beacon — one hardcoded line beats every arena we can generate, sensors be damned.
 *
 * Demanding that the bot STOP there fixes it: overshooting sails past (there's open floor beyond),
 * undershooting falls short, and the only way to stop in the right place is to notice you've
 * arrived. Which is the whole lesson.
 */
export function drillPassed(m: Mission, finalPos: Vec2): boolean {
  return finalPos.x === m.arena.beacon.x && finalPos.y === m.arena.beacon.y;
}

/** open floor BEYOND the beacon, so a bot that doesn't know when to stop rolls straight past it */
const RUNOFF = 2;

const base = (id: string, world: number, teaches: string) => ({
  id,
  world,
  index: 0,
  teaches,
  parLines: 99, // drills are about correctness, not golf — never punish a kid for being explicit
  bonusStar: { kind: "zeroBumps" } as const,
  challenge: true,
});

/* ------------------------------------------------------------------ *
 * BARREL RUN — targetAhead() / shoot() / if-else
 * A straight lane with barrels at random squares. You cannot count them: next arena, they move.
 * ------------------------------------------------------------------ */
const barrelRun: DrillFamily = {
  key: "barrel-run",
  concept: "targetahead",
  title: "BARREL RUN",
  unlockAfter: "w2m4",
  brief:
    "Three runways, one program. The barrels MOVE between runways, and you have to STOP on the " +
    "beacon — not roll past it. Counting squares cannot save you. The bot has to look.",
  authorSolution:
    "repeat 20 {\n  if (atBeacon()) {\n    honk()\n  } else if (targetAhead()) {\n    shoot()\n  } else {\n    forward(1)\n  }\n}",
  hardcodedTrap: (m) => {
    // exactly what a kid writes when she reads the board instead of sensing it: count, shoot, count
    const row = m.start.pos.y;
    const xs = (m.arena.targets ?? []).filter((t) => t.y === row).map((t) => t.x).sort((a, b) => a - b);
    const out: string[] = [];
    let at = m.start.pos.x;
    for (const x of xs) {
      if (x - 1 > at) out.push(`forward(${x - 1 - at})`);
      out.push("shoot()");
      at = x - 1;
    }
    out.push(`forward(${m.arena.beacon.x - at})`, "honk()");
    return out.join("\n");
  },
  build: (seed) => {
    const r = rng(seed);
    const lane = int(r, 9, 13); // distance to the beacon — different every arena
    const cols = lane + 1 + RUNOFF; // ...and open floor beyond it, so overshooting really overshoots
    const rows = 3;
    const row = 1;
    const targets: Vec2[] = [];
    let x = int(r, 2, 3);
    const want = int(r, 2, 4);
    while (targets.length < want && x < lane - 1) {
      targets.push({ x, y: row });
      x += int(r, 2, 3);
    }
    return {
      ...base(`drill-barrel-${seed}`, 2, "targetahead"),
      title: "BARREL RUN",
      arena: arenaOf(cols, rows, floor(cols, rows), { x: lane, y: row }, targets),
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// Same code, three runways. The barrels move. Stop ON the beacon.\n",
      briefing: barrelRun.brief,
      hints: [
        "The barrels sit somewhere different on each runway, and the beacon is a different distance away. So what can your code NOT rely on?",
        "Every single step, the bot has two things worth asking: have I arrived, and is something in my way? Its answer decides what it does next.",
        "repeat 20 {\n  if ( ??? ) {\n    honk()\n  } else if ( ??? ) {\n    ???\n  } else {\n    forward(1)\n  }\n}\nTwo questions, in the right order. Which one has to be asked first?",
      ],
      authorSolution: barrelRun.authorSolution,
    };
  },
};

/* ------------------------------------------------------------------ *
 * THE LONG HAUL — atBeacon() / while
 * A lane of unknown length. You cannot count the squares: next arena, the lane is longer.
 * ------------------------------------------------------------------ */
const longHaul: DrillFamily = {
  key: "long-haul",
  concept: "arrived",
  title: "THE LONG HAUL",
  unlockAfter: "w2m4",
  brief:
    "Three roads, all different lengths, one program. The road keeps going past the beacon, so " +
    "rolling forever will not do it. The bot has to notice when it has arrived.",
  authorSolution: "repeat 20 {\n  if (atBeacon()) {\n    honk()\n  } else {\n    forward(1)\n  }\n}",
  hardcodedTrap: (m) => `forward(${m.arena.beacon.x - m.start.pos.x})\nhonk()`,
  build: (seed) => {
    const r = rng(seed);
    const lane = int(r, 6, 14); // <- the whole point: the distance changes
    const cols = lane + 1 + RUNOFF;
    const rows = 3;
    const row = 1;
    return {
      ...base(`drill-haul-${seed}`, 2, "arrived"),
      title: "THE LONG HAUL",
      arena: arenaOf(cols, rows, floor(cols, rows), { x: lane, y: row }),
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// Same code, three roads. Each one is a different length. Stop ON the beacon.\n",
      briefing: longHaul.brief,
      hints: [
        "Each road is a different length, and the road carries on past the beacon. Is there any number of steps that works for all three?",
        "The bot can check whether it is standing on the beacon. Have it check after every single step.",
        "repeat 20 {\n  if ( ??? ) {\n    honk()\n  } else {\n    forward(1)\n  }\n}\nWhat should the bot ask itself after each step?",
      ],
      authorSolution: longHaul.authorSolution,
    };
  },
};

/* ------------------------------------------------------------------ *
 * THE WALL — blocked() / if-else, and the natural home of a function
 * One wall in the lane, in a different place every time. Dodge it and carry on.
 * ------------------------------------------------------------------ */
const wallDodge: DrillFamily = {
  key: "wall-dodge",
  concept: "deciding",
  title: "THE WALL",
  unlockAfter: "w2m4",
  brief:
    "Three lanes, one wall in each — never in the same place. One program for all three. The bot has " +
    "to FEEL the wall, not remember where it was. And it has to stop on the beacon.",
  // dodge = up, over, back down, carry on
  authorSolution:
    "repeat 20 {\n  if (atBeacon()) {\n    honk()\n  } else if (blocked()) {\n    left()\n    forward(1)\n    right()\n    forward(2)\n    right()\n    forward(1)\n    left()\n  } else {\n    forward(1)\n  }\n}",
  hardcodedTrap: (m) => {
    const wx = m.arena.cells[m.start.pos.y].findIndex((c) => c === "wall");
    return `forward(${wx - 1})\nleft()\nforward(1)\nright()\nforward(2)\nright()\nforward(1)\nleft()\nforward(${m.arena.beacon.x - wx - 1})\nhonk()`;
  },
  build: (seed) => {
    const r = rng(seed);
    const lane = int(r, 10, 13);
    const cols = lane + 1 + RUNOFF;
    const rows = 3;
    const row = 1;
    const cells = floor(cols, rows);
    const wx = int(r, 3, lane - 3); // the wall moves — that's the drill
    cells[row][wx] = "wall";
    return {
      ...base(`drill-wall-${seed}`, 2, "deciding"),
      title: "THE WALL",
      arena: arenaOf(cols, rows, cells, { x: lane, y: row }),
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// Same code, three lanes. The wall moves. Feel for it, and stop ON the beacon.\n",
      briefing: wallDodge.brief,
      hints: [
        "The wall is in a different spot in every lane, and the beacon is a different distance away. What can the bot check for itself, every step?",
        "Roll on while the way ahead is clear. When something is in the way, go around it and get back into the lane. And keep checking whether you have arrived.",
        "repeat 20 {\n  if ( ??? ) {\n    honk()\n  } else if ( ??? ) {\n    ??? // the way around\n  } else {\n    forward(1)\n  }\n}\nGoing around takes several moves. Work the little dance out on paper first.",
      ],
      authorSolution: wallDodge.authorSolution,
    };
  },
};

export const DRILLS: DrillFamily[] = [barrelRun, longHaul, wallDodge];

export const drillForConcept = (concept: string): DrillFamily | undefined =>
  DRILLS.find((d) => d.concept === concept);

/**
 * The three arenas a kid's single program has to survive.
 *
 * They are forced to sit at three DIFFERENT distances from the beacon, and that is not cosmetic — it
 * is the thing that makes the drill unfakeable. A hardcoded program is, in the end, a fixed number of
 * forward steps; it can only ever park at one distance. Let two arenas come out the same length by
 * chance (they will — random is like that) and the counting kid clears both, and the drill quietly
 * goes back to teaching nothing.
 */
export function drillArenas(family: DrillFamily, seed: number): Mission[] {
  const out: Mission[] = [];
  const distances = new Set<number>();
  for (let salt = 0; salt < 400 && out.length < 3; salt++) {
    const m = family.build(seed * 7919 + salt * 104729 + 1);
    const d = m.arena.beacon.x - m.start.pos.x;
    if (distances.has(d)) continue;
    distances.add(d);
    out.push(m);
  }
  return out;
}

/** Which drills the player has the tools for — never offer one whose commands she hasn't met yet. */
export function availableDrills(): DrillFamily[] {
  const save = loadSave();
  return DRILLS.filter((d) => save.missions[d.unlockAfter]?.cleared);
}
