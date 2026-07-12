/**
 * chat-notify — Supabase Edge Function
 *
 * Triggered by a Database Webhook on INSERT to maya_chat_messages.
 * When Maya sends a message, fires a push notification to Dad via ntfy.sh.
 *
 * Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
 *   NTFY_TOPIC   — a RANDOM private ntfy.sh topic (the topic name IS the secret;
 *                  generate with `openssl rand -hex 8`, never derive it from a name/PIN)
 *
 * Optional:
 *   WEBHOOK_SECRET — if set, validates the x-webhook-secret header from Supabase
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const NTFY_TOPIC = Deno.env.get('NTFY_TOPIC');
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET');

serve(async (req) => {
  // Validate secret if configured
  if (WEBHOOK_SECRET) {
    const incoming = req.headers.get('x-webhook-secret');
    if (incoming !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  if (!NTFY_TOPIC) {
    console.error('NTFY_TOPIC env var not set');
    return new Response('misconfigured', { status: 500 });
  }

  let payload: { type?: string; record?: { author?: string; body?: string } };
  try {
    payload = await req.json();
  } catch {
    return new Response('bad request', { status: 400 });
  }

  // Only notify on Maya's messages
  if (payload.record?.author !== 'maya') {
    return new Response('ok', { status: 200 });
  }

  const messageBody = payload.record.body?.trim() || '(no message)';

  // Publish via ntfy's JSON API, NOT its header API. HTTP header values must be
  // Latin-1, so putting the 💕 in a `Title:` header made fetch() throw a TypeError
  // before it ever hit the network — every push failed. In the JSON body, the
  // emoji is just UTF-8 text and works fine.
  try {
    const res = await fetch('https://ntfy.sh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: NTFY_TOPIC,
        title: 'Maya sent you a message 💕',
        message: messageBody,
        priority: 4, // high
        tags: ['heart'],
      }),
    });
    if (!res.ok) {
      console.error('ntfy push rejected:', res.status, await res.text());
      return new Response('notify failed', { status: 502 });
    }
  } catch (err) {
    console.error('ntfy push failed:', err);
    return new Response('notify failed', { status: 502 });
  }

  return new Response('ok', { status: 200 });
});
