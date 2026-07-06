import React, { useState } from "react";
import { Chip } from "./ui/components/Chip";
import { Coin } from "./ui/components/Coin";
import { MissionScreen } from "./ui/MissionScreen";
import { WORLD1 } from "./content/missions";
import { loadBotIdentity } from "./state/paint";
import { loadSave } from "./state/save";

/**
 * App shell for the M1 slice: the CodeBots header + the Mission screen for World 1 Mission 1.
 * The boot | map screen state machine and the rest of World 1 arrive in the next plan.
 */
export function App() {
  const bot = loadBotIdentity();
  const mission = WORLD1[0];
  const [coins, setCoins] = useState(() => loadSave().coins);

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: "var(--border)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-.5px" }}>
          CODE<span style={{ color: "var(--amber)" }}>BOTS</span>
        </div>
        <Chip color="dim">PILOT: {bot.playerName}</Chip>
        <Chip color="cyan">BOT: {bot.botName}</Chip>
        <div style={{ flex: 1 }} />
        <Chip color="amber">
          {mission.id.toUpperCase()} · {mission.teaches.toUpperCase()}
        </Chip>
        <Coin count={coins} />
      </div>
      <MissionScreen
        mission={mission}
        paint={{ bodyColor: bot.bodyColor, domeColor: bot.domeColor }}
        onCoins={setCoins}
      />
    </div>
  );
}
