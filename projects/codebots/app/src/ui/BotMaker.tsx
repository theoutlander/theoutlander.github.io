import React, { useState, type CSSProperties } from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { BotAvatar } from "./components/BotAvatar";
import { loadBotConfig, saveBotConfig, resolveHex, type BotConfig } from "../state/botConfig";
import { analytics } from "../state/analytics";

const inputStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--text-md)",
  fontWeight: 700,
  color: "var(--ink)",
  background: "var(--surface-inset)",
  border: "var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "10px 12px",
  width: "100%",
  boxSizing: "border-box",
  letterSpacing: "1px",
};

const label: CSSProperties = {
  fontSize: "var(--text-2xs)",
  letterSpacing: "var(--label-tracking)",
  color: "var(--text-dim)",
  fontWeight: 700,
  marginBottom: 6,
};

function Swatches({
  paintbox,
  selected,
  onPick,
}: {
  paintbox: Record<string, string>;
  selected: string;
  onPick: (name: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {Object.entries(paintbox).map(([name, hex]) => {
        const isSel = selected === name || selected === hex;
        return (
          <button
            key={name}
            title={name}
            onClick={() => onPick(name)}
            style={{
              all: "unset",
              cursor: "pointer",
              width: 30,
              height: 30,
              borderRadius: 8,
              background: hex,
              boxSizing: "border-box",
              border: isSel ? "3px solid var(--ink)" : "2px solid rgba(0,0,0,.35)",
              boxShadow: isSel ? "0 0 0 2px var(--amber)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}

export function BotMaker({ onExit, onSaved }: { onExit: () => void; onSaved: () => void }) {
  const [config, setConfig] = useState<BotConfig>(() => loadBotConfig());
  const bodyHex = resolveHex(config.paint.body, config.paintbox);
  const domeHex = resolveHex(config.paint.dome, config.paintbox);

  function set<K extends keyof BotConfig>(key: K, value: BotConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }
  function setPaint(part: "body" | "dome", value: string) {
    setConfig((c) => ({ ...c, paint: { ...c.paint, [part]: value } }));
  }

  function save() {
    saveBotConfig(config);
    analytics.botSaved(config.playerName, config.botName);
    onSaved();
    onExit();
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "auto", padding: "20px 24px" }}>
      <div style={{ maxWidth: 760, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)" }}>BOT MAKER</div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {/* preview */}
          <Panel style={{ flex: "1 1 260px", alignItems: "center", justifyContent: "center", gap: 14, minHeight: 240 }}>
            <div style={label}>YOUR BOT</div>
            <BotAvatar body={bodyHex} dome={domeHex} width={200} />
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-xl)", color: "var(--cyan)" }}>
              {config.botName || "SPARKPLUG"}
            </div>
          </Panel>

          {/* controls */}
          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel>
              <div style={label}>PILOT NAME</div>
              <input
                style={inputStyle}
                maxLength={20}
                value={config.playerName}
                onChange={(e) => set("playerName", e.target.value)}
              />
              <div style={{ ...label, marginTop: 12 }}>BOT NAME</div>
              <input
                style={inputStyle}
                maxLength={16}
                value={config.botName}
                onChange={(e) => set("botName", e.target.value)}
              />
            </Panel>

            <Panel>
              <div style={label}>BODY PAINT</div>
              <Swatches paintbox={config.paintbox} selected={config.paint.body} onPick={(n) => setPaint("body", n)} />
              <div style={{ ...label, marginTop: 14 }}>DOME PAINT</div>
              <Swatches paintbox={config.paintbox} selected={config.paint.dome} onPick={(n) => setPaint("dome", n)} />
            </Panel>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="ghost" onClick={onExit}>
            ← BACK
          </Button>
          <Button onClick={save} style={{ flex: 1 }}>
            SAVE BOT
          </Button>
        </div>
      </div>
    </div>
  );
}
