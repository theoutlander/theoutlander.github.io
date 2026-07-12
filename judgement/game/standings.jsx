/* Leaderboard / History, How-to-play, Settings. */
(function () {
  const e = React.createElement;
  const { Avatar, TopBar, Segmented, SuitBadge } = window.JUI;
  const { TABLES, BACKS, PLAYER_COLORS, AVATARS } = window.JThemes;
  const Card = window.Card;

  // Bots sit at the table but they don't rank — the board is people only, so a
  // practice run can't stack it with opponents the game invented.
  function aggregate(history) {
    const map = {};
    history.forEach((g) => {
      g.players.filter((p) => !p.isBot).forEach((p) => {
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
    // Prefer the server (D1) leaderboard/history; fall back to local sample data
    // when the API isn't reachable (e.g. opened as a plain static file).
    const [srvBoard, setSrvBoard] = React.useState(null);
    const [srvHist, setSrvHist] = React.useState(null);
    React.useEffect(() => {
      let ok = true;
      fetch('/api/leaderboard').then((r) => r.ok ? r.json() : null).then((d) => { if (ok && d && d.board) setSrvBoard(d.board); }).catch(() => {});
      fetch('/api/history').then((r) => r.ok ? r.json() : null).then((d) => { if (ok && d && d.history) setSrvHist(d.history); }).catch(() => {});
      return () => { ok = false; };
    }, []);
    const board = srvBoard || aggregate(history);
    const hist = srvHist || history;
    return e('div', { className: 'screen' },
      e(TopBar, { title: 'Standings', onBack: () => go('home') }),
      e('div', { className: 'seg-wrap' },
        e(Segmented, { value: tab, options: [{ value: 'board', label: '🏆 Leaderboard' }, { value: 'history', label: '🕒 History' }], onChange: setTab })),
      e('div', { className: 'scroll pad', style: { paddingTop: 6 } },
        tab === 'board'
          ? (board.length === 0
              ? e('div', { className: 'empty-note' }, 'No games yet. Finish a game and save it to start the leaderboard.')
              : board.map((p, i) => e('div', { key: p.name, className: 'lb-row' },
                  e('div', { className: 'lb-rank ' + (i === 0 ? 'gold' : '') }, i === 0 ? '🥇' : '#' + (i + 1)),
                  e(Avatar, { player: p, size: 44 }),
                  e('div', { className: 'col', style: { alignItems: 'flex-start' } },
                    e('div', { style: { fontWeight: 800, fontSize: 17 } }, p.name),
                    e('div', { className: 'lb-sub' }, p.wins + (p.wins === 1 ? ' win' : ' wins') + ' · ' + p.games + ' played' + (p.bidsTotal ? ' · ' + Math.round(100 * p.bidsHit / p.bidsTotal) + '% bids' : ''))
                  ),
                  e('div', { className: 'lb-stat' },
                    e('div', { className: 'lb-pts' }, p.points),
                    e('div', { className: 'lb-sub' }, 'points'))
                )))
          : (hist.length === 0
              ? e('div', { className: 'empty-note' }, 'No past games yet.')
              : hist.slice().reverse().map((g, i) => e('div', { key: i, className: 'hist-card' },
                  e('div', { className: 'hist-top' },
                    e('div', { className: 'hist-win' }, '🏆 ' + g.players.find((p) => p.place === 1).name),
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
      ['Deal', 'Everyone gets the same number of cards.'],
      ['Hukum', 'One random suit beats all others.'],
      ['Call', 'Guess how many hands you will win.'],
      ['Play', 'Highest Hukum wins, else highest of the led suit.'],
      ['Score', 'Nail your guess: 10 + bid. Miss: zero.'],
    ];
    return e('div', { className: 'screen' },
      e(TopBar, { title: 'How to play', onBack: () => go('home') }),
      e('div', { className: 'scroll pad' },
        e('p', { className: 'on-felt', style: { textAlign: 'center', fontWeight: 600, margin: '2px 0 16px', opacity: .85 } },
          'Win exactly the number of hands you call.'),
        steps.map((s, i) => e('div', { key: i, className: 'howto-step compact' },
          e('div', { className: 'howto-num' }, i + 1),
          e('div', { className: 'howto-body' }, e('h4', null, s[0]), e('p', null, s[1]))
        )),
        e('button', { className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 10 }, onClick: () => go('setup') }, 'Try a quick game')
      )
    );
  }

  /* ---------- Settings: fits one screen, no scroll ---------- */
  function SettingsScreen({ go, settings, setSettings, onBack }) {
    const set = (k, v) => { setSettings(Object.assign({}, settings, { [k]: v })); window.JSound && window.JSound.click(); };
    const sample = [{ rank: 14, suit: 'spades' }, { rank: 13, suit: 'hearts' }, { rank: 12, suit: 'diamonds' }];
    return e('div', { className: 'screen' },
      e(TopBar, { title: 'Settings', onBack: onBack || (() => go('home')) }),
      e('div', { className: 'settings-page' },
        e('div', { className: 'set-card' },
          e('div', { className: 'set-h' }, 'Table'),
          e('div', { className: 'pick-row' }, Object.keys(TABLES).map((k) => e('button', {
            key: k, className: 'pick' + (settings.table === k ? ' on' : ''),
            onClick: () => { set('table', k); window.JThemes.applyTable(k); },
          },
            e('span', { className: 'pick-felt', style: { background: 'radial-gradient(120% 120% at 30% 24%,' + TABLES[k].feltA + ',' + TABLES[k].feltB + ')' } },
              settings.table === k ? e('span', { className: 'pick-check' }, '✓') : null),
            e('span', { className: 'pick-name' }, TABLES[k].name)
          )))
        ),
        // toggles combined into one card to save height
        e('div', { className: 'set-card' },
          e('div', { className: 'set-line' },
            e('div', { className: 'col grow', style: { alignItems: 'flex-start' } },
              e('div', { className: 'set-title' }, 'Easy Mode'),
              e('div', { className: 'set-sub' }, 'Bigger cards & text, calmer motion — easier to see')),
            e('button', { className: 'toggle ' + (settings.easyView ? 'on' : ''), onClick: () => set('easyView', !settings.easyView) })),
          e('div', { className: 'set-div' }),
          e('div', { className: 'set-line' },
            e('div', { className: 'col grow', style: { alignItems: 'flex-start' } },
              e('div', { className: 'set-title' }, 'Sound'),
              e('div', { className: 'set-sub' }, 'Shuffles, chimes and little cheers')),
            e('button', { className: 'toggle ' + (settings.sound ? 'on' : ''), onClick: () => { const v = !settings.sound; set('sound', v); window.JSound.enabled = v; } })),
          settings.sound ? e('div', { className: 'set-line vol' },
            e('span', { className: 'set-sub' }, 'Volume'),
            e('input', { type: 'range', min: 0, max: 1, step: 0.05, defaultValue: settings.volume, className: 'vol-slider',
              onChange: (ev) => { window.JSound.setVolume(parseFloat(ev.target.value)); setSettings(Object.assign({}, settings, { volume: parseFloat(ev.target.value) })); } })) : null
        ),
        e('p', { className: 'on-felt tiny', style: { opacity: .45, textAlign: 'center', margin: 'auto 0 0' } }, 'Judgement · Nick’s Games')
      )
    );
  }

  window.JStandings = { StandingsScreen, HowToScreen, SettingsScreen };
})();
