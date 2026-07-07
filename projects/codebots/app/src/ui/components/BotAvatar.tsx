import React, { type CSSProperties } from "react";

/**
 * CodeBots BotAvatar — the mascot, drawn in divs, painted from bot.json. Ported from the design
 * system for DOM previews (HQ + Bot Maker). The arena reproduces the same construction in Phaser.
 */
export function BotAvatar({
  body = "var(--amber)",
  dome = "var(--amber)",
  eyes = true,
  antenna = true,
  width = 150,
  facing = 0,
  style,
}: {
  body?: string;
  dome?: string;
  eyes?: boolean;
  antenna?: boolean;
  width?: number;
  facing?: number;
  style?: CSSProperties;
}) {
  const s = width / 150;
  const h = Math.round(106 * s);
  const abs = (x: CSSProperties): CSSProperties => ({ position: "absolute", ...x });
  return (
    <div style={{ width: width + "px", height: h + "px", position: "relative", ...style }}>
      <div style={abs({ left: 0, top: 0, width: 150, height: 106, transform: `scale(${s}) rotate(${facing}deg)`, transformOrigin: "0 0" })}>
        <div style={abs({ left: 18, right: 18, top: 0, height: 17, background: "var(--text-dim)", borderRadius: 9 })} />
        <div style={abs({ left: 18, right: 18, bottom: 0, height: 17, background: "var(--text-dim)", borderRadius: 9 })} />
        <div style={abs({ left: 13, right: 23, top: 15, bottom: 15, background: body, border: "3px solid rgba(0,0,0,.3)", borderRadius: 11, boxSizing: "border-box" })} />
        <div style={abs({ right: -26, top: "50%", width: 44, height: 12, marginTop: -6, background: body, border: "3px solid rgba(0,0,0,.3)", borderRadius: 6, boxSizing: "border-box" })} />
        <div style={abs({ left: "50%", top: "50%", width: 42, height: 42, margin: "-21px 0 0 -21px", borderRadius: "50%", background: dome, border: "3px solid rgba(0,0,0,.35)", boxSizing: "border-box" })} />
        {eyes ? (
          <>
            <div style={abs({ left: "50%", top: "50%", width: 9, height: 9, margin: "-11px 0 0 0", borderRadius: "50%", background: "var(--paint-cloud)", border: "2px solid rgba(0,0,0,.4)", boxSizing: "border-box" })} />
            <div style={abs({ left: "50%", top: "50%", width: 9, height: 9, margin: "2px 0 0 0", borderRadius: "50%", background: "var(--paint-cloud)", border: "2px solid rgba(0,0,0,.4)", boxSizing: "border-box" })} />
          </>
        ) : null}
        {antenna ? (
          <>
            <div style={abs({ left: "50%", top: -20, width: 3, height: 22, marginLeft: -20, background: "var(--text-dim)", transform: "rotate(-14deg)" })} />
            <div style={abs({ left: "50%", top: -27, width: 9, height: 9, marginLeft: -26, borderRadius: "50%", background: "var(--cyan)" })} />
          </>
        ) : null}
      </div>
    </div>
  );
}
