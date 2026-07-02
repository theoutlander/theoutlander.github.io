# Judgment — multiplayer backend (Cloudflare)

Real-time multiplayer for the Judgment prototype, on Cloudflare's **free tier**.
The design/UI is unchanged; this wires a server-authoritative backend behind it.

## Architecture

```
Browser (index.html + game/*)  ── WebSocket /ws?code=CODE ──►  Worker ──►  Room Durable Object (one per invite code)
                               ── GET /api/leaderboard,/api/history ──►  Worker ──►  D1 (SQLite)
```

- **worker.js** — serves the static client (ASSETS binding), routes `/ws` to the
  Room DO, serves `index.html` for `/play/CODE` deep links, and exposes the D1
  leaderboard/history API.
- **room.js** — the `Room` Durable Object: one instance per invite code, the
  **authoritative** game. Validates every intent with the ported rules, drives
  bots + human turn-timeouts (DO alarm), persists state for reconnect, and
  broadcasts a **redacted, per-recipient rotated** snapshot (each player is
  seat 0 in their own view and sees only their own hand — so the seat-0-hardcoded
  UI renders unchanged). Writes finished matches to D1.
- **engine.js** — the pure rules, ported from `../game/engine.js` (kept in sync;
  `fuzz.js` re-runs the 100-game rule check against it).
- **net.js** (client, in `../game/`) — a `NetGame` that mirrors the exact
  shape the UI reads, forwards intents over the socket, and reconnects by token.

Reconnect is keyed on a per-client token in `localStorage` (not name — two
relatives can both be "Mom"). Turn timeouts: connected-but-idle players are
auto-played after `TURN_MS`; a disconnected player's seat gets a longer
`GRACE_MS` before auto-play so a brief drop doesn't lose their turn.

## Local development

```bash
cd judgment/server
npm install                 # installs wrangler v4
npm run db:local            # create the local D1 and apply schema.sql
npm run dev                 # http://127.0.0.1:8788  (serves client + WS + API)
```

Open `http://127.0.0.1:8788/` in two browser windows: "Start a game" in one,
paste the invite link / code into "Join a game" in the other (or open the
`/play/CODE` link). Turn on "Fill empty seats with bots" to start without a full
table.

> The dev/db scripts intentionally run wrangler from the repo root with
> `--persist-to .judgment-state`. wrangler's working `.wrangler` dir must stay
> **outside** the served `judgment/` folder, or its writes trip the asset
> file-watcher into an endless reload loop that drops every WebSocket.

### Tests (server must be running)

```bash
npm run fuzz        # 100 full bot games, asserts zero rule violations
npm run test:ws     # two clients share a room; verifies seat rotation
npm run test:game   # full auto-played game; verifies intents, cross-client
                    # trick-rotation consistency, gameEnd, and the D1 write
```

Timing is env-overridable for fast tests, e.g.
`wrangler dev --var BOT_DELAY_MS:12 --var RESOLVE_MS:12 --var ROUNDEND_MS:30`.

## Deploy (requires your Cloudflare login — do these yourself)

```bash
cd judgment/server
npx wrangler login                       # opens the browser; creates/uses your account
npx wrangler d1 create judgment          # prints a database_id
#   → paste that id into wrangler.toml  (database_id = "…")
npm run db:remote                        # apply schema.sql to the remote D1
npm run deploy                           # publishes the Worker + static assets
```

Durable Objects on the free plan require the **SQLite** class flavor — already
set in `wrangler.toml` as `new_sqlite_classes = ["Room"]`. After deploy the game
lives at `https://judgment.<your-subdomain>.workers.dev/` (or attach a custom
domain like `judgment.karnik.io` in the Cloudflare dashboard). Share links are
`https://YOURHOST/play/CODE`.

## WebSocket message contract

- client → server: `join{token,name,color,avatar}` · `setSize{size}` ·
  `setBots{on}` · `start` · `bid{n}` · `play{card}` · `advance` · `chat{text}`
- server → client: `welcome{seat,youAreHost,status}` · `lobby{...}` ·
  `state{game}` (rotated) · `chat{fromSeat,who,text}` · `error{message}`

## Notes / not yet done

- Practice-alone still runs the local in-browser engine (no server) — untouched.
- Chat has a designed panel but isn't wired to a button in the current UI.
- Video (WebRTC) remote tiles are still mocked; the self-view uses the real webcam.
- Only Classic scoring is computed (matches the prototype).
