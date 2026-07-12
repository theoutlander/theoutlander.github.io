import { playMatch, type Fighter, type MatchResult } from "./league";

/**
 * WHILE YOU WERE AWAY.
 *
 * The one thing the game never had: a reason to come back tomorrow. She finished a level, closed the
 * tab, and that was the end of it.
 *
 * The obvious way to build this is a server that runs everyone's bots against each other on a
 * schedule and stores the results. We don't need one, and it took a good question to see why: the sim
 * is DETERMINISTIC, so the outcome of her bot against a rival is a pure function of their two
 * programs. The fight doesn't have to be run somewhere and remembered. It can be worked out the
 * instant she opens the game — and it gives the identical answer it would have given at 3am.
 *
 * So there is no cron job, no queue, no background worker, and no cost. There is just a fact about
 * two programs, and we compute it when she walks in the door.
 *
 * What makes it a RETURN hook rather than a notification: a loss comes with the replay. She doesn't
 * just learn that someone beat her — she gets to watch HOW, in code she can read. Losing hands her
 * something to learn from, which is the only kind of competitive loop worth putting in front of a
 * child.
 */

export interface AwayResult {
  rival: Fighter;
  match: MatchResult;
  /** from HER point of view */
  outcome: "win" | "lose" | "draw";
}

export interface AwayReport {
  results: AwayResult[];
  wins: number;
  losses: number;
  draws: number;
  /** the loss worth showing her — the one to watch and learn from */
  bestLesson: AwayResult | null;
}

/**
 * A cheap fingerprint of a rival's program.
 *
 * We only report a fight as NEW if the rival is new, or if they've CHANGED THEIR CODE since she last
 * looked. Without this, she'd be told "3 bots fought yours!" every single time she opened the game —
 * the same three, forever — and the feature would go from a reason to return to a reason to stop
 * trusting anything the game tells her.
 */
export function fingerprint(source: string): string {
  let h = 2166136261;
  for (const ch of source) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** what she'd already been told about, last time she was here: rival id → their code's fingerprint */
export type SeenRivals = Record<string, string>;

/**
 * What happened while she was gone.
 *
 * Pure: no clock, no network, no randomness. Same inputs, same report — which is also what makes it
 * testable, and what makes it agree with the league table she can see.
 */
export function whileYouWereAway(
  mine: Fighter,
  rivals: Fighter[],
  seen: SeenRivals,
): AwayReport {
  const results: AwayResult[] = [];

  for (const rival of rivals) {
    if (rival.id === mine.id) continue; // she is not her own rival
    const fresh = seen[rival.id] !== fingerprint(rival.source);
    if (!fresh) continue; // already told her about this exact bot

    const match = playMatch(mine, rival);
    results.push({
      rival,
      match,
      outcome: match.winner === "a" ? "win" : match.winner === "b" ? "lose" : "draw",
    });
  }

  const losses = results.filter((r) => r.outcome === "lose");
  return {
    results,
    wins: results.filter((r) => r.outcome === "win").length,
    losses: losses.length,
    draws: results.filter((r) => r.outcome === "draw").length,
    // The loss is the interesting part. Show her the one she lost hardest, because that's the bot
    // with the most to teach her — a narrow defeat says "unlucky", a thrashing says "they know
    // something you don't".
    bestLesson: losses.sort((a, b) => b.match.losses - a.match.losses)[0] ?? null,
  };
}

/** what to remember, so we don't tell her the same news twice */
export function markSeen(rivals: Fighter[]): SeenRivals {
  const out: SeenRivals = {};
  for (const r of rivals) out[r.id] = fingerprint(r.source);
  return out;
}
