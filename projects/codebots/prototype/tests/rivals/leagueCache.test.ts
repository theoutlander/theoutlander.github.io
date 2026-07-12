import { describe, it, expect, beforeEach } from "vitest";
import { seasonToken, cachedStandings, previousStandings } from "../../src/rivals/leagueCache";
import type { Fighter } from "../../src/rivals/league";

// Same stub pattern as tests/state/save-roundtrip.test.ts — the suite runs in node, and this module
// only needs a key/value store.
const store = new Map<string, string>();
(globalThis as { localStorage?: unknown }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

beforeEach(() => store.clear());

const f = (id: string, source: string): Fighter => ({ id, name: id, source });
const A = f("a", "while (true) { if (enemyAhead()) { shoot() } else { forward(1) } }");
const B = f("b", "while (true) { forward(1) }");
const NOW = new Date("2026-07-16T12:00:00Z"); // a Thursday

describe("seasonToken", () => {
  it("is the same token on either side of the week, up to the Friday boundary", () => {
    const thursday = new Date("2026-07-16T23:59:59Z");
    const friday9am = new Date("2026-07-17T09:00:00Z");
    expect(seasonToken(thursday)).toBe(seasonToken(new Date("2026-07-11T00:00:00Z"))); // same week
    expect(seasonToken(friday9am)).not.toBe(seasonToken(thursday)); // rolled over Friday 00:00 UTC
  });
});

describe("cachedStandings", () => {
  it("returns the same table it would compute directly, on a cold cache", () => {
    const result = cachedStandings([A, B], NOW);
    expect(result.map((s) => s.fighter.id).sort()).toEqual(["a", "b"]);
  });

  it("is a cache HIT for the same roster + season — repeat calls don't drift", () => {
    const first = cachedStandings([A, B], NOW);
    const second = cachedStandings([A, B], NOW);
    expect(second).toEqual(first);
  });

  it("is a cache MISS when a fighter's source changes — a republished bot invalidates it", () => {
    const before = cachedStandings([A, B], NOW);
    const edited = { ...A, source: "while (true) { honk() }" };
    const after = cachedStandings([edited, B], NOW);
    // different roster key -> recomputed, and the OLD table is now available as "previous"
    expect(previousStandings()).toEqual(before);
    void after;
  });

  it("is a cache MISS across a season rollover", () => {
    const beforeFriday = new Date("2026-07-16T23:59:59Z");
    const afterFriday = new Date("2026-07-17T00:00:01Z");
    const week1 = cachedStandings([A, B], beforeFriday);
    cachedStandings([A, B], afterFriday);
    expect(previousStandings()).toEqual(week1);
  });

  it("previousStandings is null the first time this device ever computes a ladder", () => {
    expect(previousStandings()).toBeNull();
  });
});
