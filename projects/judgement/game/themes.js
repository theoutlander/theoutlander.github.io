/* Theme system: felt table themes, card-back styles, and shared design tokens.
   Themes are user-selectable. Applied by setting CSS variables on :root.
*/
(function () {
  // Table / felt themes ------------------------------------------------------
  const TABLES = {
    fresh: {
      name: 'Fresh', light: true, swatch: 'linear-gradient(135deg,#f2f8ff,#c4dbf2)',
      feltA: '#f4f9ff', feltB: '#d5e6f6', feltC: '#b7cfe8', rail: '#9db6d4', railB: '#c4d8ec',
      accent: '#e09a1c', accentSoft: '#f2c655', feltText: '#26344f',
    },
    linen: {
      name: 'Linen', light: true, swatch: 'linear-gradient(135deg,#fbf5e9,#e6d4b4)',
      feltA: '#fbf6ec', feltB: '#efe1c8', feltC: '#e0cda6', rail: '#c4ab82', railB: '#e2d3b4',
      accent: '#bf7a12', accentSoft: '#dfa63c', feltText: '#3a3220',
    },
    sky: {
      name: 'Sky', light: true, swatch: 'linear-gradient(135deg,#e8f5ff,#a9d4f2)',
      feltA: '#ecf6ff', feltB: '#c6e2f7', feltC: '#a3ccef', rail: '#84aecf', railB: '#bcd8ee',
      accent: '#d9821a', accentSoft: '#f0ab4c', feltText: '#1f3a55',
    },
    aurora: {
      name: 'Aurora', swatch: 'linear-gradient(135deg,#22ccb6,#7a5cf0)',
      feltA: '#22ccb6', feltB: '#7357e6', feltC: '#463488', rail: '#160f2e', railB: '#241a48',
      accent: '#ffd24a', accentSoft: '#ffe7a0', feltText: '#f6f4ff',
    },
    emerald: {
      name: 'Emerald', swatch: 'linear-gradient(135deg,#1ad889,#0e8f66)',
      feltA: '#1ad889', feltB: '#12986c', feltC: '#0a5a41', rail: '#0a2a1e', railB: '#123f30',
      accent: '#ffcf4d', accentSoft: '#ffe6a0', feltText: '#f4fdf8',
    },
    sunset: {
      name: 'Sunset', swatch: 'linear-gradient(135deg,#ff8672,#c23f84)',
      feltA: '#ff8672', feltB: '#cc4589', feltC: '#7a2a5c', rail: '#2e0f26', railB: '#451a38',
      accent: '#ffe15c', accentSoft: '#fff0ad', feltText: '#fff4f4',
    },
    sapphire: {
      name: 'Sapphire', swatch: 'linear-gradient(135deg,#54b4ff,#2f6bd0)',
      feltA: '#54b4ff', feltB: '#3470c8', feltC: '#1d4590', rail: '#0c1630', railB: '#1b2b52',
      accent: '#ffd24a', accentSoft: '#ffe7a0', feltText: '#f2f8ff',
    },
    orchid: {
      name: 'Orchid', swatch: 'linear-gradient(135deg,#c574ff,#7d46d8)',
      feltA: '#c574ff', feltB: '#8a4fe0', feltC: '#4e2f92', rail: '#1c1030', railB: '#2c1a4a',
      accent: '#ffd66b', accentSoft: '#ffe9ac', feltText: '#faf4ff',
    },
    onyx: {
      name: 'Slate', swatch: 'linear-gradient(135deg,#6a7aa0,#2c3650)',
      feltA: '#6a7aa0', feltB: '#454f6e', feltC: '#28304a', rail: '#0a0c12', railB: '#1a1e2a',
      accent: '#ffd66b', accentSoft: '#ffe9ac', feltText: '#f2f5fc',
    },
  };

  // Card back styles ---------------------------------------------------------
  // rendered via CSS background built from these stops.
  const BACKS = {
    classic: { name: 'Crimson', c1: '#d1402c', c2: '#8a1f15', ink: '#ffdf9a' },
    azure: { name: 'Azure', c1: '#3a86d0', c2: '#1c4a86', ink: '#e2eefb' },
    forest: { name: 'Jade', c1: '#26a878', c2: '#12503a', ink: '#f2e6a8' },
    plum: { name: 'Orchid', c1: '#9a5bd0', c2: '#4e2c74', ink: '#f2ddfb' },
    ink: { name: 'Slate', c1: '#3d4660', c2: '#20242f', ink: '#e6c268' },
  };

  // Friendly, distinct player colors (bright, modern, high-contrast on felt) --
  const PLAYER_COLORS = [
    '#ffc94d', // gold (you, by default)
    '#4fc3f7', // bright sky
    '#ff8a5c', // coral
    '#8ce16a', // lime
    '#c98bff', // violet
    '#ff6f91', // pink
    '#3fd9c4', // turquoise
    '#ffd86b', // amber
  ];

  const AVATARS = ['♛', '♠', '♥', '♦', '♣', '♔', '♗', '♘', '☖', '⚜'];

  function applyTable(key) {
    const t = TABLES[key] || TABLES.aurora;
    const r = document.documentElement.style;
    r.setProperty('--felt-a', t.feltA);
    r.setProperty('--felt-b', t.feltB);
    r.setProperty('--felt-c', t.feltC || t.feltB);
    r.setProperty('--rail', t.rail);
    r.setProperty('--rail-b', t.railB);
    r.setProperty('--accent', t.accent);
    r.setProperty('--accent-soft', t.accentSoft);
    r.setProperty('--felt-text', t.feltText);
    document.body.classList.toggle('theme-light', !!t.light);
  }

  window.JThemes = { TABLES, BACKS, PLAYER_COLORS, AVATARS, applyTable };
})();
