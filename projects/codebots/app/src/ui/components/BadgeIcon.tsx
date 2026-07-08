import React from "react";
import type { BadgeIcon as IconKind } from "../../content/badges";

/**
 * Geometric badge icons (no emoji, matching CodeBots' visual language). Each is a simple SVG glyph
 * on a hexagon medallion. Earned badges are full-color; locked ones render dim.
 */
export function BadgeIcon({ icon, earned, size = 56 }: { icon: IconKind; earned: boolean; size?: number }) {
  const accent = earned ? colorFor(icon) : "var(--line-strong, #2b3f6b)";
  const ink = earned ? "#0D1A33" : "rgba(120,170,255,.25)";
  const glyphColor = earned ? "#0D1A33" : "rgba(120,170,255,.3)";

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ flex: "none" }} aria-hidden>
      {/* hexagon medallion */}
      <polygon points="24,3 42,13 42,35 24,45 6,35 6,13" fill={accent} stroke={ink} strokeWidth="1.5" opacity={earned ? 1 : 0.35} />
      <polygon points="24,8 37,16 37,32 24,40 11,32 11,16" fill="none" stroke={glyphColor} strokeWidth="1" opacity="0.5" />
      <g stroke={glyphColor} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(24,24)">
        {glyph(icon)}
      </g>
    </svg>
  );
}

function colorFor(icon: IconKind): string {
  switch (icon) {
    case "target": return "#FF6B7A";
    case "loop": case "infinity": return "#5FD4FF";
    case "gear": return "#6FE3A5";
    case "crown": case "star": return "#FFB454";
    case "cap": return "#EAF2FF";
    case "world": return "#8FA7CD";
    default: return "#FFB454";
  }
}

// glyphs are drawn centered at (0,0) in a ~±10 box
function glyph(icon: IconKind): React.ReactNode {
  switch (icon) {
    case "flag":
      return <><line x1="-6" y1="-9" x2="-6" y2="9" /><path d="M-6 -8 L7 -5 L-6 -1 Z" fill="#0D1A33" /></>;
    case "loop":
      return <><path d="M-8 -2 a8 8 0 1 1 3 6" /><path d="M-5 8 l0 -4 l4 0" /></>;
    case "branch":
      return <><path d="M0 8 L0 0" /><path d="M0 0 L-7 -8" /><path d="M0 0 L7 -8" /></>;
    case "target":
      return <><circle cx="0" cy="0" r="9" /><circle cx="0" cy="0" r="4" /><circle cx="0" cy="0" r="0.5" fill="#0D1A33" /></>;
    case "fork":
      return <><path d="M0 9 L0 1" /><path d="M0 1 C0 -4 -8 -3 -8 -9" /><path d="M0 1 C0 -4 8 -3 8 -9" /></>;
    case "infinity":
      return <path d="M-4 0 a4 4 0 1 1 4 4 a4 4 0 1 0 4 -4 a4 4 0 1 1 -4 4 a4 4 0 1 0 -4 -4 Z" />;
    case "gear":
      return <><circle cx="0" cy="0" r="5" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180; return <line key={a} x1={Math.cos(r) * 6} y1={Math.sin(r) * 6} x2={Math.cos(r) * 9} y2={Math.sin(r) * 9} />;
      })}</>;
    case "world":
      return <><circle cx="0" cy="0" r="9" /><ellipse cx="0" cy="0" rx="4" ry="9" /><line x1="-9" y1="0" x2="9" y2="0" /></>;
    case "crown":
      return <path d="M-9 6 L-9 -4 L-4 1 L0 -6 L4 1 L9 -4 L9 6 Z" fill="#0D1A33" />;
    case "star":
      return <path d="M0 -9 L2.6 -2.8 L9 -2.8 L3.9 1.4 L5.9 8 L0 4 L-5.9 8 L-3.9 1.4 L-9 -2.8 L-2.6 -2.8 Z" fill="#0D1A33" />;
    case "cap":
      return <><path d="M-10 -3 L0 -8 L10 -3 L0 2 Z" fill="#0D1A33" /><path d="M6 -1 L6 6" /><path d="M-5 0 L-5 6 a5 3 0 0 0 10 0 L10 0" /></>;
    default:
      return <circle cx="0" cy="0" r="6" />;
  }
}
