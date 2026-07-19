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
