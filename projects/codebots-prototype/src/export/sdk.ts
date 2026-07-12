/**
 * The typed surface the exported bot imports from. This ships next to `<botname>.js` as
 * `codebots-sdk.d.ts` so an editor (VS Code, anything with a TS language service) gives her
 * autocomplete, hovers and squiggles on the code she already wrote.
 *
 * The types are for the TOOLING, not for her: nothing in the game ever asks a kid to write an
 * annotation, and the exported file has none. Signatures mirror src/sandbox/api.ts (which names
 * exist) and the engine's real behaviour in src/sim/commands.ts (what the args do).
 */
export const SDK_FILENAME = "codebots-sdk.d.ts";

export const SDK_DECLARATION = `/**
 * codebots-sdk — the commands your robot knows.
 * Every one of these is a command you used in CodeBots. They work the same way here.
 */
declare module "codebots-sdk" {
  /** Roll forward n squares (default 1). Stops early if something's in the way. */
  export function forward(steps?: number): void;

  /** Reverse n squares (default 1) without turning around. */
  export function back(steps?: number): void;

  /** Turn 90° left — n times if you pass a number (default 1). */
  export function left(turns?: number): void;

  /** Turn 90° right — n times if you pass a number (default 1). */
  export function right(turns?: number): void;

  /** AIR HORN. Honks n times (default 1). Opens a gate when you're on its pad. */
  export function honk(times?: number): void;

  /** Fire the blaster — smashes a barrel directly ahead. */
  export function shoot(): void;

  /** Is something directly in front of the bot? */
  export function blocked(): boolean;

  /** Is a barrel exactly one square ahead? */
  export function targetAhead(): boolean;

  /** Is the bot standing on the goal beacon? */
  export function atBeacon(): boolean;
}
`;

/** The .d.ts text, ready to download alongside the bot. */
export function sdkDeclaration(): string {
  return SDK_DECLARATION;
}
