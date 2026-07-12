/* Home, Setup, Roster screens. */
(function () {
  const e = React.createElement;
  const { Avatar, TopBar, Segmented } = window.JUI;
  const { PLAYER_COLORS, AVATARS } = window.JThemes;

  // Bots draw from this pool so no two tables feel like the same four opponents.
  // Sampled without replacement per game, so a table never seats two Ninas.
  const BOT_NAMES = [
    'Priya', 'Arjun', 'Rohan', 'Neha', 'Kiran', 'Ravi', 'Asha', 'Tara',
    'Meera', 'Karan', 'Riya', 'Dev', 'Anika', 'Amit', 'Sonia', 'Nikhil',
    'Clara', 'Marco', 'Elena', 'Diego', 'Nora', 'Felix', 'Iris', 'Hugo',
    'Lena', 'Theo', 'Mia', 'Sofia', 'Grace', 'Simon', 'Alice', 'Julia',
    'Ruby', 'Adam', 'Nadia', 'Leo', 'Vera', 'Rosa', 'Emil', 'Olivia',
  ];

  function pickBotNames(count) {
    const pool = BOT_NAMES.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    return pool.slice(0, count);
  }

  function Wordmark({ size = 1 }) {
    return e('div', { className: 'col center', style: { gap: 6 } },
      e('div', { className: 'row', style: { gap: 10, fontSize: 18 * size } },
        e('span', { style: { color: '#ff7a6e' } }, '♥'),
        e('span', { style: { color: 'var(--felt-text)' } }, '♠'),
        e('span', { style: { color: '#ff7a6e' } }, '♦'),
        e('span', { style: { color: 'var(--felt-text)' } }, '♣')
      ),
      e('h1', { className: 'on-felt', style: { fontSize: 46 * size, letterSpacing: '-.02em', lineHeight: .95 } }, 'Judgement'),
      e('div', { className: 'eyebrow on-felt', style: { opacity: .7 } }, 'The hand you call is the hand you make')
    );
  }

  function HomeTile({ icon, label, sub, onClick }) {
    return e('button', { className: 'home-tile', onClick },
      e('div', { className: 'ht-icon' }, icon),
      e('div', { className: 'col', style: { alignItems: 'flex-start' } },
        e('div', { className: 'ht-label' }, label),
        sub ? e('div', { className: 'ht-sub' }, sub) : null
      )
    );
  }

  function FanHero() {
    const Card = window.Card;
    const cards = [
      { rank: 14, suit: 'hearts' },
      { rank: 13, suit: 'spades' },
      { rank: 12, suit: 'diamonds' },
      { rank: 11, suit: 'clubs' },
      { rank: 10, suit: 'hearts' },
    ];
    const n = cards.length;
    return e('div', { className: 'home-fan', 'aria-hidden': 'true' },
      cards.map((c, i) => {
        const t = i - (n - 1) / 2;
        const angle = t * 11;
        return e('div', {
          key: i, className: 'fan-card',
          style: { transform: 'translateX(-50%) rotate(' + angle + 'deg)', zIndex: i },
        }, e(Card, { card: c, width: 82, faceStyle: 'modern' }));
      })
    );
  }

  function HomeScreen({ go, roster }) {
    const live = !!(window.JConfig && window.JConfig.multiplayerLive);
    return e('div', { className: 'screen home-screen' },
      e('div', { className: 'home-inner' },
        e('div', { className: 'safe-top' }),
        e('div', { className: 'home-spacer' }),
        e('div', { className: 'home-center' },
          e('div', { className: 'col center', style: { padding: '0 22px' } }, e(Wordmark, null)),
          e('div', { className: 'home-actions' },
            e('button', { className: 'btn btn-primary btn-block btn-lg', onClick: () => go('setup') }, '▶  Play vs bots'),
            live
              ? e('button', { className: 'btn btn-outline btn-block btn-lg', onClick: () => go('host') }, 'Start a game')
              : null,
            live
              ? e('button', { className: 'btn btn-outline btn-block btn-lg', onClick: () => go('join') }, 'Join a game')
              : e('p', { className: 'on-felt tiny', style: { opacity: .65, textAlign: 'center', marginTop: 14, marginBottom: 0 } },
                  'Online multiplayer isn’t live yet — for now it’s you against the bots.'),
            e('div', { className: 'home-foot' },
              e('button', { className: 'foot-link', onClick: () => go('howto') }, 'How to play'),
              e('span', { className: 'foot-sep' }, '·'),
              e('button', { className: 'foot-link', onClick: () => go('standings') }, 'Leaderboard'),
              e('span', { className: 'foot-sep' }, '·'),
              e('button', { className: 'foot-link', onClick: () => go('settings') }, 'Settings'))
          )
        ),
        e('div', { className: 'home-spacer' }),
        e(FanHero, null)
      )
    );
  }

  /* ---------- Setup (practice alone vs bots) ---------- */
  function SetupScreen({ go, roster, start, settings }) {
    const [size, setSize] = React.useState(4);
    function begin() {
      const you = roster.find((r) => r.you) || { id: 'you', name: 'You', color: PLAYER_COLORS[0], avatar: AVATARS[0], you: true };
      const seats = [you];
      const botNames = pickBotNames(size - 1);
      while (seats.length < size) {
        const i = seats.length;
        seats.push({ id: 'bot' + i, name: botNames[i - 1] || ('Bot ' + i), color: PLAYER_COLORS[i % PLAYER_COLORS.length], avatar: AVATARS[i % AVATARS.length], isBot: true });
      }
      const maxCards = Math.floor(52 / size);
      start(seats, { startCards: maxCards, scoring: 'classic', faceStyle: settings.faceStyle });
    }
    return e('div', { className: 'screen' },
      e(TopBar, { title: 'Play vs bots', onBack: () => go('home') }),
      e('div', { className: 'scroll pad' },
        e('div', { className: 'field-label', style: { color: 'var(--felt-text)', opacity: .7, marginTop: 8 } }, 'How many players?'),
        e('div', { className: 'numpick' },
          [4, 5, 6].map((nN) => e('button', {
            key: nN, className: 'numbtn' + (nN === size ? ' on' : ''),
            onClick: () => { setSize(nN); window.JSound && window.JSound.click(); },
          }, nN))
        ),
        e('p', { className: 'on-felt tiny', style: { opacity: .6, textAlign: 'center', marginTop: 14 } },
          'You play against ', e('b', null, size - 1), ' practice opponents.'),
        e('button', { className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 18 }, onClick: begin }, '▶  Start game')
      )
    );
  }

  /* ---------- Roster ---------- */
  function RosterScreen({ go, roster, setRoster }) {
    const [editing, setEditing] = React.useState(null); // index or 'new'
    function save(player) {
      if (editing === 'new') setRoster(roster.concat([Object.assign({ id: 'p' + Date.now() }, player)]));
      else setRoster(roster.map((r, i) => i === editing ? Object.assign({}, r, player) : r));
      setEditing(null);
    }
    function remove(i) { setRoster(roster.filter((_, k) => k !== i)); setEditing(null); }

    return e('div', { className: 'screen' },
      e(TopBar, { title: 'Family players', onBack: () => go('home'),
        right: e('button', { className: 'icon-btn', onClick: () => setEditing('new') }, '+') }),
      e('div', { className: 'scroll pad' },
        e('p', { className: 'on-felt tiny', style: { opacity: .7, marginTop: 0, marginBottom: 14 } },
          'Save everyone who plays. Pick them into games and track them on the leaderboard. Stored on this device.'),
        roster.length === 0 ? e('div', { className: 'on-felt', style: { opacity: .6, textAlign: 'center', padding: 30 } }, 'No players yet, tap + to add your family.') : null,
        e('div', { className: 'col', style: { gap: 10 } },
          roster.map((r, i) => e('button', { key: r.id, className: 'roster-row', onClick: () => setEditing(i) },
            e(Avatar, { player: r, size: 46 }),
            e('div', { className: 'col grow', style: { alignItems: 'flex-start' } },
              e('div', { style: { fontWeight: 700, fontSize: 17 } }, r.name, r.you ? e('span', { className: 'you-tag' }, 'you') : null),
              e('div', { className: 'tiny muted' }, 'Tap to edit')
            ),
            e('span', { style: { color: 'var(--ink-faint)' } }, '›')
          ))
        )
      ),
      editing !== null ? e(PlayerEditor, {
        player: editing === 'new' ? null : roster[editing],
        used: roster.map((r) => r.color),
        onSave: save, onRemove: editing === 'new' ? null : () => remove(editing), onClose: () => setEditing(null),
      }) : null
    );
  }

  function PlayerEditor({ player, onSave, onRemove, onClose }) {
    const [name, setName] = React.useState(player ? player.name : '');
    const [color, setColor] = React.useState(player ? player.color : PLAYER_COLORS[1]);
    const [avatar, setAvatar] = React.useState(player ? player.avatar : AVATARS[1]);
    return e('div', { className: 'overlay', onClick: onClose },
      e('div', { className: 'modal sheet pad', onClick: (ev) => ev.stopPropagation() },
        e('div', { className: 'sheet-handle' }),
        e('h3', { style: { fontSize: 22, marginBottom: 14 } }, player ? 'Edit player' : 'Add player'),
        e('div', { className: 'row center', style: { marginBottom: 16 } },
          e(Avatar, { player: { name: name || '?', color, avatar }, size: 76 })),
        e('input', { className: 'text-input', placeholder: 'Name', value: name, maxLength: 16,
          onChange: (ev) => setName(ev.target.value) }),
        e('div', { className: 'field-label' }, 'Color'),
        e('div', { className: 'swatch-row' }, PLAYER_COLORS.map((c) =>
          e('button', { key: c, className: 'swatch' + (c === color ? ' on' : ''), style: { background: c }, onClick: () => setColor(c) }))),
        e('div', { className: 'field-label' }, 'Token'),
        e('div', { className: 'swatch-row' }, AVATARS.map((a) =>
          e('button', { key: a, className: 'glyph' + (a === avatar ? ' on' : ''), onClick: () => setAvatar(a) }, a))),
        e('button', { className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 18 }, disabled: !name.trim(),
          onClick: () => onSave({ name: name.trim(), color, avatar }) }, 'Save'),
        onRemove ? e('button', { className: 'btn btn-block', style: { color: 'var(--bad)', marginTop: 6 }, onClick: onRemove }, 'Remove') : null
      )
    );
  }

  window.JScreens = { Wordmark, HomeScreen, SetupScreen, RosterScreen };
})();
