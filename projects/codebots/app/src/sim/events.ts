import type { Vec2, Facing } from "./types";

/**
 * The deterministic event log produced by one run of kid code. This is the SOLE interface
 * between the sim and every view layer (Phaser, sound, HUD, tank-radio): they consume events,
 * they never execute game logic. Golden tests assert this log + final state, never pixels.
 *
 * The union is authored to extend (a future `hazard` event for the W2M6 windmill) without
 * reshaping the W1 events. Every event carries the `tick` it occurs at so a view can play the
 * log back on a clock later; for W1 (no moving hazards) playback is a straight sequential replay.
 */
export type SimEvent =
  | { tick: number; type: "move"; from: Vec2; to: Vec2; facing: Facing; cost: number }
  | { tick: number; type: "turn"; facing: Facing }
  | { tick: number; type: "bump"; at: Vec2 }
  | { tick: number; type: "fall"; at: Vec2 }
  | { tick: number; type: "splash"; at: Vec2 }
  | { tick: number; type: "honk"; at: Vec2; seq?: number }
  | { tick: number; type: "gateOpen"; pad: Vec2; gateCells: Vec2[] }
  | { tick: number; type: "coin"; at: Vec2 }
  | { tick: number; type: "score"; delta: number; total: number; at: Vec2 }
  | { tick: number; type: "clear"; at: Vec2 };
