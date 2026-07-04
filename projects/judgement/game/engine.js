/* Judgement / Oh Hell, pure game engine + controller.
   Seat 0 is always the human. Bots are seats 1..n-1.
   House rules (per Nick): trump is RANDOM each round, dealing & first bid
   start LEFT of the dealer, dealer rotates clockwise. Classic Oh Hell scoring:
   make your bid exactly -> 10 + bid, else 0. Last bidder (the dealer) cannot
   make the total of all bids equal the number of cards dealt ("screw the dealer").
*/
(function () {
  const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
  const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11=J 12=Q 13=K 14=A
  const RANK_LABEL = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
  const SUIT_SYMBOL = { spades: '♠', hearts: '♥', diamonds: '♦', clubs: '♣' };
  const SUIT_COLOR = { spades: 'black', clubs: 'black', hearts: 'red', diamonds: 'red' };

  function rankLabel(r) { return RANK_LABEL[r] || String(r); }
  function cardId(c) { return c.rank + '_' + c.suit; }

  function makeDeck() {
    const d = [];
    for (const s of SUITS) for (const r of RANKS) d.push({ suit: s, rank: r });
    return d;
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // sort a hand for display: by suit group then rank desc
  function sortHand(cards, trump) {
    const order = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };
    return cards.slice().sort((x, y) => {
      if (x.suit !== y.suit) return order[x.suit] - order[y.suit];
      return y.rank - x.rank;
    });
  }

  // Build the round schedule. start cards -> down to 1 -> back up to start.
  function buildSchedule(numPlayers, startCards) {
    const maxByDeck = Math.floor(52 / numPlayers);
    const start = Math.min(startCards, maxByDeck);
    const counts = [];
    for (let c = start; c >= 1; c--) counts.push(c);
    for (let c = 2; c <= start; c++) counts.push(c);
    return counts;
  }

  function legalMoves(hand, leadSuit) {
    if (!leadSuit) return hand.slice();
    const inSuit = hand.filter((c) => c.suit === leadSuit);
    return inSuit.length ? inSuit : hand.slice();
  }

  // Which card wins the current trick.
  function trickWinner(trick, trump, leadSuit) {
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

  function score(bid, made) { return bid === made ? 10 + bid : 0; }

  /* ---------------- Bot AI ---------------- */
  // Estimate how many tricks a hand can take, for bidding.
  function botBid(hand, trump, cardCount, constraintForbidden) {
    let expected = 0;
    for (const c of hand) {
      if (c.suit === trump) {
        if (c.rank >= 13) expected += 0.95;        // K/A trump
        else if (c.rank >= 11) expected += 0.75;    // J/Q trump
        else if (c.rank >= 8) expected += 0.5;
        else expected += 0.28;                      // low trump still cuts
      } else {
        if (c.rank === 14) expected += 0.85;        // off-suit ace
        else if (c.rank === 13) expected += 0.55;   // off-suit king
        else if (c.rank === 12) expected += 0.3;
      }
    }
    let bid = Math.max(0, Math.min(cardCount, Math.round(expected)));
    if (constraintForbidden != null && bid === constraintForbidden) {
      // nudge to nearest allowed
      bid = bid > 0 ? bid - 1 : bid + 1;
      bid = Math.max(0, Math.min(cardCount, bid));
      if (bid === constraintForbidden) bid = bid + 1 <= cardCount ? bid + 1 : bid - 1;
    }
    return bid;
  }

  // Choose a card to play.
  function botPlay(hand, trick, trump, leadSuit, need, cardsLeft) {
    const legal = legalMoves(hand, leadSuit);
    if (legal.length === 1) return legal[0];
    const wantsTricks = need > 0;
    const curWinnerSeat = trick.length ? trickWinner(trick, trump, leadSuit) : null;

    // Helper: would this card currently win the trick?
    function wins(card) {
      const test = trick.concat([{ seat: -1, card }]);
      return trickWinner(test, trump, leadSuit || card.suit) === -1;
    }
    const sortedAsc = legal.slice().sort((a, b) => a.rank - b.rank);
    const sortedDesc = legal.slice().sort((a, b) => b.rank - a.rank);

    if (wantsTricks) {
      // try to win cheaply: lowest card that wins
      const winners = sortedAsc.filter(wins);
      if (winners.length) return winners[0];
      // can't win: dump lowest
      return sortedAsc[0];
    } else {
      // wants to AVOID tricks: play highest card that still loses
      const losers = sortedAsc.filter((c) => !wins(c));
      if (losers.length) return losers[losers.length - 1];
      // forced to win: play lowest winner to minimise damage
      const winners = sortedAsc.filter(wins);
      return winners.length ? winners[0] : sortedAsc[0];
    }
  }

  /* ---------------- Controller ---------------- */
  class Game {
    constructor(players, options, onUpdate) {
      this.players = players; // [{id,name,color,avatar,isBot}]
      this.options = Object.assign({ startCards: 7, dealerStart: 0 }, options || {});
      this.onUpdate = onUpdate || function () {};
      this.n = players.length;
      this.schedule = buildSchedule(this.n, this.options.startCards);
      this.roundIndex = 0;
      this.totals = players.map(() => 0);
      this.roundScores = []; // per round: array of {bid,made,pts}
      this.dealer = this.options.dealerStart % this.n;
      this.phase = 'idle';
      this.log = [];
      this.botTimer = null;
    }

    emit() { this.onUpdate(this); }

    snapshotForSave() {
      return JSON.stringify({
        players: this.players, options: this.options, roundIndex: this.roundIndex,
        totals: this.totals, dealer: this.dealer,
      });
    }

    startRound() {
      clearTimeout(this.botTimer);
      const cardCount = this.schedule[this.roundIndex];
      this.cardCount = cardCount;
      this.trump = SUITS[Math.floor(Math.random() * SUITS.length)];
      const deck = shuffle(makeDeck());
      this.hands = this.players.map(() => []);
      // deal starting LEFT of dealer
      let seat = (this.dealer + 1) % this.n;
      for (let k = 0; k < cardCount; k++) {
        for (let p = 0; p < this.n; p++) {
          this.hands[seat].push(deck.pop());
          seat = (seat + 1) % this.n;
        }
      }
      this.hands = this.hands.map((h) => sortHand(h, this.trump));
      this.bids = this.players.map(() => null);
      this.tricksWon = this.players.map(() => 0);
      this.currentTrick = [];
      this.leadSuit = null;
      this.trickNumber = 0;
      this.lastTrick = null;
      this.lastTrickWinner = null;
      this.phase = 'bidding';
      // bidding & play start left of dealer
      this.turn = (this.dealer + 1) % this.n;
      this.bidOrderEnd = this.dealer; // dealer bids last
      // dealing sound: a quick flurry
      if (window.JSound) {
        for (let i = 0; i < Math.min(cardCount * this.n, 10); i++) {
          setTimeout(() => window.JSound.deal(), i * 55);
        }
      }
      this.emit();
      this.maybeBotAct();
    }

    // forbidden bid for the LAST bidder (dealer)
    forbiddenBid() {
      const placed = this.bids.filter((b) => b !== null);
      if (placed.length !== this.n - 1) return null; // only constrains last bidder
      const sum = placed.reduce((a, b) => a + b, 0);
      const f = this.cardCount - sum;
      return f >= 0 && f <= this.cardCount ? f : null;
    }

    isLastBidder(seat) {
      return this.bids.filter((b) => b !== null).length === this.n - 1 && this.bids[seat] === null;
    }

    placeBid(seat, n) {
      if (this.phase !== 'bidding' || this.turn !== seat || this.bids[seat] !== null) return false;
      if (this.isLastBidder(seat) && n === this.forbiddenBid()) return false;
      if (n < 0 || n > this.cardCount) return false;
      this.bids[seat] = n;
      window.JSound && window.JSound.bid();
      // advance
      if (this.bids.every((b) => b !== null)) {
        this.phase = 'playing';
        this.turn = (this.dealer + 1) % this.n; // left of dealer leads first trick
      } else {
        this.turn = (this.turn + 1) % this.n;
      }
      this.emit();
      this.maybeBotAct();
      return true;
    }

    canPlay(seat, card) {
      if (this.phase !== 'playing' || this.turn !== seat) return false;
      const legal = legalMoves(this.hands[seat], this.leadSuit);
      return legal.some((c) => cardId(c) === cardId(card));
    }

    playCard(seat, card) {
      if (!this.canPlay(seat, card)) return false;
      this.hands[seat] = this.hands[seat].filter((c) => cardId(c) !== cardId(card));
      if (this.currentTrick.length === 0) this.leadSuit = card.suit;
      this.currentTrick.push({ seat, card });
      window.JSound && window.JSound.play();
      if (this.currentTrick.length === this.n) {
        this.phase = 'resolving';
        this.emit();
        this.botTimer = setTimeout(() => this.resolveTrick(), 850);
      } else {
        this.turn = (this.turn + 1) % this.n;
        this.emit();
        this.maybeBotAct();
      }
      return true;
    }

    resolveTrick() {
      const winner = trickWinner(this.currentTrick, this.trump, this.leadSuit);
      this.tricksWon[winner]++;
      this.lastTrick = this.currentTrick.slice();
      this.lastTrickWinner = winner;
      this.trickNumber++;
      window.JSound && window.JSound.trickWin();
      this.currentTrick = [];
      this.leadSuit = null;
      if (this.trickNumber >= this.cardCount) {
        this.endRound();
      } else {
        this.turn = winner; // winner leads next
        this.phase = 'playing';
        this.emit();
        this.maybeBotAct();
      }
    }

    endRound() {
      const rs = this.players.map((_, i) => {
        const pts = score(this.bids[i], this.tricksWon[i]);
        this.totals[i] += pts;
        return { bid: this.bids[i], made: this.tricksWon[i], pts };
      });
      this.roundScores.push(rs);
      this.phase = 'roundEnd';
      window.JSound && window.JSound.roundEnd();
      this.emit();
    }

    nextRound() {
      if (this.roundIndex >= this.schedule.length - 1) {
        this.phase = 'gameEnd';
        window.JSound && window.JSound.win();
        this.emit();
        return;
      }
      this.roundIndex++;
      this.dealer = (this.dealer + 1) % this.n;
      this.startRound();
    }

    maybeBotAct() {
      clearTimeout(this.botTimer);
      const seat = this.turn;
      if (!this.players[seat] || !this.players[seat].isBot) return;
      if (this.phase === 'bidding') {
        this.botTimer = setTimeout(() => {
          const forbidden = this.isLastBidder(seat) ? this.forbiddenBid() : null;
          const b = botBid(this.hands[seat], this.trump, this.cardCount, forbidden);
          this.placeBid(seat, b);
        }, 700);
      } else if (this.phase === 'playing') {
        this.botTimer = setTimeout(() => {
          const need = this.bids[seat] - this.tricksWon[seat];
          const card = botPlay(this.hands[seat], this.currentTrick, this.trump, this.leadSuit, need, this.hands[seat].length);
          this.playCard(seat, card);
        }, 650);
      }
    }
  }

  window.JEngine = {
    SUITS, RANKS, RANK_LABEL, SUIT_SYMBOL, SUIT_COLOR,
    rankLabel, cardId, makeDeck, shuffle, sortHand, buildSchedule,
    legalMoves, trickWinner, score, botBid, botPlay, Game,
  };
})();
