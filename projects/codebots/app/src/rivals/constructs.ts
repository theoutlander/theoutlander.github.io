import type { SaveData } from "../state/save";
import { ALL } from "../content/missions";

/**
 * WHAT DID THE OPPONENT'S CODE ACTUALLY USE — and does this kid know it yet?
 *
 * Feeds the Debrief's construct chips: green if she's cleared the mission that teaches it, dashed red
 * if she hasn't. The mapping below is verified against every currently-playable mission's own
 * `teaches` field, not just `commandDocs.ts`'s `since` numbers. "else if" as its own tracked construct
 * is out of scope here — the handoff bundles if/else as one idea, not three — even though w3m5 now
 * legitimately teaches it ("else if (a chain of choices)"); a future milestone could add it.
 */
export type Construct = "if" | "else" | "while" | "for" | "function";
export type Sensor = "enemyAhead" | "enemyNear" | "closerAhead" | "enemyLeft" | "enemyRight" | "hurt";

const CONSTRUCT_PATTERNS: Record<Construct, RegExp> = {
  if: /\bif\s*\(/,
  else: /\belse\b/,
  while: /\bwhile\s*\(/,
  for: /\bfor\s*\(/,
  function: /\bfunction\b/,
};

/** teaching order — also the priority order for firstUnknownConstruct */
const CONSTRUCT_ORDER: Construct[] = ["if", "else", "while", "for", "function"];

export const CONSTRUCT_MISSIONS: Record<Construct, string> = {
  if: "w2m1",
  else: "w2m3",
  while: "w3m1",
  for: "w3m2",
  function: "w4m1",
};

const SENSOR_ORDER: Sensor[] = ["enemyAhead", "enemyNear", "closerAhead", "enemyLeft", "enemyRight", "hurt"];

export interface ParsedConstructs {
  constructs: Construct[];
  sensors: Sensor[];
}

/** Source is trusted kid code (same assumption the linter and commandDocs already make) — a plain
 *  keyword/call regex is enough; no need to guard against `while` inside a string or comment. */
export function detectConstructs(source: string): ParsedConstructs {
  const constructs = CONSTRUCT_ORDER.filter((c) => CONSTRUCT_PATTERNS[c].test(source));
  const sensors = SENSOR_ORDER.filter((s) => new RegExp(`\\b${s}\\s*\\(`).test(source));
  return { constructs, sensors };
}

export function isConstructKnown(save: SaveData, construct: Construct): boolean {
  return !!save.missions[CONSTRUCT_MISSIONS[construct]]?.cleared;
}

/** The earliest-taught construct the opponent used that this kid hasn't cleared yet — the single
 *  gap most worth sending her to fix. Null if she already knows everything they used. */
export function firstUnknownConstruct(save: SaveData, used: Construct[]): Construct | null {
  return CONSTRUCT_ORDER.find((c) => used.includes(c) && !isConstructKnown(save, c)) ?? null;
}

export function constructWorld(construct: Construct): number {
  const missionId = CONSTRUCT_MISSIONS[construct];
  const mission = ALL.find((m) => m.id === missionId);
  if (!mission) throw new Error(`constructWorld: no mission "${missionId}" for construct "${construct}"`);
  return mission.world;
}
