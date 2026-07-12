import { describe, it, expect } from "vitest";
import { WORLD1, ALL } from "../../src/content/missions";
import { runInSandbox } from "../../src/sandbox/driver";
import { scanUnknownCalls } from "../../src/editor/assist";
import { apiForWorld } from "../../src/sandbox/api";
import { CONCEPTS } from "../../src/content/concepts";
import { ALL_COMMANDS } from "../../src/content/commandDocs";

/**
 * THE PROMISE: "you are writing real JavaScript." Everything a kid types IS real JS — except
 * `repeat n { }`, which the game desugars into a `for` loop before parsing. World 3 now REVEALS
 * that (`repeat`'s real name is `for`), and the card claims the two forms are the same thing.
 *
 * These tests pin that claim to reality: every World-1 `repeat` solution, rewritten by hand into a
 * plain `for` loop, must still clear its mission — and the editor must never squiggle `for`.
 * If the equivalence ever breaks, the concept card is lying and this goes red.
 */

/** Hand-rewrite `repeat N { ... }` as a kid would after the reveal: a real, plain `for` loop.
 *  Deliberately NOT desugarRepeat — the point is that hand-written `for` works on its own. */
function repeatToFor(source: string): string {
  return source.replace(/repeat\s+(\S+)\s*\{/g, "for (let i = 0; i < $1; i++) {");
}

const repeatMissions = WORLD1.filter((m) => m.authorSolution.includes("repeat"));

describe("`repeat` and a real `for` loop are the same thing", () => {
  it("World 1 actually has repeat-based solutions to check", () => {
    expect(repeatMissions.length).toBeGreaterThan(0);
  });

  for (const mission of repeatMissions) {
    it(`${mission.id} "${mission.title}" — clears with repeat AND with the equivalent for loop`, () => {
      const withRepeat = runInSandbox(mission, mission.authorSolution);
      expect(withRepeat.cleared, `author solution no longer clears ${mission.id}`).toBe(true);

      const rewritten = repeatToFor(mission.authorSolution);
      expect(rewritten, `${mission.id}: rewrite left a repeat behind`).not.toContain("repeat");
      expect(rewritten).toContain("for (let i = 0;");

      const withFor = runInSandbox(mission, rewritten);
      expect(
        withFor.cleared,
        `${mission.id}: the for-loop rewrite must clear the level too\n${rewritten}`,
      ).toBe(true);
    });
  }

  it("THE LOOP (w1m5) still earns three stars when written as a real for loop", () => {
    const mission = ALL.find((m) => m.id === "w1m5")!;
    expect(mission, "w1m5 — the repeat level — is gone").toBeDefined();
    const res = runInSandbox(
      mission,
      "for (let i = 0; i < 3; i++) {\n  forward(2)\n  honk()\n}\nforward(3)",
    );
    expect(res.cleared).toBe(true);
    expect(res.stars, "the for-loop version must not be scored worse than repeat").toBe(3);
  });
});

describe("the editor never rejects a real `for` loop", () => {
  const code = "for (let i = 0; i < 3; i++) {\n  forward(2)\n  honk()\n}";

  it("the linter finds no unknown command in a for loop", () => {
    // the linter's allow-list is the world API plus the control keywords (`for` among them)
    const allowed = new Set([...apiForWorld(1), "for", "if", "else", "while", "function", "repeat"]);
    expect(scanUnknownCalls(code, allowed)).toEqual([]);
  });

  it("a for loop runs in the sandbox without throwing", () => {
    const m = WORLD1[0];
    expect(() => runInSandbox(m, code)).not.toThrow();
  });
});

describe("the reveal is wired into the campaign", () => {
  it("the `for` concept card lands in World 3, on a real mission", () => {
    const c = CONCEPTS.find((x) => x.key === "forloop");
    expect(c, "no `for` reveal concept").toBeDefined();
    expect(c!.world).toBe(3);
    expect(ALL.some((m) => m.world === c!.world && m.index === c!.level)).toBe(true);
  });

  it("the command reference introduces `for` on the same level as the card", () => {
    const c = CONCEPTS.find((x) => x.key === "forloop")!;
    const doc = ALL_COMMANDS.find((d) => d.sig.startsWith("for ("));
    expect(doc, "no `for` entry in the command reference").toBeDefined();
    expect(doc!.world).toBe(c.world);
    expect(doc!.since).toBe(c.level);
  });

  it("`repeat` is still taught in World 1 — the reveal never takes it away", () => {
    const repeatDoc = ALL_COMMANDS.find((d) => d.sig.startsWith("repeat"));
    expect(repeatDoc?.world).toBe(1);
    expect(CONCEPTS.some((c) => c.key === "repeat" && c.world === 1)).toBe(true);
  });
});
