import React, { useEffect, useRef, useState } from "react";
import type { SimEvent } from "../sim/events";
import type { Arena } from "../sim/types";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Editor } from "../editor/Editor";
import { Sfx } from "../sound/sfx";
import { mountBattle, type MountedBattle } from "../view/mountBattle";
import { runBattle } from "../sim/battle";
import { PRESETS, presetById, BATTLE_API } from "../content/enemies";
import { desugarRepeat, findUnknownCalls, collectFunctionNames } from "../sandbox/transform";
import { unknownCommandMessage } from "../sandbox/errors";
import { analytics } from "../state/analytics";
import { loadSave } from "../state/save";
import { computeStats } from "../content/parts";

const BATTLE_EXTRA = ["enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight"];

/**
 * The rival stands BETWEEN you and the beacon. That's the whole point: the first arena used to put
 * the enemy 15 squares away while the beacon was 9 away, so you just strolled to the goal and the
 * fight never happened. Now you have to get past it — shoot it, or outsmart it through the cover.
 */
const ARENA: Arena = (() => {
  const cols = 11, rows = 7;
  const cells = Array.from({ length: rows }, () => Array<string>(cols).fill("floor"));
  for (const [x, y] of [[4, 1], [4, 2], [4, 5], [7, 0], [7, 4], [7, 5]] as [number, number][]) cells[y][x] = "wall";
  return { cols, rows, cells: cells as Arena["cells"], crates: [], coins: [], chests: [], gates: [], targets: [], beacon: { x: 10, y: 3 } };
})();
const PLAYER_START = { pos: { x: 0, y: 3 }, facing: "E" as const };
const ENEMY_START = { pos: { x: 7, y: 3 }, facing: "W" as const };

const STARTER =
  "// FIGHT! Write your bot's brain, then press FIGHT — it battles on its own.\n" +
  "// enemyAhead() is true when a rival is in your sights. shoot() to fire!\n" +
  "while (!atBeacon()) {\n  if (enemyAhead()) {\n    shoot()\n  } else if (blocked()) {\n    right()\n  } else {\n    forward(1)\n  }\n}";

/** Map a battle event to a reusable Sfx sound (Sfx keys off `type`). */
function sfxEvent(type: string): SimEvent | null {
  const t = ({ move: "move", turn: "turn", shoot: "shoot", honk: "honk", hit: "bump", wreck: "targetDestroyed", reach: "clear" } as Record<string, string>)[type];
  return t ? ({ type: t } as unknown as SimEvent) : null;
}

function HealthBar({ label, hp, max, color }: { label: string; hp: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (hp / max) * 100)) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 120 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "1px", color: "var(--text-dim)" }}>
        <span>{label}</span><span>{hp}/{max}</span>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: "rgba(0,0,0,.3)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width .2s" }} />
      </div>
    </div>
  );
}

