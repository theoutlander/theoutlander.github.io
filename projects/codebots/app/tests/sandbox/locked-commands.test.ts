import { describe, it, expect } from "vitest";
import { unknownCommandHint } from "../../src/sandbox/errors";
import { lockedAt, lockedName, UNLOCK_LEVEL } from "../../src/content/unlocks";
import { apiForWorld } from "../../src/sandbox/api";

/**
 * DON'T LIE TO THE KID.
 *
 * A nine-year-old on Level 2 who types `shoot()` is not making a mistake — she's thinking ahead, and
 * that's the single best instinct a beginner can have. The game used to answer her with
 * "I don't know 'shoot'". That is flatly false: shoot() is real, it's in the game, she just hasn't
 * unlocked it. Being told your good idea doesn't exist is how a kid concludes she's bad at this and
 * stops.
 *
 * So a real-but-locked command now gets an honest answer, and these tests hold the game to it.
 */
const locked = (name: string, api: string[]) => {
  const has = new Set(api.map((a) => a.toLowerCase()));
  if (has.has(name.toLowerCase())) return null;
  const level = lockedAt(name);
  const real = lockedName(name);
  return level && real ? { name: real, level } : null;
};
const hint = (name: string, world: number) => {
  const api = apiForWorld(world);
  return unknownCommandHint(name, api, locked(name, api));
};

describe("a real command she hasn't unlocked yet", () => {
  it("never claims not to know shoot() — it says it's real and when it arrives", () => {
    const msg = hint("shoot", 1);
    expect(msg).not.toMatch(/I don't know/i);
    expect(msg).toMatch(/real/i);
    expect(msg).toMatch(/Level \d+/);
  });

  it("tells her the right level — shoot() arrives on Level 7", () => {
    // 5 missions in World 1, and shoot is the 2nd thing taught in World 2
    expect(UNLOCK_LEVEL.shoot).toBe(7);
    expect(hint("shoot", 1)).toContain("Level 7");
  });

  it("handles a locked command with the capitals wrong — teaches BOTH facts at once", () => {
    const msg = hint("Shoot", 1);
    expect(msg).toMatch(/capital/i); // the capitals rule
    expect(msg).toMatch(/Level 7/); // and that it's real, just not yet
    expect(msg).not.toMatch(/I don't know/i);
  });

  it("every sensor she might reach for early is answered honestly, not denied", () => {
    for (const name of ["shoot", "targetAhead", "atBeacon", "blocked"]) {
      const msg = hint(name, 1);
      expect(msg, `${name} was denied instead of explained`).not.toMatch(/I don't know/i);
      expect(msg, `${name} never says when it arrives`).toMatch(/Level \d+/);
    }
  });

  it("a command she ALREADY has is never treated as locked", () => {
    expect(locked("forward", apiForWorld(1))).toBeNull();
    expect(locked("shoot", apiForWorld(2))).toBeNull(); // by W2 she has it
  });

  it("a genuine typo is still a typo — this doesn't swallow real mistakes", () => {
    const msg = hint("forwrd", 1);
    expect(msg).toMatch(/forward/); // still suggests the fix
    expect(msg).not.toMatch(/Level \d+/); // and doesn't pretend it's a locked command
  });
});
