/* App root: routing, persistence, in-game menu, chat. */
(function () {
  const e = React.createElement;
  const { Avatar } = window.JUI;
  const { HomeScreen, SetupScreen, RosterScreen } = window.JScreens;
  const { HostScreen, JoinScreen, ChatPanel } = window.JLobby;
  const { StandingsScreen, HowToScreen, SettingsScreen } = window.JStandings;
  const { PLAYER_COLORS, AVATARS } = window.JThemes;

  const LS = {
    get(k, d) { try { const v = localStorage.getItem('judgment.' + k); return v ? JSON.parse(v) : d; } catch (err) { return d; } },
    set(k, v) { try { localStorage.setItem('judgment.' + k, JSON.stringify(v)); } catch (err) {} },
  };

  const DEFAULT_ROSTER = [
    { id: 'you', name: 'You', color: PLAYER_COLORS[0], avatar: AVATARS[0], you: true },
    { id: 'p1', name: 'Mom', color: PLAYER_COLORS[1], avatar: AVATARS[1] },
    { id: 'p2', name: 'Dad', color: PLAYER_COLORS[2], avatar: AVATARS[2] },
    { id: 'p3', name: 'Priya', color: PLAYER_COLORS[4], avatar: AVATARS[4] },
  ];

  const SAMPLE_HISTORY = [
    { date: 'May 31, 2026', players: [
      { name: 'Priya', color: PLAYER_COLORS[4], avatar: AVATARS[4], score: 78, place: 1, bidsHit: 9, bidsTotal: 13 },
      { name: 'You', color: PLAYER_COLORS[0], avatar: AVATARS[0], score: 64, place: 2, bidsHit: 8, bidsTotal: 13 },
      { name: 'Dad', color: PLAYER_COLORS[2], avatar: AVATARS[2], score: 52, place: 3, bidsHit: 6, bidsTotal: 13 },
      { name: 'Mom', color: PLAYER_COLORS[1], avatar: AVATARS[1], score: 41, place: 4, bidsHit: 5, bidsTotal: 13 },
    ] },
    { date: 'May 24, 2026', players: [
      { name: 'You', color: PLAYER_COLORS[0], avatar: AVATARS[0], score: 71, place: 1, bidsHit: 9, bidsTotal: 13 },
      { name: 'Mom', color: PLAYER_COLORS[1], avatar: AVATARS[1], score: 69, place: 2, bidsHit: 8, bidsTotal: 13 },
      { name: 'Priya', color: PLAYER_COLORS[4], avatar: AVATARS[4], score: 55, place: 3, bidsHit: 7, bidsTotal: 13 },
      { name: 'Dad', color: PLAYER_COLORS[2], avatar: AVATARS[2], score: 48, place: 4, bidsHit: 6, bidsTotal: 13 },
    ] },
  ];

  function GameMenu({ onResume, onScorecard, onQuit, settings, setSettings }) {
    return e('div', { className: 'overlay center', onClick: onResume },
      e('div', { className: 'modal card-surface pad', onClick: (ev) => ev.stopPropagation() },
        e('h3', { style: { fontSize: 22, marginBottom: 14 } }, 'Paused'),
        e('div', { className: 'col', style: { gap: 10 } },
          e('button', { className: 'btn btn-primary btn-block btn-lg', onClick: onResume }, 'Resume'),
          e('button', { className: 'btn btn-paper btn-block', onClick: onScorecard }, 'View scorecard'),
          e('div', { className: 'row between', style: { padding: '8px 4px' } },
            e('div', { style: { fontWeight: 700 } }, 'Sound'),
            e('button', { className: 'toggle ' + (settings.sound ? 'on' : ''), onClick: () => { const v = !settings.sound; setSettings(Object.assign({}, settings, { sound: v })); window.JSound.enabled = v; } })),
          e('button', { className: 'btn btn-block', style: { color: 'var(--bad)' }, onClick: onQuit }, 'Quit to home')
        )
      )
    );
  }

  function App() {
    const [route, setRoute] = React.useState('home');
    const [roster, setRosterState] = React.useState(() => LS.get('roster', DEFAULT_ROSTER));
    const [history, setHistory] = React.useState(() => LS.get('history', SAMPLE_HISTORY));
    const [settings, setSettingsState] = React.useState(() => LS.get('settings', { table: 'emerald', back: 'classic', faceStyle: 'modern', sound: true, volume: 0.5 }));
    const [, force] = React.useReducer((x) => x + 1, 0);
    const gameRef = React.useRef(null);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [chatOpen, setChatOpen] = React.useState(false);
    const [showCardFromMenu, setShowCardFromMenu] = React.useState(false);

    // apply theme + sound on mount and when changed
    React.useEffect(() => { window.JThemes.applyTable(settings.table); }, [settings.table]);
    React.useEffect(() => { window.JSound.enabled = settings.sound; window.JSound.setVolume(settings.volume); }, []);

    function setRoster(r) { setRosterState(r); LS.set('roster', r); }
    function setSettings(s) { setSettingsState(s); LS.set('settings', s); }

    function go(r) { window.JSound && window.JSound.unlock(); setRoute(r); }

    function startGame(players, options) {
      window.JSound && window.JSound.unlock();
      const g = new window.JEngine.Game(players, Object.assign({ faceStyle: settings.faceStyle }, options), () => force());
      gameRef.current = g;
      g.startRound();
      setRoute('game');
    }

    function saveResult(game) {
      const order = game.players.map((p, i) => ({ p, i, t: game.totals[i] })).sort((a, b) => b.t - a.t);
      const rec = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        players: order.map((o, k) => {
          let hit = 0; game.roundScores.forEach((rs) => { if (rs[o.i].pts > 0) hit++; });
          return { name: o.p.name, color: o.p.color, avatar: o.p.avatar, score: o.t, place: k + 1, bidsHit: hit, bidsTotal: game.roundScores.length };
        }),
      };
      const h = history.concat([rec]); setHistory(h); LS.set('history', h);
    }

    let screen;
    if (route === 'home') screen = e(HomeScreen, { go, roster });
    else if (route === 'setup') screen = e(SetupScreen, { go, roster, start: startGame, settings });
    else if (route === 'roster') screen = e(RosterScreen, { go, roster, setRoster });
    else if (route === 'host') screen = e(HostScreen, { go, start: startGame, roster });
    else if (route === 'join') screen = e(JoinScreen, { go });
    else if (route === 'standings') screen = e(StandingsScreen, { go, history });
    else if (route === 'howto') screen = e(HowToScreen, { go });
    else if (route === 'settings') screen = e(SettingsScreen, { go, settings, setSettings });
    else if (route === 'game' && gameRef.current) {
      screen = e(window.TableScreen, {
        game: gameRef.current,
        onMenu: () => { window.JSound && window.JSound.click(); setMenuOpen(true); },
        onChat: () => { window.JSound && window.JSound.click(); setChatOpen(true); },
        onSaveResult: saveResult,
        onHome: () => { gameRef.current = null; setRoute('home'); },
      });
    } else screen = e(HomeScreen, { go, roster });

    const inGame = route === 'game' && gameRef.current;
    return e('div', { className: 'frame' },
      screen,
      // chat panel (opened from the top bar)
      inGame && chatOpen ? e(ChatPanel, { onClose: () => setChatOpen(false), players: gameRef.current.players }) : null,
      menuOpen ? e(GameMenu, {
        settings, setSettings,
        onResume: () => setMenuOpen(false),
        onScorecard: () => { setMenuOpen(false); setShowCardFromMenu(true); },
        onQuit: () => { setMenuOpen(false); gameRef.current = null; setRoute('home'); },
      }) : null,
      showCardFromMenu && gameRef.current ? e(window.JTable.ScoreCard, { game: gameRef.current, onClose: () => setShowCardFromMenu(false) }) : null
    );
  }

  ReactDOM.createRoot(document.getElementById('app')).render(e(App));
})();
