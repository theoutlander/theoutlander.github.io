import React, { useState } from "react";
import { Chip } from "./ui/components/Chip";
import { Coin } from "./ui/components/Coin";
import { MissionScreen } from "./ui/MissionScreen";
import { CampaignMap, isUnlocked } from "./ui/CampaignMap";
import { WORLD1 } from "./content/missions";
import { loadBotIdentity } from "./state/paint";
import { loadSave } from "./state/save";

type Screen = { name: "map" } | { name: "mission"; index: number };

/**
 * App shell: the CodeBots header + a map ↔ mission state machine for World 1. Coins live in App
 * so the header ticker updates the moment a mission pays out; everything else reads localStorage.
 */
export function App() {
  const bot = loadBotIdentity();
  const [screen, setScreen] = useState<Screen>({ name: "map" });
  const [coins, setCoins] = useState(() => loadSave().coins);
  // bump to re-read the save after a mission clears (unlocks next dot on the map)
  const [, force] = useState(0);
  const save = loadSave();

  const mission = screen.name === "mission" ? WORLD1[screen.index] : null;

  function openMission(index: number) {
    setScreen({ name: "mission", index });
  }

  function toMap() {
    force((n) => n + 1);
    setScreen({ name: "map" });
  }

  function nextMission() {
    if (screen.name !== "mission") return;
    const next = screen.index + 1;
    if (next < WORLD1.length && isUnlocked(WORLD1, next, loadSave())) {
      openMission(next);
    } else {
      toMap();
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: "var(--border)", flex: "none" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-.5px" }}>
          CODE<span style={{ color: "var(--amber)" }}>BOTS</span>
        </div>
        <Chip color="dim">PILOT: {bot.playerName}</Chip>
        <Chip color="cyan">BOT: {bot.botName}</Chip>
        <div style={{ flex: 1 }} />
        {mission ? (
          <Chip color="amber">
            {mission.id.toUpperCase()} · {mission.teaches.toUpperCase()}
          </Chip>
        ) : null}
        <Coin count={coins} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: screen.name === "map" || !mission ? "auto" : "hidden" }}>
        {screen.name === "map" || !mission ? (
          <CampaignMap missions={WORLD1} save={save} onPick={openMission} />
        ) : (
          <MissionScreen
            key={mission.id}
            mission={mission}
            paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }}
            onCoins={setCoins}
            onExit={toMap}
            onNext={nextMission}
            hasNext={screen.index + 1 < WORLD1.length}
          />
        )}
      </div>
    </div>
  );
}
