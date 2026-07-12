import React, { useState } from 'react';

/** CodeBots Button — amber acts, ghost waits. */
export function Button({ variant = 'primary', size = 'md', disabled = false, onClick, children, style }) {
  const [hover, setHover] = useState(false);
  const pad = size === 'sm' ? '8px 12px' : '12px 18px';
  const fs = size === 'sm' ? 'var(--text-xs)' : 'var(--text-md)';
  const base = {
    fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '1.5px',
    fontSize: fs, padding: pad, borderRadius: 'var(--radius-md)', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1, transition: 'filter var(--speed-fast), border-color var(--speed-fast)',
    minHeight: size === 'sm' ? '36px' : 'var(--hit-target)',
  };
  const variants = {
    primary: { background: 'var(--amber)', color: 'var(--on-amber)', border: '2px solid rgba(0,0,0,.25)', filter: hover && !disabled ? 'brightness(1.08)' : 'none' },
    ghost: { background: 'transparent', color: 'var(--ink)', border: `2px solid ${hover && !disabled ? 'var(--amber)' : 'var(--line)'}` },
    quiet: { background: 'transparent', color: 'var(--text-dim)', border: `2px dashed ${hover && !disabled ? 'var(--cyan)' : 'var(--line-strong)'}` },
  };
  return (
    <button style={{ ...base, ...variants[variant] || variants.primary, ...style }} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick}>
      {children}
    </button>
  );
}
