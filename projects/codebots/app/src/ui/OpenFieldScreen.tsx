import React, { useEffect, useRef, useState } from "react";
import type { SimEvent } from "../sim/events";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Editor } from "../editor/Editor";
import { mountArena, type MountedArena } from "../view/mountArena";
import { SandboxClient } from "../sandbox/sandboxClient";
import { Sfx } from "../sound/sfx";
import { generateChallenge } from "../content/openField";
import { analytics } from "../state/analytics";

const SOLVED_KEY = "cb.field.solved";
const loadSolved = () => {
  try { return parseInt(localStorage.getItem(SOLVED_KEY) || "0", 10) || 0; } catch { return 0; }
};
const saveSolved = (n: number) => { try { localStorage.setItem(SOLVED_KEY, String(n)); } catch { /* ignore */ } };

/**
 * Open Field — endless free-play. A fresh, guaranteed-solvable challenge each time; the kid writes
 * any program to reach the beacon. No stars or par — solve it and the next field rolls in. Reuses
 * the same arena + editor + sandbox as the campaign; just a lighter loop (no scoring/save).
 */
export function OpenFieldScreen({ paint }: { paint: { bodyColor: number; domeColor: number } }) {
  const arenaHost = useRef<HTMLDivElement>(null);
  const arena = useRef<MountedArena | null>(null);
  const client = useRef<SandboxClient | null>(null);
  const sfx = useRef<Sfx | null>(null);

  const [n, setN] = useState(0);
  const [challenge, setChallenge] = useState(() => generateChallenge(0));
  const [code, setCode] = useState(challenge.starterCode);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<{ text: string; tone: "dim" | "win" | "error" }>({ text: "a fresh field — reach the beacon!", tone: "dim" });
  const [solved, setSolved] = useState(loadSolved);
  const [errorLine, setErrorLine] = useState<number | null>(null);

  // Sandbox + sound live for the whole session.
  useEffect(() => {
    client.current = new SandboxClient();
    sfx.current = new Sfx();
    analytics.fieldOpen();
    return () => { client.current?.dispose(); client.current = null; };
  }, []);

  // The arena is rebuilt for each new challenge.
  useEffect(() => {
    let cancelled = false;
    if (arenaHost.current) {
      mountArena(arenaHost.current, challenge, paint).then((m) => {
        if (cancelled) { m.destroy(); return; }
        arena.current = m;
      });
    }
    return () => { cancelled = true; arena.current?.destroy(); arena.current = null; };
  }, [challenge, paint]);

  function nextField() {
    const next = n + 1;
    setN(next);
    const c = generateChallenge(next);
    setChallenge(c);
    setCode(c.starterCode);
    setErrorLine(null);
    setStatus({ text: "new field! reach the beacon.", tone: "dim" });
  }

  async function run() {
    const a = arena.current;
    const c = client.current;
    if (!a || !c || running) return;
    setRunning(true);
    setErrorLine(null);
    setStatus({ text: "rolling…", tone: "dim" });
    a.scene.reset();

    const res = await c.run(code, challenge);
    if (!res.ok) {
      setErrorLine(res.error.line);
      setStatus({ text: res.error.message, tone: "error" });
      sfx.current?.play({ tick: 0, type: "bump", at: challenge.start.pos } as SimEvent);
      setRunning(false);
      return;
    }
    a.scene.play(res.run.events, {
      onEvent: (ev) => sfx.current?.play(ev),
      onDone: () => {
        setRunning(false);
        if (res.run.cleared) {
          const total = solved + 1;
          setSolved(total);
          saveSolved(total);
          analytics.fieldSolved(total);
          setStatus({ text: `★ SOLVED! that's ${total}. hit NEW FIELD for another.`, tone: "win" });
        } else {
          setStatus({ text: "didn't reach the beacon — tweak it and run again", tone: "error" });
        }
      },
    });
  }

  const toneColor = status.tone === "win" ? "var(--green)" : status.tone === "error" ? "var(--red)" : "var(--text-dim)";

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", height: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ width: 220, flex: "none", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        <Panel label="OPEN FIELD">
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
            A brand-new field every time — no stars, no par. Just reach the beacon however you like.
          </div>
        </Panel>
        <Panel label="SOLVED">
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", color: "var(--amber)" }}>
            {solved}
          </div>
        </Panel>
        <Button variant="ghost" size="sm" onClick={nextField} disabled={running}>
          ↻ NEW FIELD
        </Button>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div ref={arenaHost} style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: "hidden" }} />
        <div style={{ fontSize: "var(--text-sm)", color: toneColor, fontWeight: 700, minHeight: 20 }}>{status.text}</div>
      </div>

      <div style={{ width: 380, flex: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor value={code} onChange={setCode} onRun={run} errorLine={errorLine} world={4} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button onClick={run} disabled={running} style={{ flex: 1 }}>
            {running ? "■ RUNNING" : "▶ RUN"}
          </Button>
          <Button variant="ghost" onClick={nextField} disabled={running}>
            SKIP
          </Button>
        </div>
      </div>
    </div>
  );
}
