import React, { useState } from "react";
import { Panel } from "./components/Panel";
import { Button } from "./components/Button";
import { REASONS, NOTE_MAX, sendFeedback, type ReasonId, type FeedbackContext } from "../state/feedback";

/**
 * Where a kid says "this makes no sense".
 *
 * It lives in the mission's left column, next to the hints — i.e. exactly where she already is when
 * she's stuck. A feedback link buried in a settings menu gets used by nobody, least of all a
 * nine-year-old who is, right now, annoyed and about to close the tab.
 *
 * The tone matters as much as the placement. "Report a bug" invites nothing; it sounds like her
 * fault and like paperwork. "This doesn't make sense" gives her permission to blame US, which is
 * both kinder and, most of the time, correct.
 */
export function FeedbackButton({ context }: { context: FeedbackContext }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReasonId | null>(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Panel label="THANK YOU">
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)" }}>
          Got it — that helps more than you'd think. If this bit is confusing, that's on us, and we'll
          fix it.
        </div>
      </Panel>
    );
  }

  if (!open) {
    return (
      <Button variant="quiet" size="sm" onClick={() => setOpen(true)}>
        THIS DOESN'T MAKE SENSE
      </Button>
    );
  }

  async function send() {
    if (!reason) return;
    setSent(true); // optimistic: she's told us, and a slow network is not her problem
    await sendFeedback({ ...context, reason, note: note.trim() || undefined });
  }

  return (
    <Panel label="WHAT'S WRONG?">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", lineHeight: 1.45 }}>
          Tell us what's going on. You don't have to explain — one tap is plenty.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {REASONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setReason(r.id)}
              style={{
                all: "unset", cursor: "pointer", padding: "7px 9px", borderRadius: 8,
                fontSize: "var(--text-xs)", lineHeight: 1.35, color: "var(--ink)",
                border: `1.5px solid ${reason === r.id ? "var(--cyan)" : "var(--line)"}`,
                background: reason === r.id ? "rgba(95,212,255,.08)" : "transparent",
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        <textarea
          value={note}
          maxLength={NOTE_MAX}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything else? (you can skip this — don't put your name)"
          rows={2}
          style={{
            resize: "none", borderRadius: 8, border: "1.5px solid var(--line)",
            background: "transparent", color: "var(--ink)", padding: "6px 8px",
            fontSize: "var(--text-xs)", fontFamily: "inherit",
          }}
        />

        <div style={{ display: "flex", gap: 6 }}>
          <Button size="sm" onClick={send} disabled={!reason} style={{ flex: 1 }}>
            SEND
          </Button>
          <Button variant="quiet" size="sm" onClick={() => setOpen(false)}>
            NEVER MIND
          </Button>
        </div>
      </div>
    </Panel>
  );
}
