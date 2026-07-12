/**
 * chat-notify — Supabase Edge Function
 *
 * Fired by a database trigger (net.http_post) on every INSERT to
 * maya_chat_messages. It notifies the OTHER person:
 *   - Maya sends → Dad gets an ntfy.sh push (his phone), and a web push if he
 *     ever subscribed a device.
 *   - Dad sends  → Maya gets a Web Push on her iPad ("Dad sent you a message 💕"),
 *     the whole point of the web-push feature. iOS only delivers it once the Lab
 *     is on her Home Screen.
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   NTFY_TOPIC        — random private ntfy.sh topic (Dad's phone)
 *   WEBHOOK_SECRET    — shared secret the DB trigger sends as x-webhook-secret
 *   VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT — web push credentials
 * Auto-injected: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import webpush from 'npm:web-push@3.6.7';

const NTFY_TOPIC = Deno.env.get('NTFY_TOPIC');
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET');
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY');
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY');
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:nick@karnik.io';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (VAPID_PUBLIC && VAPID_PRIVATE) {
	webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

// Read the target role's push subscriptions (service role — bypasses RLS).
async function getSubs(role: 'maya' | 'dad') {
	if (!SUPABASE_URL || !SERVICE_KEY) return [];
	const res = await fetch(
		`${SUPABASE_URL}/rest/v1/maya_push_subs?role=eq.${role}&select=id,endpoint,p256dh,auth`,
		{ headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
	);
	if (!res.ok) return [];
	return await res.json();
}

// Delete a dead subscription (device unsubscribed / endpoint expired: 404/410).
async function deleteSub(id: number) {
	if (!SUPABASE_URL || !SERVICE_KEY) return;
	await fetch(`${SUPABASE_URL}/rest/v1/maya_push_subs?id=eq.${id}`, {
		method: 'DELETE',
		headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
	});
}

async function sendWebPush(role: 'maya' | 'dad', title: string, body: string) {
	if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;
	const subs = await getSubs(role);
	const payload = JSON.stringify({ title, body, url: 'index.html?openChat=1' });
	await Promise.all(
		subs.map(async (s: { id: number; endpoint: string; p256dh: string; auth: string }) => {
			try {
				await webpush.sendNotification(
					{ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
					payload
				);
			} catch (err: unknown) {
				const code = (err as { statusCode?: number })?.statusCode;
				if (code === 404 || code === 410) await deleteSub(s.id);
				else console.error('web push failed', code, err);
			}
		})
	);
}

Deno.serve(async (req) => {
	if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
		return new Response('Unauthorized', { status: 401 });
	}

	let payload: { record?: { author?: string; body?: string } };
	try {
		payload = await req.json();
	} catch {
		return new Response('bad request', { status: 400 });
	}

	const author = payload.record?.author;
	if (author !== 'maya' && author !== 'dad') {
		return new Response('ok', { status: 200 });
	}
	const body = payload.record?.body?.trim() || '(no message)';
	const recipient: 'maya' | 'dad' = author === 'maya' ? 'dad' : 'maya';
	const title =
		author === 'maya' ? 'Maya sent you a message 💕' : 'Dad sent you a message 💕';

	// Web push to whoever should be notified (Maya when Dad writes; Dad too if subscribed).
	await sendWebPush(recipient, title, body);

	// Dad also gets ntfy on his phone when Maya writes (his primary channel).
	if (author === 'maya' && NTFY_TOPIC) {
		try {
			const res = await fetch('https://ntfy.sh', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					topic: NTFY_TOPIC,
					title,
					message: body,
					priority: 4,
					tags: ['heart'],
				}),
			});
			if (!res.ok) console.error('ntfy rejected', res.status, await res.text());
		} catch (err) {
			console.error('ntfy failed', err);
		}
	}

	return new Response('ok', { status: 200 });
});
