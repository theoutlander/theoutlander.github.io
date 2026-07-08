import React, { useState, useEffect } from "react";
import { Chip } from "./ui/components/Chip";
import { Coin } from "./ui/components/Coin";
import { MissionScreen } from "./ui/MissionScreen";
import { CampaignMap, isUnlocked } from "./ui/CampaignMap";
import { HQ } from "./ui/HQ";
import { BotMaker } from "./ui/BotMaker";
import { Profile } from "./ui/Profile";
import { ALL, globalLevel } from "./content/missions";
import { loadBotConfig, resolveHex, resolveInt } from "./state/botConfig";
import { loadSave } from "./state/save";
import { analytics } from "./state/analytics";

type Screen =
  | { name: "hq" }
  | { name: "map" }
  | { name: "mission"; index: number }
  | { name: "botmaker" }
  | { name: "profile" };

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

  const mission = screen.name === "mission" ? ALL[screen.index] : null;
  const refresh = () => force((n) => n + 1);

  const toHQ = () => { refresh(); setScreen({ name: "hq" }); };
  const toMap = () => { refresh(); setScreen({ name: "map" }); };
  const toBotMaker = () => setScreen({ name: "botmaker" });
  const toProfile = () => { refresh(); setScreen({ name: "profile" }); };

  function openMission(index: number) {
    analytics.levelOpen(index + 1, ALL[index].title);
    setScreen({ name: "mission", index });
  }
  function nextMission() {
    if (screen.name !== "mission") return;
    const next = screen.index + 1;
    if (next < ALL.length && isUnlocked(ALL, next, loadSave())) openMission(next);
    else toMap();
  }

  // Breadcrumb: back target + current label per screen (HQ has none — you're home).
  const crumb =
    screen.name === "map"
      ? { back: "‹ HQ", onBack: toHQ, current: "THE MAP" }
      : screen.name === "botmaker"
        ? { back: "‹ HQ", onBack: toHQ, current: "BOT MAKER" }
        : screen.name === "profile"
        ? { back: "‹ HQ", onBack: toHQ, current: "PROFILE" }
        : mission
          ? { back: "‹ MAP", onBack: toMap, current: `LEVEL ${globalLevel(mission)} · ${mission.title}` }
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
          <HQ bot={bot} save={save} missions={ALL} onPlay={toMap} onBotMaker={toBotMaker} onProfile={toProfile} />
        ) : screen.name === "profile" ? (
          <Profile bot={bot} save={save} />
        ) : screen.name === "botmaker" ? (
          <BotMaker onExit={toHQ} onSaved={() => setBotConfig(loadBotConfig())} />
        ) : screen.name === "mission" ? (
          <MissionScreen
            key={ALL[screen.index].id}
            mission={ALL[screen.index]}
            paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }}
            onCoins={setCoins}
            onExit={toMap}
            onNext={nextMission}
            hasNext={screen.index + 1 < ALL.length}
          />
        ) : (
          <CampaignMap missions={ALL} save={save} onPick={openMission} />
        )}
      </div>
    </div>
  );
}
