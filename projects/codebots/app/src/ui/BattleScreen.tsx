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
import { fetchOpponents, leaderboard, publishBot, recordOutcome, type PublishedBot } from "../rivals/publish";
import { currentAccount, cloudEnabled } from "../state/account";

const BATTLE_EXTRA = ["enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight", "hurt"];

/**
 * The rival stands BETWEEN you and the beacon. That's the whole point: the first arena used to put
 * the enemy 15 squares away while the beacon was 9 away, so you just strolled to the goal and the
 * fight never happened. Now you have to get past it — shoot it, or outsmart it through the cover.
 */
/**
 * THE ARENA IS A FIGHT. THAT'S ALL IT IS.
 *
 * It used to have TWO win conditions — reach the beacon, or wreck your rival — and they quietly
 * cancelled each other out. Watch what actually happened: the beacon sat 7 squares away and a bot
 * shoots 6, so you could WALK to the goal and win before a single shot was ever possible. Measured it:
 * every strategy beat every house bot, including one whose entire program was `forward(1)` in a loop.
 * The fight was not unbalanced. The fight could not happen.
 *
 * A battle arena with a race objective is two games wearing one coat, and it's why none of this felt
 * like anything. So the beacon is gone. Last bot standing. Navigation is what the campaign is for;
 * this room is a fight, and the only thing that decides it is whose code thinks better.
 *
 * Big board, mirrored cover, and 14 squares between them at the start — nobody can shoot past 6, so
 * the fight has an opening, a middle, and an end instead of being over in two seconds.
 */
