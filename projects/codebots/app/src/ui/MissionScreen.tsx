import React, { useEffect, useRef, useState } from "react";
import type { Mission } from "../sim/missionSchema";
import type { SimEvent } from "../sim/events";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Hud } from "./Hud";
import { TankRadio, type RadioLine } from "./TankRadio";
import { ArenaKey } from "./ArenaKey";
import { commandsFor } from "../content/commandDocs";
import { globalLevel } from "../content/missions";
import { conceptFor } from "../content/concepts";
import { ConceptCard } from "./ConceptCard";
import { CommandList } from "./CommandList";
import { ResultOverlay, type MissionResult } from "./ResultOverlay";
import { Editor } from "../editor/Editor";
import { mountArena, type MountedArena } from "../view/mountArena";
import { SandboxClient } from "../sandbox/sandboxClient";
import { Sfx } from "../sound/sfx";
import { loadSave, saveSave, recordResult } from "../state/save";
import { countCodeLines } from "../sandbox/lines";
import { analytics } from "../state/analytics";


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
  const fails = useRef(0); // consecutive non-clearing runs on this level
  const level = globalLevel(mission); // the kid-facing global level number, used for analytics
  const concept = conceptFor(mission.world, mission.index); // the NEW idea this level teaches, if any

  function bumpFails() {
    fails.current += 1;
    if (fails.current === 4) analytics.stuck(level, fails.current);
  }

  const [code, setCode] = useState(mission.starterCode);
  const [hud, setHud] = useState({ score: 0, armor: 100 });
  const [radio, setRadio] = useState<RadioLine[]>([]);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<MissionResult | null>(null);
  const [briefOpen, setBriefOpen] = useState(true);
  const [codeOpen, setCodeOpen] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    setErrorMsg(null);
    setResult(null);
    setHud({ score: 0, armor: 100 });
    setRadio([{ text: "program uploaded — rolling…", tone: "dim" }]);
    a.scene.reset();
    const usedCmds = ["forward", "back", "left", "right", "honk", "repeat"]
      .filter((c) => new RegExp(`\\b${c}\\b`).test(code))
      .join(",");
    analytics.run(level, countCodeLines(code), usedCmds);

    const res = await c.run(code, mission);
    if (!res.ok) {
      // Errors never cost points — point at the line, suggest a fix, keep going.
      analytics.runError(level, res.error.message);
      bumpFails();
      setErrorLine(res.error.line);
      setErrorMsg(res.error.message);
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
        if (ev.type === "splash") addRadio("SPLASH! that's water — you can't cross it", "info");
        if (ev.type === "gateOpen") addRadio("gate open!", "info");
        if (ev.type === "shoot") addRadio(ev.hit ? "PEW! direct hit" : "pew — missed, nothing there", ev.hit ? "info" : "dim");
        if (ev.type === "targetDestroyed") addRadio("barrel smashed — path clear!", "success");
        if (ev.type === "honk") addRadio("HONK!", "info");
        if (ev.type === "clear") addRadio("★ beacon reached!", "success");
      },
      onDone: () => {
        setRunning(false);
        if (res.run.cleared) finish(res.run.stars);
        else {
          bumpFails();
          addRadio("didn't reach the beacon — try a different route", "dim");
        }
      },
    });
  }

  /**
   * "WATCH IT" — show the new idea running in the arena. Deliberately a SEPARATE path from run():
   * it never calls finish()/recordResult()/analytics, so a demo can never record a clear or corrupt
   * the save, even if its snippet happens to reach the beacon. It just plays + resets to the start.
   */
  async function playDemo() {
    const a = arena.current;
    const c = client.current;
    if (!a || !c || running || !concept?.demoCode) return;
    setRunning(true);
    setResult(null);
    setErrorLine(null);
    setErrorMsg(null);
    setHud({ score: 0, armor: 100 });
    setRadio([{ text: "watch closely — here's the idea…", tone: "dim" }]);
    a.scene.reset();
    const res = await c.run(concept.demoCode, mission);
    if (!res.ok) {
      // A demo must never break the level. If something's off, just bail quietly.
      a.scene.reset();
      setRunning(false);
      return;
    }
    a.scene.play(res.run.events, {
      onEvent: (ev) => sfx.current?.play(ev),
      onDone: () => {
        setRunning(false);
        addRadio("that's the idea — now you try it!", "info");
        a.scene.reset();
      },
    });
  }

  function finish(stars: number) {
    const save = loadSave();
    const { save: next, coinsEarned, newlyUnlocked, newBadges } = recordResult(
      save,
      mission.id,
      stars,
      mission.unlock?.part,
    );
    saveSave(next);
    onCoins(next.coins);
    fails.current = 0;
    analytics.levelClear(level, stars, countCodeLines(code), mission.parLines);
    for (const b of newBadges) analytics.badgeEarned(b.id);
    setResult({
      stars,
      coinsEarned,
      newlyUnlocked,
      lines: countCodeLines(code),
      par: mission.parLines,
      cutscene: mission.cutscene,
      newBadges,
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
    setErrorMsg(null);
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
      {/* LEFT: collapsible briefing / commands / hint — collapse it to give the code + arena room */}
      {briefOpen ? (
      <div style={{ ...col, width: 230, flex: "none", overflowY: "auto" }}>
        <Button variant="ghost" size="sm" onClick={() => setBriefOpen(false)}>
          ◀ HIDE PANEL
        </Button>
        {concept ? (
          <ConceptCard concept={concept} learned={!!loadSave().missions[mission.id]?.cleared} onWatch={playDemo} />
        ) : null}
        <Panel label="BRIEFING">
          <div style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)", color: "var(--text-body)" }}>
            {mission.briefing}
          </div>
        </Panel>
        <Panel label="COMMANDS">
          <CommandList commands={commandsFor(mission.world, mission.index)} world={mission.world} index={mission.index} />
        </Panel>
        <ArenaKey arena={mission.arena} />
        {hintLevel > 0 ? (
          <Panel label={`HINT ${hintLevel}/3`}>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
              {mission.hints[hintLevel - 1]}
            </div>
          </Panel>
        ) : null}
        <Button
          variant="quiet"
          size="sm"
          disabled={hintLevel >= 3}
          onClick={() => {
            const next = Math.min(3, hintLevel + 1);
            setHintLevel(next);
            analytics.hintUsed(level, next);
          }}
        >
          {hintLevel === 0 ? "NEED A HINT?" : hintLevel >= 3 ? "NO MORE HINTS" : "ANOTHER HINT?"}
        </Button>
      </div>
      ) : (
        <div style={{ width: 42, flex: "none", display: "flex", flexDirection: "column" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setBriefOpen(true)}
            style={{ flex: 1, writingMode: "vertical-rl", padding: "10px 0", letterSpacing: "2px" }}
          >
            ▶ SHOW PANEL
          </Button>
        </div>
      )}

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

      {/* RIGHT: editor + controls + radio — the coding window. Collapsible so you can watch the
          arena full-size; a RUN button stays in the collapsed strip so you can still run it. */}
      {codeOpen ? (
      <div style={{ ...col, width: briefOpen ? 460 : 540, flex: "none", minHeight: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => setCodeOpen(false)}>
          HIDE CODE ▶
        </Button>
        <Panel label="YOUR PROGRAM" style={{ flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 140, border: "var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <Editor value={code} onChange={setCode} onRun={run} errorLine={errorLine} world={mission.world} />
          </div>
          {errorMsg ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: "var(--text-sm)",
                color: "var(--red)",
                background: "rgba(255,107,122,0.10)",
                border: "2px solid var(--red)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px",
              }}
            >
              <span style={{ fontWeight: 700 }}>!</span>
              <span>{errorMsg}</span>
            </div>
          ) : null}
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
      ) : (
        <div style={{ width: 48, flex: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {running ? (
            <Button variant="ghost" size="sm" onClick={stop} style={{ padding: "10px 0" }}>
              ■
            </Button>
          ) : (
            <Button size="sm" onClick={run} style={{ padding: "10px 0" }}>
              ▶
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCodeOpen(true)}
            style={{ flex: 1, writingMode: "vertical-rl", padding: "10px 0", letterSpacing: "2px" }}
          >
            ◀ SHOW CODE
          </Button>
        </div>
      )}

      {result ? (
        <ResultOverlay
          result={result}
          onFeedback={(rating) => analytics.feedback(level, rating)}
          continueLabel={hasNext ? "NEXT LEVEL →" : "BACK TO MAP →"}
          onRetry={() => {
            analytics.levelRetry(level);
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
