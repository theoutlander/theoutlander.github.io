import React, { useEffect, useRef, useState } from "react";
import type { Mission } from "../sim/missionSchema";
import type { SimEvent } from "../sim/events";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Hud } from "./Hud";
import { TankRadio, type RadioLine } from "./TankRadio";
import { ResultOverlay, type MissionResult } from "./ResultOverlay";
import { Editor } from "../editor/Editor";
import { mountArena, type MountedArena } from "../view/mountArena";
import { SandboxClient } from "../sandbox/sandboxClient";
import { Sfx } from "../sound/sfx";
import { loadSave, saveSave, recordResult } from "../state/save";
import { countCodeLines } from "../sandbox/lines";

const W1_COMMANDS = [
  { sig: "forward(n)", desc: "roll forward n squares" },
  { sig: "left() / right()", desc: "turn 90° in place" },
  { sig: "honk()", desc: "sound the AIR HORN" },
];

export function MissionScreen({
  mission,
  paint,
  onCoins,
  onExit,
  onNext,
  hasNext,
}: {
  mission: Mission;
  paint: { bodyColor: number; domeColor: number };
  onCoins: (total: number) => void;
  onExit: () => void;
  onNext: () => void;
  hasNext: boolean;
}) {
  const arenaHost = useRef<HTMLDivElement>(null);
  const arena = useRef<MountedArena | null>(null);
  const client = useRef<SandboxClient | null>(null);
  const sfx = useRef<Sfx | null>(null);

  const [code, setCode] = useState(mission.starterCode);
  const [hud, setHud] = useState({ score: 0, armor: 100 });
  const [radio, setRadio] = useState<RadioLine[]>([]);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MissionResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    client.current = new SandboxClient();
    sfx.current = new Sfx();
    if (arenaHost.current) {
      mountArena(arenaHost.current, mission, paint).then((m) => {
        if (cancelled) {
          m.destroy();
          return;
        }
        arena.current = m;
      });
    }
    return () => {
      cancelled = true;
      arena.current?.destroy();
      arena.current = null;
      client.current?.dispose();
      client.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addRadio(text: string, tone: RadioLine["tone"] = "dim") {
    setRadio((r) => [...r, { text, tone }]);
  }

  async function run() {
    const a = arena.current;
    const c = client.current;
    if (!a || !c || running) return;

    setRunning(true);
    setErrorLine(null);
    setResult(null);
    setHud({ score: 0, armor: 100 });
    setRadio([{ text: "program uploaded — rolling…", tone: "dim" }]);
    a.scene.reset();

    const res = await c.run(code, mission);
    if (!res.ok) {
      // Errors never cost points — point at the line, suggest a fix, keep going.
      setErrorLine(res.error.line);
      addRadio(res.error.message, "error");
      sfx.current?.play({ tick: 0, type: "bump", at: mission.start.pos } as SimEvent);
      setRunning(false);
      return;
    }

    let armor = 100;
    a.scene.play(res.run.events, {
      onEvent: (ev) => {
        sfx.current?.play(ev);
        if (ev.type === "score") setHud((h) => ({ ...h, score: ev.total }));
        if (ev.type === "bump") {
          armor = Math.max(0, armor - 8);
          setHud((h) => ({ ...h, armor }));
          addRadio("CLUNK! hit a wall — fix the program and run again", "error");
        }
        if (ev.type === "fall") addRadio("WHOA! that's a pit — −40. steer around it", "error");
        if (ev.type === "gateOpen") addRadio("gate open!", "info");
        if (ev.type === "honk") addRadio("HONK!", "info");
        if (ev.type === "clear") addRadio("★ beacon reached!", "success");
      },
      onDone: () => {
        setRunning(false);
        if (res.run.cleared) finish(res.run.stars);
        else addRadio("didn't reach the beacon — try a different route", "dim");
      },
    });
  }

  function finish(stars: number) {
    const save = loadSave();
    const { save: next, coinsEarned, newlyUnlocked } = recordResult(
      save,
      mission.id,
      stars,
      mission.unlock?.part,
    );
    saveSave(next);
    onCoins(next.coins);
    setResult({
      stars,
      coinsEarned,
      newlyUnlocked,
      lines: countCodeLines(code),
      par: mission.parLines,
      cutscene: mission.cutscene,
    });
  }

  function stop() {
    arena.current?.scene.reset();
    setRunning(false);
    setHud({ score: 0, armor: 100 });
  }

  function reset() {
    stop();
    setCode(mission.starterCode);
    setErrorLine(null);
    setHintLevel(0);
    setRadio([]);
  }

  const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "14px 20px",
        alignItems: "stretch",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* LEFT: briefing, commands, hint */}
      <div style={{ ...col, width: 240, flex: "none", overflowY: "auto" }}>
        <Button variant="ghost" size="sm" onClick={onExit}>
          ← MISSION MAP
        </Button>
        <Panel label="BRIEFING">
          <div style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)", color: "var(--text-body)" }}>
            {mission.briefing}
          </div>
        </Panel>
        <Panel label="COMMANDS">
          {W1_COMMANDS.map((cmd) => (
            <div key={cmd.sig} style={{ padding: "7px 0", borderTop: "1px dashed var(--line)" }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--amber)" }}>{cmd.sig}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>{cmd.desc}</div>
            </div>
          ))}
        </Panel>
        {hintLevel > 0 ? (
          <Panel label={`HINT ${hintLevel}/3`}>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
              {mission.hints[hintLevel - 1]}
            </div>
          </Panel>
        ) : null}
        <Button variant="quiet" size="sm" disabled={hintLevel >= 3} onClick={() => setHintLevel((h) => Math.min(3, h + 1))}>
          {hintLevel === 0 ? "NEED A HINT?" : hintLevel >= 3 ? "NO MORE HINTS" : "ANOTHER HINT?"}
        </Button>
      </div>

      {/* CENTER: HUD + arena. The arena box fills the remaining space; Phaser FIT centers the grid
          inside it so the whole thing always stays within the screen. */}
      <div style={{ ...col, flex: 1, minWidth: 0 }}>
        <Hud score={hud.score} armor={hud.armor} />
        <div
          ref={arenaHost}
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            background: "var(--surface-arena)",
            border: "var(--border)",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
          }}
        />
      </div>

      {/* RIGHT: editor + controls + radio */}
      <div style={{ ...col, width: 380, flex: "none", minHeight: 0 }}>
        <Panel label="YOUR PROGRAM" style={{ flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 140, border: "var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <Editor value={code} onChange={setCode} onRun={run} errorLine={errorLine} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {running ? (
              <Button variant="ghost" onClick={stop} style={{ flex: 1 }}>
                ■ STOP
              </Button>
            ) : (
              <Button onClick={run} style={{ flex: 1 }}>
                ▶ RUN
              </Button>
            )}
            <Button variant="ghost" onClick={reset}>
              RESET
            </Button>
          </div>
        </Panel>
        <TankRadio lines={radio} />
      </div>

      {result ? (
        <ResultOverlay
          result={result}
          continueLabel={hasNext ? "NEXT MISSION →" : "MISSION MAP →"}
          onRetry={() => {
            setResult(null);
            stop();
          }}
          onContinue={() => {
            setResult(null);
            if (hasNext) onNext();
            else onExit();
          }}
        />
      ) : null}
    </div>
  );
}
