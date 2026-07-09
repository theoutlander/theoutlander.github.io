/**
 * Teaching content for each NEW idea the campaign introduces. A concept card appears the first
 * time a construct debuts (keyed by world+level) so the kid learns the IDEA — not just the syntax —
 * before writing it. Kept deliberately short (one-sentence idea + a worked example + when-to-use);
 * the deeper "when do I reach for THIS?" skill is built by the no-hints transfer level in each world.
 */
export interface Concept {
  /** stable id, used for the "already seen" localStorage flag so replays show it collapsed */
  key: string;
  world: number;
  /** the level index (1–6) within that world where this idea debuts */
  level: number;
  title: string;
  /** one or two sentences, kid language — the IDEA, not the syntax */
  idea: string;
  /** a tiny worked example (may be multiline) */
  example: string;
  /** plain-English gloss of what the example does */
  exampleNote?: string;
  /** the discrimination skill: when would you reach for this? */
  whenToUse: string;
  /** a short program the "WATCH IT" button runs in the arena to SHOW the idea (never clears). */
  demoCode?: string;
}

export const CONCEPTS: Concept[] = [
  {
    key: "sequencing", world: 1, level: 1, title: "STEP BY STEP",
    idea: "You don't steer the bot — you write ALL its moves first, then press RUN and it drives itself. It does exactly what you wrote, one line at a time, top to bottom. Nothing more, nothing less.",
    example: "forward(2)\nleft()\nforward(3)",
    exampleNote: "roll 2, turn, roll 3 — in that order, all by itself",
    whenToUse: "Always. Every program is a list of steps, written before the bot moves.",
    demoCode: "forward(2)\nleft()\nforward(1)",
  },
  {
    key: "repeat", world: 1, level: 3, title: "REPEAT",
    idea: "Doing the same thing over and over? Write it once inside repeat and it runs that many times.",
    example: "repeat 4 {\n  forward(1)\n  right()\n}",
    exampleNote: "forward + turn, four times",
    whenToUse: "When you know HOW MANY times — you can count them.",
    demoCode: "repeat 3 {\n  forward(1)\n}",
  },
  {
    key: "deciding", world: 2, level: 1, title: "DECIDING",
    idea: "A sensor asks a yes/no question. blocked() asks “is there a wall right in front of me?” — and if lets your bot decide what to do with the answer.",
    example: "if (blocked()) {\n  right()\n}",
    exampleNote: "IF there's a wall, turn right",
    whenToUse: "When the bot must choose what to do based on what it finds.",
    demoCode: "forward(3)\nif (blocked()) {\n  honk()\n}",
  },
  {
    key: "shoot", world: 2, level: 2, title: "THE BLASTER",
    idea: "shoot() fires straight ahead and smashes the first barrel in front of you. When you can SEE a barrel in your lane, just fire.",
    example: "shoot()\nforward(3)",
    exampleNote: "blast the barrel, then roll on",
    whenToUse: "When a barrel is blocking your path and you can see it's there.",
    demoCode: "shoot()\nforward(1)",
  },
  {
    key: "targetahead", world: 2, level: 3, title: "SPOT THE BARREL",
    idea: "targetAhead() is a yes/no sensor: is a barrel right in front of me? Use it so your loop shoots only WHEN there's something to hit — not blindly.",
    example: "if (targetAhead()) {\n  shoot()\n}",
    exampleNote: "IF a barrel's ahead, blast it",
    whenToUse: "When you're looping down a lane and don't know which squares have barrels.",
    demoCode: "if (targetAhead()) {\n  shoot()\n}",
  },
  {
    key: "orelse", world: 2, level: 3, title: "OR ELSE",
    idea: "else is the OTHER path. Do one thing when the answer is yes, and something different when it's no.",
    example: "if (blocked()) {\n  right()\n} else {\n  forward(1)\n}",
    exampleNote: "wall? turn. no wall? drive on.",
    whenToUse: "When there are two choices and you want one OR the other.",
    demoCode: "if (blocked()) {\n  honk()\n} else {\n  forward(1)\n}",
  },
  {
    key: "arrived", world: 2, level: 4, title: "AM I THERE?",
    idea: "atBeacon() is a yes/no sensor: are you standing on the goal yet?",
    example: "if (atBeacon()) {\n  honk()\n}",
    exampleNote: "the moment you arrive, honk",
    whenToUse: "When you want to do something the instant you reach the goal.",
    demoCode: "forward(1)\nif (atBeacon()) {\n  honk()\n}",
  },
  {
    key: "keepgoing", world: 3, level: 1, title: "KEEP GOING",
    idea: "while repeats AS LONG AS something stays true. The ! means “not”, so while (!atBeacon()) means “keep going until you get there.”",
    example: "while (!atBeacon()) {\n  forward(1)\n}",
    exampleNote: "drive until you reach the goal",
    whenToUse: "When you DON'T know how many times. You can't count it — so loop until a test says stop.",
    // No demo: any while snippet that visibly loops in this open lane would drive onto the beacon
    // and give the answer away. The example above carries the idea instead.
  },
  {
    key: "chain", world: 3, level: 5, title: "CHAIN OF CHOICES",
    idea: "else if lets you ask a SECOND question when the first was no. The checks run top to bottom — the first one that's true wins, and the rest are skipped.",
    example: "if (targetAhead()) {\n  shoot()\n} else if (blocked()) {\n  right()\n} else {\n  forward(1)\n}",
    exampleNote: "barrel? shoot. else wall? turn. else just drive.",
    whenToUse: "When there are MORE than two choices — chain the checks in order of priority.",
  },
  {
    key: "functions", world: 4, level: 1, title: "YOUR OWN COMMANDS",
    idea: "A function gives a NAME to a bunch of moves. Build it once, then call it by name as many times as you want.",
    example: "function stair() {\n  forward(1)\n  right()\n}\nstair()",
    exampleNote: "name the move ‘stair’, then use it",
    whenToUse: "When you use the same moves again and again — name them once, reuse everywhere.",
    demoCode: "forward(1)\nright()\nforward(1)\nleft()",
  },
];

/** The concept introduced on a given level, if any. */
export function conceptFor(world: number, level: number): Concept | undefined {
  return CONCEPTS.find((c) => c.world === world && c.level === level);
}
