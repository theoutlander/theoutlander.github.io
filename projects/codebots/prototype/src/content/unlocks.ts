import { ALL_COMMANDS } from "./commandDocs";
import { WORLDS } from "./missions";

/**
 * When each command arrives, as a kid-facing LEVEL number.
 *
 * This exists to stop the game lying to her. If she types `shoot()` on Level 2 — which is a
 * completely reasonable thing to try, and a sign she's thinking ahead — the lint used to tell her
 * "I don't know 'shoot'". That's false. It's a real command; she simply hasn't unlocked it. Being
 * told your correct instinct doesn't exist is exactly how a kid decides she's bad at this.
 *
 * So: a command she hasn't earned yet gets an honest answer — "that's real, and it's coming."
 */

/** the command name a doc entry introduces, e.g. "left(n) / right(n)" → ["left", "right"] */
function namesIn(sig: string): string[] {
  return [...sig.matchAll(/([a-zA-Z][a-zA-Z0-9]*)\s*\(/g)].map((m) => m[1]);
}

/** Global level number = every mission in the earlier worlds, plus this world's own level index. */
function globalLevelOf(world: number, since: number): number {
  let before = 0;
  for (let w = 0; w < world - 1; w++) before += WORLDS[w]?.length ?? 0;
  return before + since;
}

/** command name → the level it unlocks on. Built from the same table that drives the reference. */
export const UNLOCK_LEVEL: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  for (const c of ALL_COMMANDS) {
    // control keywords (`if`, `while`, `function`…) aren't callable commands, so a kid can't
    // "misspell" one into an unknown-command error. Only real calls belong here.
    if (c.kind === "control") continue;
    for (const name of namesIn(c.sig)) out[name] = globalLevelOf(c.world, c.since);
  }
  return out;
})();

/** Is this a real command she just hasn't earned yet? Returns the level it arrives on. */
export function lockedAt(name: string): number | null {
  const exact = UNLOCK_LEVEL[name];
  if (exact) return exact;
  // she may also have the capitals wrong on a locked command — still tell her it's real
  const hit = Object.keys(UNLOCK_LEVEL).find((c) => c.toLowerCase() === name.toLowerCase());
  return hit ? UNLOCK_LEVEL[hit] : null;
}

/** The properly-cased name of a locked command, so we can show her how it's really spelled. */
export function lockedName(name: string): string | null {
  return Object.keys(UNLOCK_LEVEL).find((c) => c.toLowerCase() === name.toLowerCase()) ?? null;
}
