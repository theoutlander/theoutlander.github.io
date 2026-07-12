import React from 'react';

/** CodeBots C-Coin — square gold coin with a C (Asha's spec). Never round. */
export function Coin({ count, size = 18, style }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', ...style }}>
      <span style={{
        width: size + 'px', height: size + 'px', borderRadius: Math.round(size * 0.28) + 'px',
        background: 'var(--amber)', border: '2px solid rgba(0,0,0,.35)', boxSizing: 'border-box',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(size * 0.55) + 'px', fontWeight: 700, color: 'var(--on-amber)',
      }}>C</span>
      {count !== undefined ? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--amber)', fontWeight: 700 }}>&#215;{count}</span> : null}
    </span>
  );
}
