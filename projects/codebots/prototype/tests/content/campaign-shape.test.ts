import { describe, it, expect } from "vitest";
import { ALL, WORLDS } from "../../src/content/missions";
import { CONCEPTS, conceptFor } from "../../src/content/concepts";
import { drillForConcept } from "../../src/content/drills";

/**
 * THE CAMPAIGN IS THE TUTORIAL FOR THE ARENA. NOTHING ELSE.
 *
 * There were twenty-four levels and thirteen of them taught nothing new — practice levels wearing the
 * costume of progress. A kid grinding through "THE ZIGZAG" and "MIXED BAG" isn't learning, she's
 * waiting; and she's waiting on the way to the only room in the game that has another person in it.
 *
 * So: every level introduces exactly one NEW idea, and every idea is a verb she needs in a fight.
 * Practice didn't disappear when the filler did — it moved somewhere better. Each concept now ends in
 * a PROVE IT drill: practice on boards she has never seen, which cannot be beaten by counting squares.
 * That's worth more than three more hand-made levels she can memorise.
 *
 * These tests exist because a campaign re-bloats one well-meaning level at a time.
 */
describe("the shape of the campaign", () => {
  it("EVERY level teaches a new idea — no filler", () => {
    const withoutConcept = ALL.filter((m) => !conceptFor(m.world, m.index));
    expect(
      withoutConcept.map((m) => `${m.id} "${m.title}"`),
      "these levels introduce nothing new — they are practice wearing the costume of progress, and practice belongs in PROVE IT",
    ).toEqual([]);
  });

  it("stays short — a tutorial you have to grind through is a tutorial nobody finishes", () => {
    expect(ALL.length).toBeLessThanOrEqual(12);
    expect(ALL.length).toBe(CONCEPTS.length); // one level, one idea, exactly
  });

  it("every idea says what it BUYS her in a fight", () => {
    // if a concept can't answer this, it has no business being a level in a game about a battle arena
    for (const c of CONCEPTS) {
      expect(c.inBattle, `concept "${c.key}" doesn't say why it matters in a fight`).toBeTruthy();
      expect(c.inBattle.length).toBeGreaterThan(25);
    }
  });

  it("every idea can be PROVED — practice moved into the drills, it didn't vanish", () => {
    // cutting the filler is only honest if the practice went somewhere. It went here.
    for (const c of CONCEPTS) {
      expect(drillForConcept(c.key), `concept "${c.key}" has no drill — its practice was cut, not moved`).toBeTruthy();
    }
  });

  it("no idea is taught twice, and no level teaches two", () => {
    const slots = CONCEPTS.map((c) => `${c.world}:${c.level}`);
    expect(new Set(slots).size, "two concepts share a level slot — one of them will never be shown").toBe(slots.length);
    const keys = CONCEPTS.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every world still has levels in it", () => {
    for (const [i, w] of WORLDS.entries()) {
      expect(w.length, `world ${i + 1} was cut to nothing`).toBeGreaterThan(0);
    }
  });
});
