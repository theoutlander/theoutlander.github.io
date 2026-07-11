import React from "react";
import { Panel } from "./components/Panel";
import { Chip } from "./components/Chip";
import { Coin } from "./components/Coin";
import { CHASSIS, PARTS, computeStats, isPartOwnable, type Part } from "../content/parts";
import { buyChassis, buyPart, toggleEquip, type SaveData } from "../state/save";

/**
 * The Garage — where coins finally go. Capability parts are EARNED by learning (never sold); stat
 * parts cost coins AND weight (trade-offs); cosmetics are pure style. Your loadout only matters in
 * the Arena, so learning is never gated behind gear.
 */
export function GarageScreen({ save, onSave }: { save: SaveData; onSave: (s: SaveData) => void }) {
  const { loadout, coins } = save;
  const stats = computeStats(loadout.chassis, loadout.equipped);
  const bad = stats.overWeight || stats.overSlots;

  const groups: { kind: Part["kind"]; title: string; blurb: string }[] = [
    { kind: "capability", title: "ABILITIES — earned by learning", blurb: "These are what let your bot DO things. You can't buy them: clear the level that teaches them." },
    { kind: "stat", title: "GEAR — costs coins AND weight", blurb: "Every one has a downside. Your frame can only carry so much, so you have to choose." },
    { kind: "cosmetic", title: "STYLE — just for looks", blurb: "No effect on a fight. Purely you." },
  ];

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)" }}>GARAGE</div>
          <div style={{ flex: 1 }} />
          <Coin count={coins} />
        </div>

        {/* Loadout summary — the puzzle you're solving */}
        <Panel label="YOUR BOT" active>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap", alignItems: "center" }}>
            <Stat label="SLOTS" value={`${stats.slotsUsed}/${stats.slots}`} bad={stats.overSlots} />
            <Stat label="WEIGHT" value={`${stats.weightUsed}/${stats.capacity}`} bad={stats.overWeight} />
            <Stat label="ARMOUR" value={stats.armor} />
            <Stat label="DAMAGE" value={stats.damage} />
            <Stat label="RANGE" value={stats.range} />
          </div>
          {bad ? (
            <div style={{ marginTop: 8, color: "var(--red)", fontSize: "var(--text-sm)", fontWeight: 700 }}>
              {stats.overWeight ? "Too heavy for this frame — take something off, or get a bigger chassis." : "Too many parts for this frame — take one off."}
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
              Your loadout matters in the Arena. Remember: <b>good code beats good gear.</b>
            </div>
          )}
        </Panel>

        {/* Chassis */}
        <Panel label="CHASSIS — the frame everything bolts onto">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {CHASSIS.map((c) => {
              const owned = loadout.chassis === c.id;
              const afford = coins >= c.cost;
              return (
                <button key={c.id}
                  onClick={() => { if (owned) return; const next = buyChassis(save, c.id, c.cost); if (next) onSave(next); }}
                  disabled={!owned && !afford}
                  style={{ all: "unset", cursor: owned ? "default" : afford ? "pointer" : "not-allowed",
                    width: 250, padding: 12, borderRadius: 10, boxSizing: "border-box",
                    border: `1.5px solid ${owned ? "var(--cyan)" : "var(--line)"}`,
                    background: owned ? "rgba(95,212,255,.07)" : "transparent",
                    opacity: !owned && !afford ? 0.5 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>{c.name}</span>
                    {owned ? <Chip color="cyan">EQUIPPED</Chip> : c.cost === 0 ? null : <Coin count={c.cost} />}
                  </div>
                  <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", marginTop: 4, lineHeight: 1.4 }}>{c.desc}</div>
                  <div style={{ fontSize: "var(--text-2xs)", color: "var(--amber)", marginTop: 4 }}>
                    {c.slots} slots · carries {c.capacity} · armour {c.armor}
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        {/* Parts, grouped so the rules are obvious */}
        {groups.map((g) => (
          <Panel key={g.kind} label={g.title}>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", marginBottom: 8 }}>{g.blurb}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {PARTS.filter((p) => p.kind === g.kind).map((p) => {
                const ownable = isPartOwnable(p, save.unlocked, loadout.bought);
                const equipped = loadout.equipped.includes(p.id);
                const afford = coins >= p.cost;
                const locked = p.kind === "capability" && !ownable;
                const buyable = p.kind !== "capability" && !ownable;
                return (
                  <div key={p.id}
                    style={{ width: 250, padding: 12, borderRadius: 10, boxSizing: "border-box",
                      border: `1.5px ${locked ? "dashed" : "solid"} ${equipped ? "var(--green)" : "var(--line)"}`,
                      background: equipped ? "rgba(111,227,165,.06)" : "transparent", opacity: locked ? 0.55 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: "var(--ink)" }}>{p.name}</span>
                      {equipped ? <Chip color="green">ON</Chip> : null}
                      {p.weight !== 0 ? (
                        <span style={{ fontSize: "var(--text-2xs)", color: p.weight < 0 ? "var(--green)" : "var(--amber)" }}>
                          {p.weight > 0 ? `+${p.weight} weight` : `${p.weight} weight`}
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", marginTop: 4, lineHeight: 1.4 }}>{p.desc}</div>
                    {p.tradeoff ? (
                      <div style={{ fontSize: "var(--text-2xs)", color: "var(--red)", marginTop: 4, fontStyle: "italic" }}>{p.tradeoff}</div>
                    ) : null}

                    <div style={{ marginTop: 8 }}>
                      {locked ? (
                        <Chip color="dim" dashed>LOCKED — learn it to earn it</Chip>
                      ) : buyable ? (
                        <button
                          onClick={() => { const next = buyPart(save, p.id, p.cost); if (next) onSave(next); }}
                          disabled={!afford}
                          style={{ all: "unset", cursor: afford ? "pointer" : "not-allowed",
                            border: "1.5px solid var(--amber)", borderRadius: 999, padding: "4px 12px",
                            fontSize: "var(--text-2xs)", fontWeight: 700, color: "var(--amber)", opacity: afford ? 1 : 0.5 }}>
                          BUY · {p.cost}
                        </button>
                      ) : (
                        <button
                          onClick={() => onSave(toggleEquip(save, p.id))}
                          style={{ all: "unset", cursor: "pointer",
                            border: `1.5px solid ${equipped ? "var(--red)" : "var(--green)"}`, borderRadius: 999,
                            padding: "4px 12px", fontSize: "var(--text-2xs)", fontWeight: 700,
                            color: equipped ? "var(--red)" : "var(--green)" }}>
                          {equipped ? "TAKE OFF" : "EQUIP"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, bad = false }: { label: string; value: string | number; bad?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", color: bad ? "var(--red)" : "var(--cyan)" }}>
        {value}
      </div>
      <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "1px", color: "var(--text-dim)", fontWeight: 700 }}>{label}</div>
    </div>
  );
}
