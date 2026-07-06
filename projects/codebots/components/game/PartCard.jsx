import React from 'react';

const STATUS = {
  'on-bot': { chip: 'ON BOT', c: 'var(--green)', dashed: false, dim: false },
  'next':   { chip: 'NEXT UNLOCK', c: 'var(--cyan)', dashed: false, dim: false },
  'locked': { chip: 'LOCKED', c: 'var(--text-dim)', dashed: true, dim: true },
};

/** CodeBots PartCard — one armory row: part, weight, command it grants. */
export function PartCard({ name, desc, weight, grants, idea, status = 'locked', lockReason, style }) {
  const s = STATUS[status] || STATUS.locked;
  return (
    <div style={{
      background: 'var(--surface-deep)', border: `1.5px ${s.dashed ? 'dashed' : 'solid'} ${status === 'next' ? 'var(--cyan)' : 'var(--line)'}`,
      borderRadius: '10px', padding: '10px 13px', opacity: s.dim ? 0.6 : 1,
      display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', ...style,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'baseline' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{name}</span>
        <span style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
          {weight !== undefined ? <span style={{ fontSize: '9px', color: 'var(--pink)', fontWeight: 700 }}>WT +{weight}</span> : null}
          <span style={{ fontSize: '8.5px', letterSpacing: '1px', fontWeight: 700, color: s.c, border: `1.5px ${s.dashed ? 'dashed' : 'solid'} ${s.c}`, borderRadius: '999px', padding: '2px 8px', whiteSpace: 'nowrap' }}>{lockReason || s.chip}</span>
        </span>
      </div>
      {desc ? <div style={{ fontSize: '9.5px', color: 'var(--text-dim)', lineHeight: 1.5 }}>{desc}</div> : null}
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {grants ? <span style={{ fontSize: '8.5px', fontWeight: 700, color: 'var(--amber)', border: '1.5px solid rgba(255,180,84,.5)', borderRadius: '999px', padding: '2px 7px' }}>{grants}</span> : null}
        {idea ? <span style={{ fontSize: '8.5px', color: 'var(--cyan)', border: '1.5px solid rgba(95,212,255,.4)', borderRadius: '999px', padding: '2px 7px' }}>IDEA: {idea}</span> : null}
      </div>
    </div>
  );
}
