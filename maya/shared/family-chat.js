/**
 * Family chat for Maya's Game Lab — Supabase Realtime (no Edge Function).
 * PINs must match maya/sql/family-chat-dual-pin.sql in Supabase.
 * See maya/docs/family-chat-setup.md
 */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.8/+esm';
import { CHAT_CFG, CHAT_TABLE, CHAT_SESSION_KEY } from './family-chat-config.js';

// Connection config now lives in family-chat-config.js so the widget-free poster
// (family-post.js) can share it without importing this module (which auto-mounts
// the whole chat widget). The passwords are NOT in either file — they live only in
// Supabase secrets (MAYA_CHAT_PIN / DAD_CHAT_PIN); family-chat-auth validates a
// typed password and returns just the role.

const SESSION_KEY = CHAT_SESSION_KEY;
const MAX_BODY = 500;
const MAX_MESSAGES = 120;

function chatReady() {
	return Boolean(
		CHAT_CFG.supabaseUrl && CHAT_CFG.supabaseAnonKey && CHAT_CFG.authUrl
	);
}

// Ask the server whether this password is valid and, if so, which side of the
// chat it is. Returns 'maya' | 'dad' on success, or a reason string:
// 'wrong' (bad password), 'throttled' (too many tries), 'offline' (network).
async function authenticatePin(pin) {
	try {
		const res = await fetch(CHAT_CFG.authUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				apikey: CHAT_CFG.supabaseAnonKey,
			},
			body: JSON.stringify({ pin: String(pin || '').trim() }),
		});
		if (res.ok) {
			const data = await res.json();
			return data.role === 'maya' || data.role === 'dad'
				? data.role
				: 'wrong';
		}
		if (res.status === 429) return 'throttled';
		return 'wrong';
	} catch {
		return 'offline';
	}
}

function loadSession() {
	try {
		const raw = localStorage.getItem(SESSION_KEY);
		if (!raw) return null;
		const s = JSON.parse(raw);
		if (!s?.pinOk || !s?.role || !s?.pin) return null;
		// No client-side re-validation of the PIN — the passwords aren't in this
		// file to compare against anymore. This is also what lets an already-signed-in
		// device (Maya's iPad) keep working with no re-entry after this change: the
		// stored session is trusted here, and Row Level Security is still the real
		// gate on every read/write (it checks the x-family-pin header server-side).
		return s;
	} catch {
		return null;
	}
}

/* Every storage access here is guarded. On Maya's iPad, *touching* localStorage or
   sessionStorage throws when site data is blocked — it doesn't return null, it throws — and an
   unguarded call aborts the whole script. loadSession() was already guarded; these were not, so
   signing in or out would have thrown and taken the chat down. */
function saveSession(session) {
	try {
		localStorage.setItem(
			SESSION_KEY,
			JSON.stringify({ ...session, at: Date.now() })
		);
	} catch (e) {
		// Storage blocked: she stays signed in for this page load, just not across reloads.
	}
}

function clearSession() {
	try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
	try { localStorage.removeItem('maya_family_chat_v2'); } catch (e) {}
	try { sessionStorage.removeItem('maya_family_chat_v1'); } catch (e) {}
}

function supabaseForPin(pin) {
	return createClient(CHAT_CFG.supabaseUrl, CHAT_CFG.supabaseAnonKey, {
		global: { headers: { 'x-family-pin': pin } },
	});
}

// ===== Web push =====
// VAPID public key — safe to ship (the private half is a Supabase secret).
const VAPID_PUBLIC_KEY =
	'BNgNacfYj1LYGNiItRmXBWGoDrDXKy8nmnX66KOu24d-WjobMFNYTEMbaj9ltm64SBa9wQD5YCymdUSeqy6VXME';
const SUBSCRIBE_URL =
	'https://mqmkktxaqmgqbdogozuu.supabase.co/functions/v1/family-chat-subscribe';

function pushSupported() {
	return (
		typeof navigator !== 'undefined' &&
		'serviceWorker' in navigator &&
		'PushManager' in window &&
		'Notification' in window
	);
}

