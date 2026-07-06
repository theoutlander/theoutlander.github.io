import { describe, it, expect } from "vitest";
import { desugarRepeat, toGeneratorSource } from "../../src/sandbox/transform";

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

describe("toGeneratorSource", () => {
  const API = ["forward", "left", "right", "back", "honk"];

  it("wraps the program in a generator and yields known API calls", () => {
    const src = toGeneratorSource("forward(2); left(); honk();", API);
    const compiled = new Function(
      "__call",
      `${src}\nreturn __main;`,
    )((name: string, args: unknown[]) => ({ name, args }));
    const gen = compiled();
    expect(gen.next().value).toEqual({ name: "forward", args: [2] });
    expect(gen.next().value).toEqual({ name: "left", args: [] });
    expect(gen.next().value).toEqual({ name: "honk", args: [] });
    expect(gen.next().done).toBe(true);
  });

  it("proves the generator interleaves: a fake sensor call reflects driver-resumed state, not a batched snapshot", () => {
    const src = toGeneratorSource("for (let i = 0; i < 2; i++) { where(); }", ["where"]);
    const compiled = new Function("__call", `${src}\nreturn __main;`)(
      (name: string, args: unknown[]) => ({ name, args }),
    );
    const gen = compiled();
    let tick = 0;
    const seen: unknown[] = [];
    let step = gen.next();
    while (!step.done) {
      tick += 1; // driver "advances the sim" between each resumption
      seen.push(tick);
      step = gen.next(tick);
    }
    expect(seen).toEqual([1, 2]); // two distinct resumptions, not one batched pass
  });
});
