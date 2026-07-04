# Family chat setup (no Edge Function)

Maya types her password → browser sends it to Supabase on each chat request. No Edge Function to deploy.

## One-time Supabase setup

### 1. Table + Realtime

If the table does not exist yet, run `maya/sql/family-chat.sql` (table + Realtime line only), **or** the table section from `family-chat-all-in-one.sql`.

### 2. PIN policies

In **SQL Editor**, run `maya/sql/family-chat-dual-pin.sql` with:

- `MAYA_PIN` → `6425`
- `DAD_PIN` → `2545`

(Replace both quoted strings in the file before you Run.)

### 3. Realtime

**Database → Replication** → `maya_chat_messages` enabled on `supabase_realtime`.

### 4. Site config

`maya/family-chat.js` has the same PINs for Maya vs Dad labels. If you change passwords, update **both** the SQL policies and `mayaPin` / `dadPin` in that file, then redeploy `maya/`.

## Daily use

| Who | Password |
|-----|----------|
| Maya | `6425` |
| Dad | `2545` |

Tap **💬** → enter password → chat. Stays logged in on the same device until **Lock**.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Wrong password | Check PIN in SQL matches `family-chat.js` |
| Opens but send fails | Re-run `family-chat-dual-pin.sql` |
| No realtime updates | Enable Replication for the table |

`maya/supabase/functions/` is unused (old Edge approach).
