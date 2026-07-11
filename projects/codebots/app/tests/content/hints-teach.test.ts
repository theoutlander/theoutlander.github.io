import { describe, it, expect } from "vitest";
import { WORLDS } from "../../src/content/missions";

/**
 * HINTS MUST TEACH, NOT ANSWER.
 *
 * They had rotted into the solution: w2m7's hint 2 was literally
 * `if (targetAhead()) { shoot() } else { forward(1) }` — the entire program. A kid learns exactly one
 * thing from that: click HINT twice and copy. She never meets the concept.
 *
 * The game now has honest answer-tiers AFTER the hints (SHOW ME HOW plays the author's solution;
 * GIVE ME THE CODE hands it over and caps the level at one star), so a stranded kid is never stuck.
 * That frees hints to do their real job — and these tests keep them there.
 *
 * The ladder: NOTICE (what to look at) → STRATEGY (the plan, in words) → SHAPE (code with blanks).
 */
const ALL = WORLDS.flat();

/** Words for things that are nowhere on the screen. The kid sees a grid: no compass, no row numbers. */
const INVISIBLE = [
  { re: /\brows?\s*\d/i, why: 'rows are not numbered on screen — say "the lane above you"' },
  { re: /\b(north|south|east|west|northern|southern|eastern|western)\b/i, why: "there is no compass on screen" },
  { re: /\b(?:column|col)\s*\d/i, why: "columns are not numbered on screen" },
  { re: /\(\s*-?\d+\s*,\s*-?\d+\s*\)/, why: "coordinates are not shown on screen" },
];

describe("hints teach — they never hand over the answer", () => {
  for (const m of ALL) {
    it(`${m.id} "${m.title}" — has exactly 3 non-empty hints`, () => {
      expect(m.hints).toHaveLength(3);
      for (const h of m.hints) expect(h.trim().length, `${m.id} has an empty hint`).toBeGreaterThan(0);
    });

    it(`${m.id} — no hint shows a code BLOCK without a blank to fill in`, () => {
      // A hint may show the SHAPE of the code — but the moment it opens a `{`, it is showing
      // structure, and structure without a `???` is just the answer with extra words.
      m.hints.forEach((h, i) => {
        if (h.includes("{")) {
          expect(
            h.includes("???"),
            `${m.id} hint ${i + 1} shows a code block but leaves nothing for the kid to work out:\n  ${h}`,
          ).toBe(true);
        }
      });
    });

    it(`${m.id} — no hint contains the author's solution`, () => {
      const squash = (s: string) => s.replace(/\s+/g, "").toLowerCase();

      // A hint is allowed to show the SHAPE — `if ( ??? ) { ??? } else { forward(1) }` is a scaffold,
      // and its bare braces and boilerplate tail will of course echo the solution. What it may never
      // do is hand over the THINKING. So we only compare lines that carry real code (a call or a
      // condition — anything with parentheses) and ignore pure punctuation like `}` and `} else {`.
      const meaty = m.authorSolution
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.includes("("));

      // Two consecutive lines of real code, quoted verbatim, is a copy-paste answer.
      // (This is precisely what w2m7's old hint 2 did: "if (targetAhead()) { shoot() } ...")
      for (let n = 0; n + 2 <= meaty.length; n++) {
        const chunk = squash(meaty.slice(n, n + 2).join(""));
        m.hints.forEach((h, i) => {
          expect(
            squash(h).includes(chunk),
            `${m.id} hint ${i + 1} quotes the solution's code verbatim — blank out the part she's meant to work out:\n  ${h}`,
          ).toBe(false);
        });
      }
    });

    it(`${m.id} — no hint points at something the kid cannot see`, () => {
      m.hints.forEach((h, i) => {
        for (const { re, why } of INVISIBLE) {
          expect(re.test(h), `${m.id} hint ${i + 1}: ${why}\n  ${h}`).toBe(false);
        }
      });
    });
  }

  it("SHOW ME always has something real to play — every mission's solution is non-empty", () => {
    // The help ladder bottoms out in "watch my bot do it". If a mission had no author solution, the
    // ladder would dead-end exactly where a struggling kid needs it most.
    for (const m of ALL) {
      expect(m.authorSolution.trim().length, `${m.id} has no author solution to SHOW ME`).toBeGreaterThan(0);
    }
  });
});
