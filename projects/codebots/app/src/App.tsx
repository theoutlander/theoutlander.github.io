import React, { useState, useEffect } from "react";
import { Chip } from "./ui/components/Chip";
import { Coin } from "./ui/components/Coin";
import { MissionScreen } from "./ui/MissionScreen";
import { CampaignMap, isUnlocked } from "./ui/CampaignMap";
import { HQ } from "./ui/HQ";
import { Profile } from "./ui/Profile";
import { ArenaHub } from "./ui/ArenaHub";
import { FightScreen, STARTER, type Opponent, type FightRecord } from "./ui/FightScreen";
import { Debrief } from "./ui/Debrief";
import { GarageScreen } from "./ui/GarageScreen";
import { DrillScreen } from "./ui/DrillScreen";
import { FirstStepsScreen } from "./ui/FirstStepsScreen";
import { LeagueScreen } from "./ui/LeagueScreen";
import { AccountScreen } from "./ui/AccountScreen";
import { ALL, globalLevel } from "./content/missions";
import { currentAccount, cloudEnabled, type Account } from "./state/account";
import { syncNow, initCloudSync } from "./state/cloudSync";
import { loadBotConfig, resolveHex, resolveInt } from "./state/botConfig";
import { loadSave, saveSave } from "./state/save";
import { analytics } from "./state/analytics";
import { setEventUser } from "./state/events";
import { recordOutcome } from "./rivals/publish";

type Screen =
  | { name: "hq" }
  | { name: "map" }
  | { name: "mission"; index: number }
  | { name: "profile" }
  | { name: "arenaHub" }
  | { name: "fight"; opponent: Opponent }
  | { name: "debrief" }
  | { name: "garage" }
  | { name: "drill" }
  | { name: "first" }
  | { name: "league" }
  | { name: "account" };

/**
 * App shell: the CodeBots header + a hub → map/bot-maker → mission state machine. The bot config
 * lives in App state so a Bot Maker save immediately repaints the header, HQ, and arena.
 */
