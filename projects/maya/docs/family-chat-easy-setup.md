# Family chat — quick setup (no Edge Function)

## 1. SQL

Supabase → **SQL Editor** → open `maya/sql/family-chat-dual-pin.sql`, replace `MAYA_PIN` / `DAD_PIN` with `6425` and `2545`, **Run**.

(If you never created the table, run the table part from `maya/sql/family-chat.sql` first.)

## 2. Realtime

**Database → Replication** → turn on `maya_chat_messages`.

## 3. Deploy site

Push/deploy the `maya/` folder (includes `family-chat.js`).

## 4. Test

- Maya: 💬 → `6425`
- Dad: 💬 → `2545`

Done. No Edge Function, no JWT secrets.
