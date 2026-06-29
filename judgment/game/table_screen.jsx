/* Table screen container + round-end / game-end moments. */
(function () {
  const e = React.createElement;
  const { Avatar, SuitBadge } = window.JUI;
  const { OpponentSeat, TrickZone, HandFan, BidPanel, ScoreStrip, ScoreCard } = window.JTable;
  const Card = window.Card;

  function youStatus(game) {
    if (game.bids[0] === null) return null;
    const need = game.bids[0] - game.tricksWon[0];
    const left = game.cardCount - game.trickNumber;
    if (need === 0) return e('span', null, 'Bid ', e('b', { className: 'em' }, game.bids[0]), ' \u00b7 ', e('span', { className: 'ok' }, 'exactly there \u2014 dodge the rest'));
    if (need < 0) return e('span', null, 'Bid ', e('b', null, game.bids[0]), ' \u00b7 ', e('span', { className: 'warn' }, 'over by ' + (-need) + ' \u2014 you\u2019ll score 0'));
    if (need > left) return e('span', null, 'Bid ', e('b', null, game.bids[0]), ' \u00b7 ', e('span', { className: 'warn' }, 'can\u2019t get there now'));
    return e('span', null, 'Bid ', e('b', { className: 'em' }, game.bids[0]), ' \u00b7 need ', e('b', { className: 'em' }, need), ' more');
  }

  function RoundEndModal({ game, onNext }) {
    const last = game.roundScores[game.roundScores.length - 1];
    const isFinal = game.roundIndex >= game.schedule.length - 1;
    const order = game.players.map((p, i) => ({ p, i, s: last[i], t: game.totals[i] }))
      .sort((a, b) => b.t - a.t);
    return e('div', { className: 'overlay center' },
      e('div', { className: 'modal card-surface pad', onClick: (ev) => ev.stopPropagation() },
        e('div', { className: 'row between', style: { marginBottom: 6 } },
          e('h3', { style: { fontSize: 24 } }, 'Round ' + (game.roundIndex + 1) + ' done'),
          e('div', { className: 'pill', style: { background: 'var(--paper-2)', color: 'var(--ink-soft)' } },
            game.cardCount + (game.cardCount === 1 ? ' card' : ' cards'), ' \u00b7 ', e(SuitBadge, { suit: game.trump, size: 'sm' }))
        ),
        e('div', null, order.map((o) => {
          const made = o.s.pts > 0;
          return e('div', { key: o.i, className: 're-row' },
            e(Avatar, { player: o.p, size: 38 }),
            e('div', { className: 'col' },
              e('div', { style: { fontWeight: 700 } }, o.p.name),
              e('div', { className: 're-bid' }, 'bid ' + o.s.bid + ' \u00b7 took ' + o.s.made + (made ? ' \u2713' : ' \u2717'))
            ),
            e('div', { className: 'col', style: { marginLeft: 'auto', alignItems: 'flex-end' } },
              e('div', { className: 're-pts ' + (made ? 'good' : 'zero') }, made ? '+' + o.s.pts : '0'),
              e('div', { className: 're-bid tnum' }, o.t + ' total')
            )
          );
        })),
        e('button', { className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 16 }, onClick: onNext },
          isFinal ? 'See final results \u2192' : 'Next round \u2192')
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
          e('div', { className: 'muted' }, youWon ? 'You took it! \uD83C\uDFC6' : winner.t + ' points')
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
            saved ? 'Saved to leaderboard \u2713' : 'Save result to leaderboard'),
          e('button', { className: 'btn btn-paper btn-block', onClick: onHome }, 'Back to home')
        )
      )
    );
  }

  function TableScreen({ game, onMenu, onChat, onSaveResult, onHome }) {
    const [showCard, setShowCard] = React.useState(false);
    const [saved, setSaved] = React.useState(false);
    const [videoOn, setVideoOn] = React.useState(false);
    const [stream, setStream] = React.useState(null);
    const [micOn, setMicOn] = React.useState(true);
    const [camOn, setCamOn] = React.useState(true);
    const yourBidTurn = game.phase === 'bidding' && game.turn === 0;
    const yourPlayTurn = game.phase === 'playing' && game.turn === 0;

    function toggleVideo() {
      window.JSound && window.JSound.click();
      if (videoOn) {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        setStream(null); setVideoOn(false); return;
      }
      setVideoOn(true); setCamOn(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((s) => setStream(s))
          .catch(() => setStream(null)); // permission denied → graceful fallback tile
      }
    }
    function toggleMic() {
      const v = !micOn; setMicOn(v);
      if (stream) stream.getAudioTracks().forEach((t) => (t.enabled = v));
    }
    function toggleCam() {
      const v = !camOn; setCamOn(v);
      if (stream) stream.getVideoTracks().forEach((t) => (t.enabled = v));
    }
    React.useEffect(() => () => { if (stream) stream.getTracks().forEach((t) => t.stop()); }, [stream]);

    function play(card) {
      if (!game.playCard(0, card)) { window.JSound && window.JSound.error(); }
    }
    function bid(n) { game.placeBid(0, n); }

    return e('div', { className: 'table-screen' },
      e('div', { className: 'safe-top' }),
      // top bar
      e('div', { className: 'table-top' },
        e('div', { className: 'round-bar' },
          e('div', { className: 'row', style: { gap: 8 } },
            e('button', { className: 'icon-btn', onClick: onMenu, 'aria-label': 'Menu' }, '\u2630'),
            e('button', { className: 'icon-btn', onClick: onChat, 'aria-label': 'Chat', style: { position: 'relative' } },
              '\uD83D\uDCAC', e('span', { className: 'chat-dot' })),
            e('button', { className: 'icon-btn' + (videoOn ? ' on' : ''), onClick: toggleVideo, 'aria-label': 'Video' }, '\uD83D\uDCF9')
          ),
          e('div', { className: 'col center', style: { whiteSpace: 'nowrap' } },
            e('div', { className: 'eyebrow' }, 'Round ' + (game.roundIndex + 1) + ' of ' + game.schedule.length),
            e('div', { style: { fontWeight: 800, fontSize: 15 } }, game.cardCount + (game.cardCount === 1 ? ' card' : ' cards'))
          ),
          e('div', { className: 'rb-trump' },
            e('span', { className: 'lbl' }, 'Trump'),
            e(SuitBadge, { suit: game.trump, size: 'md' })
          )
        )
      ),
      // opponents — video tiles when conference is on, otherwise avatar seats
      videoOn
        ? e('div', { className: 'video-strip' },
            game.players.map((p, i) => i === 0
              ? e(window.JTable.SelfView, { key: 'self', player: p, stream, micOn, camOn, onToggleMic: toggleMic, onToggleCam: toggleCam })
              : e(window.JTable.VideoTile, { key: i, player: p, idx: i, game })))
        : e('div', { className: 'opps' },
            game.players.map((p, i) => i === 0 ? null : e(OpponentSeat, { key: i, player: p, idx: i, game })).filter(Boolean)
          ),
      // trick zone (always shows the table; bid is a slim bar below the hand)
      e('div', { style: { flex: 1, position: 'relative' } },
        e('div', { className: 'felt-mark' }),
        e(TrickZone, { game })
      ),
      // your status — make YOUR TURN obvious
      yourBidTurn ? null : e('div', { className: 'you-bar' },
        yourPlayTurn
          ? e('div', { className: 'turn-banner' },
              e('span', { className: 'turn-dot' }),
              e('span', null, 'Your turn'),
              e('span', { className: 'turn-sub' }, '\u00b7 play a card'))
          : e('div', { className: 'row', style: { gap: 8 } },
              e(Avatar, { player: game.players[0], size: 34 }),
              e('div', { className: 'you-status' }, youStatus(game) || e('span', { style: { opacity: .6 } }, 'Waiting\u2026')))
      ),
      // hand (always visible & large)
      e('div', { className: yourPlayTurn ? 'hand-wrap your-turn' : 'hand-wrap' },
        e(HandFan, { game, onPlay: play })
      ),
      // bid bar appears below the hand on your turn
      yourBidTurn ? e(BidPanel, { game, onBid: bid }) : null,
      // score strip
      e(ScoreStrip, { game, onExpand: () => setShowCard(true) }),

      // overlays
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
