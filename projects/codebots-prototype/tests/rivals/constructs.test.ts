import { describe, it, expect } from "vitest";
import {
  detectConstructs,
  isConstructKnown,
  firstUnknownConstruct,
  constructWorld,
  CONSTRUCT_MISSIONS,
} from "../../src/rivals/constructs";
import type { SaveData } from "../../src/state/save";
import { FRESH_LOADOUT } from "../../src/state/save";

const saveWith = (clearedIds: string[]): SaveData => ({
  missions: Object.fromEntries(clearedIds.map((id) => [id, { cleared: true, stars: 1 }])),
  coins: 0,
  unlocked: [],
  badges: [],
  loadout: { ...FRESH_LOADOUT },
});

describe("detectConstructs", () => {
  it("finds control constructs by keyword", () => {
    const src = "while (true) { if (enemyAhead()) { shoot() } else { forward(1) } }";
    const { constructs } = detectConstructs(src);
    expect(constructs.sort()).toEqual(["else", "if", "while"]);
  });

  it("finds for and function separately", () => {
    const src = "function hunt() { for (let i = 0; i < 3; i++) { forward(1) } }";
    const { constructs } = detectConstructs(src);
    expect(constructs.sort()).toEqual(["for", "function"]);
  });

  it("finds battle sensors used", () => {
    const src = "while (true) { if (closerAhead()) { forward(1) } else if (hurt()) { back(1) } }";
    const { sensors } = detectConstructs(src);
    expect(sensors.sort()).toEqual(["closerAhead", "hurt"]);
  });

  it("finds nothing in a bot with no control flow or sensors", () => {
    const { constructs, sensors } = detectConstructs("forward(1)\nshoot()");
    expect(constructs).toEqual([]);
    expect(sensors).toEqual([]);
  });

  it("does not confuse enemyLeft/enemyRight with each other", () => {
    const { sensors } = detectConstructs("if (enemyRight()) { right() }");
    expect(sensors).toEqual(["enemyRight"]);
  });
});

describe("isConstructKnown", () => {
  it("is false when the teaching mission hasn't been cleared", () => {
    expect(isConstructKnown(saveWith([]), "while")).toBe(false);
  });

  it("is true once the teaching mission is cleared", () => {
    expect(isConstructKnown(saveWith(["w3m1"]), "while")).toBe(true);
  });

  it("every tracked construct maps to a mission id", () => {
    for (const construct of Object.keys(CONSTRUCT_MISSIONS) as (keyof typeof CONSTRUCT_MISSIONS)[]) {
      expect(typeof CONSTRUCT_MISSIONS[construct]).toBe("string");
    }
  });
});

describe("firstUnknownConstruct", () => {
  it("returns null when every used construct is known", () => {
    const save = saveWith(["w2m1", "w2m3", "w3m1", "w3m2", "w4m1"]);
    expect(firstUnknownConstruct(save, ["if", "while"])).toBeNull();
  });

  it("returns the earliest-taught missing construct, in teaching order", () => {
    // knows if/else, not while/for — opponent used both "for" and "while"; while is taught first
    const save = saveWith(["w2m1", "w2m3"]);
    expect(firstUnknownConstruct(save, ["for", "while"])).toBe("while");
  });

  it("ignores constructs the opponent didn't use, even if unknown", () => {
    const save = saveWith(["w2m1"]);
    expect(firstUnknownConstruct(save, ["if"])).toBeNull();
  });
});

describe("constructWorld", () => {
  it("resolves each construct to the world that teaches it", () => {
    expect(constructWorld("if")).toBe(2);
    expect(constructWorld("else")).toBe(2);
    expect(constructWorld("while")).toBe(3);
    expect(constructWorld("for")).toBe(3);
    expect(constructWorld("function")).toBe(4);
  });
});
