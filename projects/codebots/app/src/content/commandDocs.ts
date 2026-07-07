export interface CommandDoc {
  sig: string;
  desc: string;
  /** the mission index (1–6) that first introduces this command */
  since: number;
}

/**
 * World 1 command reference. The Mission screen shows every command with `since <= mission.index`
 * (so the list grows as the campaign teaches new ones) and badges the one introduced this mission.
 */
export const WORLD1_COMMANDS: CommandDoc[] = [
  { sig: "forward(n)", desc: "roll forward n squares", since: 1 },
  { sig: "left(n) / right(n)", desc: "turn 90° — n times if you pass a number", since: 1 },
  { sig: "honk()", desc: "AIR HORN — opens gates", since: 1 },
  { sig: "back(n)", desc: "reverse n squares, no turn", since: 3 },
  { sig: "repeat n { }", desc: "do the moves inside n times", since: 5 },
];

export function commandsFor(missionIndex: number): CommandDoc[] {
  return WORLD1_COMMANDS.filter((c) => c.since <= missionIndex);
}
