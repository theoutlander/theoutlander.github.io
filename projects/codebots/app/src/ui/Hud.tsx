import React from "react";
import { Panel } from "./components/Panel";
import { Meter } from "./components/Meter";

/**
 * World 1 HUD: ARMOR (the always-on health meter) and SCORE (points ticker). SPEED, WEIGHT, and
 * CHARGE are deliberately absent — Law 5 says a number never appears before the kid has felt what
 * it does, and those debut in Worlds 3 and 5.
 */
export function Hud({ score, armor }: { score: number; armor: number }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Panel style={{ flex: 1, minWidth: 180, padding: "10px 14px", flexDirection: "row", alignItems: "center" }}>
        <Meter label="ARMOR" value={armor} style={{ flex: 1 }} />
      </Panel>
      <Panel style={{ minWidth: 130, padding: "10px 14px", flexDirection: "row", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--label-tracking)", color: "var(--text-dim)", fontWeight: 700 }}>
          SCORE
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--amber)" }}>
          {score}
        </span>
      </Panel>
    </div>
  );
}
