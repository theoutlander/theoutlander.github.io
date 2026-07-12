import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The funnel must never cost a kid her turn.
 *
 * These events exist so we can see the moment a child decides coding isn't for her. That is worth a
 * great deal — but not one single interrupted turn. A dead network, a missing table, a logged-out
 * player: all of it has to fail in silence. If collecting a statistic can ever break the game, we
 * have built the thing backwards, and the kid pays for our curiosity.
 */
const insert = vi.fn(async () => {
  throw new Error("network is on fire");
});

vi.mock("../../src/state/account", () => ({
  cloudEnabled: true,
  sb: () => ({ from: () => ({ insert }) }),
}));

describe("event logging", () => {
  beforeEach(() => {
    vi.resetModules();
    insert.mockClear();
  });

  it("never throws, even when the backend is completely dead", async () => {
    const { logEvent, flush } = await import("../../src/state/events");
    logEvent("cb_first_step", { id: "brackets", n: 3 });
    await expect(flush()).resolves.toBeUndefined();
  });

  it("batches, rather than firing a request per event", async () => {
    const { logEvent, flush } = await import("../../src/state/events");
    for (let i = 0; i < 12; i++) logEvent("cb_run", { level: 1 });
    await flush();
    // twelve events, ONE write. A network round-trip per event is how you make a game stutter on a
    // bad connection — and the stutter gets blamed on the game, not on us.
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert.mock.calls.length).toBe(1);
  });

  it("carries no way to identify a child", async () => {
    const { logEvent, flush } = await import("../../src/state/events");
    logEvent("cb_level_clear", { level: 3, stars: 2 });
    await flush();
    const rows = (insert.mock.calls[0] as unknown as [Record<string, unknown>[]])[0];
    const row = rows[0];
    // a session id, an optional opaque account id, an event name, and params. Nothing else — no name,
    // no email, no age, no location. These are children.
    expect(Object.keys(row).sort()).toEqual(["name", "params", "session", "user_id"]);
    expect(row.user_id).toBeNull(); // logged out ⇒ genuinely anonymous
  });

  it("empties its queue after a flush, so nothing is double-counted", async () => {
    const { logEvent, flush } = await import("../../src/state/events");
    logEvent("cb_run", { level: 1 });
    await flush();
    await flush();
    expect(insert).toHaveBeenCalledTimes(1);
  });
});
