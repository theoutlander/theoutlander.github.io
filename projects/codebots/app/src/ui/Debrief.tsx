// src/ui/Debrief.tsx
import React from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Chip } from "./components/Chip";
import { detectConstructs, firstUnknownConstruct, constructWorld, CONSTRUCT_MISSIONS, type Construct } from "../rivals/constructs";
import { computeDebriefStats } from "../rivals/debriefStats";
import type { SaveData } from "../state/save";
import type { FightRecord } from "./FightScreen";

const CONSTRUCT_LABEL: Record<Construct, string> = {
  if: "IF", else: "ELSE", while: "WHILE", for: "FOR", function: "FUNCTION",
};

/**
 * WRECKED — BUT LOOK WHY.
 *
 * The one thing the old toast never did: turn a loss into a reason to go learn something. Every
 * construct chip and every key moment here comes straight out of the event log and the opponent's
 * published source — nothing new is tracked to build this screen, and losses never cost points or
 * coins. This is a screen, not a modal: it's the only thing between a fight and the Hub.
 */
export function Debrief({
  record,
  save,
  onRematch,
  onLearn,
  onBackToHub,
}: {
  record: FightRecord;
  save: SaveData;
  onRematch: () => void;
  onLearn: (missionId: string) => void;
  onBackToHub: () => void;
}) {
  const { constructs, sensors } = detectConstructs(record.opponentSource);
  const missing = firstUnknownConstruct(save, constructs);
  const stats = computeDebriefStats(record.events, record.rounds, 0, 1, record.opponentMaxArmor);

  const title =
    record.outcome === "win" ? "★ YOUR BOT WON! ★" : record.outcome === "lose" ? "WRECKED — BUT LOOK WHY" : "A DRAW";

  const closestMoment = stats.keyMoments[stats.keyMoments.length - 1] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "20px 24px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-2xl)", color: record.outcome === "win" ? "var(--green)" : record.outcome === "lose" ? "var(--red)" : "var(--text-dim)" }}>
        {title}
      </div>
      <div style={{ fontSize: "var(--text-sm)", color: "var(--text-dim)" }}>
        vs {record.opponentName}
      </div>

      <Panel label="WHAT THEY USED">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {constructs.map((c) => {
            const known = c !== missing;
            return (
              <Chip key={c} color={known ? "green" : "red"} dashed={!known}>
                {CONSTRUCT_LABEL[c]}
              </Chip>
            );
          })}
          {sensors.map((s) => (
            <Chip key={s} color="dim">{s}()</Chip>
          ))}
        </div>
      </Panel>

      {missing ? (
        <Button onClick={() => onLearn(CONSTRUCT_MISSIONS[missing])} style={{ alignSelf: "flex-start" }}>
          LEARN {CONSTRUCT_LABEL[missing]} — WORLD {constructWorld(missing)}
        </Button>
      ) : closestMoment ? (
        <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>
          You already know everything they used — round {closestMoment.round} was the moment that
          decided it.
        </div>
      ) : null}

      <Panel label="THE FIGHT">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "var(--text-xs)" }}>
          <div>ROUNDS SURVIVED <b>{stats.roundsSurvived}</b></div>
          <div>DAMAGE DEALT <b>{stats.damageDealt}</b></div>
          <div>HITS LANDED <b>{stats.hitsLanded}/{stats.hitsAttempted}</b></div>
          <div>WASTED SHOTS <b>{stats.wastedShots}</b></div>
        </div>
        <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
          {stats.keyMoments.map((m, i) => (
            <div
              key={i}
              title={`round ${m.round} — ${m.kind}`}
              style={{
                width: 10, height: 10, borderRadius: "50%",
                background: m.kind === "wreck" ? "var(--red)" : "var(--amber)",
              }}
            />
          ))}
        </div>
      </Panel>

      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost" onClick={onBackToHub}>‹ ARENA</Button>
        <Button onClick={onRematch}>▶ REMATCH</Button>
      </div>
    </div>
  );
}
