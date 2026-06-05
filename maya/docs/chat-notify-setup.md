# Chat Notify Setup

Push notification to Dad's phone when Maya sends a chat message. Uses ntfy.sh (free, no account) + a Supabase Edge Function.

---

## 1. Install ntfy on your phone

- iOS: https://apps.apple.com/app/ntfy/id1625396347
- Android: https://play.google.com/store/apps/details?id=io.heckel.ntfy

Pick a private topic name — something hard to guess, e.g. `maya-chat-nick-2545`. You'll use it in steps 2 and 3.

---

## 2. Subscribe in the app

Open ntfy → tap **+** → enter your topic name → Subscribe. That's it — notifications will arrive here.

---

## 3. Deploy the Edge Function

```bash
cd theoutlander.github.io/maya

# One-time login
npx supabase login

# Link to the project (project ref: mqmkktxaqmgqbdogozuu)
npx supabase link --project-ref mqmkktxaqmgqbdogozuu

# Deploy
npx supabase functions deploy chat-notify --no-verify-jwt
```

---

## 4. Set the secret in Supabase

Dashboard → **Edge Functions** → `chat-notify` → **Secrets** → Add:

| Key | Value |
|-----|-------|
| `NTFY_TOPIC` | your topic name from step 1 |
| `WEBHOOK_SECRET` | any random string (e.g. `dad-secret-42`) — you'll use this in step 5 |

---

## 5. Add the Database Webhook

Dashboard → **Database** → **Webhooks** → **Create webhook**:

| Field | Value |
|-------|-------|
| Name | `chat-notify` |
| Table | `maya_chat_messages` |
| Events | `INSERT` |
| Type | `HTTP Request` |
| URL | `https://mqmkktxaqmgqbdogozuu.supabase.co/functions/v1/chat-notify` |
| HTTP Headers | `x-webhook-secret` = the same value you set in step 4 |

Save. Done.

---

## Testing

Send a test message as Maya in the chat → you should get a push notification within a couple seconds. If it doesn't arrive:

- Check Edge Function logs: Dashboard → Edge Functions → `chat-notify` → Logs
- Make sure `NTFY_TOPIC` matches what you subscribed to in the app
- Make sure the webhook is enabled and pointing to the right URL
