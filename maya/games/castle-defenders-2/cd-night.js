/* Castle Defenders v2 — NIGHT: defend the castle */
(function(){
'use strict';
const Night = {};
window.CD.Night = Night;

let S = null;
let zombies = [];
let queue = [];
let spawnEvt = null, groanEvt = null, hordeEvt = null;
let projectiles = [];   // { update(dt) -> false to remove, obj }
let confettiUsed = false;
let swordCd = 0;
let over = false;
let hintsShown = {};    // gear id -> already taught this night (don't spam her)

const GATE_X = 228;

/* The balloon is the only gear that makes a zombie UNREACHABLE, and an unreachable zombie that
   never dies = a night that never ends (checkWin needs zombies.length === 0). So the balloon
   ALWAYS leaks: after BALLOON_LEAK_MS of floating it runs out of air on its own and he drops.
   Maya can beat him faster with the banana/bubble — but she never HAS to own them. */
const BALLOON_LEAK_MS = 11000;
const BALLOON_WHIFF_MS = 1000;   // every "Too high!" sword swipe knocks a little more air out
const GROUND_REACH = 30;         // a body drawn this far above its own feet is still hittable low

Night.init = function(scene){ S = scene; };

Night.start = function(){
  over = false;
  CD.state.phase = 'night';
  // Apples banked in the garden become BONUS hearts — spent the moment the night starts.
  const bonus = CD.nightHearts() - CD.MAX_HEARTS;
  CD.state.heartCap = CD.nightHearts();
  CD.state.hearts = CD.state.heartCap;
  CD.state.apples = 0;
  CD.save();
  confettiUsed = false;
  hintsShown = {};
  zombies = []; projectiles = [];
  CDAudio.music('night');
  CD.ui.enterNight();
  if (bonus > 0){
    S.time.delayedCall(400, () => {
      CDAudio.fx.unlock();
      CD.floatText(CD.W / 2, 250, '🍎 The gate is EXTRA strong tonight! +' + bonus + ' 💖',
        { size: 28, color: '#FFD24D' });
    });
  }

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

  /* The horde MOANS, and it gets worse as the night goes on and as the gate gets chewed up.
     Spooky, not nasty — she is 8. Plus a heartbeat once the gate is nearly down. */
  hordeEvt = S.time.addEvent({ delay: 5200, loop: true, callback: () => {
    if (over || CD.state.phase !== 'night' || !zombies.length) return;
    const nightPressure = Math.min(1, (CD.state.day - 1) / 6);
    const gatePressure  = 1 - (CD.state.hearts / Math.max(1, CD.state.heartCap || CD.MAX_HEARTS));
    CDAudio.fx.horde(Math.max(nightPressure, gatePressure));
    if (CD.state.hearts <= 2) CDAudio.fx.heartbeat();
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
  if (hordeEvt) hordeEvt.remove();
  zombies.forEach(z => z.parts.c.destroy());
  zombies = [];
  projectiles.forEach(p => p.obj && p.obj.destroy && p.obj.destroy());
  projectiles = [];
};

/* ---------- gear helpers ----------
   `z.gear` is only what he SPAWNED with. The one true "is he still wearing it?" answer is
   parts.gear, which Art.detachGear nulls — every rule below asks through hasGear(). */
function hasGear(z, id){ return !!(z.parts.gear && z.parts.gear.id === id); }

/* Hit-testing a floating zombie.
   cd-art lifts a balloon zombie's ART (parts.body) by GEAR.balloon.lift INSIDE his container and
   bobs it — his container y (his FEET, and his depth) never changes. So a hit test that reads
   parts.c.y would happily "hit" a zombie who is visibly sailing 74px over the chicken.
   liftOf() reads the live body offset (bob included) and scales it, giving how high his torso is
   drawn above HIS OWN ground line. We test in that local frame on purpose: the screen y of the
   ground varies by row (2.5D depth), so an absolute screen-y test would alias a back-row floater
   onto a front-row chicken's arc. Local frame is row-proof. */
function liftOf(z){ return z.parts.body ? -z.parts.body.y * z.scale : 0; }
function grounded(z){ return liftOf(z) < GROUND_REACH; }   // chicken + marshmallow only reach these
function bodyY(z){ return z.parts.c.y - liftOf(z); }        // where his torso actually IS on screen

/* The ONLY way a balloon comes off in play. Every caller (bubble, confetti, leak) goes through
   here so a popped zombie can never be left stranded in the 'float' state. */
function popBalloon(z, txt){
  if (z.state === 'dead' || !hasGear(z, 'balloon')) return;
  CD.Art.detachGear(S, z.parts);
  CDAudio.fx.balloonpop();
  CD.fxPuff(z.parts.c.x, bodyY(z) - 40 * z.scale, 6);
  if (txt) CD.floatText(z.parts.c.x, z.parts.c.y - 120, txt, { size: 22, color: '#FF88AC' });
  // He was drifting over the gate: put him back on the ground and let him behave like anyone else.
  if (z.state === 'float'){
    z.state = 'gate';
    z.biteT = biteGap(z) * 0.6;
    if (z.hopTween) z.hopTween.pause();
  }
}

// Ladder zombies climb OVER the gate — they bite twice as fast. And every night they chew faster.
function biteGap(z){
  const base = 2.4 / CD.biteScale(CD.state.day);
  return hasGear(z, 'ladder') ? base / CD.GEAR.ladder.biteMul : base;
}

function teachGear(z, gear){
  if (!gear || hintsShown[gear]) return;
  hintsShown[gear] = 1;
  const G = CD.GEAR[gear];
  // He spawns at x = W + 50 (off-screen right) and has barely moved by now — anchor the hint back
  // inside the canvas or the whole lesson floats away where she can't read it.
  const hx = Math.max(210, Math.min(z.parts.c.x, CD.W - 210));
  CD.floatText(hx, bodyY(z) - 130 * z.scale, G.emoji + ' ' + G.hint, { size: 20, color: '#FFF3B0' });
}

/* ---------- zombies ---------- */
function spawnZombie(type){
  const cfg = CD.ZOMBIES[type];
  const gear = CD.rollGear(type, CD.state.day);          // handles night>=2, rising odds, no king
  const parts = CD.Art.buildZombie(S, type, gear);
  const y = CD.rnd(CD.GROUND + 22, CD.H - 20);
  parts.c.setPosition(CD.W + 50, y);
  parts.c.setDepth(y);
  // Per-zombie jitter so the horde stops looking like clones. The King is exempt: he is exactly
  // King-sized and King-slow, always.
  const jScale = cfg.king ? 1 : CD.rnd(0.9, 1.1);
  const jSpeed = cfg.king ? 1 : CD.rnd(0.85, 1.15);
  // They get harder every night: tougher, faster, hungrier. Night 1 is unscaled on purpose.
  const day = CD.state.day;
  const hp = Math.max(1, Math.round(cfg.hp * CD.hpScale(day)));
  const z = {
    parts, type, cfg, hp, maxHp: hp,
    scale: cfg.scale * jScale,                           // the TRUE size — use this, not cfg.scale
    speed: cfg.speed * jSpeed * CD.speedScale(day), slowUntil: 0, stunUntil: 0, rageUntil: 0,
    state: 'walk', biteT: CD.rnd(0.4, 1.4), bubbled: false, hitBy: {},
    gear, blocks: CD.GEAR.shield.blocks, helmetTaps: CD.GEAR.helmet.taps,
    balloonT: BALLOON_LEAK_MS / 1000
  };
  parts.c.setScale(z.scale);
  // hp bar (hidden until hurt) — lives in `body` so it rides UP with a floating balloon zombie
  z.hpBg = S.add.rectangle(0, -92, 40, 6, 0x2B2B3B).setOrigin(0.5).setVisible(false);
  z.hpFill = S.add.rectangle(-20, -92, 40, 6, 0x7ED957).setOrigin(0, 0.5).setVisible(false);
  parts.body.add([z.hpBg, z.hpFill]);

  parts.c.on('pointerdown', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); Night.bonk(z); });
  // walk wobble
  CDAudio.fx.groan();
  z.wobble = S.tweens.add({ targets: parts.c, angle: { from: -3, to: 3 }, duration: cfg.hops ? 180 : 300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  if (cfg.hops){
    z.hopTween = S.tweens.add({ targets: parts.c, y: y - 26, duration: 300, yoyo: true, repeat: -1, ease: 'Quad.out' });
  }
  if (cfg.king){
    CDAudio.fx.groan(); CD.shake(280, 0.008);
    CDAudio.fx.roar();
    CD.floatText(CD.W - 180, CD.GROUND - 120, '👑 THE ZOMBIE KING! 👑', { size: 30, color: '#FFD24D' });
  }
  zombies.push(z);
  if (gear) S.time.delayedCall(500, () => { if (z.state !== 'dead' && CD.state.phase === 'night') teachGear(z, gear); });
}

function damage(z, dmg, opts){
  opts = opts || {};
  if (z.state === 'dead' || z.bubbled) return;
  z.hp -= dmg;
  /* THEY FIGHT BACK. Hit one and it snarls and surges forward — it doesn't just stand there
     soaking damage. (Slowed/stunned zombies can't rage; the marshmallow still wins.) */
  if (z.hp > 0 && !opts.slow && !opts.stun){
    z.rageUntil = S.time.now + CD.RAGE_MS;
    if (Math.random() < 0.5) CDAudio.fx.snarl();
    S.tweens.add({ targets: z.parts.c, scaleX: z.scale * 1.12, scaleY: z.scale * 0.92, duration: 90, yoyo: true });
  }
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
  S.tweens.add({ targets: z.parts.c, scaleX: z.scale * 0.86, scaleY: z.scale * 1.1, duration: 70, yoyo: true });
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
  CD.fxStars(z.parts.c.x, bodyY(z) - 60 * z.scale, 6);
  CD.floatText(z.parts.c.x, bodyY(z) - 100 * z.scale, CD.pick(['BONK!','POW!','BOOP!','WHAM!','SPLAT!']), { size: 26, color: '#FFD24D' });
  const c = z.parts.c;
  S.tweens.add({
    targets: c, x: c.x + (opts.fly ? CD.rnd(120, 220) : CD.rnd(60, 120)), y: c.y - CD.rnd(90, 150),
    angle: CD.rnd(300, 540), scale: z.scale * 0.7, duration: 500, ease: 'Quad.out',
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

    /* Leak FIRST, and gated only on "is he still wearing the balloon" — never on his state. A
       floater must keep counting down while he drifts over the gate, or the night can't end. */
    if (hasGear(z, 'balloon')){
      z.balloonT -= dt;
      if (z.balloonT <= 0){ popBalloon(z, 'Out of air! 🎈'); }
    }

    const stunned = now < z.stunUntil;
    const slow = now < z.slowUntil ? 0.42 : 1;
    const rage = now < z.rageUntil ? CD.RAGE_SPEED : 1;   // bonked -> surges forward
    if (z.state === 'walk' && !stunned){
      z.parts.c.x -= z.speed * slow * rage * dt;
      z.parts.c.setDepth(z.parts.c.y);
      if (z.parts.c.x <= GATE_X + (z.scale - 1) * 24){
        // Ballooned: he FLOATS OVER the gate line. He can't bite from up there — he just drifts.
        z.state = hasGear(z, 'balloon') ? 'float' : 'gate';
        z.biteT = Math.min(z.biteT, biteGap(z));
        if (z.hopTween) z.hopTween.pause();
      }
    } else if (z.state === 'float'){
      // Harmless, but not gone: he bobs above the gate until his balloon leaks or she pops it.
      z.parts.c.x += Math.sin(now / 640) * 10 * dt;
      z.parts.c.setDepth(z.parts.c.y);
    } else if (z.state === 'gate' && !stunned){
      z.biteT -= dt;
      if (z.biteT <= 0){
        z.biteT = biteGap(z);                    // ladder zombie bites 2x as fast — he's climbing
        S.tweens.add({ targets: z.parts.c, x: z.parts.c.x - 14, duration: 110, yoyo: true, ease: 'Quad.in' });
        CDAudio.fx.snarl();
        S.time.delayedCall(110, () => { if (z.state !== 'dead' && CD.state.phase === 'night') CD.gateBite(); });
      }
    }
    if (stunned && Math.random() < dt * 3) CD.fxStars(z.parts.c.x, bodyY(z) - 90 * z.scale, 1);
  });
  projectiles = projectiles.filter(p => p.update(dt) !== false);
};

/* ---------- sword bonk ---------- */
Night.bonk = function(z){
  if (CD.state.phase !== 'night' || z.state === 'dead' || z.bubbled) return;
  if (swordCd > 0) return;
  swordCd = 0.14;

  // BALLOON: out of reach. The swipe whiffs underneath him — but it shakes a little air loose,
  // so even a sword-only player can bring him down faster than the leak would.
  if (hasGear(z, 'balloon')){
    CDAudio.fx.boing();
    const sw0 = CD.Art.emoji(S, z.parts.c.x - 26, z.parts.c.y - 70 * z.scale, '⚔️', 30).setDepth(900).setAngle(-40);
    S.tweens.add({ targets: sw0, angle: 50, duration: 140, onComplete: () => sw0.destroy() });
    CD.floatText(z.parts.c.x, bodyY(z) - 60 * z.scale, 'Too high! 🎈', { size: 22, color: '#BFE8FF' });
    CD.fxPuff(z.parts.c.x, bodyY(z) - 70 * z.scale, 2);
    if (z.parts.gear && z.parts.gear.obj && z.parts.gear.obj.scene){
      S.tweens.add({ targets: z.parts.gear.obj, scaleX: 0.86, scaleY: 0.9, duration: 90, yoyo: true });
    }
    z.balloonT -= BALLOON_WHIFF_MS / 1000;
    if (z.balloonT <= 0) popBalloon(z, 'Pssshh… 🎈');
    return;
  }

  CDAudio.fx.bonk();

  // SHIELD: he holds it up while he's WALKING at you. Once he's at the gate he has turned to
  // bite — the shield is out of the way and bonks land.
  if (hasGear(z, 'shield') && z.state === 'walk'){
    CDAudio.fx.clang();
    z.blocks--;
    CD.fxStars(z.parts.c.x - 24, bodyY(z) - 34 * z.scale, 4);
    const sw1 = CD.Art.emoji(S, z.parts.c.x - 30, bodyY(z) - 80 * z.scale, '⚔️', 30).setDepth(900).setAngle(-40);
    S.tweens.add({ targets: sw1, angle: -95, x: sw1.x + 26, duration: 170, ease: 'Back.out', onComplete: () => sw1.destroy() });
    if (z.blocks <= 0){
      CD.Art.detachGear(S, z.parts);
      CDAudio.fx.gearoff();
      CD.floatText(z.parts.c.x, bodyY(z) - 100 * z.scale, 'Shield BROKE! 🛡️', { size: 24, color: '#FFD24D' });
    } else {
      CD.floatText(z.parts.c.x, bodyY(z) - 100 * z.scale, 'CLANG! 🛡️', { size: 24, color: '#C9CBD6' });
    }
    return;                                       // blocked — no damage
  }

  // HELMET: the first taps knock the hat off instead of hurting him.
  if (hasGear(z, 'helmet')){
    CDAudio.fx.clang();
    z.helmetTaps--;
    CD.fxStars(z.parts.c.x, bodyY(z) - 76 * z.scale, 4);
    const sw2 = CD.Art.emoji(S, z.parts.c.x - 26, bodyY(z) - 90 * z.scale, '⚔️', 30).setDepth(900).setAngle(-40);
    S.tweens.add({ targets: sw2, angle: 50, duration: 140, onComplete: () => sw2.destroy() });
    if (z.helmetTaps <= 0){
      CD.Art.detachGear(S, z.parts);
      CDAudio.fx.gearoff();
      CD.floatText(z.parts.c.x, bodyY(z) - 100 * z.scale, 'Helmet off! ⛑️', { size: 24, color: '#FFD24D' });
    } else {
      CD.floatText(z.parts.c.x, bodyY(z) - 100 * z.scale, 'CLONK! ⛑️', { size: 22, color: '#C9CBD6' });
    }
    return;                                       // no damage until the helmet is gone
  }

  // normal bonk (incl. ladder zombie — the ladder is no defence, it just gets him over the gate)
  CD.fxStars(z.parts.c.x - 10, bodyY(z) - 70 * z.scale, 3);
  const sw = CD.Art.emoji(S, z.parts.c.x - 26, bodyY(z) - 80 * z.scale, '⚔️', 30).setDepth(900).setAngle(-40);
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
      // grounded(): the chicken bowls along the FLOOR. A balloon zombie sails right over him.
      if (!hit[zId(z)] && !z.bubbled && z.state !== 'dead' && grounded(z) && Math.abs(z.parts.c.x - ch.x) < 34){
        hit[zId(z)] = 1;
        CDAudio.fx.honk();
        if (hasGear(z, 'shield')){                 // bowled clean over — the shield goes flying
          CD.Art.detachGear(S, z.parts);
          CDAudio.fx.gearoff();
          CD.floatText(z.parts.c.x, bodyY(z) - 115, 'STRIKE! 🎳', { size: 24, color: '#FFD24D' });
        } else {
          CD.floatText(z.parts.c.x, bodyY(z) - 110, 'HONK!', { size: 22, color: '#FFB347' });
        }
        damage(z, 2, { knock: 26 });
      }
    });
    if (ch.x > CD.W + 60){ ch.destroy(); return false; }
    return true;
  }});
}

