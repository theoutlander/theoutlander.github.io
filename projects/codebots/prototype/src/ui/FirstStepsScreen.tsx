import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./components/Button";
import { Editor } from "../editor/Editor";
import { Sfx } from "../sound/sfx";
import { mountArena, type MountedArena } from "../view/mountArena";
import { SandboxClient } from "../sandbox/sandboxClient";
import { FIRST_STEPS, stepMission, stepDone, type Chip } from "../content/firstSteps";
import { loadSave, saveSave } from "../state/save";
import { analytics } from "../state/analytics";

/**
 * FIRST STEPS — the screen a beginner meets before the game proper.
 *
 * Deliberately almost empty. Level 1 puts nine panels and two hundred words in front of a kid who has
 * never coded; this puts one idea, one robot, one program, and one button. If you can see anything on
 * this screen that isn't teaching the current idea, it shouldn't be here.
 *
 * She TAPS to build the program and the real JavaScript appears in front of her, because typing and
 * thinking are two different skills and making a six-year-old learn both at once is how you lose her.
 * The keyboard shows up on the last beat, once every part of `forward(3)` has been explained.
 */

/** One line of her program: a command, and maybe a number in its brackets. */
interface Line {
  cmd: string;
  arg?: string;
}

const render = (lines: Line[], bare = false): string =>
  lines.map((l) => (bare ? l.cmd : `${l.cmd}(${l.arg ?? ""})`)).join("\n");

