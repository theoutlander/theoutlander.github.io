/* Castle Defenders v2 — art: textures, castle, trees, characters */
(function(){
'use strict';
const Art = {};
window.CD.Art = Art;

const C = {
  trunk:0x8B5E3C, trunkDark:0x6D452B, leaf:0x58A14E, leaf2:0x6FBF61, leafHi:0x8ED97F,
  grass:0x67B05B, grassDark:0x569A4B, dirt:0xC9A36B,
  stone:0xC9CBD6, stoneDark:0xA6A9BB, stoneLine:0x8E92A8, roof:0xE8618C, roofDark:0xC94E77,
  gate:0x8B5E3C, gateDark:0x6D452B,
  skin:0xFFD9B3, tunic:0x4FA3D1, tunicDark:0x3E7FA6, helmet:0xC4C9D8, plume:0xFF7BAC,
  zbody:0x85D171, zhead:0x97DD84, zdark:0x5FA050, zshirt:0x9B7BD1,
  beaver:0x9C6B3F, beaverDark:0x7A4F2B,
  plot:0xA97A4C, plotDark:0x7E5836, plotLite:0xC29666,
  steel:0xB9BFCF, steelDark:0x7E869E, gold:0xFFD24D,
  water:0x6FD3FF, water2:0xA8E9FF,
  gard:0x4FBF7E, gardDark:0x35935F
};
Art.C = C;

/* ---------- gradient canvas textures ---------- */
function grad(scene, key, w, h, stops){
  if (scene.textures.exists(key)) return;
  const t = scene.textures.createCanvas(key, w, h), c = t.getContext();
  const g = c.createLinearGradient(0, 0, 0, h);
  stops.forEach(s => g.addColorStop(s[0], s[1]));
  c.fillStyle = g; c.fillRect(0, 0, w, h); t.refresh();
}
function radial(scene, key, r, inner, outer){
  if (scene.textures.exists(key)) return;
  const t = scene.textures.createCanvas(key, r*2, r*2), c = t.getContext();
  const g = c.createRadialGradient(r, r, 1, r, r, r);
  g.addColorStop(0, inner); g.addColorStop(1, outer);
  c.fillStyle = g; c.fillRect(0, 0, r*2, r*2); t.refresh();
}

Art.makeTextures = function(scene){
  grad(scene, 'sky-day', 64, CD.H, [[0,'#6FBEF0'],[0.55,'#A8DCF8'],[1,'#E2F4FD']]);
  grad(scene, 'sky-dusk', 64, CD.H, [[0,'#3E4A8C'],[0.5,'#B06AA8'],[1,'#FFB47E']]);
  grad(scene, 'sky-night', 64, CD.H, [[0,'#0B1130'],[0.6,'#1D2A56'],[1,'#324070']]);
  radial(scene, 'sunglow', 90, 'rgba(255,238,150,0.9)', 'rgba(255,238,150,0)');
  radial(scene, 'moonglow', 70, 'rgba(214,228,255,0.55)', 'rgba(214,228,255,0)');
  radial(scene, 'puff', 26, 'rgba(255,255,255,0.9)', 'rgba(255,255,255,0)');

  const g = scene.add.graphics();
  const tex = (key, w, h) => { g.generateTexture(key, w, h); g.clear(); };

  g.fillStyle(0xA9743F); g.fillRect(0,0,7,4); tex('chip',7,4);
  g.fillStyle(0x6FBF61); g.fillCircle(3,3,3); tex('leafp',6,6);
  g.fillStyle(0xFFFFFF); g.fillCircle(3,3,3); tex('dot',6,6);
  g.fillStyle(0xFFFFFF); g.fillRect(0,0,7,5); tex('confbit',7,5);
  g.fillStyle(0xFFF6E8); g.fillCircle(4,4,4); tex('goo',8,8);
  g.fillStyle(0xFFE082); g.fillCircle(4,4,4); tex('sparkle',8,8);
  // sun / moon bodies
  g.fillStyle(0xFFE082); g.fillCircle(30,30,30); tex('sun',60,60);
  g.fillStyle(0xEDF2FF); g.fillCircle(26,26,26);
  g.fillStyle(0xC9D4F0); g.fillCircle(17,20,5); g.fillCircle(33,32,7); g.fillCircle(22,36,3.5); tex('moon',52,52);
  // flags
  g.fillStyle(0xFF7BAC); g.fillTriangle(0,0, 26,7, 0,14); tex('flag-pink',26,14);
  g.fillStyle(0xFFD24D); g.fillTriangle(0,0, 26,7, 0,14); tex('flag-gold',26,14);
  // marshmallow
  g.fillStyle(0xFFF6E8); g.fillRoundedRect(0,0,26,20,8);
  g.fillStyle(0xFFD9E2); g.fillRoundedRect(3,3,20,6,4); tex('marshm',26,20);
  g.destroy();
};

/* ---------- world ---------- */
Art.buildSky = function(scene){
  const day = scene.add.image(0,0,'sky-day').setOrigin(0).setDisplaySize(CD.W, CD.H).setDepth(0);
  const dusk = scene.add.image(0,0,'sky-dusk').setOrigin(0).setDisplaySize(CD.W, CD.H).setDepth(1).setAlpha(0);
  const night = scene.add.image(0,0,'sky-night').setOrigin(0).setDisplaySize(CD.W, CD.H).setDepth(2).setAlpha(0);

  const stars = scene.add.container(0,0).setDepth(3).setAlpha(0);
  for (let i=0;i<46;i++){
    const s = scene.add.image(CD.rnd(10,CD.W-10), CD.rnd(10,330), 'dot')
      .setScale(CD.rnd(0.3,0.8)).setAlpha(CD.rnd(0.4,1));
    stars.add(s);
    scene.tweens.add({ targets:s, alpha:0.15, duration:CD.rnd(600,1800), yoyo:true, repeat:-1, delay:CD.rnd(0,1500) });
  }
  const sunglow = scene.add.image(0,0,'sunglow').setDepth(4).setScale(1.6);
  const sun = scene.add.image(0,0,'sun').setDepth(4);
  const moonglow = scene.add.image(0,0,'moonglow').setDepth(4).setAlpha(0);
  const moon = scene.add.image(0,0,'moon').setDepth(4).setAlpha(0);
  scene.tweens.add({ targets:[sunglow], scale:1.85, duration:1600, yoyo:true, repeat:-1 });

  return { day, dusk, night, stars, sun, sunglow, moon, moonglow };
};

Art.buildGround = function(scene){
  const g = scene.add.graphics().setDepth(5);
  // far hills
  g.fillStyle(0x9CCB8E);
  g.fillEllipse(140, CD.GROUND+30, 560, 220);
  g.fillEllipse(560, CD.GROUND+40, 700, 260);
  g.fillEllipse(900, CD.GROUND+30, 520, 200);
  // near hills
  g.fillStyle(0x84BE74);
  g.fillEllipse(320, CD.GROUND+55, 640, 190);
  g.fillEllipse(800, CD.GROUND+60, 700, 210);
  // ground slab
  g.fillStyle(C.grass); g.fillRect(0, CD.GROUND, CD.W, CD.H-CD.GROUND);
  g.fillStyle(C.grassDark);
  for (let i=0;i<14;i++) g.fillEllipse(CD.rnd(0,CD.W), CD.rnd(CD.GROUND+18, CD.H-8), CD.rnd(50,120), CD.rnd(10,20));
  // dirt path from gate
  g.fillStyle(C.dirt); g.fillEllipse(210, CD.GROUND+46, 260, 52); g.fillEllipse(420, CD.GROUND+58, 300, 44);
  g.fillStyle(0xB8905A); g.fillEllipse(300, CD.GROUND+50, 120, 24);
  // grass tufts
  g.lineStyle(2, 0x4E8C44, 1);
  for (let i=0;i<40;i++){
    const x = CD.rnd(4, CD.W-4), y = CD.rnd(CD.GROUND+6, CD.H-6);
    g.lineBetween(x, y, x-3, y-7); g.lineBetween(x, y, x+3, y-8);
  }
  // little flowers
  for (let i=0;i<12;i++){
    const x = CD.rnd(230, CD.W-10), y = CD.rnd(CD.GROUND+10, CD.H-10);
    g.fillStyle(CD.pick([0xFF7BAC, 0xFFD24D, 0xFFFFFF]), 1); g.fillCircle(x, y, 3);
    g.fillStyle(0xFFF3B0, 1); g.fillCircle(x, y, 1.3);
  }
  return g;
};

Art.buildCastle = function(scene){
  const c = scene.add.container(0,0).setDepth(CD.GROUND-2);
  const g = scene.add.graphics();
  const B = CD.GROUND + 34; // castle base sits slightly into ground band

  // main wall
  g.fillStyle(C.stone); g.fillRect(28, 318, 164, B-318);
  g.fillStyle(C.stoneDark); g.fillRect(28, 318, 164, 12);
  // crenellations
  g.fillStyle(C.stone);
  for (let i=0;i<5;i++) g.fillRect(28+i*36, 296, 22, 26);
  // stone lines
  g.lineStyle(2, C.stoneLine, 0.35);
  for (let y=344; y<B; y+=26) g.lineBetween(30, y, 190, y);
  for (let i=0;i<10;i++) g.lineBetween(CD.rnd(38,182), 344+Math.floor(CD.rnd(0,6))*26, CD.rnd(38,182)|0, 344);
  // towers
  const tower = (x)=>{
    g.fillStyle(C.stone); g.fillRect(x, 258, 52, B-258);
    g.fillStyle(C.stoneDark); g.fillRect(x, 258, 52, 10);
    g.fillStyle(C.roof); g.fillTriangle(x-9, 258, x+61, 258, x+26, 196);
    g.fillStyle(C.roofDark); g.fillTriangle(x-9, 258, x+26, 258, x+26, 196);
  };
  tower(6); tower(162);
  // gate arch frame
  g.fillStyle(C.stoneDark); g.fillRoundedRect(72, B-118, 76, 118, {tl:34, tr:34, bl:0, br:0});
  c.add(g);

  // gate (separate for shake/flash)
  const gg = scene.add.graphics();
  gg.fillStyle(C.gate); gg.fillRoundedRect(1, 2, 62, 104, {tl:28, tr:28, bl:0, br:0});
  gg.lineStyle(3, C.gateDark, 1);
  for (let i=-1;i<=1;i++) gg.lineBetween(32+i*15, 6, 32+i*15, 104);
  gg.lineBetween(3, 58, 61, 58);
  gg.fillStyle(0xE8C766); gg.fillCircle(14,74,3.4); gg.fillCircle(50,74,3.4); gg.fillCircle(14,34,3.4); gg.fillCircle(50,34,3.4);
  gg.generateTexture('gatetex', 64, 106); gg.destroy();
  const gate = scene.add.image(110, B, 'gatetex').setOrigin(0.5, 1);
  c.add(gate);

  // windows (glow at night)
  const windows = [];
  [[52,352],[110,268],[168,352],[31,290],[189,290]].forEach(p=>{
    const w = scene.add.rectangle(p[0], p[1], 15, 22, 0x39406b).setStrokeStyle(2, C.stoneLine);
    const glow = scene.add.image(p[0], p[1], 'sunglow').setScale(0.5).setAlpha(0);
    c.add(glow); c.add(w); windows.push({ w, glow });
  });

  // flags
  const flags = [];
  [[32,196,'flag-pink'],[188,196,'flag-gold'],[110,258,'flag-pink']].forEach(f=>{
    const pole = scene.add.rectangle(f[0], f[1]-16, 3, 40, 0x6D452B);
    const fl = scene.add.image(f[0]+2, f[1]-32, f[2]).setOrigin(0, 0.5);
    c.add(pole); c.add(fl); flags.push(fl);
    scene.tweens.add({ targets:fl, scaleY:0.82, scaleX:0.9, duration:CD.rnd(500,750), yoyo:true, repeat:-1, ease:'Sine.inOut' });
  });

  // anvil / forge station outside the wall
  const forge = scene.add.container(238, B-2).setDepth(CD.GROUND-1);
  const fg = scene.add.graphics();
  fg.fillStyle(0x5A5F73); fg.fillRoundedRect(-26, -26, 52, 14, 5);
  fg.fillStyle(0x464B5E); fg.fillRect(-9, -14, 18, 12);
  fg.fillStyle(0x6D452B); fg.fillRoundedRect(-20, -2, 40, 6, 3);
  forge.add(fg);
  const hammer = scene.add.text(6, -46, '🛠️', { fontSize:'26px' }).setOrigin(0.5);
  forge.add(hammer);
  scene.tweens.add({ targets:hammer, y:-52, angle:-14, duration:700, yoyo:true, repeat:-1, ease:'Sine.inOut' });

  return { c, gate, windows, flags, forge, baseY:B };
};

/* ---------- trees ---------- */
/* Rainbow canopy: two pre-coloured arc layers cross-faded by one tween. Cheaper on the iPad than
   re-drawing the graphics every frame, and it still reads as "the colors are moving". */
function rainbowCanopy(scene, c, r, cy){
  const cols = [0xFF6B6B, 0xFFB74D, 0xFFE14D, 0x6BD68A, 0x6FD3FF, 0xC77DFF];
  const layers = [];
  for (let k=0;k<2;k++){
    const g2 = scene.add.graphics();
    for (let i=0;i<4;i++){
      g2.lineStyle(r*0.30, cols[(i + k*3) % cols.length], 1);
      g2.beginPath(); g2.arc(0, cy + r*0.55, r*(1 - i*0.24), Math.PI, 0); g2.strokePath();
    }
    g2.setAlpha(k ? 0 : 1);
    c.add(g2); layers.push(g2);
  }
  scene.tweens.add({ targets:layers[1], alpha:1, duration:900, yoyo:true, repeat:-1, ease:'Sine.inOut' });
}

Art.buildTree = function(scene, spotIdx, stage){
  const spot = CD.TREE_SPOTS[spotIdx];
  const info = CD.TREE_STAGES[stage];
  const species = CD.speciesOf(spotIdx);
  const spec = CD.spec(spotIdx);
  const gy = CD.groundY(spotIdx);
  const c = scene.add.container(spot.x, gy);
  c.setDepth(gy - 1);                      // front-row plots sit lower -> draw over the back row
  const g = scene.add.graphics();
  const h = info.h, r = info.canopy;
  const L = spec.leaf, L2 = spec.leaf2, LH = spec.leafHi;
  c.add(g);

  if (stage === 0){
    g.fillStyle(C.trunk); g.fillRoundedRect(-3, -h, 6, h, 3);
    g.fillStyle(L2); g.fillCircle(-9, -h+2, 9); g.fillCircle(9, -h, 10); g.fillCircle(0, -h-8, 11);
    g.fillStyle(LH); g.fillCircle(3, -h-11, 4.5);
  } else {
    const tw = Math.max(14, r*0.34);
    g.fillStyle(C.trunkDark); g.fillRoundedRect(-tw/2-3, -h*0.62, tw+6, h*0.62, 6);
    g.fillStyle(C.trunk); g.fillRoundedRect(-tw/2, -h*0.62, tw, h*0.62, 6);
    if (species === 'candy'){
      g.fillStyle(0xFF8FD0, 0.85);          // candy-cane stripes
      for (let i=0;i<7;i++) g.fillRect(-tw/2, -h*0.6 + i*(h*0.6/7), tw, 5);
    } else {
      g.lineStyle(2, C.trunkDark, 0.5);
      g.lineBetween(-tw/4, -h*0.5, -tw/4, -12); g.lineBetween(tw/5, -h*0.42, tw/5, -20);
    }
    // roots
    g.fillStyle(C.trunk); g.fillEllipse(-tw/2-4, -2, 14, 10); g.fillEllipse(tw/2+4, -2, 14, 10);
    // canopy
    const cy = -h + r*0.5;
    if (species === 'rainbow'){
      rainbowCanopy(scene, c, r, cy);
    } else {
      g.fillStyle(L);
      g.fillCircle(-r*0.62, cy + r*0.28, r*0.62);
      g.fillCircle(r*0.62, cy + r*0.28, r*0.62);
      g.fillCircle(0, cy, r*0.8);
      if (stage === 3){
        g.fillCircle(-r*0.5, cy - r*0.55, r*0.55);
        g.fillCircle(r*0.5, cy - r*0.55, r*0.55);
        g.fillCircle(0, cy - r*0.9, r*0.62);
      }
      g.fillStyle(L2);
      g.fillCircle(-r*0.3, cy - r*0.15, r*0.5);
      g.fillCircle(r*0.34, cy - r*0.1, r*0.46);
      if (stage === 3) g.fillCircle(0, cy - r*0.75, r*0.5);
      if (species === 'candy'){                       // swirl
        g.fillStyle(LH, 0.85);
        g.fillCircle(-r*0.55, cy + r*0.1, r*0.2); g.fillCircle(r*0.5, cy + r*0.3, r*0.17);
        g.fillCircle(r*0.05, cy - r*0.35, r*0.14);
      }
      g.fillStyle(LH);
      g.fillCircle(-r*0.28, cy - (stage===3 ? r*0.95 : r*0.4), r*0.22);
      g.fillCircle(r*0.15, cy - (stage===3 ? r*1.05 : r*0.5), r*0.15);
      if (species === 'cherry'){                      // blossom dots
        g.fillStyle(0xFFFFFF, 0.9);
        [[-0.7,0.35],[0.55,0.5],[-0.15,-0.3],[0.72,-0.05],[-0.5,-0.5],[0.2,0.6]].forEach(p=>{
          g.fillCircle(r*p[0], cy + r*p[1], r*0.08 + 1.5);
        });
      }
      if (species === 'apple' && stage >= 2){         // apples
        [[-0.62,0.35],[0.6,0.3],[-0.1,-0.1],[0.32,0.62],[-0.45,-0.45]].forEach(p=>{
          g.fillStyle(spec.fruit); g.fillCircle(r*p[0], cy + r*p[1], r*0.1 + 2);
          g.fillStyle(0xFFFFFF, 0.7); g.fillCircle(r*p[0] - r*0.04, cy + r*p[1] - r*0.04, r*0.03 + 0.8);
        });
      }
    }
    // grandpa face on trunk
    if (stage === 3){
      g.fillStyle(0x4E3420);
      g.fillCircle(-6, -h*0.42, 3); g.fillCircle(8, -h*0.42, 3);
      g.lineStyle(2.5, 0x4E3420, 1);
      g.beginPath(); g.arc(1, -h*0.36, 7, 0.15*Math.PI, 0.85*Math.PI); g.strokePath();
    }
    // species trinkets on top of the canopy
    if (species === 'candy'){
      [[-0.5, 0.2], [0.45, -0.1], [0.05, 0.55]].forEach(p=>{
        c.add(Art.emoji(scene, r*p[0], cy + r*p[1], '🍬', Math.max(12, r*0.28)));
      });
    }
    if (species === 'cherry'){                        // drifting petals
      for (let i=0;i<2;i++){
        const pt = Art.emoji(scene, CD.rnd(-r*0.5, r*0.5), cy + r*0.2, '🌸', Math.max(11, r*0.22));
        c.add(pt);
        scene.tweens.add({
          targets: pt, y: -6, x: pt.x + CD.rnd(-18, 18), angle: CD.rnd(-160, 160), alpha: 0,
          duration: CD.rnd(2600, 4200), delay: CD.rnd(0, 1800), repeat: -1, ease: 'Sine.inOut'
        });
      }
    }
  }
  const w = Math.max(r*2 + 30, 70);
  c.setInteractive(new Phaser.Geom.Rectangle(-w/2, -h - r, w, h + r + 24), Phaser.Geom.Rectangle.Contains);
  c.treeData = {
    spotIdx, stage, species, hits: 0, chops: info.chops, wood: CD.woodFor(spotIdx, stage),
    h, r, canopy: info.canopy, falling: false, watered: false
  };
  return c;
};

Art.buildStump = function(scene, x, y){
  const gy = (y === undefined || y === null) ? CD.GROUND : y;
  if (!scene.textures.exists('stump')){
    const g = scene.add.graphics();
    g.fillStyle(C.trunkDark); g.fillRoundedRect(2, 6, 26, 16, 4);
    g.fillStyle(0xC69A6B); g.fillEllipse(15, 7, 24, 9);
    g.lineStyle(1.5, C.trunk, 0.8); g.strokeEllipse(15, 7, 15, 5); g.strokeEllipse(15, 7, 7, 2.5);
    g.generateTexture('stump', 30, 22);
    g.destroy();
  }
  return scene.add.image(x, gy + 8, 'stump').setOrigin(0.5, 1).setDepth(gy - 1);
};

/* ---------- garden plots ---------- */
function tilledDirt(g, faded){
  const a = faded ? 0.45 : 1;
  g.fillStyle(C.plotDark, a); g.fillEllipse(0, 2, 78, 30);
  g.fillStyle(C.plot, a);     g.fillEllipse(0, 0, 72, 26);
  g.fillStyle(C.plotLite, a * 0.9);
  g.fillEllipse(-16, -3, 22, 7); g.fillEllipse(14, 3, 26, 7); g.fillEllipse(2, -6, 16, 5);
}
function dashedRing(g, rx, ry, color, alpha){
  g.lineStyle(2, color, alpha);
  for (let i=0;i<18;i+=2){
    const a1 = (i/18) * Math.PI*2, a2 = ((i+1)/18) * Math.PI*2;
    g.lineBetween(Math.cos(a1)*rx, Math.sin(a1)*ry, Math.cos(a2)*rx, Math.sin(a2)*ry);
  }
}

Art.buildPlot = function(scene, spotIdx){
  const spot = CD.TREE_SPOTS[spotIdx];
  const gy = CD.groundY(spotIdx);
  const c = scene.add.container(spot.x, gy);
  c.setDepth(gy - 1);
  const g = scene.add.graphics();
  tilledDirt(g, false);
  dashedRing(g, 44, 17, 0xFFF3B0, 0.9);
  c.add(g);

  const hint = Art.emoji(scene, 0, -24, '🌱', 26);
  c.add(hint);
  scene.tweens.add({ targets:hint, y:-32, scale:1.18, alpha:0.7, duration:760, yoyo:true, repeat:-1, ease:'Sine.inOut' });
  scene.tweens.add({ targets:g, alpha:{ from:0.75, to:1 }, duration:900, yoyo:true, repeat:-1, ease:'Sine.inOut' });

  c.setInteractive(new Phaser.Geom.Rectangle(-46, -46, 92, 66), Phaser.Geom.Rectangle.Contains);
  c.plotIdx = spotIdx;
  return c;
};

Art.buildLockedPlot = function(scene, spotIdx){
  const spot = CD.TREE_SPOTS[spotIdx];
  const gy = CD.groundY(spotIdx);
  const c = scene.add.container(spot.x, gy);
  c.setDepth(gy - 1);
  const g = scene.add.graphics();
  tilledDirt(g, true);
  dashedRing(g, 44, 17, 0xFFFFFF, 0.35);
  c.add(g);

  const lock = Art.emoji(scene, 0, -26, '🔒', 26).setAlpha(0.95);
  c.add(lock);
  const cost = scene.add.text(0, -52, '🪵 ' + spot.cost, {
    fontFamily:'Nunito, sans-serif', fontSize:'18px', fontStyle:'900', color:'#FFF3B0',
    stroke:'#4E3420', strokeThickness:4
  }).setOrigin(0.5);
  c.add(cost);
  scene.tweens.add({ targets:lock, angle:{ from:-7, to:7 }, duration:900, yoyo:true, repeat:-1, ease:'Sine.inOut' });

  c.setInteractive(new Phaser.Geom.Rectangle(-46, -66, 92, 86), Phaser.Geom.Rectangle.Contains);
  c.plotIdx = spotIdx;
  c.costText = cost;
  return c;
};

/* ---------- characters ---------- */
/* EVERYBODY is drawn natively facing RIGHT at a positive scaleX. Art.face() then just means
   "make the sign of scaleX match dir" — which is why the knight below is a three-quarter view
   (front foot forward, eyes/nose pushed to the facing side) instead of the old face-on pose.
   Mirrored, the old one only swapped his axe hand: he moonwalked. */
Art.buildKnight = function(scene){
  const c = scene.add.container(300, CD.GROUND + 42);
  const sh = scene.add.ellipse(2, 2, 52, 12, 0x000000, 0.16);
  const g = scene.add.graphics();
  // back leg (behind him, -x, darker + shorter stride)
  g.fillStyle(0x2F638A); g.fillRoundedRect(-16, -18, 10, 18, 4);
  g.fillStyle(0x464B5E); g.fillRoundedRect(-20, -6, 15, 7, 3);
  // front leg (+x, stepping forward)
  g.fillStyle(C.tunicDark); g.fillRoundedRect(2, -19, 11, 19, 4);
  g.fillStyle(0x5A5F73); g.fillRoundedRect(1, -7, 18, 8, 3);          // front boot points right
  // body — turned: narrow at the back, chest bulging toward the facing side
  g.fillStyle(C.tunicDark); g.fillRoundedRect(-15, -50, 14, 36, 8);   // far shoulder/back
  g.fillStyle(C.tunic); g.fillRoundedRect(-9, -52, 26, 38, 10);       // near chest
  g.fillStyle(C.tunicDark); g.fillRoundedRect(-9, -26, 26, 7, 3);     // belt
  g.fillStyle(0xFFD24D); g.fillCircle(5, -22, 3.6);                   // buckle, off-centre
  // far arm tucked behind the body
  g.fillStyle(0x2F638A); g.fillRoundedRect(-15, -46, 9, 24, 4);
  // head, pushed toward the facing side
  g.fillStyle(C.skin); g.fillCircle(3, -66, 16);
  g.fillStyle(C.skin); g.fillCircle(17, -63, 4);                      // nose in profile
  g.fillStyle(0xF7B7C8); g.fillCircle(1, -60, 3.4); g.fillCircle(12, -59, 3.4);
  g.fillStyle(0xFFFFFF); g.fillCircle(6, -67, 3.4); g.fillCircle(14, -66, 3);     // eye whites
  g.fillStyle(0x3B3B4F); g.fillCircle(7.5, -67, 2.1); g.fillCircle(15, -66, 1.9); // pupils look right
  g.lineStyle(2, 0x3B3B4F, 1); g.beginPath(); g.arc(8, -61, 4.5, 0.15*Math.PI, 0.7*Math.PI); g.strokePath();
  // helmet — brim juts forward over his eyes, cheek-guard on the far side
  g.fillStyle(C.helmet); g.beginPath(); g.arc(3, -68, 17, Math.PI, 0); g.fillPath();
  g.fillRoundedRect(-13, -71, 34, 6, 3);
  g.fillRoundedRect(14, -72, 12, 6, 3);                               // forward brim
  g.fillStyle(0x9AA0B3); g.fillRoundedRect(-12, -70, 7, 12, 3);       // back neck-guard
  g.fillStyle(C.plume); g.fillCircle(-4, -86, 6); g.fillCircle(-11, -81, 5); g.fillCircle(2, -84, 4.5);
  c.add([sh, g]);

  // axe arm (near arm) — pivot unchanged so the chop swing still reads
  const arm = scene.add.container(13, -44);
  const ag = scene.add.graphics();
  ag.fillStyle(C.skin); ag.fillRoundedRect(-3, -4, 8, 22, 4);          // arm
  ag.fillStyle(0x8B5E3C); ag.fillRoundedRect(-2.5, 8, 6, 34, 3);       // handle
  ag.fillStyle(0xB9BFCF); ag.fillRoundedRect(1, 30, 16, 13, {tl:2, tr:7, br:7, bl:2}); // blade
  ag.fillStyle(0xE2E6F0); ag.fillRoundedRect(12, 31, 5, 11, 3);
  arm.add(ag);
  arm.setAngle(-150);
  c.add(arm);
  c.setDepth(c.y);
  return { c, arm, sh, gold: null };
};

/* Animated turn-around. dir: 1 = right, -1 = left. Squash to nothing, pop out mirrored.
   Tracks INTENT (__faceDir), never the live scaleX. Reading scaleX mid-tween is a trap: the turn
   passes through small values of the OLD sign, so a second turn fired during the first one reads
   "already facing that way", returns early, and the in-flight tween then finishes turning him the
   WRONG way — which is exactly how the knight ended up staring at the castle all night while the
   whole horde walked in from the right. Any in-flight turn is stopped, and the final scaleX is
   always d * base. */
Art.face = function(scene, container, dir){
  if (!container || !container.scene) return;
  const d = dir < 0 ? -1 : 1;
  if (container.__faceDir === undefined) container.__faceDir = container.scaleX < 0 ? -1 : 1;
  if (container.__faceDir === d) return;
  container.__faceDir = d;
  const base = Math.abs(container.__faceBase || container.scaleX) || 1;
  container.__faceBase = base;
  if (container.__faceTween) container.__faceTween.stop();
  CDAudio.fx.turn();
  container.__faceTween = scene.tweens.add({
    targets: container, scaleX: d * base * 0.1, duration: 60, ease: 'Sine.in',
    onComplete: () => {
      if (!container.scene) return;
      container.__faceTween = scene.tweens.add({
        targets: container, scaleX: d * base, duration: 60, ease: 'Back.out'
      });
    }
  });
};

/* Gardener Gus — small (beaver-sized), three-quarter view facing RIGHT so Art.face() reads. */
Art.buildGardener = function(scene){
  const c = scene.add.container(240, CD.GROUND + 50);
  const sh = scene.add.ellipse(1, 1, 36, 9, 0x000000, 0.14);
  const g = scene.add.graphics();
  // back leg then front leg
  g.fillStyle(0x2E6E4C); g.fillRoundedRect(-9, -13, 7, 13, 3);
  g.fillStyle(0x6D452B); g.fillRoundedRect(-12, -4, 11, 5, 2);
  g.fillStyle(C.gardDark); g.fillRoundedRect(2, -14, 7, 14, 3);
  g.fillStyle(0x8B5E3C); g.fillRoundedRect(1, -5, 13, 6, 3);
  // overalls body (turned: slim back, fuller chest toward +x)
  g.fillStyle(C.gardDark); g.fillRoundedRect(-10, -34, 10, 23, 6);
  g.fillStyle(C.gard); g.fillRoundedRect(-5, -35, 18, 24, 7);
  g.fillStyle(0xFFD24D); g.fillCircle(6, -28, 2.2);
  // head + face pushed right
  g.fillStyle(C.skin); g.fillCircle(3, -44, 10);
  g.fillStyle(C.skin); g.fillCircle(12, -42, 2.6);                    // nose
  g.fillStyle(0xF7B7C8); g.fillCircle(1, -40, 2.2); g.fillCircle(9, -39, 2.2);
  g.fillStyle(0x3B3B4F); g.fillCircle(5, -45, 1.6); g.fillCircle(10, -45, 1.4);
  g.lineStyle(1.6, 0x3B3B4F, 1); g.beginPath(); g.arc(6, -41, 3, 0.15*Math.PI, 0.75*Math.PI); g.strokePath();
  // near arm holding the can, reaching forward
  g.fillStyle(C.skin); g.fillRoundedRect(8, -32, 14, 6, 3);
  c.add([sh, g]);

  const hat = Art.emoji(scene, 2, -55, '🌻', 24);
  c.add(hat);
  scene.tweens.add({ targets:hat, angle:{ from:-8, to:8 }, duration:640, yoyo:true, repeat:-1, ease:'Sine.inOut' });

  // watering can, out front
  const can = scene.add.container(26, -28);
  const cg = scene.add.graphics();
  cg.fillStyle(C.steelDark); cg.fillRoundedRect(-8, -7, 16, 14, 4);
  cg.fillStyle(C.water); cg.fillRoundedRect(-6, -5, 12, 5, 2);
  cg.fillStyle(C.steel); cg.fillRoundedRect(-1, -5, 12, 4, 2);        // spout
  cg.fillRoundedRect(9, -8, 6, 5, 2);                                 // spout head
  cg.lineStyle(2, C.steelDark, 1); cg.beginPath(); cg.arc(-6, -3, 5, 1.1*Math.PI, 1.9*Math.PI); cg.strokePath();
  can.add(cg);
  c.add(can);
  scene.tweens.add({ targets:can, angle:{ from:-6, to:10 }, duration:520, yoyo:true, repeat:-1, ease:'Sine.inOut' });

  c.can = can;
  c.setDepth(c.y);
  return c;
};

Art.buildBeaver = function(scene){
  const c = scene.add.container(150, CD.GROUND + 55);
  const sh = scene.add.ellipse(0, 1, 34, 8, 0x000000, 0.14);
  const g = scene.add.graphics();
  g.fillStyle(C.beaverDark); g.fillEllipse(-16, -6, 20, 12);           // tail
  g.lineStyle(1.5, 0x5E3B1E, 0.7); g.lineBetween(-22, -8, -10, -4); g.lineBetween(-21, -3, -11, -7);
  g.fillStyle(C.beaver); g.fillEllipse(0, -12, 26, 22);                // body
  g.fillCircle(11, -22, 10);                                           // head
  g.fillStyle(0x7A4F2B); g.fillCircle(7, -30, 3.5); g.fillCircle(16, -30, 3.5); // ears
  g.fillStyle(0x3B2A1A); g.fillCircle(9, -23, 1.8); g.fillCircle(15, -23, 1.8);
  g.fillStyle(0x4E3420); g.fillEllipse(12.5, -19, 5, 3.5);
  g.fillStyle(0xFFFFFF); g.fillRect(10.5, -17.5, 4.5, 5);              // teeth
  g.lineStyle(1, 0xD9D9D9, 1); g.lineBetween(12.7, -17.5, 12.7, -12.5);
  c.add([sh, g]);
  c.setDepth(c.y);
  scene.tweens.add({ targets:c, angle:{from:-5, to:5}, duration:260, yoyo:true, repeat:-1, ease:'Sine.inOut' });
  return c;
};

/* ---------- zombie gear ---------- */
/* Each gear is built as its own container so detachGear can spin it off in one tween. */
function makeGear(scene, id){
  const o = scene.add.container(0, 0);
  const g = scene.add.graphics();
  if (id === 'shield'){
    o.setPosition(-24, -34);                                  // his FRONT (he walks toward -x)
    g.fillStyle(0x6E7899); g.fillCircle(0, 0, 16);
    g.fillStyle(C.steel);  g.fillCircle(0, 0, 13.5);
    g.fillStyle(0x5B79C7); g.fillCircle(0, 0, 10);
    g.fillStyle(C.gold);   g.fillCircle(0, 0, 4.5);
    g.lineStyle(3, C.gold, 1); g.lineBetween(-9, 0, 9, 0); g.lineBetween(0, -9, 0, 9);
    g.fillStyle(0xFFFFFF, 0.45); g.fillEllipse(-5, -6, 9, 5);
    o.add(g);
  } else if (id === 'helmet'){
    o.setPosition(0, -70);                                    // on his head
    g.fillStyle(0x4E5468); g.beginPath(); g.arc(0, 0, 18, Math.PI, 0); g.fillPath();
    g.fillStyle(C.steel);  g.beginPath(); g.arc(0, 0, 15, Math.PI, 0); g.fillPath();
    g.fillStyle(0x4E5468); g.fillRoundedRect(-20, -3, 40, 7, 3);   // wide brim
    g.fillStyle(0xFFFFFF); g.fillRect(-2.5, -14, 5, 10);           // white cross
    g.fillRect(-6, -11, 12, 4);
    g.fillStyle(0xFF5C5C); g.fillCircle(0, -9, 1.6);
    o.add(g);
  } else if (id === 'ladder'){
    o.setPosition(16, -34); o.setAngle(18);                   // slung over his back (+x)
    g.fillStyle(0xC9A36B); g.fillRoundedRect(-4, -30, 5, 60, 2);
    g.fillStyle(0xC9A36B); g.fillRoundedRect(9, -30, 5, 60, 2);
    g.fillStyle(0xA9743F);
    for (let i=0;i<5;i++) g.fillRect(-4, -24 + i*12, 18, 4);
    o.add(g);
  } else if (id === 'balloon'){
    o.setPosition(0, -150);                                   // floats above the lifted body
    g.lineStyle(2, 0xFFFFFF, 0.8); g.lineBetween(0, -18, 2, 2);
    g.fillStyle(0xFF5C8A); g.fillEllipse(0, -42, 40, 48);
    g.fillStyle(0xFF88AC); g.fillEllipse(-6, -50, 16, 20);
    g.fillStyle(0xFFFFFF, 0.6); g.fillEllipse(-9, -52, 8, 11);
    g.fillStyle(0xE04A76); g.fillTriangle(-5, -19, 5, -19, 0, -12);
    o.add(g);
  }
  return o;
}

Art.buildZombie = function(scene, type, gear){
  const Z = CD.ZOMBIES[type];
  const c = scene.add.container(0, 0);
  const sh = scene.add.ellipse(0, 2, 46, 11, 0x000000, 0.16);
  c.add(sh);

  /* Everything above the shadow lives in `body` so the balloon zombie can be lifted (and dropped)
     with a single tweenable y. The shadow stays on the ground — that is what sells the float. */
  const body = scene.add.container(0, 0);
  const gearObj = gear ? makeGear(scene, gear) : null;
  if (gear === 'ladder') c.add(gearObj);                      // behind him
  c.add(body);

  if (Z.king){
    const cape = scene.add.graphics();
    cape.fillStyle(0xB0413E); cape.fillRoundedRect(-8, -52, 34, 48, 8);
    cape.setAngle(10); body.add(cape);
  }
  const g = scene.add.graphics();
  // legs
  g.fillStyle(0x4E7A42); g.fillRoundedRect(-13, -14, 10, 14, 4); g.fillRoundedRect(3, -14, 10, 14, 4);
  // body
  g.fillStyle(C.zbody); g.fillRoundedRect(-16, -46, 32, 34, 9);
  g.fillStyle(C.zshirt); g.fillRoundedRect(-16, -46, 32, 16, {tl:9, tr:9, bl:0, br:0});
  g.lineStyle(2, 0x7A5BB0, 1); g.lineBetween(-6, -38, 0, -32); g.lineBetween(0, -38, -6, -32);
  // arms reaching left (toward castle)
  g.fillStyle(C.zbody);
  g.fillRoundedRect(-34, -42, 20, 7, 4); g.fillRoundedRect(-32, -30, 18, 7, 4);
  g.fillStyle(C.zdark); g.fillCircle(-33, -38.5, 4); g.fillCircle(-31, -26.5, 4);
  body.add(g);

  // head with googly eyes
  const head = scene.add.container(0, -58);
  const hg = scene.add.graphics();
  hg.fillStyle(C.zhead); hg.fillCircle(0, 0, 16);
  hg.fillStyle(C.zdark); hg.fillCircle(-14, -6, 3); // ear-wart
  hg.lineStyle(2, C.zdark, 1); hg.lineBetween(-6, 8, 6, 8);
  hg.lineBetween(-3, 6, -3, 10); hg.lineBetween(2, 6, 2, 10);
  hg.lineBetween(6, -14, 12, -10); // scar
  hg.lineBetween(8, -15, 10, -8);
  head.add(hg);
  const eyeL = scene.add.container(-6, -4);
  const eyeR = scene.add.container(7, -3);
  [eyeL, eyeR].forEach(e=>{
    const w = scene.add.circle(0, 0, 5.5, 0xFFFFFF).setStrokeStyle(1.5, C.zdark);
    const p = scene.add.circle(CD.rnd(-2,2), CD.rnd(-2,2), 2.4, 0x2B2B3B);
    e.add([w, p]); e.pupil = p; head.add(e);
  });
  if (Z.cone){
    const cone = scene.add.graphics();
    cone.fillStyle(0xF2913D); cone.fillTriangle(-11, -12, 11, -12, 0, -34);
    cone.fillStyle(0xFFFFFF); cone.fillRect(-7, -21, 14, 4);
    head.add(cone);
  }
  if (Z.king){
    const crown = scene.add.graphics();
    crown.fillStyle(0xFFD24D);
    crown.fillRect(-12, -24, 24, 8);
    crown.fillTriangle(-12, -24, -8, -24, -10, -32);
    crown.fillTriangle(-4, -24, 4, -24, 0, -34);
    crown.fillTriangle(8, -24, 12, -24, 10, -32);
    crown.fillStyle(0xE8618C); crown.fillCircle(0, -20, 2.5);
    head.add(crown);
  }
  body.add(head);

  const parts = { c, head, eyeL, eyeR, sh, body, gear: null };

  if (gearObj){
    if (gear !== 'ladder') c.add(gearObj);                    // shield / helmet / balloon in front
    if (gear === 'balloon'){
      const lift = CD.GEAR.balloon.lift;
      body.y = -lift;                                         // he FLOATS — cd-night counts on this
      parts.bobTween = scene.tweens.add({
        targets: body, y: -lift + 7, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut'
      });
      scene.tweens.add({ targets: gearObj, y: gearObj.y - 6, angle: 4, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    parts.gear = { id: gear, obj: gearObj };
  }

  c.setScale(Z.scale);
  const hw = 40, hh = gear === 'balloon' ? 84 + CD.GEAR.balloon.lift : 84;
  c.setInteractive(new Phaser.Geom.Rectangle(-hw/2 - 14, -hh, hw + 20, hh + 6), Phaser.Geom.Rectangle.Contains);
  return parts;
};

/* Gear flies off — spin + arc away + fade. Safe to call twice. Silent on purpose: cd-night knows
   whether this was a pop, a bonk or a drop, so it owns the sound. */
Art.detachGear = function(scene, parts){
  if (!parts || !parts.gear) return;
  const id = parts.gear.id, obj = parts.gear.obj;
  parts.gear = null;                                          // null FIRST — a second call no-ops
  if (parts.bobTween){ parts.bobTween.stop(); parts.bobTween = null; }
  if (id === 'balloon' && parts.body && parts.body.scene){
    scene.tweens.add({ targets: parts.body, y: 0, duration: 480, ease: 'Bounce.easeOut' });
  }
  if (obj && obj.scene){
    scene.tweens.killTweensOf(obj);
    const dir = CD.pick([-1, 1]);
    scene.tweens.add({
      targets: obj, x: obj.x + dir * CD.rnd(40, 80), y: obj.y - CD.rnd(50, 95),
      angle: CD.rnd(240, 560), scaleX: 0.6, scaleY: 0.6, alpha: 0,
      duration: 520, ease: 'Quad.out',
      onComplete: () => obj.destroy()
    });
  }
};

/* ---------- helpers ---------- */
Art.waterSplash = function(scene, x, y){
  const d = y + 20;                                           // over the thing being watered
  for (let i=0;i<7;i++){
    const drop = scene.add.circle(x + CD.rnd(-6, 6), y - 6, CD.rnd(2.5, 5),
      CD.pick([C.water, C.water2, 0xFFFFFF]), 0.95).setDepth(d);
    const tx = x + CD.rnd(-38, 38), ty = y - CD.rnd(30, 62);
    scene.tweens.add({
      targets: drop, x: tx, y: ty, duration: 250, ease: 'Quad.out',
      onComplete: () => scene.tweens.add({
        targets: drop, y: y + 4, alpha: 0, scale: 0.6, duration: 280, ease: 'Quad.in',
        onComplete: () => drop.destroy()
      })
    });
  }
  if (CD.fxSparkle) CD.fxSparkle(x, y - 28, 5);
  if (CD.fxPuff) CD.fxPuff(x, y - 4, 2);
};

Art.emoji = function(scene, x, y, char, size){
  return scene.add.text(x, y, char, { fontFamily:'sans-serif', fontSize: size + 'px' }).setOrigin(0.5);
};
})();
