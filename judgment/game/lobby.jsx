/* Online lobby (host / join), chat & emotes.
   Wired to the server-authoritative Room over WebSocket (game/net.js). The
   visual design is unchanged from the prototype — only the simulated joiners
   were replaced with real lobby state from the server. */
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

  /* ---------- HOST: share a code; host starts when ready ---------- */
  function HostScreen({ go, startOnline, roster }) {
    const you = roster.find((r) => r.you) || { name: 'You', color: PLAYER_COLORS[0], avatar: AVATARS[0] };
    const [name, setName] = React.useState(you.name && you.name !== 'You' ? you.name : '');
    const [code] = React.useState(makeCode);
    const [lobby, setLobby] = React.useState(null);
    const [copied, setCopied] = React.useState(false);
    const [err, setErr] = React.useState('');
    const connRef = React.useRef(null);
    const handedOff = React.useRef(false);

    React.useEffect(() => {
      const conn = window.JNet.open(code, {
        name: (name || 'Host'), color: you.color || PLAYER_COLORS[0], avatar: you.avatar || AVATARS[0],
      }, {
        onLobby: (m) => setLobby(m),
        onState: () => { if (!handedOff.current) { handedOff.current = true; startOnline(conn); } },
        onError: (msg) => setErr(msg),
      });
      connRef.current = conn;
      return () => { if (!handedOff.current) conn.close(); };
    }, []); // open once

    // push name edits to the server (same token → server just renames the seat)
    React.useEffect(() => {
      const c = connRef.current;
      if (c && name.trim()) c.send({ t: 'join', token: window.JNet.token(), name: name.trim(), color: you.color, avatar: you.avatar });
    }, [name]);

    const seats = lobby ? lobby.seats : [];
    const size = lobby ? lobby.size : 4;
    const botsEnabled = lobby ? lobby.botsEnabled : false;
    const url = location.host + '/play/' + code;
    const canStart = botsEnabled ? seats.length >= 1 : seats.length >= 3;

    function copy() {
      try { navigator.clipboard.writeText(location.origin + '/play/' + code); } catch (err) {}
      setCopied(true); window.JSound && window.JSound.click();
      setTimeout(() => setCopied(false), 1800);
    }

    const chips = [];
    for (let i = 0; i < Math.max(size, seats.length); i++) {
      chips.push(i < seats.length ? { kind: i === 0 ? 'host' : 'in', p: seats[i] } : { kind: 'wait' });
    }

    return e('div', { className: 'screen' },
      e(TopBar, { title: 'Start a game', onBack: () => go('home') }),
      e('div', { className: 'scroll pad' },
        e('p', { className: 'host-intro' }, 'Name yourself, pick the table size, then share the code — everyone hops in from the link.'),
        err ? e('div', { className: 'lobby-status', style: { color: 'var(--bad)', marginTop: 0 } }, err) : null,
        e('div', { className: 'field-label', style: { color: 'var(--felt-text)', opacity: .7, marginTop: 2 } }, 'Your name'),
        e('input', { className: 'text-input', placeholder: 'Your name', value: name, maxLength: 16, onChange: (ev) => setName(ev.target.value) }),
        e('div', { className: 'field-label', style: { color: 'var(--felt-text)', opacity: .7, marginTop: 18 } }, 'How many players?'),
        e('div', { className: 'numpick' },
          [4, 5, 6].map((nN) => e('button', {
            key: nN, className: 'numbtn' + (nN === size ? ' on' : ''),
            onClick: () => { connRef.current && connRef.current.setSize(nN); window.JSound && window.JSound.click(); },
          }, nN))
        ),
        e('div', { className: 'field-label', style: { color: 'var(--felt-text)', opacity: .7, marginTop: 18 } }, 'Invite'),
        e('div', { className: 'invite-box' },
          e('span', { className: 'invite-code' }, code),
          e('button', { className: 'btn btn-ghost invite-copy', onClick: copy }, copied ? 'Copied ✓' : '🔗 Copy link')
        ),
        e('div', { className: 'set-line', style: { marginTop: 18 } },
          e('div', { className: 'col grow', style: { alignItems: 'flex-start' } },
            e('div', { className: 'set-title' }, 'Fill empty seats with bots'),
            e('div', { className: 'set-sub' }, 'Start without waiting for a full table')),
          e('button', { className: 'toggle ' + (botsEnabled ? 'on' : ''), onClick: () => connRef.current && connRef.current.setBots(!botsEnabled) })),
        e('div', { className: 'field-label', style: { color: 'var(--felt-text)', opacity: .7, marginTop: 18 } }, 'At the table (' + seats.length + ' of ' + size + ')'),
        e('div', { className: 'join-progress' }, e('div', { className: 'join-progress-fill', style: { width: (100 * Math.min(seats.length, size) / size) + '%' } })),
        e('div', { className: 'lobby-chips' },
          chips.map((c, i) => c.kind === 'wait'
            ? e('div', { key: 'w' + i, className: 'mini-seat wait' }, e('span', { className: 'ms-q' }, '…'), e('span', { className: 'ms-name' }, 'open'))
            : e('div', { key: i, className: 'mini-seat in' + (c.p.connected === false ? ' wait' : '') },
                e(Avatar, { player: c.p, size: 38 }),
                e('span', { className: 'ms-name' }, i === 0 ? 'You' : c.p.name)))
        ),
        e('button', {
          className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 20 }, disabled: !canStart,
          onClick: () => { connRef.current && connRef.current.start(); window.JSound && window.JSound.bid(); },
        }, canStart ? 'Start game' : 'Waiting for players…'),
        e('div', { className: 'lobby-status' }, botsEnabled ? 'Empty seats will be filled with bots.' : 'Share the code — start once everyone has joined.')
      )
    );
  }

  /* ---------- JOIN: enter name + code, seat by name, wait for host ---------- */
  function JoinScreen({ go, startOnline, initialCode }) {
    const [val, setVal] = React.useState(initialCode || '');
    const [name, setName] = React.useState('');
    const [lobby, setLobby] = React.useState(null);
    const [joined, setJoined] = React.useState(false);
    const [err, setErr] = React.useState('');
    const connRef = React.useRef(null);
    const handedOff = React.useRef(false);

    function extractCode(v) {
      let t = String(v).trim();
      if (t.indexOf('/') >= 0) t = t.split('/').filter(Boolean).pop() || '';
      t = t.toUpperCase().replace(/[^ABCDEFGHJKLMNPQRSTUVWXYZ23456789]/g, '');
      return t.slice(0, 8);
    }
    const code = extractCode(val);

    React.useEffect(() => () => { if (connRef.current && !handedOff.current) connRef.current.close(); }, []);

    function joinGame() {
      if (!code || !name.trim()) return;
      setErr('');
      const conn = window.JNet.open(code, { name: name.trim(), color: PLAYER_COLORS[2], avatar: AVATARS[2] }, {
        onWelcome: () => setJoined(true),
        onLobby: (m) => setLobby(m),
        onState: () => { if (!handedOff.current) { handedOff.current = true; startOnline(conn); } },
        onError: (msg) => setErr(msg),
      });
      connRef.current = conn;
      window.JSound && window.JSound.bid();
    }

    if (joined) {
      const seats = lobby ? lobby.seats : [];
      const size = lobby ? lobby.size : (seats.length || 4);
      const mySeat = lobby ? lobby.you.seat : 0;
      const chips = [];
      for (let i = 0; i < Math.max(size, seats.length); i++) chips.push(i < seats.length ? { kind: 'in', p: seats[i] } : { kind: 'wait' });
      return e('div', { className: 'screen' },
        e(TopBar, { title: 'At the table', onBack: () => { if (connRef.current) connRef.current.close(); go('home'); } }),
        e('div', { className: 'scroll pad', style: { textAlign: 'center' } },
          e('div', { className: 'on-felt', style: { fontWeight: 800, fontSize: 22, marginTop: 8 } }, 'You’re in!'),
          e('div', { className: 'on-felt tiny', style: { opacity: .7, marginBottom: 18 } }, 'Room ', e('b', null, code)),
          err ? e('div', { className: 'lobby-status', style: { color: 'var(--bad)' } }, err) : null,
          e('div', { className: 'lobby-chips', style: { justifyContent: 'center' } },
            chips.map((c, i) => c.kind === 'wait'
              ? e('div', { key: 'w' + i, className: 'mini-seat wait' }, e('span', { className: 'ms-q' }, '…'), e('span', { className: 'ms-name' }, 'open'))
              : e('div', { key: i, className: 'mini-seat in' + (c.p.connected === false ? ' wait' : '') }, e(Avatar, { player: c.p, size: 38 }), e('span', { className: 'ms-name' }, i === mySeat ? 'You' : c.p.name)))),
          e('div', { className: 'lobby-status' }, 'Waiting for the host to start…')
        )
      );
    }
    return e('div', { className: 'screen' },
      e(TopBar, { title: 'Join a game', onBack: () => go('home') }),
      e('div', { className: 'scroll pad' },
        err ? e('div', { className: 'lobby-status', style: { color: 'var(--bad)', marginTop: 0 } }, err) : null,
        e('div', { className: 'field-label', style: { color: 'var(--felt-text)', opacity: .7, marginTop: 2 } }, 'Your name'),
        e('input', { className: 'text-input', placeholder: 'Your name', value: name, maxLength: 16, onChange: (ev) => setName(ev.target.value) }),
        e('div', { className: 'field-label', style: { color: 'var(--felt-text)', opacity: .7, marginTop: 18 } }, 'Game code'),
        e('input', { className: 'code-input', placeholder: '· · · · ·', value: val, autoCapitalize: 'characters', autoCorrect: 'off', spellCheck: false, onChange: (ev) => setVal(ev.target.value) }),
        e('div', { className: 'join-hint' }, code ? e('span', null, 'Joining room ', e('b', { style: { letterSpacing: '.12em' } }, code)) : 'Tap the invite link a friend sent, or type their code here.'),
        e('button', { className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 18 }, disabled: !code || !name.trim(), onClick: joinGame }, 'Join game')
      )
    );
  }

  /* ---------- CHAT (unchanged; local echo — not wired to a button yet) ---------- */
  const SEED_CHAT = [
    { who: 'Mom', me: false, text: 'Good luck everyone 😘' },
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
        e('button', { className: 'icon-btn', style: { color: 'var(--ink)', background: 'var(--paper-2)' }, onClick: onClose }, '✕')),
      e('div', { className: 'chat-msgs', ref: endRef },
        msgs.map((m, i) => e('div', { key: i, className: 'chat-msg ' + (m.me ? 'me' : 'them') },
          m.me ? null : e('div', { className: 'who' }, m.who), m.text))
      ),
      e('div', { className: 'emote-row' },
        ['👏', '😂', '😭', '🔥', '🎯', '😈'].map((em) =>
          e('button', { key: em, className: 'emote', onClick: () => send(em) }, em))
      ),
      e('div', { className: 'chat-input' },
        e('input', { className: 'text-input', placeholder: 'Say something…', value: text,
          onChange: (ev) => setText(ev.target.value), onKeyDown: (ev) => ev.key === 'Enter' && send() }),
        e('button', { className: 'btn btn-primary', style: { minHeight: 50, padding: '0 20px' }, onClick: () => send() }, 'Send'))
    );
  }

  window.JLobby = { HostScreen, JoinScreen, ChatPanel };
})();
