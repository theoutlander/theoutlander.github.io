/* Castle Defenders v2 — NIGHT: defend the castle */
(function(){
'use strict';
const Night = {};
window.CD.Night = Night;

let S = null;
let zombies = [];
let queue = [];
let spawnEvt = null, groanEvt = null;
let projectiles = [];   // { update(dt) -> false to remove, obj }
let confettiUsed = false;
let swordCd = 0;
let over = false;

const GATE_X = 228;

Night.init = function(scene){ S = scene; };

Night.start = function(){
  over = false;
  CD.state.phase = 'night';
  CD.state.hearts = CD.MAX_HEARTS;
  confettiUsed = false;
  zombies = []; projectiles = [];
  CDAudio.music('night');
  CD.ui.enterNight();

  const wave = CD.makeWave(CD.state.day);
  queue = [];
  wave.list.forEach(([type, n]) => { for (let i=0;i<n;i++) if (type !== 'king') queue.push(type); });
  Phaser.Utils.Array.Shuffle(queue);
  wave.list.forEach(([type, n]) => { for (let i=0;i<n;i++) if (type === 'king') queue.push(type); });
  Night.total = queue.length;
  scheduleSpawn(wave, 1100);

  groanEvt = S.time.addEvent({ delay: 2200, loop: true, callback: () => {
    if (zombies.length && Math.random() < 0.85){
      Math.random() < 0.35 ? CDAudio.fx.mumble() : CDAudio.fx.groan();
      const z = CD.pick(zombies);
      if (z && z.state !== 'dead') S.tweens.add({ targets: z.parts.head, angle: CD.rnd(-14,14), duration: 200, yoyo: true });
    }
  }});
};

function scheduleSpawn(wave, delay){
  spawnEvt = S.time.delayedCall(delay, () => {
    if (over || CD.state.phase !== 'night') return;
    const type = queue.shift();
    if (type) spawnZombie(type);
    if (queue.length) scheduleSpawn(wave, CD.rnd(wave.gap[0], wave.gap[1]));
  });
}

Night.stop = function(){
  if (spawnEvt) spawnEvt.remove();
  if (groanEvt) groanEvt.remove();
  zombies.forEach(z => z.parts.c.destroy());
  zombies = [];
  projectiles.forEach(p => p.obj && p.obj.destroy && p.obj.destroy());
  projectiles = [];
};

/* ---------- zombies ---------- */
function spawnZombie(type){
  const cfg = CD.ZOMBIES[type];
  const parts = CD.Art.buildZombie(S, type);
  const y = CD.rnd(CD.GROUND + 22, CD.H - 20);
  parts.c.setPosition(CD.W + 50, y);
  parts.c.setDepth(y);
  const z = {
    parts, type, cfg, hp: cfg.hp, maxHp: cfg.hp,
    speed: cfg.speed, slowUntil: 0, stunUntil: 0,
    state: 'walk', biteT: CD.rnd(0.4, 1.4), bubbled: false, hitBy: {}
  };
  // hp bar (hidden until hurt)
  z.hpBg = S.add.rectangle(0, -92, 40, 6, 0x2B2B3B).setOrigin(0.5).setVisible(false);
  z.hpFill = S.add.rectangle(-20, -92, 40, 6, 0x7ED957).setOrigin(0, 0.5).setVisible(false);
  parts.c.add([z.hpBg, z.hpFill]);

  parts.c.on('pointerdown', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); Night.bonk(z); });
  // walk wobble
  CDAudio.fx.groan();
  z.wobble = S.tweens.add({ targets: parts.c, angle: { from: -3, to: 3 }, duration: cfg.hops ? 180 : 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  if (cfg.hops){
    z.hopTween = S.tweens.add({ targets: parts.c, y: y - 26, duration: 300, yoyo: true, repeat: -1, ease: 'Quad.out' });
  }
  if (cfg.king){
    CDAudio.fx.groan(); CD.shake(280, 0.008);
    CD.floatText(CD.W - 180, CD.GROUND - 120, '👑 THE ZOMBIE KING! 👑', { size: 30, color: '#FFD24D' });
  }
  zombies.push(z);
}

function damage(z, dmg, opts){
  opts = opts || {};
  if (z.state === 'dead' || z.bubbled) return;
  z.hp -= dmg;
  z.hpBg.setVisible(true); z.hpFill.setVisible(true);
  z.hpFill.width = Math.max(0, 40 * z.hp / z.maxHp);
  z.hpFill.fillColor = z.hp / z.maxHp > 0.5 ? 0x7ED957 : 0xFFB347;
  if (opts.knock) z.parts.c.x += opts.knock;
  if (opts.slow) z.slowUntil = Math.max(z.slowUntil, S.time.now + opts.slow);
  if (opts.stun) z.stunUntil = Math.max(z.stunUntil, S.time.now + opts.stun);
  // googly eye spin
  [z.parts.eyeL, z.parts.eyeR].forEach(e => {
    S.tweens.add({ targets: e.pupil, x: CD.rnd(-2.5, 2.5), y: CD.rnd(-2.5, 2.5), duration: 120 });
  });
  S.tweens.add({ targets: z.parts.c, scaleX: z.cfg.scale * 0.86, scaleY: z.cfg.scale * 1.1, duration: 70, yoyo: true });
  if (z.hp <= 0) defeat(z);
}

function defeat(z, opts){
  if (z.state === 'dead') return;
  z.state = 'dead';
  opts = opts || {};
  CD.state.bonked++;
  if (z.wobble) z.wobble.stop();
  if (z.hopTween) z.hopTween.stop();
  z.parts.c.disableInteractive();
  z.hpBg.setVisible(false); z.hpFill.setVisible(false);
  // X eyes
  [z.parts.eyeL, z.parts.eyeR].forEach(e => {
    e.pupil.setVisible(false);
    const x = S.add.text(0, 0, '✕', { fontFamily: 'sans-serif', fontSize: '9px', color: '#2B2B3B' }).setOrigin(0.5);
    e.add(x);
  });
  CDAudio.fx.boing();
  CD.fxStars(z.parts.c.x, z.parts.c.y - 60, 6);
  CD.floatText(z.parts.c.x, z.parts.c.y - 100, CD.pick(['BONK!','POW!','BOOP!','WHAM!','SPLAT!']), { size: 26, color: '#FFD24D' });
  const c = z.parts.c;
  S.tweens.add({
    targets: c, x: c.x + (opts.fly ? CD.rnd(120, 220) : CD.rnd(60, 120)), y: c.y - CD.rnd(90, 150),
    angle: CD.rnd(300, 540), scale: z.cfg.scale * 0.7, duration: 500, ease: 'Quad.out',
    onComplete: () => S.tweens.add({ targets: c, y: CD.H + 120, angle: '+=180', alpha: 0.9, duration: 460, ease: 'Quad.in',
      onComplete: () => c.destroy() })
  });
  zombies = zombies.filter(o => o !== z);
  checkWin();
  if (z.cfg.king && !over) CD.floatText(CD.W/2, 200, 'The King is BONKED! 🎉', { size: 34, color: '#FFD24D' });
}

function checkWin(){
  if (over || CD.state.phase !== 'night') return;
  if (queue.length === 0 && zombies.length === 0){
    over = true;
    S.time.delayedCall(700, () => CD.nightWon());
  }
}

/* ---------- update ---------- */
Night.tick = function(dt){
  if (CD.state.phase !== 'night') return;
  swordCd -= dt;
  const now = S.time.now;
  zombies.forEach(z => {
    if (z.state === 'dead' || z.bubbled) return;
    const stunned = now < z.stunUntil;
    const slow = now < z.slowUntil ? 0.42 : 1;
    if (z.state === 'walk' && !stunned){
      z.parts.c.x -= z.speed * slow * dt;
      z.parts.c.setDepth(z.parts.c.y);
      if (z.parts.c.x <= GATE_X + (z.cfg.scale - 1) * 24){
        z.state = 'gate';
        if (z.hopTween) z.hopTween.pause();
      }
    } else if (z.state === 'gate' && !stunned){
      z.biteT -= dt;
      if (z.biteT <= 0){
        z.biteT = 2.4;
        S.tweens.add({ targets: z.parts.c, x: z.parts.c.x - 14, duration: 110, yoyo: true, ease: 'Quad.in' });
        S.time.delayedCall(110, () => { if (z.state !== 'dead' && CD.state.phase === 'night') CD.gateBite(); });
      }
    }
    if (stunned && Math.random() < dt * 3) CD.fxStars(z.parts.c.x, z.parts.c.y - 90 * z.cfg.scale, 1);
  });
  projectiles = projectiles.filter(p => p.update(dt) !== false);
};

/* ---------- sword bonk ---------- */
Night.bonk = function(z){
  if (CD.state.phase !== 'night' || z.state === 'dead' || z.bubbled) return;
  if (swordCd > 0) return;
  swordCd = 0.14;
  CDAudio.fx.bonk();
  CD.fxStars(z.parts.c.x - 10, z.parts.c.y - 70 * z.cfg.scale, 3);
  const sw = CD.Art.emoji(S, z.parts.c.x - 26, z.parts.c.y - 80 * z.cfg.scale, '⚔️', 30).setDepth(900).setAngle(-40);
  S.tweens.add({ targets: sw, angle: 50, duration: 140, onComplete: () => sw.destroy() });
  damage(z, 1, { knock: 30 });
};

/* ---------- weapons ---------- */
Night.fire = function(id){
  if (CD.state.phase !== 'night') return;
  const W = CD.WEAPONS.find(w => w.id === id);
  if (!W || !CD.hasWeapon(id)) return;
  if (id === 'confetti'){
    if (confettiUsed) return;
    confettiUsed = true;
    CD.ui.weaponUsedUp('confetti');
    fireConfetti();
    return;
  }
  if (!CD.ui.weaponReady(id)) return;
  CD.ui.weaponCd(id, W.cd);
  if (id === 'chicken') fireChicken();
  else if (id === 'marsh') fireMarsh();
  else if (id === 'bubble') fireBubble();
  else if (id === 'banana') fireBanana();
};

function fireChicken(){
  CDAudio.fx.honk();
  const ch = CD.Art.emoji(S, 250, CD.GROUND + 40, '🐔', 40).setDepth(CD.H).setFlipX(true);
  const hit = {};
  let t = 0;
  projectiles.push({ obj: ch, update(dt){
    t += dt;
    ch.x += 330 * dt;
    ch.y = CD.GROUND + 40 - Math.abs(Math.sin(t * 9)) * 34;
    ch.angle = Math.sin(t * 14) * 16;
    zombies.forEach(z => {
      if (!hit[zId(z)] && !z.bubbled && z.state !== 'dead' && Math.abs(z.parts.c.x - ch.x) < 34){
        hit[zId(z)] = 1;
        CDAudio.fx.honk();
        CD.floatText(z.parts.c.x, z.parts.c.y - 110, 'HONK!', { size: 22, color: '#FFB347' });
        damage(z, 2, { knock: 26 });
      }
    });
    if (ch.x > CD.W + 60){ ch.destroy(); return false; }
    return true;
  }});
}

function fireMarsh(){
  CDAudio.fx.throwaxe();
  const targets = zombies.filter(z => z.state !== 'dead' && !z.bubbled)
    .sort((a, b) => a.parts.c.x - b.parts.c.x).slice(0, 3);
  const xs = targets.length ? targets.map(z => z.parts.c.x) : [420, 560, 700];
  xs.forEach((tx, i) => {
    S.time.delayedCall(i * 160, () => {
      const m = S.add.image(240, CD.GROUND - 100, 'marshm').setDepth(900).setScale(1.2);
      const sx = m.x, sy = m.y, ty = CD.GROUND + 45, peak = 160;
      S.tweens.add({
        targets: m, angle: 320, duration: 560,
        onUpdate: (tw) => {
          const t = tw.progress;
          m.x = sx + (tx - sx) * t;
          m.y = (1-t)*(1-t)*sy + 2*(1-t)*t*peak + t*t*ty;
        },
        onComplete: () => {
          m.destroy();
          CDAudio.fx.splat();
          CD.fxGoo(tx, ty, 10);
          const blob = S.add.ellipse(tx, ty, 74, 22, 0xFFF6E8, 0.85).setDepth(CD.GROUND + 1);
          S.tweens.add({ targets: blob, alpha: 0, duration: 3800, delay: 500, onComplete: () => blob.destroy() });
          zombies.forEach(z => {
            if (z.state !== 'dead' && !z.bubbled && Math.abs(z.parts.c.x - tx) < 75){
              CD.floatText(z.parts.c.x, z.parts.c.y - 110, 'Sticky!', { size: 20, color: '#FFF6E8' });
              damage(z, 2, { slow: 4200 });
            }
          });
        }
      });
    });
  });
}

function fireBubble(){
  for (let i = 0; i < 3; i++){
    S.time.delayedCall(i * 260, () => {
      CDAudio.fx.bubble();
      const y0 = CD.rnd(CD.GROUND - 10, CD.H - 30);
      const b = S.add.container(255, y0).setDepth(950);
      const cir = S.add.circle(0, 0, 26, 0xBFE8FF, 0.35).setStrokeStyle(2.5, 0xE4F5FF, 0.95);
      const hi = S.add.circle(-9, -10, 6, 0xFFFFFF, 0.85);
      b.add([cir, hi]);
      let t = 0, captured = null;
      projectiles.push({ obj: b, update(dt){
        t += dt;
        if (!captured){
          b.x += 150 * dt;
          b.y = y0 + Math.sin(t * 4) * 14;
          const z = zombies.find(z => z.state !== 'dead' && !z.bubbled && Math.abs(z.parts.c.x - b.x) < 30 && Math.abs((z.parts.c.y - 40) - b.y) < 70);
          if (z){
            if (z.cfg.heavy){
              CDAudio.fx.bubblepop();
              CD.floatText(b.x, b.y - 40, 'Too heavy! 😅', { size: 20, color: '#BFE8FF' });
              CD.fxPuff(b.x, b.y, 4);
              b.destroy(); return false;
            }
            captured = z;
            z.bubbled = true;
            if (z.hopTween) z.hopTween.pause();
            cir.setRadius(44); b.bringToTop(hi); hi.setPosition(-15, -17);
            CDAudio.fx.bubble();
          }
          if (b.x > CD.W + 40){ b.destroy(); return false; }
        } else {
          b.y -= 90 * dt;
          b.x += Math.sin(t * 5) * 40 * dt;
          captured.parts.c.setPosition(b.x, b.y + 34);
          captured.parts.c.angle = Math.sin(t * 3) * 20;
          if (b.y < -60){
            CDAudio.fx.bubblepop();
            CD.state.bonked++;
            captured.parts.c.destroy();
            zombies = zombies.filter(o => o !== captured);
            checkWin();
            b.destroy(); return false;
          }
        }
        return true;
      }});
    });
  }
}

function fireBanana(){
  CDAudio.fx.nanarang();
  const bn = CD.Art.emoji(S, 250, CD.GROUND - 40, '🍌', 44).setDepth(950);
  let dir = 1;
  const hitA = {}, hitB = {};
  projectiles.push({ obj: bn, update(dt){
    bn.x += dir * 430 * dt;
    bn.angle += 900 * dt;
    bn.y = CD.GROUND - 40 + Math.sin(bn.x / 70) * 26;
    const hits = dir > 0 ? hitA : hitB;
    zombies.forEach(z => {
      if (!hits[zId(z)] && z.state !== 'dead' && !z.bubbled && Math.abs(z.parts.c.x - bn.x) < 36){
        hits[zId(z)] = 1;
        damage(z, 2, { knock: 18 });
      }
    });
    if (dir > 0 && bn.x > CD.W - 30) dir = -1;
    if (dir < 0 && bn.x < 240){ bn.destroy(); return false; }
    return true;
  }});
}

function fireConfetti(){
  CDAudio.fx.kaboom();
  CD.shake(500, 0.014);
  CD.fxConfetti(CD.W / 2, 160, 160);
  CD.floatText(CD.W/2, 240, '🎉 PARTY BLAST! 🎉', { size: 44, color: '#FFD24D' });
  S.time.delayedCall(150, () => {
    zombies.slice().forEach(z => damage(z, 6, { stun: 2200, knock: 40 }));
  });
}

let zid = 0;
function zId(z){ if (!z.__id) z.__id = ++zid; return z.__id; }
})();
