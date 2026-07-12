import React from 'react';

/** CodeBots Toast — bottom-center notice. Amber border, pops in. */
export function Toast({ visible = true, children, style }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: '26px', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--surface-panel)', border: '2px solid var(--amber)',
      borderRadius: 'var(--radius-md)', padding: '11px 18px',
      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink)',
      zIndex: 60, boxShadow: 'var(--shadow-pop)', animation: 'cbPop var(--speed-pop) ease-out', ...style,
    }}>{children}</div>
  );
}
