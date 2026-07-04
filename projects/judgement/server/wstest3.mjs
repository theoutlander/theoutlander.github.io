// Turn-timeout test. One human (Idle) joins, fills with bots, starts — then goes
// completely SILENT (sends no bid/play). Only the server's per-turn alarm can
// move Idle's turns. Run wrangler with a short TURN_MS (e.g. --var TURN_MS:1500).
const S = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE = Array.from({ length: 5 }, () => S[Math.floor(Math.random() * S.length)]).join('');
const URL = 'ws://127.0.0.1:8788/ws?code=' + CODE;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ws = new WebSocket(URL);
let last = null; const errors = [];
ws.addEventListener('open', () => ws.send(JSON.stringify({ t: 'join', token: 'idle_tok', name: 'Idle', color: '#fff', avatar: '♠' })));
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.t === 'error') errors.push(m.message); if (m.t === 'state') last = m.game; });

await sleep(500);
ws.send(JSON.stringify({ t: 'setBots', on: true }));
await sleep(150);
ws.send(JSON.stringify({ t: 'start' }));
// Idle now sends NOTHING. If the game advances past Idle's bid + at least one
// trick, the server turn-timeout auto-played for the idle seat.
await sleep(8000);

console.log('code', CODE);
console.log('phase=' + (last && last.phase), 'roundIndex=' + (last && last.roundIndex),
  'myBid=' + (last && last.bids[0]), 'trickNumber=' + (last && last.trickNumber), 'errors=' + errors.length);
const timedOut = last && last.bids[0] !== null && last.phase !== 'bidding' && last.trickNumber >= 1;
console.log(timedOut
  ? 'PASS: turn-timeout alarm auto-played for the idle seat (bid + ≥1 trick) with no client action'
  : 'FAIL: game did not advance without client input');
ws.close();
await sleep(200);
process.exit(0);
