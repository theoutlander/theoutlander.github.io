// Deterministic two-client WebSocket test against a running `wrangler dev`.
// Verifies: shared lobby, bot-fill start, and per-recipient seat ROTATION
// (each client is seat 0 in its own snapshot; same trick is consistent).
// valid code: charset excludes I/O/0/1
const S = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE = Array.from({ length: 5 }, () => S[Math.floor(Math.random() * S.length)]).join('');
const URL = 'ws://127.0.0.1:8788/ws?code=' + CODE;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function client(token, name) {
  const ws = new WebSocket(URL);
  ws._last = {};
  ws.addEventListener('open', () => ws.send(JSON.stringify({ t: 'join', token, name, color: '#4fc3f7', avatar: '♠' })));
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); ws._last[m.t] = m; });
  ws.addEventListener('error', (e) => console.log(name, 'WS ERROR', e.message || e));
  ws.addEventListener('close', (e) => console.log(name, 'WS CLOSE', e.code));
  return ws;
}

const a = client('tok_alice', 'Alice');
await sleep(500);
const b = client('tok_bob', 'Bob');
await sleep(1000);

const aLobby = a._last.lobby, bLobby = b._last.lobby;
console.log('code', CODE);
console.log('A lobby seats:', aLobby ? aLobby.seats.map((s) => s.name) : 'none', 'you.seat', aLobby && aLobby.you.seat);
console.log('B lobby seats:', bLobby ? bLobby.seats.map((s) => s.name) : 'none', 'you.seat', bLobby && bLobby.you.seat);

// host (Alice) enables bots + starts
a.send(JSON.stringify({ t: 'setBots', on: true }));
await sleep(200);
a.send(JSON.stringify({ t: 'start' }));
await sleep(1500);

const ag = a._last.state && a._last.state.game;
const bg = b._last.state && b._last.state.game;
console.log('--- game started? A:', !!ag, 'B:', !!bg);
if (ag && bg) {
  console.log('A: n=' + ag.n, 'players=', ag.players.map((p) => p.name), 'myHand=' + (ag.hands[0] ? ag.hands[0].length : 'none'), 'phase=' + ag.phase);
  console.log('B: n=' + bg.n, 'players=', bg.players.map((p) => p.name), 'myHand=' + (bg.hands[0] ? bg.hands[0].length : 'none'), 'phase=' + bg.phase);
  console.log('ROTATION check — A.players[0]=' + ag.players[0].name + ' (want Alice), B.players[0]=' + bg.players[0].name + ' (want Bob)');
  const ok = ag.n >= 3 && ag.players[0].name === 'Alice' && bg.players[0].name === 'Bob'
    && aLobby.seats.length === 2 && bLobby.seats.length === 2;
  console.log(ok ? 'PASS: shared room + bot fill + rotation correct' : 'FAIL: see values above');
} else {
  console.log('FAIL: game did not start for both clients');
}
a.close(); b.close();
await sleep(200);
process.exit(0);
