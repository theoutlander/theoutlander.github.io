import { loadBotConfig, resolveInt } from "./botConfig";

export interface BotIdentity {
  playerName: string;
  botName: string;
  bodyColor: number;
  domeColor: number;
}

/** Resolve the live bot config (localStorage → bundled default) to render-ready colors. */
export function loadBotIdentity(): BotIdentity {
  const c = loadBotConfig();
  return {
    playerName: c.playerName,
    botName: c.botName,
    bodyColor: resolveInt(c.paint.body, c.paintbox),
    domeColor: resolveInt(c.paint.dome, c.paintbox),
  };
}
