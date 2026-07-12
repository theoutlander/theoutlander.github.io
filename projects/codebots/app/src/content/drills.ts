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

  /**
   * HOW MANY FIELDS ONE PROGRAM MUST SURVIVE.
   *
   * Three, wherever the kid can SENSE. That's what makes counting squares useless: the squares move.
   *
   * But before `atBeacon()` a bot is blind, and a blind bot genuinely cannot clear three different
   * fields with one program. That's a real limit of a robot with no eyes, not a bug to engineer
   * around. So the blind concepts (sequencing, repeat, shoot) get ONE field — but a freshly generated
   * one every attempt, so there's still nothing to memorise, and a LINE BUDGET that brute force can't
   * fit inside. The transfer is real either way; only the mechanism differs.
   */
  fields: 1 | 3;

  /** A line budget. Makes writing it out longhand impossible, so the abstraction is the only way in. */
  maxLines?: number;

  /**
   * A construct the program must contain (`while`, `function`, `else`…).
   *
   * Used honestly: some constructs aren't strictly NECESSARY (a `repeat 40` can imitate a `while`),
   * and a drill for a construct may fairly insist on that construct. Where we do, the brief says so
   * out loud — "use a while loop" — rather than pretending it's the only road through.
   */
  mustUse?: string[];

  /** the general program that clears ANY arena in this family */
  authorSolution: string;
  /** For drills whose answer depends on the field (the blind ones), the solution for THIS field. */
  solve?: (m: Mission) => string;
  /** a plausible WRONG answer: hardcoded for one specific field. Tests prove it fails the others. */
  hardcodedTrap?: (m: Mission) => string;
  build: (seed: number) => Mission;
}

