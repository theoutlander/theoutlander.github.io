export interface CommandDoc {
  sig: string;
  desc: string;
  /** the world this is first introduced in */
  world: number;
  /** the level index (1–6) within that world that introduces it */
  since: number;
  /** how it reads in the reference: an action, a yes/no sensor, or a control-flow keyword */
  kind?: "command" | "sensor" | "control";
}

/**
 * The full command reference across all worlds. The Mission screen shows every entry the campaign
 * has taught by the current (world, level) — i.e. everything from earlier worlds plus this world up
 * to this level — and badges the ones introduced on this exact level as NEW.
 */
export const ALL_COMMANDS: CommandDoc[] = [
  // World 1 — movement & loops
  { sig: "forward(n)", desc: "roll forward n squares", world: 1, since: 1 },
  { sig: "left(n) / right(n)", desc: "turn 90° — n times if you pass a number", world: 1, since: 1 },
  { sig: "honk(n)", desc: "AIR HORN — n honks; opens gates", world: 1, since: 1 },
  { sig: "back(n)", desc: "reverse n squares, no turn", world: 1, since: 1 },
  { sig: "repeat n { }", desc: "do the moves inside n times", world: 1, since: 3, kind: "control" },

  // World 2 — sensors, decisions & the blaster
  { sig: "blocked()", desc: "is something right in front of you? (yes/no)", world: 2, since: 1, kind: "sensor" },
  { sig: "if ( ) { }", desc: "only do the moves inside when it's true", world: 2, since: 1, kind: "control" },
  { sig: "shoot()", desc: "fire the blaster — smashes a barrel ahead", world: 2, since: 2 },
  { sig: "targetAhead()", desc: "is a barrel one square ahead? (yes/no)", world: 2, since: 3, kind: "sensor" },
  { sig: "else { }", desc: "what to do when the if was NOT true", world: 2, since: 3, kind: "control" },
  { sig: "atBeacon()", desc: "are you standing on the goal? (yes/no)", world: 2, since: 4, kind: "sensor" },

  // World 3 — while loops
  { sig: "while ( ) { }", desc: "keep repeating the moves WHILE it's true", world: 3, since: 1, kind: "control" },
  { sig: "!  (not)", desc: "flips a yes/no — while (!atBeacon()) means 'until you arrive'", world: 3, since: 1, kind: "control" },
  { sig: "else if ( ) { }", desc: "ask another question when the first was no — first true one wins", world: 3, since: 5, kind: "control" },

  // World 4 — your own commands
  { sig: "function name() { }", desc: "make your OWN command out of other commands", world: 4, since: 1, kind: "control" },
];

/** Every command taught by (world, level): all earlier worlds, plus this world up to this level.
 *  Sorted alphabetically so the panel reads like a reference you can scan; the NEW badge (not
 *  position) is what flags the command just introduced. */
export function commandsFor(world: number, index: number): CommandDoc[] {
  return ALL_COMMANDS.filter((c) => c.world < world || (c.world === world && c.since <= index)).sort(
    (a, b) => a.sig.localeCompare(b.sig),
  );
}

/** True when this command debuts on exactly this level (so the UI badges it NEW). */
export function isNewOn(c: CommandDoc, world: number, index: number): boolean {
  return c.world === world && c.since === index;
}
