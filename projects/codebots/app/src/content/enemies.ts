/**
 * Preset enemy brains for battles. Each is just a program in the same language the kid writes — so
 * "publish your bot" (Phase 2 PvP) drops a player's program into this exact slot. Kept deliberately
 * simple and readable: a kid can beat them by out-thinking them, and later read them to learn.
 */
export const BATTLE_API = [
  "forward", "back", "left", "right", "honk", "shoot",
  "blocked", "atBeacon", "targetAhead", "enemyAhead", "enemyNear",
];

export interface Preset {
  id: string;
  name: string;
  desc: string;
  /** the bot's brain — a normal CodeBots program */
  source: string;
}

export const PRESETS: Preset[] = [
  {
    id: "patroller",
    name: "PATROLLER",
    desc: "Roams the arena following walls. Harmless unless you get in its way.",
    // wall-follower: never attacks, just wanders
    source: "while (!atBeacon()) {\n  if (blocked()) { right() } else { forward(1) }\n}",
  },
  {
    id: "sniper",
    name: "SNIPER",
    desc: "Holds its spot and sweeps its aim. Fires the moment you're in its line.",
    // turret: rotate scanning, shoot when it sees you
    source: "while (!atBeacon()) {\n  if (enemyAhead()) { shoot() } else { left() }\n}",
  },
  {
    id: "chaser",
    name: "CHASER",
    desc: "Hunts you down — turns until it spots you, then charges and shoots.",
    // seeker: rotate to face you, then close in and fire
    source: "while (!atBeacon()) {\n  if (enemyAhead()) { shoot(); forward(1) } else { right() }\n}",
  },
];

export function presetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
