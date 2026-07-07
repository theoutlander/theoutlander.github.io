/**
 * Per-world command/sensor vocabulary — the single source of truth for what the game "knows".
 * The sandbox uses it to lint typos and drive the transform; the editor uses it for autocomplete
 * and the linter. A name is only known in a world once that world teaches it, so a sensor typed in
 * World 1 is (correctly) flagged as unknown.
 */
const BASE = ["forward", "back", "left", "right", "honk"] as const;

// World 2 adds the blaster and the three sensors used by if/while.
const W2 = [...BASE, "shoot", "blocked", "atBeacon", "targetAhead"] as const;

const API_BY_WORLD: Record<number, readonly string[]> = {
  1: BASE,
  2: W2,
  3: W2, // World 3 teaches `while` — new control flow, no new API
  4: W2, // World 4 teaches functions — new control flow, no new API
};

export function apiForWorld(world: number): string[] {
  return [...(API_BY_WORLD[world] ?? BASE)];
}
