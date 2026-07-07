import { describe, it, expect } from "vitest";
import { desugarRepeat, toGeneratorSource, collectFunctionNames } from "../../src/sandbox/transform";

describe("desugarRepeat", () => {
  it("rewrites repeat n { } to a for loop", () => {
    const out = desugarRepeat("repeat 4 { forward(3) left() }");
    expect(out).toBe("for (let i = 0; i < (4); i++) { forward(3) left() }");
  });

  it("handles nested braces inside the body", () => {
    const out = desugarRepeat("repeat 2 { if (true) { honk() } }");
    expect(out).toContain("for (let i = 0; i < (2); i++)");
    expect(out).toContain("if (true) { honk() }");
  });
});

/**
 * Drive a transformed program the way the real driver does: step the generator, and for each
 * yielded command look up a scripted result (sensor booleans) so branch/loop logic is exercised.
 * Returns the ordered list of {name,args} the program actually emitted.
 */
function drive(
  source: string,
  api: string[],
  results: Record<string, unknown[]> = {},
  maxSteps = 200,
): { name: string; args: unknown[] }[] {
  const src = toGeneratorSource(source, api);
  const compiled = new Function("__call", `${src}\nreturn __main;`)(
    (name: string, args: unknown[]) => ({ name, args }),
  );
  const gen = compiled();
  const emitted: { name: string; args: unknown[] }[] = [];
  const cursor: Record<string, number> = {};
  let step = gen.next();
  let n = 0;
  while (!step.done) {
    if (++n > maxSteps) throw new Error("MAX_STEPS");
    const cmd = step.value as { name: string; args: unknown[] };
    emitted.push(cmd);
    // A sensor's result: pull the next scripted value for that name (default undefined).
    const queue = results[cmd.name];
    let value: unknown = undefined;
    if (queue) {
      const i = cursor[cmd.name] ?? 0;
      value = queue[Math.min(i, queue.length - 1)];
      cursor[cmd.name] = i + 1;
    }
    step = gen.next(value);
  }
  return emitted;
}

const CMD = ["forward", "left", "right", "back", "honk", "shoot"];
const SENSE = ["blocked", "atBeacon", "targetAhead"];
const API = [...CMD, ...SENSE];

describe("toGeneratorSource — statements (unchanged W1 behavior)", () => {
  it("yields known API calls in order", () => {
    const out = drive("forward(2); left(); honk();", API);
    expect(out).toEqual([
      { name: "forward", args: [2] },
      { name: "left", args: [] },
      { name: "honk", args: [] },
    ]);
  });

  it("still interleaves for-loop bodies one command per resumption", () => {
    const out = drive("for (let i = 0; i < 2; i++) { forward(1); }", API);
    expect(out).toEqual([
      { name: "forward", args: [1] },
      { name: "forward", args: [1] },
    ]);
  });
});

describe("toGeneratorSource — sensors in expression position", () => {
  it("if (blocked()) takes the true branch", () => {
    const out = drive("if (blocked()) { right(); } else { forward(1); }", API, { blocked: [true] });
    expect(out.map((c) => c.name)).toEqual(["blocked", "right"]);
  });

  it("if (blocked()) takes the false branch", () => {
    const out = drive("if (blocked()) { right(); } else { forward(1); }", API, { blocked: [false] });
    expect(out.map((c) => c.name)).toEqual(["blocked", "forward"]);
  });

  it("negation: if (!blocked()) forward()", () => {
    const out = drive("if (!blocked()) { forward(1); }", API, { blocked: [false] });
    expect(out.map((c) => c.name)).toEqual(["blocked", "forward"]);
  });

  it("short-circuit: b() is NOT queried when a() is false", () => {
    const out = drive("if (blocked() && targetAhead()) { shoot(); }", API, {
      blocked: [false],
      targetAhead: [true],
    });
    // only `blocked` runs; `targetAhead` short-circuited away, `shoot` never fires
    expect(out.map((c) => c.name)).toEqual(["blocked"]);
  });

  it("while (!atBeacon()) terminates when the sensor flips true", () => {
    const out = drive("while (!atBeacon()) { forward(1); }", API, {
      atBeacon: [false, false, true],
    });
    // queries: false→move, false→move, true→stop  ⇒ 2 forwards + 3 atBeacon reads
    expect(out.filter((c) => c.name === "forward").length).toBe(2);
    expect(out.filter((c) => c.name === "atBeacon").length).toBe(3);
  });

  it("while (blocked()) with no progress runs away (driver MAX_STEPS catches it)", () => {
    expect(() => drive("while (blocked()) { }", API, { blocked: [true] }, 50)).toThrow("MAX_STEPS");
  });
});

describe("toGeneratorSource — user functions (World 4)", () => {
  it("delegates a user function via yield* and runs its commands", () => {
    const out = drive("function spin() { right(); right(); }\nspin();", API);
    expect(out.map((c) => c.name)).toEqual(["right", "right"]);
  });

  it("a user function called inside a loop repeats its body", () => {
    const out = drive(
      "function step() { forward(1); honk(); }\nfor (let i = 0; i < 2; i++) { step(); }",
      API,
    );
    expect(out.map((c) => c.name)).toEqual(["forward", "honk", "forward", "honk"]);
  });

  it("user functions can call other user functions", () => {
    const out = drive(
      "function a() { forward(1); }\nfunction b() { a(); a(); }\nb();",
      API,
    );
    expect(out.map((c) => c.name)).toEqual(["forward", "forward"]);
  });

  it("collectFunctionNames reports declared names so they aren't linted as typos", () => {
    expect(collectFunctionNames("function spin(){ right() }\nspin()")).toEqual(["spin"]);
  });
});
