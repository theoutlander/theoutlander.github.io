/**
 * The house bots.
 *
 * They exist because an empty arena is worse than a bad one: until other kids publish, these are the
 * only opponents there are. But that only earns them their place if each one teaches a DIFFERENT idea
 * the kid has to out-code — and for a long time not one of them did.
 *
 * What was actually wrong (found by watching a fight, not by trusting a test):
 *
 *   - SNIPER FIRED ZERO SHOTS. Ever. It spun on the spot seven times and died. Its brain had no answer
 *     for "a rival is dead ahead but out of range", so it fell through to `right()` — forever. The
 *     test that should have caught this only pitted it against a NAIVE player, and against a naive
 *     player it lined up by luck. A test that only tries the easy case isn't a test.
 *
 *   - PATROLLER AND CHASER WERE THE SAME BOT in different paint: roll forward twice, then shoot every
 *     round until somebody dies. Nothing to out-think, and no reason to care which one you picked.
 *
 * Now each has exactly one weakness, and each weakness is a different thing to write:
 *
 *   PATROLLER  wanders; never comes looking          → you have to HUNT it
 *   SNIPER     out-ranges you, but made of glass     → break its line with a wall, then close
 *   CHASER     tanky, but must get close to hurt you → KITE it: back away and keep firing
 *
 * That last one was impossible until the sim learned `hurt()`. A bot had no way to know it was losing,
 * so retreating wasn't a hard strategy — it was an unwritable one, and the whole arena collapsed into
 * "whoever shoots first wins".
 */
export const BATTLE_API = [
  "forward", "back", "left", "right", "honk", "shoot",
  "blocked", "atBeacon", "targetAhead",
  // battle sensing. closerAhead() is what lets a bot HUNT. hurt() is what lets it RETREAT.
  "enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight", "hurt",
];

export interface Preset {
  id: string;
  name: string;
  desc: string;
  /** the bot's brain — an ordinary CodeBots program, in the same language the kid writes */
  source: string;
  /** How you beat it. A house bot that can't be beaten by an IDEA has no business being here. */
  weakness: string;
  stats?: { armor?: number; damage?: number; range?: number };
}

export const PRESETS: Preset[] = [
  {
    id: "patroller",
    name: "PATROLLER",
    stats: { range: 4, armor: 90 },
    desc: "Wanders the arena and shoots whatever strays into its sights. It will never come looking for you.",
    weakness: "It won't come to you — so go to it. closerAhead() tells you when rolling forward closes the gap.",
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
    stats: { range: 6, armor: 55 },
    desc: "Never moves. Sees further than you can shoot — but it's made of glass.",
    weakness: "It out-ranges you, so don't stroll down its lane. Put a wall between you, get close, then hit it. It dies fast.",
    // A turret that TURNS toward you and fires when lined up — and, crucially, HOLDS when you're dead
    // ahead but out of range, instead of spinning on the spot. That fall-through is what made it fire
    // zero shots in every real fight.
    source: [
      "while (true) {",
      "  if (enemyAhead()) {",
      "    shoot()",
      "  } else if (enemyLeft()) {",
      "    left()",
      "  } else if (enemyRight()) {",
      "    right()",
      "  } else {",
      "    honk()",
      "  }",
      "}",
    ].join("\n"),
  },
  {
    id: "chaser",
    name: "CHASER",
    stats: { range: 3, armor: 150 },
    desc: "Heavily armoured and relentless. It will run you down — but it has to get close to hurt you.",
    weakness: "It only shoots from 3 squares away. You shoot from 6. Back away while firing and it dies on the way in.",
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
