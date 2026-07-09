# CodeBots cloud save — setup (reuses the family's existing Supabase project)

The app already points at the same Supabase project as Maya's chat
(`mqmkktxaqmgqbdogozuu`), using its public anon key. So there's **no new project and no keys to
send me** — just two quick things in that project's dashboard.

## 1. Create the save table (~2 min)
1. Open the Supabase project → left sidebar → **SQL Editor** → **New query**.
2. Copy the whole of `supabase/schema.sql` (in this repo), paste it in, click **Run**.
   You should see "Success." It adds one table, `codebots_saves`, with row-level security so each
   account can only touch its own save. It won't affect the chat tables.

## 2. Turn OFF email confirmation (~1 min)
Accounts use a behind-the-scenes email (`username@codebots.app`), so a confirmation email would go
nowhere and lock kids out.
1. Left sidebar → **Authentication** → **Sign In / Providers** (or **Providers**) → **Email**.
2. Turn **"Confirm email"** OFF. Save.
   (This only affects email/password signups — Maya's chat uses PINs, not Auth, so it's untouched.)

That's it — accounts go live on the next deploy. Test: create an account on one browser, then log in
on another and confirm the progress follows.

## Forgot password (for now)
- Real recovery email given at signup → send a reset from **Authentication → Users**.
- No email → reset the password for any account right there in the dashboard (you're the admin).
- (A self-serve "recovery word" for no-email kids is an easy future add.)
