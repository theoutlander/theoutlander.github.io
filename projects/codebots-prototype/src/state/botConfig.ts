import botDefault from "../../content/bot.default.json";

/**
 * The kid-editable bot identity. bot.json is the import/export format; localStorage is the live
 * store (a deployed static site can't have her edit the served file). The Bot Maker reads and
 * writes this; the arena resolves its paint to colors.
 */
export interface BotConfig {
  playerName: string;
  botName: string;
  /** a paintbox color NAME or a raw #hex */
  paint: { body: string; dome: string };
  /** named palette she can extend (name → #hex) */
  paintbox: Record<string, string>;
}

const KEY = "cb.bot.v1";

const DEFAULT: BotConfig = {
  playerName: botDefault.playerName ?? "CADET",
  botName: botDefault.botName ?? "SPARKPLUG",
  paint: {
    body: botDefault.paint?.body ?? "#FF8BB3",
    dome: botDefault.paint?.dome ?? "#5FD4FF",
  },
  paintbox: (botDefault.paintbox ?? {}) as Record<string, string>,
};

export function loadBotConfig(): BotConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BotConfig>;
      return {
        playerName: parsed.playerName ?? DEFAULT.playerName,
        botName: parsed.botName ?? DEFAULT.botName,
        paint: { body: parsed.paint?.body ?? DEFAULT.paint.body, dome: parsed.paint?.dome ?? DEFAULT.paint.dome },
        paintbox: parsed.paintbox ?? DEFAULT.paintbox,
      };
    }
  } catch {
    /* fall through to default */
  }
  return { ...DEFAULT, paint: { ...DEFAULT.paint }, paintbox: { ...DEFAULT.paintbox } };
}

export function saveBotConfig(c: BotConfig): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage blocked — changes just won't persist */
  }
}

/** paintbox name or #hex → "#RRGGBB" */
export function resolveHex(value: string, paintbox: Record<string, string>): string {
  return value.startsWith("#") ? value : paintbox[value] ?? "#FFB454";
}

/** paintbox name or #hex → 0xRRGGBB (for Phaser) */
export function resolveInt(value: string, paintbox: Record<string, string>): number {
  return parseInt(resolveHex(value, paintbox).replace("#", ""), 16);
}
