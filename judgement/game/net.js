/* Client network layer for online multiplayer.
   window.JNet.open(code, identity, handlers) -> conn (a live room connection).

   A `NetGame` mirrors EXACTLY the fields/methods the imported UI reads, so
   TableScreen/table.jsx render unchanged. The server already rotates each
   snapshot so the recipient is seat 0 (UI hardcodes seat 0 = "you"); NetGame
   just stores the latest snapshot and forwards intents over the socket.

   Reconnect: a stable token (localStorage) identifies the player; on an
   unexpected socket drop we retry and re-join, and the server reseats us. */
(function () {
  // The lobby/table code below is fully wired, but it needs a server answering
  // /ws (and /api/*) on this origin. The static site has none, so multiplayer is
  // hidden until a backend is actually deployed. Flip this to true then.
  window.JConfig = window.JConfig || { multiplayerLive: false };

  // Per-TAB identity (sessionStorage), not per-browser. Two tabs in the same
  // browser are two distinct players (so testing — and two people on one
  // machine — works), while a reload of the SAME tab keeps its token so
  // reconnect still restores the seat. Real players on separate devices each
  // get their own token automatically.
  function token() {
    try {
      let t = sessionStorage.getItem('judgement.token');
      if (!t) { t = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('judgement.token', t); }
      return t;
    } catch (e) { return 'u_' + Math.random().toString(36).slice(2); }
  }

  function wsUrl(code) {
    if (window.JUDGEMENT_WS) return window.JUDGEMENT_WS + (window.JUDGEMENT_WS.indexOf('?') >= 0 ? '&' : '?') + 'code=' + code;
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    return proto + '//' + location.host + '/ws?code=' + code;
  }

  /* ---- NetGame: same shape the UI expects from the local engine ---- */
  function NetGame(conn) {
    this.conn = conn;
    this.onUpdate = function () {};
    this.n = 0; this.phase = 'bidding'; this.turn = 0;
    this.players = []; this.bids = []; this.tricksWon = []; this.totals = [];
    this.hands = [[]]; this.currentTrick = []; this.lastTrick = null; this.lastTrickWinner = null;
    this.leadSuit = null; this.trump = 'spades'; this.cardCount = 0; this.trickNumber = 0;
    this.schedule = []; this.roundIndex = 0; this.roundScores = []; this.options = { faceStyle: 'modern' };
    this.ready = [];
    this.code = conn.code;
  }
  NetGame.prototype.apply = function (snap) {
    Object.assign(this, snap);
    if (!this.options) this.options = { faceStyle: 'modern' };
    if (!this.hands) this.hands = [[]];
  };
  NetGame.prototype.placeBid = function (seat, n) { this.conn.send({ t: 'bid', n: n }); return true; };
  NetGame.prototype.playCard = function (seat, card) {
    // optimistic legality only so the "not allowed" sound fires on bad taps;
    // the server is authoritative and will reject anything illegal.
    if (this.phase !== 'playing' || this.turn !== 0) return false;
    const hand = this.hands[0] || [];
    const legal = window.JEngine.legalMoves(hand, this.leadSuit);
    if (!legal.some((c) => window.JEngine.cardId(c) === window.JEngine.cardId(card))) return false;
    this.conn.send({ t: 'play', card: { rank: card.rank, suit: card.suit } });
    return true;
  };
  NetGame.prototype.isLastBidder = function (seat) {
    return this.bids.filter((b) => b !== null).length === this.n - 1 && this.bids[0] === null;
  };
  NetGame.prototype.forbiddenBid = function () {
    const placed = this.bids.filter((b) => b !== null);
    if (placed.length !== this.n - 1) return null;
    const sum = placed.reduce((a, b) => a + b, 0);
    const f = this.cardCount - sum;
    return f >= 0 && f <= this.cardCount ? f : null;
  };
  NetGame.prototype.nextRound = function () { this.conn.send({ t: 'advance' }); };

  /* ---- connection ---- */
  function open(code, identity, handlers) {
    handlers = handlers || {};
    const conn = {
      code: code, seat: -1, youAreHost: false, status: 'lobby',
      game: null, ws: null, closed: false, retries: 0,
    };
    conn.game = new NetGame(conn);

    conn.send = function (obj) {
      if (conn.ws && conn.ws.readyState === 1) { try { conn.ws.send(JSON.stringify(obj)); } catch (e) {} }
    };
    conn.setSize = function (n) { conn.send({ t: 'setSize', size: n }); };
    conn.setBots = function (on) { conn.send({ t: 'setBots', on: !!on }); };
    conn.start = function () { conn.send({ t: 'start' }); };
    conn.autopilot = function (on) { conn.send({ t: 'autopilot', on: !!on }); };
    conn.chat = function (text) { conn.send({ t: 'chat', text: text }); };
    conn.close = function () { conn.closed = true; try { conn.ws && conn.ws.close(); } catch (e) {} };

    function join() { conn.send({ t: 'join', token: token(), name: identity.name, color: identity.color, avatar: identity.avatar }); }

    function connect() {
      let ws;
      try { ws = new WebSocket(wsUrl(code)); } catch (e) { handlers.onError && handlers.onError('Could not connect'); return; }
      conn.ws = ws;
      ws.onopen = function () { conn.retries = 0; join(); };
      ws.onmessage = function (ev) {
        let msg; try { msg = JSON.parse(ev.data); } catch (e) { return; }
        switch (msg.t) {
          case 'welcome':
            conn.seat = msg.seat; conn.youAreHost = msg.youAreHost; conn.status = msg.status;
            handlers.onWelcome && handlers.onWelcome(msg); break;
          case 'lobby':
            handlers.onLobby && handlers.onLobby(msg); break;
          case 'state':
            conn.status = 'playing';
            conn.game.apply(msg.game);
            handlers.onState && handlers.onState(conn.game);
            conn.game.onUpdate();
            break;
          case 'chat':
            handlers.onChat && handlers.onChat(msg); break;
          case 'error':
            handlers.onError && handlers.onError(msg.message); break;
        }
      };
      ws.onclose = function () {
        if (conn.closed) return;
        // unexpected drop: retry with backoff, then re-join (server reseats by token)
        conn.retries++;
        const delay = Math.min(500 * conn.retries, 4000);
        handlers.onDisconnect && handlers.onDisconnect();
        setTimeout(function () { if (!conn.closed) connect(); }, delay);
      };
      ws.onerror = function () { try { ws.close(); } catch (e) {} };
    }

    connect();
    return conn;
  }

  window.JNet = { open: open, token: token };
})();
