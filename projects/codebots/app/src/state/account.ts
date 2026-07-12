import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SaveData } from "./save";

/**
 * Cloud accounts on Supabase. The kid logs in with a USERNAME; under the hood each account uses a
 * deterministic synthetic auth email `‹username›@codebots.app`, so login needs no lookup and other
 * users' info stays private. Supabase's own unique-email constraint gives us username uniqueness
 * for free. An optional real email is kept for password recovery.
 *
 * If the Supabase env vars are absent (local dev, or before setup), `cloudEnabled` is false and the
 * whole game runs exactly as before — guest, localStorage only. Nothing is gated behind an account.
 */
// Reuses the family's existing Supabase project (also used by Maya's chat). The anon key is a
// public, RLS-limited key — already shipped client-side in maya/shared/family-chat.js — so it's
// safe to embed here too. Env vars override if ever needed.
const URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "https://mqmkktxaqmgqbdogozuu.supabase.co";
const ANON =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xbWtrdHhhcW1ncWJkb2dvenV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxOTA4ODIsImV4cCI6MjA5NTc2Njg4Mn0.agbC0-xB0jeetK5i6huDm87O3rDOwqdb4fRvEmNDPYU";

const CODEBOTS_SAVES = "codebots_saves";

export const cloudEnabled = !!(URL && ANON);

let client: SupabaseClient | null = null;
/** shared client — also used by feedback.ts, so a kid's report goes to the same project */
export function sb(): SupabaseClient {
  if (!client) client = createClient(URL!, ANON!);
  return client;
}

const SYNTH_DOMAIN = "codebots.app";
export const authEmail = (username: string): string => `${username.trim().toLowerCase()}@${SYNTH_DOMAIN}`;

export interface Account {
  id: string;
  username: string;
}

/** Turn Supabase's terse auth errors into kid-friendly ones. */
function friendly(message: string): Error {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered")) {
    return new Error("That username is taken — try another one.");
  }
  if (m.includes("invalid login")) return new Error("Wrong username or password. Try again.");
  if (m.includes("password")) return new Error("Password needs at least 6 characters.");
  return new Error(message);
}

export async function signUp(username: string, password: string, recoveryEmail?: string): Promise<Account> {
  const { data, error } = await sb().auth.signUp({
    email: authEmail(username),
    password,
    options: { data: { username, recovery_email: recoveryEmail || null } },
  });
  if (error) throw friendly(error.message);
  const user = data.user;
  if (!user) throw new Error("Couldn't create the account — try again.");
  // Username + recovery email live in the auth user's metadata (set above) — no extra table needed;
  // uniqueness comes free from the synthetic email being unique in auth.users.
  return { id: user.id, username };
}

export async function logIn(username: string, password: string): Promise<Account> {
  const { data, error } = await sb().auth.signInWithPassword({ email: authEmail(username), password });
  if (error) throw friendly(error.message);
  if (!data.user) throw new Error("Couldn't log in — try again.");
  return { id: data.user.id, username };
}

export async function logOut(): Promise<void> {
  if (cloudEnabled) await sb().auth.signOut();
}

/** The signed-in account, or null. Reads the username from auth metadata (no extra request). */
export async function currentAccount(): Promise<Account | null> {
  if (!cloudEnabled) return null;
  const { data } = await sb().auth.getUser();
  if (!data.user) return null;
  const username = (data.user.user_metadata?.username as string | undefined) ?? "";
  return { id: data.user.id, username };
}

/** Pull the cloud save for the signed-in user (or null if none/logged out). */
export async function pullSave(): Promise<SaveData | null> {
  if (!cloudEnabled) return null;
  const { data, error } = await sb().from(CODEBOTS_SAVES).select("data").maybeSingle();
  if (error) return null;
  return (data?.data as SaveData) ?? null;
}

/** Write the save to the cloud for the signed-in user. No-op when logged out / cloud off. */
export async function pushSave(save: SaveData): Promise<void> {
  if (!cloudEnabled) return;
  const { data } = await sb().auth.getUser();
  if (!data.user) return;
  await sb()
    .from(CODEBOTS_SAVES)
    .upsert({ user_id: data.user.id, data: save, updated_at: new Date().toISOString() });
}
