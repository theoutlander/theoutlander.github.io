/**
 * Validates Maya/Dad passwords server-side.
 *
 * The passwords live ONLY in Supabase secrets (MAYA_CHAT_PIN, DAD_CHAT_PIN) — never
 * in the shipped website JS. The browser POSTs the typed password here and gets back
 * only a role ('maya' | 'dad'), or 401. The role tells the client which side of the
 * chat it is; the actual read/write gate is still Row Level Security on the table
 * (the client sends the password as the x-family-pin header, checked by Postgres).
 *
 * This function also rate-limits wrong guesses per IP. That protects the login path;
 * it does NOT protect a caller who bypasses this function and hits the database REST
 * API directly with the x-family-pin header. Making that impossible would require the
 * JWT-token variant (see git history of this file). For a low-value family chat, the
 * important win here is that the password is no longer readable from the public page.
 */

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
	const row = failByIp.get(ip);
	if (!row || now - row.since > WINDOW_MS) return false;
	return row.count >= MAX_FAILS;
}

function recordFail(ip: string) {
	const now = Date.now();
	let row = failByIp.get(ip);
	if (!row || now - row.since > WINDOW_MS) row = { count: 0, since: now };
	row.count += 1;
	failByIp.set(ip, row);
}

function clearFails(ip: string) {
	failByIp.delete(ip);
}

function roleForPin(
	pin: string,
	mayaPin: string | undefined,
	dadPin: string | undefined
): 'maya' | 'dad' | null {
	if (!pin) return null;
	if (mayaPin && pin === mayaPin) return 'maya';
	if (dadPin && pin === dadPin) return 'dad';
	return null;
}

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
	if (req.method !== 'POST') return corsJson({ error: 'method_not_allowed' }, 405);

	const ip = clientIp(req);
	if (rateLimited(ip)) return corsJson({ error: 'too_many_attempts' }, 429);

	let pin = '';
	try {
		const body = await req.json();
		pin = String(body?.pin ?? '').trim();
	} catch {
		return corsJson({ error: 'invalid_body' }, 400);
	}

	const role = roleForPin(
		pin,
		Deno.env.get('MAYA_CHAT_PIN'),
		Deno.env.get('DAD_CHAT_PIN')
	);

	if (!role) {
		recordFail(ip);
		return corsJson({ error: 'wrong_password' }, 401);
	}

	clearFails(ip);
	return corsJson({ role });
});
