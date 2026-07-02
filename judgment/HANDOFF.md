# Judgment, Build & Handoff Notes (for Claude Code)

This repo is a **high-fidelity, fully-playable design prototype** of the card game
**Judgment** (a.k.a. Oh Hell / Kachufool). It runs the complete game **locally vs. bots**
so the experience can be felt instantly. Your job: take this exact look, feel, and rule
engine and make it **real-time multiplayer** with shareable links and a database.

Everything visual + the rules engine is done and verified. Don't rebuild the UI, wire a
backend behind it.

---

## What's here

```
Judgment.html            # entry; loads everything in order
game/
  engine.js              # ✅ PURE RULES ENGINE, port this to the server (see below)
  sound.js               # Web Audio SFX (no asset files)
  themes.js              # table/card themes + player colors (user-selectable)
  cards.jsx              # playing-card renderer (faces, pips, courts, backs)
  ui.jsx                 # shared atoms (Avatar, SuitBadge, TopBar, Segmented, Stepper)
  table.jsx              # table sub-components (seats, trick zone, hand, bid panel, scorecard)
  table_screen.jsx       # table container + round-end / game-end moments
  home_setup.jsx         # home, new-game setup, family roster + editor
  lobby.jsx              # host / join / lobby + chat & emotes  (STUBBED, your job)
  standings.jsx          # leaderboard, history, how-to, settings
  app.jsx                # routing, localStorage persistence, in-game menu
  styles.css table.css screens.css
```

Tech: React 18 + in-browser Babel (fine for a prototype; precompile or migrate to a build
step for production). No bundler, no framework lock-in. **Phaser is intentionally NOT used**
DOM/CSS gives sharper, more accessible, more legible cards on every device, which is the
priority for older family members. Keep it DOM unless you have a strong reason.

---

## The rules (as implemented, confirmed with Nick)

- 3-8 players, one 52-card deck. Hand size starts at **7**, drops 1 per round to **1**, then
  climbs back to 7 (configurable 5/7/max). `buildSchedule()` caps the start at `floor(52/n)`.
- **Trump is RANDOM each round** (house rule, not the fixed spades→hearts rotation some
  variants use). Picked by the engine; in the physical game it's the player to the dealer's right.
- **Dealing & first bid start LEFT of the dealer**; dealer is the **last bidder** and rotates
  clockwise each round.
- **"Screw the dealer":** the last bidder cannot make the bids sum to the number of cards, so
  someone must miss. Enforced in `forbiddenBid()` / `placeBid()` and surfaced in the bid UI.
- Follow the led suit if able; otherwise play anything (trump to win, or throw off).
  `legalMoves()` enforces this; `trickWinner()` resolves (highest trump, else highest of led suit).
- **Scoring = Classic Oh Hell:** exact bid → `10 + bid`, miss → `0`. (`score()`, other variants
  high/medium/low are scaffolded in setup but the engine currently scores classic; wire the rest
  in `Game.endRound` if you want them.)

The engine was fuzz-tested headlessly: **100 full games across 3/4/5/6/8 players, zero rule
violations.**

---

## Porting the engine to a server (the important part)

`game/engine.js` is deliberately written as a near-pure module. The `Game` class holds all
state and exposes intent methods. To go multiplayer, make the **server authoritative**:

1. Move `Game` to the server (Node). Strip the `window.JSound` calls (or guard them).
2. Each room = one `Game` instance keyed by the share code.
3. Client sends **intents only**: `placeBid(seat, n)` and `playCard(seat, card)`. The server
   validates with the existing `canPlay()` / `forbiddenBid()` / `isLastBidder()` guards
   **never trust the client.** Reject illegal moves server-side.
4. After every state change, broadcast a **redacted** snapshot to each player: everyone sees
   bids, tricks won, the current trick, trump, totals, but **only their own `hands[seat]`.**
   (Right now the client holds all hands; that's fine for local bots, unsafe for real players.)
5. The React client already renders purely from a game-state object. Replace the local `Game`
   instance in `app.jsx` with a thin client that holds the latest server snapshot and sends
   intents over the socket. The `TableScreen` props barely change.
6. Bots: keep `botBid()` / `botPlay()` server-side for the optional "fill empty seats" host
   toggle (off by default, see lobby). Clearly flag bot seats in the broadcast.

Recommended transport: WebSocket (e.g. `ws`/Socket.IO) or a hosted realtime layer
(Supabase Realtime, PartyKit, Ably). Turn timers + reconnect: persist room state so a player
who drops can rejoin by name into their seat (the lobby/FAQ language already promises this).

---

## Shareable URLs

- Host creates a room → server generates a code (see `makeCode()` in `lobby.jsx`: 5 chars,
  no ambiguous I/O/0/1).
- Share URL form: `https://YOURSITE/play/<CODE>`. Joining is **account-free**: open link →
  type a name → you're seated. No auth wall (Nick's priority for older relatives).
