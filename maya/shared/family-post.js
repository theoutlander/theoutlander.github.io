/**
 * Post a message into the family chat AS MAYA, without mounting the chat widget.
 * Games call this to deliver something to Dad; the DB trigger on maya_chat_messages
 * (chat-notify Edge Function) pushes the notification to Dad for free.
 * Reuses Maya's same-origin chat session written by shared/family-chat.js.
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/+esm';
import { CHAT_CFG, CHAT_TABLE, CHAT_SESSION_KEY } from './family-chat-config.js';

// Guarded: touching localStorage THROWS on Maya's iPad when site data is blocked.
function loadMayaSession() {
	try {
		const raw = localStorage.getItem(CHAT_SESSION_KEY);
		if (!raw) return null;
		const s = JSON.parse(raw);
		if (!s || !s.pinOk || s.role !== 'maya' || !s.pin) return null;
		return s;
	} catch (e) {
		return null;
	}
}

export async function postCityToDad(body) {
	const s = loadMayaSession();
	if (!s) return { ok: false, reason: 'not-signed-in' };
	try {
		const client = createClient(CHAT_CFG.supabaseUrl, CHAT_CFG.supabaseAnonKey, {
			global: { headers: { 'x-family-pin': s.pin } },
		});
		const text = String(body || '').slice(0, 500); // chat MAX_BODY
		const { error } = await client
			.from(CHAT_TABLE)
			.insert({ author: 'maya', body: text });
		if (error) {
			console.warn('family-post insert', error);
			return { ok: false, reason: 'error' };
		}
		return { ok: true };
	} catch (e) {
		console.warn('family-post', e);
		return { ok: false, reason: 'error' };
	}
}