function urlBase64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64);
	const out = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
	return out;
}

// 'unsupported' | 'denied' | 'on' (already subscribed) | 'off' (can enable)
async function pushState() {
	if (!pushSupported()) return 'unsupported';
	if (Notification.permission === 'denied') return 'denied';
	try {
		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.getSubscription();
		return sub ? 'on' : 'off';
	} catch {
		return 'off';
	}
}

// Request permission (must be called from a user gesture on iOS), subscribe, and
// register the device with the server. Returns true if notifications are now on.
async function enablePush(pin) {
	if (!pushSupported()) return false;
	const perm = await Notification.requestPermission();
	if (perm !== 'granted') return false;

	const reg = await navigator.serviceWorker.ready;
	let sub = await reg.pushManager.getSubscription();
	if (!sub) {
		sub = await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
		});
	}

	const res = await fetch(SUBSCRIBE_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			apikey: CHAT_CFG.supabaseAnonKey,
		},
		body: JSON.stringify({ pin, subscription: sub.toJSON() }),
	});
	return res.ok;
}

function fmtTime(iso) {
	try {
		const d = new Date(iso);
		return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
	} catch {
		return '';
	}
}

function escapeHtml(s) {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

// Escape FIRST, then linkify the escaped text. Because quotes are already &quot;,
// a URL can't break out of the href/src attribute. Only https?:// is wrapped —
// no javascript:/data: reaches an attribute.
function isImageUrl(u) {
	return (
		/^https:\/\/bytebin\.lucko\.me\//.test(u) || // bytebin has no file extension
		/\.(png|jpe?g|gif|webp)(\?|$)/i.test(u)
	);
}
function renderBody(raw) {
	const esc = escapeHtml(raw);
	return esc.replace(/https?:\/\/[^\s<]+/g, (url) => {
		if (isImageUrl(url))
			return `<a href="${url}" target="_blank" rel="noopener noreferrer"><img class="chat-img" src="${url}" alt="picture" loading="lazy"></a>`;
		return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
	});
}

function playPing() {
	try {
		const ctx = new (window.AudioContext || window.webkitAudioContext)();
		const o = ctx.createOscillator();
		const g = ctx.createGain();
		o.connect(g);
		g.connect(ctx.destination);
		o.frequency.value = 660;
		g.gain.setValueAtTime(0.08, ctx.currentTime);
		g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
		o.start(ctx.currentTime);
		o.stop(ctx.currentTime + 0.2);
	} catch {
		/* optional */
	}
}

/** @type {((fromOther: boolean) => void) | null} */
let onIncomingMessage = null;

export function initFamilyChat(root, hooks = {}) {
	if (!root) return;

	if (!chatReady()) {
		root.innerHTML =
			'<p class="chat-hint">💬 Chat is almost ready — Dad is finishing setup!</p>';
		return;
	}

	let session = loadSession();
	let client = null;
	let channel = null;
	let myRole = session?.role || null;

	function render() {
		if (!session) {
			root.innerHTML = `
        <div class="chat-lock">
          <p class="chat-hint">Enter your password 💕</p>
          <input type="password" id="chat-pin" class="chat-pin-in" placeholder="Password" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="128" />
          <button type="button" id="chat-pin-btn" class="chat-send-btn">Open chat 💬</button>
          <p id="chat-pin-err" class="chat-err" hidden></p>
        </div>`;
			const inp = root.querySelector('#chat-pin');
			const btn = root.querySelector('#chat-pin-btn');
			const err = root.querySelector('#chat-pin-err');
			let unlocking = false;
			async function tryUnlock() {
				if (unlocking) return;
				const val = inp.value.trim();
				if (!val) return;
				unlocking = true;
				btn.disabled = true;
				const prevLabel = btn.textContent;
				btn.textContent = 'Opening…';
				err.hidden = true;

				// The server holds the passwords now, so validation is a round-trip.
				const role = await authenticatePin(val);

				unlocking = false;
				btn.disabled = false;
				btn.textContent = prevLabel;

				if (role !== 'maya' && role !== 'dad') {
					err.hidden = false;
					err.textContent =
						role === 'throttled'
							? 'Too many tries — wait a few minutes and try again.'
							: role === 'offline'
								? 'Can’t reach the chat right now — check your connection.'
								: 'Wrong password — try again';
					root.querySelector('.chat-lock')?.classList.add('shake');
					setTimeout(
						() => root.querySelector('.chat-lock')?.classList.remove('shake'),
						400
					);
					return;
				}

				inp.value = '';
				session = { pinOk: true, role, pin: val };
				myRole = session.role;
				saveSession(session);
				startChat();
			}
			btn.addEventListener('click', tryUnlock);
			inp.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') tryUnlock();
			});
			return;
		}
		startChat();
	}

	function startChat() {
		myRole = session.role;
		client = supabaseForPin(session.pin);

		root.innerHTML = `
      <div class="chat-head">
        <span class="chat-you"><strong>${myRole === 'maya' ? 'Maya 💕' : 'Dad'}</strong></span>
        <button type="button" id="chat-bell-btn" class="chat-link-btn" hidden>🔔 Notify me</button>
        <button type="button" id="chat-lock-btn" class="chat-link-btn">Lock</button>
      </div>
      <div id="chat-log" class="chat-log" aria-live="polite"></div>
      <form id="chat-form" class="chat-form">
        <input type="text" id="chat-input" class="chat-text-in" placeholder="${myRole === 'maya' ? 'Tell Dad anything — even a game idea! 💕' : 'Reply to Maya…'}" maxlength="${MAX_BODY}" autocomplete="off" />
        <button type="submit" class="chat-send-btn">Send</button>
      </form>`;

		const log = root.querySelector('#chat-log');
		const form = root.querySelector('#chat-form');
		const input = root.querySelector('#chat-input');

		root.querySelector('#chat-lock-btn').addEventListener('click', () => {
			session = null;
			clearSession();
			teardown();
			render();
		});

		// Notification bell: shown only when push is supported and not yet enabled.
		// Enabling MUST happen from this tap (iOS requires a user gesture), and on
		// iOS only works once the Lab is added to the Home Screen.
		const bell = root.querySelector('#chat-bell-btn');
		(async () => {
			if ((await pushState()) === 'off') bell.hidden = false;
		})();
		bell.addEventListener('click', async () => {
			bell.disabled = true;
			const prev = bell.textContent;
			bell.textContent = '…';
			const ok = await enablePush(session.pin).catch(() => false);
			bell.disabled = false;
			if (ok) {
				bell.hidden = true;
			} else {
				bell.textContent = Notification?.permission === 'denied' ? '🔕 Blocked' : prev;
				if (Notification?.permission !== 'denied') bell.textContent = prev;
			}
		});

		const messages = new Map();

		function scrollLog() {
			log.scrollTop = log.scrollHeight;
		}

		function paint() {
			const list = [...messages.values()].sort(
				(a, b) => new Date(a.created_at) - new Date(b.created_at)
			);
			if (!list.length) {
				log.innerHTML =
					'<p class="chat-empty">No messages yet — say hi! 👋</p>';
				return;
			}
			log.innerHTML = list
				.map((m) => {
					const mine = m.author === myRole;
					const who = m.author === 'maya' ? 'Maya 💕' : 'Dad';
					const local = String(m.id || '').startsWith('local-');
					return `<div class="chat-bubble ${mine ? 'mine' : 'theirs'} ${m.author}${local ? ' local-note' : ''}">
            <span class="chat-who">${who}</span>
            <span class="chat-body">${renderBody(m.body)}</span>
            <span class="chat-time">${fmtTime(m.created_at)}</span>
          </div>`;
				})
				.join('');
			scrollLog();
		}

		function addRow(row, notify) {
			if (!row?.id) return;
			const isNew = !messages.has(row.id);
			messages.set(row.id, row);
			if (messages.size > MAX_MESSAGES) {
				const oldest = [...messages.values()].sort(
					(a, b) => new Date(a.created_at) - new Date(b.created_at)
				)[0];
				if (oldest) messages.delete(oldest.id);
			}
			paint();
			if (notify && isNew && row.author !== myRole) {
				playPing();
				if (onIncomingMessage) onIncomingMessage(true);
				else if (typeof window.showToast === 'function') {
					window.showToast(
						row.author === 'maya' ? '💕 New message from Maya!' : '💬 Dad replied!'
					);
				}
			}
		}

		async function loadHistory() {
			log.innerHTML = '<p class="chat-empty">Loading…</p>';
			// Newest-first + limit, so the cap drops the OLDEST messages. Ascending +
			// limit would have pinned the chat to the 120 oldest messages and hidden
			// every new one the moment the history outgrew MAX_MESSAGES. paint() sorts
			// back into chronological order for display.
			const { data, error } = await client
				.from(CHAT_TABLE)
				.select('id, author, body, created_at')
				.order('created_at', { ascending: false })
				.limit(MAX_MESSAGES);
			if (error) {
				log.innerHTML =
					'<p class="chat-err">Could not load chat. Check password setup.</p>';
				console.warn('chat load', error);
				return;
			}
			messages.clear();
			(data || []).forEach((r) => messages.set(r.id, r));
			paint();
		}

		channel = client
			.channel('maya-family-chat')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'maya_chat_messages',
				},
				(payload) => addRow(payload.new, true)
			)
			.subscribe();

		loadHistory();

		// The chat log shows ONLY real messages from the database. The portal's
		// decorative "Dad" bubbles (6-second welcome, tap-title-5x easter egg) are
		// canned client-side strings — injecting them here made them look like Dad
		// was live-chatting when he wasn't. They still show as the corner peek
		// bubble (that's clearly a UI flourish); they must never enter the chat.
		if (hooks.setAppendDadNote) {
			hooks.setAppendDadNote(null);
		}

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const body = input.value.trim();
			if (!body) return;
			const btn = form.querySelector('button[type="submit"]');
			btn.disabled = true;
			const { data, error } = await client
				.from(CHAT_TABLE)
				.insert({ author: myRole, body })
				.select('id, author, body, created_at')
				.single();
			btn.disabled = false;
			if (error) {
				if (typeof window.showToast === 'function') {
					window.showToast('Could not send — try again');
				}
				console.warn('chat send', error);
				return;
			}
			input.value = '';
			addRow(data, false);
		});
	}

	function teardown() {
		if (channel && client) {
			client.removeChannel(channel);
		}
		channel = null;
		client = null;
		if (hooks.setAppendDadNote) hooks.setAppendDadNote(null);
	}

	render();
}

