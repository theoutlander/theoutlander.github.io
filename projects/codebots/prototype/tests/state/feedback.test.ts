import { describe, it, expect, vi, beforeEach } from "vitest";
import { REASONS, NOTE_MAX, sendFeedback } from "../../src/state/feedback";

/**
 * The kid is telling us the game is broken. The one unacceptable outcome is that the game breaks.
 *
 * sendFeedback runs at the exact moment a child is already annoyed enough to complain — a thrown
 * promise, a hang on a dead network, or an error toast at that moment doesn't just lose the report,
 * it confirms her suspicion and closes the tab. So it must swallow everything.
 */
vi.mock("../../src/state/account", () => ({
  cloudEnabled: true,
  currentAccount: vi.fn(async () => ({ id: "u1", username: "asha" })),
  sb: vi.fn(() => ({
    from: () => ({
      insert: async () => {
        throw new Error("network is on fire");
      },
    }),
  })),
}));

const track = vi.fn();
vi.mock("../../src/state/analytics", () => ({
  analytics: { problemReport: (...a: unknown[]) => track(...a) },
}));

const ctx = {
  level: 9,
  missionId: "w2m3",
  code: "forward(3)",
  error: null,
  hintsUsed: 3,
  fails: 5,
  showMeUsed: true,
  solutionUsed: false,
};

describe("a kid reporting a problem", () => {
  beforeEach(() => track.mockClear());

  it("never throws, even when the backend is completely dead", async () => {
    await expect(sendFeedback({ ...ctx, reason: "confused_words" })).resolves.toBeUndefined();
  });

  it("still records WHICH level and WHAT kind of confusion when the backend dies", async () => {
    // the analytics event is the part that must survive — it's the whole signal for a logged-out kid
    await sendFeedback({ ...ctx, reason: "too_hard" });
    expect(track).toHaveBeenCalledWith("too_hard", 9);
  });

  it("offers reasons a nine-year-old can actually pick from, in her own words", () => {
    // if the list ever fills up with jargon ("unexpected behaviour", "UX issue") it stops being usable
    for (const r of REASONS) {
      expect(r.label.length, `"${r.label}" is too long to scan`).toBeLessThan(50);
      expect(r.label).not.toMatch(/error|exception|bug report|UX|issue/i);
    }
    expect(REASONS.length).toBeGreaterThanOrEqual(4);
  });

  it("caps the free-text note — it's a hint box, never a chat channel", () => {
    expect(NOTE_MAX).toBeLessThanOrEqual(280);
  });
});
