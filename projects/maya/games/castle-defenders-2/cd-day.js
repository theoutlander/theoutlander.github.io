/* Castle Defenders v2 — DAY: chop wood, forge weapons */
(function(){
'use strict';
const Day = {};
window.CD.Day = Day;

let S = null;            // scene
let spots = [];          // { idx, tree, stump, timer }
let knight = null;
let beaver = null;
let squirrelTimer = null;
let dayLeft = 0;
let busyChop = false;
let ended = false;

Day.init = function(scene, knightRef){
  S = scene; knight = knightRef;
  spots = CD.TREE_SPOTS.map((sp, i) => ({ idx: i, tree: null, stump: null, timer: null }));
  spots.forEach(sp => buildTree(sp, CD.TREE_SPOTS[sp.idx].max));
};

function buildTree(sp, stage){
  if (sp.tree) { sp.tree.destroy(); sp.tree = null; }
  if (sp.stump) { sp.stump.destroy(); sp.stump = null; }
  const t = CD.Art.buildTree(S, sp.idx, stage);
  t.on('pointerdown', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); Day.onTreeTap(sp); });
  sp.tree = t;
  // gentle idle sway
  S.tweens.add({ targets: t, angle: { from: -0.7, to: 0.7 }, duration: CD.rnd(1800, 2600), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  if (stage === 0 || stage < CD.TREE_SPOTS[sp.idx].max) scheduleGrow(sp);
  return t;
}

function scheduleGrow(sp){
  if (sp.timer) sp.timer.remove();
  sp.timer = S.time.delayedCall(CD.GROW_MS, () => {
    if (!sp.tree || sp.tree.treeData.stage >= CD.TREE_SPOTS[sp.idx].max) return;
    const next = sp.tree.treeData.stage + 1;
    buildTree(sp, next);
    poof(CD.TREE_SPOTS[sp.idx].x, CD.GROUND - 30);
  });
}

function poof(x, y){
  CD.fxPuff(x, y, 6);
}

/* ---------- phase control ---------- */
Day.start = function(){
  ended = false;
  CD.state.phase = 'day';
  CD.state.hearts = CD.MAX_HEARTS;
  dayLeft = CD.DAY_SECONDS;
  CDAudio.music('day');
  CD.ui.enterDay();

  const tool = CD.TOOLS.find(t => t.day === CD.state.day);
  if (tool && CD.state.day > 1){
    S.time.delayedCall(900, () => { CDAudio.fx.unlock(); CD.ui.toolBanner(tool); });
  }
  if (CD.hasTool('beaver') && !beaver){
    beaver = CD.Art.buildBeaver(S);
    beaver.tx = beaver.x;
    beaver.chopAt = 0;
  }
  if (beaver) beaver.setVisible(true);
  if (CD.hasTool('squirrels')){
    squirrelTimer = S.time.addEvent({ delay: 6500, loop: true, callback: squirrelRaid });
  }
  CD.save();
};

Day.stop = function(){
  if (squirrelTimer){ squirrelTimer.remove(); squirrelTimer = null; }
  if (beaver) beaver.setVisible(false);
};

Day.tick = function(dtSec){
  if (CD.state.phase !== 'day' || ended) return;
  dayLeft -= dtSec;
  CD.ui.dayTick(1 - dayLeft / CD.DAY_SECONDS);
  CD.sunArc(1 - dayLeft / CD.DAY_SECONDS);
  if (dayLeft <= 0) Day.end();
  if (beaver) beaverThink(dtSec);
};

Day.end = function(){
  if (ended) return;
  ended = true;
  // knight walks home
  walkKnightTo(285, () => {});
  CD.toNight();
};

/* ---------- chopping ---------- */
Day.onTreeTap = function(sp){
  if (CD.state.phase !== 'day' || ended) return;
  const tree = sp.tree;
  if (!tree || !tree.treeData || tree.treeData.falling) return;
  if (tree.treeData.stage === 0){
    CD.floatText(tree.x, CD.GROUND - 70, 'Still growing! 🌱', { size: 20 });
    CDAudio.fx.click();
    return;
  }
  const dist = Math.abs(knight.c.x - tree.x);
  if (dist < 95){
    faceTree(tree);
    swingChop(sp, 'axe');
  } else if (CD.hasTool('throw') && dist > 180){
    throwAxe(sp);
  } else {
    walkKnightTo(tree.x + (knight.c.x < tree.x ? -62 : 62), () => {
      if (sp.tree === tree && !tree.treeData.falling) { faceTree(tree); swingChop(sp, 'axe'); }
    });
  }
};

function faceTree(tree){
  knight.c.scaleX = (tree.x >= knight.c.x) ? 1 : -1;
}

function walkKnightTo(x, done){
  if (knight.walkTween) knight.walkTween.stop();
  if (knight.bobTween){ knight.bobTween.stop(); knight.c.angle = 0; }
  const dist = Math.abs(knight.c.x - x);
  if (dist < 6){ done(); return; }
  knight.c.scaleX = (x > knight.c.x) ? 1 : -1;
  knight.bobTween = S.tweens.add({ targets: knight.c, angle: { from: -2.5, to: 2.5 }, duration: 130, yoyo: true, repeat: -1 });
  knight.walkTween = S.tweens.add({
    targets: knight.c, x, duration: dist * 2.6, ease: 'Sine.inOut',
    onComplete: () => {
      if (knight.bobTween){ knight.bobTween.stop(); knight.c.angle = 0; }
      done();
    }
  });
}

function swingChop(sp, source){
  if (busyChop) return;
  busyChop = true;
  S.tweens.add({
    targets: knight.arm, angle: -30, duration: 90, ease: 'Sine.in',
    onComplete: () => {
      S.tweens.add({ targets: knight.arm, angle: -150, duration: 200, delay: 40, ease: 'Sine.out' });
      busyChop = false;
      applyChop(sp, source, 1);
    }
  });
}

function throwAxe(sp){
  const tree = sp.tree;
  faceTree(tree);
  CDAudio.fx.throwaxe();
  const ax = CD.Art.emoji(S, knight.c.x, knight.c.y - 50, '🪓', 30).setDepth(CD.GROUND + 60);
  const tx = tree.x, ty = CD.GROUND - tree.treeData.h * 0.45;
  const sx = ax.x, sy = ax.y, peak = Math.min(sy, ty) - 90;
  S.tweens.add({
    targets: ax, angle: 900, duration: 480,
    onUpdate: (tw) => {
      const t = tw.progress;
      ax.x = sx + (tx - sx) * t;
      ax.y = (1-t)*(1-t)*sy + 2*(1-t)*t*peak + t*t*ty;
    },
    onComplete: () => {
      ax.destroy();
      if (sp.tree === tree && !tree.treeData.falling) applyChop(sp, 'throw', 2);
    }
  });
}

function applyChop(sp, source, power){
  const tree = sp.tree;
  if (!tree || !tree.treeData || tree.treeData.falling || tree.treeData.stage === 0) return;
  const d = tree.treeData;
  d.hits += power;
  const golden = CD.hasTool('golden');
  if (golden) CDAudio.fx.goldchop(); else CDAudio.fx.chop();

  // wobble + chips
  S.tweens.add({ targets: tree, angle: (Math.random()<0.5?-1:1) * 4, duration: 55, yoyo: true, repeat: 1 });
  CD.fxChips(tree.x + (knight.c.x < tree.x ? -d.r*0.2 : d.r*0.2), CD.GROUND - Math.min(60, d.h*0.35), 6 + power*3);
  if (Math.random() < 0.55) CD.fxLeaves(tree.x, CD.GROUND - d.h + d.r*0.4, 3);
  if (golden) CD.fxSparkle(tree.x, CD.GROUND - d.h*0.4, 4);
  if (d.stage === 3 && d.hits >= d.chops - 3 && d.hits < d.chops){
    CDAudio.fx.crack();
    CD.floatText(tree.x, CD.GROUND - d.h - 20, 'CREEEAK…', { size: 22, color: '#FFD24D' });
  }
  if (d.hits >= d.chops) fellTree(sp);
}

function fellTree(sp){
  const tree = sp.tree;
  const d = tree.treeData;
  d.falling = true;
  tree.disableInteractive();
  const golden = CD.hasTool('golden');
  const woodGain = d.wood * (golden ? 2 : 1);

  if (d.stage === 3){ CDAudio.fx.bigfall(); CD.shake(300, 0.012); CD.floatText(tree.x - 40, CD.GROUND - d.h*0.7, 'TIMBERRRR!', { size: 40, color: '#FFD24D' }); }
  else { CDAudio.fx.treefall(); CD.shake(120, 0.004); }

  const dir = (knight.c.x < tree.x) ? 1 : -1;
  S.tweens.add({
    targets: tree, angle: 84 * dir, duration: d.stage === 3 ? 900 : 620, ease: 'Bounce.easeOut',
    onComplete: () => {
      CD.fxLeaves(tree.x + dir * d.h * 0.5, CD.GROUND - 20, d.stage * 8 + 6);
      if (d.stage === 3) CD.fxConfetti(tree.x, CD.GROUND - 120, 50);
      woodBurst(tree.x + dir * d.h * 0.4, CD.GROUND - 30, woodGain);
      S.tweens.add({ targets: tree, alpha: 0, duration: 320, delay: 120, onComplete: () => {
        tree.destroy();
        if (sp.tree === tree) sp.tree = null;
        sp.stump = CD.Art.buildStump(S, CD.TREE_SPOTS[sp.idx].x);
        S.time.delayedCall(CD.REGROW_DELAY, () => { if (CD.state) buildTree(sp, 0); });
      }});
    }
  });
  CD.state.chopped += woodGain;
}

function woodBurst(x, y, n){
  const show = Math.min(n, 10);
  for (let i = 0; i < show; i++){
    const w = CD.Art.emoji(S, x + CD.rnd(-30, 30), y + CD.rnd(-16, 10), '🪵', 24).setDepth(CD.GROUND + 70);
    S.tweens.add({
      targets: w, y: w.y - CD.rnd(50, 110), x: w.x + CD.rnd(-40, 40), angle: CD.rnd(-180, 180),
      duration: 420, ease: 'Sine.out', delay: i * 55,
      onComplete: () => S.tweens.add({ targets: w, y: 8, x: 70, scale: 0.4, alpha: 0.9, duration: 380, ease: 'Sine.in',
        onComplete: () => { w.destroy(); CD.addWood(1); if (i === show - 1 && n > show) CD.addWood(n - show); } })
    });
  }
}

/* ---------- helpers: beaver + squirrels ---------- */
function nearestChoppable(x){
  let best = null, bd = 1e9;
  spots.forEach(sp => {
    if (sp.tree && sp.tree.treeData.stage > 0 && !sp.tree.treeData.falling){
      const d = Math.abs(sp.tree.x - x);
      if (d < bd){ bd = d; best = sp; }
    }
  });
  return best;
}

function beaverThink(dt){
  const sp = nearestChoppable(beaver.x);
  if (!sp){ return; }
  const target = sp.tree.x + 42;
  const d = target - beaver.x;
  if (Math.abs(d) > 8){
    beaver.x += Math.sign(d) * 62 * dt;
    beaver.scaleX = d > 0 ? 1 : -1;
    beaver.setDepth(beaver.y);
  } else {
    beaver.chopAt += dt;
    if (beaver.chopAt >= 1.1){
      beaver.chopAt = 0;
      CDAudio.fx.beaver();
      S.tweens.add({ targets: beaver, y: beaver.y - 10, duration: 90, yoyo: true });
      applyChopRemote(sp, 1);
    }
  }
}

function applyChopRemote(sp, power){
  const tree = sp.tree;
  if (!tree || tree.treeData.falling || tree.treeData.stage === 0) return;
  tree.treeData.hits += power;
  S.tweens.add({ targets: tree, angle: 3, duration: 55, yoyo: true, repeat: 1 });
  CD.fxChips(tree.x, CD.GROUND - 30, 5);
  if (tree.treeData.hits >= tree.treeData.chops) fellTree(sp);
}

function squirrelRaid(){
  if (CD.state.phase !== 'day' || ended) return;
  const sp = nearestChoppable(CD.rnd(200, CD.W));
  if (!sp) return;
  const tree = sp.tree;
  const sq = CD.Art.emoji(S, tree.x + 20, CD.GROUND - tree.treeData.h + 10, '🐿️', 30).setDepth(CD.GROUND + 65).setAlpha(0);
  S.tweens.add({ targets: sq, alpha: 1, y: sq.y - 14, duration: 250, yoyo: true, hold: 1400, onComplete: () => sq.destroy() });
  for (let i = 0; i < 3; i++){
    S.time.delayedCall(320 + i * 380, () => {
      if (!sp.tree || sp.tree !== tree || tree.treeData.falling) return;
      const a = CD.Art.emoji(S, tree.x + CD.rnd(-24, 24), CD.GROUND - tree.treeData.h * 0.8, '🌰', 20).setDepth(CD.GROUND + 64);
      S.tweens.add({ targets: a, y: CD.GROUND - 14, angle: 260, duration: 330, ease: 'Quad.in', onComplete: () => {
        a.destroy(); CDAudio.fx.acorn();
        applyChopRemote(sp, 1);
      }});
    });
  }
}
})();
