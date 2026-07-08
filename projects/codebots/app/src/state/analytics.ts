/**
 * CodeBots analytics — thin wrapper over the site's Google Analytics (gtag, loaded in index.html).
 * Every event is prefixed `cb_` so the game's data is easy to isolate in GA. No-ops if gtag isn't
 * present (local dev / blocked), so callers never need to guard.
 */
type Params = Record<string, string | number | boolean | undefined>;

function gtag(): ((...args: unknown[]) => void) | null {
  const g = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  return typeof g === "function" ? g : null;
}

export const analytics = {
  /** top of the funnel: someone opened the game (the map) */
  gameOpen() {
    track("cb_game_open");
  },
  levelOpen(level: number, title: string) {
    track("cb_level_open", { level, title });
  },
  levelRetry(level: number) {
    track("cb_level_retry", { level });
  },
  run(level: number, lines: number, commands: string) {
    track("cb_run", { level, lines, commands });
  },
  /** fired once when a kid keeps failing a level — a "this level is too hard" signal */
  stuck(level: number, fails: number) {
    track("cb_stuck", { level, fails });
  },
  runError(level: number, message: string) {
    track("cb_run_error", { level, message });
  },
  levelClear(level: number, stars: number, lines: number, par: number) {
    track("cb_level_clear", { level, stars, lines, par, under_par: lines <= par });
  },
  feedback(level: number, rating: "fun" | "ok" | "meh") {
    track("cb_feedback", { level, rating });
  },
  badgeEarned(badge: string) {
    track("cb_badge", { badge });
  },
  fieldOpen() {
    track("cb_field_open");
  },
  fieldSolved(total: number) {
    track("cb_field_solved", { total });
  },
  botSaved(playerName: string, botName: string) {
    track("cb_bot_saved", { bot: botName });
    // a personalized pilot name becomes the player identity (default names stay generic)
    gtag()?.("set", "user_properties", { player: playerName || "guest" });
  },
  hintUsed(level: number, hint: number) {
    track("cb_hint_used", { level, hint });
  },
};

function track(event: string, params?: Params): void {
  gtag()?.("event", event, params);
}

/**
 * One-time setup: identify the player (family vs. guest) and capture crashes.
 * Family members open the game once with `?who=<name>`; that name persists and is sent to GA as
 * the `player` user property. Everyone else is `guest`, so you can segment insiders vs. outsiders.
 */
export function initAnalytics(): void {
  let player = "guest";
  try {
    const who = new URL(window.location.href).searchParams.get("who");
    if (who) localStorage.setItem("cb.player", who.slice(0, 40));
    player = localStorage.getItem("cb.player") || "guest";
  } catch {
    /* storage/URL blocked — stay guest */
  }
  gtag()?.("set", "user_properties", { player });

  // Catch real crashes so we learn when the game breaks for a real player.
  window.addEventListener("error", (e) => {
    track("cb_js_error", { message: String(e.message ?? e).slice(0, 200), src: e.filename });
  });
  window.addEventListener("unhandledrejection", (e) => {
    track("cb_js_error", { message: String(e.reason).slice(0, 200), kind: "promise" });
  });
}
