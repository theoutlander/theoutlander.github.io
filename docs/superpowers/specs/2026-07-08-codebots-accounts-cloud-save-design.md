# CodeBots — Accounts + Cloud Save (Supabase)

**Date:** 2026-07-08
**Status:** Approved direction (owner picked Supabase + optional email)
**Owner:** Nick (for daughter Asha, 9–13)

## Goal

Let a kid **create an account and save/sync progress across devices** — without needing
an email. Today progress lives only in `localStorage` (one browser, one device; lost on
clear). Add a Supabase-backed account so the save persists in the cloud and follows her to
any device she logs into.

## Locked decisions (owner)

1. **Backend:** Supabase (managed auth + Postgres) — scales past family if it grows.
2. **Email:** optional at signup. Real email → self-serve password reset. No email →
   parent/admin reset (safety net). Username + password is the primary identity.

## Architecture

### Identity model — username login on top of Supabase Auth

Supabase Auth is email-based. The kid only ever sees a **username**. Under the hood every
account has an auth email:

- **Real email given** → that's the auth email (Supabase's built-in password reset works).
- **No email** → a synthetic auth email `‹username›@codebots.app` (deterministic; the kid
  never sees it).

Because the auth email can be real *or* synthetic, login-by-username needs a
username→email resolution that keeps other users' emails private. Two clean options:

- **A (preferred): Supabase Edge Functions** `signup` and `login` that take
  `{username, password, email?}`, do the mapping server-side (service-role), and return a
  session. Emails never leave the server. Cleanest + most private; a bit more setup.
- **B (simpler): always synthetic email** `‹username›@codebots.app` (deterministic — client
  derives it, no lookup, no edge function). Optional real email stored as a *recovery*
  field in `profiles`. Login is trivial; recovery for email users is a small custom flow.

Start with **B** (fastest to working accounts, no edge functions), with an easy migration to
A if we later need real-email-as-auth. Password reset: email users → a custom "send reset"
(edge function or Supabase recovery against the stored recovery email); no-email users →
parent/admin reset. A self-serve "recovery word" is a noted future add.

### Data model

```sql
-- profiles: one row per account (id = auth.users.id)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  recovery_email text,           -- optional; for password reset
  created_at timestamptz default now()
);

-- saves: the game save blob, one row per user
create table saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,           -- the SaveData object (missions, coins, badges, field-solved)
  updated_at timestamptz default now()
);
```

**RLS (row-level security):** each user can `select/insert/update` only their own `profiles`
and `saves` rows (`auth.uid() = id` / `= user_id`). Usernames are checked for uniqueness on
signup via a public, security-definer `username_available(text)` function so we never expose
the table.

### Save-sync (localStorage stays primary)

- `localStorage` remains the instant, offline store (unchanged game code).
- A thin **sync layer** wraps it:
  - **On login / app load (if logged in):** pull the cloud save; merge with local
    (take the max per mission stars + union of badges/unlocks + max coins/field-solved —
    a deterministic "best of both" merge so nothing is lost switching devices).
  - **On save (after a clear / bot change):** write local, then debounced push to cloud.
- Logged-out play works fully; on next login the local progress merges up.

Merge is intentionally union/max-based (never destructive) so a device with older cloud
data can't wipe newer local progress and vice-versa.

### UI

- **Front door (BOOT):** "Log in" / "Create account" / "Play as guest" (guest = current
  localStorage-only behavior, so nothing is gated behind signup).
- **Signup:** username, password, optional email (labeled "a grown-up's email, for password
  help — optional"). Kid-friendly validation (username taken?, password length).
- **Login:** username + password.
- **HQ:** shows logged-in username; a "Log out" and a "Sync now" affordance.
- **Parent/admin reset:** a small page (behind a simple gate) or documented Supabase-dashboard
  steps for you to reset a forgotten password.

Passwords are never stored by us in plaintext — Supabase hashes them. Claude builds the
forms; the kid/parent types real credentials (Claude never handles them).

## Division of labor

- **Owner (one-time, ~10 min):** create a free Supabase project; run the provided schema SQL
  in the SQL editor; paste back the **Project URL** + **anon public key** (safe to embed in a
  client app). That's it.
- **Claude:** `supabase-js` client wiring, auth calls (signup/login/logout/reset), the
  sync/merge layer, all UI, the schema SQL + RLS policies, and setup instructions.

## Verification

- **Unit-testable without the backend:** the merge function (union/max, non-destructive) —
  test with divergent local/cloud saves. Username/email derivation. Auth-state reducer.
- **Needs the live project (after setup):** signup → login on a second browser → progress
  restored; guest→login merge; logout; a reset. Browser-verified end to end.
- Config via env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); when absent the app runs in
  **guest-only mode** (today's behavior) so the build never breaks and CI stays green.

## Out of scope / future

- Self-serve "recovery word" for no-email accounts (parent-reset covers it for now).
- Edge-function username-auth (option A) — migrate if real-email-as-auth is needed.
- Social/multiplayer, enemy bots (separate roadmap).

## ⚠️ COPPA / kids' privacy

Family/friends use: fine. A **public** product collecting username/password/email from
**children under 13** triggers COPPA (US) and similar laws (verifiable parental consent, data
handling). Not legal advice — but a real gate before opening signups to strangers' kids.
