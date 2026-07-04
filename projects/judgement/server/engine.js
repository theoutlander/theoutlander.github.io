/* Judgement / Oh Hell — PURE RULES, server (ESM) port of game/engine.js.
   These are the exact fuzz-tested rules from the client engine, with zero
   browser/DOM/sound dependencies so they run in a Cloudflare Worker / Durable
   Object. The round/turn *orchestration* (broadcasts, timers, bots) lives in
   room.js; this file only owns the rules.

   House rules (per Nick): trump is RANDOM each round; dealing & first bid start
   LEFT of the dealer; dealer is the last bidder and rotates clockwise. Classic
   Oh Hell scoring: make your bid exactly -> 10 + bid, else 0. Last bidder (the
   dealer) cannot make the bids sum to the number of cards ("screw the dealer").

   KEEP IN SYNC with game/engine.js. server/fuzz.js re-runs the 100-game fuzz
   test against this module so drift is caught. */

export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11=J 12=Q 13=K 14=A
export const RANK_LABEL = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
export const SUIT_SYMBOL = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
export const SUIT_COLOR = { spades: 'black', clubs: 'black', hearts: 'red', diamonds: 'red' };

export function rankLabel(r) { return RANK_LABEL[r] || String(r); }
export function cardId(c) { return c.rank + '_' + c.suit; }

export function makeDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r });
  return d;
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// sort a hand for display: by suit group then rank desc
export function sortHand(cards) {
  const order = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };
  return cards.slice().sort((x, y) => {
    if (x.suit !== y.suit) return order[x.suit] - order[y.suit];
    return y.rank - x.rank;
  });
}

// Build the round schedule. start cards -> down to 1 -> back up to start.
export function buildSchedule(numPlayers, startCards) {
  const maxByDeck = Math.floor(52 / numPlayers);
  const start = Math.min(startCards, maxByDeck);
  const counts = [];
  for (let c = start; c >= 1; c--) counts.push(c);
  for (let c = 2; c <= start; c++) counts.push(c);
  return counts;
}

export function legalMoves(hand, leadSuit) {
  if (!leadSuit) return hand.slice();
  const inSuit = hand.filter((c) => c.suit === leadSuit);
  return inSuit.length ? inSuit : hand.slice();
}

// Which SEAT wins the current trick.
export function trickWinner(trick, trump, leadSuit) {
  let best = trick[0];
  for (const play of trick) {
    const c = play.card, b = best.card;
    const cTrump = c.suit === trump, bTrump = b.suit === trump;
    if (cTrump && !bTrump) best = play;
    else if (cTrump && bTrump) { if (c.rank > b.rank) best = play; }
    else if (!cTrump && !bTrump) {
      if (c.suit === leadSuit && b.suit === leadSuit) { if (c.rank > b.rank) best = play; }
      else if (c.suit === leadSuit && b.suit !== leadSuit) best = play;
    }
  }
  return best.seat;
}

export function score(bid, made) { return bid === made ? 10 + bid : 0; }

/* ---------------- Bot AI (same heuristics as client) ---------------- */
export function botBid(hand, trump, cardCount, constraintForbidden) {
  let expected = 0;
  for (const c of hand) {
    if (c.suit === trump) {
      if (c.rank >= 13) expected += 0.95;
      else if (c.rank >= 11) expected += 0.75;
      else if (c.rank >= 8) expected += 0.5;
      else expected += 0.28;
    } else {
      if (c.rank === 14) expected += 0.85;
      else if (c.rank === 13) expected += 0.55;
      else if (c.rank === 12) expected += 0.3;
    }
  }
  let bid = Math.max(0, Math.min(cardCount, Math.round(expected)));
  if (constraintForbidden != null && bid === constraintForbidden) {
    bid = bid > 0 ? bid - 1 : bid + 1;
    bid = Math.max(0, Math.min(cardCount, bid));
    if (bid === constraintForbidden) bid = bid + 1 <= cardCount ? bid + 1 : bid - 1;
  }
  return bid;
}

export function botPlay(hand, trick, trump, leadSuit, need) {
  const legal = legalMoves(hand, leadSuit);
  if (legal.length === 1) return legal[0];
  const wantsTricks = need > 0;
  function wins(card) {
    const test = trick.concat([{ seat: -1, card }]);
    return trickWinner(test, trump, leadSuit || card.suit) === -1;
  }
  const sortedAsc = legal.slice().sort((a, b) => a.rank - b.rank);
  if (wantsTricks) {
    const winners = sortedAsc.filter(wins);
    if (winners.length) return winners[0];
    return sortedAsc[0];
  } else {
    const losers = sortedAsc.filter((c) => !wins(c));
    if (losers.length) return losers[losers.length - 1];
    const winners = sortedAsc.filter(wins);
    return winners.length ? winners[0] : sortedAsc[0];
  }
}

// Deal one round: returns { hands: seat->cards[], trump }. Deals starting LEFT
// of the dealer, matching the physical game and the client engine exactly.
export function dealRound(n, dealer, cardCount) {
  const trump = SUITS[Math.floor(Math.random() * SUITS.length)];
  const deck = shuffle(makeDeck());
  const hands = Array.from({ length: n }, () => []);
  let seat = (dealer + 1) % n;
  for (let k = 0; k < cardCount; k++) {
    for (let p = 0; p < n; p++) {
      hands[seat].push(deck.pop());
      seat = (seat + 1) % n;
    }
  }
  return { hands: hands.map((h) => sortHand(h)), trump };
}

// The one bid the LAST bidder (dealer) cannot make, given bids placed so far.
export function forbiddenBid(bids, n, cardCount) {
  const placed = bids.filter((b) => b !== null);
  if (placed.length !== n - 1) return null;
  const sum = placed.reduce((a, b) => a + b, 0);
  const f = cardCount - sum;
  return f >= 0 && f <= cardCount ? f : null;
}

export function isLastBidder(bids, seat, n) {
  return bids.filter((b) => b !== null).length === n - 1 && bids[seat] === null;
}
