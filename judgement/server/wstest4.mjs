// Reconnect-by-token test. A human joins, game starts, their socket DROPS
// mid-game, then reconnects with the SAME token. The server must reseat them
// into their seat with their hand intact and resume — not create a new seat.
const S = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE = Array.from({ length: 5 }, () => S[Math.floor(Math.random() * S.length)]).join('');
const URL = 'ws://127.0.0.1:8788/ws?code=' + CODE;
const TOKEN = 'reconnect_tok';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function conn(onState, onWelcome) {
  const ws = new WebSocket(URL);
  ws.addEventListener('open', () => ws.send(JSON.stringify({ t: 'join', token: TOKEN, name: 'Rejoiner', color: '#fff', avatar: '♠' })));
  ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.t === 'welcome') onWelcome(m); if (m.t === 'state') onState(m.game); });
  return ws;
}

let seat1 = null, before = null;
const ws1 = conn((g) => { before = g; }, (m) => { seat1 = m.seat; });
await sleep(500);
ws1.send(JSON.stringify({ t: 'setBots', on: true }));
await sleep(150);
ws1.send(JSON.stringify({ t: 'start' }));
await sleep(400);
const seatBefore = seat1, handBefore = before && before.hands[0] ? before.hands[0].length : -1;
const playersBefore = before ? before.players.length : -1;

// DROP the socket mid-game
ws1.close();
await sleep(1200);

// reconnect, same token
let seat2 = null, after = null;
const ws2 = conn((g) => { after = g; }, (m) => { seat2 = m.seat; });
await sleep(1500);

console.log('code', CODE);
console.log('before: seat=' + seatBefore + ' players=' + playersBefore + ' myHand=' + handBefore);
console.log('after : seat=' + seat2 + ' players=' + (after && after.players.length) + ' myHand=' + (after && after.hands[0] ? after.hands[0].length : -1) + ' phase=' + (after && after.phase));
const ok = after && seat2 === seatBefore && after.players.length === playersBefore
  && after.hands[0] && after.hands[0].length > 0;
console.log(ok
  ? 'PASS: reconnect by token restored the same seat + hand, no duplicate seat'
  : 'FAIL: reconnect did not restore the seat/hand cleanly');
ws2.close();
await sleep(200);
process.exit(0);
