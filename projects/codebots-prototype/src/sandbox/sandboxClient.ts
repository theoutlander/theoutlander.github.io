import type { Mission } from "../sim/engine";
import type { SandboxRequest, SandboxResponse } from "./protocol";

/**
 * Main-thread handle to the Worker sandbox. Each `run` posts one request and resolves with the
 * matching response (matched by id, so overlapping runs can't cross wires). Kid code never
 * touches the main thread — it executes inside the Worker.
 */
export class SandboxClient {
  private worker: Worker;
  private nextId = 1;
  private pending = new Map<number, (res: SandboxResponse) => void>();

  constructor() {
    this.worker = new Worker(new URL("./sandbox.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = (e: MessageEvent<SandboxResponse>) => {
      const resolve = this.pending.get(e.data.id);
      if (resolve) {
        this.pending.delete(e.data.id);
        resolve(e.data);
      }
    };
  }

  run(code: string, mission: Mission): Promise<SandboxResponse> {
    const id = this.nextId++;
    const req: SandboxRequest = { id, code, mission };
    return new Promise((resolve) => {
      this.pending.set(id, resolve);
      this.worker.postMessage(req);
    });
  }

  dispose(): void {
    this.worker.terminate();
    this.pending.clear();
  }
}
