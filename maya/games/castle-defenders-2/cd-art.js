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
  beaver:0x9C6B3F, beaverDark:0x7A4F2B
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
Art.buildTree = function(scene, spotIdx, stage){
  const spot = CD.TREE_SPOTS[spotIdx];
  const info = CD.TREE_STAGES[stage];
  const c = scene.add.container(spot.x, CD.GROUND + 6);
  c.setDepth(CD.GROUND - 1);
  const g = scene.add.graphics();
  const h = info.h, r = info.canopy;

  if (stage === 0){
    g.fillStyle(C.trunk); g.fillRoundedRect(-3, -h, 6, h, 3);
    g.fillStyle(C.leaf2); g.fillCircle(-9, -h+2, 9); g.fillCircle(9, -h, 10); g.fillCircle(0, -h-8, 11);
    g.fillStyle(C.leafHi); g.fillCircle(3, -h-11, 4.5);
  } else {
    const tw = Math.max(14, r*0.34);
    g.fillStyle(C.trunkDark); g.fillRoundedRect(-tw/2-3, -h*0.62, tw+6, h*0.62, 6);
    g.fillStyle(C.trunk); g.fillRoundedRect(-tw/2, -h*0.62, tw, h*0.62, 6);
    g.lineStyle(2, C.trunkDark, 0.5);
    g.lineBetween(-tw/4, -h*0.5, -tw/4, -12); g.lineBetween(tw/5, -h*0.42, tw/5, -20);
    // roots
    g.fillStyle(C.trunk); g.fillEllipse(-tw/2-4, -4, 14, 10); g.fillEllipse(tw/2+4, -4, 14, 10);
    // canopy
    const cy = -h + r*0.5;
    g.fillStyle(C.leaf);
    g.fillCircle(-r*0.62, cy + r*0.28, r*0.62);
    g.fillCircle(r*0.62, cy + r*0.28, r*0.62);
    g.fillCircle(0, cy, r*0.8);
    if (stage === 3){
      g.fillCircle(-r*0.5, cy - r*0.55, r*0.55);
      g.fillCircle(r*0.5, cy - r*0.55, r*0.55);
      g.fillCircle(0, cy - r*0.9, r*0.62);
    }
    g.fillStyle(C.leaf2);
    g.fillCircle(-r*0.3, cy - r*0.15, r*0.5);
    g.fillCircle(r*0.34, cy - r*0.1, r*0.46);
    if (stage === 3) g.fillCircle(0, cy - r*0.75, r*0.5);
    g.fillStyle(C.leafHi);
    g.fillCircle(-r*0.28, cy - (stage===3 ? r*0.95 : r*0.4), r*0.22);
    g.fillCircle(r*0.15, cy - (stage===3 ? r*1.05 : r*0.5), r*0.15);
    // grandpa face on trunk
    if (stage === 3){
      g.fillStyle(0x4E3420);
      g.fillCircle(-6, -h*0.42, 3); g.fillCircle(8, -h*0.42, 3);
      g.lineStyle(2.5, 0x4E3420, 1);
      g.beginPath(); g.arc(1, -h*0.36, 7, 0.15*Math.PI, 0.85*Math.PI); g.strokePath();
    }
  }
  c.add(g);
  const w = Math.max(r*2 + 30, 70);
  c.setInteractive(new Phaser.Geom.Rectangle(-w/2, -h - r, w, h + r + 24), Phaser.Geom.Rectangle.Contains);
  c.treeData = { spotIdx, stage, hits: 0, chops: info.chops, wood: info.wood, h, r };
  return c;
};

Art.buildStump = function(scene, x){
  if (!scene.textures.exists('stump')){
    const g = scene.add.graphics();
    g.fillStyle(C.trunkDark); g.fillRoundedRect(2, 6, 26, 16, 4);
    g.fillStyle(0xC69A6B); g.fillEllipse(15, 7, 24, 9);
    g.lineStyle(1.5, C.trunk, 0.8); g.strokeEllipse(15, 7, 15, 5); g.strokeEllipse(15, 7, 7, 2.5);
    g.generateTexture('stump', 30, 22);
    g.destroy();
  }
  return scene.add.image(x, CD.GROUND + 8, 'stump').setOrigin(0.5, 1).setDepth(CD.GROUND - 1);
};

/* ---------- characters ---------- */
Art.buildKnight = function(scene){
  const c = scene.add.container(300, CD.GROUND + 42);
  const sh = scene.add.ellipse(0, 2, 52, 12, 0x000000, 0.16);
  const g = scene.add.graphics();
  // legs
  g.fillStyle(C.tunicDark); g.fillRoundedRect(-13, -18, 11, 18, 4); g.fillRoundedRect(2, -18, 11, 18, 4);
  g.fillStyle(0x5A5F73); g.fillRoundedRect(-15, -6, 15, 7, 3); g.fillRoundedRect(1, -6, 15, 7, 3);
  // body
  g.fillStyle(C.tunic); g.fillRoundedRect(-17, -52, 34, 38, 10);
  g.fillStyle(C.tunicDark); g.fillRoundedRect(-17, -26, 34, 7, 3);
  g.fillStyle(0xFFD24D); g.fillCircle(0, -22, 3.6);
  // head
  g.fillStyle(C.skin); g.fillCircle(0, -66, 16);
  g.fillStyle(0xF7B7C8); g.fillCircle(-9, -61, 3.4); g.fillCircle(9, -61, 3.4);
  g.fillStyle(0x3B3B4F); g.fillCircle(-5.5, -66, 2.2); g.fillCircle(5.5, -66, 2.2);
  g.lineStyle(2, 0x3B3B4F, 1); g.beginPath(); g.arc(0, -62, 4.5, 0.2*Math.PI, 0.8*Math.PI); g.strokePath();
  // helmet
  g.fillStyle(C.helmet); g.beginPath(); g.arc(0, -68, 17, Math.PI, 0); g.fillPath();
  g.fillRoundedRect(-19, -70, 38, 6, 3);
  g.fillStyle(C.plume); g.fillCircle(0, -86, 6); g.fillCircle(-6, -83, 4.5); g.fillCircle(6, -83, 4.5);
  c.add([sh, g]);

  // axe arm
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

Art.buildZombie = function(scene, type){
  const Z = CD.ZOMBIES[type];
  const c = scene.add.container(0, 0);
  const sh = scene.add.ellipse(0, 2, 46, 11, 0x000000, 0.16);
  c.add(sh);

  if (Z.king){
    const cape = scene.add.graphics();
    cape.fillStyle(0xB0413E); cape.fillRoundedRect(-8, -52, 34, 48, 8);
    cape.setAngle(10); c.add(cape);
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
  c.add(g);

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
  c.add(head);

  c.setScale(Z.scale);
  const hw = 40, hh = 84;
  c.setInteractive(new Phaser.Geom.Rectangle(-hw/2 - 14, -hh, hw + 20, hh + 6), Phaser.Geom.Rectangle.Contains);
  return { c, head, eyeL, eyeR, sh };
};

/* ---------- helpers ---------- */
Art.emoji = function(scene, x, y, char, size){
  return scene.add.text(x, y, char, { fontFamily:'sans-serif', fontSize: size + 'px' }).setOrigin(0.5);
};
})();
