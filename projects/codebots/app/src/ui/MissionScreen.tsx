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
import { RobotRules } from "./RobotRules";
import { FeedbackButton } from "./FeedbackButton";
import { ExportPanel } from "./ExportPanel";
import { loadBotConfig } from "../state/botConfig";
import { ResultOverlay, type MissionResult } from "./ResultOverlay";
import { Editor } from "../editor/Editor";
import { mountArena, type MountedArena } from "../view/mountArena";
import { SandboxClient } from "../sandbox/sandboxClient";
import { Sfx } from "../sound/sfx";
import { loadSave, saveSave, recordResult, starsAfterHelp } from "../state/save";
import { countCodeLines } from "../sandbox/lines";
import { analytics } from "../state/analytics";


/**
 * Is the window too narrow for the three-column desktop layout (briefing | arena | editor)?
 *
 * It used to be laid out as three fixed columns inside `overflow: hidden`. On a small laptop or a
 * tablet that doesn't merely look cramped — the arena and the editor end up off-screen and there is
 * no way to scroll to them. The game is unusable and it isn't obvious why. Below the breakpoint we
 * stack the columns and let the page scroll instead.
 */
function useNarrow(breakpoint = 1100): boolean {
  const [narrow, setNarrow] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
  );
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return narrow;
}

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
  const clearedCount = Object.values(loadSave().missions).filter((m) => m.cleared).length;
  const hasSolution = mission.authorSolution.trim().length > 0; // Open Field levels are generated — no author solution exists

  function bumpFails() {
    fails.current += 1;
    setStuck(fails.current);
    if (fails.current === 4) analytics.stuck(level, fails.current);
  }

  const [code, setCode] = useState(mission.starterCode);
  const [hud, setHud] = useState({ score: 0, armor: 100 });
  const [radio, setRadio] = useState<RadioLine[]>([]);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  // The help ladder. `stuck` mirrors the fails ref so the UI can re-render as she struggles: the
  // deeper rungs (SHOW ME, GIVE ME THE CODE) only appear once she's actually stuck, so a kid who's
  // doing fine never sees the answer dangled in front of her.
  const [stuck, setStuck] = useState(0);
  const [showMeUsed, setShowMeUsed] = useState(false);
  const [solutionUsed, setSolutionUsed] = useState(false);
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
    setRadio([{ text: "program uploaded. Sparkplug is on its own now — watch what YOUR code makes it do.", tone: "dim" }]);
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
   * Play a program in the arena WITHOUT it counting: never calls finish()/recordResult(), so it can
   * never record a clear or corrupt the save even if the snippet reaches the beacon. Used by both
   * "WATCH IT" (the concept demo) and "SHOW ME" (the author's solution, when a kid is stranded).
   */
  async function playSource(source: string, opener: string, closer: string) {
    const a = arena.current;
    const c = client.current;
    if (!a || !c || running || !source.trim()) return;
    setRunning(true);
    setResult(null);
    setErrorLine(null);
    setErrorMsg(null);
    setHud({ score: 0, armor: 100 });
    setRadio([{ text: opener, tone: "dim" }]);
    a.scene.reset();
    const res = await c.run(source, mission);
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
        addRadio(closer, "info");
        a.scene.reset();
      },
    });
  }

  /** "WATCH IT" — show the new idea running, before she's written anything. */
  const playDemo = () =>
    concept?.demoCode &&
    playSource(concept.demoCode, "watch closely — here's the idea…", "that's the idea — now you try it!");

  /**
   * "SHOW ME" — the escape hatch. The game must never say "no more hints" and leave a kid stranded
   * with nothing left to click; that's exactly where she closes the tab. This plays the author's
   * solution so she can SEE the strategy — but it does not hand her the code. She still has to write
   * it. (If she's still stuck after watching, GIVE ME THE CODE below does hand it over.)
   */
  function showMe() {
    setShowMeUsed(true);
    analytics.showMe?.(level);
    playSource(
      mission.authorSolution,
      "ok — watch MY bot do it. See what it tries?",
      "your turn. You don't have to copy me — any code that gets there works.",
    );
  }

  /**
   * Last resort. She gets the code, and the level still clears — being stuck must never be a dead
   * end. But it clears at ONE star and earns no "solved it" credit, so the stars stay honest and
   * she has a reason to come back and beat it for real.
   */
  function giveCode() {
    setCode(mission.authorSolution);
    setSolutionUsed(true);
    analytics.solutionShown?.(level);
    setRadio([
      { text: "here's one way to do it — read it, then press RUN.", tone: "info" },
      { text: "this one only counts for ★. Come back and beat it yourself for all three.", tone: "dim" },
    ]);
  }

  function finish(earned: number) {
    const stars = starsAfterHelp(earned, solutionUsed);
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
    setStuck(0);
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

  const narrow = useNarrow();
  const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12, minHeight: 0 };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: narrow ? "column" : "row",
        gap: 14,
        padding: "14px 20px",
        alignItems: "stretch",
        height: narrow ? "auto" : "100%",
        boxSizing: "border-box",
        // NEVER `hidden` here. Anything that doesn't fit must stay reachable — clipping the editor
        // off the side of a small screen is how you hand a kid a game she cannot play.
        overflow: narrow ? "visible" : "hidden",
      }}
    >
      {/* LEFT: collapsible briefing / commands / hint — collapse it to give the code + arena room */}
      {briefOpen ? (
      <div style={{ ...col, width: narrow ? "100%" : 230, flex: "none", overflowY: narrow ? "visible" : "auto" }}>
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
        {/* A beginner gets the rules OPEN — she has no reason to tap a collapsed panel, and these
            are exactly what she trips on (capitals, camelCase, "the bot runs itself"). */}
        <RobotRules startOpen={clearedCount < 3} />
        {hintLevel > 0 ? (
          <Panel label={`HINT ${hintLevel}/3`}>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
              {mission.hints[hintLevel - 1]}
            </div>
          </Panel>
        ) : null}
        {/*
          The help ladder — nudge → nudge → nudge → watch me do it → here's the code.
          It NEVER bottoms out. The old version disabled the button and said "NO MORE HINTS",
          which is a locked door in the face of the one kid who most needs it open.
        */}
        {hintLevel < 3 ? (
          <Button
            variant="quiet"
            size="sm"
            onClick={() => {
              const next = hintLevel + 1;
              setHintLevel(next);
              analytics.hintUsed(level, next);
            }}
          >
            {/* after a few failed runs, stop waiting to be asked — offer */}
            {hintLevel === 0 ? (stuck >= 3 ? "STUCK? I CAN HELP →" : "NEED A HINT?") : "ANOTHER HINT?"}
          </Button>
        ) : !hasSolution ? (
          // Open Field challenges are generated, so there's no author solution to show. Say so
          // plainly rather than dangling a button that does nothing.
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", lineHeight: 1.5 }}>
            This one's a puzzle I made up on the spot — there's no single answer. Try a smaller piece
            of it first, or hit NEW CHALLENGE for a different one.
          </div>
        ) : !showMeUsed ? (
          <Button variant="quiet" size="sm" disabled={running} onClick={showMe}>
            ▶ SHOW ME HOW
          </Button>
        ) : !solutionUsed ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Button variant="quiet" size="sm" disabled={running} onClick={showMe}>
              ▶ WATCH IT AGAIN
            </Button>
            <Button variant="quiet" size="sm" disabled={running} onClick={giveCode}>
              GIVE ME THE CODE
            </Button>
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.4 }}>
              Taking the code still clears the level, but only for ★. You can always come back and
              beat it yourself.
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", lineHeight: 1.5 }}>
            The code's in your editor. Read it line by line, then press RUN — and next time, try it
            before you ask me.
          </div>
        )}

        {/* The payoff: her program leaves the game as a real, runnable JavaScript file. It only shows
            up once she's actually cleared something — exporting an empty editor is a dead button, and
            the point is "look what YOU wrote", not "here is a feature". */}
        {result?.stars ? <ExportPanel source={code} botName={loadBotConfig().botName} /> : null}

        {/* She's stuck and looking at the hints. That is precisely the moment to let her tell us the
            level is the problem, not her. */}
        <FeedbackButton
          context={{
            level,
            missionId: mission.id,
            code,
            error: errorMsg,
            hintsUsed: hintLevel,
            fails: stuck,
            showMeUsed,
            solutionUsed,
          }}
        />
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
      <div style={{ ...col, flex: 1, minWidth: 0, position: "relative", minHeight: narrow ? 340 : 0 }}>
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
        {/*
          THE AUTONOMY BEAT.

          A real nine-year-old played this and thought she was STEERING the robot — that pressing RUN
          was her driving it. She isn't; she wrote its brain and it's now thinking for itself. That
          misunderstanding is fatal, because if you believe you're steering, then `if` and sensors are
          pointless: why teach a robot to decide when you're the one deciding?

          The ROBOT RULES panel already said all this in words, and she read right past it. Words in a
          panel lose to what's happening on screen. So we say it AT the one moment it's undeniable —
          while the bot is moving and her hands do nothing.
        */}
        {running ? (
          <div
            style={{
              position: "absolute", left: 0, right: 0, bottom: 10, display: "grid", placeItems: "center",
              pointerEvents: "none", zIndex: 5,
            }}
          >
            <div
              style={{
                background: "rgba(5,10,24,.82)", border: "1.5px solid var(--amber)", borderRadius: 999,
                padding: "6px 16px", display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--amber)" }} />
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: ".5px", color: "var(--ink)" }}>
                IT'S ON ITS OWN NOW — you can't steer it. It's following your code.
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* RIGHT: editor + controls + radio — the coding window. Collapsible so you can watch the
          arena full-size; a RUN button stays in the collapsed strip so you can still run it. */}
      {codeOpen ? (
      <div style={{ ...col, width: narrow ? "100%" : briefOpen ? 540 : 640, flex: "none", minHeight: narrow ? 420 : 0 }}>
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
                ▶ RUN MY PROGRAM
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
