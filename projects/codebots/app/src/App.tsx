import React, { useState, useEffect } from "react";
import { Chip } from "./ui/components/Chip";
import { Coin } from "./ui/components/Coin";
import { MissionScreen } from "./ui/MissionScreen";
import { CampaignMap, isUnlocked } from "./ui/CampaignMap";
import { HQ } from "./ui/HQ";
import { BotMaker } from "./ui/BotMaker";
import { Profile } from "./ui/Profile";
import { OpenFieldScreen } from "./ui/OpenFieldScreen";
import { BattleScreen } from "./ui/BattleScreen";
import { GarageScreen } from "./ui/GarageScreen";
import { AccountScreen } from "./ui/AccountScreen";
import { ALL, globalLevel } from "./content/missions";
import { currentAccount, cloudEnabled, type Account } from "./state/account";
import { syncNow, initCloudSync } from "./state/cloudSync";
import { loadBotConfig, resolveHex, resolveInt } from "./state/botConfig";
import { loadSave, saveSave } from "./state/save";
import { analytics } from "./state/analytics";

type Screen =
  | { name: "hq" }
  | { name: "map" }
  | { name: "mission"; index: number }
  | { name: "botmaker" }
  | { name: "profile" }
  | { name: "field" }
  | { name: "battle" }
  | { name: "garage" }
  | { name: "account" };

/**
 * App shell: the CodeBots header + a hub → map/bot-maker → mission state machine. The bot config
 * lives in App state so a Bot Maker save immediately repaints the header, HQ, and arena.
 */
export function App() {
  const [botConfig, setBotConfig] = useState(loadBotConfig);
  const [screen, setScreen] = useState<Screen>({ name: "hq" });
  const [coins, setCoins] = useState(() => loadSave().coins);
  const [account, setAccount] = useState<Account | null>(null);
  const [, force] = useState(0); // re-read the save after a clear (unlocks the next level)

  useEffect(() => {
    analytics.gameOpen();
    // If already signed in from a previous visit, pull + merge the cloud save, then keep it synced.
    initCloudSync();
    currentAccount().then((a) => {
      if (a) {
        setAccount(a);
        syncNow().then(() => { setCoins(loadSave().coins); force((n) => n + 1); });
      }
    });
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
  const toField = () => setScreen({ name: "field" });
  const toBattle = () => setScreen({ name: "battle" });
  const toGarage = () => { refresh(); setScreen({ name: "garage" }); };
  const toAccount = () => setScreen({ name: "account" });

  /** Garage purchases/equips write straight to the save, then repaint coins + screens. */
  function applySave(next: ReturnType<typeof loadSave>) {
    saveSave(next);
    setCoins(next.coins);
    refresh();
  }

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
        : screen.name === "field"
        ? { back: "‹ HQ", onBack: toHQ, current: "OPEN FIELD" }
        : screen.name === "battle"
        ? { back: "‹ HQ", onBack: toHQ, current: "BATTLE ARENA" }
        : screen.name === "garage"
        ? { back: "‹ HQ", onBack: toHQ, current: "GARAGE" }
        : screen.name === "account"
        ? { back: "‹ HQ", onBack: toHQ, current: "ACCOUNT" }
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
        {cloudEnabled ? (
          <button onClick={toAccount} style={{ all: "unset", cursor: "pointer" }}>
            <Chip color={account ? "green" : "amber"}>{account ? `◉ ${account.username}` : "LOG IN"}</Chip>
          </button>
        ) : null}
        <Chip color="dim">PILOT: {bot.playerName}</Chip>
        <Chip color="cyan">BOT: {bot.botName}</Chip>
        <Coin count={coins} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: screen.name === "mission" ? "hidden" : "auto" }}>
        {screen.name === "hq" ? (
          <HQ bot={bot} save={save} missions={ALL} onPlay={toMap} onBotMaker={toBotMaker} onProfile={toProfile} onOpenField={toField} onBattle={toBattle} onGarage={toGarage} />
        ) : screen.name === "profile" ? (
          <Profile bot={bot} save={save} />
        ) : screen.name === "field" ? (
          <OpenFieldScreen paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }} />
        ) : screen.name === "battle" ? (
          <BattleScreen paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }} />
        ) : screen.name === "garage" ? (
          <GarageScreen save={save} onSave={applySave} />
        ) : screen.name === "account" ? (
          <AccountScreen
            account={account}
            onAccount={(a) => { setAccount(a); setCoins(loadSave().coins); refresh(); }}
            onDone={toHQ}
          />
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
