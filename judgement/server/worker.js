/* Judgement multiplayer Worker.
   - Serves the static client (index.html, game/*) via the ASSETS binding.
   - /ws?code=CODE  -> upgrades to the Room Durable Object for that invite code.
   - /play/CODE     -> serves index.html (client reads the code from the path).
   - /api/leaderboard, /api/history -> D1-backed standings.
   Assets are configured with not_found_handling="none" so unmatched paths run
   THIS script (keeps /ws and /api from being swallowed by the asset server). */
export { Room } from './room.js';

const CODE_RE = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{3,8}$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // --- WebSocket -> Room DO ---
    if (path === '/ws') {
      const code = (url.searchParams.get('code') || '').toUpperCase();
      if (!CODE_RE.test(code)) return new Response('bad code', { status: 400 });
      const id = env.ROOMS.idFromName(code);
      const stub = env.ROOMS.get(id);
      return stub.fetch(request);
    }

    // --- REST API (D1) ---
    if (path.startsWith('/api/')) return handleApi(path, env);

    // --- /play/CODE deep link -> the SPA shell ---
    if (path === '/play' || path.startsWith('/play/')) {
      return env.ASSETS.fetch(new URL('/index.html', url.origin));
    }

    // --- everything else: static assets ---
    const res = await env.ASSETS.fetch(request);
    if (res.status === 404) {
      // unknown path with no extension -> SPA shell
      if (!path.split('/').pop().includes('.')) {
        return env.ASSETS.fetch(new URL('/index.html', url.origin));
      }
    }
    return res;
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'cache-control': 'no-store' },
  });
}

async function handleApi(path, env) {
  if (!env.DB) return json({ error: 'no database bound' }, 503);
  try {
    if (path === '/api/leaderboard') {
      const { results } = await env.DB.prepare(
        `SELECT name, MAX(color) color, MAX(avatar) avatar,
                COUNT(*) games,
                SUM(CASE WHEN place = 1 THEN 1 ELSE 0 END) wins,
                SUM(final_score) points,
                SUM(bids_hit) bidsHit, SUM(bids_total) bidsTotal
         FROM match_players
         WHERE is_bot = 0
         GROUP BY name
         ORDER BY wins DESC, points DESC`
      ).all();
      return json({ board: results || [] });
    }
    if (path === '/api/history') {
      const matches = await env.DB.prepare(
        `SELECT id, code, ended_at FROM matches ORDER BY ended_at DESC LIMIT 25`
      ).all();
      const rows = matches.results || [];
      const out = [];
      for (const m of rows) {
        const mp = await env.DB.prepare(
          `SELECT name, color, avatar, final_score score, place, bids_hit bidsHit, bids_total bidsTotal
           FROM match_players WHERE match_id = ? ORDER BY place ASC`
        ).bind(m.id).all();
        out.push({
          date: m.ended_at ? new Date(m.ended_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
          code: m.code, players: mp.results || [],
        });
      }
      return json({ history: out });
    }
    return json({ error: 'not found' }, 404);
  } catch (e) {
    return json({ error: String(e && e.message || e) }, 500);
  }
}
