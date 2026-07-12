import { describe, it, expect } from "vitest";
import { validateBot } from "../../src/rivals/validate";
import { BATTLE_API } from "../../src/content/enemies";

/**
 * A BROKEN BOT MUST NEVER LEAVE THE BUILDING.
 *
 * The sim lets a broken rival forfeit rather than crash the other kid's fight, and that stays — it's
 * the last line of defence. But forfeiting is a wretched thing to happen to the kid who PUBLISHED it.
 * Her bot goes out into the world, loses every fight without moving, and nobody ever tells her why.
 * She just sits at the bottom of the board concluding that everyone else is better than her.
 *
 * That failure is invisible, permanent, and entirely avoidable: we know at publish time. So we check
 * it while she is still standing in front of the editor that can fix it, and we point at the line.
 */
const check = (src: string) => validateBot(src, BATTLE_API);

const GOOD = "while (!atBeacon()) { if (enemyAhead()) { shoot() } else { forward(1) } }";

describe("checking a bot before it's published", () => {
  it("lets a working bot through", () => {
    expect(check(GOOD)).toEqual({ ok: true });
  });

  it("refuses a bot that doesn't compile, and points at the line", () => {
    const res = check("while (!atBeacon()) { forward(1)");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toMatch(/won't start/i);
  });

  it("refuses a misspelled command with the same wording she trusts from the levels", () => {
    const res = check("while (!atBeacon()) { forwrd(1) }");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.message).toMatch(/forward/); // "did you mean forward()?"
      expect(res.line).toBe(1);
    }
  });

  it("refuses a bot that COMPILES BUT NEVER DOES ANYTHING — the silent killer", () => {
    // Perfectly legal code. It would go out, lose every fight without twitching, and she would never
    // find out why. This is the case the forfeit-in-the-sim safety net handles WRONGLY: it protects
    // her opponent and abandons her.
    for (const dud of ["while (true) { enemyNear() }", "repeat 5 { blocked() }"]) {
      const res = check(dud);
      expect(res.ok, `"${dud}" was allowed out — it never acts`).toBe(false);
      if (!res.ok) expect(res.message).toMatch(/never actually does anything/i);
    }
  });

  it("refuses an empty program without being rude about it", () => {
    const res = check("   \n  ");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toMatch(/nothing to publish/i);
  });

  it("a bot that only honks still counts as doing something — it's bad, not broken", () => {
    // We block bots that CANNOT act. We do not block bots that are simply poor strategy: losing to a
    // rival is a lesson, and a kid is allowed to publish a silly bot on purpose.
    expect(check("repeat 20 { honk() }").ok).toBe(true);
  });
});
