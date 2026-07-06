import type { Arena, BotState, TraceEntry } from "./types";
import { cellAt } from "./arena";

export function recordTrace(arena: Arena, state: BotState, tick: number): TraceEntry {
  const kind = cellAt(arena, state.pos);
  return { tick, x: state.pos.x, y: state.pos.y, hazards: kind === "floor" ? [] : [kind] };
}
