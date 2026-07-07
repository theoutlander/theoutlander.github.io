import React from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Stars } from "./components/Stars";
import { Coin } from "./components/Coin";

export interface MissionResult {
  stars: number;
  coinsEarned: number;
  newlyUnlocked: string | null;
  lines: number;
  par: number;
  cutscene?: string;
}

/** MISSION CLEAR moment — stars, coins, any new unlock, and a way forward. Loud and celebratory
 *  per the design system (pop + confetti energy), no numbers the kid hasn't felt. */
export function ResultOverlay({
  result,
  onRetry,
  onContinue,
  continueLabel = "CONTINUE →",
}: {
  result: MissionResult;
  onRetry: () => void;
  onContinue: () => void;
  continueLabel?: string;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,10,24,.62)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
      }}
    >
      <Panel
        active
        style={{
          width: "min(420px, 92vw)",
          alignItems: "center",
          textAlign: "center",
          gap: 16,
          padding: "28px 26px",
          animation: "cbPop var(--speed-pop) var(--ease-snap)",
        }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", color: "var(--amber)" }}>
          ★ MISSION CLEAR ★
        </div>
        <Stars earned={result.stars} total={3} size={30} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-body)", fontSize: "var(--text-md)" }}>
          <span>earned</span>
          <Coin count={result.coinsEarned} />
        </div>
        {/* The "can you do better?" nudge — on the code-quality axis (lines), not a timer. */}
        <div style={{ fontSize: "var(--text-sm)", color: result.lines <= result.par ? "var(--green)" : "var(--text-dim)" }}>
          YOU: {result.lines} {result.lines === 1 ? "line" : "lines"} · PAR: {result.par}
          {result.lines > result.par ? " — can you do it in fewer lines?" : ""}
        </div>
        {result.newlyUnlocked ? (
          <div
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--green)",
              border: "2px solid var(--green)",
              borderRadius: "var(--radius-md)",
              padding: "8px 14px",
              fontWeight: 700,
              letterSpacing: "var(--label-tracking-tight)",
            }}
          >
            NEW UNLOCK: {result.newlyUnlocked}
          </div>
        ) : null}
        {result.cutscene ? (
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: "var(--leading-body)", fontStyle: "italic" }}>
            {result.cutscene}
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button variant="ghost" onClick={onRetry}>
            RETRY
          </Button>
          <Button onClick={onContinue}>{continueLabel}</Button>
        </div>
      </Panel>
    </div>
  );
}
