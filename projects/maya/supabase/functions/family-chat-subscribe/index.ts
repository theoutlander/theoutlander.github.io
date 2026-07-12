/**
 * Registers a device for web-push notifications.
 *
 * The browser POSTs { pin, subscription } after the user grants notification
 * permission. We validate the password server-side (same secrets as the chat
 * login), derive the role from it, and upsert the PushSubscription into
 * maya_push_subs using the service role — so push endpoints are never exposed to
 * the public anon key. When Dad later sends a chat message, chat-notify reads
 * these rows to push "Dad sent you a message" to Maya's device.
 */

const cors = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...cors, 'Content-Type': 'application/json' },
	});
}

function roleForPin(pin: string): 'maya' | 'dad' | null {
	if (!pin) return null;
	if (pin === Deno.env.get('MAYA_CHAT_PIN')) return 'maya';
	if (pin === Deno.env.get('DAD_CHAT_PIN')) return 'dad';
	return null;
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
	if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

	let body: {
		pin?: string;
		subscription?: {
			endpoint?: string;
			keys?: { p256dh?: string; auth?: string };
		};
	};
	try {
		body = await req.json();
	} catch {
		return json({ error: 'invalid_body' }, 400);
	}

	const role = roleForPin(String(body?.pin ?? '').trim());
	if (!role) return json({ error: 'wrong_password' }, 401);

	const sub = body.subscription;
	const endpoint = sub?.endpoint;
	const p256dh = sub?.keys?.p256dh;
	const auth = sub?.keys?.auth;
	if (!endpoint || !p256dh || !auth) {
		return json({ error: 'invalid_subscription' }, 400);
	}

	const supabaseUrl = Deno.env.get('SUPABASE_URL');
	const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
	if (!supabaseUrl || !serviceKey) return json({ error: 'server_error' }, 500);

	// Upsert on endpoint — a device re-subscribing just refreshes its keys/role.
	const res = await fetch(
		`${supabaseUrl}/rest/v1/maya_push_subs?on_conflict=endpoint`,
		{
			method: 'POST',
			headers: {
				apikey: serviceKey,
				Authorization: `Bearer ${serviceKey}`,
				'Content-Type': 'application/json',
				Prefer: 'resolution=merge-duplicates,return=minimal',
			},
			body: JSON.stringify({
				role,
				endpoint,
				p256dh,
				auth,
				user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
			}),
		}
	);

	if (!res.ok) {
		console.error('subscribe upsert failed', res.status, await res.text());
		return json({ error: 'save_failed' }, 502);
	}

	return json({ ok: true, role });
});
