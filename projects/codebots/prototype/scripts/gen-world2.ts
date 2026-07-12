/**
 * Builds the six World 2 missions (sensors, if/else, shoot) as JSON. Generating them from a small
 * DSL beats hand-typing 40-cell arrays: fewer coordinate typos, and the arena reads like a picture.
 * Run: npx tsx scripts/gen-world2.ts   then   npx tsx scripts/verify.ts content/missions/world2/*.json
 */
import { writeFileSync, mkdirSync } from "node:fs";

type Cell = "floor" | "wall" | "mud" | "pit" | "water";
const V = (x: number, y: number) => ({ x, y });

function grid(cols: number, rows: number): Cell[][] {
  return Array.from({ length: rows }, () => Array<Cell>(cols).fill("floor"));
}

interface Build {
  id: string; index: number; title: string; teaches: string;
  cols: number; rows: number;
  walls?: [number, number][]; mud?: [number, number][];
  crates?: [number, number][]; targets?: [number, number][];
  start: { x: number; y: number; facing: "N" | "E" | "S" | "W" };
  beacon: [number, number]; beaconStyle?: "beacon" | "chest";
  parLines: number; starterCode: string; hints: [string, string, string];
  briefing: string; authorSolution: string;
  bonus: { kind: "zeroBumps" } | { kind: "honkOnBeacon" } | { kind: "exactHonks"; count: number };
  unlock?: { part: string; cost: number };
}

function build(b: Build) {
  const cells = grid(b.cols, b.rows);
  for (const [x, y] of b.walls ?? []) cells[y][x] = "wall";
  for (const [x, y] of b.mud ?? []) cells[y][x] = "mud";
  const mission = {
    id: b.id, world: 2, index: b.index, title: b.title, teaches: b.teaches,
    arena: {
      cols: b.cols, rows: b.rows, cells,
      crates: (b.crates ?? []).map(([x, y]) => V(x, y)),
      coins: [],
      chests: [],
      gates: [],
      targets: (b.targets ?? []).map(([x, y]) => V(x, y)),
      beacon: V(b.beacon[0], b.beacon[1]),
      ...(b.beaconStyle ? { beaconStyle: b.beaconStyle } : {}),
    },
    start: { pos: V(b.start.x, b.start.y), facing: b.start.facing },
    parLines: b.parLines,
    starterCode: b.starterCode,
    hints: b.hints,
    briefing: b.briefing,
    authorSolution: b.authorSolution,
    bonusStar: b.bonus,
    ...(b.unlock ? { unlock: b.unlock } : {}),
  };
  return mission;
}

