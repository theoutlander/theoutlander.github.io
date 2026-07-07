import React, { useState, useEffect } from "react";
import { Chip } from "./ui/components/Chip";
import { Coin } from "./ui/components/Coin";
import { MissionScreen } from "./ui/MissionScreen";
import { CampaignMap, isUnlocked } from "./ui/CampaignMap";
import { HQ } from "./ui/HQ";
import { BotMaker } from "./ui/BotMaker";
import { WORLD1 } from "./content/missions";
import { loadBotConfig, resolveHex, resolveInt } from "./state/botConfig";
import { loadSave } from "./state/save";
import { analytics } from "./state/analytics";

type Screen =
  | { name: "hq" }
  | { name: "map" }
  | { name: "mission"; index: number }
  | { name: "botmaker" };

/**
 * App shell: the CodeBots header + a hub → map/bot-maker → mission state machine. The bot config
 * lives in App state so a Bot Maker save immediately repaints the header, HQ, and arena.
 */
export function App() {
  const [botConfig, setBotConfig] = useState(loadBotConfig);
  const [screen, setScreen] = useState<Screen>({ name: "hq" });
  const [coins, setCoins] = useState(() => loadSave().coins);
  const [, force] = useState(0); // re-read the save after a clear (unlocks the next level)

  useEffect(() => {
    analytics.gameOpen();
  }, []);

  const save = loadSave();
  const bot = {
    playerName: botConfig.playerName,
    botName: botConfig.botName,
    bodyHex: resolveHex(botConfig.paint.body, botConfig.paintbox),
    domeHex: resolveHex(botConfig.paint.dome, botConfig.paintbox),
    bodyColor: resolveInt(botConfig.paint.body, botConfig.paintbox),
    domeColor: resolveInt(botConfig.paint.dome, botConfig.paintbox),
  };

  const mission = screen.name === "mission" ? WORLD1[screen.index] : null;
  const refresh = () => force((n) => n + 1);

  const toHQ = () => { refresh(); setScreen({ name: "hq" }); };
  const toMap = () => { refresh(); setScreen({ name: "map" }); };
  const toBotMaker = () => setScreen({ name: "botmaker" });

  function openMission(index: number) {
    analytics.levelOpen(WORLD1[index].index, WORLD1[index].title);
    setScreen({ name: "mission", index });
  }
  function nextMission() {
    if (screen.name !== "mission") return;
    const next = screen.index + 1;
    if (next < WORLD1.length && isUnlocked(WORLD1, next, loadSave())) openMission(next);
    else toMap();
  }

  // Breadcrumb: back target + current label per screen (HQ has none — you're home).
  const crumb =
    screen.name === "map"
      ? { back: "‹ HQ", onBack: toHQ, current: "THE MAP" }
      : screen.name === "botmaker"
        ? { back: "‹ HQ", onBack: toHQ, current: "BOT MAKER" }
        : mission
          ? { back: "‹ MAP", onBack: toMap, current: `LEVEL ${mission.index} · ${mission.title}` }
          : null;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: "var(--border)", flex: "none" }}>
        <button
          onClick={toHQ}
          style={{ all: "unset", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-.5px" }}
        >
          CODE<span style={{ color: "var(--amber)" }}>BOTS</span>
        </button>
        {crumb ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)" }}>
            <button onClick={crumb.onBack} style={{ all: "unset", cursor: "pointer", fontWeight: 700, letterSpacing: "1px", color: "var(--cyan)" }}>
              {crumb.back}
            </button>
            <span style={{ color: "var(--text-dim)" }}>›</span>
            <span style={{ color: "var(--ink)", fontWeight: 700, letterSpacing: "1px" }}>{crumb.current}</span>
          </div>
        ) : null}
        <div style={{ flex: 1 }} />
        <Chip color="dim">PILOT: {bot.playerName}</Chip>
        <Chip color="cyan">BOT: {bot.botName}</Chip>
        <Coin count={coins} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: screen.name === "mission" ? "hidden" : "auto" }}>
        {screen.name === "hq" ? (
          <HQ bot={bot} save={save} missions={WORLD1} onPlay={toMap} onBotMaker={toBotMaker} />
        ) : screen.name === "botmaker" ? (
          <BotMaker onExit={toHQ} onSaved={() => setBotConfig(loadBotConfig())} />
        ) : screen.name === "mission" ? (
          <MissionScreen
            key={WORLD1[screen.index].id}
            mission={WORLD1[screen.index]}
            paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }}
            onCoins={setCoins}
            onExit={toMap}
            onNext={nextMission}
            hasNext={screen.index + 1 < WORLD1.length}
          />
        ) : (
          <CampaignMap missions={WORLD1} save={save} onPick={openMission} />
        )}
      </div>
    </div>
  );
}
