/* Castle Defenders v2 — boot, world, transitions, FX */
(function(){
'use strict';
let sky = null, castle = null, knight = null;
let EM = {};   // particle emitters
let fireworksEvt = null;

function create(){
  const s = this;
  CD.scene = s;
  CD.Art.makeTextures(s);
  sky = CD.Art.buildSky(s);
  CD.Art.buildGround(s);
  castle = CD.Art.buildCastle(s);
  knight = CD.Art.buildKnight(s);
  CD.Day.init(s, knight);
  CD.Night.init(s);

  // idle breathing
  s.tweens.add({ targets: knight.c, scaleY: 0.985, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });

  // night shade overlay (below floating UI text depth 1000+)
  CD.nightShade = s.add.rectangle(CD.W/2, CD.H/2, CD.W, CD.H, 0x101a3f, 0).setDepth(880);

  // particle emitters (explode-only)
  const mk = (tex, cfg) => s.add.particles(0, 0, tex, Object.assign({ emitting: false }, cfg)).setDepth(890);
  EM.chips = mk('chip', { speed: {min: 90, max: 240}, angle: {min: 200, max: 340}, gravityY: 620, lifespan: 700, scale: {start: 1.2, end: 0.6}, rotate: {min: 0, max: 360} });
  EM.leaves = mk('leafp', { speedX: {min: -60, max: 60}, speedY: {min: 10, max: 90}, gravityY: 60, lifespan: 1400, scale: {start: 1.3, end: 0.4}, alpha: {start: 1, end: 0.2} });
  EM.puff = mk('puff', { speed: {min: 20, max: 70}, lifespan: 500, scale: {start: 0.9, end: 0.1}, alpha: {start: 0.8, end: 0} });
  EM.spark = mk('sparkle', { speed: {min: 60, max: 160}, lifespan: 550, scale: {start: 1, end: 0}, gravityY: -40 });
  EM.stars = mk('dot', { speed: {min: 70, max: 190}, lifespan: 520, scale: {start: 1.1, end: 0}, tint: [0xFFE082, 0xFFFFFF, 0xFFB347] });
  EM.goo = mk('goo', { speed: {min: 70, max: 200}, angle: {min: 190, max: 350}, gravityY: 500, lifespan: 600, scale: {start: 1.1, end: 0.3} });
  EM.confetti = mk('confbit', { speedX: {min: -160, max: 160}, speedY: {min: -260, max: -40}, gravityY: 320, lifespan: 1900, rotate: {min: 0, max: 720}, scale: {start: 1.2, end: 0.8}, tint: [0xFF7BAC, 0xFFD24D, 0x6FBF61, 0x4FA3D1, 0xC77DFF, 0xFFFFFF] });

  CD.fxChips = (x, y, n) => EM.chips.explode(n, x, y);
  CD.fxLeaves = (x, y, n) => EM.leaves.explode(n, x, y);
  CD.fxPuff = (x, y, n) => EM.puff.explode(n, x, y);
  CD.fxSparkle = (x, y, n) => EM.spark.explode(n, x, y);
  CD.fxStars = (x, y, n) => EM.stars.explode(n, x, y);
  CD.fxGoo = (x, y, n) => EM.goo.explode(n, x, y);
  CD.fxConfetti = (x, y, n) => EM.confetti.explode(n, x, y);

  // forge tap
  castle.forge.setInteractive(new Phaser.Geom.Rectangle(-48, -80, 96, 92), Phaser.Geom.Rectangle.Contains);
  castle.forge.on('pointerdown', () => {
    if (CD.state.phase === 'day'){ CDAudio.fx.click(); CD.ui.openShop(); }
  });

  s.input.on('pointerdown', () => CDAudio.unlockCtx());
  CD.sunArc(0.25);
  CD.ui.onSceneReady();
}

function update(time, delta){
  const dt = Math.min(delta / 1000, 0.05);
  if (!CD.state) return;
  if (CD.state.phase === 'day') CD.Day.tick(dt);
  else if (CD.state.phase === 'night') CD.Night.tick(dt);
}

/* ---------- global helpers ---------- */
CD.floatText = function(x, y, str, opts){
  opts = opts || {};
  x = Math.max(90, Math.min(CD.W - 90, x));
  y = Math.max(40, y);
  const t = CD.scene.add.text(x, y, str, {
    fontFamily: '"Fredoka One", sans-serif', fontSize: (opts.size || 24) + 'px',
    color: opts.color || '#FFFFFF', stroke: '#3B2A45', strokeThickness: 5
  }).setOrigin(0.5).setDepth(1000).setScale(0.4);
  CD.scene.tweens.add({ targets: t, scale: 1, duration: 160, ease: 'Back.out' });
  CD.scene.tweens.add({ targets: t, y: y - 46, alpha: 0, duration: 1100, delay: 300, ease: 'Sine.in', onComplete: () => t.destroy() });
};

CD.shake = function(dur, int){ CD.scene.cameras.main.shake(dur, int); };

CD.sunArc = function(t){
  sky.sun.setPosition(150 + t * (CD.W - 300), 215 - Math.sin(t * Math.PI) * 135);
  sky.sunglow.setPosition(sky.sun.x, sky.sun.y);
};

CD.addWood = function(n){
  CD.state.wood += n;
  CDAudio.fx.wood();
  CD.ui.setWood(true);
};

CD.gateBite = function(){
  CDAudio.fx.bite();
  CD.state.hearts--;
  CD.ui.setHearts(true);
  CD.shake(160, 0.007);
  const g = castle.gate;
  CD.scene.tweens.add({ targets: g, scaleX: 1.08, duration: 70, yoyo: true, repeat: 1 });
  CD.fxPuff(g.x + 30, castle.baseY - 40, 5);
  if (CD.state.hearts <= 0){
    CD.state.phase = 'lost';
    CDAudio.stopMusic();
    CDAudio.fx.hurt();
    CD.scene.time.delayedCall(600, () => CD.ui.loseCard());
  }
};

/* ---------- day/night transitions ---------- */
function windowsGlow(on){
  castle.windows.forEach(w => {
    w.w.fillColor = on ? 0xFFE082 : 0x39406B;
    CD.scene.tweens.add({ targets: w.glow, alpha: on ? 0.55 : 0, duration: 900 });
  });
}

CD.toNight = function(){
  CD.state.phase = 'dusk';
  CD.ui.exitDay();
  CDAudio.stopMusic();
  const s = CD.scene;
  s.tweens.add({ targets: sky.dusk, alpha: 1, duration: 1000 });
  s.tweens.add({ targets: sky.sun, y: CD.H - 160, alpha: 0, duration: 1400, ease: 'Sine.in' });
  s.tweens.add({ targets: sky.sunglow, alpha: 0, duration: 1000 });
  s.time.delayedCall(1000, () => {
    s.tweens.add({ targets: [sky.night, sky.stars], alpha: 1, duration: 1100 });
    s.tweens.add({ targets: sky.dusk, alpha: 0, duration: 1400, delay: 500 });
    s.tweens.add({ targets: CD.nightShade, fillAlpha: 0.34, duration: 1100 });
    sky.moon.setPosition(CD.W - 170, 330); sky.moonglow.setPosition(CD.W - 170, 330);
    s.tweens.add({ targets: [sky.moon, sky.moonglow], y: 110, alpha: 1, duration: 1500, ease: 'Sine.out' });
    windowsGlow(true);
  });
  s.time.delayedCall(2100, () => {
    CD.ui.banner('Night ' + CD.state.day + ' 🌙', CD.state.day === CD.LAST_NIGHT ? 'The Zombie King is coming…' : 'Defend the castle!');
    s.time.delayedCall(1500, () => CD.Night.start());
  });
};

CD.toDay = function(){
  CD.state.phase = 'dawn';
  const s = CD.scene;
  CDAudio.fx.dawn();
  s.tweens.add({ targets: [sky.night, sky.stars], alpha: 0, duration: 1400 });
  s.tweens.add({ targets: CD.nightShade, fillAlpha: 0, duration: 1400 });
  s.tweens.add({ targets: [sky.moon, sky.moonglow], y: 340, alpha: 0, duration: 1100, ease: 'Sine.in' });
  windowsGlow(false);
  sky.sun.setAlpha(1); sky.sunglow.setAlpha(1);
  CD.sunArc(0);
  s.time.delayedCall(1400, () => {
    CD.ui.banner('Day ' + CD.state.day + ' ☀️', 'Chop wood & get ready!');
    s.time.delayedCall(1300, () => CD.Day.start());
  });
};

CD.nightWon = function(){
  CD.Night.stop();
  CD.ui.exitNight();
  CDAudio.stopMusic();
  CDAudio.fx.fanfare();
  CD.fxConfetti(CD.W / 2, 200, 60);
  const justBeat = CD.state.day;
  CD.state.day++;
  CD.save();
  if (justBeat === CD.LAST_NIGHT && !CD.state.won){
    CD.state.won = true;
    CD.save();
    CD.startFireworks();
    CD.scene.time.delayedCall(900, () => CD.ui.winCard());
  } else {
    CD.scene.time.delayedCall(700, () => CD.toDay());
  }
};

CD.retryNight = function(){
  CD.Night.stop();
  CD.ui.exitNight();
  CD.state.hearts = CD.MAX_HEARTS;
  CD.ui.setHearts();
  CD.ui.banner('Night ' + CD.state.day + ' 🌙', 'Round two — you got this!');
  CD.scene.time.delayedCall(1400, () => CD.Night.start());
};

CD.startFireworks = function(){
  CD.stopFireworks();
  fireworksEvt = CD.scene.time.addEvent({ delay: 600, loop: true, callback: () => {
    CDAudio.fx.firework();
    CD.fxConfetti(CD.rnd(140, CD.W - 140), CD.rnd(90, 260), 40);
  }});
};
CD.stopFireworks = function(){ if (fireworksEvt){ fireworksEvt.remove(); fireworksEvt = null; } };

/* ---------- boot ---------- */
window.CDGame = {
  boot(){
    CD.state = CD.freshState();
    CD.game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: 'stage',
      width: CD.W, height: CD.H,
      backgroundColor: '#0B1130',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene: { create, update }
    });
  },
  start(save){
    if (save){
      CD.state = Object.assign(CD.freshState(), save);
      CD.state.phase = 'start';
    } else {
      CD.clearSave();
      CD.state = CD.freshState();
    }
    CD.ui.setWood(); CD.ui.setHearts();
    CD.ui.banner('Day ' + CD.state.day + ' ☀️', CD.state.day === 1 ? 'Tap trees to chop wood!' : 'Chop wood & get ready!');
    CD.scene.time.delayedCall(1300, () => CD.Day.start());
  }
};
})();
