/* Home, Setup, Roster screens. */
(function () {
  const e = React.createElement;
  const { Avatar, TopBar, Segmented } = window.JUI;
  const { PLAYER_COLORS, AVATARS } = window.JThemes;

  function Wordmark({ size = 1 }) {
    return e('div', { className: 'col center', style: { gap: 6 } },
      e('div', { className: 'row', style: { gap: 10, fontSize: 18 * size } },
        e('span', { style: { color: '#ff7a6e' } }, '\u2665'),
        e('span', { style: { color: 'var(--felt-text)' } }, '\u2660'),
        e('span', { style: { color: '#ff7a6e' } }, '\u2666'),
        e('span', { style: { color: 'var(--felt-text)' } }, '\u2663')
      ),
      e('h1', { className: 'on-felt', style: { fontSize: 52 * size, letterSpacing: '-.02em', lineHeight: .95 } }, 'Judgment'),
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

  function HomeScreen({ go, roster }) {
    return e('div', { className: 'screen' },
      e('div', { className: 'scroll' },
        e('div', { className: 'safe-top' }),
        e('div', { className: 'col center', style: { padding: '46px 20px 26px' } }, e(Wordmark, null)),
        e('div', { className: 'pad', style: { paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 12 } },
          e('button', { className: 'btn btn-primary btn-block btn-lg', onClick: () => go('setup') },
            '\u25B6  Play now'),
          e('div', { className: 'row', style: { gap: 12 } },
            e('button', { className: 'btn btn-ghost grow', onClick: () => go('host') }, 'Host online'),
            e('button', { className: 'btn btn-ghost grow', onClick: () => go('join') }, 'Join with code')
          ),
          e('div', { style: { height: 6 } }),
          e('div', { className: 'tiles' },
            e(HomeTile, { icon: '\uD83D\uDCD6', label: 'How to play', sub: '2 min read', onClick: () => go('howto') }),
            e(HomeTile, { icon: '\u2699\uFE0F', label: 'Settings', sub: 'Themes & sound', onClick: () => go('settings') })
          )
        )
      )
    );
  }

  /* ---------- Setup (local game vs bots) ---------- */
  function SetupScreen({ go, roster, start, settings }) {
    const defaultSeats = () => {
      const you = roster.find((r) => r.you) || { id: 'you', name: 'You', color: PLAYER_COLORS[0], avatar: AVATARS[0], you: true };
      const seats = [you];
      while (seats.length < 4) {
        const i = seats.length;
        seats.push({ id: 'bot' + i, name: 'Bot ' + i, color: PLAYER_COLORS[i % PLAYER_COLORS.length], avatar: AVATARS[i % AVATARS.length], isBot: true });
      }
      return seats;
    };
    const [seats, setSeats] = React.useState(defaultSeats);

    function addSeat() {
      if (seats.length >= 8) return;
      const i = seats.length;
      setSeats(seats.concat([{ id: 'bot' + Date.now(), name: 'Bot ' + i, color: PLAYER_COLORS[i % PLAYER_COLORS.length], avatar: AVATARS[i % AVATARS.length], isBot: true }]));
      window.JSound && window.JSound.click();
    }
    function removeSeat() {
      if (seats.length > 3) setSeats(seats.slice(0, -1));
      window.JSound && window.JSound.click();
    }

    const maxCards = Math.floor(52 / seats.length);
    const rounds = window.JEngine.buildSchedule(seats.length, maxCards).length;

    return e('div', { className: 'screen' },
      e(TopBar, { title: 'New game', onBack: () => go('home') }),
      e('div', { className: 'scroll pad', style: { paddingTop: 10, display: 'flex', flexDirection: 'column' } },

        // simple: how many players
        e('div', { className: 'col center', style: { gap: 6, marginTop: 18 } },
          e('div', { className: 'on-felt', style: { fontWeight: 800, fontSize: 19, whiteSpace: 'nowrap' } }, 'How many players?'),
          e('div', { className: 'on-felt tiny', style: { opacity: .65, textAlign: 'center', maxWidth: 280 } },
            'It\u2019s just you vs. friendly bots for now \u2014 great for learning the game.')
        ),

        // big stepper
        e('div', { className: 'row center', style: { gap: 22, margin: '24px 0 18px' } },
          e('button', { className: 'step-btn', onClick: removeSeat, disabled: seats.length <= 3 }, '\u2212'),
          e('div', { className: 'col center', style: { width: 70 } },
            e('div', { style: { fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 56, lineHeight: 1, color: 'var(--felt-text)' } }, seats.length),
            e('div', { className: 'on-felt tiny', style: { opacity: .6 } }, 'players')
          ),
          e('button', { className: 'step-btn', onClick: addSeat, disabled: seats.length >= 8 }, '+')
        ),

        // full-deck format note
        e('div', { className: 'setup-block', style: { textAlign: 'center' } },
          e('div', { className: 'on-felt', style: { fontWeight: 800, fontSize: 15, marginBottom: 4 } }, 'Full deck \u00b7 ', e('b', null, rounds), ' rounds'),
          e('p', { className: 'on-felt tiny', style: { opacity: .65, margin: 0 } },
            'Deal all the cards (', e('b', null, maxCards), ' each), count down to 1, then back up. Trump is random each round. Hit your bid exactly for ', e('b', null, '10 + your bid'), '.')
        ),

        e('button', {
          className: 'btn btn-primary btn-block btn-lg', style: { marginTop: 4 },
          onClick: () => start(seats, { startCards: maxCards, scoring: 'classic', faceStyle: settings.faceStyle }),
        }, '\u25B6  Start game')
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
          'Save everyone who plays. Pick them into games and track them on the leaderboard. (Syncs to your database once Claude Code wires it up.)'),
        roster.length === 0 ? e('div', { className: 'on-felt', style: { opacity: .6, textAlign: 'center', padding: 30 } }, 'No players yet \u2014 tap + to add your family.') : null,
        e('div', { className: 'col', style: { gap: 10 } },
          roster.map((r, i) => e('button', { key: r.id, className: 'roster-row', onClick: () => setEditing(i) },
            e(Avatar, { player: r, size: 46 }),
            e('div', { className: 'col grow', style: { alignItems: 'flex-start' } },
              e('div', { style: { fontWeight: 700, fontSize: 17 } }, r.name, r.you ? e('span', { className: 'you-tag' }, 'you') : null),
              e('div', { className: 'tiny muted' }, 'Tap to edit')
            ),
            e('span', { style: { color: 'var(--ink-faint)' } }, '\u203A')
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