function fireMarsh(){
  // Aim only at zombies the goo can actually land on — lobbing it under a floating balloon zombie
  // would just waste the shot.
  const targets = zombies.filter(z => z.state !== 'dead' && !z.bubbled && grounded(z))
    .sort((a, b) => a.parts.c.x - b.parts.c.x).slice(0, 3);
  CDAudio.fx.throwaxe();
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
            // the goo pools on the FLOOR — again, a floater's feet never touch it
            if (z.state !== 'dead' && !z.bubbled && grounded(z) && Math.abs(z.parts.c.x - tx) < 75){
              if (hasGear(z, 'ladder')){           // too sticky to carry it — he lets it go
                CD.Art.detachGear(S, z.parts);
                CDAudio.fx.ladderdrop();
                CD.floatText(z.parts.c.x, bodyY(z) - 115, 'He dropped it! 🪜', { size: 22, color: '#FFD24D' });
              } else {
                CD.floatText(z.parts.c.x, bodyY(z) - 110, 'Sticky!', { size: 20, color: '#FFF6E8' });
              }
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
          /* Deliberately tested against parts.c.y — his GROUND line, not his drawn body. A bubble
             is buoyant: it rides up the whole column, so it reaches a floating balloon zombie just
             as well as a walking one. (Chicken/marshmallow use grounded() and do NOT.) */
          const z = zombies.find(z => z.state !== 'dead' && !z.bubbled && Math.abs(z.parts.c.x - b.x) < 30 && Math.abs((z.parts.c.y - 40) - b.y) < 70);
          if (z){
            /* BALLOON first, heavy second — on purpose. A chonko WITH a balloon is a funny sight,
               and the bubble's job against a balloon is to POP it, which takes no lifting at all.
               So popping wins over weight; he thumps down and is a normal (heavy) zombie after. */
            if (hasGear(z, 'balloon')){
              popBalloon(z, 'POP! 🎈');
              CD.fxPuff(b.x, b.y, 4);
              b.destroy(); return false;           // the bubble is spent — popping IS the effect
            }
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
      /* x-only ON PURPOSE — the banana-rang arcs high and swoops low across the whole column, so
         it is the one weapon that REACHES a balloon zombie in the air. It hurts him; it does not
         pop him (a banana is not a pin). It is the balloon's main counter. */
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
    if (CD.state.phase !== 'night') return;
    // The mega-blast STRIPS every gear in the horde first, then damages what's left of them.
    let stripped = false;
    zombies.slice().forEach(z => {
      if (z.state === 'dead') return;
      if (hasGear(z, 'balloon')){ popBalloon(z, null); stripped = true; }
      else if (z.parts.gear){ CD.Art.detachGear(S, z.parts); stripped = true; }
    });
    if (stripped) CDAudio.fx.gearoff();
    zombies.slice().forEach(z => damage(z, 6, { stun: 2200, knock: 40 }));
  });
}

let zid = 0;
function zId(z){ if (!z.__id) z.__id = ++zid; return z.__id; }
})();
