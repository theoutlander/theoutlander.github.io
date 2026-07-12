/* Table screen container + round-end / game-end moments. */
(function () {
  const e = React.createElement;
  const { Avatar, SuitBadge } = window.JUI;
  const { OpponentSeat, RoundTable, TrickZone, HandFan, BidPanel, BidStatus, ScoreStrip, ScoreCard } = window.JTable;
  const Card = window.Card;

  function youStatus(game) {
    if (game.bids[0] === null) return null;
    const need = game.bids[0] - game.tricksWon[0];
    const left = game.cardCount - game.trickNumber;
    if (need === 0) return e('span', null, 'Bid ', e('b', { className: 'em' }, game.bids[0]), ' · ', e('span', { className: 'ok' }, 'exactly there, dodge the rest'));
    if (need < 0) return e('span', null, 'Bid ', e('b', null, game.bids[0]), ' · ', e('span', { className: 'warn' }, 'over by ' + (-need) + ', you’ll score 0'));
    if (need > left) return e('span', null, 'Bid ', e('b', null, game.bids[0]), ' · ', e('span', { className: 'warn' }, 'can’t get there now'));
    return e('span', null, 'Bid ', e('b', { className: 'em' }, game.bids[0]), ' · need ', e('b', { className: 'em' }, need), ' more');
  }

  function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

  // compact round progress for the always-visible status pill
  function youProgress(game) {
    const bid = game.bids[0];
    if (bid === null) return e('span', { style: { opacity: .75 } }, 'Your bid soon…');
    const won = game.tricksWon[0];
    const need = bid - won;
    let cls = 'pp-ok';
    if (need === 0) cls = 'pp-hit';
    else if (need < 0) cls = 'pp-over';
    return e('span', null, 'You’ve won ', e('b', { className: cls }, won), ' of ', e('b', { className: cls }, bid),
      need === 0 ? e('span', { className: 'pp-hit' }, ' ✓') : null);
  }

  function RoundEndModal({ game, onNext }) {
    const last = game.roundScores[game.roundScores.length - 1];
    const isFinal = game.roundIndex >= game.schedule.length - 1;
    // online ready-check: don't let one tap advance the round for everyone
    const online = Array.isArray(game.ready);
    const iReady = online && game.ready[0];
    let readyCount = 0, humanCount = 0;
    if (online) game.players.forEach((p, i) => { if (!p.isBot && !p.auto && p.connected) { humanCount++; if (game.ready[i]) readyCount++; } });
    const order = game.players.map((p, i) => ({ p, i, s: last[i], t: game.totals[i] }))
      .sort((a, b) => b.t - a.t);
    // rank movement vs before this round scored (up/down in the race)
    const showMove = game.roundIndex > 0;
    const prevTotals = game.players.map((_, i) => game.totals[i] - last[i].pts);
    const prevRank = {};
    game.players.map((_, i) => i).sort((a, b) => prevTotals[b] - prevTotals[a]).forEach((i, r) => { prevRank[i] = r; });
    const you = last[0];
    const youMade = you.pts > 0;
    return e('div', { className: 'overlay center' },
      e('div', { className: 'modal card-surface pad', onClick: (ev) => ev.stopPropagation() },
        e('div', { className: 're-head' }, 'Round ' + (game.roundIndex + 1) + ' done'),
        // your result, in plain words, front and center
        e('div', { className: 're-you ' + (youMade ? 'made' : 'miss') },
          e('div', { className: 're-you-big' }, youMade ? 'You made it!' : 'You missed it'),
          e('div', { className: 're-you-sub' },
            youMade
              ? 'You called ' + you.bid + ' and won ' + you.made + '.'
              : 'You called ' + you.bid + ' but won ' + you.made + '.'),
          e('div', { className: 're-you-pts ' + (youMade ? 'good' : 'zero') }, youMade ? '+' + you.pts : '+0')
        ),
        // everyone, ranked by total
        e('div', { className: 're-list' }, order.map((o, k) => {
          const made = o.s.pts > 0;
          return e('div', { key: o.i, className: 're-row ' + (made ? 'made' : 'miss') + (o.i === 0 ? ' me' : '') },
            e('div', { className: 're-mark ' + (made ? 'good' : 'bad') }, made ? '✓' : '✗'),
            e('div', { className: 'col', style: { minWidth: 0 } },
              e('div', { className: 're-nm' }, o.i === 0 ? 'You' : o.p.name),
              e('div', { className: 're-res ' + (made ? 'good' : 'zero') }, made ? 'Made it' : 'Missed')
            ),
            showMove ? (function () {
              const mv = prevRank[o.i] - k;
              const cls = mv > 0 ? 'up' : (mv < 0 ? 'down' : 'same');
              return e('div', { className: 're-move ' + cls }, mv > 0 ? '▲' + mv : (mv < 0 ? '▼' + (-mv) : '–'));
            })() : null,
            e('div', { className: 're-tot tnum', style: { marginLeft: showMove ? '10px' : 'auto' } }, o.t)
          );
        })),
        e('button', { className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 16 }, disabled: iReady, onClick: () => { if (!iReady) onNext(); } },
          iReady ? ('Waiting for others… ' + readyCount + '/' + humanCount) : (isFinal ? 'See who won →' : 'Next round →'))
      )
    );
  }

  function Confetti({ colors }) {
    const dots = React.useMemo(() => Array.from({ length: 44 }).map((_, i) => ({
      left: Math.random() * 100, delay: Math.random() * 0.6, dur: 1.6 + Math.random() * 1.4,
      color: colors[i % colors.length], rot: Math.random() * 360,
    })), []);
    return e('div', { className: 'celebrate' }, dots.map((d, i) =>
      e('div', { key: i, className: 'confetti', style: {
        left: d.left + '%', background: d.color, animationDuration: d.dur + 's', animationDelay: d.delay + 's',
        transform: 'rotate(' + d.rot + 'deg)',
      } })
    ));
  }

  function GameEndModal({ game, onSave, onHome, saved }) {
    const order = game.players.map((p, i) => ({ p, i, t: game.totals[i] })).sort((a, b) => b.t - a.t);
    const winner = order[0];
    const youWon = winner.i === 0;
    return e('div', { className: 'overlay center' },
      e(Confetti, { colors: game.players.map((p) => p.color) }),
      e('div', { className: 'modal card-surface pad', onClick: (ev) => ev.stopPropagation() },
        e('div', { className: 'col center', style: { marginBottom: 10 } },
          e('div', { className: 'eyebrow', style: { color: 'var(--ink-faint)' } }, 'Winner'),
          e(Avatar, { player: winner.p, size: 72 }),
          e('h2', { style: { fontSize: 28, marginTop: 8 } }, winner.p.name),
          e('div', { className: 'muted' }, youWon ? 'You took it! 🏆' : winner.t + ' points')
        ),
        e('div', null, order.map((o, k) =>
          e('div', { key: o.i, className: 're-row' },
            e('div', { style: { width: 24, fontWeight: 800, color: 'var(--ink-faint)' } }, '#' + (k + 1)),
            e(Avatar, { player: o.p, size: 34 }),
            e('div', { style: { fontWeight: 700 } }, o.p.name),
            e('div', { className: 're-pts good', style: { color: k === 0 ? 'var(--good)' : 'var(--ink)' } }, o.t)
          )
        )),
        e('div', { className: 'col', style: { gap: 10, marginTop: 16 } },
          e('button', { className: 'btn btn-primary btn-block btn-lg', onClick: onSave, disabled: saved },
            saved ? 'Saved to leaderboard ✓' : 'Save result to leaderboard'),
          e('button', { className: 'btn btn-paper btn-block', onClick: onHome }, 'Back to home')
        )
      )
    );
  }

  function TableScreen({ game, onMenu, onSaveResult, onHome, sound, onToggleSound }) {
    const [showCard, setShowCard] = React.useState(false);
    const [saved, setSaved] = React.useState(false);
    const yourBidTurn = game.phase === 'bidding' && game.turn === 0;
    const yourPlayTurn = game.phase === 'playing' && game.turn === 0;
    const active = game.players[game.turn];
    const activeName = active ? active.name : '';
    const activeColor = active ? active.color : 'var(--accent)';

    function play(card) {
      if (!game.playCard(0, card)) { window.JSound && window.JSound.error(); }
    }
    function bid(n) { game.placeBid(0, n); }

    return e('div', { className: 'table-screen' },
      e('div', { className: 'safe-top' }),
      // top bar, just the menu + round info, kept calm
      e('div', { className: 'table-top' },
        e('div', { className: 'round-bar' },
          e('div', { className: 'row', style: { gap: 8 } },
            e('button', { className: 'icon-btn', onClick: onMenu, 'aria-label': 'Menu' }, '☰'),
            e('button', { className: 'icon-btn', onClick: onToggleSound, 'aria-label': 'Sound' }, sound ? '🔊' : '🔇')),
          e('div', { className: 'round-info' },
            e('span', { className: 'ri-round' }, 'Round ' + (game.roundIndex + 1) + ' / ' + game.schedule.length),
            e('span', { className: 'ri-cards' }, game.cardCount + (game.cardCount === 1 ? ' card' : ' cards'))),
          e('div', { className: 'deck-stat' },
            e('div', { className: 'ds-item' }, e('b', null, game.n * game.cardCount), e('span', null, 'in play')),
            e('div', { className: 'ds-item' }, e('b', null, 52 - game.n * game.cardCount), e('span', null, 'in deck')))
        )
      ),
      // the round table: everyone seated around the oval, cards land in front of each.
      // during YOUR call, the bid wheel lives in the center here (nothing below shifts).
      e(RoundTable, { game, onBid: bid }),
      // Hukum reminder chip below You / above the cards, shown the whole round
      // (during your bid the slide-up panel carries its own Hukum label).
      e('div', { className: 'turnrow' },
        game.phase !== 'roundEnd' && game.phase !== 'gameEnd'
          ? e('div', { className: 'hukum-chip ' + window.JEngine.SUIT_COLOR[game.trump] },
              e('span', { className: 'hukum-ic' }, window.JEngine.SUIT_SYMBOL[game.trump]),
              e('span', { className: 'hukum-lbl' }, 'Hukum'))
          : null),
      // hand + slide-up bid panel docked right above the cards
      e('div', { className: 'hand-zone' },
        yourBidTurn ? e('div', { className: 'bid-sheet' }, e(window.JTable.BidWheel, { game, onBid: bid })) : null,
        e('div', { className: yourPlayTurn ? 'hand-wrap your-turn' : 'hand-wrap' },
          e(HandFan, { game, onPlay: play })
        )
      ),
      // scoreboard, ALWAYS present so the bottom never changes height
      e(ScoreStrip, { game, onExpand: () => setShowCard(true) }),

      showCard ? e(ScoreCard, { game, onClose: () => setShowCard(false) }) : null,
      game.phase === 'roundEnd' ? e(RoundEndModal, { game, onNext: () => game.nextRound() }) : null,
      game.phase === 'gameEnd' ? e(GameEndModal, {
        game, saved,
        onSave: () => { if (!saved) { onSaveResult(game); setSaved(true); window.JSound && window.JSound.win(); } },
        onHome,
      }) : null
    );
  }

  window.TableScreen = TableScreen;
})();
