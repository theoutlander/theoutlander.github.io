import React from "react";
import { BADGES } from "../content/badges";
import type { SaveData } from "../state/save";
import { BadgeIcon } from "./components/BadgeIcon";

/**
 * The badge collection: every badge, earned ones in color, locked ones dim with their "how to earn"
 * hint. A kid sees the whole set from the start (so there's something to chase) and watches it fill in.
 */
export function BadgeShelf({ save, compact = false }: { save: SaveData; compact?: boolean }) {
  const earned = new Set(save.badges ?? []);
  const size = compact ? 44 : 56;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 90 : 116}px, 1fr))`,
        gap: compact ? 10 : 14,
      }}
    >
      {BADGES.map((b) => {
        const has = earned.has(b.id);
        return (
          <div
            key={b.id}
            title={b.desc}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center",
              padding: compact ? "8px 4px" : "12px 6px", borderRadius: 10,
              border: has ? "1.5px solid var(--line-strong)" : "1.5px dashed var(--line)",
              background: has ? "rgba(255,180,84,.05)" : "transparent",
              opacity: has ? 1 : 0.6,
            }}
          >
            <BadgeIcon icon={b.icon} earned={has} size={size} />
            <div style={{ fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "0.5px", color: has ? "var(--ink)" : "var(--text-dim)" }}>
              {b.title}
            </div>
            {!compact ? (
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.35 }}>
                {has ? b.desc : `Locked — ${b.desc.toLowerCase()}`}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