const ARENA: Arena = (() => {
  const cols = 15, rows = 9;
  const cells = Array.from({ length: rows }, () => Array<string>(cols).fill("floor"));
  // Cover sits BESIDE the centre lane, never across it.
  //
  // First attempt walled the middle for "tactical depth" and the bots simply never found each other:
  // every single matchup ran 200 rounds and ended a scoreless draw. If you block the only sight-line,
  // there is no fight — there's two robots milling about in the dark. The lane stays open so they
  // close, see each other, and engage; the cover is there to be USED (break line of sight, flank),
  // not to prevent the battle from occurring.
  const walls: [number, number][] = [
    [5, 3], [5, 5], [9, 3], [9, 5],     // shoulders either side of the middle — duck behind these
    [7, 2], [7, 6],                     // centre pillars, above and below the lane
    [3, 1], [3, 7], [11, 1], [11, 7],   // outer pillars, for flanking routes
  ];
  for (const [x, y] of walls) cells[y][x] = "wall";
  // The beacon has to exist (the arena type demands one) but it wins nothing here. Park it in a corner
  // where it's out of the way, and let atBeacon() stay honest rather than meaningless.
  return { cols, rows, cells: cells as Arena["cells"], crates: [], coins: [], chests: [], gates: [], targets: [], beacon: { x: 0, y: 0 } };
})();
const PLAYER_START = { pos: { x: 0, y: 4 }, facing: "E" as const };
const ENEMY_START = { pos: { x: 14, y: 4 }, facing: "W" as const };

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
  // Real kids' bots, fetched once. They sit alongside the presets — a rival with a NAME is worth ten
  // robots we wrote ourselves.
  const [rivals, setRivals] = useState<PublishedBot[]>([]);
  const [board, setBoard] = useState<PublishedBot[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const rival = rivals.find((r) => r.userId === enemyId) ?? null;
  const [code, setCode] = useState(STARTER);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  // An opponent is either one of our presets or another kid's published bot. Normalise both into the
  // same shape so the fight code never has to care which it is — a rival IS just a program, which is
  // the whole reason this feature costs no infrastructure.
  const preset = presetById(enemyId);
  const enemy = preset
    ? { name: preset.name, source: preset.source, stats: preset.stats, real: false as const, userId: null }
    : rival
      ? { name: `${rival.botName} (${rival.username})`, source: rival.source, stats: undefined, real: true as const, userId: rival.userId }
      : { name: "SNIPER", source: PRESETS[1].source, stats: PRESETS[1].stats, real: false as const, userId: null };

  // Your Garage loadout feeds the fight — unless you've overloaded the frame, in which case the
  // gear doesn't fit and your bot rolls out stock. Weight is a real constraint, not a suggestion.
  const save = loadSave();
  const ls = computeStats(save.loadout.chassis, save.loadout.equipped);
  const overloaded = ls.overWeight || ls.overSlots;
  const myStats = overloaded ? undefined : { armor: ls.armor, damage: ls.damage, range: ls.range };
  const myMax = myStats?.armor ?? 100;

  const enemyMax = (preset?.stats?.armor ?? 100);
  const [hp, setHp] = useState({ player: myMax, enemy: enemyMax });
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [status, setStatus] = useState("Write your bot's brain, then press FIGHT — once it starts, you can't steer it.");

  useEffect(() => {
    void (async () => {
      setLoggedIn(!!(await currentAccount()));
      setRivals(await fetchOpponents());
      setBoard(await leaderboard());
    })();
  }, []);

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
        "lastStanding", // this room is a FIGHT. The beacon wins nothing here.
      );
    } catch (e) {
      setStatus(`Something tripped up: ${(e as Error).message}`);
      return;
    }
    analytics.battleRun?.(enemyId);
    // Wipe the last fight off the board first. Without this, a rematch began on top of the previous
    // battle's wreckage — a dead, tipped-over bot lying in the middle of the new fight. Its ghost.
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
        analytics.battleResult?.(enemyId, res.outcome);
        // Her bot beat Maya's, and Maya isn't online to record her own loss — so we write the result
        // to the opponent's row. The database only lets us add one to a counter, never anything else.
        if (enemy.real && enemy.userId && res.outcome !== "draw") {
          void recordOutcome(enemy.userId, res.outcome === "lose");
        }
      },
    });
  }

  const resultText = result === "win" ? "★ YOUR BOT WON! ★" : result === "lose" ? "wrecked — fix your code and rematch" : result === "draw" ? "a draw — neither reached the goal" : "";

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", height: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ width: 240, flex: "none", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
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
        {rivals.length ? (
          <Panel label="REAL RIVALS">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rivals.map((r) => (
                <button key={r.userId} onClick={() => { if (!running) { setEnemyId(r.userId); setResult(null); } }}
                  style={{ all: "unset", cursor: running ? "default" : "pointer", padding: "8px 10px", borderRadius: 8,
                    border: `1.5px solid ${r.userId === enemyId ? "var(--green)" : "var(--line)"}`,
                    background: r.userId === enemyId ? "rgba(111,227,165,.08)" : "transparent" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink)" }}>{r.botName}</div>
                  <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)" }}>
                    {r.username} · {r.wins}W {r.losses}L
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        ) : null}

        {/* Publishing is the whole retention loop: her bot keeps fighting while she's asleep, and she
            comes back to find out what happened. Say plainly what it means — a kid should never be
            surprised to discover strangers have been playing against something of hers. */}
        {cloudEnabled && loggedIn ? (
          <Panel label="YOUR BOT">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)", marginBottom: 8 }}>
              Publish your bot and other kids will fight it while you're away. They see your code's
              MOVES, never your code.
            </div>
            <Button variant="quiet" size="sm" disabled={running}
              onClick={async () => {
                setPublishMsg("checking your bot…");
                setErrorLine(null);
                // Check BEFORE it goes out. A broken bot that forfeits every fight in silence is the
                // worst thing we could do to the kid who published it — she'd never find out why.
                const res = await publishBot(code, "MY BOT", [...BATTLE_API, ...BATTLE_EXTRA]);
                if (res.ok) {
                  setPublishMsg("Published. It's fighting for you now, even when you're not here.");
                  setRivals(await fetchOpponents());
                  setBoard(await leaderboard());
                } else {
                  setPublishMsg(res.message);
                  if (res.line) setErrorLine(res.line); // point at the line, right here, so she can fix it
                }
              }}>
              ▲ PUBLISH MY BOT
            </Button>
            {publishMsg ? (
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", marginTop: 6 }}>{publishMsg}</div>
            ) : null}
          </Panel>
        ) : null}

        {board.length ? (
          <Panel label="LEADERBOARD">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {board.map((b, i) => (
                <div key={b.userId} style={{ display: "flex", gap: 8, fontSize: "var(--text-2xs)" }}>
                  <span style={{ color: "var(--text-dim)", width: 16 }}>{i + 1}</span>
                  <span style={{ color: "var(--ink)", fontWeight: 700, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.botName}
                  </span>
                  <span style={{ color: "var(--green)" }}>{b.wins}W</span>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        {/* She could not see what verbs existed. There was no command list in the arena at all — the
            campaign has one, the place she actually needs it did not. Every battle-only sensor was
            effectively invisible, which is the same as not existing. */}
        <Panel label="BATTLE COMMANDS">
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {[
              ["forward(n) / back(n)", "roll — back() reverses without turning"],
              ["left() / right()", "turn 90°"],
              ["shoot()", "fire — you hit up to 6 squares away"],
              ["enemyAhead()", "is your rival in your sights?"],
              ["enemyNear()", "is it right next to you?"],
              ["closerAhead()", "would rolling forward close the gap? (this is how you HUNT)"],
              ["enemyLeft() / enemyRight()", "which way to turn to face it"],
              ["hurt()", "are you badly damaged? (this is how you RETREAT)"],
              ["atBeacon()", "are you standing on the goal?"],
              ["blocked()", "is a wall in the way?"],
            ].map(([sig, desc]) => (
              <div key={sig} style={{ borderTop: "1px dashed var(--line)", paddingTop: 4 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--cyan)", fontWeight: 700 }}>{sig}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.4 }}>{desc}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* A house bot you can't beat by THINKING is just a dice roll. Say how each one dies. */}
        {preset ? (
          <Panel label="HOW TO BEAT IT">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
              {preset.weakness}
            </div>
          </Panel>
        ) : null}

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
          <HealthBar label={enemy.name} hp={hp.enemy} max={enemyMax} color="var(--red)" />
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

      <div style={{ width: "clamp(420px, 34vw, 620px)", flex: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor value={code} onChange={setCode} onRun={fight} errorLine={errorLine} world={4} extraApi={BATTLE_EXTRA} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={fight} disabled={running} style={{ flex: 1 }}>
            {running ? "■ FIGHTING…" : result ? "▶ REMATCH" : "▶ FIGHT"}
          </Button>
          {/* You could not stop a fight. It ran to the end whatever happened, and a kid who could see
              she was losing just had to sit and watch. */}
          {running ? (
            <Button variant="quiet" onClick={() => { battle.current?.scene.stop(); setRunning(false); setStatus("Stopped. Change your code and go again."); }}>
              ■ STOP
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
