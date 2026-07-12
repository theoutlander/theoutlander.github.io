// src/ui/ArenaHub.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Chip } from "./components/Chip";
import { AwayCard } from "./AwayCard";
import { cachedStandings, previousStandings, seasonToken, seasonSalt } from "../rivals/leagueCache";
import { board, matchSeed, playMatch, type Fighter, type Standing } from "../rivals/league";
import { runBattle } from "../sim/battle";
import { fetchOpponents, leaderboard, publishBot, type PublishedBot } from "../rivals/publish";
import { PRESETS, BATTLE_API } from "../content/enemies";
import { ReplayViewer } from "./ReplayViewer";
import { currentAccount, cloudEnabled } from "../state/account";
import { loadSave } from "../state/save";
import type { Opponent } from "./FightScreen";

const BATTLE_EXTRA = ["enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight", "hurt"];

function toFighter(b: PublishedBot): Fighter {
  return { id: b.userId, name: `${b.botName} · ${b.username}`, source: b.source };
}

/** Board 1 of a pairing, ready to hand to ReplayViewer — salted with the SAME season salt
 *  `cachedStandings` used to rank the ladder, so what you watch is the board that actually
 *  decided the standings, not a differently-seeded lookalike. Fights it out for real (via
 *  `runBattle`, the same engine `playMatch` calls internally) purely to get the event log —
 *  ReplayViewer just plays that log back, it never re-derives it. */
function watchPairing(a: Fighter, b: Fighter) {
  const salt = seasonSalt(seasonToken());
  const bd = board(matchSeed(a.id, b.id) + salt);
  const res = runBattle(
    bd.arena,
    [
      { id: a.id, source: a.source, isPlayer: true, stats: a.stats },
      { id: b.id, source: b.source, stats: b.stats },
    ],
    [bd.left, bd.right],
    BATTLE_API,
    "lastStanding",
    120, // league.ts's fightOnce() caps at 120 rounds — match it, or a fight the ladder scored as a
    // draw (capped) could replay past that cap and resolve decisively, showing a different result
    // than the one that actually decided the standings.
  );
  const arena = bd.arena;
  const bots = [
    { bodyColor: 0x5fd4ff, domeColor: 0xffe08a, start: bd.left },
    { bodyColor: 0xff6b7a, domeColor: 0xffe08a, start: bd.right },
  ];
  return { arena, bots, events: res.events };
}

function trendFor(id: string, current: Standing[], previous: Standing[] | null): "up" | "down" | "same" | null {
  if (!previous) return null;
  const now = current.find((s) => s.fighter.id === id);
  const before = previous.find((s) => s.fighter.id === id);
  if (!now || !before) return null;
  return now.points > before.points ? "up" : now.points < before.points ? "down" : "same";
}

