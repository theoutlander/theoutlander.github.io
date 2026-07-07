import React, { useState } from "react";
import { type CommandDoc, isNewOn } from "../content/commandDocs";

/**
 * The COMMANDS reference as a navigable accordion: a compact, alphabetical list of signatures the
 * kid can scan, each expandable to its description. The command just introduced on this level opens
 * by default (and is badged NEW); the rest stay collapsed so the list is short and findable.
 */
export function CommandList({
  commands,
  world,
  index,
}: {
  commands: CommandDoc[];
  world: number;
  index: number;
}) {
  const newSig = commands.find((c) => isNewOn(c, world, index))?.sig ?? null;
  const [openSig, setOpenSig] = useState<string | null>(newSig);

  return (
    <div>
      {commands.map((cmd) => {
        const open = openSig === cmd.sig;
        const isNew = isNewOn(cmd, world, index);
        return (
          <div key={cmd.sig} style={{ borderTop: "1px dashed var(--line)" }}>
            <button
              onClick={() => setOpenSig(open ? null : cmd.sig)}
              style={{
                all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                width: "100%", boxSizing: "border-box", padding: "6px 0",
              }}
            >
              <span style={{ color: "var(--text-dim)", fontSize: "var(--text-2xs)", width: 8 }}>
                {open ? "▾" : "▸"}
              </span>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--amber)" }}>{cmd.sig}</span>
              {isNew ? (
                <span
                  style={{
                    fontSize: "var(--text-2xs)", fontWeight: 700, color: "var(--green)",
                    border: "1.5px solid var(--green)", borderRadius: "var(--radius-pill)",
                    padding: "1px 6px", letterSpacing: "1px",
                  }}
                >
                  NEW
                </span>
              ) : null}
            </button>
            {open ? (
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", padding: "0 0 8px 14px", lineHeight: "var(--leading-body)" }}>
                {cmd.desc}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
