import React, { type CSSProperties, type ReactNode } from "react";

const COLORS: Record<string, string> = {
  amber: "var(--amber)",
  cyan: "var(--cyan)",
  green: "var(--green)",
  red: "var(--red)",
  pink: "var(--pink)",
  dim: "var(--text-dim)",
};

/** CodeBots Chip — pill status/label. Dashed = locked/future. */
export function Chip({
  color = "dim",
  dashed = false,
  children,
  style,
}: {
  color?: keyof typeof COLORS | string;
  dashed?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const c = COLORS[color] || COLORS.dim;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-2xs)",
        fontWeight: 700,
        letterSpacing: "var(--label-tracking-tight)",
        color: c,
        border: `1.5px ${dashed ? "dashed" : "solid"} ${c}`,
        borderRadius: "var(--radius-pill)",
        padding: "3px 9px",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
