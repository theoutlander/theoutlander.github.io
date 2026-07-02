// Autopilot test: a human turns on autopilot and then sends NOTHING. The server
// must play their turns (bid + cards) via the bot brain — independent of the
// turn-timeout (so this works even with a long TURN_MS).
const S = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE = Array.from({ length: 5 }, () => S[Math.floor(Math.random() * S.length)]).join('');
const PORT = process.env.WSPORT || '8788';
const URL = 'ws://127.0.0.1:' + PORT + '/ws?code=' + CODE;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ws = new WebSocket(URL);
let last = null; const errors = [];
ws.addEventListener('open', () => ws.send(JSON.stringify({ t: 'join', token: 'auto_tok', name: 'Away', color: '#fff', avatar: '♠' })));
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.t === 'error') errors.push(m.message); if (m.t === 'state') last = m.game; });

await sleep(500);
ws.send(JSON.stringify({ t: 'setBots', on: true }));
await sleep(150);
ws.send(JSON.stringify({ t: 'start' }));
await sleep(300);
ws.send(JSON.stringify({ t: 'autopilot', on: true })); // hand my seat to the bot brain
// send nothing else
await sleep(7000);

console.log('code', CODE);
console.log('auto=' + (last && last.players[0] && last.players[0].auto), 'phase=' + (last && last.phase),
  'myBid=' + (last && last.bids[0]), 'trickNumber=' + (last && last.trickNumber), 'errors=' + errors.length);
const pass = last && last.players[0] && last.players[0].auto === true
  && last.bids[0] !== null && last.phase !== 'bidding' && last.trickNumber >= 1 && errors.length === 0;
console.log(pass ? 'PASS: autopilot played the seat (bid + ≥1 trick) with no client input' : 'FAIL');
ws.close();
await sleep(200);
process.exit(0);
