/**
 * Client helper for Maya's Game Lab Worker (projects/maya/api).
 *
 *   uploadImage(blob)                 -> public .jpg URL, or null on failure
 *   emailDad({ subject, text, html }) -> true if sent, false on failure
 *
 * Replaces the old bytebin.lucko.me image host and the client-side EmailJS send. Both games
 * (index.html doodle, skyline-builder) import this instead of talking to those services directly.
 *
 * Base URL: same-origin ('') by default — the target state is maya.karnik.io/api/*. Before that
 * route is wired, set `globalThis.MAYA_API_BASE = 'https://maya-api.<account>.workers.dev'` (e.g.
 * inline in the page) and this helper will use it.
 *
 * Both calls swallow their own errors and return a falsy value so callers degrade gracefully — a
 * dead network must never throw into Maya's game loop.
 */

export function apiBase() {
  return globalThis.MAYA_API_BASE ?? '';
}

export async function uploadImage(blob) {
  try {
    const res = await fetch(`${apiBase()}/api/upload`, {
      method: 'POST',
      headers: { 'content-type': blob.type || 'image/jpeg' },
      body: blob,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data.url === 'string' ? data.url : null;
  } catch (e) {
    console.log('maya-api upload failed', e);
    return null;
  }
}

export async function emailDad({ subject, text, html } = {}) {
  try {
    const res = await fetch(`${apiBase()}/api/email`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subject, text, html }),
    });
    return res.ok;
  } catch (e) {
    console.log('maya-api email failed', e);
    return false;
  }
}

// ---- Favorites / recently-played sync (D1) ----------------------------------
// localStorage stays primary; these layer a cross-device merge on top, gated by the family PIN.

const arr = (v) => (Array.isArray(v) ? v : []);

// Dedupe-union preserving `a` order first, then `b`'s extras, up to `cap` items.
function unionCap(a, b, cap) {
  const out = [];
  for (const x of [...arr(a), ...arr(b)]) {
    if (!out.includes(x)) out.push(x);
    if (out.length >= cap) break;
  }
  return out;
}

/** Pure merge of local and remote prefs. Favorites union (nothing lost across devices);
 *  recents local-first (the device just used), capped at 6. */
export function mergePrefs(local, remote) {
  const l = local || {};
  const r = remote || {};
  return {
    favs: unionCap(l.favs, r.favs, 100),
    recent: unionCap(l.recent, r.recent, 6),
  };
}

/** GET the signed-in identity's prefs from D1, or null on any failure / no PIN. */
export async function fetchPrefs(pin) {
  if (!pin) return null;
  try {
    const res = await fetch(`${apiBase()}/api/prefs`, { headers: { 'x-family-pin': pin } });
    if (!res.ok) return null;
    const d = await res.json();
    return { favs: arr(d.favs), recent: arr(d.recent) };
  } catch (e) {
    console.log('maya-api prefs get failed', e);
    return null;
  }
}

/** PUT prefs for the signed-in identity. Returns true on success; never throws. */
export async function savePrefs(pin, { favs, recent } = {}) {
  if (!pin) return false;
  try {
    const res = await fetch(`${apiBase()}/api/prefs`, {
      method: 'PUT',
      headers: { 'x-family-pin': pin, 'content-type': 'application/json' },
      body: JSON.stringify({ favs: arr(favs), recent: arr(recent) }),
    });
    return res.ok;
  } catch (e) {
    console.log('maya-api prefs put failed', e);
    return false;
  }
}
