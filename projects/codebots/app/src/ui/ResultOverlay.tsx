import React, { useState } from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { Stars } from "./components/Stars";
import { Coin } from "./components/Coin";
import { BadgeIcon } from "./components/BadgeIcon";
import type { Badge } from "../content/badges";

export interface MissionResult {
  stars: number;
  coinsEarned: number;
  newlyUnlocked: string | null;
  lines: number;
  par: number;
  cutscene?: string;
  newBadges?: Badge[];
}

type Rating = "fun" | "ok" | "meh";

/** A geometric face (happy / ok / sad) — the design system bans literal emoji, so we draw it. */
function Face({ mood, color }: { mood: Rating; color: string }) {
  const eye: React.CSSProperties = { position: "absolute", top: 12, width: 4, height: 4, borderRadius: "50%", background: color };
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${color}`, position: "relative" }}>
      <div style={{ ...eye, left: 9 }} />
      <div style={{ ...eye, right: 9 }} />
      {mood === "fun" && (
        <div style={{ position: "absolute", left: 9, right: 9, bottom: 8, height: 7, borderBottom: `2px solid ${color}`, borderRadius: "0 0 12px 12px" }} />
      )}
      {mood === "ok" && (
        <div style={{ position: "absolute", left: 11, right: 11, bottom: 12, height: 2, background: color, borderRadius: 2 }} />
      )}
      {mood === "meh" && (
        <div style={{ position: "absolute", left: 9, right: 9, bottom: 10, height: 7, borderTop: `2px solid ${color}`, borderRadius: "12px 12px 0 0" }} />
      )}
    </div>
  );
}

function FeedbackRow({ onRate }: { onRate: (r: Rating) => void }) {
  const [rated, setRated] = useState<Rating | null>(null);
  const faces: { mood: Rating; color: string; label: string }[] = [
    { mood: "fun", color: "var(--green)", label: "FUN!" },
    { mood: "ok", color: "var(--amber)", label: "OK" },
    { mood: "meh", color: "var(--red)", label: "MEH" },
  ];
  if (rated) {
    return <div style={{ fontSize: "var(--text-sm)", color: "var(--green)", fontWeight: 700 }}>thanks! ★</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--label-tracking)", color: "var(--text-dim)", fontWeight: 700 }}>
        WAS THIS FUN?
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        {faces.map((f) => (
          <button
            key={f.mood}
            onClick={() => {
              setRated(f.mood);
              onRate(f.mood);
            }}
            style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
          >
            <Face mood={f.mood} color={f.color} />
            <span style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", fontWeight: 700, letterSpacing: "1px" }}>{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** MISSION CLEAR moment — stars, coins, any new unlock, and a way forward. Loud and celebratory
 *  per the design system (pop + confetti energy), no numbers the kid hasn't felt. */
export function ResultOverlay({
  result,
  onRetry,
  onContinue,
  onFeedback,
  continueLabel = "CONTINUE →",
}: {
  result: MissionResult;
  onRetry: () => void;
  onContinue: () => void;
  onFeedback?: (rating: Rating) => void;
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
          ★ LEVEL CLEAR ★
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
        {result.newBadges && result.newBadges.length ? (
          <div
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              border: "2px solid var(--amber)", borderRadius: "var(--radius-md)", padding: "12px 16px",
              background: "rgba(255,180,84,.06)", width: "100%", boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "var(--label-tracking)", color: "var(--amber)" }}>
              {result.newBadges.length > 1 ? "★ NEW BADGES!" : "★ NEW BADGE!"}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              {result.newBadges.map((b) => (
                <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, maxWidth: 96 }}>
                  <BadgeIcon icon={b.icon} earned size={52} />
                  <div style={{ fontSize: "var(--text-2xs)", fontWeight: 700, color: "var(--ink)" }}>{b.title}</div>
                  <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.3 }}>{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {result.cutscene ? (
          <div style={{ fontSize: "var(--text-sm)", color: "var(--text-body)", lineHeight: "var(--leading-body)", fontStyle: "italic" }}>
            {result.cutscene}
          </div>
        ) : null}
        {onFeedback ? <FeedbackRow onRate={onFeedback} /> : null}
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
