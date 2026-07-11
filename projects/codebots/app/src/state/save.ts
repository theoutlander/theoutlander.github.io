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

/** What the kid has built in the Garage. Capability parts come from `unlocked` (learning); `bought`
 *  is what coins have paid for; `equipped` is the current loadout (only bites in the Arena). */
export interface Loadout {
  chassis: string;
  equipped: string[];
  bought: string[];
}

export const FRESH_LOADOUT: Loadout = { chassis: "scout", equipped: [], bought: [] };

export interface SaveData {
  missions: Record<string, MissionProgress>;
  coins: number;
  unlocked: string[];
  /** earned badge ids (see content/badges.ts) */
  badges: string[];
  loadout: Loadout;
  /** PROVE IT drills passed (see content/drills.ts) — one program, three random fields */
  drillsPassed?: string[];
}

const KEY = "codebots.save.v1";

const FRESH: SaveData = { missions: {}, coins: 0, unlocked: [], badges: [], loadout: { ...FRESH_LOADOUT } };

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...FRESH, loadout: { ...FRESH_LOADOUT } };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      missions: parsed.missions ?? {},
      coins: parsed.coins ?? 0,
      unlocked: parsed.unlocked ?? [],
      badges: parsed.badges ?? [],
      loadout: { ...FRESH_LOADOUT, ...(parsed.loadout ?? {}) },
    };
  } catch {
    return { ...FRESH, loadout: { ...FRESH_LOADOUT } };
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
  // Loadout: never lose a purchase. Bought parts union; keep the frame with the most slots; keep
  // whichever loadout has more equipped (an empty one never wipes a built bot).
  const la = a.loadout ?? FRESH_LOADOUT;
  const lb = b.loadout ?? FRESH_LOADOUT;
  const bought = [...new Set([...la.bought, ...lb.bought])];
  const chassis = slotsOf(la.chassis) >= slotsOf(lb.chassis) ? la.chassis : lb.chassis;
  const equipped = la.equipped.length >= lb.equipped.length ? la.equipped : lb.equipped;

  return {
    missions,
    coins: Math.max(a.coins, b.coins),
    unlocked: [...new Set([...a.unlocked, ...b.unlocked])],
    badges: [...new Set([...a.badges, ...b.badges])],
    drillsPassed: [...new Set([...(a.drillsPassed ?? []), ...(b.drillsPassed ?? [])])],
    loadout: { chassis, equipped, bought },
  };
}

// Kept local (not imported from content/parts) so save.ts stays free of content deps.
const CHASSIS_SLOTS: Record<string, number> = { scout: 2, ranger: 3, hauler: 4 };
const slotsOf = (id: string) => CHASSIS_SLOTS[id] ?? 0;

/** Spend coins on a chassis. Returns null if it can't be afforded / already owned. */
export function buyChassis(save: SaveData, id: string, cost: number): SaveData | null {
  if (save.loadout.chassis === id || save.coins < cost) return null;
  return { ...save, coins: save.coins - cost, loadout: { ...save.loadout, chassis: id } };
}

/** Spend coins on a part. Returns null if it can't be afforded / already owned. */
export function buyPart(save: SaveData, id: string, cost: number): SaveData | null {
  if (save.loadout.bought.includes(id) || save.coins < cost) return null;
  return {
    ...save,
    coins: save.coins - cost,
    loadout: { ...save.loadout, bought: [...save.loadout.bought, id] },
  };
}

/** Equip / unequip a part (no coin cost). */
export function toggleEquip(save: SaveData, id: string): SaveData {
  const on = save.loadout.equipped.includes(id);
  const equipped = on ? save.loadout.equipped.filter((p) => p !== id) : [...save.loadout.equipped, id];
  return { ...save, loadout: { ...save.loadout, equipped } };
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
    loadout: save.loadout,
  };
  // Badges are recomputed from the updated progress; new ones (not already recorded) are surfaced.
  const newBadges = newlyEarned(next);
  next.badges = earnedBadges(next);
  return { save: next, coinsEarned, firstClear, newlyUnlocked, newBadges };
}

/**
 * Stars earned, once the help ladder is taken into account.
 *
 * A kid who takes the answer still CLEARS — being stuck must never be a dead end, or she closes the
 * tab and we never hear from her again. But the clear caps at one star. That keeps the stars honest
 * (three stars means "I worked this out"), and it leaves her a reason to come back and beat the level
 * for real. Never let taking the answer be strictly better than not taking it.
 */
export function starsAfterHelp(earned: number, solutionUsed: boolean): number {
  return solutionUsed ? Math.min(1, earned) : earned;
}