export function BattleScreen({ paint }: { paint: { bodyColor: number; domeColor: number } }) {
  const host = useRef<HTMLDivElement>(null);
  const battle = useRef<MountedBattle | null>(null);
  const sfx = useRef<Sfx | null>(null);

  const [enemyId, setEnemyId] = useState("sniper");
  const [code, setCode] = useState(STARTER);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const enemy = presetById(enemyId)!;

  // Your Garage loadout feeds the fight — unless you've overloaded the frame, in which case the
  // gear doesn't fit and your bot rolls out stock. Weight is a real constraint, not a suggestion.
  const save = loadSave();
  const ls = computeStats(save.loadout.chassis, save.loadout.equipped);
  const overloaded = ls.overWeight || ls.overSlots;
  const myStats = overloaded ? undefined : { armor: ls.armor, damage: ls.damage, range: ls.range };
  const myMax = myStats?.armor ?? 100;

  const [hp, setHp] = useState({ player: myMax, enemy: 100 });
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [status, setStatus] = useState("Write your bot's brain, then press FIGHT — once it starts, you can't steer it.");

  useEffect(() => {
    sfx.current = new Sfx();
    analytics.battleOpen?.();
    let cancelled = false;
    if (host.current) {
      mountBattle(host.current, ARENA, [
        { bodyColor: paint.bodyColor, domeColor: paint.domeColor, start: PLAYER_START },
        { bodyColor: 0xff6b7a, domeColor: 0xffe08a, start: ENEMY_START },
      ]).then((m) => { if (cancelled) { m.destroy(); return; } battle.current = m; });
    }
    return () => { cancelled = true; battle.current?.destroy(); battle.current = null; };
  }, [paint.bodyColor, paint.domeColor]);

  function lint(): { line: number; message: string } | null {
    const desugared = desugarRepeat(code);
    const known = [...BATTLE_API, ...BATTLE_EXTRA, ...collectFunctionNames(desugared)];
    const unknown = findUnknownCalls(desugared, known);
    if (unknown.length) return { line: unknown[0].line, message: unknownCommandMessage(unknown[0].name, unknown[0].line, [...BATTLE_API, ...BATTLE_EXTRA]) };
    return null;
  }

  function fight() {
    const b = battle.current;
    if (!b || running) return;
    setResult(null);
    setErrorLine(null);
    const err = lint();
    if (err) { setErrorLine(err.line); setStatus(err.message); return; }

    let res;
    try {
      res = runBattle(
        ARENA,
        [
          { id: "me", source: code, isPlayer: true, stats: myStats },
          { id: enemy.id, source: enemy.source, stats: enemy.stats },
        ],
        [PLAYER_START, ENEMY_START],
        [...BATTLE_API, ...BATTLE_EXTRA],
        "both",
      );
    } catch (e) {
      setStatus(`Something tripped up: ${(e as Error).message}`);
      return;
    }
    analytics.battleRun?.(enemy.id);
    setRunning(true);
    setHp({ player: myMax, enemy: 100 });
    setStatus("FIGHT!");
    b.scene.play(res.events, {
      onEvent: (ev) => {
        const se = sfxEvent(ev.type);
        if (se) sfx.current?.play(se);
        if (ev.type === "hit") setHp((h) => (ev.target === 0 ? { ...h, player: ev.armor } : { ...h, enemy: ev.armor }));
      },
      onDone: () => {
        setRunning(false);
        setResult(res.outcome);
        analytics.battleResult?.(enemy.id, res.outcome);
      },
    });
  }

  const resultText = result === "win" ? "★ YOUR BOT WON! ★" : result === "lose" ? "wrecked — fix your code and rematch" : result === "draw" ? "a draw — neither reached the goal" : "";

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", height: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ width: 220, flex: "none", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        <Panel label="OPPONENT">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PRESETS.map((p) => (
              <button key={p.id} onClick={() => { if (!running) { setEnemyId(p.id); setResult(null); } }}
                style={{ all: "unset", cursor: running ? "default" : "pointer", padding: "8px 10px", borderRadius: 8,
                  border: `1.5px solid ${p.id === enemyId ? "var(--red)" : "var(--line)"}`,
                  background: p.id === enemyId ? "rgba(255,107,122,.08)" : "transparent" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink)" }}>{p.name}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.4 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </Panel>
        <Panel label="HOW TO WIN">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
            Reach the beacon <b>or</b> wreck your rival. Your program IS the bot's brain — once the
            fight starts, you can't help it. Better code wins.
          </div>
        </Panel>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <HealthBar label="YOUR BOT" hp={hp.player} max={myMax} color="var(--cyan)" />
          <HealthBar label={enemy.name} hp={hp.enemy} max={100} color="var(--red)" />
        </div>
        <div ref={host} style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: "hidden", position: "relative" }}>
          {result ? (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", zIndex: 5, pointerEvents: "none" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)",
                color: result === "win" ? "var(--green)" : result === "lose" ? "var(--red)" : "var(--text-dim)",
                background: "rgba(5,10,24,.7)", padding: "12px 20px", borderRadius: 12 }}>
                {resultText}
              </div>
            </div>
          ) : null}
        </div>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)", fontWeight: 700, minHeight: 20 }}>{status}</div>
      </div>

      <div style={{ width: 380, flex: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor value={code} onChange={setCode} onRun={fight} errorLine={errorLine} world={4} extraApi={BATTLE_EXTRA} />
        </div>
        <Button onClick={fight} disabled={running}>{running ? "■ FIGHTING…" : "▶ FIGHT"}</Button>
      </div>
    </div>
  );
}
