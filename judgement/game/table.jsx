/* The game table, the heart of Judgement. Phone-first. */
(function () {
  const e = React.createElement;
  const { Avatar, SuitBadge } = window.JUI;
  const { SUIT_SYMBOL, SUIT_COLOR, rankLabel } = window.JEngine;
  const Card = window.Card;

  function seatAngle(relative, n) {
    // relative 0 (self) at bottom; others spread clockwise
    return (90 + relative * (360 / n)) * Math.PI / 180;
  }

  /* ---- a seat chip for opponents (top) ---- */
  function OpponentSeat({ player, idx, game }) {
    const active = game.turn === idx && (game.phase === 'bidding' || game.phase === 'playing');
    const bid = game.bids[idx];
    const won = game.tricksWon[idx];
    const playing = game.phase !== 'bidding';
    return e('div', { className: 'opp' },
      e(Avatar, { player, size: 46, ring: active }),
      e('div', { className: 'opp-name' + (active ? ' active' : '') }, player.name),
      e('div', { className: 'opp-stat' },
        bid === null
          ? e('span', { className: 'opp-thinking' }, active ? 'calling…' : 'waiting')
          : playing
            ? e('span', null, e('b', { className: won === bid ? 'hit' : (won > bid ? 'over' : '') }, won), e('span', { className: 'slash' }, '/'), e('span', null, bid))
            : e('span', { className: 'opp-call' }, 'bid ', e('b', null, bid))
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
      e('span', { className: 'vmic' }, '🔊'),
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
        e('button', { className: 'vctrl' + (micOn ? '' : ' off'), onClick: onToggleMic, 'aria-label': 'Mic' }, micOn ? '🎙️' : '🔇'),
        e('button', { className: 'vctrl' + (camOn ? '' : ' off'), onClick: onToggleCam, 'aria-label': 'Camera' }, camOn ? '📹' : '🚫')
      ),
      (stream && camOn)
        ? e('video', { ref, autoPlay: true, muted: true, playsInline: true })
        : e('div', { className: 'vfeed', style: { background: 'linear-gradient(135deg,' + window.JUI.tint(player.color, 0.2) + ',#11161f)' } }, (player.name || 'You')[0].toUpperCase()),
      e('div', { className: 'vname' }, 'You')
    );
  }

  /* ---- ROUND TABLE: everyone seated around an oval, cards land in front of each ---- */
  function RoundTable({ game, onBid }) {
    const n = game.n;
    const cards = game.currentTrick;
    const easy = window.JA11Y && window.JA11Y.easyView;
    const RX = 41, RY = 37;
    function angle(i) { return (90 + i * (360 / n)) * Math.PI / 180; }
    function rim(i) { const a = angle(i); return { x: 50 + Math.cos(a) * RX, y: 50 + Math.sin(a) * RY }; }
    function cardPos(i) { const a = angle(i); const f = 0.57; return { x: 50 + Math.cos(a) * RX * f, y: 50 + Math.sin(a) * RY * f }; }
    const cw = (n <= 4 ? 66 : n <= 6 ? 58 : 50) + (easy ? 8 : 0);
    const yourBidTurn = game.phase === 'bidding' && game.turn === 0;
    // during the brief "resolving" pause, highlight the winning card + seat
    const resolveWin = (game.phase === 'resolving' && game.currentTrick.length === game.n)
      ? window.JEngine.trickWinner(game.currentTrick, game.trump, game.leadSuit) : -1;

    return e('div', { className: 'rtable' },
      e('div', { className: 'rtable-surface' }),
      // Hukum medallion in the centre during play (cards land in front of it)
      // Hukum reminder lives in a fixed chip below "You" (above the cards),
      // not in the centre, so it is easy and consistent to find.
      // center: the live bid tally during bidding, else nothing (wheel docks above the cards)
      e('div', { className: 'rt-center' },
        game.phase === 'bidding' ? e(BidStatus, { game }) : null
      ),
      // played cards, sitting in front of whoever played them
      cards.map((p) => {
        const cp = cardPos(p.seat);
        const win = resolveWin === p.seat;
        return e('div', { key: 'pc' + p.seat, className: 'rt-card' + (win ? ' winning' : ''), style: { left: cp.x + '%', top: cp.y + '%' } },
          e(Card, { card: p.card, width: cw }));
      }),
      // seats around the rim
      game.players.map((p, i) => {
        const sp = rim(i);
        const active = game.turn === i && (game.phase === 'bidding' || game.phase === 'playing');
        const bid = game.bids[i], won = game.tricksWon[i];
        const playing = game.phase !== 'bidding';
        let stat, statCls = '';
        if (bid === null) { stat = active ? 'calling…' : 'waiting'; statCls = 'soft'; }
        else { stat = won + ' / ' + bid; statCls = playing ? (won === bid ? 'hit' : (won > bid ? 'over' : '')) : ''; }
        // during bidding the circle badge shows their call, so the 0/N pill is redundant
        const hideStat = game.phase === 'bidding';
        return e('div', {
          key: 'seat' + i, className: 'rt-seat' + (active ? ' active' : '') + (i === 0 ? ' me' : '') + (resolveWin === i ? ' winner' : ''),
          style: { left: sp.x + '%', top: sp.y + '%' },
        },
          e('div', { className: 'rt-av' },
            e(Avatar, { player: p, size: i === 0 ? 54 : 48, ring: active, initials: true }),
            (game.phase === 'bidding' && bid !== null) ? e('span', { className: 'rt-badge' }, bid) : null
          ),
          e('div', { className: 'rt-name' }, i === 0 ? 'You' : p.name),
          hideStat ? null : e('div', { className: 'rt-stat ' + statCls }, stat)
        );
      })
    );
  }

  /* ---- center trick area: a tidy centre pile, never flung to the edges ---- */
  function TrickZone({ game }) {
    const cards = game.currentTrick;
    const n = game.n;
    const easy = window.JA11Y && window.JA11Y.easyView;
    const base = n <= 4 ? 72 : n <= 6 ? 60 : 50;
    const cw = base + (easy ? 10 : 0);
    if (cards.length === 0) {
      const hint = game.phase === 'playing'
        ? (game.turn === 0 ? 'Your lead' : (game.players[game.turn] ? game.players[game.turn].name + ' leads' : ''))
        : '';
      return e('div', { className: 'trickzone' }, hint ? e('div', { className: 'trick-hint' }, hint) : null);
    }
    return e('div', { className: 'trickzone' },
      e('div', { className: 'trick-pile' },
        cards.map((p) => e('div', { key: p.seat, className: 'trick-card' },
          e(Card, { card: p.card, width: cw, faceStyle: game.options.faceStyle }),
          e('div', { className: 'trick-tag', style: { background: game.players[p.seat].color } }, game.players[p.seat].name)
        ))
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
    const easy = window.JA11Y && window.JA11Y.easyView;
    const avail = Math.min(window.innerWidth, 480) - 20;
    const maxW = easy ? 152 : 118;
    // how much each card is hidden behind the next (more cards => more overlap)
    const f = count <= 4 ? 0.16 : count <= 7 ? 0.30 : count <= 10 ? 0.42 : count <= 13 ? 0.52 : 0.62;
    let w = Math.floor(avail / (1 + (count - 1) * (1 - f)));
    w = Math.max(easy ? 60 : 46, Math.min(maxW, w));
    // guarantee the whole fan fits the screen: tighten overlap if the clamp pushed it wide
    let overlap = -(w * f);
    if (count > 1) {
      const fitOverlap = (avail - w) / (count - 1) - w;
      if (fitOverlap < overlap) overlap = fitOverlap;
    }
    return e('div', { className: 'hand', style: { '--ov': overlap + 'px' } },
      hand.map((c, i) => {
        const isLegal = legalIds.has(window.JEngine.cardId(c));
        const playable = yourTurn && isLegal;
        return e('div', {
          key: window.JEngine.cardId(c), className: 'hand-card' + (playable ? ' playable' : '') + (c.suit === game.trump ? ' is-trump' : ''),
          style: { marginLeft: i === 0 ? 0 : 'var(--ov)', zIndex: i },
          onClick: () => playable && onPlay(c),
        },
          e(Card, {
            card: c, width: w, mini: true,
            legal: playable, illegal: yourTurn && !isLegal, selectable: playable,
          })
        );
      })
    );
  }

  /* ---- bid panel: calm stepper + what others called ---- */
  function BidPanel({ game, onBid }) {
    const cardCount = game.cardCount;
    const forbidden = game.isLastBidder(0) ? game.forbiddenBid() : null;
    const topNum = Math.max.apply(null, game.schedule);
    const [armed, setArmed] = React.useState(null);
    React.useEffect(() => { setArmed(null); }, [game.roundIndex]);
    const nums = [];
    for (let i = 0; i <= topNum; i++) nums.push(i);
    return e('div', { className: 'bidbar' },
      e('div', { className: 'bid-label' }, armed === null ? 'How many will you win?' : e('span', null, 'Tap ', e('b', null, armed), ' again to confirm')),
      e('div', { className: 'bid-nums' },
        nums.map((nN) => {
          const spent = nN > cardCount;
          const off = nN === forbidden;
          const disabled = spent || off;
          const isArmed = nN === armed;
          return e('button', {
            key: nN, className: 'numbtn bidnum' + (spent ? ' spent' : '') + (off ? ' forbid' : '') + (isArmed ? ' armed' : ''),
            disabled,
            onClick: () => {
              if (disabled) return;
              if (isArmed) { window.JSound && window.JSound.bid(); onBid(nN); }
              else { setArmed(nN); window.JSound && window.JSound.click2(); }
            },
          }, off ? e('span', { className: 'forbid-x' }, nN) : nN);
        })
      )
    );
  }

  /* ---- bidding centerpiece: compact tally that won't collide with seats ---- */
  function BidStatus({ game }) {
    const placed = game.bids.filter((b) => b !== null);
    const sum = placed.reduce((a, b) => a + b, 0);
    const remaining = game.n - placed.length;
    return e('div', { className: 'bidstatus' },
      e('div', { className: 'bs-big' }, sum, e('span', { className: 'bs-of' }, ' / ' + game.cardCount)),
      e('div', { className: 'bs-cap' }, remaining > 0 ? 'called' : 'all in')
    );
  }

  /* ---- center bid wheel: pick your number right in the middle of the table ---- */
  function BidWheel({ game, onBid }) {
    const cardCount = game.cardCount;
    const forbidden = game.isLastBidder(0) ? game.forbiddenBid() : null;
    const [armed, setArmed] = React.useState(null);
    React.useEffect(() => { setArmed(null); }, [game.roundIndex]);
    const nums = [];
    for (let i = 0; i <= cardCount; i++) nums.push(i);
    const count = nums.length;
    const cols = count <= 7 ? count : Math.ceil(count / 2);
    return e('div', { className: 'bidwheel' },
      e('div', { className: 'bw-hukum-row' },
        e('span', { className: 'bw-hk ' + SUIT_COLOR[game.trump] },
          e('span', { className: 'bw-hk-suit' }, SUIT_SYMBOL[game.trump]), ' Hukum')),
      e('div', { className: 'bw-q' },
        e('span', { className: 'bw-q-txt' }, armed === null
          ? 'How many will you win?'
          : e('span', null, 'Tap ', e('b', null, armed), ' again to confirm'))),
      e('div', { className: 'bw-nums', style: { gridTemplateColumns: 'repeat(' + cols + ', 1fr)' } },
        nums.map((nN) => {
          const off = nN === forbidden;
          const isArmed = nN === armed;
          return e('button', {
            key: nN, className: 'bwnum' + (off ? ' forbid' : '') + (isArmed ? ' armed' : ''),
            disabled: off,
            onClick: () => {
              if (off) return;
              if (isArmed) { window.JSound && window.JSound.bid(); onBid(nN); }
              else { setArmed(nN); window.JSound && window.JSound.click2(); }
            },
          },
            off ? e('span', { className: 'forbid-x' }, nN) : nN
          );
        })
      )
    );
  }

  /* ---- compact running scoreboard (always visible strip) ---- */
  function ScoreStrip({ game, onExpand }) {
    const order = game.players.map((p, i) => ({ p, i, t: game.totals[i] })).sort((a, b) => b.t - a.t);
    return e('button', { className: 'scoreboard', onClick: onExpand },
      e('div', { className: 'sb-items' },
        order.map((o, k) => e('div', { key: o.i, className: 'sb-item' + (o.i === 0 ? ' me' : '') + (k === 0 ? ' lead' : '') },
          e('span', { className: 'sb-dot', style: { background: o.p.color } }),
          e('span', { className: 'sb-name' }, o.p.name.split(' ')[0]),
          e('b', { className: 'sb-tot tnum' }, o.t)
        ))
      )
    );
  }

  /* ---- full scorecard grid ---- */
  function ScoreCard({ game, onClose }) {
    const rounds = game.roundScores;
    return e('div', { className: 'overlay center', onClick: onClose },
      e('div', { className: 'modal card-surface', style: { maxHeight: '82%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }, onClick: (ev) => ev.stopPropagation() },
        e('div', { className: 'row between pad', style: { paddingBottom: 8 } },
          e('h3', { style: { fontSize: 22 } }, 'Scorecard'),
          e('button', { className: 'icon-btn', style: { color: 'var(--ink)', background: 'var(--paper-2)', border: 'none' }, onClick: onClose }, '✕')
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
                e('td', null, 'Σ'),
                game.totals.map((t, i) => e('td', { key: i }, t))
              )
            )
          )
        )
      )
    );
  }

  window.JTable = { OpponentSeat, RoundTable, TrickZone, HandFan, BidPanel, BidWheel, BidStatus, ScoreStrip, ScoreCard, VideoTile, SelfView, seatAngle };
})();
