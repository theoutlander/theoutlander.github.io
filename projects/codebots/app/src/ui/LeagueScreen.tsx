import React, { useEffect, useMemo, useRef, useState } from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Chip } from "./components/Chip";
import { Sfx } from "../sound/sfx";
import { mountBattle, type MountedBattle } from "../view/mountBattle";
import { runBattle } from "../sim/battle";
import { PRESETS, BATTLE_API } from "../content/enemies";
import { standings, board, matchSeed, type Fighter, type Standing } from "../rivals/league";
import { seasonToken, seasonSalt } from "../rivals/leagueCache";
import { fetchOpponents } from "../rivals/publish";

/**
 * THE LEAGUE — the table, and any fight in it, on demand.
 *
 * The question this answers is the best one anybody asked about the feature: "if nobody is watching,
 * how do the fights happen?"
 *
 * They don't. They don't need to.
 *
 * The sim is deterministic, so the result of A vs B is a pure FUNCTION of their two programs. The
 * standings aren't a record of matches that took place somewhere — they're derived, here, in this
 * browser, in a few milliseconds, from the published code. Every browser computes the identical table.
 *
 * Which means: no server, no cron job, no background process, and no write conflict when ten kids open
 * the page at once. It's also tamper-proof — nobody can inflate her own record, because anyone can
 * recompute the truth from the source. Storing win counts would have been strictly worse: that's the
 * version with races in it, and cheating.
 *
 * And because a fight is a re-derivation rather than a recording, you can sit and watch ANY pairing in
 * the table, including two bots that have nothing to do with you.
 */
export function LeagueScreen({
  paint,
  onExit,
}: {
  paint: { bodyColor: number; domeColor: number };
  onExit: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<MountedBattle | null>(null);
  const sfx = useRef<Sfx | null>(null);

  const [rivals, setRivals] = useState<Fighter[]>([]);
  const [pick, setPick] = useState<[string, string] | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Pick any two bots and watch them fight.");

  // The house bots stand in the table like everyone else. They are just programs, same as the kids'.
  const house: Fighter[] = useMemo(
    () => PRESETS.map((p) => ({ id: p.id, name: p.name, source: p.source, stats: p.stats })),
    [],
  );

  useEffect(() => {
    sfx.current = new Sfx();
    void (async () => {
      const published = await fetchOpponents(30);
      setRivals(published.map((b) => ({ id: b.userId, name: `${b.botName} · ${b.username}`, source: b.source })));
    })();
  }, []);

  const fighters = useMemo(() => [...house, ...rivals], [house, rivals]);

  // THIS season's boards. The Arena's ladder (leagueCache) ranks on the salted seeds; if this screen
  // ranked on the unsalted ones, the same two bots would fight different maps here and a kid could be
  // #3 in the Arena and #1 in the League in the same session. One salt, every consumer.
  const salt = seasonSalt(seasonToken());

  /**
   * The whole table, computed on the spot. This is the moment the "no server" claim either holds or
   * doesn't: a round-robin over N bots is N² matchups, each a handful of tiny deterministic fights.
   * At the sizes this will ever see, it's milliseconds.
   */
  const table: Standing[] = useMemo(() => (fighters.length > 1 ? standings(fighters, salt) : []), [fighters, salt]);

  async function watch(aId: string, bId: string) {
    const a = fighters.find((f) => f.id === aId);
    const b = fighters.find((f) => f.id === bId);
    if (!a || !b || running) return;

    // The SAME board the table was computed on — season salt and all (playMatch's first board is
    // seed + 0). What you watch is the fight that made the standings — not a re-enactment of it, and
    // not a different fight that happens to look similar.
    const bd = board(matchSeed(a.id, b.id) + salt);
    setRunning(true);
    setStatus(`${a.name} vs ${b.name}…`);

    view.current?.destroy();
    if (!host.current) return;
    const mounted = await mountBattle(host.current, bd.arena, [
      { bodyColor: paint.bodyColor, domeColor: paint.domeColor, start: bd.left },
      { bodyColor: 0xff6b7a, domeColor: 0xffe08a, start: bd.right },
    ]);
    view.current = mounted;

    const res = runBattle(
      bd.arena,
      [
        { id: a.id, source: a.source, isPlayer: true, stats: a.stats },
        { id: b.id, source: b.source, stats: b.stats },
      ],
      [bd.left, bd.right],
      BATTLE_API,
      "lastStanding",
      120,
    );

    mounted.scene.play(res.events, {
      onDone: () => {
        setRunning(false);
        setStatus(
          res.outcome === "win" ? `${a.name} wins.`
            : res.outcome === "lose" ? `${b.name} wins.`
            : "A draw — they wrecked each other, or neither could land a hit.",
        );
      },
    });
  }

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", height: "100%", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ width: 300, flex: "none", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        <Panel label="THE TABLE">
          <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 8 }}>
            Worked out right here, from everyone's code. Nobody can fake a win — anyone can check.
          </div>
          {table.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {table.map((s, i) => (
                <button
                  key={s.fighter.id}
                  onClick={() => setPick((p) => (p && p[0] && !p[1] && p[0] !== s.fighter.id ? [p[0], s.fighter.id] : [s.fighter.id, ""]))}
                  style={{
                    all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                    padding: "6px 8px", borderRadius: 6,
                    border: `1.5px solid ${pick?.includes(s.fighter.id) ? "var(--cyan)" : "transparent"}`,
                    background: pick?.includes(s.fighter.id) ? "rgba(95,212,255,.07)" : "transparent",
                  }}
                >
                  <span style={{ width: 18, color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)" }}>
                    {i + 1}
                  </span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.fighter.name}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--green)" }}>
                    {s.points}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
              Nobody's published a bot yet. Be the first.
            </div>
          )}
        </Panel>

        <Panel label="WATCH A FIGHT">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)", marginBottom: 8 }}>
            {pick?.[0] && pick?.[1]
              ? `${fighters.find((f) => f.id === pick[0])?.name} vs ${fighters.find((f) => f.id === pick[1])?.name}`
              : pick?.[0]
                ? "Now pick who they're fighting."
                : "Tap two bots in the table."}
          </div>
          <Button
            size="sm"
            disabled={!pick?.[0] || !pick?.[1] || running}
            onClick={() => pick && watch(pick[0], pick[1])}
            style={{ width: "100%" }}
          >
            {running ? "■ WATCHING…" : "▶ WATCH THEM FIGHT"}
          </Button>
        </Panel>

        <Panel label="HOW THE TABLE WORKS">
          <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.6 }}>
            Every bot fights every other bot, on several boards nobody has seen before. Both bots move
            at the same time, so nobody gets to shoot first. A win is 3 points, a draw is 1.
            <br />
            <br />
            The fights don't happen on a server somewhere — they're worked out from the code, the same
            way every time. That's why the same two bots always give the same result.
          </div>
        </Panel>

        <Button variant="quiet" size="sm" onClick={onExit}>‹ BACK</Button>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Chip color="cyan">{fighters.length} BOTS</Chip>
          <Chip color="dim">{Math.max(0, (fighters.length * (fighters.length - 1)) / 2)} MATCHUPS</Chip>
        </div>
        <div ref={host} style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: "hidden", border: "var(--border)", background: "var(--surface-arena)" }} />
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)", fontWeight: 700, minHeight: 22 }}>{status}</div>
      </div>
    </div>
  );
}