const missions: Build[] = [
  // ── L1 — blocked() + if ────────────────────────────────────────────────────
  {
    id: "w2m1", index: 1, title: "FIRST LOOK", teaches: "blocked() + if",
    cols: 8, rows: 5,
    walls: [[4, 2]],
    start: { x: 0, y: 2, facing: "E" }, beacon: [7, 2],
    parLines: 12,
    starterCode: "// New gadget: blocked() tells you if something's in the way.\n// Roll up to the wall, then go around it.\nforward(3)\n",
    hints: [
      "Look down the lane the bot is standing in. Something is parked between the bot and the beacon. What happens if the bot keeps rolling without ever checking?",
      "The scanner only feels the one square right in front of the bot, so the bot has to be nose-to-nose with the wall before it can sense it. Roll up close, ask the scanner, and only step off the lane when the answer comes back yes — then find your way back into the beacon's lane.",
      "Shape it like this and fill in the blanks:\nforward(3)\nif ( ??? ) {\n  ???   // the moves that carry the bot around the wall and back into the lane\n}\nforward(2)",
    ],
    briefing: "New chip installed: a SCANNER. blocked() looks one square ahead and says yes or no. Use it with if to go around Sprocket's wall — no crashing.",
    authorSolution: "forward(3)\nif (blocked()) {\n  left()\n  forward(1)\n  right()\n  forward(2)\n  right()\n  forward(1)\n  left()\n}\nforward(2)",
    bonus: { kind: "zeroBumps" },
    unlock: { part: "SCANNER", cost: 0 },
  },
  // ── L2 — shoot() ALONE (a barrel you can see is dead ahead) ────────────────
  {
    id: "w2m2s", index: 2, title: "TAKE THE SHOT", teaches: "shoot()",
    cols: 8, rows: 3,
    targets: [[2, 1], [4, 1]],
    start: { x: 0, y: 1, facing: "E" }, beacon: [7, 1],
    parLines: 4,
    starterCode: "// New gear: a BLASTER. shoot() fires straight ahead and smashes a barrel.\n// The barrels are right in your lane — blast them and roll on.\n",
    hints: [
      "Both barrels are sitting in the same lane as the bot. Count the squares: how far is the bot from the first barrel, and how far is that barrel from the next one?",
      "The blaster reaches all the way down the lane, so the bot can fire from where it stands — no need to drive up close first. Clear a barrel, drive until the next one is the thing lined up ahead, clear that one, then finish the drive.",
      "Shape it like this and work out the blanks by counting squares:\nshoot()\nforward( ??? )\nshoot()\nforward( ??? )",
    ],
    briefing: "Your new BLASTER clears the way. See a barrel in your lane? shoot() smashes it. No sensors yet — just aim down the runway and fire.",
    authorSolution: "shoot()\nforward(2)\nshoot()\nforward(5)",
    bonus: { kind: "zeroBumps" },
    unlock: { part: "BLASTER", cost: 0 },
  },
  // ── L3 — targetAhead() (know WHEN to shoot, in a loop) ─────────────────────
  {
    id: "w2m2", index: 3, title: "BLAST IT", teaches: "targetAhead()",
    cols: 8, rows: 3,
    targets: [[2, 1], [5, 1]],
    start: { x: 0, y: 1, facing: "E" }, beacon: [7, 1],
    parLines: 6,
    starterCode: "// New sensor: targetAhead() tells you when a barrel is right ahead —\n// so your loop knows WHEN to shoot instead of firing blindly.\n",
    hints: [
      "The barrels are not spread evenly this time. Writing out every shot by hand means counting squares perfectly, and one bad count and the shot flies past. Could every square be handled by the same set of instructions instead?",
      "Give the bot one small routine and run it on every square of the lane: sense whether a barrel is lined up ahead, fire only if the answer is yes, then take a single step. A sensor decides the shot for you, so you never have to count where the barrels are.",
      "Shape it like this and fill in the blanks:\nrepeat ??? {\n  if ( ??? ) {\n    shoot()\n  }\n  forward(1)\n}\nOne blank is the sensor to ask. The other is how many times the routine has to run to cover the whole lane.",
    ],
    briefing: "More barrels — but firing blindly wastes shots. targetAhead() is a yes/no sensor: it tells you when a barrel's right in front. Check it, then shoot only when you need to.",
    authorSolution: "repeat 7 {\n  if (targetAhead()) {\n    shoot()\n  }\n  forward(1)\n}",
    bonus: { kind: "zeroBumps" },
  },
  // ── L3 — if / else ─────────────────────────────────────────────────────────
  {
    id: "w2m3", index: 4, title: "THIS WAY OR THAT", teaches: "if / else",
    cols: 8, rows: 5,
    walls: [[4, 2]],
    start: { x: 0, y: 2, facing: "E" }, beacon: [7, 2],
    parLines: 14,
    starterCode: "// if does something WHEN true. else does something when it's NOT.\nforward(3)\n",
    hints: [
      "The bot cannot see the far end of the lane from the start line. Two things could be true when it gets there: the way ahead is blocked, or the way ahead is clear. What should the bot do in each of those two cases?",
      "Write both plans, not one. One plan for a blocked lane: leave the lane, slip past the obstacle, and come back into the lane so the bot still lines up with the beacon. One plan for a clear lane: keep rolling. The bot senses, then picks the plan that matches.",
      "Shape it like this and fill in the three blanks:\nforward(3)\nif ( ??? ) {\n  ???   // the detour\n} else {\n  ???   // the clear road\n}\nforward(2)\nWhichever plan runs, the bot has to end up in the same lane, still pointed at the beacon.",
    ],
    briefing: "Sometimes the road's clear, sometimes it's not. if handles the blocked road; else handles the open one. Teach Sparkplug to do both.",
    authorSolution: "forward(3)\nif (blocked()) {\n  right()\n  forward(1)\n  left()\n  forward(2)\n  left()\n  forward(1)\n  right()\n} else {\n  forward(2)\n}\nforward(2)",
    bonus: { kind: "zeroBumps" },
  },
  // ── L4 — atBeacon() ────────────────────────────────────────────────────────
  {
    id: "w2m4", index: 5, title: "ARE WE THERE YET", teaches: "atBeacon()",
    cols: 8, rows: 3,
    mud: [[3, 1]],
    start: { x: 0, y: 1, facing: "E" }, beacon: [6, 1],
    parLines: 6,
    starterCode: "// atBeacon() is yes/no: are you standing on the goal yet?\n",
    hints: [
      "The horn has to sound while the bot is standing on the goal, not one square early and not one square late. Counting squares would work here, but it breaks the moment the goal moves. Is there a way for the bot to know it has arrived?",
      "Let the bot ask, after every single step it takes, whether it is standing on the goal, and sound the horn only on the step where the answer is yes. That way the bot finds the goal instead of you telling it where the goal is.",
      "Shape it like this and fill in the blanks:\nrepeat ??? {\n  forward(1)\n  if ( ??? ) {\n    honk()\n  }\n}\nOne blank is the sensor. The other is how many steps it takes to reach the goal — too many and the bot rolls straight past it.",
    ],
    briefing: "Learn to KNOW when you've arrived. Roll forward, and each step ask atBeacon(). When it's yes, sound the horn right on the goal.",
    authorSolution: "repeat 6 {\n  forward(1)\n  if (atBeacon()) {\n    honk()\n  }\n}",
    bonus: { kind: "honkOnBeacon" },
  },
  // ── L5 — combine: if/else with shoot in a loop ─────────────────────────────
  {
    id: "w2m5", index: 6, title: "MIXED BAG", teaches: "if / else + shoot",
    cols: 8, rows: 3,
    targets: [[3, 1], [6, 1]],
    start: { x: 0, y: 1, facing: "E" }, beacon: [7, 1],
    parLines: 7,
    starterCode: "// Put it together: if there's a barrel, shoot it — otherwise, drive on.\n",
    hints: [
      "Some squares in the lane have a barrel in front of them and some are wide open. Does the bot need to do the same thing on both kinds of square?",
      "Before every move, have the bot ask whether a barrel is lined up ahead. Fire only when there is one, because a wasted shot moves the bot nowhere. When the lane ahead is clear, that is the moment to roll. Two different actions, one sensor choosing between them.",
      "Shape it like this and fill in the blanks:\nrepeat ??? {\n  if ( ??? ) {\n    ???\n  } else {\n    ???\n  }\n}\nThe two actions are 'clear the barrel' and 'take a step' — you work out which one belongs in which branch. And remember: a turn spent shooting is a turn the bot did not move, so it needs more turns than there are squares.",
    ],
    briefing: "Two barrels, some open road. Each turn: if a barrel's ahead, blast it; else roll forward. One tidy loop clears the lot.",
    authorSolution: "repeat 9 {\n  if (targetAhead()) {\n    shoot()\n  } else {\n    forward(1)\n  }\n}",
    bonus: { kind: "zeroBumps" },
  },
  // ── L6 — BOSS: the gauntlet ────────────────────────────────────────────────
  {
    id: "w2m6", index: 7, title: "SPROCKET'S GAUNTLET", teaches: "everything: sense, shoot, decide",
    cols: 10, rows: 6,
    walls: [[6, 5], [6, 4], [6, 3], [6, 2]],
    targets: [[3, 5], [8, 1]],
    start: { x: 0, y: 5, facing: "E" }, beacon: [9, 0], beaconStyle: "chest",
    // Par must match the solution written the way a KID writes it (multi-line blocks), not crammed
    // onto one line — otherwise good, readable code loses the star.
    parLines: 15,
    starterCode: "// The gauntlet: barrels to blast, a wall to round, treasure at the top.\n// Sense before you act.\n",
    hints: [
      "Trace the whole route with a finger before writing anything. There is one barrel in the bottom row and another one waiting over near the treasure, and the tall wall in the middle does not reach all the way to the top of the grid.",
      "Deal with the bottom barrel, roll up to the wall, then climb alongside it until the bot is past where the wall stops. Turn back toward the treasure, handle the second barrel the same way you handled the first, and finish on the chest.",
      "It is the same little pattern twice, with driving and turning in between:\nif ( ??? ) {\n  shoot()\n}\nEvery forward( ??? ) count and every turn is a blank. Walk the squares on the grid with your finger and write the counts down before you type them.",
    ],
    briefing: "Sprocket's final trap: barrels AND a wall between you and the treasure. Use everything — blocked(), targetAhead(), shoot() — to reach the chest.",
    authorSolution: [
      "forward(2)",
      "if (targetAhead()) {",
      "  shoot()",
      "}",
      "forward(3)",
      "left()",
      "forward(4)",
      "right()",
      "forward(2)",
      "if (targetAhead()) {",
      "  shoot()",
      "}",
      "forward(2)",
      "left()",
      "forward(1)",
    ].join("\n"),
    bonus: { kind: "zeroBumps" },
  },
];

mkdirSync(new URL("../content/missions/world2/", import.meta.url), { recursive: true });
for (const b of missions) {
  const m = build(b);
  const path = new URL(`../content/missions/world2/${b.id}.json`, import.meta.url);
  writeFileSync(path, JSON.stringify(m, null, 2) + "\n");
  console.log(`wrote ${b.id}.json`);
}
