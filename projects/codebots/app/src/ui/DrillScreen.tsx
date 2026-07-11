import React, { useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Editor } from "../editor/Editor";
import { Sfx } from "../sound/sfx";
import { mountArena, type MountedArena } from "../view/mountArena";
import { SandboxClient } from "../sandbox/sandboxClient";
import { DRILLS, availableDrills, drillArenas, drillPassed, type DrillFamily } from "../content/drills";
import { loadSave, saveSave } from "../state/save";
import { analytics } from "../state/analytics";
import type { Mission } from "../sim/engine";

/**
 * PROVE IT — the drill screen.
 *
 * One program. Three fields. You pass only by parking on all three beacons. The fields are generated,
 * so there are no squares to count and no board to read: the only code that survives is code that
 * asks the world what's in front of it. That's the point — the campaign lets a kid fake a sensor
 * level by hardcoding what she can see, and this is where that stops working.
 */
export function DrillScreen({
  paint,
  onExit,
}: {
  paint: { bodyColor: number; domeColor: number };
  onExit: () => void;
}) {
  const drills = useMemo(() => availableDrills(), []);
  // HQ hides the door until a drill unlocks, so this list is never empty in practice. But a blank
  // white screen is a rotten thing to hand a kid, so fall back to a real sentence instead of
  // crashing on drills[0].
  const [family, setFamily] = useState<DrillFamily>(() => drills[0] ?? DRILLS[0]);
  const host = useRef<HTMLDivElement>(null);
  const arena = useRef<MountedArena | null>(null);
  const client = useRef<SandboxClient | null>(null);
  const sfx = useRef<Sfx | null>(null);

  // one seed per attempt-session; stable across re-renders so the fields don't shuffle under her
  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const fields = useMemo<Mission[]>(() => drillArenas(family, seed), [family, seed]);

  const [code, setCode] = useState(fields[0].starterCode + "\n");
  const [shown, setShown] = useState(0); // which field is on screen
  const [results, setResults] = useState<(boolean | null)[]>([null, null, null]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Write ONE program. It has to work on all three fields.");
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    client.current = new SandboxClient();
    sfx.current = new Sfx();
    return () => {
      client.current?.dispose();
      client.current = null;
    };
  }, []);

  // Remount the arena when the displayed FIELD changes — and only then.
  //
  // `paint` must stay out of the dependency list. It arrives as an inline object literal from App,
  // so it gets a fresh identity on every render up there; leaving it in the deps tore down and
  // rebooted Phaser in the middle of a run, which is why the bot appeared to crawl one square every
  // ten seconds. The colours never actually change while this screen is open, so we read them from
  // a ref and let the field index be the only thing that triggers a remount.
  const paintRef = useRef(paint);
  paintRef.current = paint;
  const mountedFor = useRef<number>(-1);

  useEffect(() => {
    let dead = false;
    arena.current?.destroy();
    arena.current = null;
    mountedFor.current = -1;
    const m = fields[shown];
    if (host.current) {
      mountArena(host.current, m, paintRef.current).then((mounted) => {
        if (dead) { mounted.destroy(); return; }
        arena.current = mounted;
        mountedFor.current = shown;
      });
    }
    return () => { dead = true; arena.current?.destroy(); arena.current = null; mountedFor.current = -1; };
  }, [shown, fields]);

  /** the mount is async, so wait for the field we asked for before playing into it */
  function arenaFor(i: number): Promise<MountedArena | null> {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const poll = () => {
        if (arena.current && mountedFor.current === i) return resolve(arena.current);
        if (Date.now() - t0 > 4000) return resolve(null);
        setTimeout(poll, 30);
      };
      poll();
    });
  }

  async function run() {
    const c = client.current;
    if (!c || running) return;
    setRunning(true);
    setPassed(false);
    setStatus("Running your program on all three fields…");

    // Run every field headlessly first, so the scoreboard is honest before any animation plays.
    const outcomes: boolean[] = [];
    for (const m of fields) {
      const res = await c.run(code, m);
      outcomes.push(res.ok ? drillPassed(m, res.run.finalState.pos) : false);
    }
    setResults(outcomes);

    // Then show her the first field that FAILED — that's the one she needs to see. If they all
    // passed, replay field 1 as the victory lap.
    const firstFail = outcomes.findIndex((o) => !o);
    const watch = firstFail === -1 ? 0 : firstFail;
    setShown(watch);

    const res = await c.run(code, fields[watch]);
    const a = await arenaFor(watch); // the field may still be mounting — don't play into a dead scene
    if (!res.ok || !a) {
      setRunning(false);
      setStatus(res.ok ? "…" : `Your code has a problem: ${res.error}`);
      return;
    }
    a.scene.reset();
    a.scene.play(res.run.events, {
      onEvent: (ev) => sfx.current?.play(ev),
      onDone: () => {
        setRunning(false);
        const all = outcomes.every(Boolean);
        setPassed(all);
        if (all) award();
        else
          setStatus(
            `Field ${watch + 1} beat you. Your bot didn't stop on the beacon there — so your code is ` +
              `relying on something that's only true on ONE field. What changes between them?`,
          );
      },
    });
  }

  function award() {
    const save = loadSave();
    const key = `drill:${family.key}`;
    const first = !save.drillsPassed?.includes(key);
    if (first) {
      saveSave({
        ...save,
        coins: save.coins + 25,
        drillsPassed: [...(save.drillsPassed ?? []), key],
      });
    }
    analytics.drillPassed?.(family.key, first);
    setStatus(
      first
        ? "PROVED IT. One program, three different fields — that only works because your bot THINKS. +25 coins."
        : "Proved it again. Same code, brand new fields.",
    );
  }

  const chip = (i: number) => {
    const r = results[i];
    const color = r === null ? "var(--text-dim)" : r ? "var(--green)" : "var(--red)";
    const mark = r === null ? "—" : r ? "✓" : "✗";
    return (
      <button
        key={i}
        onClick={() => !running && setShown(i)}
        style={{
          all: "unset", cursor: running ? "default" : "pointer", flex: 1, textAlign: "center",
          padding: "7px 4px", borderRadius: 8,
          border: `1.5px solid ${i === shown ? "var(--cyan)" : "var(--line)"}`,
          background: i === shown ? "rgba(95,212,255,.08)" : "transparent",
        }}
      >
        <div style={{ fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "1px", color: "var(--text-dim)" }}>
          FIELD {i + 1}
        </div>
        <div style={{ fontSize: "var(--text-lg)", fontWeight: 800, color }}>{mark}</div>
      </button>
    );
  };

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", height: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ width: 230, flex: "none", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        <Panel label={`PROVE IT · ${family.title}`}>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
            {family.brief}
          </div>
        </Panel>
        <Panel label="THE RULE">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
            One program. Three fields. You pass only if your bot <b>parks on the beacon</b> in all
            three. You can't count squares here — the fields aren't the same.
          </div>
        </Panel>
        <Panel label="STUCK?">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
            {fields[0].hints[0]}
          </div>
        </Panel>
        <Panel label="DRILLS">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {drills.map((d) => (
              <button
                key={d.key}
                onClick={() => { if (!running && d.key !== family.key) { setFamily(d); setResults([null, null, null]); setPassed(false); setShown(0); } }}
                style={{ all: "unset", cursor: running ? "default" : "pointer", padding: "7px 9px", borderRadius: 8,
                  border: `1.5px solid ${d.key === family.key ? "var(--amber)" : "var(--line)"}`,
                  background: d.key === family.key ? "rgba(255,180,84,.08)" : "transparent" }}
              >
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink)" }}>{d.title}</div>
              </button>
            ))}
          </div>
        </Panel>
        <Button variant="quiet" size="sm" onClick={onExit}>‹ BACK</Button>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>{[0, 1, 2].map(chip)}</div>
        <div ref={host} style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: "hidden", position: "relative" }}>
          {passed ? (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", zIndex: 5, pointerEvents: "none" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", color: "var(--green)", background: "rgba(5,10,24,.72)", padding: "12px 20px", borderRadius: 12 }}>
                ★ PROVED IT ★
              </div>
            </div>
          ) : null}
        </div>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)", fontWeight: 700, minHeight: 34 }}>{status}</div>
      </div>

      <div style={{ width: 380, flex: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor value={code} onChange={setCode} onRun={run} errorLine={null} world={fields[0].world} />
        </div>
        <Button onClick={run} disabled={running}>{running ? "■ TESTING…" : "▶ RUN ON ALL 3"}</Button>
      </div>
    </div>
  );
}