- Route `/play/:code` should drop the user straight into the Join → lobby flow with the code
  prefilled.

---

## Suggested database schema (leaderboard + history)

The leaderboard/history are currently localStorage with sample data. Aggregation logic lives in
`aggregate()` in `standings.jsx`, mirror it in SQL.

```
players        (id, name, color, avatar, created_at)        -- the saved family roster
matches        (id, code, started_at, ended_at, scoring, start_cards, status)
match_players  (match_id, player_id, name, color, avatar, seat, final_score, place,
                bids_hit, bids_total)
rounds         (match_id, round_no, card_count, trump)        -- optional, for deep history
round_results  (match_id, round_no, player_id, bid, made, points)  -- optional
```

Leaderboard = aggregate `match_players` by player: wins (`place=1`), games, sum(final_score),
sum(bids_hit)/sum(bids_total) for the bid-accuracy %. `saveResult()` in `app.jsx` shows the exact
record shape the UI expects.

---

## Accessibility (built in, keep it!)
Designed for older / low-vision players (one family member has monocular vision):
- **Easy View** (`settings.easyView`), adds class `.frame.a11y-easy`: larger high-contrast cards &
  text, darker felt, bigger rank index, and **calmer motion** (pulsing/bobbing turn cues become
  static rings). Card sizing also bumps in `HandFan`/`TrickZone` via `window.JA11Y.easyView`.
- **Color-coded suits** (`settings.fourColor`), adds `.frame.a11y-4color`: four-color deck
  (♠ black, ♥ red, ♦ blue, ♣ green) so suits are distinguishable at a glance. Cards carry an
  `s-<suit>` class; recoloring lives in `game/a11y.css`.
Both toggles are the first thing in Settings ("Easier to see"). Keep these prominent.

## UX decisions (intentional, don't "fix" back)
- **No Players/roster screen in the UI right now.** It was removed to keep things simple; the saved
  family roster belongs with the **leaderboard**, which is a backend/DB feature. Rebuild the roster
  UI when you wire the `players` table (the `RosterScreen`/`PlayerEditor` code still exists in
  `home_setup.jsx` if useful). Home is intentionally just: Play with family / Join a game / Practice
  alone, plus How-to & Settings links.
- **Simplified entry flow for non-technical/older players:** Home → "Play with family" goes straight
  to a one-screen host lobby (numbered steps: 1 share link, 2 start) with no separate name gate.
  "Join a game" takes a pasted **link OR** a 5-letter code (`extractCode()` pulls the code from the
  URL's last path segment). "Practice alone" = solo vs. bots.

## Features already designed (wire to backend)

- **Family roster** code exists (`home_setup.jsx` `RosterScreen`) but is currently unlinked from the
  home screen, re-expose it with the `players` table + leaderboard.
- **Chat + emotes** at the table, `lobby.jsx` `ChatPanel` (currently local echo). Send over the
  same socket; voice is a future add (UI leaves room for it).
- **Video conference**, `table.jsx` `VideoTile` (remote players) + `SelfView` (local). Toggle is
  the camera icon in the table top bar (`table_screen.jsx`, `videoOn` state). The prototype already
  calls `getUserMedia({video,audio})` for the LOCAL self-view (real webcam) and wires mic/cam mute to
  the actual MediaStream tracks. Remote tiles are mocked with a gradient placeholder, replace the
  `.vfeed` div in `VideoTile` with a `<video>` bound to each peer's stream. To make it real, add a
  mesh/SFU layer: WebRTC peer connections per room, or a managed service (Daily.co, Twilio Video,
  Agora, LiveKit), keyed by the same room code as the game socket. Self-view tile lives in the top
  strip alongside opponents so it never covers the hand.
- **Themes** (table felt, card backs, card-face style) and **sound**, per-device settings, fine
  to keep in localStorage.
- **In-game menu**, **scorecard grid**, **reconnect/waiting states**, designed in `table_screen.jsx`
  / `app.jsx`. The lobby shows ready-dots, host badge, empty-seat states, and the bot toggle.

## Mobile
`Judgment Mobile Preview.html` wraps the app in a phone bezel for quick visual testing. The app
itself is responsive/phone-first (centers to a 480px column on desktop), deploy `Judgment.html`
directly; the preview file is just a convenience.

## Known stubs / not done
- No real networking, auth, or persistence beyond localStorage.
- Only Classic scoring is computed (others are selectable but not yet scored).
- Voice chat is space-reserved, not built.
- Bot AI is decent-but-simple (greedy); fine for practice, not a hard opponent.
