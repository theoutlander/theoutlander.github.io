import React from 'react';

/** CodeBots Stars — earned/total, amber glyphs. */
export function Stars({ earned = 0, total = 3, showCount = false, size = 16, style }) {
  const stars = [];
  for (let i = 0; i < total; i++) {
    stars.push(<span key={i} style={{ color: i < earned ? 'var(--amber)' : 'var(--line-strong)', fontSize: size + 'px', lineHeight: 1 }}>&#9733;</span>);
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-mono)', ...style }}>
      {stars}
      {showCount ? <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--amber)', fontWeight: 700, marginLeft: '5px' }}>{earned}/{total}</span> : null}
    </span>
  );
}