export function ArenaHub({ onFight }: { onFight: (opponent: Opponent) => void }) {
  const [board_, setBoard] = useState<PublishedBot[]>([]);
  const [presetRivals, setPresetRivals] = useState<PublishedBot[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [code] = useState(loadSave().publishedSource ?? "");
  const [watching, setWatching] = useState<{ a: Fighter; b: Fighter } | null>(null);
  const loggedIn = accountId !== null;

  useEffect(() => {
    void (async () => {
      const acc = await currentAccount();
      setAccountId(acc?.id ?? null);
      setBoard(await leaderboard(200)); // includes the caller's own bot — see Interfaces note above
      setPresetRivals(await fetchOpponents());
    })();
  }, []);

  // Standings are the expensive derived value everything below keys off — memoize on the roster
  // (board_) so an unrelated re-render (closing the watch panel, a publish message landing) doesn't
  // silently re-run cachedStandings.
  const standings = useMemo(() => cachedStandings(board_.map(toFighter)), [board_]);
  const previous = previousStandings();
  const featured = useMemo(() => standings.slice(0, 2), [standings]);
  const myBotRow = accountId ? standings.find((s) => s.fighter.id === accountId) : undefined;
  const salt = seasonSalt(seasonToken());

  // FEATURED MATCH replay: a real up-to-120-round runBattle — must only re-run when the featured
  // pairing or the season salt changes, not on every render.
  const featuredReplay = useMemo(() => {
    if (featured.length !== 2) return null;
    const a = featured[0].fighter;
    const b = featured[1].fighter;
    return { key: `${a.id}-${b.id}`, names: `${a.name} vs ${b.name}`, payload: watchPairing(a, b) };
  }, [featured, salt]);

  // WATCHING panel replay: same cost as above, keyed on whichever pairing the kid picked.
  const watchingReplay = useMemo(() => {
    if (!watching) return null;
    return { key: `${watching.a.id}-${watching.b.id}`, payload: watchPairing(watching.a, watching.b) };
  }, [watching, salt]);

  // FRESH RESULTS rows: each runs a 4-board playMatch, up to 5 of them — memoize on standings + salt
  // so they don't re-simulate on every render either.
  const freshResults = useMemo(() => {
    const rows: { key: string; a: Fighter; b: Fighter; line: string }[] = [];
    for (let i = 0; i < Math.min(5, standings.length); i++) {
      const s = standings[i];
      const next = standings[i + 1];
      if (!next) continue;
      const m = playMatch(s.fighter, next.fighter, salt);
      const line =
        m.winner === "draw"
          ? `${s.fighter.name} drew ${next.fighter.name}`
          : m.winner === "a"
            ? `${s.fighter.name} beat ${next.fighter.name} ${m.wins}-${m.losses}`
            : `${next.fighter.name} beat ${s.fighter.name} ${m.losses}-${m.wins}`;
      rows.push({ key: s.fighter.id, a: s.fighter, b: next.fighter, line });
    }
    return rows;
  }, [standings, salt]);

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 20px", height: "100%", boxSizing: "border-box", overflow: "auto" }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        <Chip color="dim">BOTS FIGHT · KIDS NEVER CHAT</Chip>

        {featuredReplay ? (
          <Panel label="FEATURED MATCH">
            <ReplayViewer key={featuredReplay.key} {...featuredReplay.payload} autoPlay height={200} />
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>{featuredReplay.names}</div>
          </Panel>
        ) : null}

        <Panel label="LADDER">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {standings.map((s, i) => {
              const trend = trendFor(s.fighter.id, standings, previous);
              return (
                <div key={s.fighter.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "var(--text-2xs)" }}>
                  <span style={{ color: "var(--text-dim)", width: 20 }}>{i + 1}</span>
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", color: "var(--ink)", fontWeight: 700 }}>
                    {s.fighter.name}
                  </span>
                  <span>{s.points} PTS</span>
                  <span style={{ color: "var(--text-dim)" }}>{s.wins}-{s.losses}-{s.draws}</span>
                  {trend ? <Chip color={trend === "up" ? "green" : trend === "down" ? "red" : "dim"}>{trend === "up" ? "▲" : trend === "down" ? "▼" : "–"}</Chip> : null}
                  <Button size="sm" variant="quiet" onClick={() => setWatching({ a: s.fighter, b: standings[(i + 1) % standings.length]?.fighter ?? s.fighter })}>
                    WATCH
                  </Button>
                </div>
              );
            })}
          </div>
        </Panel>

        {watchingReplay ? (
          <Panel label="WATCHING">
            <ReplayViewer key={watchingReplay.key} {...watchingReplay.payload} autoPlay height={200} />
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)" }}>
              BOARD 1 OF 4 — THE MATCHUP IS DECIDED ACROSS ALL FOUR.
            </div>
            <Button size="sm" variant="ghost" onClick={() => setWatching(null)} style={{ alignSelf: "flex-start" }}>
              CLOSE
            </Button>
          </Panel>
        ) : null}

        {standings.length > 1 ? (
          <Panel label="FRESH RESULTS">
            {/* consecutive ranked pairs, not literal "just happened" fights (there's no fight log to
                read from — every result here is re-derived, same as the rest of the ladder) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {freshResults.map((r) => (
                <div key={r.key} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: "var(--text-2xs)" }}>
                  <span style={{ color: "var(--text-dim)" }}>{r.line}</span>
                  <Button size="sm" variant="quiet" onClick={() => setWatching({ a: r.a, b: r.b })}>
                    WATCH BOARD 1
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}

        <Panel label="HOW THE LADDER WORKS">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
            Every bot fights every other bot, four boards each, from both sides. Win a matchup for 3
            points, draw for 1. New boards every Friday — same code, fresh maps.
          </div>
        </Panel>

        <Panel label="OPPONENT">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PRESETS.map((p) => (
              <button key={p.id} onClick={() => onFight({ kind: "preset", id: p.id })}
                style={{ all: "unset", cursor: "pointer", padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--line)" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink)" }}>{p.name}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.4 }}>{p.desc}</div>
              </button>
            ))}
            {presetRivals.map((r) => (
              <button key={r.userId} onClick={() => onFight({ kind: "rival", bot: r })}
                style={{ all: "unset", cursor: "pointer", padding: "8px 10px", borderRadius: 8, border: "1.5px solid var(--line)" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ink)" }}>{r.botName}</div>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)" }}>{r.username} · {r.wins}W {r.losses}L</div>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div style={{ width: 320, flex: "none", display: "flex", flexDirection: "column", gap: 12 }}>
        <Panel label="YOUR BOT">
          {myBotRow ? (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)" }}>
              #{standings.indexOf(myBotRow) + 1} on the ladder · {myBotRow.points} PTS
            </div>
          ) : (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
              Publish your bot and other kids will fight it while you're away. They see your code's
              MOVES, never your code.
            </div>
          )}
          {cloudEnabled && loggedIn && code ? (
            <Button
              variant="quiet"
              size="sm"
              onClick={async () => {
                setPublishMsg("checking your bot…");
                const res = await publishBot(code, "MY BOT", [...BATTLE_API, ...BATTLE_EXTRA]);
                setPublishMsg(res.ok ? "Published. It's fighting for you now, even when you're not here." : res.message);
                if (res.ok) setBoard(await leaderboard(200));
              }}
            >
              ▲ REPUBLISH
            </Button>
          ) : null}
          <Button size="sm" onClick={() => onFight({ kind: "preset", id: PRESETS[0].id })}>
            TEST FIGHT
          </Button>
          {publishMsg ? <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)" }}>{publishMsg}</div> : null}
        </Panel>

        <AwayCard onWatch={() => setWatching(featured.length === 2 ? { a: featured[0].fighter, b: featured[1].fighter } : null)} />
      </div>
    </div>
  );
}
