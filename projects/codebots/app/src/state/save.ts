/**
 * Progress save — localStorage is the live store (bot.json is only the import/export format).
 * Everything reversible: this is the kid's campaign progress (cleared missions, stars, coins,
 * unlocked parts). Missing/corrupt storage falls back to a fresh save.
 */
import { earnedBadges, newlyEarned, type Badge } from "../content/badges";

export interface MissionProgress {
  cleared: boolean;
  stars: number;
}

export interface SaveData {
  missions: Record<string, MissionProgress>;
  coins: number;
  unlocked: string[];
  /** earned badge ids (see content/badges.ts) */
  badges: string[];
}

const KEY = "codebots.save.v1";

const FRESH: SaveData = { missions: {}, coins: 0, unlocked: [], badges: [] };

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...FRESH };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      missions: parsed.missions ?? {},
      coins: parsed.coins ?? 0,
      unlocked: parsed.unlocked ?? [],
      badges: parsed.badges ?? [],
    };
  } catch {
    return { ...FRESH };
  }
}

export function saveSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // storage full/blocked — progress just won't persist; the game stays playable.
  }
}

/**
 * Record a mission result. Coins are paid only for NEW stars (replays don't re-pay), matching
 * CONTENT_SPEC §3 (clear 10 C · each star 5 C). Returns the updated save + coins earned this run.
 */
export function recordResult(
  save: SaveData,
  missionId: string,
  stars: number,
  unlockPart: string | undefined,
): {
  save: SaveData;
  coinsEarned: number;
  firstClear: boolean;
  newlyUnlocked: string | null;
  newBadges: Badge[];
} {
  const prev = save.missions[missionId] ?? { cleared: false, stars: 0 };
  const firstClear = !prev.cleared;
  const newStars = Math.max(0, stars - prev.stars);
  const coinsEarned = (firstClear ? 10 : 0) + newStars * 5;

  let newlyUnlocked: string | null = null;
  const unlocked = [...save.unlocked];
  if (unlockPart && !unlocked.includes(unlockPart)) {
    unlocked.push(unlockPart);
    newlyUnlocked = unlockPart;
  }

  const next: SaveData = {
    missions: {
      ...save.missions,
      [missionId]: { cleared: true, stars: Math.max(prev.stars, stars) },
    },
    coins: save.coins + coinsEarned,
    unlocked,
    badges: save.badges,
  };
  // Badges are recomputed from the updated progress; new ones (not already recorded) are surfaced.
  const newBadges = newlyEarned(next);
  next.badges = earnedBadges(next);
  return { save: next, coinsEarned, firstClear, newlyUnlocked, newBadges };
}
