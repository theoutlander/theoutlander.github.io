/* Theme system: felt table themes, card-back styles, and shared design tokens.
   Themes are user-selectable. Applied by setting CSS variables on :root.
*/
(function () {
  // Table / felt themes ------------------------------------------------------
  const TABLES = {
    emerald: {
      name: 'Emerald', swatch: '#1f6b4f',
      feltA: '#1f6b4f', feltB: '#0c3325', rail: '#1c130c', railB: '#2a1d12',
      accent: '#e0b65b', accentSoft: '#f0d79a', feltText: '#f3efe2',
    },
    sapphire: {
      name: 'Sapphire', swatch: '#2660a8',
      feltA: '#22577f', feltB: '#0c2440', rail: '#10182a', railB: '#1d2942',
      accent: '#d8c06a', accentSoft: '#eedf9f', feltText: '#eef3f8',
    },
    wine: {
      name: 'Claret', swatch: '#9e3145',
      feltA: '#8a2a3c', feltB: '#3c1018', rail: '#26120f', railB: '#3a1c18',
      accent: '#e6c068', accentSoft: '#f3dfa6', feltText: '#f6ece9',
    },
    midnight: {
      name: 'Midnight', swatch: '#2c3142',
      feltA: '#2f3548', feltB: '#14161f', rail: '#0c0d12', railB: '#1c1f2b',
      accent: '#c9a14a', accentSoft: '#e6cf8f', feltText: '#eceef4',
    },
    walnut: {
      name: 'Walnut', swatch: '#7b4a26',
      feltA: '#3a5d4a', feltB: '#1d3328', rail: '#3b2412', railB: '#5a3a1f',
      accent: '#e8b964', accentSoft: '#f4dca0', feltText: '#f1ece0',
    },
  };

  // Card back styles ---------------------------------------------------------
  // rendered via CSS background built from these stops.
  const BACKS = {
    classic: { name: 'Royal', c1: '#b3361f', c2: '#7e2113', ink: '#f4dca0' },
    azure: { name: 'Azure', c1: '#2c5f96', c2: '#1a3a63', ink: '#dbe8f5' },
    forest: { name: 'Forest', c1: '#2f7053', c2: '#194632', ink: '#e8d79a' },
    plum: { name: 'Plum', c1: '#6c3b76', c2: '#3f2147', ink: '#ecd6f0' },
    ink: { name: 'Ink', c1: '#33384a', c2: '#1a1d28', ink: '#c8a24c' },
  };

  // Friendly, distinct player colors ----------------------------------------
  const PLAYER_COLORS = [
    '#e0b65b', // gold (you, by default)
    '#5fa8d3', // sky
    '#e08a5f', // coral
    '#8bbf6e', // sage
    '#c987d8', // orchid
    '#e2697f', // rose
    '#6ec3b4', // teal
    '#b9a06a', // sand
  ];

  const AVATARS = ['\u265B', '\u2660', '\u2665', '\u2666', '\u2663', '\u2654', '\u2657', '\u2658', '\u2616', '\u269C'];

  function applyTable(key) {
    const t = TABLES[key] || TABLES.emerald;
    const r = document.documentElement.style;
    r.setProperty('--felt-a', t.feltA);
    r.setProperty('--felt-b', t.feltB);
    r.setProperty('--rail', t.rail);
    r.setProperty('--rail-b', t.railB);
    r.setProperty('--accent', t.accent);
    r.setProperty('--accent-soft', t.accentSoft);
    r.setProperty('--felt-text', t.feltText);
  }

  window.JThemes = { TABLES, BACKS, PLAYER_COLORS, AVATARS, applyTable };
})();
