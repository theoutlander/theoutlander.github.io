import React, { useEffect, useRef, useState } from "react";
import { Panel } from "./ui/components/Panel";
import { Chip } from "./ui/components/Chip";
import { Button } from "./ui/components/Button";
import { WORLD1 } from "./content/missions";
import { loadBotIdentity } from "./state/paint";
import { handleRequest } from "./sandbox/protocol";
import { mountArena, type MountedArena } from "./view/mountArena";

/**
 * TEMPORARY M1-D probe: mounts the Phaser arena for M1 and plays the author solution on RUN, so
 * the arena rendering and playback can be verified in the browser. M1-G replaces this with the
 * real Mission screen.
 */
export function App() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef<MountedArena | null>(null);
  const [ready, setReady] = useState(false);
  const mission = WORLD1[0];
  const bot = loadBotIdentity();

  useEffect(() => {
    let cancelled = false;
    if (!arenaRef.current) return;
    mountArena(arenaRef.current, mission, { bodyColor: bot.bodyColor, domeColor: bot.domeColor }).then(
      (m) => {
        if (cancelled) {
          m.destroy();
          return;
        }
        mountedRef.current = m;
        setReady(true);
      },
    );
    return () => {
      cancelled = true;
      mountedRef.current?.destroy();
      mountedRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function run() {
    const m = mountedRef.current;
    if (!m) return;
    m.scene.reset();
    const res = handleRequest({ id: 1, code: mission.authorSolution, mission });
    if (res.ok) m.scene.play(res.run.events);
  }

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 20px", borderBottom: "var(--border)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: "-.5px" }}>
          CODE<span style={{ color: "var(--amber)" }}>BOTS</span>
        </div>
        <Chip color="dim">PILOT: {bot.playerName}</Chip>
        <Chip color="cyan">BOT: {bot.botName}</Chip>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, alignItems: "center", padding: 24 }}>
        <Panel label={`${mission.id.toUpperCase()} — ARENA PROBE`} style={{ width: "min(600px, 90vw)" }}>
          <div
            ref={arenaRef}
            style={{
              width: "100%",
              height: 340,
              background: "var(--surface-arena)",
              border: "var(--border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          />
          <div style={{ marginTop: 10 }}>
            <Button onClick={run} disabled={!ready}>
              ▶ RUN
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
