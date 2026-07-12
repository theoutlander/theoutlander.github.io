import { sb, cloudEnabled, currentAccount } from "./account";
import { analytics } from "./analytics";

/**
 * "THIS DOESN'T MAKE SENSE" — the kid's own voice.
 *
 * Analytics can tell us she got stuck on Level 9, retried eleven times, and quit. It can never tell
 * us WHY, and why is the only part we can act on. "I don't get what the words mean" and "the bot did
 * something weird" lead to completely different fixes, and no amount of event counting distinguishes
 * them. Nobody is sitting next to her to ask.
 *
 * So we ask her.
 *
 * Two deliberate constraints:
 *
 * 1. THE REASONS ARE ONE-TAP. A fixed list, not a text box. A nine-year-old will not write you a bug
 *    report, and a blank field mostly returns "". One tap is a thing she'll actually do, and a fixed
 *    vocabulary is something we can COUNT — "seven kids said the words don't make sense on Level 9"
 *    is a fix; seven paragraphs are a reading exercise.
 *
 * 2. THE CONTEXT IS AUTOMATIC. What she was staring at — the level, her actual code, the error she
 *    was looking at, how many times she'd failed, whether she'd already begged for the answer — is
 *    worth more than anything she could type, and it costs her nothing.
 *
 * Free text is allowed but optional, capped, and explicitly not needed. See the note on kid-safety
 * below before turning it into anything more.
 */

export const REASONS = [
  { id: "confused_task", label: "I don't understand what I'm supposed to do" },
  { id: "confused_words", label: "I don't understand the words it's using" },
  { id: "bot_weird", label: "The bot did something weird" },
  { id: "too_hard", label: "This is too hard" },
  { id: "boring", label: "This is boring" },
  { id: "broken", label: "Something looks broken" },
] as const;

export type ReasonId = (typeof REASONS)[number]["id"];

export interface FeedbackContext {
  /** kid-facing level number */
  level: number;
  missionId: string;
  /** what she'd actually written when she gave up — usually the most informative field we get */
  code: string;
  /** the error she was staring at, if any */
  error?: string | null;
  /** how far down the help ladder she'd gone */
  hintsUsed: number;
  fails: number;
  showMeUsed: boolean;
  solutionUsed: boolean;
}

export interface Feedback extends FeedbackContext {
  reason: ReasonId;
  /** optional, capped. Never required. */
  note?: string;
}

/** Kids write in text boxes without thinking. Cap it, and never let it become a chat channel. */
export const NOTE_MAX = 200;

/**
 * Send a report. NEVER throws and never blocks the game — a kid telling us the game is broken must
 * not be met with the game breaking. If the network is down or she's not logged in, the GA event
 * still fires, so we keep the signal that matters most: WHICH level, and WHAT kind of confusion.
 */
export async function sendFeedback(fb: Feedback): Promise<void> {
  // Always fire the analytics event. It carries no free text and no identity — just the shape of the
  // problem — so it works for a logged-out kid and is safe to collect from anyone.
  analytics.problemReport?.(fb.reason, fb.level);

  if (!cloudEnabled) return;
  try {
    const account = await currentAccount();
    await sb()
      .from("codebots_feedback")
      .insert({
        user_id: account?.id ?? null,
        level: fb.level,
        mission_id: fb.missionId,
        reason: fb.reason,
        note: (fb.note ?? "").slice(0, NOTE_MAX) || null,
        code: fb.code.slice(0, 4000),
        error: fb.error ?? null,
        hints_used: fb.hintsUsed,
        fails: fb.fails,
        show_me_used: fb.showMeUsed,
        solution_used: fb.solutionUsed,
      });
  } catch {
    // swallow: the GA event already went out, and a failed report must never surface to the kid
  }
}
