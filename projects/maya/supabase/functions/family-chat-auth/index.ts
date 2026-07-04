/**
 * Validates Maya/Dad passwords server-side (secrets in Supabase, not in the website).
 * Returns a short-lived JWT so the browser never stores the password.
 */
import { create, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const cors = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 8;
const failByIp = new Map<string, { count: number; since: number }>();

function corsJson(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...cors, 'Content-Type': 'application/json' },
	});
}

function clientIp(req: Request) {
	return (
		req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		req.headers.get('cf-connecting-ip') ||
		'unknown'
	);
}

function rateLimited(ip: string) {
	const now = Date.now();
	let row = failByIp.get(ip);
	if (!row || now - row.since > WINDOW_MS) {
		row = { count: 0, since: now };
		failByIp.set(ip, row);
	}
	return row.count >= MAX_FAILS;
}

function recordFail(ip: string) {
	const now = Date.now();
	let row = failByIp.get(ip);
	if (!row || now - row.since > WINDOW_MS) {
		row = { count: 0, since: now };
	}
	row.count += 1;
	failByIp.set(ip, row);
}

function clearFails(ip: string) {
	failByIp.delete(ip);
}

function roleForPin(
	pin: string,
	body: { as?: string },
	mayaPin: string | undefined,
	dadPin: string | undefined,
	familyPin: string | undefined
): 'maya' | 'dad' | null {
	if (!pin) return null;
	if (mayaPin && pin === mayaPin) return 'maya';
	if (dadPin && pin === dadPin) return 'dad';
	// Easy mode: one shared passphrase; Dad uses bookmark with ?dad=1
	if (familyPin && pin === familyPin) {
		return body?.as === 'dad' ? 'dad' : 'maya';
	}
	return null;
}

async function signChatToken(chatRole: 'maya' | 'dad') {
	const secret = Deno.env.get('JWT_SECRET');
	if (!secret) throw new Error('JWT_SECRET not configured');

	const ref = Deno.env.get('SUPABASE_URL')?.match(
		/https:\/\/([^.]+)\.supabase\.co/
	)?.[1];

	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);

	return await create(
		{ alg: 'HS256', typ: 'JWT' },
		{
			iss: 'supabase',
			ref,
			role: 'authenticated',
			aud: 'authenticated',
			sub: `family-chat-${chatRole}`,
			chat_role: chatRole,
			iat: getNumericDate(0),
			exp: getNumericDate(
				chatRole === 'maya' ? 60 * 60 * 24 * 30 : 60 * 60 * 8
			),
		},
		key
	);
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response(null, { headers: cors });
	}
	if (req.method !== 'POST') {
		return corsJson({ error: 'method_not_allowed' }, 405);
	}

	const ip = clientIp(req);
	if (rateLimited(ip)) {
		return corsJson({ error: 'too_many_attempts' }, 429);
	}

	let pin = '';
	let body: { pin?: string; as?: string } = {};
	try {
		body = await req.json();
		pin = String(body?.pin ?? '').trim();
	} catch {
		return corsJson({ error: 'invalid_body' }, 400);
	}

	const mayaPin = Deno.env.get('MAYA_CHAT_PIN');
	const dadPin = Deno.env.get('DAD_CHAT_PIN');
	const familyPin = Deno.env.get('FAMILY_CHAT_PIN');
	const chatRole = roleForPin(pin, body, mayaPin, dadPin, familyPin);

	if (!chatRole) {
		recordFail(ip);
		return corsJson({ error: 'wrong_password' }, 401);
	}

	try {
		clearFails(ip);
		const access_token = await signChatToken(chatRole);
		return corsJson({ access_token, role: chatRole });
	} catch (e) {
		console.error('family-chat-auth', e);
		return corsJson({ error: 'server_error' }, 500);
	}
});
