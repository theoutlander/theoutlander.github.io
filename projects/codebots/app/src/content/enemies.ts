/**
 * Preset enemy brains for battles. Each is just a program in the same language the kid writes — so
 * "publish your bot" (Phase 2 PvP) drops a player's program into this exact slot. Kept deliberately
 * simple and readable: a kid can beat them by out-thinking them, and later read them to learn.
 */
export const BATTLE_API = [
  "forward", "back", "left", "right", "honk", "shoot",
  "blocked", "atBeacon", "targetAhead",
  // battle sensing. closerAhead() is the one that lets a bot actually HUNT: without it a bot can
  // only see a rival perfectly lined up on a row/column, so it spins in place and never engages.
  "enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight",
];

export interface Preset {
  id: string;
  name: string;
  desc: string;
  /** the bot's brain — a normal CodeBots program */
  source: string;
  /** Enemies see SHORTER than you (range 4 vs your 6). That's the tactical lesson the whole arena
   *  teaches: shoot the moment you can see it — don't walk into its face. A kid who codes
   *  `if (enemyAhead()) shoot()` wins; one who charges blindly gets wrecked. */
  stats?: { armor?: number; damage?: number; range?: number };
}

export const PRESETS: Preset[] = [
  {
    id: "patroller",
    name: "PATROLLER",
    stats: { range: 4 },
    desc: "Roams the arena. It'll take a shot if you wander into its sights, but it won't come looking.",
    // Wanders; fires only if you happen to line up. The gentle one — a fair first fight.
    source: [
      "while (true) {",
      "  if (enemyAhead()) {",
      "    shoot()",
      "  } else if (blocked()) {",
      "    right()",
      "  } else {",
      "    forward(1)",
      "  }",
      "}",
    ].join("\n"),
  },
  {
    id: "sniper",
    name: "SNIPER",
    stats: { range: 5 },
    desc: "Holds its ground and tracks you. The moment you line up with it, it fires.",
    // Turret: never moves, but TURNS TOWARD you (enemyLeft/enemyRight) so it can actually line up.
    source: [
      "while (true) {",
      "  if (enemyAhead()) {",
      "    shoot()",
      "  } else if (enemyLeft()) {",
      "    left()",
      "  } else if (enemyRight()) {",
      "    right()",
      "  } else {",
      "    right()",
      "  }",
      "}",
    ].join("\n"),
  },
  {
    id: "chaser",
    name: "CHASER",
    stats: { range: 4, armor: 120 },
    desc: "Hunts you down. It closes the distance and shoots the second it has a clear line.",
    // Greedy pursuit: fire if lined up, else move whenever forward gets it CLOSER, else turn.
    source: [
      "while (true) {",
      "  if (enemyAhead()) {",
      "    shoot()",
      "  } else if (closerAhead()) {",
      "    forward(1)",
      "  } else if (enemyLeft()) {",
      "    left()",
      "  } else {",
      "    right()",
      "  }",
      "}",
    ].join("\n"),
  },
];

export function presetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
