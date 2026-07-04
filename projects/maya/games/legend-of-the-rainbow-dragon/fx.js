/* ============================================================
   Legend of the Rainbow Dragon — FX / JUICE ENGINE
   Canvas particles, floating numbers, confetti, sparkle bursts,
   screen shake. "Show cool stuff everywhere."
   ============================================================ */
window.LORD = window.LORD || {};

LORD.FX = (function () {
  let canvas, ctx, W, H, dpr = 1;
  let parts = [];
  let raf = null;
  const COLORS = ['#ff6eb4', '#ffe14d', '#5dffb0', '#5bc8ff', '#c77dff', '#ff9a3c', '#ffffff'];

  function init(cv) {
    canvas = cv;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
  }
  function resize() {
    if (!canvas) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= 1;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      p.vy += p.g;
      p.vx *= p.fr; p.vy *= p.fr;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.vr;
      const a = Math.max(0, Math.min(1, p.life / p.max));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.kind === 'emoji') {
        ctx.font = p.size + 'px serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.ch, 0, 0);
      } else if (p.kind === 'star') {
        drawStar(0, 0, p.size, p.color);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * (p.tall ? 1.8 : 1));
      }
      ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(loop);
    else { raf = null; ctx.clearRect(0, 0, W, H); }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }

  function drawStar(x, y, r, color) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = Math.PI / 5 * i - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.45;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
    }
    ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
  }

  function rc() { return COLORS[Math.floor(Math.random() * COLORS.length)]; }

  // burst of sparkles/stars at element (or x,y)
  function burst(target, opts) {
    opts = opts || {};
    const { x, y } = locate(target);
    const n = opts.count || 18;
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (opts.power || 4) * (0.4 + Math.random());
      parts.push({
        kind: opts.kind || 'star', ch: opts.ch,
        x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1,
        g: 0.12, fr: 0.94, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
        size: opts.size || (6 + Math.random() * 8),
        color: opts.color || rc(),
        life: 38 + Math.random() * 18, max: 56,
      });
    }
    kick();
  }

  // coins flying up
  function coins(target, n) {
    const { x, y } = locate(target);
    n = n || 10;
    for (let i = 0; i < n; i++) {
      parts.push({
        kind: 'emoji', ch: '🪙',
        x: x + (Math.random() - 0.5) * 40, y,
        vx: (Math.random() - 0.5) * 4, vy: -4 - Math.random() * 4,
        g: 0.22, fr: 0.99, rot: 0, vr: (Math.random() - 0.5) * 0.4,
        size: 16 + Math.random() * 8, life: 50 + Math.random() * 20, max: 70,
      });
    }
    kick();
  }

  // hearts floating up
  function hearts(target, n) {
    const { x, y } = locate(target);
    n = n || 8;
    for (let i = 0; i < n; i++) {
      parts.push({
        kind: 'emoji', ch: '💖',
        x: x + (Math.random() - 0.5) * 50, y,
        vx: (Math.random() - 0.5) * 2, vy: -2 - Math.random() * 2.5,
        g: 0.02, fr: 0.98, rot: 0, vr: (Math.random() - 0.5) * 0.2,
        size: 16 + Math.random() * 10, life: 56 + Math.random() * 20, max: 80,
      });
    }
    kick();
  }

  // full-screen confetti rain
  function confetti(n) {
    n = n || 90;
    for (let i = 0; i < n; i++) {
      parts.push({
        kind: 'rect', tall: true,
        x: Math.random() * W, y: -20 - Math.random() * H * 0.5,
        vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4,
        g: 0.06, fr: 0.995, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.5,
        size: 7 + Math.random() * 7, color: rc(),
        life: 120 + Math.random() * 80, max: 200,
      });
    }
    kick();
  }

  // emoji pop (e.g. monster becomes friend → poof of hearts/stars)
  function poof(target, chars) {
    const { x, y } = locate(target);
    chars = chars || ['✨', '💫', '⭐', '💖'];
    for (let i = 0; i < 16; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 4;
      parts.push({
        kind: 'emoji', ch: chars[i % chars.length],
        x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        g: 0.04, fr: 0.95, rot: 0, vr: (Math.random() - 0.5) * 0.3,
        size: 14 + Math.random() * 12, life: 40 + Math.random() * 20, max: 60,
      });
    }
    kick();
  }

  function locate(target) {
    if (target && typeof target.x === 'number') {
      return { x: target.x, y: target.y };
    }
    if (target && target.getBoundingClientRect) {
      const r = target.getBoundingClientRect();
      const cr = canvas.getBoundingClientRect();
      return { x: r.left + r.width / 2 - cr.left, y: r.top + r.height / 2 - cr.top };
    }
    return { x: W / 2, y: H / 2 };
  }

  // ---- floating damage / reward numbers (DOM, layered above) ----
  function floatText(target, text, cls) {
    const layer = document.getElementById('float-layer');
    if (!layer) return;
    const { x, y } = locate(target);
    const el = document.createElement('div');
    el.className = 'float-num ' + (cls || '');
    el.textContent = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  // ---- screen shake ----
  function shake(amount) {
    const stage = document.getElementById('stage');
    if (!stage) return;
    stage.style.animation = 'none';
    void stage.offsetWidth;
    stage.style.setProperty('--shake', (amount || 8) + 'px');
    stage.style.animation = 'screenShake .4s ease';
  }

  // ---- color flash overlay ----
  function flash(color) {
    const f = document.getElementById('flash-layer');
    if (!f) return;
    f.style.background = color || 'rgba(255,255,255,.5)';
    f.style.animation = 'none';
    void f.offsetWidth;
    f.style.animation = 'flashFade .35s ease';
  }

  return { init, burst, coins, hearts, confetti, poof, floatText, shake, flash };
})();
