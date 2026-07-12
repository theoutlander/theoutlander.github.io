import { sb, cloudEnabled, currentAccount } from "../state/account";

/**
 * PLAYER VS PLAYER — the reason a kid comes back tomorrow.
 *
 * Nothing else in the game pulls her back. She finishes a level, closes the tab, and that's the end
 * of it. A rival is the strongest hook there is, and it's the one the engine was built for.
 *
 * THE FACT THAT MAKES THIS EASY: the battle sim is deterministic. The same two programs in the same
 * arena produce a byte-identical event log every time. So there is no live networking here, no
 * matchmaking service, no game server — we store the kid's PROGRAM TEXT and nothing else, and anyone
 * can re-run the fight later and get exactly the same result.
 *
 * Her bot fights while she's asleep. She comes back to "Maya's bot beat yours." And because the losing
 * side can watch the replay, losing hands her code she can learn from — which is the only kind of
 * competitive loop worth putting in front of a child.
 *
 * SAFETY: the only thing published is a program. There is no bio, no description, no message, no
 * chat — nowhere for one child to type free text that another child will read. We are not building an
 * unmoderated channel between kids, and the way you don't build one is by not having a field for it.
 */

export interface PublishedBot {
  userId: string;
  username: string;
  botName: string;
  source: string;
  wins: number;
  losses: number;
}

const TABLE = "codebots_bots";

interface Row {
  user_id: string;
  username: string;
  bot_name: string;
  source: string;
  wins: number;
  losses: number;
}

const toBot = (r: Row): PublishedBot => ({
  userId: r.user_id,
  username: r.username,
  botName: r.bot_name,
  source: r.source,
  wins: r.wins ?? 0,
  losses: r.losses ?? 0,
});

/** Longest program we'll accept. Generous for a kid, small enough that nobody can use us as storage. */
export const MAX_SOURCE = 4000;

/**
 * Publish (or replace) this player's bot. One bot per account: publishing again replaces the old one,
 * because a leaderboard where one kid fields forty bots isn't a leaderboard.
 *
 * Returns false rather than throwing when she's logged out or offline — a failed publish must never
 * take the game down with it.
 */
export async function publishBot(source: string, botName: string): Promise<boolean> {
  if (!cloudEnabled || !source.trim()) return false;
  try {
    const account = await currentAccount();
    if (!account) return false;
    const { error } = await sb()
      .from(TABLE)
      .upsert(
        {
          user_id: account.id,
          username: account.username,
          bot_name: botName.slice(0, 24),
          source: source.slice(0, MAX_SOURCE),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    return !error;
  } catch {
    return false;
  }
}

/** Everyone else's bots. Logged out or offline ⇒ no opponents, and the presets carry the room. */
export async function fetchOpponents(limit = 20): Promise<PublishedBot[]> {
  if (!cloudEnabled) return [];
  try {
    const account = await currentAccount();
    const q = sb().from(TABLE).select("*").order("wins", { ascending: false }).limit(limit);
    const { data, error } = account ? await q.neq("user_id", account.id) : await q;
    if (error || !data) return [];
    return (data as Row[]).map(toBot);
  } catch {
    return [];
  }
}

/** The board. Same data, different question: who's actually winning? */
export async function leaderboard(limit = 10): Promise<PublishedBot[]> {
  if (!cloudEnabled) return [];
  try {
    const { data, error } = await sb()
      .from(TABLE)
      .select("*")
      .order("wins", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as Row[]).map(toBot);
  } catch {
    return [];
  }
}

/**
 * Record what happened to the OPPONENT's bot.
 *
 * When your bot beats Maya's, Maya isn't online to record her own loss — so this has to write to
 * somebody else's row. A blanket update policy would let any kid rewrite any other kid's bot (or
 * quietly award herself a thousand wins), so the database exposes exactly one operation instead: a
 * function that can only ever add one to a counter. See docs/pvp-supabase.sql.
 */
export async function recordOutcome(opponentUserId: string, opponentWon: boolean): Promise<void> {
  if (!cloudEnabled) return;
  try {
    await sb().rpc("codebots_record_result", { target: opponentUserId, won: opponentWon });
  } catch {
    // a lost tally is not worth interrupting a child's game over
  }
}
