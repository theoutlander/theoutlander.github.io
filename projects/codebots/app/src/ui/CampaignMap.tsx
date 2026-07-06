import React from "react";
import type { Mission } from "../sim/missionSchema";
import type { SaveData } from "../state/save";
import { Panel } from "./components/Panel";
import { Chip } from "./components/Chip";
import { Stars } from "./components/Stars";
import { Coin } from "./components/Coin";

/** A mission is unlocked if it's the first, or the previous mission has been cleared. */
export function isUnlocked(missions: Mission[], index: number, save: SaveData): boolean {
  if (index <= 0) return true;
  const prev = missions[index - 1];
  return !!save.missions[prev.id]?.cleared;
}

/**
 * World 1 campaign map — the mission dots the kid picks from. Locked missions show a dashed
 * "clear the last one" reason (never a grayed-out mystery). Authored missions beyond the current
 * set aren't shown yet; a dashed "more soon" chip teases them.
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

  return (
    <div style={{ padding: "22px 20px", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, width: "min(880px, 94vw)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)" }}>
          WORLD 1 · FIRST ROLL
        </div>
        <div style={{ flex: 1 }} />
        <Stars earned={totalStars} total={missions.length * 3} showCount size={14} />
        <Coin count={save.coins} />
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", width: "min(880px, 94vw)" }}>
        {missions.map((m, i) => {
          const prog = save.missions[m.id];
          const unlocked = isUnlocked(missions, i, save);
          return (
            <button
              key={m.id}
              onClick={() => unlocked && onPick(i)}
              disabled={!unlocked}
              style={{
                all: "unset",
                cursor: unlocked ? "pointer" : "not-allowed",
                width: 260,
                boxSizing: "border-box",
              }}
            >
              <Panel
                locked={!unlocked}
                active={unlocked && !prog?.cleared}
                style={{ gap: 10, minHeight: 118 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      border: "2px solid var(--line-strong)",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      fontSize: "var(--text-sm)",
                      color: prog?.cleared ? "var(--green)" : "var(--text-dim)",
                    }}
                  >
                    {prog?.cleared ? "✓" : m.index}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)" }}>
                    {m.title}
                  </div>
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>teaches {m.teaches}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {unlocked ? (
                    <Stars earned={prog?.stars ?? 0} total={3} size={14} />
                  ) : (
                    <Chip color="dim" dashed>
                      CLEAR CH {String(m.index - 1).padStart(2, "0")}
                    </Chip>
                  )}
                </div>
              </Panel>
            </button>
          );
        })}
        <div style={{ width: 260, display: "grid", placeItems: "center" }}>
          <Chip color="cyan" dashed>
            MORE MISSIONS SOON
          </Chip>
        </div>
      </div>
    </div>
  );
}
