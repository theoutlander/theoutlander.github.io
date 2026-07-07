import React, { type CSSProperties } from "react";

const COLORS: Record<string, string> = {
  green: "var(--green)",
  amber: "var(--amber)",
  cyan: "var(--cyan)",
  red: "var(--red)",
};

/** CodeBots Meter — HUD bar for SCORE/ARMOR/SPEED/CHARGE. */
export function Meter({
  label,
  value = 100,
  color,
  showValue = true,
  suffix = "%",
  style,
}: {
  label?: string;
  value?: number;
  color?: keyof typeof COLORS;
  showValue?: boolean;
  suffix?: string;
  style?: CSSProperties;
}) {
  const v = Math.max(0, Math.min(100, value));
  const auto = v > 60 ? "green" : v > 30 ? "amber" : "red";
  const c = COLORS[color || auto] || COLORS.green;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-mono)", ...style }}>
      {label ? (
        <span
          style={{
            fontSize: "var(--text-2xs)",
            letterSpacing: "var(--label-tracking)",
            color: "var(--text-dim)",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      ) : null}
      <div style={{ flex: 1, height: "8px", borderRadius: "4px", background: "var(--surface-inset)", overflow: "hidden" }}>
        <div style={{ width: v + "%", height: "100%", background: c, transition: "width .3s var(--ease-snap)" }} />
      </div>
      {showValue ? (
        <span style={{ fontSize: "var(--text-2xs)", color: c, fontWeight: 700, minWidth: "38px", textAlign: "right" }}>
          {Math.round(v)}
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
