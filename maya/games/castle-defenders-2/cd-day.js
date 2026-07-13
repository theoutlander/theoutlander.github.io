/* Castle Defenders v2 — DAY: the garden. Chop, water, plant; plots, species, helpers. */
(function(){
'use strict';
const Day = {};
window.CD.Day = Day;

let S = null;            // scene
let spots = [];          // { idx, tree, stump, plot, locked, timer, growEnd }
let knight = null;
let beavers = [];        // 0..2 of them (tool 'beaver' + helper 'beaver2')
let gardener = null;
let squirrelTimer = null;
let sprinklerTimer = null;
let dayLeft = 0;
let busyChop = false;
let ended = false;
/* The garden art is built from CD.state, but boot() creates a FRESH state and the scene renders
   before CDGame.start(save) swaps in her real save. So remember WHICH state object we drew, and
   redraw only when that object is replaced. Rebuilding every morning would also reset growth and
   silently refill any plot she deliberately left empty — don't. */
let builtState = null;

/* ---------- helpers ---------- */
function tool(){
  const t = CD.ui && CD.ui.tool;
  return (t === 'water' || t === 'seed') ? t : 'axe';
}
/* No local memo here on purpose — a second copy of "which way is he facing" desynced from the one
   inside Art.face and swallowed turns. Art.face is the single source of truth and no-ops when the
   direction already matches, so it is safe to call every frame. */
function faceIt(obj, dir){
  if (!obj) return;
  CD.Art.face(S, obj, dir < 0 ? -1 : 1);
}
function spotX(i){ return CD.TREE_SPOTS[i].x; }
function choppable(sp){ return !!(sp.tree && sp.tree.treeData && sp.tree.treeData.stage > 0 && !sp.tree.treeData.falling); }
function poof(x, y){ CD.fxPuff(x, y, 6); }
function onlyOakSeeds(){ return !CD.state.seeds.some(s => s !== 'oak'); }
function bestSeed(){
  let best = 'oak';
  CD.SEED_ORDER.forEach(id => {
    if (CD.hasSeed(id) && CD.TREE_SPECIES[id].seedCost >= CD.TREE_SPECIES[best].seedCost) best = id;
  });
  return best;
}

/* ---------- spot art ---------- */
function clearGrow(sp){
  if (sp.timer){ sp.timer.remove(false); sp.timer = null; }
  sp.growEnd = 0;
}
function clearDirt(sp){                       // plot / locked-plot / stump art (never the tree)
  if (sp.plot){ sp.plot.destroy(); sp.plot = null; }
  if (sp.locked){ sp.locked.destroy(); sp.locked = null; }
  if (sp.stump){ sp.stump.destroy(); sp.stump = null; }
}
function clearSpot(sp){
  clearGrow(sp);
  clearDirt(sp);
  if (sp.tree){ sp.tree.destroy(); sp.tree = null; }
}

function makePlot(sp){
  clearDirt(sp);
  const p = CD.Art.buildPlot(S, sp.idx);
  p.on('pointerdown', (pt, lx, ly, ev) => { if (ev) ev.stopPropagation(); Day.onPlotTap(sp); });
  sp.plot = p;
  return p;
}
function makeLocked(sp){
  clearDirt(sp);
  const p = CD.Art.buildLockedPlot(S, sp.idx);
  /* Deliberately NOT interactive. A locked plot sits right in the middle of the trees, so while
     she is happily tapping to chop she keeps clipping one — and it used to yank the Forge open
     mid-chop, every time. Locked plots are scenery; you buy them on the Garden tab. */
  if (p.disableInteractive) p.disableInteractive();
  sp.locked = p;
  return p;
}

function buildTree(sp, stage){
  clearDirt(sp);
  if (sp.tree){ sp.tree.destroy(); sp.tree = null; }
  const t = CD.Art.buildTree(S, sp.idx, stage);
  t.on('pointerdown', (p, lx, ly, ev) => { if (ev) ev.stopPropagation(); Day.onTreeTap(sp); });
  sp.tree = t;
  S.tweens.add({ targets: t, angle: { from: -0.7, to: 0.7 }, duration: CD.rnd(1800, 2600), yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  if (stage < CD.maxStageFor(sp.idx)) scheduleGrow(sp);
  else clearGrow(sp);
  return t;
}

/* ---------- growth ---------- */
function scheduleGrow(sp, ms){
  clearGrow(sp);
  const delay = Math.max(300, (ms === undefined || ms === null) ? CD.growMsFor(sp.idx) : ms);
  sp.growEnd = S.time.now + delay;
  sp.timer = S.time.delayedCall(delay, () => { sp.timer = null; growSpot(sp); });
}
/* Watering halves the REMAINING time of the current stage, so we need that remaining time.
   Phaser's TimerEvent.getRemaining() is the source of truth; growEnd is a belt-and-braces
   fallback in case a Phaser version hands back 0/undefined. */
function growRemaining(sp){
  if (!sp.timer) return 0;
  if (typeof sp.timer.getRemaining === 'function'){
    const r = sp.timer.getRemaining();
    if (typeof r === 'number' && r > 0) return r;
  }
  return Math.max(0, sp.growEnd - S.time.now);
}
function growSpot(sp){
  if (!CD.state || !sp.tree || !sp.tree.treeData) return;
  const max = CD.maxStageFor(sp.idx);
  if (sp.tree.treeData.stage >= max) return;
  const next = sp.tree.treeData.stage + 1;
  buildTree(sp, next);
  const gy = CD.groundY(sp.idx);
  poof(spotX(sp.idx), gy - 30);
  CDAudio.fx.grow();
  CD.fxSparkle(spotX(sp.idx), gy - 60, 4);
}

/* ---------- phase control ---------- */
Day.init = function(scene, knightRef){
  S = scene; knight = knightRef;
  spots = CD.TREE_SPOTS.map((sp, i) => ({ idx: i, tree: null, stump: null, plot: null, locked: null, timer: null, growEnd: 0 }));
  buildGarden();
};

function buildGarden(){
  spots.forEach(sp => {
    clearSpot(sp);
    if (!CD.plotUnlocked(sp.idx)) makeLocked(sp);
    else buildTree(sp, CD.maxStageFor(sp.idx));
  });
  builtState = CD.state;
}

Day.start = function(){
  ended = false;
  CD.state.phase = 'day';
  CD.state.hearts = CD.MAX_HEARTS;
  dayLeft = CD.DAY_SECONDS;
  CDAudio.music('day');
  CD.ui.enterDay();
  if (builtState !== CD.state) buildGarden();   // her save just replaced the boot state

  const t = CD.TOOLS.find(x => x.day === CD.state.day);
  if (t && CD.state.day > 1){
    S.time.delayedCall(900, () => { CDAudio.fx.unlock(); CD.ui.toolBanner(t); });
  }
  ensureBeavers();
  ensureGardener();
  setupSprinkler();
  setupSquirrels();
  CD.save();
};

Day.stop = function(){
  if (squirrelTimer){ squirrelTimer.remove(); squirrelTimer = null; }
  if (sprinklerTimer){ sprinklerTimer.remove(); sprinklerTimer = null; }
  beavers.forEach(b => b.setVisible(false));
  if (gardener) gardener.setVisible(false);
  faceIt(knight.c, 1);          // the horde comes from the RIGHT — never stand facing the castle
};

Day.tick = function(dtSec){
  if (CD.state.phase !== 'day' || ended) return;
  dayLeft -= dtSec;
  CD.ui.dayTick(1 - dayLeft / CD.DAY_SECONDS);
  CD.sunArc(1 - dayLeft / CD.DAY_SECONDS);
  if (dayLeft <= 0) Day.end();
  beavers.forEach(b => beaverThink(b, dtSec));
  gardenerThink(dtSec);
};

Day.end = function(){
  if (ended) return;
  ended = true;
  /* He walks home LEFTWARD, so he arrives facing left — and then stands there facing the castle
     all night while the entire horde comes at him from the right. Turn him around once he's home. */
  walkKnightTo(285, () => faceIt(knight.c, 1));
  CD.toNight();
};

/* ---------- tool-belt dispatch ---------- */
Day.onTreeTap = function(sp){
  if (!CD.state || CD.state.phase !== 'day' || ended) return;
  const tree = sp.tree;
  if (!tree || !tree.treeData || tree.treeData.falling) return;
  const gy = CD.groundY(sp.idx);
  const tl = tool();

  if (tl === 'seed'){
    CDAudio.fx.click();
    CD.floatText(tree.x, gy - tree.treeData.h - 16, 'Chop it down first! 🪓', { size: 20 });
    return;
  }
  if (tl === 'water'){
    approach(tree.x, () => waterTree(sp, false));
    return;
  }
  // axe
  if (tree.treeData.stage === 0){
    CD.floatText(tree.x, gy - 70, 'Still growing! 🌱', { size: 20 });
    CDAudio.fx.click();
    return;
  }
  const dist = Math.abs(knight.c.x - tree.x);
  if (dist < 95){
    faceIt(knight.c, tree.x >= knight.c.x ? 1 : -1);
    swingChop(sp, 'axe');
  } else if (CD.hasTool('throw') && dist > 180){
    throwAxe(sp);
  } else {
    walkKnightTo(tree.x + (knight.c.x < tree.x ? -62 : 62), () => {
      if (sp.tree === tree && !tree.treeData.falling){
        faceIt(knight.c, tree.x >= knight.c.x ? 1 : -1);
        swingChop(sp, 'axe');
      }
    });
  }
};

Day.onPlotTap = function(sp){
  if (!CD.state || CD.state.phase !== 'day' || ended) return;
  if (!CD.plotUnlocked(sp.idx)){
    CDAudio.fx.click();
    if (CD.ui && typeof CD.ui.openShop === 'function') CD.ui.openShop('garden');
    return;
  }
  if (sp.tree) return;
  /* Empty plot + ANY tool -> the seed picker. Kid-friendly on purpose: she should never tap bare
     dirt and get nothing back just because the wrong tool was selected. (Spec said seed tool only.) */
  CDAudio.fx.click();
  if (CD.ui && typeof CD.ui.openSeedPicker === 'function') CD.ui.openSeedPicker(sp.idx);
};

/* ---------- knight movement ---------- */
function approach(x, done){
  const dist = Math.abs(knight.c.x - x);
  if (dist < 95){
    faceIt(knight.c, x >= knight.c.x ? 1 : -1);
    done();
    return;
  }
  walkKnightTo(x + (knight.c.x < x ? -62 : 62), () => {
    faceIt(knight.c, x >= knight.c.x ? 1 : -1);
    done();
  });
}

function walkKnightTo(x, done){
  if (knight.walkTween) knight.walkTween.stop();
  if (knight.bobTween){ knight.bobTween.stop(); knight.c.angle = 0; }
  const dist = Math.abs(knight.c.x - x);
  if (dist < 6){ done(); return; }
  faceIt(knight.c, x > knight.c.x ? 1 : -1);
  knight.bobTween = S.tweens.add({ targets: knight.c, angle: { from: -2.5, to: 2.5 }, duration: 130, yoyo: true, repeat: -1 });
  knight.walkTween = S.tweens.add({
    targets: knight.c, x, duration: dist * 2.6, ease: 'Sine.inOut',
    onComplete: () => {
      if (knight.bobTween){ knight.bobTween.stop(); knight.c.angle = 0; }
      done();
    }
  });
}

/* ---------- watering ---------- */
/* remote = a helper did it (sprinkler): no nag text if there is nothing to water. */
function waterTree(sp, remote){
  const tree = sp.tree;                        // re-read: the sprout may have grown during the walk
  if (!tree || !tree.treeData || tree.treeData.falling) return false;
  const d = tree.treeData;
  const gy = CD.groundY(sp.idx);
  const top = gy - d.h - 10;

  if (d.stage >= CD.maxStageFor(sp.idx)){
    if (!remote){ CDAudio.fx.click(); CD.floatText(tree.x, top, 'All grown! 🌳', { size: 20 }); }
    return false;
  }
  if (d.watered){
    if (!remote){ CDAudio.fx.click(); CD.floatText(tree.x, top, 'Already watered! 💧', { size: 20, color: '#A8E9FF' }); }
    return false;
  }

  d.watered = true;
  scheduleGrow(sp, growRemaining(sp) * CD.WATER_BOOST);

  CDAudio.fx.splash();
  if (!remote){
    S.tweens.add({ targets: knight.arm, angle: -66, duration: 200, yoyo: true, hold: 120, ease: 'Sine.inOut' });
  }
  CD.Art.waterSplash(S, tree.x, gy - Math.min(70, d.h * 0.55));
  CD.fxSparkle(tree.x, gy - d.h * 0.7, 8);
  S.tweens.add({ targets: tree, scaleX: 1.07, scaleY: 1.1, duration: 190, yoyo: true, ease: 'Sine.inOut' });
  CD.floatText(tree.x, top, CD.pick(['Glug glug! 💧', 'Grow grow grow! 💧', 'Yum! 💧']), { size: 22, color: '#A8E9FF' });
  return true;
}

/* PUBLIC — the 💧 Water All button. One tap soaks the whole garden, so watering never becomes a
   mode she has to remember she's in. Trees that are fully grown or already watered simply skip
   (quietly — no nagging), and if NOTHING could use a drink we say so once. */
Day.waterAll = function(){
  if (!CD.state || CD.state.phase !== 'day' || ended) return;
  let n = 0;
  spots.forEach((sp, i) => {
    S.time.delayedCall(i * 90, () => {          // a little ripple across the garden
      if (CD.state && CD.state.phase === 'day' && !ended) waterTree(sp, true);
    });
    const d = sp.tree && sp.tree.treeData;
    if (d && !d.falling && !d.watered && d.stage < CD.maxStageFor(sp.idx)) n++;
  });
  if (n === 0){
    CDAudio.fx.click();
    CD.floatText(CD.W / 2, 250, 'Everything is watered! 💧', { size: 24, color: '#A8E9FF' });
    return;
  }
  CD.floatText(CD.W / 2, 250, 'Glug glug! ' + n + ' tree' + (n > 1 ? 's' : '') + ' watered 💧', { size: 26, color: '#A8E9FF' });
};

/* ---------- planting ---------- */
function plantAt(sp, id){
  if (!CD.plotUnlocked(sp.idx) || sp.tree) return false;
  if (!CD.hasSeed(id)) return false;
  CD.setSpecies(sp.idx, id);
  const t = buildTree(sp, 0);
  const gy = CD.groundY(sp.idx);
  const spec = CD.TREE_SPECIES[id];
  CDAudio.fx.plant();
  CD.fxPuff(t.x, gy - 12, 10);
  CD.fxSparkle(t.x, gy - 48, 6);
  S.tweens.add({ targets: t, scaleX: { from: 0.3, to: 1 }, scaleY: { from: 0.3, to: 1 }, duration: 320, ease: 'Back.out' });
  CD.floatText(t.x, gy - 92, spec.emoji + ' ' + spec.name + ' planted!', { size: 21, color: '#FFF3B0' });
  return true;
}

/* PUBLIC — cd-ui.js calls this from the seed picker. */
Day.plantSeed = function(spotIdx, id){
  const sp = spots[spotIdx];
  if (!sp || !CD.state || CD.state.phase !== 'day' || ended) return;
  if (!CD.plotUnlocked(spotIdx) || sp.tree || !CD.hasSeed(id)){ CDAudio.fx.nope(); return; }
  const x = spotX(spotIdx);
  approach(x, () => {
    S.tweens.add({ targets: knight.arm, angle: -60, duration: 190, yoyo: true, ease: 'Sine.inOut' });
    plantAt(sp, id);
  });
};

/* PUBLIC — cd-ui.js calls this AFTER it has taken the wood and unlocked the plot. Visual only. */
Day.onPlotBought = function(idx){
  const sp = spots[idx];
  if (!sp || !S) return;
  if (!CD.plotUnlocked(idx)) CD.state.plots = Math.max(CD.state.plots, idx + 1);  // idempotent safety net
  makePlot(sp);
  const gy = CD.groundY(idx), x = spotX(idx);
  CDAudio.fx.buyplot();
  CD.shake(140, 0.005);
  CD.fxPuff(x, gy - 8, 12);
  CD.fxConfetti(x, gy - 70, 30);
  CD.floatText(x, gy - 100, 'New plot! 🌱', { size: 26, color: '#FFF3B0' });
};

/* ---------- chopping ---------- */
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
  const gy = CD.groundY(sp.idx);
  faceIt(knight.c, tree.x >= knight.c.x ? 1 : -1);
  CDAudio.fx.throwaxe();
  const ax = CD.Art.emoji(S, knight.c.x, knight.c.y - 50, '🪓', 30).setDepth(CD.GROUND + 60);
  const tx = tree.x, ty = gy - tree.treeData.h * 0.45;
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
  const gy = CD.groundY(sp.idx);
  d.hits += power;
  const golden = CD.hasTool('golden');
  if (golden) CDAudio.fx.goldchop(); else CDAudio.fx.chop();

  S.tweens.add({ targets: tree, angle: (Math.random()<0.5?-1:1) * 4, duration: 55, yoyo: true, repeat: 1 });
  CD.fxChips(tree.x + (knight.c.x < tree.x ? -d.r*0.2 : d.r*0.2), gy - Math.min(60, d.h*0.35), 6 + power*3);
  if (Math.random() < 0.55) CD.fxLeaves(tree.x, gy - d.h + d.r*0.4, 3);
  if (golden) CD.fxSparkle(tree.x, gy - d.h*0.4, 4);
  if (d.stage === 3 && d.hits >= d.chops - 3 && d.hits < d.chops){
    CDAudio.fx.crack();
    CD.floatText(tree.x, gy - d.h - 20, 'CREEEAK…', { size: 22, color: '#FFD24D' });
  }
  if (d.hits >= d.chops) fellTree(sp);
}

function fellTree(sp){
  const tree = sp.tree;
  const d = tree.treeData;
  d.falling = true;
  tree.disableInteractive();
  clearGrow(sp);
  const gy = CD.groundY(sp.idx);
  const golden = CD.hasTool('golden');
  const woodGain = d.wood * (golden ? 2 : 1);
  const party = d.species === 'candy' || d.species === 'rainbow';

  if (d.stage === 3){ CDAudio.fx.bigfall(); CD.shake(300, 0.012); CD.floatText(tree.x - 40, gy - d.h*0.7, 'TIMBERRRR!', { size: 40, color: '#FFD24D' }); }
  else { CDAudio.fx.treefall(); CD.shake(120, 0.004); }

  const dir = (knight.c.x < tree.x) ? 1 : -1;
  S.tweens.add({
    targets: tree, angle: 84 * dir, duration: d.stage === 3 ? 900 : 620, ease: 'Bounce.easeOut',
    onComplete: () => {
      CD.fxLeaves(tree.x + dir * d.h * 0.5, gy - 20, d.stage * 8 + 6);
      if (d.stage === 3 || party) CD.fxConfetti(tree.x, gy - 120, party ? 40 : 50);
      woodBurst(tree.x + dir * d.h * 0.4, gy - 30, woodGain);
      speciesPayout(sp, d, gy);
      S.tweens.add({ targets: tree, alpha: 0, duration: 320, delay: 120, onComplete: () => {
        tree.destroy();
        if (sp.tree === tree) sp.tree = null;
        sp.stump = CD.Art.buildStump(S, spotX(sp.idx), gy);
        S.time.delayedCall(CD.REGROW_DELAY, () => afterStump(sp));
      }});
    }
  });
  CD.state.chopped += woodGain;
}

/* A felled tree leaves an EMPTY plot — she picks what goes there next. EXCEPT: a brand-new player
   owns nothing but oak, so an empty plot would just be dead dirt she can't do anything with. In
   that case the oak simply comes back, exactly like it used to. The moment she owns a real seed,
   the plot stays empty and the choice is hers. (Gardener Gus, if hired, fills it in himself.) */
function afterStump(sp){
  if (!CD.state || sp.tree) return;
  clearDirt(sp);
  if (onlyOakSeeds()){
    CD.setSpecies(sp.idx, 'oak');
    buildTree(sp, 0);
    poof(spotX(sp.idx), CD.groundY(sp.idx) - 24);
  } else {
    makePlot(sp);
  }
}

function speciesPayout(sp, d, gy){
  if (d.species === 'apple'){
    CD.state.apples++;
    CD.save();
    CD.fxStars(spotX(sp.idx), gy - 90, 10);
    CD.floatText(spotX(sp.idx), gy - 150, '🍎 +1 heart tonight!', { size: 24, color: '#FF9EC7' });
  } else if (d.species === 'rainbow'){
    rainbowSurprise(spotX(sp.idx), gy - 130);
  } else if (d.species === 'candy'){
    CD.floatText(spotX(sp.idx), gy - 150, '🍭 CANDY HAUL!', { size: 26, color: '#C77DFF' });
  }
}

function rainbowSurprise(x, y){
  CDAudio.fx.surprise();
  CD.fxConfetti(x, y, 44);
  CD.fxStars(x, y, 14);
  const roll = Math.random();
  if (roll < 0.34){
    CD.addWood(5);
    CD.floatText(x, y - 30, '🌈 SURPRISE! +5 wood!', { size: 26, color: '#FFD24D' });
  } else if (roll < 0.67){
    CD.state.apples++;
    CD.save();
    CD.floatText(x, y - 30, '🌈 SURPRISE! 🍎 Extra heart!', { size: 24, color: '#FF9EC7' });
  } else {
    CD.addWood(8);
    CD.floatText(x, y - 30, '🌈 SURPRISE! Weapon fuel +8! ⚔️', { size: 23, color: '#6FD3FF' });
  }
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

/* ---------- helpers: beavers ---------- */
function ensureBeavers(){
  const want = (CD.hasTool('beaver') ? 1 : 0) + (CD.hasHelper('beaver2') ? 1 : 0);
  while (beavers.length < want){
    const b = CD.Art.buildBeaver(S);
    b.x = 120 + beavers.length * 70;
    b.chopAt = 0;
    b.claim = -1;
    beavers.push(b);
  }
  beavers.forEach(b => b.setVisible(true));
}

/* Two beavers must not pile onto the same trunk: each one claims a spot, the other prefers a
   different one (falling back to the shared nearest if that is genuinely all there is). */
function beaverTarget(b){
  const taken = {};
  beavers.forEach(o => { if (o !== b && o.claim >= 0) taken[o.claim] = 1; });
  let best = null, bd = 1e9, any = null, ad = 1e9;
  spots.forEach(sp => {
    if (!choppable(sp)) return;
    const d = Math.abs(sp.tree.x - b.x);
    if (d < ad){ ad = d; any = sp; }
    if (taken[sp.idx]) return;
    if (d < bd){ bd = d; best = sp; }
  });
  return best || any;
}

function beaverThink(b, dt){
  if (!b.visible) return;
  const sp = beaverTarget(b);
  b.claim = sp ? sp.idx : -1;
  if (!sp) return;
  const target = sp.tree.x + 42;
  const d = target - b.x;
  if (Math.abs(d) > 8){
    b.x += Math.sign(d) * 62 * dt;
    faceIt(b, d > 0 ? 1 : -1);
    b.setDepth(b.y);
  } else {
    b.chopAt += dt;
    if (b.chopAt >= 1.1){
      b.chopAt = 0;
      CDAudio.fx.beaver();
      S.tweens.add({ targets: b, y: b.y - 10, duration: 90, yoyo: true });
      applyChopRemote(sp, 1);
    }
  }
}

function applyChopRemote(sp, power){
  const tree = sp.tree;
  if (!tree || !tree.treeData || tree.treeData.falling || tree.treeData.stage === 0) return;
  tree.treeData.hits += power;
  S.tweens.add({ targets: tree, angle: 3, duration: 55, yoyo: true, repeat: 1 });
  CD.fxChips(tree.x, CD.groundY(sp.idx) - 30, 5);
  if (tree.treeData.hits >= tree.treeData.chops) fellTree(sp);
}

/* ---------- helpers: gardener ---------- */
function ensureGardener(){
  if (!CD.hasHelper('gardener')) return;
  if (!gardener){
    gardener = CD.Art.buildGardener(S);
    gardener.cool = 0;
  }
  gardener.setVisible(true);
}

function emptyPlot(){
  for (let i = 0; i < spots.length; i++){
    const sp = spots[i];
    if (!sp.tree && !sp.stump && sp.plot && CD.plotUnlocked(i)) return sp;
  }
  return null;
}

function gardenerThink(dt){
  if (!gardener || !gardener.visible) return;
  if (gardener.cool > 0){ gardener.cool -= dt; return; }
  const sp = emptyPlot();
  const tx = sp ? spotX(sp.idx) : 250;          // no work -> amble back toward the forge
  const d = tx - gardener.x;
  if (Math.abs(d) > 10){
    gardener.x += Math.sign(d) * (sp ? 58 : 34) * dt;
    faceIt(gardener, d > 0 ? 1 : -1);
    gardener.setDepth(gardener.y);
    return;
  }
  if (!sp) return;
  gardener.cool = 2.0;
  S.tweens.add({ targets: gardener.can, angle: 46, duration: 260, yoyo: true, ease: 'Sine.inOut' });
  S.tweens.add({ targets: gardener, y: gardener.y - 8, duration: 140, yoyo: true });
  plantAt(sp, bestSeed());                      // she paid for the fanciest seed — show it off
}

/* ---------- helpers: sprinkler + squirrels ---------- */
function setupSprinkler(){
  if (sprinklerTimer){ sprinklerTimer.remove(); sprinklerTimer = null; }
  if (!CD.hasHelper('sprinkler')) return;
  sprinklerTimer = S.time.addEvent({ delay: 5000, loop: true, callback: sprinkle });
}

function sprinkle(){
  if (!CD.state || CD.state.phase !== 'day' || ended) return;
  const thirsty = spots.filter(sp =>
    sp.tree && sp.tree.treeData && !sp.tree.treeData.falling &&
    !sp.tree.treeData.watered && sp.tree.treeData.stage < CD.maxStageFor(sp.idx));
  if (!thirsty.length) return;
  const sp = CD.pick(thirsty);
  const gy = CD.groundY(sp.idx);
  const can = CD.Art.emoji(S, sp.tree.x, gy - sp.tree.treeData.h - 40, '💦', 30).setDepth(gy + 30).setAlpha(0);
  S.tweens.add({ targets: can, alpha: 1, y: can.y + 10, duration: 220, yoyo: true, hold: 260,
    onComplete: () => can.destroy() });
  waterTree(sp, true);
}

function setupSquirrels(){
  if (squirrelTimer){ squirrelTimer.remove(); squirrelTimer = null; }
  if (!CD.hasTool('squirrels')) return;
  squirrelTimer = S.time.addEvent({
    delay: CD.hasHelper('squirrels2') ? 3250 : 6500, loop: true, callback: squirrelRaid
  });
}

function nearestChoppable(x){
  let best = null, bd = 1e9;
  spots.forEach(sp => {
    if (!choppable(sp)) return;
    const d = Math.abs(sp.tree.x - x);
    if (d < bd){ bd = d; best = sp; }
  });
  return best;
}

function squirrelRaid(){
  if (!CD.state || CD.state.phase !== 'day' || ended) return;
  const sp = nearestChoppable(CD.rnd(200, CD.W));
  if (!sp) return;
  const tree = sp.tree;
  const gy = CD.groundY(sp.idx);
  const sq = CD.Art.emoji(S, tree.x + 20, gy - tree.treeData.h + 10, '🐿️', 30).setDepth(gy + 65).setAlpha(0);
  S.tweens.add({ targets: sq, alpha: 1, y: sq.y - 14, duration: 250, yoyo: true, hold: 1400, onComplete: () => sq.destroy() });
  for (let i = 0; i < 3; i++){
    S.time.delayedCall(320 + i * 380, () => {
      if (!sp.tree || sp.tree !== tree || tree.treeData.falling) return;
      const a = CD.Art.emoji(S, tree.x + CD.rnd(-24, 24), gy - tree.treeData.h * 0.8, '🌰', 20).setDepth(gy + 64);
      S.tweens.add({ targets: a, y: gy - 14, angle: 260, duration: 330, ease: 'Quad.in', onComplete: () => {
        a.destroy(); CDAudio.fx.acorn();
        applyChopRemote(sp, 1);
      }});
    });
  }
}

/* PUBLIC — cd-ui.js calls this after it has taken the wood for a shop helper. */
Day.onHelperBought = function(id){
  if (!S || !CD.state) return;
  if (id === 'beaver2') ensureBeavers();
  else if (id === 'gardener') ensureGardener();
  else if (id === 'sprinkler') setupSprinkler();
  else if (id === 'squirrels2') setupSquirrels();
  const h = CD.HELPERS.find(x => x.id === id);
  CDAudio.fx.fanfare();
  CD.fxConfetti(CD.W / 2, 230, 44);
  CD.fxSparkle(CD.W / 2, 230, 10);
  if (h) CD.floatText(CD.W / 2, 200, h.emoji + ' ' + h.name + ' joined!', { size: 26, color: '#FFF3B0' });
};
})();
