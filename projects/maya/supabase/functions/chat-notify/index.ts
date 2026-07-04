/**
 * chat-notify — Supabase Edge Function
 *
 * Triggered by a Database Webhook on INSERT to maya_chat_messages.
 * When Maya sends a message, fires a push notification to Dad via ntfy.sh.
 *
 * Required env vars (set in Supabase Dashboard → Edge Functions → Secrets):
 *   NTFY_TOPIC   — your private ntfy.sh topic (e.g. "maya-chat-nick-2545")
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

  try {
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      headers: {
        Title: 'Maya sent you a message 💕',
        Priority: 'high',
        Tags: 'heart',
        'Content-Type': 'text/plain',
      },
      body: messageBody,
    });
  } catch (err) {
    console.error('ntfy push failed:', err);
    return new Response('notify failed', { status: 502 });
  }

  return new Response('ok', { status: 200 });
});
