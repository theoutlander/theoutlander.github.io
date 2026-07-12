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

import { FRESH_LOADOUT, type Loadout } from "../content/parts";
export { FRESH_LOADOUT };
export type { Loadout };

export interface SaveData {
  missions: Record<string, MissionProgress>;
  coins: number;
  unlocked: string[];
  /** earned badge ids (see content/badges.ts) */
  badges: string[];
  loadout: Loadout;
  /** PROVE IT drills passed (see content/drills.ts) — one program, three random fields */
  drillsPassed?: string[];
  /** finished the FIRST STEPS storybook — she's met code, commands, brackets, numbers and capitals */
  firstStepsDone?: boolean;
  /** "I already know how to code" — every room open, no ramp. For older kids and returning players. */
  skipAhead?: boolean;
  /** the program she last published, so we can fight it for her while she's away */
  publishedSource?: string;
  /** rivals she's already been told about (id → fingerprint of their code). Stops us reporting the
   *  same "new challenger!" every single time she opens the game, which is how a return hook turns
   *  into noise she learns to ignore. */
  seenRivals?: Record<string, string>;
}

const KEY = "codebots.save.v1";

function migrateLoadout(raw: unknown): Loadout {
  const l = (raw ?? {}) as Partial<Loadout> & { chassis?: string };
  const owned = Array.isArray(l.owned) && l.owned.length ? l.owned : ["scout"];
  const kit = typeof l.kit === "string" && owned.includes(l.kit) ? l.kit : "scout";
  return { kit, owned: [...new Set(["scout", ...owned])] };
}

const FRESH: SaveData = { missions: {}, coins: 0, unlocked: [], badges: [], loadout: { ...FRESH_LOADOUT } };

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...FRESH, loadout: { ...FRESH_LOADOUT } };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    // Every field must be listed here. This function whitelists what it reads back, so a field added
    // to SaveData and written by saveSave() but forgotten HERE is silently dropped on every load —
    // it persists to disk and then evaporates. That bug shipped: firstStepsDone (so the game forgot
    // she'd ever done the tutorial), drillsPassed (so the same drill could be re-farmed for coins
    // forever), and skipAhead (so "unlock everything" did nothing) were all being written and thrown
    // straight away. If you add a field to SaveData, add it here too — tests/state/save-roundtrip
    // will fail if you don't.
    return {
      missions: parsed.missions ?? {},
      coins: parsed.coins ?? 0,
      unlocked: parsed.unlocked ?? [],
      badges: parsed.badges ?? [],
      // The garage used to be chassis + slots + weights. Anyone mid-flight has that shape saved, and
      // a kid opening the game to a crash because we changed our minds is unacceptable. Old saves fall
      // back to the stock kit and keep every coin they earned.
      loadout: migrateLoadout(parsed.loadout),
      drillsPassed: parsed.drillsPassed ?? [],
      firstStepsDone: parsed.firstStepsDone ?? false,
      skipAhead: parsed.skipAhead ?? false,
      publishedSource: parsed.publishedSource,
      seenRivals: parsed.seenRivals ?? {},
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
  // Loadout: never lose a purchase. Two devices, two kits — she keeps both, and drives whichever she
  // was last driving on the more-advanced save.
  const la = a.loadout ?? FRESH_LOADOUT;
  const lb = b.loadout ?? FRESH_LOADOUT;
  const owned = [...new Set([...(la.owned ?? []), ...(lb.owned ?? []), "scout"])];
  const kit = owned.includes(la.kit) ? la.kit : lb.kit;

  return {
    missions,
    coins: Math.max(a.coins, b.coins),
    unlocked: [...new Set([...a.unlocked, ...b.unlocked])],
    badges: [...new Set([...a.badges, ...b.badges])],
    drillsPassed: [...new Set([...(a.drillsPassed ?? []), ...(b.drillsPassed ?? [])])],
    firstStepsDone: a.firstStepsDone || b.firstStepsDone,
    skipAhead: a.skipAhead || b.skipAhead,
    publishedSource: a.publishedSource ?? b.publishedSource,
    seenRivals: { ...(b.seenRivals ?? {}), ...(a.seenRivals ?? {}) },
    loadout: { kit, owned },
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
