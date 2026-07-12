import React from "react";
import type { Mission } from "../sim/missionSchema";
import type { SaveData } from "../state/save";
import { WORLD_META } from "../content/missions";
import { Panel } from "./components/Panel";
import { Chip } from "./components/Chip";
import { Stars } from "./components/Stars";
import { Coin } from "./components/Coin";

/** A mission is unlocked if it's the first in the whole campaign, or the previous one is cleared. */
export function isUnlocked(missions: Mission[], index: number, save: SaveData): boolean {
  if (index <= 0) return true;
  const prev = missions[index - 1];
  return !!save.missions[prev.id]?.cleared;
}

/**
 * The campaign map — one flat ladder of levels, split into world sections. Levels carry a single
 * global number ("LEVEL 9"); locked levels show a dashed "clear the last one" reason (never a
 * grayed-out mystery). A trailing "more soon" chip teases worlds not yet authored.
 */
export function CampaignMap({
  missions,
  save,
  onPick,
}: {
  missions: Mission[];
  save: SaveData;
  onPick: (index: number) => void;
}) {
  const totalStars = missions.reduce((n, m) => n + (save.missions[m.id]?.stars ?? 0), 0);
  const worlds = [...new Set(missions.map((m) => m.world))];
  const allWorldsAuthored = worlds.length >= WORLD_META.length;

  function renderCard(m: Mission, i: number) {
    const prog = save.missions[m.id];
    const unlocked = isUnlocked(missions, i, save);
    const levelNo = i + 1;
    return (
      <button
        key={m.id}
        onClick={() => unlocked && onPick(i)}
        disabled={!unlocked}
        style={{ all: "unset", cursor: unlocked ? "pointer" : "not-allowed", width: 260, boxSizing: "border-box" }}
      >
        <Panel locked={!unlocked} active={unlocked && !prog?.cleared} style={{ gap: 10, minHeight: 118 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 26, height: 26, borderRadius: 8, border: "2px solid var(--line-strong)",
                display: "grid", placeItems: "center", fontWeight: 700, fontSize: "var(--text-sm)",
                color: prog?.cleared ? "var(--green)" : "var(--text-dim)",
              }}
            >
              {prog?.cleared ? "✓" : levelNo}
            </div>
            <div>
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", letterSpacing: "1px", fontWeight: 700 }}>
                LEVEL {levelNo}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)" }}>
                {m.title}
              </div>
            </div>
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>teaches {m.teaches}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {unlocked ? (
              <Stars earned={prog?.stars ?? 0} total={3} size={14} />
            ) : (
              <Chip color="dim" dashed>
                CLEAR LEVEL {levelNo - 1}
              </Chip>
            )}
          </div>
        </Panel>
      </button>
    );
  }

  return (
    <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, width: "min(880px, 94vw)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)" }}>
          THE MAP
        </div>
        <div style={{ flex: 1 }} />
        <Stars earned={totalStars} total={missions.length * 3} showCount size={14} />
        <Coin count={save.coins} />
      </div>

      {worlds.map((world) => {
        const meta = WORLD_META.find((w) => w.world === world);
        return (
          <div key={world} style={{ width: "min(880px, 94vw)", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
              <span style={{ fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "1.5px", color: "var(--cyan)" }}>
                WORLD {world}
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)" }}>
                {meta?.name ?? ""}
              </span>
              <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)" }}>{meta?.subtitle ?? ""}</span>
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {missions.map((m, i) => (m.world === world ? renderCard(m, i) : null))}
            </div>
          </div>
        );
      })}

      {!allWorldsAuthored ? (
        <div style={{ width: "min(880px, 94vw)", display: "grid", placeItems: "center" }}>
          <Chip color="cyan" dashed>
            MORE WORLDS SOON
          </Chip>
        </div>
      ) : null}
    </div>
  );
}
