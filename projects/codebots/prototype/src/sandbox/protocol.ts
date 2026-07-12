import { runInSandbox } from "./driver";
import { toRunError, type RunError } from "./errors";
import type { Mission } from "../sim/engine";
import type { SimEvent } from "../sim/events";
import type { BotState } from "../sim/types";

export interface SandboxRequest {
  id: number;
  code: string;
  mission: Mission;
}

export interface RunOutput {
  cleared: boolean;
  stars: number;
  ticks: number;
  events: SimEvent[];
  finalState: BotState;
}

export type SandboxResponse =
  | { id: number; ok: true; run: RunOutput }
  | { id: number; ok: false; error: RunError };

/**
 * Pure request handler: kid code + mission in, response out. This is the ENTIRE sandbox brain;
 * `sandbox.worker.ts` is just message plumbing around it, which lets us test the real logic in
 * node without a Worker. Any throw (parse error, step-budget overflow) becomes an `ok:false`.
 */
export function handleRequest(req: SandboxRequest): SandboxResponse {
  try {
    const run = runInSandbox(req.mission, req.code);
    return {
      id: req.id,
      ok: true,
      run: {
        cleared: run.cleared,
        stars: run.stars,
        ticks: run.ticks,
        events: [...run.events],
        finalState: run.finalState,
      },
    };
  } catch (e) {
    return { id: req.id, ok: false, error: toRunError(e) };
  }
}
