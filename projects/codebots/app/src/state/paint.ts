import botDefault from "../../content/bot.default.json";

export interface BotIdentity {
  playerName: string;
  botName: string;
  bodyColor: number;
  domeColor: number;
}

/** Resolve a paint name (a paintbox key) OR a raw hex string to a 0xRRGGBB int. */
function resolvePaint(value: string, paintbox: Record<string, string>): number {
  const hex = value.startsWith("#") ? value : paintbox[value] ?? "#FFB454";
  return parseInt(hex.replace("#", ""), 16);
}

/** Read bot identity + paint from the bundled default bot.json (localStorage override lands with
 *  the Bot Maker later; for now this is the single source of paint). */
export function loadBotIdentity(): BotIdentity {
  const paintbox = (botDefault.paintbox ?? {}) as Record<string, string>;
  return {
    playerName: botDefault.playerName ?? "CADET",
    botName: botDefault.botName ?? "SPARKPLUG",
    bodyColor: resolvePaint(botDefault.paint?.body ?? "#FF8BB3", paintbox),
    domeColor: resolvePaint(botDefault.paint?.dome ?? "#5FD4FF", paintbox),
  };
}
