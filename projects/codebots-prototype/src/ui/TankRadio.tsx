import React, { useEffect, useRef } from "react";
import { Panel } from "./components/Panel";

export type RadioTone = "dim" | "info" | "success" | "error";

export interface RadioLine {
  text: string;
  tone: RadioTone;
}

const TONE_COLOR: Record<RadioTone, string> = {
  dim: "var(--text-dim)",
  info: "var(--cyan)",
  success: "var(--green)",
  error: "var(--red)",
};

/** The bot's running commentary during a run — how the kid debugs by feel. */
export function TankRadio({ lines }: { lines: RadioLine[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <Panel label="TANK RADIO">
      <div
        ref={scrollRef}
        style={{
          fontSize: "var(--text-xs)",
          lineHeight: 1.75,
          maxHeight: 150,
          overflowY: "auto",
          fontFamily: "var(--font-mono)",
        }}
      >
        {lines.length === 0 ? (
          <div style={{ color: "var(--text-dim)" }}>&gt; tank online. awaiting program.</div>
        ) : (
          lines.map((l, i) => (
            <div key={i} style={{ color: TONE_COLOR[l.tone] }}>
              &gt; {l.text}
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
