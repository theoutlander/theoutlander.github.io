import React, { useState, useEffect } from "react";
import { Chip } from "./ui/components/Chip";
import { Coin } from "./ui/components/Coin";
import { MissionScreen } from "./ui/MissionScreen";
import { CampaignMap, isUnlocked } from "./ui/CampaignMap";
import { WORLD1 } from "./content/missions";
import { loadBotIdentity } from "./state/paint";
import { loadSave } from "./state/save";
import { analytics } from "./state/analytics";

type Screen = { name: "map" } | { name: "mission"; index: number };

/**
 * App shell: the CodeBots header + a map ↔ mission state machine for World 1. Coins live in App
 * so the header ticker updates the moment a mission pays out; everything else reads localStorage.
 */
export function App() {
  const bot = loadBotIdentity();
  const [screen, setScreen] = useState<Screen>({ name: "map" });
  const [coins, setCoins] = useState(() => loadSave().coins);

  useEffect(() => {
    analytics.gameOpen(); // fires once when the game loads — top of the level funnel
  }, []);
  // bump to re-read the save after a mission clears (unlocks next dot on the map)
  const [, force] = useState(0);
  const save = loadSave();

  const mission = screen.name === "mission" ? WORLD1[screen.index] : null;

  function openMission(index: number) {
    analytics.levelOpen(WORLD1[index].index, WORLD1[index].title);
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
        {/* Breadcrumbs — where you are, and how to go back. Click "WORLD 1" to return to the map. */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-sm)" }}>
          <button
            onClick={toMap}
            disabled={!mission}
            style={{
              all: "unset",
              cursor: mission ? "pointer" : "default",
              fontWeight: 700,
              letterSpacing: "1px",
              color: mission ? "var(--cyan)" : "var(--ink)",
            }}
          >
            {mission ? "‹ MAP" : "THE MAP"}
          </button>
          {mission ? (
            <>
              <span style={{ color: "var(--text-dim)" }}>›</span>
              <span style={{ color: "var(--ink)", fontWeight: 700, letterSpacing: "1px" }}>
                LEVEL {mission.index} · {mission.title}
              </span>
            </>
          ) : null}
        </div>
        <div style={{ flex: 1 }} />
        <Chip color="dim">PILOT: {bot.playerName}</Chip>
        <Chip color="cyan">BOT: {bot.botName}</Chip>
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