export function App() {
  const [botConfig, setBotConfig] = useState(loadBotConfig);
  const [screen, setScreen] = useState<Screen>({ name: "hq" });
  const [coins, setCoins] = useState(() => loadSave().coins);
  // lastFight is the just-finished fight's result for Debrief to render; lastOpponent is who it was
  // against, so REMATCH can start the same fight again (a FightRecord only carries the result, not
  // the Opponent selector, so both are needed).
  const [lastFight, setLastFight] = useState<FightRecord | null>(null);
  const [lastOpponent, setLastOpponent] = useState<Opponent | null>(null);
  // Her arena program lives HERE, not in FightScreen: that screen unmounts the moment a fight ends
  // (onDone → Debrief), so a REMATCH out of the debrief — or a trip back to the hub to pick another
  // opponent — would otherwise hand her a fresh STARTER and throw away the code she just came to fix.
  // Losing, reading why, fixing it and going again is the whole loop; it cannot begin by deleting her
  // work. She published a bot from an earlier session? Start her on that, not on the tutorial text.
  const [arenaCode, setArenaCode] = useState(() => loadSave().publishedSource ?? STARTER);
  const [account, setAccount] = useState<Account | null>(null);
  // Tag events with the account id once she logs in, so a returning kid can be told apart from a new
  // one. Logged out, events stay genuinely anonymous.
  useEffect(() => { setEventUser(account?.id ?? null); }, [account]);
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
  const toProfile = () => { refresh(); setScreen({ name: "profile" }); };
  const toArenaHub = () => setScreen({ name: "arenaHub" });
  const toFight = (opponent: Opponent) => { setLastOpponent(opponent); setScreen({ name: "fight", opponent }); };
  /**
   * A fight just ended. Fires exactly once per fight — FightScreen calls onDone from the playback's
   * own onDone, which STOP aborts rather than triggers.
   *
   * When her bot beats another kid's, that kid isn't online to record her own loss, so we write the
   * result to the OPPONENT's row (the database only lets us add one to a counter, never anything
   * else). Nothing here touches HER save: a loss costs her no coins and no points, ever.
   */
  const toDebrief = (record: FightRecord) => {
    if (record.opponentUserId && record.outcome !== "draw") {
      void recordOutcome(record.opponentUserId, record.outcome === "lose");
    }
    setLastFight(record);
    setScreen({ name: "debrief" });
  };
  const toGarage = () => { refresh(); setScreen({ name: "garage" }); };
  const toAccount = () => setScreen({ name: "account" });
  const toDrill = () => setScreen({ name: "drill" });
  const toFirst = () => setScreen({ name: "first" });
  const toLeague = () => setScreen({ name: "league" });
  /** "I already know how to code" — open every room. For older kids and returning players; the ramp
   *  is for people who want it, never a toll gate. */
  const unlockAll = () => { applySave({ ...loadSave(), skipAhead: true }); refresh(); };

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
        : screen.name === "profile"
        ? { back: "‹ HQ", onBack: toHQ, current: "PROFILE" }
        : screen.name === "arenaHub"
        ? { back: "‹ HQ", onBack: toHQ, current: "ARENA" }
        : screen.name === "fight"
        ? { back: "‹ ARENA", onBack: toArenaHub, current: "FIGHT" }
        : screen.name === "debrief"
        ? { back: "‹ ARENA", onBack: toArenaHub, current: "DEBRIEF" }
        : screen.name === "garage"
        ? { back: "‹ HQ", onBack: toHQ, current: "GARAGE" }
        : screen.name === "account"
        ? { back: "‹ HQ", onBack: toHQ, current: "ACCOUNT" }
        : screen.name === "drill"
        ? { back: "‹ HQ", onBack: toHQ, current: "PROVE IT" }
        : screen.name === "first"
        ? { back: "‹ HQ", onBack: toHQ, current: "FIRST STEPS" }
        : screen.name === "league"
        ? { back: "‹ ARENA", onBack: toArenaHub, current: "THE LEAGUE" }
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
        <Chip color="dim">PILOT: {!cloudEnabled || account ? bot.playerName : "GUEST"}</Chip>
        <Chip color="cyan">BOT: {bot.botName}</Chip>
        <Coin count={coins} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        {screen.name === "hq" ? (
          <HQ bot={bot} account={account} save={save} missions={ALL} onPlay={toMap} onProfile={toProfile} onArenaHub={toArenaHub} onGarage={toGarage} onDrill={toDrill} onFirstSteps={toFirst} onUnlockAll={unlockAll} onLeague={toLeague} />
        ) : screen.name === "profile" ? (
          <Profile bot={bot} save={save} />
        ) : screen.name === "league" ? (
          <LeagueScreen paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }} onExit={toArenaHub} />
        ) : screen.name === "arenaHub" ? (
          <ArenaHub onFight={toFight} />
        ) : screen.name === "fight" ? (
          <FightScreen
            opponent={screen.opponent}
            paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }}
            code={arenaCode}
            onCodeChange={setArenaCode}
            botName={bot.botName}
            onDone={toDebrief}
            onExit={toArenaHub}
          />
        ) : screen.name === "debrief" && lastFight ? (
          <Debrief
            record={lastFight}
            save={save}
            onRematch={() => { if (lastOpponent) toFight(lastOpponent); }}
            onLearn={(missionId) => {
              const idx = ALL.findIndex((m) => m.id === missionId);
              if (idx >= 0) setScreen({ name: "mission", index: idx });
            }}
            onBackToHub={toArenaHub}
          />
        ) : screen.name === "garage" ? (
          <GarageScreen save={save} onSave={applySave} />
        ) : screen.name === "drill" ? (
          <DrillScreen paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }} onExit={toHQ} />
        ) : screen.name === "first" ? (
          <FirstStepsScreen
            paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }}
            onDone={() => { refresh(); setScreen({ name: "mission", index: 0 }); }}
            onExit={toHQ}
          />
        ) : screen.name === "account" ? (
          <AccountScreen
            account={account}
            onAccount={(a) => { setAccount(a); setCoins(loadSave().coins); refresh(); }}
            onDone={toHQ}
          />
        ) : screen.name === "mission" ? (
          <MissionScreen
            key={ALL[screen.index].id}
            mission={ALL[screen.index]}
            paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }}
            onProveIt={toDrill}
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
