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
  levelOpen(level: number, title: string) {
    track("cb_level_open", { level, title });
  },
  run(level: number, lines: number) {
    track("cb_run", { level, lines });
  },
  runError(level: number, message: string) {
    track("cb_run_error", { level, message });
  },
  levelClear(level: number, stars: number, lines: number, par: number) {
    track("cb_level_clear", { level, stars, lines, par, under_par: lines <= par });
  },
  hintUsed(level: number, hint: number) {
    track("cb_hint_used", { level, hint });
  },
};

function track(event: string, params?: Params): void {
  gtag()?.("event", event, params);
}
