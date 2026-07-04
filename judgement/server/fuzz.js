/* Headless fuzz test for the ported rules (server/engine.js).
   Plays full bot-vs-bot games and asserts no rule is ever violated. Mirrors the
   client engine's original "100 games, zero violations" check so drift between
   game/engine.js and server/engine.js gets caught.  Run: node fuzz.js */
import * as E from './engine.js';

function assert(cond, msg) { if (!cond) { throw new Error('RULE VIOLATION: ' + msg); } }

function playGame(n) {
  const schedule = E.buildSchedule(n, Math.floor(52 / n));
  const totals = Array(n).fill(0);
  let dealer = 0;

  for (let ri = 0; ri < schedule.length; ri++) {
    const cardCount = schedule[ri];
    const { hands, trump } = E.dealRound(n, dealer, cardCount);
    assert(hands.every((h) => h.length === cardCount), `deal size r${ri}`);
    // total dealt cards never exceeds the deck
    assert(cardCount * n <= 52, `deck overflow r${ri}`);

    // --- bidding: left of dealer first, dealer last ---
    const bids = Array(n).fill(null);
    let turn = (dealer + 1) % n;
    for (let k = 0; k < n; k++) {
      const seat = turn;
      const last = E.isLastBidder(bids, seat, n);
      const forbidden = last ? E.forbiddenBid(bids, n, cardCount) : null;
      const bid = E.botBid(hands[seat], trump, cardCount, forbidden);
      assert(bid >= 0 && bid <= cardCount, `bid range seat${seat} r${ri}`);
      if (last && forbidden != null) assert(bid !== forbidden, `screw-the-dealer violated r${ri}`);
      bids[seat] = bid;
      turn = (turn + 1) % n;
    }
    // "screw the dealer": totals must NOT equal cardCount
    assert(bids.reduce((a, b) => a + b, 0) !== cardCount, `bid sum == cards r${ri}`);

    // --- play ---
    const tricksWon = Array(n).fill(0);
    turn = (dealer + 1) % n; // left of dealer leads
    for (let trick = 0; trick < cardCount; trick++) {
      const played = [];
      let leadSuit = null;
      for (let k = 0; k < n; k++) {
        const seat = turn;
        const need = bids[seat] - tricksWon[seat];
        const legal = E.legalMoves(hands[seat], leadSuit);
        const card = E.botPlay(hands[seat], played, trump, leadSuit, need);
        assert(legal.some((c) => E.cardId(c) === E.cardId(card)), `illegal play seat${seat} r${ri} t${trick}`);
        if (played.length === 0) leadSuit = card.suit;
        hands[seat] = hands[seat].filter((c) => E.cardId(c) !== E.cardId(card));
        played.push({ seat, card });
        turn = (turn + 1) % n;
      }
      const winner = E.trickWinner(played, trump, leadSuit);
      tricksWon[winner]++;
      turn = winner;
    }
    assert(hands.every((h) => h.length === 0), `hands empty after round r${ri}`);
    assert(tricksWon.reduce((a, b) => a + b, 0) === cardCount, `tricks sum r${ri}`);

    for (let s = 0; s < n; s++) {
      const pts = E.score(bids[s], tricksWon[s]);
      assert(pts === (bids[s] === tricksWon[s] ? 10 + bids[s] : 0), `score seat${s} r${ri}`);
      totals[s] += pts;
    }
    dealer = (dealer + 1) % n;
  }
  return totals;
}

let games = 0;
for (const n of [3, 4, 5, 6, 8]) {
  for (let i = 0; i < 20; i++) { playGame(n); games++; }
}
console.log(`OK: ${games} full games across 3/4/5/6/8 players, zero rule violations.`);
