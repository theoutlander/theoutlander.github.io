/// <reference lib="webworker" />
import { handleRequest, type SandboxRequest } from "./protocol";

// The Worker is the sandbox boundary: kid code runs here (via `new Function` inside the driver),
// isolated from the main thread and the DOM. It carries no game logic of its own — it delegates
// to the pure `handleRequest` and posts the response back.
self.onmessage = (e: MessageEvent<SandboxRequest>) => {
  const res = handleRequest(e.data);
  (self as DedicatedWorkerGlobalScope).postMessage(res);
};
