import React, { type CSSProperties } from "react";
import { Panel } from "./components/Panel";
import { Chip } from "./components/Chip";
import { Stars } from "./components/Stars";
import { Coin } from "./components/Coin";
import { BotAvatar } from "./components/BotAvatar";
import { cloudEnabled, type Account } from "../state/account";
import type { SaveData } from "../state/save";
import type { Mission } from "../sim/missionSchema";

function Door({
  title,
  desc,
  chip,
  chipColor = "amber",
  locked = false,
  onClick,
}: {
  title: string;
  desc: string;
  chip: string;
  chipColor?: "amber" | "cyan" | "green" | "dim";
  locked?: boolean;
  onClick?: () => void;
}) {
  const wrap: CSSProperties = { all: "unset", cursor: locked ? "not-allowed" : "pointer", flex: "1 1 200px", boxSizing: "border-box" };
  return (
    <button style={wrap} disabled={locked} onClick={onClick}>
      <Panel locked={locked} active={!locked} style={{ gap: 8, minHeight: 130 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-xl)" }}>{title}</div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-dim)", lineHeight: 1.55, flex: 1 }}>{desc}</div>
        <Chip color={locked ? "dim" : chipColor} dashed={locked}>
          {chip}
        </Chip>
      </Panel>
    </button>
  );
}

/** HQ — the hub. The bot rolls in; the doors lead out. */
export function HQ({
  bot,
  account,
  save,
  missions,
  onPlay,
  onProfile,
  onBattle,
  onGarage,
  onDrill,
  onFirstSteps,
  onUnlockAll,
}: {
  bot: { playerName: string; botName: string; bodyHex: string; domeHex: string };
  account: Account | null;
  save: SaveData;
  missions: Mission[];
  onPlay: () => void;
  onProfile: () => void;
  onBattle: () => void;
  onGarage: () => void;
  onDrill: () => void;
  onFirstSteps: () => void;
  onUnlockAll: () => void;
}) {
  const totalStars = missions.reduce((n, m) => n + (save.missions[m.id]?.stars ?? 0), 0);
  const cleared = missions.filter((m) => save.missions[m.id]?.cleared).length;
  const nextLevel = Math.min(cleared + 1, missions.length);
  const badgeCount = (save.badges ?? []).length;
  // A device with cloud accounts on shouldn't greet-by-name until she's actually logged in — the
  // local pilot name may be stale from a previous kid's guest session on this same browser.
  const personalized = !cloudEnabled || !!account;
  // A kid who has never coded should not be choosing between six doors. Until she's done FIRST
  // STEPS, that IS the game — everything else can wait.
  const beginner = !save.firstStepsDone && cleared === 0;

  // Which rooms are open. `skipAhead` is the "I already know how to code" hatch — it opens the lot.
  const all = !!save.skipAhead;
  const showFirstSteps = true;                       // always available, to start or to re-read
  const showCampaign = all || save.firstStepsDone || cleared > 0;
  // Once a room opens, it STAYS open. Gating the Garage on `coins > 0` meant it vanished the moment
  // she spent her coins in it — a room that disappears after you use it is worse than one that never
  // opened. One cleared level always pays coins, so that's the honest threshold.
  const showGarage = all || cleared >= 1 || save.coins > 0;  // name it, paint it, choose how it fights
  const showArena = all || cleared >= 8;             // needs sensors to write a bot worth fighting with
  const locked = [showCampaign, showGarage, showArena].filter((v) => !v).length;

  return (
    <div style={{ height: "100%", overflow: "auto", padding: "28px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 22 }}>
        <button
          onClick={onProfile}
          title="View your profile & badges"
          style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}
        >
          <BotAvatar body={bot.bodyHex} dome={bot.domeHex} width={150} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "var(--text-2xs)", letterSpacing: "var(--label-tracking)", color: "var(--text-dim)", fontWeight: 700 }}>
              WELCOME BACK, {(personalized ? bot.playerName : "CADET").toUpperCase()}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-3xl)", color: "var(--cyan)" }}>
              {bot.botName}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <Stars earned={totalStars} total={missions.length * 3} showCount size={14} />
              <Coin count={save.coins} />
              <Chip color="amber">{badgeCount} ★ BADGES</Chip>
            </div>
            <div style={{ fontSize: "var(--text-2xs)", color: "var(--text-dim)", marginTop: 6, letterSpacing: "1px" }}>
              VIEW PROFILE &amp; BADGES →
            </div>
          </div>
        </button>

        {/*
          THE BOARD OPENS AS SHE GROWS INTO IT.

          It used to show all seven rooms to a kid who had never written a line of code — the same
          mistake as the old Level 1, one floor up: everything at once, and no answer to the only
          question she actually has, which is "what do I do NOW?".

          Deliberately NOT a beginner/intermediate/advanced picker. That makes her label herself, and
          kids are terrible at it — she either picks "beginner" and feels small or picks "advanced"
          and drowns. Rooms simply appear when they start to mean something: the Garage when she has
          coins to spend, PROVE IT when she can sense a beacon (before that the drill is literally
          unwinnable), the Arena once she can write a bot worth fighting with. A new door opening is
          progress she can see.

          And there's an honest way out for anyone who doesn't need the ramp — see UNLOCK EVERYTHING
          at the bottom. Practice is never a gate you grind through.
        */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {showFirstSteps ? (
            <Door
              title={beginner ? "START HERE" : "FIRST STEPS"}
              desc={
                beginner
                  ? "Never written code before? Start here. One idea at a time, nothing to type, and you can't get it wrong."
                  : "The basics, from the very beginning: what code is, commands, brackets, numbers, capitals."
              }
              chip={beginner ? "FIRST STEPS →" : "REPLAY →"}
              chipColor={beginner ? "amber" : "cyan"}
              onClick={onFirstSteps}
            />
          ) : null}

          {showCampaign ? (
            <Door
              title="CAMPAIGN"
              desc={`${cleared}/${missions.length} levels cleared. The Rust Pirates await.`}
              chip={cleared === 0 ? "START →" : `CONTINUE · LEVEL ${nextLevel} →`}
              onClick={onPlay}
            />
          ) : null}

          {showGarage ? (
            <Door
              title="GARAGE"
              desc="Name it, paint it, and choose how it fights. Your code still decides who wins."
              chip="MAKE IT YOURS →"
              chipColor="amber"
              onClick={onGarage}
            />
          ) : null}

          {showArena ? (
            <Door
              title="BATTLE ARENA"
              desc="Program your bot to fight. Once it starts, you can't help it — better code wins."
              chip="FIGHT →"
              chipColor="green"
              onClick={onBattle}
            />
          ) : null}
        </div>

        {/* The escape hatch. Small on purpose: it's for the kid who already codes, or the one coming
            back on a new device — not a shortcut to dangle in front of a beginner. */}
        {locked > 0 ? (
          <button
            onClick={onUnlockAll}
            style={{
              all: "unset", cursor: "pointer", alignSelf: "flex-start",
              fontSize: "var(--text-2xs)", letterSpacing: "1px", color: "var(--text-dim)",
              borderBottom: "1px dashed var(--line)", paddingBottom: 2,
            }}
          >
            ALREADY KNOW HOW TO CODE? UNLOCK EVERYTHING ({locked} MORE {locked === 1 ? "ROOM" : "ROOMS"}) →
          </button>
        ) : null}
      </div>
    </div>
  );
}
