import type { SaveData } from "../state/save";
import { WORLDS, ALL } from "./missions";

/**
 * Badges certify what a kid has LEARNED and DONE — concept-mastery badges tie directly to the
 * construct a level teaches (clear the `if` level → earn Decider), so a badge is proof of learning,
 * not just points. Milestone badges reward finishing and mastering worlds. Every earn condition is
 * derivable from the save (cleared missions + stars), so no extra per-run tracking is needed.
 */
export type BadgeIcon =
  | "flag" | "loop" | "branch" | "target" | "fork" | "infinity" | "gear"
  | "world" | "crown" | "star" | "cap";

export interface Badge {
  id: string;
  title: string;
  /** what you did to earn it (kid-worded) */
  desc: string;
  kind: "concept" | "milestone";
  icon: BadgeIcon;
  earned: (s: SaveData) => boolean;
}

const cleared = (s: SaveData, id: string) => !!s.missions[id]?.cleared;
const stars = (s: SaveData, id: string) => s.missions[id]?.stars ?? 0;
const worldCleared = (s: SaveData, w: number) => WORLDS[w - 1].every((m) => cleared(s, m.id));
const worldPerfect = (s: SaveData, w: number) => WORLDS[w - 1].every((m) => stars(s, m.id) === 3);
const totalStars = (s: SaveData) => ALL.reduce((n, m) => n + stars(s, m.id), 0);

export const BADGES: Badge[] = [
  // ── concept mastery — earned by clearing the level that teaches the idea ──────
  { id: "first-program", title: "IGNITION", desc: "Ran your very first program", kind: "concept", icon: "flag",
    earned: (s) => cleared(s, "w1m1") },
  { id: "looper", title: "LOOPER", desc: "Used repeat to do a move many times", kind: "concept", icon: "loop",
    earned: (s) => cleared(s, "w1m5") },
  { id: "decider", title: "DECIDER", desc: "Wrote your first if — the bot can decide", kind: "concept", icon: "branch",
    earned: (s) => cleared(s, "w2m1") },
  { id: "sharpshooter", title: "SHARPSHOOTER", desc: "Blasted a barrel with shoot()", kind: "concept", icon: "target",
    earned: (s) => cleared(s, "w2m2s") },
  { id: "both-ways", title: "BOTH WAYS", desc: "Handled two paths with if / else", kind: "concept", icon: "fork",
    earned: (s) => cleared(s, "w2m3") },
  { id: "never-quit", title: "NEVER QUIT", desc: "Looped with while until the job was done", kind: "concept", icon: "infinity",
    earned: (s) => cleared(s, "w3m1") },
  { id: "toolmaker", title: "TOOLMAKER", desc: "Built your own command with a function", kind: "concept", icon: "gear",
    earned: (s) => cleared(s, "w4m1") },

  // ── milestones — finishing and mastering ─────────────────────────────────────
  { id: "world-1", title: "FIRST ROLL", desc: "Cleared all of World 1", kind: "milestone", icon: "world",
    earned: (s) => worldCleared(s, 1) },
  { id: "world-2", title: "EYES OPEN", desc: "Cleared all of World 2", kind: "milestone", icon: "world",
    earned: (s) => worldCleared(s, 2) },
  { id: "world-3", title: "NEVER GIVE UP", desc: "Cleared all of World 3", kind: "milestone", icon: "world",
    earned: (s) => worldCleared(s, 3) },
  { id: "world-4", title: "BUILD YOUR OWN", desc: "Cleared all of World 4", kind: "milestone", icon: "world",
    earned: (s) => worldCleared(s, 4) },
  { id: "perfectionist", title: "PERFECTIONIST", desc: "Earned all 3 stars in a whole world", kind: "milestone", icon: "crown",
    earned: (s) => [1, 2, 3, 4].some((w) => worldPerfect(s, w)) },
  { id: "star-collector", title: "STAR COLLECTOR", desc: "Collected 25 stars", kind: "milestone", icon: "star",
    // The campaign is 11 levels now, so 33 stars is a perfect run. A 50-star badge would be a
    // promise no child could ever keep — worse than no badge at all.
    earned: (s) => totalStars(s) >= 25 },
  { id: "graduate", title: "GRADUATE", desc: "Cleared every level", kind: "milestone", icon: "cap",
    earned: (s) => ALL.every((m) => cleared(s, m.id)) },
];

/** All badge ids the current save has earned. */
export function earnedBadges(save: SaveData): string[] {
  return BADGES.filter((b) => b.earned(save)).map((b) => b.id);
}

/** Badges newly earned vs. what the save already recorded (for the "NEW BADGE" pop). */
export function newlyEarned(save: SaveData): Badge[] {
  const have = new Set(save.badges ?? []);
  return BADGES.filter((b) => b.earned(save) && !have.has(b.id));
}

export function badgeById(id: string): Badge | undefined {
  return BADGES.find((b) => b.id === id);
}
