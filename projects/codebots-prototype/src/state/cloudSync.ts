import { loadSave, saveSave, mergeSaves } from "./save";
import { pullSave, pushSave, cloudEnabled } from "./account";

/**
 * Ties the local save to the cloud. localStorage is always the instant, offline store; this layer
 * converges it with the account's cloud save (non-destructively) on login and pushes changes after.
 */
let pushTimer: ReturnType<typeof setTimeout> | null = null;

/** Pull the cloud save, merge with local (best-of-both), persist locally, push the merged result
 *  back. Called on login/signup and on app start when already signed in — so a guest's progress
 *  merges up and a new device pulls everything down. */
export async function syncNow(): Promise<void> {
  if (!cloudEnabled) return;
  const local = loadSave();
  const cloud = await pullSave();
  const merged = cloud ? mergeSaves(local, cloud) : local;
  saveSave(merged);
  await pushSave(merged);
}

/** Debounced push of the current local save to the cloud (fired after a clear / bot change). */
export function schedulePush(): void {
  if (!cloudEnabled) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    void pushSave(loadSave());
  }, 1500);
}

/** Listen for local-save writes and push them (debounced). Call once at app start. */
export function initCloudSync(): void {
  if (!cloudEnabled || typeof window === "undefined") return;
  window.addEventListener("cb:saved", schedulePush);
}
