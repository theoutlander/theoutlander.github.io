import React from "react";
import type { SaveData } from "../state/save";
import { ALL } from "../content/missions";
import { BADGES } from "../content/badges";
import { BotAvatar } from "./components/BotAvatar";
import { BadgeShelf } from "./BadgeShelf";
import { Panel } from "./components/Panel";

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 90 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", color: "var(--cyan)" }}>
        {value}
        {sub ? <span style={{ fontSize: "var(--text-md)", color: "var(--text-dim)" }}> {sub}</span> : null}
      </div>
      <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--label-tracking)", color: "var(--text-dim)", fontWeight: 700 }}>
        {label}
      </div>
    </div>
  );
}

/** The pilot's profile: who they are, how far they've come, and the full badge collection. */
export function Profile({
  bot,
  save,
}: {
  bot: { playerName: string; botName: string; bodyHex: string; domeHex: string };
  save: SaveData;
}) {
  const cleared = ALL.filter((m) => save.missions[m.id]?.cleared).length;
  const totalStars = ALL.reduce((n, m) => n + (save.missions[m.id]?.stars ?? 0), 0);
  const badgeCount = (save.badges ?? []).length;

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "28px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
          <BotAvatar body={bot.bodyHex} dome={bot.domeHex} width={140} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--label-tracking)", color: "var(--text-dim)", fontWeight: 700 }}>
              PILOT
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)" }}>
              {bot.playerName}
            </div>
            <div style={{ fontSize: "var(--text-md)", color: "var(--cyan)", fontWeight: 700 }}>
              bot: {bot.botName}
            </div>
          </div>
        </div>

        <Panel label="STATS">
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", padding: "4px 0" }}>
            <Stat label="LEVELS CLEARED" value={cleared} sub={`/ ${ALL.length}`} />
            <Stat label="STARS" value={totalStars} sub={`/ ${ALL.length * 3}`} />
            <Stat label="COINS" value={save.coins} />
            <Stat label="BADGES" value={badgeCount} sub={`/ ${BADGES.length}`} />
          </div>
        </Panel>

        <Panel label="BADGES">
          <BadgeShelf save={save} />
        </Panel>
      </div>
    </div>
  );
}
