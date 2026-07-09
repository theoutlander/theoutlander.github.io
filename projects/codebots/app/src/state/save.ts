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
  // Signal the cloud-sync layer (if any) to push. No-op when there's no window / no account.
  if (typeof window !== "undefined") window.dispatchEvent(new Event("cb:saved"));
}

/**
 * Non-destructive "best of both" merge of two saves (local + cloud). Used when a kid logs in on
 * a new device: we never want a stale device to WIPE newer progress, so every field takes the
 * more-advanced value — cleared if either cleared, the higher star count per mission, the union
 * of unlocked parts + badges, and the max coins. Deterministic and order-independent.
 */
export function mergeSaves(a: SaveData, b: SaveData): SaveData {
  const missions: Record<string, MissionProgress> = {};
  for (const id of new Set([...Object.keys(a.missions), ...Object.keys(b.missions)])) {
    const ma = a.missions[id];
    const mb = b.missions[id];
    missions[id] = {
      cleared: !!(ma?.cleared || mb?.cleared),
      stars: Math.max(ma?.stars ?? 0, mb?.stars ?? 0),
    };
  }
  return {
    missions,
    coins: Math.max(a.coins, b.coins),
    unlocked: [...new Set([...a.unlocked, ...b.unlocked])],
    badges: [...new Set([...a.badges, ...b.badges])],
  };
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
