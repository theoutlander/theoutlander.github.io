import type { BattleEvent } from "../sim/battle";

export interface KeyMoment {
  round: number;
  kind: "wastedShot" | "firstHit" | "wreck";
}

export interface DebriefStats {
  roundsSurvived: number;
  hitsLanded: number;
  hitsAttempted: number;
  wastedShots: number;
  damageDealt: number;
  keyMoments: KeyMoment[];
}

/**
 * Reduces one fight's event log into what the Debrief shows — the stats row and the scrubber's
 * markers. Everything here is derived, not tracked separately: the sim already logs every shot and
 * hit, so there's nothing new to instrument.
 *
 * `playerIndex`/`opponentIndex` are bot indices as `runBattle`'s `entrants` array assigned them —
 * every call site in this app puts the player first (index 0).
 */
export function computeDebriefStats(
  events: readonly BattleEvent[],
  rounds: number,
  playerIndex: number,
  opponentIndex: number,
  opponentMaxArmor: number,
): DebriefStats {
  let hitsLanded = 0;
  let hitsAttempted = 0;
  let wastedShots = 0;
  let damageDealt = 0;
  let opponentArmor = opponentMaxArmor;
  let firstHitSeen = false;
  let wreckSeen = false;
  const keyMoments: KeyMoment[] = [];

  for (const ev of events) {
    if (ev.type === "shoot" && ev.bot === playerIndex) {
      hitsAttempted++;
      if (ev.hit === null) {
        wastedShots++;
        keyMoments.push({ round: ev.round, kind: "wastedShot" });
      }
    } else if (ev.type === "hit" && ev.bot === playerIndex && ev.target === opponentIndex) {
      hitsLanded++;
      damageDealt += Math.max(0, opponentArmor - ev.armor);
      opponentArmor = ev.armor;
    } else if (ev.type === "hit" && ev.target === playerIndex && !firstHitSeen) {
      firstHitSeen = true;
      keyMoments.push({ round: ev.round, kind: "firstHit" });
    } else if (ev.type === "wreck" && !wreckSeen) {
      wreckSeen = true;
      keyMoments.push({ round: ev.round, kind: "wreck" });
    }
  }

  return { roundsSurvived: rounds, hitsLanded, hitsAttempted, wastedShots, damageDealt, keyMoments };
}