export function FirstStepsScreen({
  paint,
  onDone,
  onExit,
}: {
  paint: { bodyColor: number; domeColor: number };
  onDone: () => void;
  onExit: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const arena = useRef<MountedArena | null>(null);
  const client = useRef<SandboxClient | null>(null);
  const sfx = useRef<Sfx | null>(null);

  const [i, setI] = useState(0);
  const step = FIRST_STEPS[i];
  const mission = useMemo(() => stepMission(step), [step]);

  const [lines, setLines] = useState<Line[]>([]);
  const [typed, setTyped] = useState("");
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<{ text: string; good: boolean } | null>(null);
  const [passed, setPassed] = useState(false);

  const source = step.typing ? typed : step.prefill !== undefined && lines.length === 0 ? step.prefill : render(lines, step.bare);

  // reset everything when the beat changes — she starts each idea with a clean slate
  useEffect(() => {
    setLines([]);
    setTyped("");
    setMsg(null);
    setPassed(false);
    analytics.firstStep?.(step.id, i + 1);
  }, [i, step.id]);

  useEffect(() => {
    client.current = new SandboxClient();
    sfx.current = new Sfx();
    return () => { client.current?.dispose(); client.current = null; };
  }, []);

  // one arena per beat
  const paintRef = useRef(paint);
  paintRef.current = paint;
  useEffect(() => {
    let dead = false;
    arena.current?.destroy();
    arena.current = null;
    if (host.current) {
      mountArena(host.current, mission, paintRef.current).then((m) => {
        if (dead) { m.destroy(); return; }
        arena.current = m;
      });
    }
    return () => { dead = true; arena.current?.destroy(); arena.current = null; };
  }, [mission]);

  function tap(c: Chip) {
    if (running || passed) return;
    setMsg(null);
    setLines((ls) => {
      // A number belongs INSIDE the brackets of the command she just placed. That's the whole
      // mental model of beat 4, so the tapping has to behave the way the sentence said it does.
      if (c.kind === "number") {
        if (!ls.length) return ls;
        const out = [...ls];
        out[out.length - 1] = { ...out[out.length - 1], arg: c.emit };
        return out;
      }
      return [...ls, { cmd: c.emit }];
    });
  }

  async function go() {
    const c = client.current;
    const a = arena.current;
    if (!c || !a || running) return;

    // The bare-word beat isn't a program — it's a word sitting on its own, and the entire lesson is
    // that NOTHING HAPPENS. We don't run it. (In real JavaScript a bare `forward` evaluates to the
    // function and quietly does nothing, which is exactly what we're claiming; our sandbox happens to
    // throw on it, and a scary red error would teach her the opposite of the truth.)
    if (step.bare) {
      if (!lines.length) { setMsg({ text: step.nudge, good: false }); return; }
      setPassed(true);
      setMsg({ text: step.praise, good: true });
      analytics.firstStepDone?.(step.id, i + 1);
      return;
    }

    setRunning(true);
    setMsg(null);
    a.scene.reset();

    const res = await c.run(source, mission);
    if (!res.ok) {
      setRunning(false);
      // Tell her what ACTUALLY went wrong, not a canned line.
      //
      // This used to show step.nudge whatever happened, which meant a kid who built `forward(1)`
      // perfectly but picked the wrong NUMBER was told her capital letters were wrong. The game
      // blaming her for a mistake she didn't make — on the screen that teaches precision. The
      // sandbox already writes a precise, kid-worded message (it's the one that explains capitals);
      // we were throwing it away.
      setMsg({ text: res.error.message, good: false });
      return;
    }

    // Bank the outcome NOW, before a single pixel moves.
    //
    // The sim has already decided; the animation is just a retelling of it. Gating her progress on
    // the replay finishing means a kid who switches tabs (browsers throttle animation in background
    // tabs) or gets bored and clicks away has DONE the step and gets nothing for it — she's left
    // staring at a screen with no way forward. On a six-year-old's first-ever coding screen, that is
    // the worst bug we could ship.
    const ok = stepDone(step, res.run.finalState.pos);
    setPassed(ok);
    setMsg({ text: ok ? step.praise : step.nudge, good: ok });
    if (ok) analytics.firstStepDone?.(step.id, i + 1);

    // A watchdog on the button.
    //
    // `running` disables GO so she can't fire twice mid-replay — but it only cleared when the scene
    // reported done. If the replay ever stalls (a backgrounded tab throttles animation to a crawl; a
    // scene gets torn down), GO stays disabled as "WATCHING…" forever and she cannot try again. A kid
    // with a dead button and no explanation is a kid who leaves. The outcome is already banked above,
    // so releasing the button early costs nothing.
    let released = false;
    const release = () => { if (!released) { released = true; setRunning(false); } };
    const watchdog = window.setTimeout(release, 12000);

    a.scene.play(res.run.events, {
      onEvent: (ev) => sfx.current?.play(ev),
      onDone: () => { window.clearTimeout(watchdog); release(); },
    });
  }

  const back = () => setI((n) => Math.max(0, n - 1));

  function next() {
    if (i + 1 < FIRST_STEPS.length) { setI(i + 1); return; }
    const save = loadSave();
    saveSave({ ...save, firstStepsDone: true });
    analytics.firstStepsComplete?.();
    onDone();
  }

  const big = { fontSize: 19, lineHeight: 1.55, color: "var(--ink)" } as const;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "22px 20px 60px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* how far in she is — the only progress indicator, and it never judges her */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {FIRST_STEPS.map((s, n) => (
            <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: n <= i ? "var(--cyan)" : "var(--line)" }} />
          ))}
        </div>
        <button onClick={onExit} style={{ all: "unset", cursor: "pointer", fontSize: "var(--text-2xs)", color: "var(--text-dim)", letterSpacing: "1px" }}>
          SKIP →
        </button>
      </div>

      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, letterSpacing: "2px", color: "var(--amber)" }}>
        {step.title}
      </div>

      {/* THE EXPLANATION — the part that didn't exist before */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {step.teach.map((line) => (
          <div key={line} style={big}>{line}</div>
        ))}
      </div>

      {step.show ? (
        <pre style={{
          margin: 0, padding: "12px 16px", borderRadius: 10, background: "var(--surface-arena)",
          border: "var(--border)", fontFamily: "var(--font-mono)", fontSize: 17, color: "var(--cyan)",
          whiteSpace: "pre-wrap",
        }}>{step.show}</pre>
      ) : null}

      <div style={{ ...big, fontWeight: 700, color: "var(--amber)" }}>{step.task}</div>

      <div ref={host} style={{ height: 190, borderRadius: 12, overflow: "hidden", border: "var(--border)", background: "var(--surface-arena)" }} />

      {/* HER PROGRAM — real JavaScript, appearing as she taps */}
      <div>
        <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "1.5px", color: "var(--text-dim)", marginBottom: 6 }}>
          YOUR PROGRAM
        </div>
        {step.typing ? (
          <div style={{ height: 110, border: "var(--border)", borderRadius: 10, overflow: "hidden" }}>
            <Editor value={typed} onChange={setTyped} onRun={go} errorLine={null} world={1} />
          </div>
        ) : (
          <pre style={{
            margin: 0, minHeight: 62, padding: "12px 16px", borderRadius: 10,
            background: "var(--surface-arena)", border: "var(--border)",
            fontFamily: "var(--font-mono)", fontSize: 19, color: "var(--ink)", whiteSpace: "pre-wrap",
          }}>
            {source || <span style={{ color: "var(--text-dim)" }}>(empty — no instructions yet)</span>}
          </pre>
        )}
      </div>

      {/* the vocabulary — never more words than she's been taught */}
      {step.chips.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {step.chips.map((c) => (
            <button
              key={c.label}
              onClick={() => tap(c)}
              style={{
                all: "unset", cursor: "pointer", padding: "10px 18px", borderRadius: 10,
                fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700,
                color: c.kind === "number" ? "var(--amber)" : "var(--cyan)",
                border: `2px solid ${c.kind === "number" ? "var(--amber)" : "var(--cyan)"}`,
              }}
            >
              {c.label}
            </button>
          ))}
          {lines.length ? (
            <button
              onClick={() => setLines((l) => l.slice(0, -1))}
              style={{ all: "unset", cursor: "pointer", padding: "10px 14px", borderRadius: 10, fontSize: 13, color: "var(--text-dim)", border: "1.5px solid var(--line)" }}
            >
              ← UNDO
            </button>
          ) : null}
        </div>
      ) : null}

      {msg ? (
        <div style={{
          ...big, padding: "12px 16px", borderRadius: 10,
          border: `1.5px solid ${msg.good ? "var(--green)" : "var(--amber)"}`,
          background: msg.good ? "rgba(111,227,165,.07)" : "rgba(255,180,84,.07)",
        }}>
          {msg.text}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10 }}>
        {/* Going BACK must always be possible. An idea she half-got is an idea she'll want to read
            again, and a kid who can only ever go forwards learns to be afraid of pressing things. */}
        {i > 0 ? (
          <Button variant="quiet" onClick={back} disabled={running} style={{ padding: "14px 18px", fontSize: 15 }}>
            ← BACK
          </Button>
        ) : null}
        {passed ? (
          <Button onClick={next} style={{ flex: 1, fontSize: 18, padding: "14px 0" }}>
            {i + 1 < FIRST_STEPS.length ? "NEXT →" : "I'M READY — START LEVEL 1"}
          </Button>
        ) : (
          <Button onClick={go} disabled={running} style={{ flex: 1, fontSize: 18, padding: "14px 0" }}>
            {running ? "■ WATCHING…" : "▶ GO"}
          </Button>
        )}
      </div>
    </div>
  );
}
