/* App root: routing, persistence, in-game menu, chat. */
(function () {
  const e = React.createElement;
  const { Avatar } = window.JUI;
  const { HomeScreen, SetupScreen, RosterScreen } = window.JScreens;
  const { HostScreen, JoinScreen, ChatPanel } = window.JLobby;
  const { StandingsScreen, HowToScreen, SettingsScreen } = window.JStandings;
  const { PLAYER_COLORS, AVATARS } = window.JThemes;

  const LS = {
    get(k, d) { try { const v = localStorage.getItem('judgement.' + k); return v ? JSON.parse(v) : d; } catch (err) { return d; } },
    set(k, v) { try { localStorage.setItem('judgement.' + k, JSON.stringify(v)); } catch (err) {} },
  };

  const DEFAULT_ROSTER = [
    { id: 'you', name: 'You', color: PLAYER_COLORS[0], avatar: AVATARS[0], you: true },
    { id: 'p1', name: 'Mom', color: PLAYER_COLORS[1], avatar: AVATARS[1] },
    { id: 'p2', name: 'Dad', color: PLAYER_COLORS[2], avatar: AVATARS[2] },
    { id: 'p3', name: 'Priya', color: PLAYER_COLORS[4], avatar: AVATARS[4] },
  ];

  // The leaderboard shows games you actually played — it starts empty rather than
  // seeded with invented results.
  const SAMPLE_HISTORY = [];

  function GameMenu({ onResume, onScorecard, onInvite, onSettings, onQuit, settings, setSettings, online, autopilot, onToggleAutopilot }) {
    return e('div', { className: 'overlay center', onClick: onResume },
      e('div', { className: 'modal card-surface pause-pop', onClick: (ev) => ev.stopPropagation() },
        e('div', { className: 'pause-title' }, 'Paused'),
        e('button', { className: 'btn btn-primary btn-block', onClick: onResume }, 'Resume'),
        e('button', { className: 'pause-row', onClick: onInvite },
          e('span', null, '🔗  Invite players'), e('span', { style: { opacity: .4 } }, '›')),
        e('button', { className: 'pause-row', onClick: () => { const v = !settings.sound; setSettings(Object.assign({}, settings, { sound: v })); window.JSound.enabled = v; } },
          e('span', null, settings.sound ? '🔊  Sound on' : '🔇  Sound off'),
          e('span', { className: 'toggle ' + (settings.sound ? 'on' : '') })),
        online ? e('button', { className: 'pause-row', onClick: onToggleAutopilot },
          e('span', null, autopilot ? '🤖  Autopilot on' : '🤖  Autopilot off — play for me if I step away'),
          e('span', { className: 'toggle ' + (autopilot ? 'on' : '') })) : null,
        e('button', { className: 'pause-row', onClick: onScorecard },
          e('span', null, '📊  Scorecard'), e('span', { style: { opacity: .4 } }, '›')),
        e('button', { className: 'pause-row', onClick: onSettings },
          e('span', null, '⚙️  Settings'), e('span', { style: { opacity: .4 } }, '›')),
        e('button', { className: 'pause-quit', onClick: onQuit }, 'Quit to home')
      )
    );
  }

  function makeCode() {
    const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)];
    return s;
  }

  function ShareModal({ code, onClose }) {
    const [copied, setCopied] = React.useState(false);
    const url = location.host + '/play/' + code;
    function copy() {
      try { navigator.clipboard.writeText(location.origin + '/play/' + code); } catch (e) {}
      setCopied(true); window.JSound && window.JSound.click();
      setTimeout(() => setCopied(false), 1800);
    }
    return e('div', { className: 'overlay center', onClick: onClose },
      e('div', { className: 'modal card-surface pad', onClick: (ev) => ev.stopPropagation() },
        e('div', { className: 'pause-title' }, 'Invite players'),
        e('p', { className: 'muted tiny', style: { textAlign: 'center', marginTop: -4, marginBottom: 12 } }, 'Share this so anyone can hop in or rejoin.'),
        e('div', { className: 'code-box' }, e('span', { className: 'code-text' }, code)),
        e('button', { className: 'btn btn-primary btn-block btn-lg', onClick: copy }, copied ? 'Link copied ✓' : '🔗  Copy invite link'),
        e('div', { className: 'muted tiny', style: { textAlign: 'center', marginTop: 8 } }, url),
        e('button', { className: 'btn btn-block', style: { marginTop: 8 }, onClick: onClose }, 'Done')
      )
    );
  }

  // deep link: /play/CODE drops the user straight into Join with the code prefilled
  const deepCode = (function () {
    try { const m = location.pathname.match(/\/play\/([A-Za-z0-9]+)/); return m ? m[1].toUpperCase() : ''; } catch (e) { return ''; }
  })();

  function App() {
    const [route, setRoute] = React.useState(deepCode ? 'join' : 'home');
    const connRef = React.useRef(null);
    const [roster, setRosterState] = React.useState(() => LS.get('roster', DEFAULT_ROSTER));
    const [history, setHistory] = React.useState(() => LS.get('history', SAMPLE_HISTORY));
    const [settings, setSettingsState] = React.useState(() => LS.get('settings', { table: 'fresh', back: 'classic', faceStyle: 'modern', sound: true, volume: 0.5, soundTheme: 'modern', easyView: false, fourColor: false }));
    const [, force] = React.useReducer((x) => x + 1, 0);
    const gameRef = React.useRef(null);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [chatOpen, setChatOpen] = React.useState(false);
    const [showCardFromMenu, setShowCardFromMenu] = React.useState(false);
    const [shareOpen, setShareOpen] = React.useState(false);
    const gameCodeRef = React.useRef('');

    // apply theme + sound on mount and when changed
    React.useEffect(() => { window.JThemes.applyTable(settings.table); }, [settings.table]);
    React.useEffect(() => { window.JSound.enabled = settings.sound; window.JSound.setVolume(settings.volume); window.JSound.setTheme('modern'); }, []);
    // expose accessibility flags so the table can size cards larger in Easy View
    window.JA11Y = { easyView: settings.easyView };

    function setRoster(r) { setRosterState(r); LS.set('roster', r); }
    function setSettings(s) { setSettingsState(s); LS.set('settings', s); }

    function go(r) { window.JSound && window.JSound.unlock(); setRoute(r); }

    function startGame(players, options) {
      window.JSound && window.JSound.unlock();
      const g = new window.JEngine.Game(players, Object.assign({ faceStyle: settings.faceStyle }, options), () => force());
      gameRef.current = g;
      gameCodeRef.current = (options && options.code) ? options.code : makeCode();
      g.startRound();
      setRoute('game');
    }

    // online: hand off a live server connection whose NetGame drives the table
    function startOnline(conn) {
      window.JSound && window.JSound.unlock();
      conn.game.onUpdate = () => force();
      gameRef.current = conn.game;
      connRef.current = conn;
      gameCodeRef.current = conn.code;
      // put the room code in the URL so a host who refreshes/backgrounds the tab
      // (common on iPad) lands back on the /play/CODE rejoin path, same as joiners.
      try { history.replaceState(null, '', '/play/' + conn.code); } catch (e) {}
      setRoute('game');
    }

    function leaveGame() {
      if (connRef.current) { connRef.current.close(); connRef.current = null; }
      gameRef.current = null;
      try { history.replaceState(null, '', '/'); } catch (e) {}
    }

    function saveResult(game) {
      const order = game.players.map((p, i) => ({ p, i, t: game.totals[i] })).sort((a, b) => b.t - a.t);
      const rec = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        players: order.map((o, k) => {
          let hit = 0; game.roundScores.forEach((rs) => { if (rs[o.i].pts > 0) hit++; });
          return { name: o.p.name, color: o.p.color, avatar: o.p.avatar, isBot: !!o.p.isBot, score: o.t, place: k + 1, bidsHit: hit, bidsTotal: game.roundScores.length };
        }),
      };
      const h = history.concat([rec]); setHistory(h); LS.set('history', h);
    }

    let screen;
    if (route === 'home') screen = e(HomeScreen, { go, roster });
    else if (route === 'setup') screen = e(SetupScreen, { go, roster, start: startGame, settings });
    else if (route === 'roster') screen = e(RosterScreen, { go, roster, setRoster });
    else if (route === 'host') screen = e(HostScreen, { go, startOnline, roster });
    else if (route === 'join') screen = e(JoinScreen, { go, startOnline, initialCode: deepCode });
    else if (route === 'standings') screen = e(StandingsScreen, { go, history });
    else if (route === 'howto') screen = e(HowToScreen, { go });
    else if (route === 'settings') screen = e(SettingsScreen, { go, settings, setSettings, onBack: () => go(gameRef.current ? 'game' : 'home') });
    else if (route === 'game' && gameRef.current) {
      screen = e(window.TableScreen, {
        game: gameRef.current,
        onMenu: () => { window.JSound && window.JSound.click(); setMenuOpen(true); },
        onChat: () => { window.JSound && window.JSound.click(); setChatOpen(true); },
        sound: settings.sound,
        onToggleSound: () => { const v = !settings.sound; setSettings(Object.assign({}, settings, { sound: v })); window.JSound.enabled = v; if (v) window.JSound.bid(); },
        onSaveResult: saveResult,
        onHome: () => { leaveGame(); setRoute('home'); },
      });
    } else screen = e(HomeScreen, { go, roster });

    const inGame = route === 'game' && gameRef.current;
    return e('div', { className: 'frame' + (settings.easyView ? ' a11y-easy' : '') },
      screen,
      // chat panel (opened from the top bar)
      inGame && chatOpen ? e(ChatPanel, { onClose: () => setChatOpen(false), players: gameRef.current.players }) : null,
      menuOpen ? e(GameMenu, {
        settings, setSettings,
        online: !!connRef.current,
        autopilot: !!(gameRef.current && gameRef.current.players && gameRef.current.players[0] && gameRef.current.players[0].auto),
        onToggleAutopilot: () => { const c = connRef.current; if (c) c.autopilot(!(gameRef.current.players[0] && gameRef.current.players[0].auto)); },
        onResume: () => setMenuOpen(false),
        onScorecard: () => { setMenuOpen(false); setShowCardFromMenu(true); },
        onInvite: () => { setMenuOpen(false); setShareOpen(true); },
        onSettings: () => { setMenuOpen(false); setRoute('settings'); },
        onQuit: () => { setMenuOpen(false); leaveGame(); setRoute('home'); },
      }) : null,
      showCardFromMenu && gameRef.current ? e(window.JTable.ScoreCard, { game: gameRef.current, onClose: () => setShowCardFromMenu(false) }) : null,
      shareOpen ? e(ShareModal, { code: gameCodeRef.current, onClose: () => setShareOpen(false) }) : null
    );
  }

  ReactDOM.createRoot(document.getElementById('app')).render(e(App));
})();
