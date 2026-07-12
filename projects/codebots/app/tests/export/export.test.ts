import { describe, it, expect } from "vitest";
import { parse } from "acorn";
import { WORLDS } from "../../src/content/missions";
import { exportBot, usedCommands, slugifyBotName, ALL_API } from "../../src/export/toRealJs";
import { desugarRepeat } from "../../src/sandbox/transform";
import { SDK_DECLARATION } from "../../src/export/sdk";

const MISSIONS = WORLDS.flat();

/** The names in the emitted `import { ... } from "codebots-sdk"` line. */
function importedNames(exported: string): string[] {
  const m = /import \{ (.+) \} from "codebots-sdk";/.exec(exported);
  return m ? m[1].split(", ") : [];
}

describe("exportBot", () => {
  it("has author solutions to export", () => {
    expect(MISSIONS.length).toBeGreaterThanOrEqual(24);
  });

  // The load-bearing claim of the whole feature: what she downloads is real JavaScript.
  for (const m of MISSIONS) {
    describe(m.id, () => {
      const out = exportBot(m.authorSolution, { botName: "Sparkplug" });

      it("exports a parseable ES module", () => {
        expect(() => parse(out, { ecmaVersion: 2022, sourceType: "module" })).not.toThrow();
      });

      it("contains no `repeat` keyword", () => {
        expect(out).not.toMatch(/\brepeat\s/);
      });

      it("imports exactly the commands the program calls", () => {
        const called = usedCommands(desugarRepeat(m.authorSolution));
        expect(importedNames(out).sort()).toEqual([...called].sort());
      });

      it("keeps the kid's code recognisable", () => {
        // Every non-repeat line of her program survives verbatim (modulo indentation).
        const lines = m.authorSolution
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l && !/^repeat\b/.test(l) && l !== "}");
        for (const line of lines) expect(out).toContain(line);
      });
    });
  }

  it("desugars repeat into a real for loop", () => {
    const out = exportBot("repeat 3 {\n  forward(2)\n  honk()\n}\nforward(3)", { botName: "Sparkplug" });
    expect(out).toContain("for (");
    expect(out).not.toContain("repeat");
    expect(importedNames(out)).toEqual(["forward", "honk"]);
  });

  it("wraps the program in an exported async brain()", () => {
    const out = exportBot("forward(1)", { botName: "Sparkplug" });
    expect(out).toContain("export async function brain() {");
    expect(out).toContain("// Sparkplug");
  });

  it("does not import the kid's own functions, only real commands", () => {
    const src = "function zigzag() {\n  forward(1)\n  left()\n}\nzigzag()\nzigzag()";
    const out = exportBot(src, { botName: "Zig" });
    expect(importedNames(out)).toEqual(["forward", "left"]);
    expect(out).toContain("function zigzag()");
  });

  it("finds commands inside conditions and nested bodies", () => {
    const src = "while (!atBeacon()) {\n  if (blocked()) {\n    shoot()\n  }\n  forward(1)\n}";
    expect(usedCommands(src).sort()).toEqual(["atBeacon", "blocked", "forward", "shoot"]);
  });

  it("emits no import line when nothing is called", () => {
    const out = exportBot("// nothing yet\n", { botName: "Blank" });
    expect(out).not.toContain("import");
    expect(() => parse(out, { ecmaVersion: 2022, sourceType: "module" })).not.toThrow();
  });

  it("makes a safe filename out of any bot name", () => {
    expect(slugifyBotName("Zap Bot 3000!")).toBe("zap-bot-3000");
    expect(slugifyBotName("  ***  ")).toBe("bot");
  });
});

describe("codebots-sdk.d.ts", () => {
  it("declares every command in the API", () => {
    for (const name of ALL_API) {
      expect(SDK_DECLARATION).toContain(`export function ${name}(`);
    }
  });

  it("types sensors as booleans and actions as void", () => {
    expect(SDK_DECLARATION).toContain("export function blocked(): boolean;");
    expect(SDK_DECLARATION).toContain("export function forward(steps?: number): void;");
  });
});
