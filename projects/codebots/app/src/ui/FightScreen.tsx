// src/ui/FightScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import type { BattleEvent, BattleOutcome } from "../sim/battle";
import type { Arena } from "../sim/types";
import type { SimEvent } from "../sim/events";
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
import { ALL_COMMANDS } from "../content/commandDocs";
import type { PublishedBot } from "../rivals/publish";

const BATTLE_EXTRA = ["enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight", "hurt"];

export type Opponent = { kind: "preset"; id: string } | { kind: "rival"; bot: PublishedBot };

export interface FightRecord {
  opponentName: string;
  opponentSource: string;
  opponentUserId: string | null;
  opponentMaxArmor: number;
  outcome: BattleOutcome;
  events: BattleEvent[];
  rounds: number;
}

// same arena as the old BattleScreen — the rival stands BETWEEN the player and a beacon that wins
// nothing here; the fight is lastStanding only. See BattleScreen's original comments for why.
const ARENA: Arena = (() => {
  const cols = 15, rows = 9;
  const cells = Array.from({ length: rows }, () => Array<string>(cols).fill("floor"));
  const walls: [number, number][] = [
    [5, 3], [5, 5], [9, 3], [9, 5],
    [7, 2], [7, 6],
    [3, 1], [3, 7], [11, 1], [11, 7],
  ];
  for (const [x, y] of walls) cells[y][x] = "wall";
  return { cols, rows, cells: cells as Arena["cells"], crates: [], coins: [], chests: [], gates: [], targets: [], beacon: { x: 0, y: 0 } };
})();
const PLAYER_START = { pos: { x: 0, y: 4 }, facing: "E" as const };
const ENEMY_START = { pos: { x: 14, y: 4 }, facing: "W" as const };

const STARTER =
  "// FIGHT! Write your bot's brain, then press FIGHT — it battles on its own.\n" +
  "// enemyAhead() is true when a rival is in your sights. shoot() to fire!\n" +
  "while (!atBeacon()) {\n  if (enemyAhead()) {\n    shoot()\n  } else if (blocked()) {\n    right()\n  } else {\n    forward(1)\n  }\n}";

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

/** MOVES / SENSORS / BATTLE — collapsed by default, above the editor. Reference only: shows
 *  everything the campaign or the arena teaches, not gated by the kid's own progress. */
function CommandDrawer() {
  const [open, setOpen] = useState<"moves" | "sensors" | "battle" | null>(null);
  const moves = ALL_COMMANDS.filter((c) => c.kind !== "sensor");
  const sensors = ALL_COMMANDS.filter((c) => c.kind === "sensor");
  const groups: { key: "moves" | "sensors" | "battle"; label: string; docs: { sig: string; desc: string }[] }[] = [
    { key: "moves", label: "MOVES", docs: moves },
    { key: "sensors", label: "SENSORS", docs: sensors },
    { key: "battle", label: "BATTLE", docs: BATTLE_EXTRA.map((sig) => ({ sig: `${sig}()`, desc: "battle-only sensor" })) },
  ];
  return (
    <Panel style={{ padding: "8px 12px" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {groups.map((g) => (
          <button
            key={g.key}
            onClick={() => setOpen(open === g.key ? null : g.key)}
            style={{ all: "unset", cursor: "pointer", fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "1px", color: open === g.key ? "var(--amber)" : "var(--text-dim)" }}
          >
            {g.label} {open === g.key ? "▾" : "▸"}
          </button>
        ))}
      </div>
      {open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
          {groups.find((g) => g.key === open)!.docs.map((d) => (
            <div key={d.sig} style={{ borderTop: "1px dashed var(--line)", paddingTop: 4 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--cyan)", fontWeight: 700 }}>{d.sig}</div>
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)" }}>{d.desc}</div>
            </div>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}

export function FightScreen({
  opponent,
  paint,
  onDone,
  onExit,
}: {
  opponent: Opponent;
  paint: { bodyColor: number; domeColor: number };
  onDone: (record: FightRecord) => void;
  onExit: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const battle = useRef<MountedBattle | null>(null);
  const sfx = useRef<Sfx | null>(null);

  const [code, setCode] = useState(STARTER);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BattleOutcome | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [status, setStatus] = useState("Write your bot's brain, then press FIGHT — once it starts, you can't steer it.");

  const preset = opponent.kind === "preset" ? presetById(opponent.id) : undefined;
  const enemy = preset
    ? { name: preset.name, source: preset.source, stats: preset.stats, userId: null as string | null }
    : opponent.kind === "rival"
      ? { name: `${opponent.bot.botName} (${opponent.bot.username})`, source: opponent.bot.source, stats: undefined, userId: opponent.bot.userId }
      : { name: "SNIPER", source: PRESETS[1].source, stats: PRESETS[1].stats, userId: null };

  const save = loadSave();
  const myStats = computeStats(save.loadout);
  const myMax = myStats.armor;
  const enemyMax = enemy.stats?.armor ?? 100;
  const [hp, setHp] = useState({ player: myMax, enemy: enemyMax });

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
          { id: "them", source: enemy.source, stats: enemy.stats },
        ],
        [PLAYER_START, ENEMY_START],
        [...BATTLE_API, ...BATTLE_EXTRA],
        "lastStanding",
      );
    } catch (e) {
      setStatus(`Something tripped up: ${(e as Error).message}`);
      return;
    }
    analytics.battleRun?.(opponent.kind === "preset" ? opponent.id : opponent.bot.userId);
    b.scene.reset();
    setRunning(true);
    setHp({ player: myMax, enemy: enemyMax });
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
        analytics.battleResult?.(opponent.kind === "preset" ? opponent.id : opponent.bot.userId, res.outcome);
        onDone({
          opponentName: enemy.name,
          opponentSource: enemy.source,
          opponentUserId: enemy.userId,
          opponentMaxArmor: enemyMax,
          outcome: res.outcome,
          events: res.events,
          rounds: res.rounds,
        });
      },
    });
  }

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", height: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <HealthBar label="YOUR BOT" hp={hp.player} max={myMax} color="var(--cyan)" />
          <HealthBar label={enemy.name} hp={hp.enemy} max={enemyMax} color="var(--red)" />
        </div>
        <div ref={host} style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: "hidden", position: "relative" }} />
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)", fontWeight: 700, minHeight: 20 }}>{status}</div>
      </div>

      <div style={{ width: "clamp(420px, 34vw, 620px)", flex: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        <CommandDrawer />
        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor value={code} onChange={setCode} onRun={fight} errorLine={errorLine} world={4} extraApi={BATTLE_EXTRA} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={fight} disabled={running} style={{ flex: 1 }}>
            {running ? "■ FIGHTING…" : result ? "▶ REMATCH" : "▶ FIGHT"}
          </Button>
          {running ? (
            <Button variant="quiet" onClick={() => { battle.current?.scene.stop(); setRunning(false); setStatus("Stopped. Change your code and go again."); }}>
              ■ STOP
            </Button>
          ) : (
            <Button variant="ghost" onClick={onExit}>‹ ARENA</Button>
          )}
        </div>
      </div>
    </div>
  );
}
