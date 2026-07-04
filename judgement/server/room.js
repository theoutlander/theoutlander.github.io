/* Room Durable Object — one instance per invite code, the AUTHORITATIVE game.
   - Holds canonical seat state; never trusts the client.
   - Validates every intent with the ported rules (engine.js).
   - Broadcasts a REDACTED, per-recipient ROTATED snapshot: each player sees
     themselves as seat 0 and only their own hand, so the imported UI (which
     hardcodes seat 0 = "you") renders unchanged.
   - Drives bots (host "fill empty seats" toggle) and human turn-timeouts.
   - Persists canonical state to DO storage so a dropped player reconnects by
     TOKEN into their seat; writes finished matches to D1 for the leaderboard.

   WS message contract
   -------------------
   client -> server: {t:'join',token,name,color,avatar} | {t:'setSize',size}
     | {t:'setBots',on} | {t:'start'} | {t:'bid',n} | {t:'play',card}
     | {t:'advance'} | {t:'chat',text}
   server -> client: {t:'welcome',seat,youAreHost,status}
     | {t:'lobby',you:{seat,isHost},size,botsEnabled,status,code,seats:[...]}
     | {t:'state',game:<rotated snapshot>} | {t:'chat',fromSeat,who,text}
     | {t:'error',message}
*/
import * as E from './engine.js';

const TURN_MS = 30000;     // idle human turn timeout (connected but not acting)
const GRACE_MS = 90000;    // disconnected player's turn: longer grace before auto-play
const BOT_DELAY_MS = 700;  // bot "think" pause
const RESOLVE_MS = 900;    // show the completed trick before sweeping it
const ROUNDEND_MS = 15000; // auto-advance a stalled round-end after this long

