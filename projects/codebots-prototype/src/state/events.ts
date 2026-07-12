import { sb, cloudEnabled } from "./account";

/**
 * OUR OWN COPY OF THE FUNNEL.
 *
 * Google Analytics is fine, but it answers questions in aggregate and it answers them slowly, and the
 * question that actually matters here is shaped differently:
 *
 *     "Of the kids who opened FIRST STEPS, how many made it past BRACKETS MEAN GO?"
 *
 * That's a per-beat drop-off on a nine-step funnel, and it is the single most important number in the
 * product — it's the difference between "coding isn't for me" and everything that comes after. Nobody
 * is sitting next to these kids. This table is the only way we will ever see that moment.
 *
 * So every analytics event is ALSO written here, where we can query it directly with SQL.
 *
 * WHAT WE DO NOT COLLECT, and why:
 *   - No name, no email, no age, no location, no device fingerprint. These are children.
 *   - The session id is a random per-tab value that we never store anywhere else and cannot link back
 *     to a person. It exists for exactly one purpose: to tell "one kid stuck on beat 3 eleven times"
 *     apart from "eleven kids each tried beat 3 once", which are opposite problems with opposite fixes.
 *   - user_id is attached only when a kid is actually logged in, and it's an opaque Supabase id.
 *
 * It must never break the game. A dead network, a missing table, a logged-out kid — all of it fails
 * silently. Nobody's turn is ever interrupted so that we can collect a statistic.
 */

/** Random, per-tab, never persisted. Distinguishes "one kid, eleven tries" from "eleven kids". */
const SESSION = Math.random().toString(36).slice(2, 12);

/** the account id, if she happens to be logged in — resolved lazily, never awaited on the hot path */
let userId: string | null = null;
export function setEventUser(id: string | null): void {
  userId = id;
}

interface Row {
  session: string;
  user_id: string | null;
  name: string;
  params: Record<string, unknown> | null;
}

/**
 * Events are batched. A kid mid-level generates a burst of them, and firing a network request per
 * keystroke-adjacent event would be both wasteful and a way to make the game stutter on a bad
 * connection — which is precisely the kind of thing that gets blamed on the game, not the analytics.
 */
let queue: Row[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

export function logEvent(name: string, params?: Record<string, unknown>): void {
  if (!cloudEnabled) return;
  queue.push({ session: SESSION, user_id: userId, name, params: params ?? null });
  if (timer) return;
  timer = setTimeout(flush, 4000);
}

export async function flush(): Promise<void> {
  if (timer) { clearTimeout(timer); timer = null; }
  if (!queue.length || !cloudEnabled) return;
  const batch = queue;
  queue = [];
  try {
    await sb().from("codebots_events").insert(batch);
  } catch {
    // Deliberately swallowed, and deliberately NOT retried. A lost statistic costs us a data point;
    // a retry loop on a flaky connection costs a kid her turn. She wins that trade every time.
  }
}

// Don't lose the last few events when she closes the tab — that's the batch that contains the quit,
// which is the most interesting batch there is.
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => void flush());
}
