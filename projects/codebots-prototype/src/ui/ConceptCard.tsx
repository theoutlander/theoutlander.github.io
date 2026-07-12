import React, { useState } from "react";
import type { Concept } from "../content/concepts";

/**
 * The teaching moment: a card explaining the NEW idea a level introduces. It opens expanded for a
 * first-time learner and starts collapsed once they've CLEARED the level (they've learned it, so a
 * replay isn't re-walled by the lesson) — the parent passes `learned`. Either way it's a header
 * they can toggle. "WATCH IT" runs a short demo in the arena (wired by the parent) so they can SEE
 * the idea before writing it. State is tied to real progress, never to mount lifecycle, so React
 * StrictMode's double-invoke can't wrongly collapse it.
 */
export function ConceptCard({
  concept,
  learned = false,
  onWatch,
}: {
  concept: Concept;
  learned?: boolean;
  onWatch?: () => void;
}) {
  const [open, setOpen] = useState(!learned);

  return (
    <div
      style={{
        border: "1.5px solid var(--cyan)",
        borderRadius: "var(--radius-panel, 10px)",
        background: "rgba(95,212,255,.06)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          width: "100%", boxSizing: "border-box", padding: "8px 10px",
        }}
      >
        <span
          style={{
            fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "1.5px",
            color: "var(--paper, #0D1A33)", background: "var(--cyan)", borderRadius: "var(--radius-pill, 999px)",
            padding: "1px 7px",
          }}
        >
          NEW IDEA
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-md)", color: "var(--ink)" }}>
          {concept.title}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ color: "var(--cyan)", fontSize: "var(--text-sm)" }}>{open ? "▾" : "▸"}</span>
      </button>

      {open ? (
        <div style={{ padding: "0 10px 10px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-body)", color: "var(--text-body)" }}>
            {concept.idea}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)", fontSize: "var(--text-xs)",
              color: "var(--cyan)", background: "rgba(0,0,0,.25)", borderRadius: 6, padding: "6px 8px",
              whiteSpace: "pre-wrap",
            }}
          >
            {concept.example}
          </div>
          {concept.exampleNote ? (
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", fontStyle: "italic" }}>
              → {concept.exampleNote}
            </div>
          ) : null}
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)" }}>
            <span style={{ fontWeight: 700, color: "var(--amber)", letterSpacing: "1px" }}>WHEN: </span>
            {concept.whenToUse}
          </div>
          {/* The campaign is the tutorial FOR the arena. An idea she can't use in a fight has no
              business being a level, so every idea says here exactly what it buys her in one. */}
          <div style={{
            fontSize: "var(--text-xs)", color: "var(--text-body)", lineHeight: "var(--leading-body)",
            borderTop: "1px dashed var(--line)", paddingTop: 8,
          }}>
            <span style={{ fontWeight: 700, color: "var(--green)", letterSpacing: "1px" }}>IN A FIGHT: </span>
            {concept.inBattle}
          </div>
          {onWatch && concept.demoCode ? (
            <button
              onClick={onWatch}
              style={{
                all: "unset", cursor: "pointer", alignSelf: "flex-start",
                fontSize: "var(--text-2xs)", fontWeight: 700, letterSpacing: "1px",
                color: "var(--cyan)", border: "1.5px solid var(--cyan)", borderRadius: "var(--radius-pill, 999px)",
                padding: "4px 12px", marginTop: 2,
              }}
            >
              ▶ WATCH IT
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
