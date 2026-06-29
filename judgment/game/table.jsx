/* The game table — the heart of Judgment. Phone-first. */
(function () {
  const e = React.createElement;
  const { Avatar, SuitBadge } = window.JUI;
  const { SUIT_SYMBOL, SUIT_COLOR, rankLabel } = window.JEngine;
  const Card = window.Card;

  function seatAngle(relative, n) {
    // relative 0 (self) at bottom; others spread clockwise
    return (90 + relative * (360 / n)) * Math.PI / 180;
  }

  /* ---- a seat chip for opponents (top / sides) ---- */
  function OpponentSeat({ player, idx, game }) {
    const active = game.turn === idx && (game.phase === 'bidding' || game.phase === 'playing');
    const bid = game.bids[idx];
    const won = game.tricksWon[idx];
    const bidding = game.phase === 'bidding';
    return e('div', { className: 'opp', style: { opacity: 1 } },
      e(Avatar, { player, size: 46, ring: active }),
      e('div', { className: 'opp-name' + (active ? ' active' : '') }, player.name),
      e('div', { className: 'opp-stat' },
        bid === null
          ? e('span', { className: 'opp-thinking' }, bidding ? (active ? 'bidding\u2026' : 'waiting') : '\u00b7')
          : e('span', null,
              e('b', { className: won === bid ? 'hit' : (won > bid ? 'over' : '') }, won),
              e('span', { className: 'slash' }, '/'),
              e('span', null, bid)
            )
      )
    );
  }

  /* ---- video conference tiles ---- */
  // Mocked remote feed: a soft animated gradient from the player's color + initial.
  // Claude Code swaps .vfeed for a <video> bound to the WebRTC stream.
  function VideoTile({ player, idx, game }) {
    const active = game.turn === idx && (game.phase === 'bidding' || game.phase === 'playing');
    const bid = game.bids[idx], won = game.tricksWon[idx];
    const c = player.color;
    const grad = 'linear-gradient(135deg,' + window.JUI.tint(c, 0.25) + ',' + c + ' 60%, #11161f)';
    return e('div', { className: 'vtile' + (active ? ' active' : '') },
      e('div', { className: 'vfeed sim', style: { background: grad } }, (player.name || '?')[0].toUpperCase()),
      e('span', { className: 'vlive' }),
      e('span', { className: 'vmic' }, '\uD83D\uDD0A'),
      e('div', { className: 'vname' },
        e('span', null, player.name),
        bid === null ? null : e('span', { className: 'vb' }, won + '/' + bid))
    );
  }

  function SelfView({ player, stream, micOn, camOn, onToggleMic, onToggleCam }) {
    const ref = React.useRef(null);
    React.useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [stream, camOn]);
    return e('div', { className: 'vtile self' },
      e('div', { className: 'vcontrols' },
        e('button', { className: 'vctrl' + (micOn ? '' : ' off'), onClick: onToggleMic, 'aria-label': 'Mic' }, micOn ? '\uD83C\uDF99\uFE0F' : '\uD83D\uDD07'),
        e('button', { className: 'vctrl' + (camOn ? '' : ' off'), onClick: onToggleCam, 'aria-label': 'Camera' }, camOn ? '\uD83D\uDCF9' : '\uD83D\uDEAB')
      ),
      (stream && camOn)
        ? e('video', { ref, autoPlay: true, muted: true, playsInline: true })
        : e('div', { className: 'vfeed', style: { background: 'linear-gradient(135deg,' + window.JUI.tint(player.color, 0.2) + ',#11161f)' } }, (player.name || 'You')[0].toUpperCase()),
      e('div', { className: 'vname' }, 'You')
    );
  }

  /* ---- center trick area ---- */
  function TrickZone({ game }) {
    const n = game.n;
    const cards = game.currentTrick;
    const R = n <= 4 ? 76 : n <= 6 ? 86 : 96;
    const cw = n <= 6 ? 76 : 64;
    return e('div', { className: 'trickzone' },
      e('div', { className: 'trick-center' },
        cards.length === 0 && game.phase === 'playing'
          ? e('div', { className: 'trick-hint' }, game.turn === 0 ? 'Your lead' : (game.players[game.turn] ? game.players[game.turn].name + ' leads' : ''))
          : null,
        cards.map((p) => {
          const rel = (p.seat - 0 + n) % n;
          const a = seatAngle(rel, n);
          const x = Math.cos(a) * R, y = Math.sin(a) * R;
          const winner = game.phase === 'resolving' && game.lastTrickWinner == null;
          return e('div', {
            key: p.seat, className: 'trick-card',
            style: { transform: `translate(-50%,-50%) translate(${x}px, ${y}px)` },
          },
            e(Card, { card: p.card, width: cw, faceStyle: game.options.faceStyle }),
            e('div', { className: 'trick-tag', style: { background: game.players[p.seat].color } }, game.players[p.seat].name)
          );
        })
      )
    );
  }

  /* ---- your hand ---- */
  function HandFan({ game, onPlay }) {
    const hand = game.hands[0] || [];
    const yourTurn = game.phase === 'playing' && game.turn === 0;
    const legal = yourTurn ? window.JEngine.legalMoves(hand, game.leadSuit) : [];
    const legalIds = new Set(legal.map((c) => window.JEngine.cardId(c)));
    const count = hand.length;
    // size cards as large as possible to fill the available width (low-vision friendly)
    const avail = Math.min(window.innerWidth, 480) - 20;
    const maxW = 118;
    // how much each card is hidden behind the next (more cards => more overlap)
    const f = count <= 4 ? 0.16 : count <= 7 ? 0.34 : count <= 10 ? 0.46 : 0.56;
    let w = Math.floor(avail / (1 + (count - 1) * (1 - f)));
    w = Math.max(58, Math.min(maxW, w));
    const overlap = -(w * f);
    return e('div', { className: 'hand', style: { '--ov': overlap + 'px' } },
      hand.map((c, i) => {
        const isLegal = legalIds.has(window.JEngine.cardId(c));
        const playable = yourTurn && isLegal;
        return e('div', {
          key: window.JEngine.cardId(c), className: 'hand-card' + (playable ? ' playable' : ''),
          style: { marginLeft: i === 0 ? 0 : 'var(--ov)', zIndex: i },
          onClick: () => playable && onPlay(c),
        },
          e(Card, {
            card: c, width: w, faceStyle: game.options.faceStyle,
            legal: playable, illegal: yourTurn && !isLegal, selectable: playable,
          })
        );
      })
    );
  }

  /* ---- bid panel (slides up on your bidding turn) ---- */
  function BidPanel({ game, onBid }) {
    const cardCount = game.cardCount;
    const forbidden = game.isLastBidder(0) ? game.forbiddenBid() : null;
    const isBad = (i) => forbidden != null && i === forbidden;
    return e('div', { className: 'bidbar' },
      e('div', { className: 'bidbar-q' }, 'How many hands will you win?'),
      e('div', { className: 'bidbar-nums' },
        Array.from({ length: cardCount + 1 }).map((_, i) =>
          e('button', {
            key: i, className: 'bidnum' + (isBad(i) ? ' forbidden' : ''),
            disabled: isBad(i),
            onClick: () => { if (!isBad(i)) onBid(i); },
          }, i)
        )
      )
    );
  }

  /* ---- compact running scoreboard (always visible strip) ---- */
  function ScoreStrip({ game, onExpand }) {
    const order = game.players.map((p, i) => ({ p, i, t: game.totals[i] }))
      .sort((a, b) => b.t - a.t);
    return e('button', { className: 'scorestrip', onClick: onExpand },
      e('div', { className: 'row', style: { gap: 10, overflow: 'hidden' } },
        order.slice(0, 4).map((o, k) =>
          e('div', { key: o.i, className: 'ss-item' },
            e('span', { className: 'ss-dot', style: { background: o.p.color } }),
            e('span', { className: 'ss-name' }, o.p.name.split(' ')[0]),
            e('b', { className: 'tnum' }, o.t)
          )
        )
      ),
      e('span', { className: 'ss-more' }, 'Scores \u203a')
    );
  }

  /* ---- full scorecard grid ---- */
  function ScoreCard({ game, onClose }) {
    const rounds = game.roundScores;
    return e('div', { className: 'overlay center', onClick: onClose },
      e('div', { className: 'modal card-surface', style: { maxHeight: '82%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }, onClick: (ev) => ev.stopPropagation() },
        e('div', { className: 'row between pad', style: { paddingBottom: 8 } },
          e('h3', { style: { fontSize: 22 } }, 'Scorecard'),
          e('button', { className: 'icon-btn', style: { color: 'var(--ink)', background: 'var(--paper-2)', border: 'none' }, onClick: onClose }, '\u2715')
        ),
        e('div', { className: 'scroll', style: { padding: '0 14px 16px' } },
          e('table', { className: 'sc-table' },
            e('thead', null, e('tr', null,
              e('th', null, 'R'),
              game.players.map((p, i) => e('th', { key: i },
                e('span', { className: 'ss-dot', style: { background: p.color, margin: '0 auto 2px' } }),
                e('div', { className: 'sc-h' }, p.name.split(' ')[0])
              ))
            )),
            e('tbody', null,
              rounds.map((rs, r) => e('tr', { key: r },
                e('td', { className: 'sc-r' }, (game.schedule[r])),
                rs.map((s, i) => e('td', { key: i, className: s.pts > 0 ? 'sc-good' : 'sc-zero' },
                  e('div', null, s.pts > 0 ? '+' + s.pts : '0'),
                  e('div', { className: 'sc-sub' }, s.made + '/' + s.bid)
                ))
              )),
              e('tr', { className: 'sc-total' },
                e('td', null, '\u03a3'),
                game.totals.map((t, i) => e('td', { key: i }, t))
              )
            )
          )
        )
      )
    );
  }

  window.JTable = { OpponentSeat, TrickZone, HandFan, BidPanel, ScoreStrip, ScoreCard, VideoTile, SelfView, seatAngle };
})();
