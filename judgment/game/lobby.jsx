/* Online lobby (host / join), chat & emotes.
   STUBBED for the prototype: no real network. Designed so Claude Code can wire
   each state to a server-authoritative room keyed by the share code.
*/
(function () {
  const e = React.createElement;
  const { Avatar, TopBar } = window.JUI;
  const { PLAYER_COLORS, AVATARS } = window.JThemes;

  function makeCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  }

  /* ---------- HOST + LOBBY ---------- */
  function HostScreen({ go, start, roster }) {
    const you = roster.find((r) => r.you) || { name: 'You', color: PLAYER_COLORS[0], avatar: AVATARS[0] };
    const [name, setName] = React.useState(you.name === 'You' ? '' : you.name);
    const [phase, setPhase] = React.useState('name'); // name | lobby
    const [code] = React.useState(makeCode);
    const [seats, setSeats] = React.useState([]);
    const [bots, setBots] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const url = 'nicksgames.app/play/' + code;

    function create() {
      if (!name.trim()) return;
      setSeats([{ id: 'host', name: name.trim(), color: you.color || PLAYER_COLORS[0], avatar: you.avatar || AVATARS[0], host: true, ready: true }]);
      setPhase('lobby');
      window.JSound && window.JSound.bid();
    }

    // demo only: simulate family members joining over time
    React.useEffect(() => {
      if (phase !== 'lobby') return;
      const joiners = ['Mom', 'Dad', 'Priya'];
      const timers = joiners.map((nm, i) => setTimeout(() => {
        setSeats((s) => s.length < 6 ? s.concat([{
          id: 'j' + i, name: nm, color: PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length],
          avatar: AVATARS[(i + 1) % AVATARS.length], ready: Math.random() > 0.4,
        }]) : s);
      }, 1500 + i * 1800));
      return () => timers.forEach(clearTimeout);
    }, [phase]);

    function copy() {
      try { navigator.clipboard.writeText('https://' + url); } catch (err) {}
      setCopied(true); window.JSound && window.JSound.click();
      setTimeout(() => setCopied(false), 1800);
    }

    function begin() {
      // prototype: launch a local game using the lobby seats (remote players act as bots here)
      const players = seats.map((s, i) => Object.assign({}, s, { isBot: i !== 0 }));
      start(players, { startCards: 7, scoring: 'classic' });
    }

    if (phase === 'name') {
      return e('div', { className: 'screen' },
        e(TopBar, { title: 'Host a game', onBack: () => go('home') }),
        e('div', { className: 'scroll pad' },
          e('p', { className: 'on-felt', style: { opacity: .8, marginTop: 0 } }, 'Start a private table and share the link. Family taps it, types a name, and they\u2019re in \u2014 no account needed.'),
          e('div', { className: 'field-label', style: { color: 'var(--felt-text)', opacity: .7 } }, 'Your name'),
          e('input', { className: 'text-input', placeholder: 'e.g. Nick', value: name, maxLength: 16, onChange: (ev) => setName(ev.target.value) }),
          e('button', { className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 18 }, disabled: !name.trim(), onClick: create }, 'Create table')
        )
      );
    }

    const canStart = seats.length >= 3 && seats.every((s) => s.ready);
    return e('div', { className: 'screen' },
      e(TopBar, { title: 'Your table', onBack: () => go('home'), sub: seats.length + ' joined' }),
      e('div', { className: 'scroll pad' },
        e('div', { className: 'on-felt tiny', style: { opacity: .7, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'center' } }, 'Room code'),
        e('div', { className: 'code-box' }, e('span', { className: 'code-text' }, code)),
        e('div', { className: 'link-row' },
          e('input', { value: url, readOnly: true }),
          e('button', { className: 'btn btn-primary', style: { minHeight: 42, padding: '10px 16px' }, onClick: copy }, copied ? 'Copied \u2713' : 'Copy')
        ),
        e('div', { className: 'row', style: { gap: 10, margin: '10px 0 18px' } },
          e('button', { className: 'btn btn-ghost grow', onClick: copy }, '\uD83D\uDD17 Share link'),
          e('button', { className: 'btn btn-ghost grow', onClick: () => window.JSound && window.JSound.click() }, '\u2709 Invite')
        ),

        e('div', { className: 'on-felt', style: { fontWeight: 800, marginBottom: 10 } }, 'At the table'),
        e('div', { className: 'col', style: { gap: 8 } },
          seats.map((s) => e('div', { key: s.id, className: 'lobby-seat' },
            e(Avatar, { player: s, size: 40 }),
            e('div', { className: 'col', style: { alignItems: 'flex-start' } },
              e('div', { style: { fontWeight: 700, color: 'var(--felt-text)' } }, s.name, s.host ? e('span', { className: 'you-tag' }, 'host') : null),
              e('div', { className: 'tiny', style: { color: 'var(--felt-text)', opacity: .6 } }, s.ready ? 'Ready' : 'Getting ready\u2026')
            ),
            e('span', { className: 'ready-dot ' + (s.ready ? 'on' : 'off') })
          )),
          Array.from({ length: Math.max(0, 4 - seats.length) }).map((_, i) =>
            e('div', { key: 'empty' + i, className: 'lobby-seat empty' },
              e('div', { className: 'avatar', style: { width: 40, height: 40, background: 'rgba(255,255,255,.12)', color: 'var(--felt-text)' } }, '?'),
              e('div', { className: 'tiny', style: { color: 'var(--felt-text)', opacity: .6 } }, bots ? 'Will fill with a bot' : 'Waiting for a player\u2026')
            )
          )
        ),

        e('div', { className: 'set-row', style: { marginTop: 14, borderTop: 'none', background: 'rgba(0,0,0,.2)', borderRadius: 14, padding: '12px 14px' } },
          e('div', { className: 'col grow', style: { alignItems: 'flex-start' } },
            e('div', { className: 'set-label' }, 'Add bots to empty seats'),
            e('div', { className: 'tiny', style: { color: 'var(--felt-text)', opacity: .6 } }, 'Off by default \u2014 great for practice with the grandparents')
          ),
          e('button', { className: 'toggle ' + (bots ? 'on' : ''), onClick: () => { setBots(!bots); window.JSound && window.JSound.click(); } })
        ),

        e('button', { className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 16 }, disabled: !canStart && !bots,
          onClick: begin }, canStart || bots ? 'Start game \u2192' : 'Waiting for everyone to be ready\u2026'),
        e('p', { className: 'on-felt tiny', style: { opacity: .55, textAlign: 'center', marginTop: 10 } },
          'Demo: tap Start to play this table vs. the engine. Online, only the host sees this button.')
      )
    );
  }

  /* ---------- JOIN ---------- */
  function JoinScreen({ go }) {
    const [code, setCode] = React.useState('');
    const [name, setName] = React.useState('');
    const [joined, setJoined] = React.useState(false);
    if (joined) {
      return e('div', { className: 'screen' },
        e(TopBar, { title: 'Joining\u2026', onBack: () => go('home') }),
        e('div', { className: 'col center grow pad', style: { gap: 16 } },
          e('div', { className: 'spinner' }),
          e('div', { className: 'on-felt', style: { fontWeight: 700, fontSize: 18 } }, 'Waiting for the host to start\u2026'),
          e('div', { className: 'on-felt tiny', style: { opacity: .65, textAlign: 'center' } }, 'You\u2019re in room ', e('b', null, code.toUpperCase()), '. Hang tight \u2014 ', e('b', null, name), ' is at the table.'),
          e('div', { className: 'lobby-seat', style: { marginTop: 8 } },
            e(Avatar, { player: { name: name || '?', color: PLAYER_COLORS[2], avatar: AVATARS[2] }, size: 40 }),
            e('div', { style: { fontWeight: 700, color: 'var(--felt-text)' } }, name || 'You'),
            e('span', { className: 'ready-dot on' }))
        )
      );
    }
    return e('div', { className: 'screen' },
      e(TopBar, { title: 'Join a game', onBack: () => go('home') }),
      e('div', { className: 'scroll pad' },
        e('p', { className: 'on-felt', style: { opacity: .8, marginTop: 0 } }, 'Got a link or code from your family? Drop in here.'),
        e('div', { className: 'field-label', style: { color: 'var(--felt-text)', opacity: .7 } }, 'Room code'),
        e('input', { className: 'text-input', placeholder: 'ABCDE', value: code, maxLength: 5,
          style: { textTransform: 'uppercase', letterSpacing: '.2em', fontFamily: 'var(--ff-display)', fontSize: 24, textAlign: 'center' },
          onChange: (ev) => setCode(ev.target.value.toUpperCase()) }),
        e('div', { className: 'field-label', style: { color: 'var(--felt-text)', opacity: .7 } }, 'Your name'),
        e('input', { className: 'text-input', placeholder: 'e.g. Grandma', value: name, maxLength: 16, onChange: (ev) => setName(ev.target.value) }),
        e('button', { className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 18 }, disabled: code.length < 4 || !name.trim(),
          onClick: () => { setJoined(true); window.JSound && window.JSound.bid(); } }, 'Join table')
      )
    );
  }

  /* ---------- CHAT ---------- */
  const SEED_CHAT = [
    { who: 'Mom', me: false, text: 'Good luck everyone \uD83D\uDE18' },
    { who: 'Dad', me: false, text: 'Nick always overbids haha' },
  ];
  function ChatPanel({ onClose, players }) {
    const [msgs, setMsgs] = React.useState(SEED_CHAT);
    const [text, setText] = React.useState('');
    const endRef = React.useRef(null);
    React.useEffect(() => { if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight; }, [msgs]);
    function send(t) {
      const v = (t || text).trim(); if (!v) return;
      setMsgs((m) => m.concat([{ who: 'You', me: true, text: v }]));
      setText(''); window.JSound && window.JSound.click();
    }
    return e('div', { className: 'chat-panel' },
      e('div', { className: 'row between pad', style: { borderBottom: '1px solid var(--line)', flex: 'none' } },
        e('h3', { style: { fontSize: 20 } }, 'Table chat'),
        e('button', { className: 'icon-btn', style: { color: 'var(--ink)', background: 'var(--paper-2)' }, onClick: onClose }, '\u2715')),
      e('div', { className: 'chat-msgs', ref: endRef },
        msgs.map((m, i) => e('div', { key: i, className: 'chat-msg ' + (m.me ? 'me' : 'them') },
          m.me ? null : e('div', { className: 'who' }, m.who), m.text))
      ),
      e('div', { className: 'emote-row' },
        ['\uD83D\uDC4F', '\uD83D\uDE02', '\uD83D\uDE2D', '\uD83D\uDD25', '\uD83C\uDFAF', '\uD83D\uDE08'].map((em) =>
          e('button', { key: em, className: 'emote', onClick: () => send(em) }, em))
      ),
      e('div', { className: 'chat-input' },
        e('input', { className: 'text-input', placeholder: 'Say something\u2026', value: text,
          onChange: (ev) => setText(ev.target.value), onKeyDown: (ev) => ev.key === 'Enter' && send() }),
        e('button', { className: 'btn btn-primary', style: { minHeight: 50, padding: '0 20px' }, onClick: () => send() }, 'Send'))
    );
  }

  window.JLobby = { HostScreen, JoinScreen, ChatPanel };
})();