const BOT_NAMES = ['Robo', 'Ace', 'Nova', 'Pip', 'Sky', 'Zed', 'Kit'];

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.storage = state.storage;
    this.sockets = new Map(); // token -> WebSocket
    this.g = null;
    this.timers = {};         // key -> timeout handle
    // timing (env-overridable, e.g. tiny values for fast automated tests)
    this.T = {
      turn: +env.TURN_MS || TURN_MS, grace: +env.GRACE_MS || GRACE_MS,
      bot: +env.BOT_DELAY_MS || BOT_DELAY_MS, resolve: +env.RESOLVE_MS || RESOLVE_MS,
      roundend: +env.ROUNDEND_MS || ROUNDEND_MS,
    };
    this.loaded = this.load();
  }

  async load() {
    const saved = await this.storage.get('room');
    if (saved) this.g = saved;
  }
  async save() { if (this.g) await this.storage.put('room', this.g); }

  freshRoom(code) {
    return {
      code, status: 'lobby', size: 4, botsEnabled: false, hostToken: null,
      players: [], scoring: 'classic', startCards: null,
    };
  }

  /* ---------------- HTTP / WS entry ---------------- */
  async fetch(request) {
    await this.loaded;
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('expected websocket', { status: 426 });
    }
    const url = new URL(request.url);
    const code = (url.searchParams.get('code') || '').toUpperCase();
    if (!this.g) this.g = this.freshRoom(code);
    else if (!this.g.code) this.g.code = code;

    const pair = new WebSocketPair();
    const client = pair[0], server = pair[1];
    server.accept();
    server.addEventListener('message', (ev) => {
      let msg; try { msg = JSON.parse(ev.data); } catch { return; }
      this.onMessage(server, msg).catch((e) => this.send(server, { t: 'error', message: String(e && e.message || e) }));
    });
    const drop = () => this.onClose(server);
    server.addEventListener('close', drop);
    server.addEventListener('error', drop);
    return new Response(null, { status: 101, webSocket: client });
  }

  send(ws, obj) { try { ws.send(JSON.stringify(obj)); } catch {} }
  seatOf(token) { return this.g.players.findIndex((p) => p.token === token); }

  broadcast(fn) {
    for (const [token, ws] of this.sockets) {
      const seat = this.seatOf(token);
      if (seat === -1) continue;
      this.send(ws, fn(seat));
    }
  }

  /* ---------------- message dispatch ---------------- */
  async onMessage(ws, msg) {
    switch (msg.t) {
      case 'join': return this.handleJoin(ws, msg);
      case 'setSize': return this.handleSetSize(ws, msg);
      case 'setBots': return this.handleSetBots(ws, msg);
      case 'start': return this.handleStart(ws);
      case 'bid': return this.handleBid(ws, msg);
      case 'play': return this.handlePlay(ws, msg);
      case 'advance': return this.handleAdvance(ws);
      case 'autopilot': return this.handleAutopilot(ws, msg);
      case 'chat': return this.handleChat(ws, msg);
    }
  }

  isHost(token) { return this.g.hostToken === token; }

  handleJoin(ws, msg) {
    const token = msg.token;
    if (!token) return this.send(ws, { t: 'error', message: 'missing token' });
    let seat = this.seatOf(token);
    if (seat === -1) {
      if (this.g.status !== 'lobby') return this.send(ws, { t: 'error', message: 'This game has already started.' });
      if (this.g.players.length >= (this.g.size || 8)) return this.send(ws, { t: 'error', message: 'This room is full.' });
      seat = this.g.players.length;
      this.g.players.push({
        token, name: (msg.name || '').trim() || ('Player ' + (seat + 1)),
        color: msg.color || '#4fc3f7', avatar: msg.avatar || '♠', isBot: false, connected: true,
      });
      if (!this.g.hostToken) this.g.hostToken = token;
    } else {
      this.g.players[seat].connected = true;
      if (msg.name) this.g.players[seat].name = msg.name.trim();
      if (msg.color) this.g.players[seat].color = msg.color;
      if (msg.avatar) this.g.players[seat].avatar = msg.avatar;
    }
    this.sockets.set(token, ws);
    ws._token = token;
    this.send(ws, { t: 'welcome', seat, youAreHost: this.isHost(token), status: this.g.status });
    this.save();
    if (this.g.status === 'lobby') this.broadcastLobby();
    else { this.broadcastState(); this.armTurn(); this.maybeBotAct(); }
  }

  handleSetSize(ws, msg) {
    if (!this.isHost(ws._token) || this.g.status !== 'lobby') return;
    const size = Math.max(3, Math.min(8, msg.size | 0));
    if (size < this.g.players.length) return; // can't shrink below seated humans
    this.g.size = size;
    this.save(); this.broadcastLobby();
  }

  handleSetBots(ws, msg) {
    if (!this.isHost(ws._token) || this.g.status !== 'lobby') return;
    this.g.botsEnabled = !!msg.on;
    this.save(); this.broadcastLobby();
  }

  handleStart(ws) {
    if (!this.isHost(ws._token) || this.g.status !== 'lobby') return;
    if (this.g.botsEnabled) {
      let bi = 0;
      while (this.g.players.length < this.g.size) {
        const i = this.g.players.length;
        this.g.players.push({
          token: 'bot_' + i, name: BOT_NAMES[bi % BOT_NAMES.length], color: BOT_COLORS[i % BOT_COLORS.length],
          avatar: BOT_AVATARS[i % BOT_AVATARS.length], isBot: true, connected: true,
        });
        bi++;
      }
    }
    if (this.g.players.length < 3) return this.send(ws, { t: 'error', message: 'Need at least 3 players (or turn on bots).' });
    this.startMatch();
  }

  startMatch() {
    const g = this.g;
    g.n = g.players.length;
    g.startCards = Math.floor(52 / g.n);
    g.schedule = E.buildSchedule(g.n, g.startCards);
    g.dealer = 0;
    g.roundIndex = 0;
    g.totals = g.players.map(() => 0);
    g.roundScores = [];
    g.status = 'playing';
    g.matchId = crypto.randomUUID();
    g.startedAt = Date.now();
    this.startRound();
  }

  startRound() {
    const g = this.g;
    g.cardCount = g.schedule[g.roundIndex];
    const { hands, trump } = E.dealRound(g.n, g.dealer, g.cardCount);
    g.hands = hands; g.trump = trump;
    g.bids = g.players.map(() => null);
    g.tricksWon = g.players.map(() => 0);
    g.currentTrick = [];
    g.leadSuit = null;
    g.trickNumber = 0;
    g.lastTrick = null;
    g.lastTrickWinner = null;
    g.phase = 'bidding';
    g.turn = (g.dealer + 1) % g.n;
    this.save();
    this.broadcastState();
    this.armTurn();
    this.maybeBotAct();
  }

  /* ---------------- intents ---------------- */
  handleBid(ws, msg) {
    const seat = this.seatOf(ws._token);
    if (seat === -1) return;
    this.placeBid(seat, msg.n | 0);
  }

  placeBid(seat, n) {
    const g = this.g;
    if (g.status !== 'playing' || g.phase !== 'bidding' || g.turn !== seat || g.bids[seat] !== null) return false;
    if (E.isLastBidder(g.bids, seat, g.n) && n === E.forbiddenBid(g.bids, g.n, g.cardCount)) return false;
    if (n < 0 || n > g.cardCount) return false;
    g.bids[seat] = n;
    if (g.bids.every((b) => b !== null)) {
      g.phase = 'playing';
      g.turn = (g.dealer + 1) % g.n;
    } else {
      g.turn = (g.turn + 1) % g.n;
    }
    this.save();
    this.broadcastState();
    this.armTurn();
    this.maybeBotAct();
    return true;
  }

  handlePlay(ws, msg) {
    const seat = this.seatOf(ws._token);
    if (seat === -1 || !msg.card) return;
    this.playCard(seat, msg.card);
  }

  playCard(seat, card) {
    const g = this.g;
    if (g.status !== 'playing' || g.phase !== 'playing' || g.turn !== seat) return false;
    const legal = E.legalMoves(g.hands[seat], g.leadSuit);
    if (!legal.some((c) => E.cardId(c) === E.cardId(card))) return false;
    g.hands[seat] = g.hands[seat].filter((c) => E.cardId(c) !== E.cardId(card));
    if (g.currentTrick.length === 0) g.leadSuit = card.suit;
    g.currentTrick.push({ seat, card: { rank: card.rank, suit: card.suit } });
    if (g.currentTrick.length === g.n) {
      g.phase = 'resolving';
      this.clearTurnAlarm();
      this.save();
      this.broadcastState();
      this.after('resolve', this.T.resolve, () => this.resolveTrick());
    } else {
      g.turn = (g.turn + 1) % g.n;
      this.save();
      this.broadcastState();
      this.armTurn();
      this.maybeBotAct();
    }
    return true;
  }

  resolveTrick() {
    const g = this.g;
    if (g.phase !== 'resolving') return;
    const winner = E.trickWinner(g.currentTrick, g.trump, g.leadSuit);
    g.tricksWon[winner]++;
    g.lastTrick = g.currentTrick.slice();
    g.lastTrickWinner = winner;
    g.trickNumber++;
    g.currentTrick = [];
    g.leadSuit = null;
    if (g.trickNumber >= g.cardCount) {
      this.endRound();
    } else {
      g.turn = winner;
      g.phase = 'playing';
      this.save();
      this.broadcastState();
      this.armTurn();
      this.maybeBotAct();
    }
  }

  endRound() {
    const g = this.g;
    const rs = g.players.map((_, i) => {
      const pts = E.score(g.bids[i], g.tricksWon[i]);
      g.totals[i] += pts;
      return { bid: g.bids[i], made: g.tricksWon[i], pts };
    });
    g.roundScores.push(rs);
    g.ready = g.players.map(() => false); // reset "next round" ready-check
    g.phase = 'roundEnd';
    this.clearTurnAlarm();
    this.save();
    this.broadcastState();
    // auto-advance if nobody taps "next round"
    this.after('roundend', this.T.roundend, () => this.advanceRound());
  }

  handleAdvance(ws) {
    const g = this.g;
    if (g.status !== 'playing' || g.phase !== 'roundEnd') return;
    const seat = this.seatOf(ws._token);
    if (seat === -1) return;
    if (!g.ready) g.ready = g.players.map(() => false);
    g.ready[seat] = true;
    // advance only when every connected, non-bot, non-autopilot player is ready,
    // so one fast tap can't yank the round summary away from everyone else. The
    // roundend timer stays as a fallback so a slow/absent player can't stall it.
    const waiting = g.players.some((p, i) => !p.isBot && !p.auto && p.connected && !g.ready[i]);
    if (waiting) { this.save(); this.broadcastState(); }
    else { this.clearTimer('roundend'); this.advanceRound(); }
  }

  // Autopilot: let a human hand their seat to the bot brain (e.g. stepping away).
  handleAutopilot(ws, msg) {
    const seat = this.seatOf(ws._token);
    if (seat === -1) return;
    this.g.players[seat].auto = !!msg.on;
    this.save();
    if (this.g.status !== 'playing') { this.broadcastLobby(); return; }
    this.broadcastState();
    // if it's already their turn, hand it straight to the bot brain
    if (this.g.turn === seat && (this.g.phase === 'bidding' || this.g.phase === 'playing')) {
      this.clearTurnAlarm();
      this.maybeBotAct();
    }
  }

  advanceRound() {
    const g = this.g;
    if (g.phase !== 'roundEnd') return;
    if (g.roundIndex >= g.schedule.length - 1) {
      g.phase = 'gameEnd';
      g.status = 'ended';
      g.endedAt = Date.now();
      this.save();
      this.broadcastState();
      this.persistMatch().catch(() => {});
      return;
    }
    g.roundIndex++;
    g.dealer = (g.dealer + 1) % g.n;
    this.startRound();
  }

  handleChat(ws, msg) {
    const seat = this.seatOf(ws._token);
    if (seat === -1) return;
    const text = String(msg.text || '').slice(0, 300);
    if (!text) return;
    const who = this.g.players[seat].name;
    this.broadcast(() => ({ t: 'chat', fromSeat: seat, who, text }));
  }

  /* ---------------- bots + timers ---------------- */
  turnKey() { const g = this.g; return `${g.roundIndex}|${g.phase}|${g.trickNumber}|${g.turn}`; }

  maybeBotAct() {
    const g = this.g;
    if (g.status !== 'playing' || (g.phase !== 'bidding' && g.phase !== 'playing')) return;
    const p = g.players[g.turn];
    if (!p || (!p.isBot && !p.auto)) return; // bots and autopilot humans
    const key = this.turnKey();
    this.after('bot', this.T.bot, () => { if (this.turnKey() === key) this.autoAct(g.turn); });
  }

  autoAct(seat) {
    const g = this.g;
    const p = g.players[seat];
    if (!p) return;
    if (g.phase === 'bidding') {
      const forbidden = E.isLastBidder(g.bids, seat, g.n) ? E.forbiddenBid(g.bids, g.n, g.cardCount) : null;
      this.placeBid(seat, E.botBid(g.hands[seat], g.trump, g.cardCount, forbidden));
    } else if (g.phase === 'playing') {
      const need = g.bids[seat] - g.tricksWon[seat];
      this.playCard(seat, E.botPlay(g.hands[seat], g.currentTrick, g.trump, g.leadSuit, need));
    }
  }

  // Human turn-timeout: single DO alarm. Connected-but-idle -> TURN_MS; a
  // disconnected player's turn gets GRACE_MS before we auto-play to prevent a
  // permanent stall (they can still reconnect and act before then).
  armTurn() {
    const g = this.g;
    this.clearTurnAlarm();
    if (g.status !== 'playing' || (g.phase !== 'bidding' && g.phase !== 'playing')) return;
    const p = g.players[g.turn];
    if (!p || p.isBot || p.auto) return; // bots + autopilot are driven by maybeBotAct
    const ms = p.connected ? this.T.turn : this.T.grace;
    g.turnKey = this.turnKey();
    g.turnDeadline = Date.now() + ms;
    this.storage.setAlarm(g.turnDeadline);
  }
  clearTurnAlarm() { if (this.g) { this.g.turnKey = null; this.g.turnDeadline = null; } this.storage.deleteAlarm(); }

  async alarm() {
    await this.loaded;
    const g = this.g;
    if (!g || g.status !== 'playing') return;
    if (g.turnKey !== this.turnKey()) return; // stale alarm, turn already moved
    const p = g.players[g.turn];
    if (!p || p.isBot || p.auto) return;
    this.autoAct(g.turn); // idle or grace expired -> play a legal move for them
  }

  // in-DO deferred callback (DO stays alive while a socket is connected)
  after(key, ms, fn) {
    this.clearTimer(key);
    this.timers[key] = setTimeout(() => { delete this.timers[key]; Promise.resolve(fn()).catch(() => {}); }, ms);
  }
  clearTimer(key) { if (this.timers[key]) { clearTimeout(this.timers[key]); delete this.timers[key]; } }

  onClose(ws) {
    const token = ws._token;
    if (!token) return;
    if (this.sockets.get(token) === ws) this.sockets.delete(token);
    const seat = this.seatOf(token);
    if (seat === -1) return;
    if (this.g.status === 'lobby') {
      // leaving the lobby frees the seat (host handoff if needed)
      const wasHost = this.isHost(token);
      this.g.players.splice(seat, 1);
      if (wasHost) this.g.hostToken = this.g.players.length ? this.g.players[0].token : null;
      this.save();
      this.broadcastLobby();
    } else {
      this.g.players[seat].connected = false;
      this.save();
      this.broadcastState();
      if (this.g.turn === seat && (this.g.phase === 'bidding' || this.g.phase === 'playing')) this.armTurn(); // re-arm with grace
    }
  }

  /* ---------------- broadcasts ---------------- */
  broadcastLobby() {
    const g = this.g;
    const seats = g.players.map((p) => ({
      name: p.name, color: p.color, avatar: p.avatar, isBot: p.isBot,
      connected: p.connected, isHost: p.token === g.hostToken,
    }));
    this.broadcast((seat) => ({
      t: 'lobby', code: g.code, size: g.size, botsEnabled: g.botsEnabled,
      status: g.status, you: { seat, isHost: this.isHost(g.players[seat].token) }, seats,
    }));
  }

  broadcastState() {
    this.broadcast((seat) => ({ t: 'state', game: this.snapshotFor(seat) }));
  }

  // Redacted + rotated snapshot: recipient becomes view-seat 0; every seat-valued
  // field is rotated (incl. nested currentTrick/lastTrick seats and roundScores
  // rows); only the recipient's hand is sent.
  snapshotFor(seat) {
    const g = this.g, n = g.n;
    const rot = (i) => (i - seat + n) % n;                 // canonical -> view index
    const rotArr = (A) => A.map((_, v) => A[(v + seat) % n]); // reindex by view
    const players = rotArr(g.players).map((p, v) => ({
      id: 'seat' + ((v + seat) % n), name: p.name, color: p.color, avatar: p.avatar,
      isBot: p.isBot, connected: p.connected, auto: !!p.auto,
    }));
    const currentTrick = g.currentTrick.map((p) => ({ seat: rot(p.seat), card: p.card }));
    const lastTrick = g.lastTrick ? g.lastTrick.map((p) => ({ seat: rot(p.seat), card: p.card })) : null;
    const roundScores = g.roundScores.map((rs) => rs.map((_, v) => rs[(v + seat) % n]));
    return {
      n, code: g.code, phase: g.phase, options: { faceStyle: 'modern' },
      players,
      turn: rot(g.turn), dealer: rot(g.dealer),
      bids: rotArr(g.bids), tricksWon: rotArr(g.tricksWon), totals: rotArr(g.totals),
      hands: [g.hands ? g.hands[seat] : []],   // UI only reads hands[0]
      currentTrick, lastTrick, lastTrickWinner: g.lastTrickWinner == null ? null : rot(g.lastTrickWinner),
      leadSuit: g.leadSuit, trump: g.trump, cardCount: g.cardCount, trickNumber: g.trickNumber,
      schedule: g.schedule, roundIndex: g.roundIndex, roundScores,
      ready: g.ready ? rotArr(g.ready) : g.players.map(() => false),
    };
  }

  /* ---------------- D1 persistence ---------------- */
  async persistMatch() {
    const g = this.g, db = this.env.DB;
    if (!db) return;
    const order = g.players.map((p, i) => ({ p, i, t: g.totals[i] })).sort((a, b) => b.t - a.t);
    const stmts = [];
    stmts.push(db.prepare(
      'INSERT INTO matches (id, code, started_at, ended_at, scoring, start_cards, status) VALUES (?,?,?,?,?,?,?)'
    ).bind(g.matchId, g.code, g.startedAt || null, g.endedAt || Date.now(), g.scoring || 'classic', g.startCards || null, 'ended'));
    order.forEach((o, place) => {
      let hit = 0; g.roundScores.forEach((rs) => { if (rs[o.i].pts > 0) hit++; });
      const pid = o.p.isBot ? null : o.p.token;
      if (pid) {
        stmts.push(db.prepare(
          'INSERT INTO players (id, name, color, avatar) VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, color=excluded.color, avatar=excluded.avatar'
        ).bind(pid, o.p.name, o.p.color, o.p.avatar));
      }
      stmts.push(db.prepare(
        'INSERT INTO match_players (match_id, player_id, name, color, avatar, seat, is_bot, final_score, place, bids_hit, bids_total) VALUES (?,?,?,?,?,?,?,?,?,?,?)'
      ).bind(g.matchId, pid, o.p.name, o.p.color, o.p.avatar, o.i, o.p.isBot ? 1 : 0, o.t, place + 1, hit, g.roundScores.length));
    });
    await db.batch(stmts);
  }
}

const BOT_COLORS = ['#ffc94d', '#4fc3f7', '#ff8a5c', '#8ce16a', '#c98bff', '#ff6f91', '#3fd9c4', '#ffd86b'];
const BOT_AVATARS = ['♛', '♠', '♥', '♦', '♣', '♔', '♗', '♘'];