function isNarrowMobile() {
	return window.matchMedia('(max-width: 640px)').matches;
}

function initChatWidget() {
	const widget = document.getElementById('family-chat-widget');
	const backdrop = document.getElementById('family-chat-backdrop');
	const fab = document.getElementById('family-chat-fab');
	const panel = document.getElementById('family-chat-panel');
	const closeBtn = document.getElementById('family-chat-close');
	const badge = document.getElementById('family-chat-badge');
	const root = document.getElementById('family-chat-root');
	const peek = document.getElementById('dad-peek');
	const peekText = document.getElementById('dad-peek-text');
	const peekClose = document.getElementById('dad-peek-close');
	const peekReply = document.getElementById('dad-peek-reply');
	if (!widget || !fab || !panel || !root) return;

	let unread = 0;
	// Always start closed — never auto-reopen on page load / game navigation.
	// Maya must tap the chat button to open it.
	let panelOpen = false;
	try { sessionStorage.removeItem('maya_chat_panel_open'); } catch (e) {}
	let scrollLockY = 0;
	let appendDadNote = null;
	let peekTimer = null;
	let pendingDadNote = null;

	function hidePeek() {
		if (peek) peek.hidden = true;
		clearTimeout(peekTimer);
		peekTimer = null;
	}

	function showPeek(msg) {
		if (!peek || !peekText) return;
		peekText.textContent = msg;
		peek.hidden = false;
		fab.classList.add('pulse');
		clearTimeout(peekTimer);
		peekTimer = setTimeout(hidePeek, 16000);
	}

	function showDadNote(msg) {
		const text = String(msg || '').trim();
		if (!text) return;
		if (panelOpen && appendDadNote) {
			appendDadNote(text);
			hidePeek();
			return;
		}
		if (panelOpen) {
			pendingDadNote = text;
			return;
		}
		// Never pop a note while a game is open — stash it for when she's back in the Lab.
		if (document.body.classList.contains('maya-game-open')) {
			pendingDadNote = text;
			return;
		}
		showPeek(text);
	}

	function lockPageScroll() {
		if (!isNarrowMobile()) return;
		scrollLockY = window.scrollY;
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollLockY}px`;
		document.body.style.left = '0';
		document.body.style.right = '0';
		document.body.style.overflow = 'hidden';
	}

	function unlockPageScroll() {
		if (!document.body.style.position) return;
		document.body.style.position = '';
		document.body.style.top = '';
		document.body.style.left = '';
		document.body.style.right = '';
		document.body.style.overflow = '';
		window.scrollTo(0, scrollLockY);
	}

	function adjustPanelForKeyboard() {
		const vv = window.visualViewport;
		if (!panelOpen || !vv || !isNarrowMobile()) {
			panel.classList.remove('fcw-kb-adjust');
			panel.style.top = '';
			panel.style.height = '';
			return;
		}
		const gap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
		if (gap > 50) {
			panel.classList.add('fcw-kb-adjust');
			panel.style.top = `${vv.offsetTop}px`;
			panel.style.height = `${vv.height}px`;
		} else {
			panel.classList.remove('fcw-kb-adjust');
			panel.style.top = '';
			panel.style.height = '';
		}
	}

	function setPanelOpen(open) {
		panelOpen = open;
		panel.classList.toggle('open', open);
		widget.classList.toggle('fcw-panel-open', open);
		if (backdrop) {
			backdrop.classList.toggle('open', open);
			backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
		}
		fab.setAttribute('aria-expanded', open ? 'true' : 'false');
		// setPanelOpen() runs at init, and on Maya's iPad *touching* sessionStorage throws when
		// site data is blocked — which aborted this whole script and took the chat widget with it.
		// Same defect that made Dust Chasers unplayable. Remembering the panel state is a nicety;
		// losing the chat is not.
		try { sessionStorage.setItem('maya_chat_panel_open', open ? '1' : '0'); } catch (e) {}
		if (open) {
			hidePeek();
			unread = 0;
			if (badge) {
				badge.hidden = true;
				badge.textContent = '';
			}
			fab.classList.remove('pulse');
			lockPageScroll();
			adjustPanelForKeyboard();
			if (pendingDadNote && appendDadNote) {
				appendDadNote(pendingDadNote);
				pendingDadNote = null;
			}
			const input = root.querySelector('#chat-input');
			if (input) {
				setTimeout(() => {
					input.focus({ preventScroll: true });
					try {
						input.scrollIntoView({ block: 'end', behavior: 'smooth' });
					} catch {
						/* ignore */
					}
				}, 350);
			}
		} else {
			unlockPageScroll();
			panel.classList.remove('fcw-kb-adjust');
			panel.style.top = '';
			panel.style.height = '';
			fab.focus({ preventScroll: true });
		}
	}

	onIncomingMessage = (fromOther) => {
		if (!fromOther || panelOpen) return;
		unread += 1;
		if (badge) {
			badge.hidden = false;
			badge.textContent = unread > 9 ? '9+' : String(unread);
		}
		fab.classList.add('pulse');
		if (typeof window.showToast === 'function') {
			window.showToast('💬 New chat message!');
		}
	};

	function togglePanel(e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		setPanelOpen(!panelOpen);
	}

	// A tap must ALWAYS open the chat. Two things used to swallow it:
	// a finger drifting off the 56px button between press and release (pointerup
	// then lands on another element), and pointercancel firing when the browser
	// guesses the gesture is a scroll. So: capture the pointer to keep pointerup
	// on the button, and keep a click fallback for whatever still gets cancelled.
	// toggleOnce() dedupes the two paths — a tap that fires both must not toggle twice.
	const TOGGLE_DEDUPE_MS = 400;
	let fabPointerDown = false;
	let lastToggleAt = 0;

	function toggleOnce(e) {
		const now = Date.now();
		if (now - lastToggleAt < TOGGLE_DEDUPE_MS) return;
		lastToggleAt = now;
		togglePanel(e);
	}

	fab.addEventListener(
		'pointerdown',
		(e) => {
			fabPointerDown = true;
			try {
				fab.setPointerCapture(e.pointerId);
			} catch (err) {}
			if (e.pointerType !== 'mouse') e.preventDefault();
		},
		{ passive: false }
	);
	fab.addEventListener('pointerup', (e) => {
		if (!fabPointerDown) return;
		fabPointerDown = false;
		try {
			fab.releasePointerCapture(e.pointerId);
		} catch (err) {}
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		toggleOnce(e);
	});
	fab.addEventListener('pointercancel', () => {
		fabPointerDown = false;
	});
	fab.addEventListener('click', (e) => {
		toggleOnce(e);
	});

	function bindTap(el, handler) {
		if (!el) return;
		let down = false;
		el.addEventListener(
			'pointerdown',
			(e) => {
				down = true;
				if (e.pointerType !== 'mouse') e.preventDefault();
			},
			{ passive: false }
		);
		el.addEventListener('pointerup', (e) => {
			if (!down) return;
			down = false;
			if (e.pointerType === 'mouse' && e.button !== 0) return;
			handler(e);
		});
		el.addEventListener('pointercancel', () => {
			down = false;
		});
	}

	bindTap(closeBtn, () => setPanelOpen(false));
	if (backdrop) bindTap(backdrop, () => setPanelOpen(false));

	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && panelOpen) setPanelOpen(false);
	});

	if (window.visualViewport) {
		window.visualViewport.addEventListener('resize', adjustPanelForKeyboard);
		window.visualViewport.addEventListener('scroll', adjustPanelForKeyboard);
	}

	root.addEventListener(
		'focusin',
		(e) => {
			if (!panelOpen) return;
			const t = e.target;
			if (
				t &&
				(t.id === 'chat-input' || t.id === 'chat-pin' || t.classList?.contains('chat-text-in'))
			) {
				setTimeout(adjustPanelForKeyboard, 100);
			}
		},
		true
	);

	bindTap(peekClose, hidePeek);
	bindTap(peekReply, () => setPanelOpen(true));
	if (peek) {
		peek.addEventListener('click', (e) => {
			if (e.target.closest('.dad-peek-close')) return;
			setPanelOpen(true);
		});
	}

	// Opening from a push notification: the SW appends ?openChat=1 (cold open) and
	// posts 'maya:open-chat' to an already-running Lab (warm focus). Both open chat.
	try {
		if (new URLSearchParams(location.search).get('openChat') === '1') {
			setPanelOpen(true);
		}
	} catch (e) {}
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.addEventListener('message', (e) => {
			if (e.data && e.data.type === 'maya:open-chat') setPanelOpen(true);
		});
	}

	window.mayaChat = {
		showDadNote,
		openPanel: () => setPanelOpen(true),
		closePanel: () => setPanelOpen(false),
	};

	setPanelOpen(panelOpen);
	initFamilyChat(root, {
		setAppendDadNote(fn) {
			appendDadNote = fn;
			if (fn && pendingDadNote) {
				fn(pendingDadNote);
				pendingDadNote = null;
			}
		},
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initChatWidget);
} else {
	initChatWidget();
}
