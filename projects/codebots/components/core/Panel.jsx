import React from 'react';

/** CodeBots Panel — the 2px-bordered card every surface is built from. */
export function Panel({ label, labelColor = 'var(--text-dim)', active = false, locked = false, deep = false, children, style }) {
  return (
    <div style={{
      background: deep ? 'var(--surface-deep)' : 'var(--surface-panel)',
      border: active ? '2px solid var(--amber)' : locked ? '2px dashed var(--line-strong)' : 'var(--border)',
      boxShadow: active ? 'var(--glow-amber)' : 'none',
      opacity: locked ? 0.62 : 1,
      borderRadius: 'var(--radius-lg)', padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      fontFamily: 'var(--font-mono)', color: 'var(--ink)', ...style,
    }}>
      {label ? <div style={{ fontSize: 'var(--text-2xs)', letterSpacing: 'var(--label-tracking)', color: labelColor, fontWeight: 700 }}>{label}</div> : null}
      {children}
    </div>
  );
}
