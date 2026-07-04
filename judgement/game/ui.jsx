/* Shared UI atoms used across screens. */
(function () {
  const { SUIT_SYMBOL, SUIT_COLOR } = window.JEngine;
  const e = React.createElement;

  function Avatar({ player, size = 44, ring, dim, initials }) {
    const s = size;
    const fs = Math.round(s * (initials ? 0.42 : 0.46));
    const glyph = (initials || !player.avatar)
      ? (player.name ? player.name[0].toUpperCase() : '?')
      : player.avatar;
    return e('div', {
      className: 'avatar' + (ring ? ' active-glow' : ''),
      style: {
        width: s, height: s, fontSize: fs, fontWeight: initials ? 800 : 700,
        background: 'radial-gradient(120% 120% at 30% 20%, ' + tint(player.color, 0.22) + ', ' + player.color + ')',
        opacity: dim ? 0.55 : 1,
        border: '2px solid rgba(255,255,255,.5)',
      },
    }, glyph);
  }

  // lighten a hex color toward white by amt (0..1)
  function tint(hex, amt) {
    const c = hex.replace('#', '');
    const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
    const m = (x) => Math.round(x + (255 - x) * amt);
    return `rgb(${m(r)},${m(g)},${m(b)})`;
  }

  function SuitBadge({ suit, size = 'md', showLabel }) {
    if (!suit) {
      return e('span', { className: 'suit-badge black' }, 'No Trump');
    }
    const color = SUIT_COLOR[suit];
    const fs = size === 'lg' ? 26 : size === 'sm' ? 15 : 19;
    return e('span', { className: 'suit-badge ' + color, style: { fontSize: fs } },
      e('span', null, SUIT_SYMBOL[suit]),
      showLabel ? e('span', { style: { fontSize: fs * 0.7, textTransform: 'capitalize' } }, suit) : null
    );
  }

  function TopBar({ title, onBack, right, sub }) {
    return e('div', { className: 'row', style: { padding: '8px 14px', gap: 10, minHeight: 56, flex: 'none' } },
      onBack ? e('button', { className: 'icon-btn', onClick: onBack, 'aria-label': 'Back' }, '←') : e('div', { style: { width: 46 } }),
      e('div', { className: 'col grow', style: { alignItems: 'center' } },
        e('div', { className: 'on-felt', style: { fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 19 } }, title),
        sub ? e('div', { className: 'on-felt tiny', style: { opacity: .7 } }, sub) : null
      ),
      e('div', { style: { minWidth: 46, display: 'flex', justifyContent: 'flex-end' } }, right || null)
    );
  }

  // Segmented control
  function Segmented({ options, value, onChange }) {
    return e('div', { className: 'segmented', style: {
      display: 'flex', background: 'rgba(0,0,0,.22)', borderRadius: 12, padding: 4, gap: 4,
      border: '1px solid rgba(255,255,255,.1)',
    } },
      options.map((o) => {
        const val = o.value !== undefined ? o.value : o;
        const label = o.label !== undefined ? o.label : o;
        const on = val === value;
        return e('button', {
          key: String(val), onClick: () => onChange(val),
          style: {
            flex: 1, padding: '10px 8px', borderRadius: 9, fontWeight: 700, fontSize: 14,
            color: on ? '#3a2a0c' : 'var(--felt-text)',
            background: on ? 'linear-gradient(180deg,var(--accent-soft),var(--accent))' : 'transparent',
            boxShadow: on ? 'var(--shadow-sm)' : 'none', transition: 'all .15s',
          },
        }, label);
      })
    );
  }

  function Stepper({ value, min = 0, max = 13, onChange, forbidden }) {
    const dec = () => value > min && onChange(value - 1);
    const inc = () => value < max && onChange(value + 1);
    const bad = forbidden != null && value === forbidden;
    return e('div', { className: 'row', style: { gap: 16, justifyContent: 'center' } },
      e('button', { className: 'step-btn', onClick: dec, disabled: value <= min }, '−'),
      e('div', { className: 'col center', style: { width: 96 } },
        e('div', { style: {
          fontFamily: 'var(--ff-display)', fontWeight: 700, fontSize: 56, lineHeight: 1,
          color: bad ? 'var(--bad)' : 'var(--ink)',
        } }, value),
        e('div', { className: 'tiny muted' }, value === 1 ? 'hand' : 'hands')
      ),
      e('button', { className: 'step-btn', onClick: inc, disabled: value >= max }, '+')
    );
  }

  window.JUI = { Avatar, SuitBadge, TopBar, Segmented, Stepper, tint, e };
})();
