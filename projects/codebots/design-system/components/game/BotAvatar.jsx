import React from 'react';

/** CodeBots BotAvatar — the mascot, drawn in divs, painted from bot.json. Never redraw it differently. */
export function BotAvatar({ body = 'var(--amber)', dome = 'var(--amber)', eyes = true, antenna = true, width = 150, facing = 0, style }) {
  const s = width / 150;
  const h = Math.round(106 * s);
  return (
    <div style={{ width: width + 'px', height: h + 'px', position: 'relative', ...style }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: '150px', height: '106px', transform: `scale(${s}) rotate(${facing}deg)`, transformOrigin: '0 0' }}>
        <div style={{ position: 'absolute', left: '18px', right: '18px', top: 0, height: '17px', background: 'var(--text-dim)', borderRadius: '9px' }}></div>
        <div style={{ position: 'absolute', left: '18px', right: '18px', bottom: 0, height: '17px', background: 'var(--text-dim)', borderRadius: '9px' }}></div>
        <div style={{ position: 'absolute', left: '13px', right: '23px', top: '15px', bottom: '15px', background: body, border: '3px solid rgba(0,0,0,.3)', borderRadius: '11px', boxSizing: 'border-box' }}></div>
        <div style={{ position: 'absolute', right: '-26px', top: '50%', width: '44px', height: '12px', marginTop: '-6px', background: body, border: '3px solid rgba(0,0,0,.3)', borderRadius: '6px', boxSizing: 'border-box' }}></div>
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: '42px', height: '42px', margin: '-21px 0 0 -21px', borderRadius: '50%', background: dome, border: '3px solid rgba(0,0,0,.35)', boxSizing: 'border-box' }}></div>
        {eyes ? <div>
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: '9px', height: '9px', margin: '-11px 0 0 0', borderRadius: '50%', background: 'var(--paint-cloud)', border: '2px solid rgba(0,0,0,.4)', boxSizing: 'border-box' }}></div>
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: '9px', height: '9px', margin: '2px 0 0 0', borderRadius: '50%', background: 'var(--paint-cloud)', border: '2px solid rgba(0,0,0,.4)', boxSizing: 'border-box' }}></div>
        </div> : null}
        {antenna ? <div>
          <div style={{ position: 'absolute', left: '50%', top: '-20px', width: '3px', height: '22px', marginLeft: '-20px', background: 'var(--text-dim)', transform: 'rotate(-14deg)' }}></div>
          <div style={{ position: 'absolute', left: '50%', top: '-27px', width: '9px', height: '9px', marginLeft: '-26px', borderRadius: '50%', background: 'var(--cyan)' }}></div>
        </div> : null}
      </div>
    </div>
  );
}
