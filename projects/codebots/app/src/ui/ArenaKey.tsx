import React, { type CSSProperties } from "react";
import type { Arena } from "../sim/types";
import { Panel } from "./components/Panel";

const sq: CSSProperties = { width: 20, height: 20, borderRadius: 4, flex: "none", position: "relative", boxSizing: "border-box" };

function Crate() {
  return (
    <div style={{ ...sq, border: "2px solid var(--crate)", background: "rgba(127,168,224,.12)" }}>
      <div style={{ position: "absolute", inset: 2, background: "linear-gradient(45deg,transparent 44%,var(--crate) 46%,var(--crate) 54%,transparent 56%),linear-gradient(-45deg,transparent 44%,var(--crate) 46%,var(--crate) 54%,transparent 56%)" }} />
    </div>
  );
}
function Mud() {
  return (
    <div style={{ ...sq, background: "#243a63" }}>
      <div style={{ position: "absolute", left: 4, top: 5, width: 3, height: 3, borderRadius: 3, background: "rgba(0,0,0,.4)" }} />
      <div style={{ position: "absolute", right: 4, top: 6, width: 3, height: 3, borderRadius: 3, background: "rgba(0,0,0,.4)" }} />
      <div style={{ position: "absolute", left: 8, bottom: 4, width: 3, height: 3, borderRadius: 3, background: "rgba(0,0,0,.4)" }} />
    </div>
  );
}
function Pit() {
  return <div style={{ ...sq, background: "#050a14", border: "2px solid #14203c" }} />;
}
function Steel() {
  return <div style={{ ...sq, background: "var(--steel)", border: "2px solid var(--steel-edge)" }} />;
}
function Gate() {
  return (
    <div style={{ ...sq, border: "2px solid var(--amber)", display: "flex", gap: 2, alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 2, height: 12, background: "var(--amber)" }} />
      ))}
    </div>
  );
}
function Pad() {
  return <div style={{ ...sq, borderRadius: "50%", border: "2px solid var(--amber)", background: "rgba(255,180,84,.12)" }} />;
}
function Tank() {
  return (
    <div style={{ ...sq, background: "var(--steel)", border: "2px solid var(--steel-edge)", display: "grid", placeItems: "center" }}>
      <div style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--red)" }} />
    </div>
  );
}
function Chest() {
  return <div style={{ ...sq, background: "var(--amber)", border: "2px solid #6b4a1f" }} />;
}
function Beacon() {
  return <div style={{ ...sq, borderRadius: 3, transform: "rotate(45deg)", background: "var(--cyan)" }} />;
}

interface Entry {
  icon: React.ReactNode;
  name: string;
  desc: string;
}

/** The elements actually present in this mission's arena, so the kid knows what each box is. */
export function ArenaKey({ arena }: { arena: Arena }) {
  const cells = arena.cells.flat();
  const entries: Entry[] = [];

  entries.push({
    icon: arena.beaconStyle === "chest" ? <Chest /> : <Beacon />,
    name: arena.beaconStyle === "chest" ? "CHEST" : "BEACON",
    desc: "your goal — reach it",
  });
  if (arena.crates.length) entries.push({ icon: <Crate />, name: "CRATE", desc: "blocks you — go around" });
  if (cells.includes("wall")) entries.push({ icon: <Steel />, name: "STEEL", desc: "a solid wall" });
  if (cells.includes("mud")) entries.push({ icon: <Mud />, name: "MUD", desc: "slows you down" });
  if (cells.includes("pit")) entries.push({ icon: <Pit />, name: "PIT", desc: "don't fall in! −40" });
  if (arena.gates.length) {
    entries.push({ icon: <Pad />, name: "PAD", desc: "stop here and honk()" });
    entries.push({ icon: <Gate />, name: "GATE", desc: "opens when you honk on its pad" });
  }
  if ((arena.obstacles ?? []).some((o) => o.kind === "tank"))
    entries.push({ icon: <Tank />, name: "TANK", desc: "Sprocket — blocks the lane" });

  return (
    <Panel label="ARENA KEY">
      {entries.map((e) => (
        <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderTop: "1px dashed var(--line)" }}>
          {e.icon}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ink)", letterSpacing: "1px" }}>{e.name}</div>
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)" }}>{e.desc}</div>
          </div>
        </div>
      ))}
    </Panel>
  );
}
