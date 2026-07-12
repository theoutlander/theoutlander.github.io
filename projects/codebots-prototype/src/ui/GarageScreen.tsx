import React, { useState } from "react";
import { Panel } from "./components/Panel";
import { Chip } from "./components/Chip";
import { Coin } from "./components/Coin";
import { BotAvatar } from "./components/BotAvatar";
import { KITS, buyKit, equipKit, kitById } from "../content/parts";
import { type SaveData } from "../state/save";
import { loadBotConfig, saveBotConfig, resolveHex } from "../state/botConfig";
import { analytics } from "../state/analytics";

/**
 * THE GARAGE — "make this bot mine", all in one room.
 *
 * It used to be two rooms and an RPG. BOT MAKER let you name and paint it; the GARAGE was a separate
 * shop with three chassis, a weight budget, slot counts, part weights, an overload rule, and two kinds
 * of part. They are the same idea — this bot is MINE — split across two doors for no reason, and one
 * of them required a child to juggle four numbers before she could equip anything.
 *
 * One room now, and one decision: name it, paint it, choose how it fights. Nothing to overwhelm her,
 * and the choice still matters, because the arena punishes the wrong one.
 */
export function GarageScreen({ save, onSave }: { save: SaveData; onSave: (s: SaveData) => void }) {
  const [bot, setBot] = useState(loadBotConfig());
  const [msg, setMsg] = useState<string | null>(null);
  const current = kitById(save.loadout.kit);

  function rename(name: string) {
    const next = { ...bot, botName: name.slice(0, 14).toUpperCase() };
    setBot(next);
    saveBotConfig(next);
  }
  function repaint(part: "body" | "dome", value: string) {
    const next = { ...bot, paint: { ...bot.paint, [part]: value } };
    setBot(next);
    saveBotConfig(next);
  }

  function choose(id: string) {
    if (save.loadout.owned.includes(id)) {
      onSave({ ...save, loadout: equipKit(save.loadout, id) });
      setMsg(null);
      return;
    }
    const bought = buyKit(save.loadout, save.coins, id);
    if (!bought) {
      setMsg(`You need ${kitById(id).cost - save.coins} more coins for that one. Clear a level to earn some.`);
      return;
    }
    onSave({ ...save, coins: bought.coins, loadout: bought.loadout });
    analytics.partBought?.(id);
    setMsg(null);
  }

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "26px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <BotAvatar body={resolveHex(bot.paint.body, bot.paintbox)} dome={resolveHex(bot.paint.dome, bot.paintbox)} width={140} />
          <div>
            <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "1.5px", color: "var(--text-dim)", fontWeight: 700 }}>
              YOUR BOT
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", color: "var(--cyan)" }}>
              {bot.botName}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
              <Chip color="cyan">{current.name}</Chip>
              <Coin count={save.coins} />
            </div>
          </div>
        </div>

        <Panel label="NAME IT">
          <input
            value={bot.botName}
            onChange={(e) => rename(e.target.value)}
            style={{
              fontFamily: "var(--font-mono)", fontSize: "var(--text-md)", fontWeight: 700,
              color: "var(--ink)", background: "var(--surface-inset)", border: "var(--border)",
              borderRadius: "var(--radius-md)", padding: "10px 12px", width: "100%",
              boxSizing: "border-box", letterSpacing: "1px",
            }}
          />
        </Panel>

        <Panel label="PAINT IT">
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            {(["body", "dome"] as const).map((part) => (
              <div key={part}>
                <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", marginBottom: 6, letterSpacing: "1px" }}>
                  {part === "body" ? "BODY" : "DOME"}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["#FF8BB3", "#5FD4FF", "#FFB454", "#6FE3A5", "#C89BFF", "#FF6B7A", "#EAF2FF"].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => repaint(part, hex)}
                      aria-label={hex}
                      style={{
                        all: "unset", cursor: "pointer", width: 30, height: 30, borderRadius: 8,
                        background: hex,
                        outline: resolveHex(bot.paint[part], bot.paintbox) === hex ? "3px solid var(--ink)" : "1px solid var(--line)",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/*
          THE ONLY DECISION IN THE GARAGE.

          Three answers, each with its cost said out loud. No weights, no slots, no overload maths —
          and it is still a genuine strategic choice, because the arena punishes the wrong pick.
        */}
        <Panel label="HOW IT FIGHTS">
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", marginBottom: 10, lineHeight: 1.5 }}>
            Pick one. Swapping between the ones you own is free, always — changing your mind should
            never cost you anything.
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {KITS.map((k) => {
              const owned = save.loadout.owned.includes(k.id);
              const on = save.loadout.kit === k.id;
              return (
                <button
                  key={k.id}
                  onClick={() => choose(k.id)}
                  style={{
                    all: "unset", cursor: "pointer", flex: "1 1 220px", boxSizing: "border-box",
                    padding: 14, borderRadius: 12,
                    border: `2px solid ${on ? "var(--cyan)" : "var(--line)"}`,
                    background: on ? "rgba(95,212,255,.07)" : "transparent",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)" }}>
                      {k.name}
                    </span>
                    {on ? <Chip color="cyan">DRIVING</Chip> : owned ? <Chip color="dim">OWNED</Chip> : <Coin count={k.cost} />}
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-body)", marginTop: 6, lineHeight: 1.5 }}>
                    {k.desc}
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--amber)", marginTop: 6, lineHeight: 1.5 }}>
                    {k.tradeoff}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--text-dim)", marginTop: 8 }}>
                    ARMOUR {k.armor} · RANGE {k.range}
                  </div>
                </button>
              );
            })}
          </div>
          {msg ? <div style={{ fontSize: "var(--text-xs)", color: "var(--red)", marginTop: 10 }}>{msg}</div> : null}
        </Panel>

        {/* The rule the whole game stands on, said out loud in the room most likely to make her doubt it. */}
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", lineHeight: 1.6 }}>
          None of this wins a fight on its own. A well-written SCOUT beats a badly-written anything.
          Gear picks your <b>style</b>. Your code decides who wins.
        </div>
      </div>
    </div>
  );
}
