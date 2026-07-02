// Ready-check test: at round-end, ONE human tapping "next" must NOT advance the
// round for everyone — it advances only when all connected humans are ready.
// Run wrangler with a large ROUNDEND_MS so the fallback timer doesn't interfere.
import * as E from './engine.js';
const S = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE = Array.from({ length: 5 }, () => S[Math.floor(Math.random() * S.length)]).join('');
const PORT = process.env.WSPORT || '8788';
const URL = 'ws://127.0.0.1:' + PORT + '/ws?code=' + CODE;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function autoClient(token, name) {
  const ws = new WebSocket(URL);
  const st = { ws, acted: new Set(), lastG: null, errors: [] };
  ws.addEventListener('open', () => ws.send(JSON.stringify({ t: 'join', token, name, color: '#fff', avatar: '♠' })));
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.t === 'error') { st.errors.push(m.message); return; }
    if (m.t !== 'state') return;
    const g = m.game; st.lastG = g;
    const key = g.roundIndex + '|' + g.phase + '|' + g.trickNumber + '|' + g.turn;
    if (g.phase === 'bidding' && g.turn === 0 && g.bids[0] === null && !st.acted.has(key)) {
      st.acted.add(key);
      const f = E.isLastBidder(g.bids, 0, g.n) ? E.forbiddenBid(g.bids, g.n, g.cardCount) : null;
      ws.send(JSON.stringify({ t: 'bid', n: E.botBid(g.hands[0], g.trump, g.cardCount, f) }));
    } else if (g.phase === 'playing' && g.turn === 0 && !st.acted.has(key)) {
      st.acted.add(key);
      const need = g.bids[0] - g.tricksWon[0];
      const c = E.botPlay(g.hands[0], g.currentTrick, g.trump, g.leadSuit, need);
      ws.send(JSON.stringify({ t: 'play', card: { rank: c.rank, suit: c.suit } }));
    }
    // NOTE: never auto-advances — the test drives 'advance' manually
  });
  return st;
}

const a = autoClient('rc_a', 'Alice');
await sleep(400);
const b = autoClient('rc_b', 'Bob');
await sleep(500);
a.ws.send(JSON.stringify({ t: 'setBots', on: true }));
await sleep(150);
a.ws.send(JSON.stringify({ t: 'start' }));

// wait until both clients are at round-end of round 0
for (let i = 0; i < 60; i++) { if (a.lastG && a.lastG.phase === 'roundEnd' && b.lastG && b.lastG.phase === 'roundEnd') break; await sleep(300); }
const atRoundEnd = a.lastG && a.lastG.phase;

// only Alice taps next
a.ws.send(JSON.stringify({ t: 'advance' }));
await sleep(1000);
const afterOne = a.lastG.phase, readyA = a.lastG.ready && a.lastG.ready[0];

// now Bob taps next too
b.ws.send(JSON.stringify({ t: 'advance' }));
await sleep(1200);
const afterBoth = a.lastG.phase, roundNow = a.lastG.roundIndex;

console.log('code', CODE, 'errors', a.errors.length + b.errors.length);
console.log('at round-end:', atRoundEnd, '| after ONE advance:', afterOne, '(Alice ready=' + readyA + ')', '| after BOTH:', afterBoth, 'roundIndex=' + roundNow);
const pass = atRoundEnd === 'roundEnd' && afterOne === 'roundEnd' && readyA === true
  && (afterBoth !== 'roundEnd' || roundNow > 0) && (a.errors.length + b.errors.length) === 0;
console.log(pass ? 'PASS: one tap does NOT advance; round advances only when both are ready' : 'FAIL');
a.ws.close(); b.ws.close();
await sleep(200);
process.exit(0);
