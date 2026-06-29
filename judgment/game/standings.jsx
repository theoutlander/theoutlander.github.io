/* Leaderboard / History, How-to-play, Settings. */
(function () {
  const e = React.createElement;
  const { Avatar, TopBar, Segmented, SuitBadge } = window.JUI;
  const { TABLES, BACKS, PLAYER_COLORS, AVATARS } = window.JThemes;
  const Card = window.Card;

  function aggregate(history) {
    const map = {};
    history.forEach((g) => {
      g.players.forEach((p) => {
        const k = p.name;
        if (!map[k]) map[k] = { name: p.name, color: p.color, avatar: p.avatar, games: 0, wins: 0, points: 0, bidsHit: 0, bidsTotal: 0 };
        map[k].games++; map[k].points += p.score;
        if (p.place === 1) map[k].wins++;
        if (p.bidsHit != null) { map[k].bidsHit += p.bidsHit; map[k].bidsTotal += p.bidsTotal; }
      });
    });
    return Object.values(map).sort((a, b) => b.wins - a.wins || b.points - a.points);
  }

  function StandingsScreen({ go, history }) {
    const [tab, setTab] = React.useState('board');
    const board = aggregate(history);
    return e('div', { className: 'screen' },
      e(TopBar, { title: 'Standings', onBack: () => go('home') }),
      e('div', { className: 'seg-wrap' },
        e(Segmented, { value: tab, options: [{ value: 'board', label: '\uD83C\uDFC6 Leaderboard' }, { value: 'history', label: '\uD83D\uDD52 History' }], onChange: setTab })),
      e('div', { className: 'scroll pad', style: { paddingTop: 6 } },
        tab === 'board'
          ? (board.length === 0
              ? e('div', { className: 'empty-note' }, 'No games yet. Finish a game and save it to start the leaderboard.')
              : board.map((p, i) => e('div', { key: p.name, className: 'lb-row' },
                  e('div', { className: 'lb-rank ' + (i === 0 ? 'gold' : '') }, i === 0 ? '\uD83E\uDD47' : '#' + (i + 1)),
                  e(Avatar, { player: p, size: 44 }),
                  e('div', { className: 'col', style: { alignItems: 'flex-start' } },
                    e('div', { style: { fontWeight: 800, fontSize: 17 } }, p.name),
                    e('div', { className: 'lb-sub' }, p.wins + (p.wins === 1 ? ' win' : ' wins') + ' \u00b7 ' + p.games + ' played' + (p.bidsTotal ? ' \u00b7 ' + Math.round(100 * p.bidsHit / p.bidsTotal) + '% bids' : ''))
                  ),
                  e('div', { className: 'lb-stat' },
                    e('div', { className: 'lb-pts' }, p.points),
                    e('div', { className: 'lb-sub' }, 'points'))
                )))
          : (history.length === 0
              ? e('div', { className: 'empty-note' }, 'No past games yet.')
              : history.slice().reverse().map((g, i) => e('div', { key: i, className: 'hist-card' },
                  e('div', { className: 'hist-top' },
                    e('div', { className: 'hist-win' }, '\uD83C\uDFC6 ' + g.players.find((p) => p.place === 1).name),
                    e('div', { className: 'hist-date' }, g.date)),
                  e('div', { className: 'hist-players' },
                    g.players.slice().sort((a, b) => a.place - b.place).map((p, k) =>
                      e('div', { key: k, className: 'hist-chip' },
                        e('span', { className: 'ss-dot', style: { background: p.color } }), p.name, ' ', e('b', null, p.score))))
                ))))
    );
  }

  /* ---------- How to play ---------- */
  function HowToScreen({ go }) {
    const steps = [
      ['Get your cards', 'Each round everyone is dealt the same number of cards. It starts at 7, drops one per round down to 1, then climbs back up. A trump suit is picked at random each round \u2014 trumps beat everything.'],
      ['Make your call', 'Each round (a \u201chand\u201d) is one card from every player \u2014 highest card takes it. Before playing, predict exactly how many hands you\u2019ll win. Bidding starts left of the dealer. The last bidder can\u2019t make the bids add up to the number of cards \u2014 so someone always has to miss.'],
      ['Play it out', 'Follow the led suit if you can. If you can\u2019t, play a trump to win it or throw off a low card. Highest trump wins; otherwise highest card of the led suit.'],
      ['Hit your number', 'Score only if you win exactly as many hands as you called: 10 + your bid. One too many or too few and you get nothing for the round.'],
      ['Win the game', 'Add up every round. Highest total when the cards run out wins. Save the result to the family leaderboard.'],
    ];
    return e('div', { className: 'screen' },
      e(TopBar, { title: 'How to play', onBack: () => go('home') }),
      e('div', { className: 'scroll pad' },
        e('div', { className: 'card-surface pad', style: { marginBottom: 16 } },
          e('div', { className: 'row', style: { gap: 10, justifyContent: 'center', marginBottom: 8 } },
            ['\u2660', '\u2665', '\u2666', '\u2663'].map((s, i) => e('span', { key: i, style: { fontSize: 26, color: i % 2 ? '#c0362c' : '#23201c' } }, s))),
          e('p', { style: { margin: 0, textAlign: 'center', fontWeight: 600, color: 'var(--ink-soft)' } },
            'Judgment is all about one thing: call your hands exactly right. Not the most \u2014 the exact number.')
        ),
        steps.map((s, i) => e('div', { key: i, className: 'howto-step' },
          e('div', { className: 'howto-num' }, i + 1),
          e('div', { className: 'howto-body' }, e('h4', null, s[0]), e('p', null, s[1]))
        )),
        e('button', { className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 6 }, onClick: () => go('setup') }, 'Try a quick game \u2192')
      )
    );
  }

  /* ---------- Settings ---------- */
  function SettingsScreen({ go, settings, setSettings }) {
    const set = (k, v) => { setSettings(Object.assign({}, settings, { [k]: v })); window.JSound && window.JSound.click(); };
    return e('div', { className: 'screen' },
      e(TopBar, { title: 'Settings', onBack: () => go('home') }),
      e('div', { className: 'scroll pad' },
        // table theme
        e('div', { className: 'set-group' },
          e('div', { className: 'set-label', style: { marginBottom: 12 } }, 'Table'),
          e('div', { className: 'back-pick' },
            Object.keys(TABLES).map((k) => e('button', {
              key: k, className: 'theme-swatch' + (settings.table === k ? ' on' : ''),
              style: { background: 'radial-gradient(120% 120% at 30% 20%,' + TABLES[k].feltA + ',' + TABLES[k].feltB + ')' },
              onClick: () => { set('table', k); window.JThemes.applyTable(k); }, title: TABLES[k].name,
            }))
          )
        ),
        // card back
        e('div', { className: 'set-group' },
          e('div', { className: 'set-label', style: { marginBottom: 12 } }, 'Card back'),
          e('div', { className: 'back-pick', style: { alignItems: 'center' } },
            Object.keys(BACKS).map((k) => e('div', { key: k, onClick: () => set('back', k),
              style: { borderRadius: 10, padding: 3, border: '2px solid ' + (settings.back === k ? 'var(--accent)' : 'transparent') } },
              e(Card, { faceDown: true, width: 44, back: BACKS[k] })))
          )
        ),
        // face style
        e('div', { className: 'set-group' },
          e('div', { className: 'set-label', style: { marginBottom: 12 } }, 'Card faces'),
          e(Segmented, { value: settings.faceStyle,
            options: [{ value: 'modern', label: 'Clean' }, { value: 'pips', label: 'Pips' }],
            onChange: (v) => set('faceStyle', v) }),
          e('div', { className: 'row center', style: { gap: 12, marginTop: 14 } },
            e(Card, { card: { rank: 9, suit: 'hearts' }, width: 60, faceStyle: settings.faceStyle }),
            e(Card, { card: { rank: 14, suit: 'spades' }, width: 60, faceStyle: settings.faceStyle }),
            e(Card, { card: { rank: 13, suit: 'diamonds' }, width: 60, faceStyle: settings.faceStyle }))
        ),
        // sound
        e('div', { className: 'set-group' },
          e('div', { className: 'set-row', style: { paddingTop: 0 } },
            e('div', { className: 'set-label grow' }, 'Sound effects'),
            e('button', { className: 'toggle ' + (settings.sound ? 'on' : ''), onClick: () => { const v = !settings.sound; set('sound', v); window.JSound.enabled = v; } })),
          settings.sound ? e('div', { className: 'set-row' },
            e('div', { className: 'set-label grow' }, 'Volume'),
            e('input', { type: 'range', min: 0, max: 1, step: 0.05, defaultValue: settings.volume,
              onChange: (ev) => { window.JSound.setVolume(parseFloat(ev.target.value)); setSettings(Object.assign({}, settings, { volume: parseFloat(ev.target.value) })); },
              style: { width: 150, accentColor: 'var(--accent)' } })) : null
        ),
        e('p', { className: 'on-felt tiny', style: { opacity: .5, textAlign: 'center' } }, 'Judgment \u00b7 a family project')
      )
    );
  }

  window.JStandings = { StandingsScreen, HowToScreen, SettingsScreen };
})();
