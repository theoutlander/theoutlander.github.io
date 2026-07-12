import { standings, type Fighter, type Standing } from "./league";
import { fingerprint } from "./away";

/**
 * THE LADDER, WITHOUT REPLAYING HUNDREDS OF TINY FIGHTS EVERY TIME THE HUB OPENS.
 *
 * standings() is O(n²) matchups × BOARDS_PER_MATCH — honest, but not something to redo on every
 * mount. It only needs to change when the roster actually changes (someone published or edited a
 * bot) or when the season rolls over (Friday), so this caches the result in localStorage keyed by
 * exactly those two things, and keeps one prior snapshot around for trend arrows and "since you were
 * last here" comparisons.
 */

const KEY = "codebots.league.v1";

/** Buckets by the most recent Friday-00:00-UTC boundary, so boards rotate Fridays without a
 *  hardcoded reference date to keep in sync. */
export function seasonToken(now: Date = new Date()): string {
  const ms = now.getTime();
  const day = now.getUTCDay(); // 0=Sun..6=Sat
  const msSinceFriday =
    ((day - 5 + 7) % 7) * 86400000 +
    now.getUTCHours() * 3600000 +
    now.getUTCMinutes() * 60000 +
    now.getUTCSeconds() * 1000 +
    now.getUTCMilliseconds();
  const fridayBoundary = ms - msSinceFriday;
  return `S${Math.floor(fridayBoundary / (7 * 86400000))}`;
}

/** Exported so callers that need to replay a SPECIFIC board (the Hub's WATCH buttons, Task 8) can
 *  compute the exact same salted seed `cachedStandings` used to rank the ladder — otherwise the
 *  replay would show a different board than the one that actually decided the standings. */
export function seasonSalt(token: string): number {
  let h = 2166136261;
  for (const ch of token) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rosterKey(fighters: Fighter[], token: string): string {
  const ids = fighters.map((f) => `${f.id}:${fingerprint(f.source)}`).sort();
  return `${token}|${ids.join(",")}`;
}

interface CacheShape {
  key: string;
  standings: Standing[];
  prevStandings: Standing[] | null;
}

function readCache(): CacheShape | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CacheShape) : null;
  } catch {
    return null;
  }
}

function writeCache(c: CacheShape): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    // storage full/blocked — the ladder just recomputes next time, nothing breaks
  }
}

/** The ladder. Cache hit on an unchanged roster+season; cache miss recomputes and remembers the
 *  prior table as `previousStandings()`. */
export function cachedStandings(fighters: Fighter[], now: Date = new Date()): Standing[] {
  const token = seasonToken(now);
  const key = rosterKey(fighters, token);
  const cached = readCache();
  if (cached && cached.key === key) return cached.standings;

  const fresh = standings(fighters, seasonSalt(token));
  writeCache({ key, standings: fresh, prevStandings: cached?.standings ?? null });
  return fresh;
}

/** The ladder as it stood the last time it was recomputed. Null the first time this device ever
 *  computes one. */
export function previousStandings(): Standing[] | null {
  return readCache()?.prevStandings ?? null;
}
