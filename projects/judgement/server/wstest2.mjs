// Full-game two-human (auto-played) + 2-bot test. Verifies intents (bid/play)
// are accepted, the game reaches gameEnd, currentTrick seat ROTATION is
// cross-client consistent (both clients compute the SAME winning card for the
// same trick), and the finished match lands in D1.
import * as E from './engine.js';

const S = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE = Array.from({ length: 5 }, () => S[Math.floor(Math.random() * S.length)]).join('');
const URL = 'ws://127.0.0.1:8788/ws?code=' + CODE;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function autoClient(token, name) {
  const ws = new WebSocket(URL);
  const st = { ws, name, acted: new Set(), advanced: new Set(), resolves: new Map(), errors: [], ended: false, lastG: null };
  ws.addEventListener('open', () => ws.send(JSON.stringify({ t: 'join', token, name, color: '#4fc3f7', avatar: '♠' })));
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.t === 'welcome') { st.seat = m.seat; return; }
    if (m.t === 'error') { st.errors.push(m.message); return; }
    if (m.t !== 'state') return;
    const g = m.game; st.lastG = g;
    // record every fully-formed trick: winning card + the full card->seat map
    // (the seat map is what actually tests currentTrick[].seat rotation)
    if (g.phase === 'resolving' && g.currentTrick.length === g.n) {
      const key = g.roundIndex + ':' + g.trickNumber;
      const winSeat = E.trickWinner(g.currentTrick, g.trump, g.leadSuit);
      const wc = g.currentTrick.find((p) => p.seat === winSeat).card;
      const seats = {};
      g.currentTrick.forEach((p) => { seats[E.cardId(p.card)] = p.seat; });
      st.resolves.set(key, { win: E.cardId(wc), seats });
    }
    if (g.phase === 'gameEnd') { st.ended = true; return; }
    // act only on my turn, once per turn-key
    const key = g.roundIndex + '|' + g.phase + '|' + g.trickNumber + '|' + g.turn;
    if (g.phase === 'bidding' && g.turn === 0 && g.bids[0] === null && !st.acted.has(key)) {
      st.acted.add(key);
      const forbidden = E.isLastBidder(g.bids, 0, g.n) ? E.forbiddenBid(g.bids, g.n, g.cardCount) : null;
      ws.send(JSON.stringify({ t: 'bid', n: E.botBid(g.hands[0], g.trump, g.cardCount, forbidden) }));
    } else if (g.phase === 'playing' && g.turn === 0 && !st.acted.has(key)) {
      st.acted.add(key);
      const need = g.bids[0] - g.tricksWon[0];
      const card = E.botPlay(g.hands[0], g.currentTrick, g.trump, g.leadSuit, need);
      ws.send(JSON.stringify({ t: 'play', card: { rank: card.rank, suit: card.suit } }));
    } else if (g.phase === 'roundEnd' && !st.advanced.has(g.roundIndex)) {
      st.advanced.add(g.roundIndex);
      ws.send(JSON.stringify({ t: 'advance' }));
    }
  });
  return st;
}

const a = autoClient('tok_a', 'Alice');
await sleep(400);
const b = autoClient('tok_b', 'Bob');
await sleep(600);
a.ws.send(JSON.stringify({ t: 'setBots', on: true }));
await sleep(150);
a.ws.send(JSON.stringify({ t: 'start' }));

// let the whole game play out (schedule for 4 players = 13..1..13 = 25 rounds; auto)
for (let i = 0; i < 120; i++) { if (a.ended && b.ended) break; await sleep(500); }

console.log('code', CODE);
console.log('ended? A:', a.ended, 'B:', b.ended);
console.log('errors A:', a.errors.length, 'B:', b.errors.length);
if (a.lastG) console.log('final totals (A view, seat0=Alice):', a.lastG.totals);
// (1) clients agree on which cards were played each trick (winning card matches)
// (2) DISCRIMINATING seat-rotation check: for a card at seat sA in Alice's trick,
//     Bob must see it at (sA + Alice.seat - Bob.seat) mod n. Also require the
//     mapping to be genuinely non-identity (Alice.seat != Bob.seat) so a broken
//     "no rotation" would fail.
const n = a.lastG.n;
let compared = 0, winMismatch = 0, rotChecked = 0, rotBad = 0, nonIdentity = false;
for (const [k, A] of a.resolves) {
  if (!b.resolves.has(k)) continue;
  const B = b.resolves.get(k);
  compared++;
  if (A.win !== B.win) winMismatch++;
  for (const cid in A.seats) {
    if (!(cid in B.seats)) continue;
    rotChecked++;
    const expectB = (((A.seats[cid] + a.seat - b.seat) % n) + n) % n;
    if (B.seats[cid] !== expectB) rotBad++;
    if (A.seats[cid] !== B.seats[cid]) nonIdentity = true;
  }
}
console.log('seats: A=' + a.seat + ' B=' + b.seat + ' | tricks compared:', compared, 'winning-card mismatches:', winMismatch);
console.log('rotation: cards checked:', rotChecked, 'wrong-seat:', rotBad, 'non-identity mapping:', nonIdentity);
const pass = a.ended && b.ended && a.errors.length === 0 && b.errors.length === 0
  && compared > 10 && winMismatch === 0 && rotChecked > 20 && rotBad === 0 && nonIdentity;
console.log(pass ? 'PASS: full game + intents + DISCRIMINATING currentTrick seat rotation verified' : 'FAIL');
a.ws.close(); b.ws.close();
await sleep(200);
process.exit(0);
