import React, { useState } from "react";
import { Panel } from "./components/Panel";

/**
 * The rules a computer actually plays by — the stuff that trips up every beginner and that solving
 * levels never teaches on its own: computers are literal, capitals are different letters, camelCase
 * exists, brackets pair up, and the bot runs your program BY ITSELF once you press RUN.
 * Always available, collapsed by default so it doesn't crowd the level.
 */
const RULES: { rule: string; why: string }[] = [
  {
    rule: "The bot does EXACTLY what you wrote",
    why: "You're not steering it. You write all the moves first, press RUN, and it drives itself — even off a cliff.",
  },
  {
    rule: "Spell it exactly",
    why: "forwrd() means nothing. It has to be forward().",
  },
  {
    rule: "CAPITAL letters are different letters",
    why: "To a computer, Forward and forward are two different words. Only forward() works.",
  },
  {
    rule: "Some names squish two words together",
    why: "The second word gets a capital: targetAhead(), atBeacon(). That bump in the middle is on purpose.",
  },
  {
    rule: "Brackets come in pairs",
    why: "Every ( needs a ). Every { needs a }.",
  },
];

/**
 * `startOpen` — a BEGINNER sees these expanded. They were collapsed behind "why won't it work? tap
 * me", which only appeals to a kid who has ALREADY failed; a brand-new player never tapped it, and
 * so never learned that capitals matter or that the bot runs itself. Those were exactly the two
 * things a real 9-year-old got stuck on. Open by default until she's found her feet.
 */
export function RobotRules({ startOpen = false }: { startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <Panel label="ROBOT RULES">
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, width: "100%" }}
      >
        <span style={{ color: "var(--text-dim)", fontSize: "var(--text-2xs)" }}>{open ? "▾" : "▸"}</span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)" }}>
          {open ? "how your robot thinks" : "how your robot thinks — tap to read"}
        </span>
      </button>
      {open ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          {RULES.map((r) => (
            <div key={r.rule} style={{ borderTop: "1px dashed var(--line)", paddingTop: 6 }}>
              <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--amber)" }}>{r.rule}</div>
              <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.45 }}>{r.why}</div>
            </div>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}
