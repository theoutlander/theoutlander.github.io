import { describe, it, expect } from "vitest";
import { unknownCommandHint, caseOnlyMatch } from "../../src/sandbox/errors";

const API = ["forward", "back", "left", "right", "honk", "shoot", "blocked", "atBeacon", "targetAhead"];

/**
 * A capitals mistake must TEACH the rule, not silently offer a fix. Asha typed a capitalised
 * command and the old message just said "did you mean forward()?" — she learned to click the
 * suggestion, not that computers read `Forward` and `forward` as different words.
 */
describe("capitalisation mistakes teach the rule", () => {
  it("detects a case-only mismatch", () => {
    expect(caseOnlyMatch("Forward", API)).toBe("forward");
    expect(caseOnlyMatch("FORWARD", API)).toBe("forward");
    expect(caseOnlyMatch("forward", API)).toBeNull(); // exact — not a mistake
    expect(caseOnlyMatch("forwrd", API)).toBeNull(); // a typo, not a capitals issue
  });

  it("explains that capital letters are different letters", () => {
    const msg = unknownCommandHint("Forward", API);
    expect(msg).toMatch(/capital/i);
    expect(msg).toContain("forward()");
    expect(msg).not.toMatch(/did you mean/i); // don't just hand over the fix
  });

  it("explains camelCase when the real command has a capital in the middle", () => {
    const msg = unknownCommandHint("targetahead", API);
    expect(msg).toMatch(/capital/i);
    expect(msg).toMatch(/two words/i);
    expect(msg).toContain("targetAhead()");
  });

  it("still gives a plain did-you-mean for an ordinary typo", () => {
    const msg = unknownCommandHint("forwrd", API);
    expect(msg).toMatch(/did you mean/i);
    expect(msg).toContain("forward()");
  });

  it("falls back to the command list when nothing is close", () => {
    expect(unknownCommandHint("banana", API)).toMatch(/COMMANDS list/i);
  });
});
