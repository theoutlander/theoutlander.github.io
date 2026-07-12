import { describe, it, expect } from "vitest";
import { starsAfterHelp } from "../../src/state/save";

/**
 * The bargain at the bottom of the help ladder.
 *
 * The game used to say "NO MORE HINTS" and disable the button — a locked door in the face of the one
 * kid who most needed it open. Now she can always take the answer (SHOW ME HOW, then GIVE ME THE
 * CODE), and the level still clears, because being stuck must never be a dead end.
 *
 * The price is that it caps at one star. Both halves matter:
 *   - taking the answer must still CLEAR, or she's stranded and closes the tab;
 *   - it must never be as good as working it out, or the stars stop meaning anything and the fastest
 *     route through the game becomes "click GIVE ME THE CODE on every level".
 */
describe("stars after taking the answer", () => {
  it("a kid who works it out keeps every star she earned", () => {
    expect(starsAfterHelp(3, false)).toBe(3);
    expect(starsAfterHelp(2, false)).toBe(2);
    expect(starsAfterHelp(1, false)).toBe(1);
  });

  it("taking the code still CLEARS the level — never a dead end", () => {
    expect(starsAfterHelp(3, true)).toBeGreaterThan(0);
  });

  it("but it caps at one star, however well the given answer scored", () => {
    expect(starsAfterHelp(3, true)).toBe(1);
    expect(starsAfterHelp(2, true)).toBe(1);
    expect(starsAfterHelp(1, true)).toBe(1);
  });

  it("taking the answer is never better than working it out", () => {
    for (const earned of [0, 1, 2, 3]) {
      expect(starsAfterHelp(earned, true)).toBeLessThanOrEqual(starsAfterHelp(earned, false));
    }
  });

  it("a failed run is still a failed run — help doesn't invent a clear", () => {
    expect(starsAfterHelp(0, true)).toBe(0);
    expect(starsAfterHelp(0, false)).toBe(0);
  });
});
