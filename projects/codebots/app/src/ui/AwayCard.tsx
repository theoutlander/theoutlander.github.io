import React, { useEffect, useState } from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Chip } from "./components/Chip";
import { loadSave, saveSave } from "../state/save";
import { fetchOpponents } from "../rivals/publish";
import { whileYouWereAway, markSeen, type AwayReport } from "../rivals/away";
import { analytics } from "../state/analytics";
import type { Fighter } from "../rivals/league";

/**
 * THE FIRST THING SHE SEES WHEN SHE COMES BACK.
 *
 * The game never had a reason to return. This is it — and it exists because the sim is deterministic,
 * so her bot's fight against a new rival is a pure function of two programs. Nothing has to run
 * overnight on a server: the result is a FACT about the code, and we work it out the moment she opens
 * the door. It's the same answer it would have been at 3am.
 *
 * The loss is the point. "Someone beat you" on its own is just a defeat; "someone beat you — here's
 * how, and here's their code" is a lesson she came back for. That's the only competitive loop worth
 * putting in front of a child.
 *
 * It says nothing at all unless there's something real to say. A card that greets her every single day
 * with "0 new fights" is a card she learns to look past.
 */
export function AwayCard({ onWatch }: { onWatch: () => void }) {
  const [report, setReport] = useState<AwayReport | null>(null);

  useEffect(() => {
    void (async () => {
      const save = loadSave();
      if (!save.publishedSource) return; // she hasn't put a bot out there yet — nothing to report

      const published = await fetchOpponents(30);
      const rivals: Fighter[] = published.map((b) => ({
        id: b.userId,
        name: `${b.botName} · ${b.username}`,
        source: b.source,
      }));
      if (!rivals.length) return;

      const mine: Fighter = { id: "me", name: "your bot", source: save.publishedSource };
      const r = whileYouWereAway(mine, rivals, save.seenRivals ?? {});
      if (!r.results.length) return; // no news is no card

      setReport(r);
      analytics.awayResults?.(r.results.length, r.wins, r.losses);
      // Remember them, so tomorrow's card only reports what's actually new.
      saveSave({ ...loadSave(), seenRivals: { ...(save.seenRivals ?? {}), ...markSeen(rivals) } });
    })();
  }, []);

  if (!report) return null;

  const { wins, losses, draws, bestLesson, results } = report;

  return (
    <Panel active style={{ gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)" }}>
          WHILE YOU WERE AWAY
        </span>
        {wins ? <Chip color="green">{wins} WON</Chip> : null}
        {losses ? <Chip color="amber">{losses} LOST</Chip> : null}
        {draws ? <Chip color="dim">{draws} DREW</Chip> : null}
      </div>

      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
        {results.length === 1
          ? "A new bot took on yours."
          : `${results.length} new bots took on yours.`}{" "}
        {losses
          ? "One of them beat you — and you can watch exactly how."
          : "Your bot held its ground."}
      </div>

      {bestLesson ? (
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", lineHeight: 1.5 }}>
          <b style={{ color: "var(--ink)" }}>{bestLesson.rival.name}</b> beat you{" "}
          {bestLesson.match.losses}–{bestLesson.match.wins}. They know something you don't yet.
        </div>
      ) : null}

      <Button size="sm" onClick={onWatch} style={{ alignSelf: "flex-start" }}>
        {losses ? "▶ WATCH HOW THEY BEAT YOU" : "▶ SEE THE FIGHTS"}
      </Button>
    </Panel>
  );
}
