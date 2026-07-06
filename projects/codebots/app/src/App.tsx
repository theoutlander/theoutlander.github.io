import React from "react";
import { Panel } from "./ui/components/Panel";
import { Chip } from "./ui/components/Chip";

/**
 * App shell. For the M1 slice this is a placeholder that proves the design tokens, fonts, and
 * ported components render; M1-G replaces the body with the real Mission screen and a
 * boot | map | mission state machine.
 */
export function App() {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "13px 20px",
          borderBottom: "var(--border)",
        }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-.5px" }}>
          CODE<span style={{ color: "var(--amber)" }}>BOTS</span>
        </div>
        <Chip color="dim">PILOT: CADET ASHA</Chip>
        <Chip color="cyan">BOT: SPARKPLUG</Chip>
      </div>
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
        <Panel label="TANK RADIO" style={{ maxWidth: 420 }}>
          <div style={{ fontSize: "var(--text-md)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
            Tank online. Awaiting program.
          </div>
        </Panel>
      </div>
    </div>
  );
}
