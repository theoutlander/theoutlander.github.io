import React, { type CSSProperties } from "react";
import { Panel } from "./components/Panel";
import { Chip } from "./components/Chip";
import { Stars } from "./components/Stars";
import { Coin } from "./components/Coin";
import { BotAvatar } from "./components/BotAvatar";
import type { SaveData } from "../state/save";
import type { Mission } from "../sim/missionSchema";

function Door({
  title,
  desc,
  chip,
  chipColor = "amber",
  locked = false,
  onClick,
}: {
  title: string;
  desc: string;
  chip: string;
  chipColor?: "amber" | "cyan" | "green" | "dim";
  locked?: boolean;
  onClick?: () => void;
}) {
  const wrap: CSSProperties = { all: "unset", cursor: locked ? "not-allowed" : "pointer", flex: "1 1 200px", boxSizing: "border-box" };
  return (
    <button style={wrap} disabled={locked} onClick={onClick}>
      <Panel locked={locked} active={!locked} style={{ gap: 8, minHeight: 130 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-xl)" }}>{title}</div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", lineHeight: 1.55, flex: 1 }}>{desc}</div>
        <Chip color={locked ? "dim" : chipColor} dashed={locked}>
          {chip}
        </Chip>
      </Panel>
    </button>
  );
}

/** HQ — the hub. The bot rolls in; four doors lead out. */
export function HQ({
  bot,
  save,
  missions,
  onPlay,
  onBotMaker,
}: {
  bot: { playerName: string; botName: string; bodyHex: string; domeHex: string };
  save: SaveData;
  missions: Mission[];
  onPlay: () => void;
  onBotMaker: () => void;
}) {
  const totalStars = missions.reduce((n, m) => n + (save.missions[m.id]?.stars ?? 0), 0);
  const cleared = missions.filter((m) => save.missions[m.id]?.cleared).length;
  const nextLevel = Math.min(cleared + 1, missions.length);

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "28px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <BotAvatar body={bot.bodyHex} dome={bot.domeHex} width={150} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--label-tracking)", color: "var(--text-dim)", fontWeight: 700 }}>
              WELCOME BACK, {bot.playerName.toUpperCase()}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", color: "var(--cyan)" }}>
              {bot.botName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <Stars earned={totalStars} total={missions.length * 3} showCount size={14} />
              <Coin count={save.coins} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Door
            title="CAMPAIGN"
            desc={`First Roll — ${cleared}/${missions.length} levels cleared. The Rust Pirates await.`}
            chip={cleared === 0 ? "START →" : `CONTINUE · LEVEL ${nextLevel} →`}
            onClick={onPlay}
          />
          <Door
            title="BOT MAKER"
            desc="Name your bot and paint it. Make it yours — the color lab is open."
            chip="PAINT & NAME"
            chipColor="cyan"
            onClick={onBotMaker}
          />
          <Door
            title="GARAGE"
            desc="Spend C-coins on unlocked parts. Weight is destiny."
            chip="OPENS IN WORLD 2"
            locked
          />
          <Door
            title="PLAY"
            desc="Time trials vs your ghost · treasure runs."
            chip="OPENS IN WORLD 2"
            locked
          />
        </div>
      </div>
    </div>
  );
}
