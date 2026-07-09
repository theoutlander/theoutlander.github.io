# CodeBots cloud save — one-time Supabase setup (~10 minutes, no coding)

Do this whenever you're ready to turn on accounts. Until it's done, the game just runs in
**guest mode** (localStorage only) — nothing breaks.

## 1. Make a free Supabase project
1. Go to https://supabase.com → **Sign in** (GitHub login is easiest) → **New project**.
2. Name it `codebots`, pick a region near you, set a database password (save it somewhere).
3. Wait ~2 min for it to spin up.

## 2. Create the tables
1. In the project: left sidebar → **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` (in this repo), copy the whole thing, paste it in, click **Run**.
   You should see "Success."

## 3. Turn OFF email confirmation (important)
Accounts use a behind-the-scenes email, so confirmation emails would go nowhere.
1. Left sidebar → **Authentication** → **Providers** (or **Sign In / Providers**) → **Email**.
2. Turn **"Confirm email"** OFF. Save.

## 4. Grab the two values I need
1. Left sidebar → **Project Settings** (gear) → **API**.
2. Copy the **Project URL** and the **anon public** key (the long one labeled `anon` `public`).
3. Paste both back to me. (The anon key is safe to ship in a web app — it only allows what the
   security rules allow, i.e. each user can only touch their own save.)

That's it. I'll plug those two values in (as `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
build secrets), and accounts go live.

## Forgot-password (for now)
- If a kid gave a real recovery email at signup, you can send a reset from
  **Authentication → Users** in the dashboard.
- If not, you can reset any account's password right there in the dashboard (you're the admin).
- (A self-serve "recovery word" for no-email kids is an easy future add.)
