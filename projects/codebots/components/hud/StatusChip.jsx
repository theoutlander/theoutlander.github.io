import React from 'react';

const STATUS = {
  'on-fire':    { c: 'var(--fx-fire)',  t: 'ON FIRE' },
  'frozen':     { c: 'var(--fx-ice)',   t: 'FROZEN' },
  'tangled':    { c: 'var(--fx-vine)',  t: 'TANGLED' },
  'soaked':     { c: 'var(--fx-water)', t: 'SOAKED' },
  'gusted':     { c: 'var(--fx-gust)',  t: 'GUSTED' },
  'recharging': { c: 'var(--amber)',    t: 'RECHARGING' },
  'rebooting':  { c: 'var(--text-dim)', t: 'REBOOTING 3…2…1' },
};

/** CodeBots StatusChip — element/system status over the bot & in the HUD. */
export function StatusChip({ status = 'recharging', blink = true, style }) {
  const s = STATUS[status] || STATUS.recharging;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', fontWeight: 700,
      letterSpacing: '1px', color: s.c, background: 'var(--surface-deep)',
      border: `1.5px solid ${s.c}`, borderRadius: 'var(--radius-pill)', padding: '3px 9px',
      whiteSpace: 'nowrap', ...style,
    }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.c, animation: blink ? 'cbBlink 1s infinite' : 'none' }}></span>
      {s.t}
    </span>
  );
}