/** The answer for this specific field — field-shaped for blind drills, fixed for sensing ones. */
export function solutionFor(f: DrillFamily, m: Mission): string {
  return f.solve ? f.solve(m) : f.authorSolution;
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
  fields: 3,
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
  fields: 3,
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
  fields: 3,
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


/* ================================================================== *
 * THE BLIND DRILLS — sequencing, repeat, shoot.
 *
 * Before atBeacon() the bot has no eyes, so one program genuinely cannot clear three different
 * fields. Rather than fake a sensor she hasn't earned, these use a fresh random field every attempt
 * (nothing to memorise) plus a LINE BUDGET that longhand can't fit inside (so the abstraction is the
 * only road through). The transfer is just as real; the mechanism is different because the robot is.
 * ================================================================== */

/** NEW GROUND — sequencing. A path she has never seen. Producing a correct NEW sequence IS the transfer. */
const newGround: DrillFamily = {
  key: "new-ground",
  concept: "sequencing",
  title: "NEW GROUND",
  unlockAfter: "w1m1",
  fields: 1,
  brief:
    "A dock you've never seen. There's no trick here and no sensor — just look, work out the moves, " +
    "and write them down in the right order. It's a different dock every single time.",
  authorSolution: "forward(?)\nleft()\nforward(?)",
  solve: (m) => {
    const across = m.arena.beacon.x - m.start.pos.x;
    const up = m.start.pos.y - m.arena.beacon.y;
    return `forward(${across})\nleft()\nforward(${up})`;
  },
  build: (seed) => {
    const r = rng(seed);
    const across = int(r, 3, 7);
    const up = int(r, 1, 3);
    const rows = up + 3;
    const row = rows - 2;
    const cols = across + 3;
    return {
      ...base(`drill-ground-${seed}`, 1, "sequencing"),
      title: "NEW GROUND",
      fields: 1,
      arena: arenaOf(cols, rows, floor(cols, rows), { x: across, y: row - up }),
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// A dock you've never seen. Count the squares, then write the moves.\n",
      briefing: newGround.brief,
      hints: [
        "Count the squares along the floor first, then the squares upward. Those two numbers are your program.",
        "Roll across first, then turn, then roll up. Careful: left() turns the bot to ITS own left, and it's facing right — so left() points it up.",
        "forward( ??? )\nleft()\nforward( ??? )\nBoth numbers are just squares you can see. Count them.",
      ],
      authorSolution: "",
    } as unknown as Mission;
  },
};

/** GATE RUN — repeat. Every gate needs its own honk, so brute force cannot collapse into one line. */
const gateRun: DrillFamily = {
  key: "gate-run",
  concept: "repeat",
  title: "GATE RUN",
  unlockAfter: "w1m5",
  fields: 1,
  maxLines: 5,
  brief:
    "A row of gates. Each one only opens if you HONK while standing on its pad — so you can't just " +
    "drive through. And you get 5 lines. Writing every honk out by hand will not fit. Find the loop.",
  authorSolution: "repeat n {\n  forward(2)\n  honk()\n}\nforward(tail)",
  solve: (m) => {
    const gates = m.arena.gates.length;
    const tail = m.arena.beacon.x - gates * 2;
    return `repeat ${gates} {\n  forward(2)\n  honk()\n}\nforward(${tail})`;
  },
  // exactly what she writes if she doesn't spot the loop: two lines per gate, forever
  hardcodedTrap: (m) => {
    const out: string[] = [];
    for (let i = 0; i < m.arena.gates.length; i++) out.push("forward(2)", "honk()");
    out.push(`forward(${m.arena.beacon.x - m.arena.gates.length * 2})`);
    return out.join("\n");
  },
  build: (seed) => {
    const r = rng(seed);
    const n = int(r, 3, 6); // <- the number of gates changes, so even the loop count can't be memorised
    const tail = int(r, 1, 3);
    const beaconX = n * 2 + tail;
    const cols = beaconX + 2;
    const rows = 3;
    const row = 1;
    const gates = Array.from({ length: n }, (_, i) => ({
      pad: { x: (i + 1) * 2, y: row },
      gateCells: [{ x: (i + 1) * 2 + 1, y: row }],
      open: false,
    }));
    return {
      ...base(`drill-gates-${seed}`, 1, "repeat"),
      title: "GATE RUN",
      arena: { ...arenaOf(cols, rows, floor(cols, rows), { x: beaconX, y: row }), gates },
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// Every gate needs a honk from its pad. You get 5 lines.\n",
      briefing: gateRun.brief,
      hints: [
        "Look at the gates. Is the move you make at each one the same move, over and over?",
        "Roll onto a pad, honk to open its gate, roll to the next. That pair of moves repeats — count how many times.",
        "repeat ??? {\n  forward(2)\n  honk()\n}\nforward( ??? )\nHow many gates are there, and how far is the beacon past the last one?",
      ],
      authorSolution: "",
    } as unknown as Mission;
  },
};

/** POINT BLANK — shoot. Barrels she's never seen, no sensor yet. She must look and aim herself. */
const pointBlank: DrillFamily = {
  key: "point-blank",
  concept: "shoot",
  title: "POINT BLANK",
  unlockAfter: "w2m2s",
  fields: 1,
  brief:
    "Barrels in the lane, in places you've never seen them. You don't have a sensor yet — so LOOK, " +
    "count, and fire at the right moments. New barrels every time.",
  authorSolution: "forward(?)\nshoot()\n…",
  solve: (m) => {
    const row = m.start.pos.y;
    const xs = (m.arena.targets ?? []).map((t) => t.x).sort((a, b) => a - b);
    const out: string[] = [];
    let at = m.start.pos.x;
    for (const x of xs) {
      if (x - 1 > at) out.push(`forward(${x - 1 - at})`);
      out.push("shoot()");
      at = x - 1;
    }
    out.push(`forward(${m.arena.beacon.x - at})`);
    return out.join("\n");
  },
  build: (seed) => {
    const r = rng(seed);
    const lane = int(r, 7, 11);
    const cols = lane + 2;
    const rows = 3;
    const row = 1;
    const targets: Vec2[] = [];
    let x = int(r, 2, 3);
    const want = int(r, 2, 3);
    while (targets.length < want && x < lane - 1) {
      targets.push({ x, y: row });
      x += int(r, 2, 3);
    }
    return {
      ...base(`drill-blank-${seed}`, 2, "shoot"),
      title: "POINT BLANK",
      arena: arenaOf(cols, rows, floor(cols, rows), { x: lane, y: row }, targets),
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// New barrels every time. Look, count, and fire.\n",
      briefing: pointBlank.brief,
      hints: [
        "A barrel blocks you. What has to happen to it before the bot can roll through that square?",
        "Stop one square SHORT of a barrel, fire, and then carry on. Fire from anywhere else and the shot goes nowhere.",
        "forward( ??? )\nshoot()\nforward( ??? )\n…and so on. Every number is a count of squares you can see.",
      ],
      authorSolution: "",
    } as unknown as Mission;
  },
};

/* ================================================================== *
 * THE SENSING DRILLS — one program, three fields it has never seen.
 * ================================================================== */

/** BOTH WAYS — if/else. Some squares hold a barrel, some are open. You must write BOTH branches. */
const bothWays: DrillFamily = {
  key: "both-ways",
  concept: "orelse",
  title: "BOTH WAYS",
  unlockAfter: "w2m4",
  fields: 3,
  mustUse: ["else"],
  brief:
    "Every step, the bot is in one of two situations: something in the way, or open road. It has to " +
    "know what to do in BOTH. Three fields, one program — and your program must use else.",
  authorSolution:
    "repeat 20 {\n  if (atBeacon()) {\n    honk()\n  } else if (targetAhead()) {\n    shoot()\n  } else {\n    forward(1)\n  }\n}",
  hardcodedTrap: (m) => {
    const xs = (m.arena.targets ?? []).map((t) => t.x).sort((a, b) => a - b);
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
    const lane = int(r, 8, 12);
    const cols = lane + 1 + RUNOFF;
    const rows = 3;
    const row = 1;
    const targets: Vec2[] = [];
    let x = int(r, 2, 4);
    const want = int(r, 1, 3);
    while (targets.length < want && x < lane - 1) {
      targets.push({ x, y: row });
      x += int(r, 2, 4);
    }
    return {
      ...base(`drill-both-${seed}`, 2, "orelse"),
      title: "BOTH WAYS",
      arena: arenaOf(cols, rows, floor(cols, rows), { x: lane, y: row }, targets),
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// Two situations, two answers. Your program must use else.\n",
      briefing: bothWays.brief,
      hints: [
        "On any given step there are only a few things that can be true. How many? And does the bot do the same thing in each?",
        "Write a plan for a blocked square AND a plan for an open one. The bot senses, then picks the plan that matches.",
        "repeat 20 {\n  if ( ??? ) {\n    honk()\n  } else if ( ??? ) {\n    ???\n  } else {\n    ???\n  }\n}\nWhat goes in each branch, and which question comes first?",
      ],
      authorSolution: bothWays.authorSolution,
    };
  },
};

/** NO COUNTING — while. The road's length is unknowable, so a counted loop can't be right. */
const noCounting: DrillFamily = {
  key: "no-counting",
  concept: "keepgoing",
  title: "NO COUNTING",
  unlockAfter: "w3m1",
  fields: 3,
  mustUse: ["while"],
  brief:
    "Three roads, all different lengths. You are not told how far it is, and you never will be. Use a " +
    "while loop: keep rolling UNTIL you've arrived. No counting.",
  authorSolution: "while (!atBeacon()) {\n  forward(1)\n}",
  hardcodedTrap: (m) => `forward(${m.arena.beacon.x - m.start.pos.x})`,
  build: (seed) => {
    const r = rng(seed);
    const lane = int(r, 5, 14);
    const cols = lane + 1 + RUNOFF;
    const rows = 3;
    const row = 1;
    return {
      ...base(`drill-while-${seed}`, 3, "keepgoing"),
      title: "NO COUNTING",
      arena: arenaOf(cols, rows, floor(cols, rows), { x: lane, y: row }),
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// You don't get to know how far it is. Keep going UNTIL you arrive.\n",
      briefing: noCounting.brief,
      hints: [
        "Every road is a different length, and the road carries on past the beacon. Is there any number of steps that works on all three?",
        "Instead of counting steps, describe when to STOP: keep rolling while you have not arrived.",
        "while ( ??? ) {\n  forward(1)\n}\nWhat has to stay TRUE for the bot to keep going? (The ! means 'not'.)",
      ],
      authorSolution: noCounting.authorSolution,
    };
  },
};

/** EVERYTHING AT ONCE — else-if chains. Barrels AND walls AND a beacon; the ORDER of the questions matters. */
const everything: DrillFamily = {
  key: "everything",
  concept: "chain",
  title: "EVERYTHING AT ONCE",
  unlockAfter: "w3m5",
  fields: 3,
  brief:
    "Barrels, walls, and a beacon — all in one lane, in places you've never seen. Three questions, " +
    "and the ORDER you ask them in decides whether your bot lives.",
  authorSolution:
    "while (!atBeacon()) {\n  if (targetAhead()) {\n    shoot()\n  } else if (blocked()) {\n    left()\n    forward(1)\n    right()\n    forward(2)\n    right()\n    forward(1)\n    left()\n  } else {\n    forward(1)\n  }\n}",
  // What she writes when she reads the board instead of sensing it: shoot the barrels she can SEE,
  // dodge the wall she can SEE, roll to the flag. Perfect on this field, useless on the next one.
  hardcodedTrap: (m) => {
    const row = m.start.pos.y;
    const wx = m.arena.cells[row].findIndex((c) => c === "wall");
    const xs = (m.arena.targets ?? []).map((t) => t.x).sort((a, b) => a - b);
    const out: string[] = [];
    let at = m.start.pos.x;
    for (const x of xs) {
      if (x - 1 > at) out.push(`forward(${x - 1 - at})`);
      out.push("shoot()");
      at = x - 1;
    }
    if (wx - 1 > at) out.push(`forward(${wx - 1 - at})`);
    out.push("left()", "forward(1)", "right()", "forward(2)", "right()", "forward(1)", "left()");
    at = wx + 1;
    out.push(`forward(${m.arena.beacon.x - at})`);
    return out.join("\n");
  },
  build: (seed) => {
    const r = rng(seed);
    const lane = int(r, 11, 14);
    const cols = lane + 1 + RUNOFF;
    const rows = 3;
    const row = 1;
    const cells = floor(cols, rows);
    const wx = int(r, 6, lane - 3); // a wall, somewhere different every field
    cells[row][wx] = "wall";
    // barrels live BEFORE the wall, so the lane reads: shoot, shoot, dodge, roll home
    const targets: Vec2[] = [{ x: 2, y: row }];
    if (wx > 5) targets.push({ x: 4, y: row });
    return {
      ...base(`drill-all-${seed}`, 3, "chain"),
      title: "EVERYTHING AT ONCE",
      arena: arenaOf(cols, rows, cells, { x: lane, y: row }, targets),
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// A barrel you can shoot. A wall you cannot. Ask the right question first.\n",
      briefing: everything.brief,
      hints: [
        "A barrel and a wall both stop you — but only one of them can be shot. Can the bot tell them apart?",
        "Each pass, exactly one thing is true: a barrel ahead, a wall ahead, or clear road. Decide what to do in each, and which to ask about FIRST.",
        "while (!atBeacon()) {\n  if ( ??? ) {\n    ???\n  } else if ( ??? ) {\n    ??? // the way around\n  } else {\n    forward(1)\n  }\n}\nAsking them in the wrong order will waste shots on a wall.",
      ],
      authorSolution: everything.authorSolution,
    };
  },
};

/** NAME THE MOVE — functions. The dodge is seven lines; do it twice and the repetition is unbearable. */
const nameTheMove: DrillFamily = {
  key: "name-the-move",
  concept: "functions",
  title: "NAME THE MOVE",
  unlockAfter: "w4m1",
  fields: 3,
  mustUse: ["function"],
  brief:
    "Walls in places you've never seen, and getting round one takes seven moves. Give that dance a " +
    "NAME, once, and then just call it. Your program must define a function.",
  authorSolution:
    "function dodge() {\n  left()\n  forward(1)\n  right()\n  forward(2)\n  right()\n  forward(1)\n  left()\n}\n\nwhile (!atBeacon()) {\n  if (blocked()) {\n    dodge()\n  } else {\n    forward(1)\n  }\n}",
  hardcodedTrap: (m) => {
    const wx = m.arena.cells[m.start.pos.y].findIndex((c) => c === "wall");
    return `forward(${wx - 1})\nleft()\nforward(1)\nright()\nforward(2)\nright()\nforward(1)\nleft()\nforward(${m.arena.beacon.x - wx - 1})`;
  },
  build: (seed) => {
    const r = rng(seed);
    const lane = int(r, 10, 13);
    const cols = lane + 1 + RUNOFF;
    const rows = 3;
    const row = 1;
    const cells = floor(cols, rows);
    cells[row][int(r, 3, lane - 3)] = "wall";
    return {
      ...base(`drill-fn-${seed}`, 4, "functions"),
      title: "NAME THE MOVE",
      arena: arenaOf(cols, rows, cells, { x: lane, y: row }),
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// Going around a wall takes seven moves. Give it a name.\n",
      briefing: nameTheMove.brief,
      hints: [
        "How many lines does it take to get around ONE wall? Now imagine a lane with four of them.",
        "Teach the robot a new command of your own — one that means 'go around the thing in front of me' — and then use that word.",
        "function ???() {\n  ??? // the seven moves\n}\n\nwhile (!atBeacon()) {\n  if (blocked()) {\n    ???()\n  } else {\n    forward(1)\n  }\n}\nWhat will you call it?",
      ],
      authorSolution: nameTheMove.authorSolution,
    };
  },
};


/** THE REAL LOOP — the `for` reveal. Same gates, but written the way every JavaScript programmer writes it. */
const realLoop: DrillFamily = {
  key: "real-loop",
  concept: "forloop",
  title: "THE REAL LOOP",
  unlockAfter: "w3m2",
  fields: 1,
  maxLines: 6,
  mustUse: ["for"],
  brief:
    "The same gates — but this time write the loop the way every JavaScript programmer writes it. " +
    "Use a for loop. You get 6 lines, so writing the honks out by hand is not an option.",
  authorSolution: "for (let i = 0; i < n; i++) {\n  forward(2)\n  honk()\n}\nforward(tail)",
  solve: (m) => {
    const gates = m.arena.gates.length;
    const tail = m.arena.beacon.x - gates * 2;
    return `for (let i = 0; i < ${gates}; i++) {\n  forward(2)\n  honk()\n}\nforward(${tail})`;
  },
  hardcodedTrap: (m) => {
    const out: string[] = [];
    for (let i = 0; i < m.arena.gates.length; i++) out.push("forward(2)", "honk()");
    out.push(`forward(${m.arena.beacon.x - m.arena.gates.length * 2})`);
    return out.join("\n");
  },
  build: (seed) => {
    const r = rng(seed);
    const n = int(r, 3, 6);
    const tail = int(r, 1, 3);
    const beaconX = n * 2 + tail;
    const cols = beaconX + 2;
    const rows = 3;
    const row = 1;
    const gates = Array.from({ length: n }, (_, i) => ({
      pad: { x: (i + 1) * 2, y: row },
      gateCells: [{ x: (i + 1) * 2 + 1, y: row }],
      open: false,
    }));
    return {
      ...base(`drill-for-${seed}`, 3, "forloop"),
      title: "THE REAL LOOP",
      arena: { ...arenaOf(cols, rows, floor(cols, rows), { x: beaconX, y: row }), gates },
      start: { pos: { x: 0, y: row }, facing: "E" },
      starterCode: "// Same gates. Real for loop this time.\n",
      briefing: realLoop.brief,
      hints: [
        "You already know how to solve this with repeat. The moves don't change — only the way you write the loop does.",
        "A for loop says three things: where the count starts, how long to keep going, and how it grows each trip.",
        "for (let i = 0; i < ??? ; i++) {\n  forward(2)\n  honk()\n}\nforward( ??? )\nWhat number makes it run once per gate?",
      ],
      authorSolution: "",
    } as unknown as Mission;
  },
};

export const DRILLS: DrillFamily[] = [
  newGround, gateRun, wallDodge, pointBlank, barrelRun,
  bothWays, longHaul, realLoop, noCounting, everything, nameTheMove,
];

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
  for (let salt = 0; salt < 400 && out.length < family.fields; salt++) {
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
