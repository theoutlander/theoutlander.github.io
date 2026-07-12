// ════════════════════════════════════════════════════════════
//  MAYA'S SEWING MUSEUM — world builder v2 (Babylon.js)
//  3 rooms + secret room · pedestals & ghosts · Maya doll · visitors
// ════════════════════════════════════════════════════════════
/* global BABYLON, MUSEUM_ITEMS, MUSEUM_ROOMS, SECRET_EXHIBIT */

// ── tiny helpers ──────────────────────────────────────────────
function mwColor(hex){
  const n = parseInt(hex.slice(1),16);
  return new BABYLON.Color3(((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255);
}
function mwCanvasTexture(scene, w, h, draw){
  const dt = new BABYLON.DynamicTexture('dt', {width:w, height:h}, scene, true);
  dt.hasAlpha = true;
  const ctx = dt.getContext();
  ctx.clearRect(0,0,w,h);
  draw(ctx, w, h);
  dt.update();
  return dt;
}
function mwSpriteMat(scene, dt){
  const m = new BABYLON.StandardMaterial('sprite', scene);
  m.diffuseTexture = dt;
  m.emissiveTexture = dt;
  m.emissiveColor = BABYLON.Color3.White();
  m.disableLighting = true;
  m.useAlphaFromDiffuseTexture = true;
  m.backFaceCulling = false;
  m.specularColor = BABYLON.Color3.Black();
  m.mwNoGlow = true;
  return m;
}
function mwEmojiTexture(scene, emoji, px, ghost){
  const size = px || 256;
  return mwCanvasTexture(scene, size, size, (ctx)=>{
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (ghost){
      ctx.globalAlpha = 0.26;
      ctx.font = Math.round(size*0.76)+'px sans-serif';
      ctx.fillText(emoji, size/2, size/2 + size*0.04);
      ctx.globalAlpha = 1;
      ctx.font = Math.round(size*0.3)+'px sans-serif';
      ctx.fillText('🔒', size*0.72, size*0.78);
    } else {
      ctx.font = Math.round(size*0.76)+'px sans-serif';
      ctx.fillText(emoji, size/2, size/2 + size*0.04);
    }
  });
}
function mwFlatMat(scene, hex, opts){
  const m = new BABYLON.StandardMaterial('flat', scene);
  m.diffuseColor = mwColor(hex);
  m.specularColor = new BABYLON.Color3(0.03,0.03,0.05);
  if (opts && opts.emissive) m.emissiveColor = mwColor(opts.emissive);
  return m;
}
function mwGlowMat(scene, hex, dim){
  const m = new BABYLON.StandardMaterial('glow', scene);
  const c = mwColor(hex);
  m.emissiveColor = dim ? c.scale(dim) : c;
  m._baseEm = m.emissiveColor.clone();
  m.diffuseColor = BABYLON.Color3.Black();
  m.specularColor = BABYLON.Color3.Black();
  return m;
}
function mwBlobShadow(scene, r, parent){
  const disc = BABYLON.MeshBuilder.CreateDisc('shadow', {radius:r, tessellation:24}, scene);
  disc.rotation.x = Math.PI/2;
  disc.position.y = 0.02;
  const dt = mwCanvasTexture(scene, 128, 128, (ctx)=>{
    const g = ctx.createRadialGradient(64,64,4, 64,64,62);
    g.addColorStop(0,'rgba(0,0,0,0.42)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,128,128);
  });
  disc.material = mwSpriteMat(scene, dt);
  disc.isPickable = false;
  if (parent) disc.parent = parent;
  return disc;
}

// ── LAYOUT ───────────────────────────────────────────────────
const MW = {
  WH: 4.0,                                     // wall height
  rooms: {
    fancy:  { x0:-14, x1:14,  z0:-10, z1:10 },
    cozy:   { x0:-34, x1:-14, z0:-8,  z1:8  },
    vault:  { x0:14,  x1:24,  z0:-5,  z1:5  },
    secret: { x0:-29, x1:-21, z0:-16, z1:-8 },
  },
  doors: {
    entry: { x:0,   z:10, axis:'z', a:'fancy', b:'outside' },
    cf:    { x:-14, z:0,  axis:'x', a:'fancy', b:'cozy'    },
    fv:    { x:14,  z:0,  axis:'x', a:'fancy', b:'vault'   },
    cs:    { x:-25, z:-8, axis:'z', a:'cozy',  b:'secret'  },
  },
  walls: [
    // fancy
    { cx:-7.95, cz:10,  w:12.1, d:0.5 }, { cx:7.95, cz:10, w:12.1, d:0.5 },
    { cx:0,     cz:-10, w:28.5, d:0.5 },
    { cx:-14, cz:5.75,  w:0.5, d:8.5 }, { cx:-14, cz:-5.75, w:0.5, d:8.5 },
    { cx:14,  cz:5.65,  w:0.5, d:8.7 }, { cx:14,  cz:-5.65, w:0.5, d:8.7 },
    // cozy
    { cx:-34, cz:0, w:0.5, d:16.5 },
    { cx:-24, cz:8, w:20.5, d:0.5 },
    { cx:-30.175, cz:-8, w:8.15, d:0.5 }, { cx:-18.825, cz:-8, w:10.15, d:0.5 },
    // vault
    { cx:24, cz:0, w:0.5, d:10.5 },
    { cx:19, cz:5, w:10.5, d:0.5 }, { cx:19, cz:-5, w:10.5, d:0.5 },
    // secret
    { cx:-29, cz:-12, w:0.5, d:8.5 }, { cx:-21, cz:-12, w:0.5, d:8.5 },
    { cx:-25, cz:-16, w:8.5, d:0.5 },
  ],
  // pedestal spots by item key
  spots: {
    cap:{x:-32.6,z:-4}, scarf:{x:-32.6,z:0}, socks:{x:-32.6,z:4},
    mittens:{x:-30,z:6.6}, boots:{x:-25,z:6.6}, coat:{x:-20,z:6.6},
    sunhat:{x:-17.2,z:-6.6},
    umbrella:{x:-12.8,z:6}, bow:{x:-12.8,z:-6},
    glasses:{x:12.8,z:6}, watch:{x:12.8,z:-6}, bag:{x:0,z:-8.6},
    dress:{x:-2.1,z:0}, teddy:{x:2.1,z:0},
    crown:{x:17.9,z:0}, ring:{x:20.1,z:0},
  },
};

// ── room shells ──────────────────────────────────────────────
function mwBuildRooms(scene){
  const bulbMats = ['#ff6eb4','#ffe14d','#5dffb0','#5bc8ff','#c77dff','#ff9a3c']
    .map(c=> mwGlowMat(scene, c));
  let bulbIdx = 0;

  // plank floor texture — fresh DynamicTexture per ground (clones never become ready)
  function makePlanks(){
    const t = mwCanvasTexture(scene, 512, 512, (ctx,w,h)=>{
      ctx.fillStyle = '#261645'; ctx.fillRect(0,0,w,h);
      const plank = 64;
      for (let x=0; x<w; x+=plank){
        ctx.fillStyle = (x/plank)%2 ? '#29184a' : '#241543';
        ctx.fillRect(x,0,plank-3,h);
        ctx.fillStyle = '#1a0f33'; ctx.fillRect(x+plank-3,0,3,h);
        ctx.fillStyle = '#1d1138';
        let y = ((x/plank)%3)*140+60;
        while (y<h){ ctx.fillRect(x, y, plank-3, 3); y += 420; }
      }
    });
    t.hasAlpha = false;
    t.wrapU = t.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    return t;
  }

  function ground(cx, cz, w, d){
    const g = BABYLON.MeshBuilder.CreateGround('g', {width:w, height:d}, scene);
    g.position.set(cx, 0, cz);
    const m = new BABYLON.StandardMaterial('gm', scene);
    const t = makePlanks(); t.uScale = w/8; t.vScale = d/8;
    m.diffuseTexture = t;
    m.specularColor = new BABYLON.Color3(0.05,0.04,0.09);
    g.material = m; g.isPickable = false;
    return g;
  }
  for (const k in MW.rooms){
    const r = MW.rooms[k];
    ground((r.x0+r.x1)/2, (r.z0+r.z1)/2, r.x1-r.x0, r.z1-r.z0);
  }
  ground(0, 12, 7, 4); // porch

  // welcome mat
  const mat = BABYLON.MeshBuilder.CreateGround('mat', {width:3, height:1.7}, scene);
  mat.position.set(0, 0.015, 11.2);
  mat.material = mwSpriteMat(scene, mwCanvasTexture(scene, 256, 144, (ctx,w,h)=>{
    ctx.fillStyle = '#8e3d6e'; ctx.beginPath(); ctx.roundRect(4,4,w-8,h-8,16); ctx.fill();
    ctx.fillStyle = '#ffd0e8'; ctx.font = '900 44px Nunito, sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('welcome!', w/2, h/2+2);
  }));
  mat.isPickable = false;

  // walls
  const wallM = mwFlatMat(scene, '#31205c');
  wallM.emissiveColor = mwColor('#120a26');
  const stripM = mwGlowMat(scene, '#8a68ff', 0.45);
  const walls = MW.walls.map(wd=>{
    const b = BABYLON.MeshBuilder.CreateBox('wall', {width:wd.w, height:MW.WH, depth:wd.d}, scene);
    b.position.set(wd.cx, MW.WH/2, wd.cz);
    b.material = wallM.clone('wm');
    b.material.mwNoGlow = true;
    b.isPickable = false;
    // glowing top edge (dollhouse cut line)
    const strip = BABYLON.MeshBuilder.CreateBox('strip', {width:wd.w+0.04, height:0.07, depth:wd.d+0.04}, scene);
    strip.position.set(wd.cx, MW.WH+0.03, wd.cz);
    strip.material = stripM; strip.isPickable = false;
    return {
      mesh: b, strip,
      aabb: { x0: wd.cx-wd.w/2, x1: wd.cx+wd.w/2, z0: wd.cz-wd.d/2, z1: wd.cz+wd.d/2 },
    };
  });

  // door frames
  const frames = { cf:'#5bc8ff', fv:'#ffe14d', entry:'#ff6eb4' };
  for (const key in frames){
    const d = MW.doors[key];
    const fm = mwGlowMat(scene, frames[key], 0.85);
    const gapHalf = key==='entry' ? 1.9 : (key==='fv' ? 1.3 : 1.5);
    for (const s of [-1,1]){
      const post = BABYLON.MeshBuilder.CreateBox('post', {
        width: d.axis==='z' ? 0.16 : 0.6,
        height: 3.3,
        depth: d.axis==='z' ? 0.6 : 0.16 }, scene);
      post.position.set(
        d.x + (d.axis==='z' ? s*gapHalf : 0), 1.65,
        d.z + (d.axis==='x' ? s*gapHalf : 0));
      post.material = fm; post.isPickable = false;
    }
    const lintel = BABYLON.MeshBuilder.CreateBox('lintel', {
      width: d.axis==='z' ? gapHalf*2+0.16 : 0.6,
      height: 0.16,
      depth: d.axis==='x' ? gapHalf*2+0.16 : 0.6 }, scene);
    lintel.position.set(d.x, 3.3, d.z);
    lintel.material = fm; lintel.isPickable = false;
  }

  // fairy-light bulbs around each room perimeter
  function bulbRun(x0,z0,x1,z1,n){
    for (let i=0;i<=n;i++){
      const t = i/n;
      const b = BABYLON.MeshBuilder.CreateSphere('bulb', {diameter:0.13, segments:8}, scene);
      b.position.set(x0+(x1-x0)*t, 3.55 + Math.sin(i*1.7)*0.1, z0+(z1-z0)*t);
      b.material = bulbMats[bulbIdx++ % bulbMats.length];
      b.isPickable = false;
    }
  }
  for (const k in MW.rooms){
    const r = MW.rooms[k], m = 0.45;
    const nx = Math.round((r.x1-r.x0)/2.6), nz = Math.round((r.z1-r.z0)/2.6);
    bulbRun(r.x0+m, r.z0+m, r.x1-m, r.z0+m, nx);
    bulbRun(r.x0+m, r.z1-m, r.x1-m, r.z1-m, nx);
    bulbRun(r.x0+m, r.z0+m, r.x0+m, r.z1-m, nz);
    bulbRun(r.x1-m, r.z0+m, r.x1-m, r.z1-m, nz);
  }

  return { walls, bulbMats, stripM };
}

// ── signs, plaques, art ──────────────────────────────────────
function mwChipTexture(scene, text, bg, fg, font){
  return mwCanvasTexture(scene, 768, 192, (ctx,w,h)=>{
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.roundRect(6,6,w-12,h-12,40); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.setLineDash([16,12]); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(18,18,w-36,h-36,28); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = fg;
    ctx.font = font || '900 74px "Fredoka One", Nunito, sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(text, w/2, h/2+4);
  });
}
function mwPlaque(scene, text, x, y, z, rotY, wpx, bg, fg){
  const p = BABYLON.MeshBuilder.CreatePlane('plaque', {width:wpx||3.4, height:(wpx||3.4)*0.25}, scene);
  p.position.set(x, y, z);
  p.rotation.y = rotY;
  p.material = mwSpriteMat(scene, mwChipTexture(scene, text, bg||'#ff6eb4', fg||'#3a0f28'));
  p.isPickable = false;
  return p;
}
function mwArt(scene, emoji, x, y, z, rotY, size){
  const root = new BABYLON.TransformNode('art', scene);
  root.position.set(x, y, z);
  root.rotation.y = rotY;
  const s = size || 1.6;
  const frame = BABYLON.MeshBuilder.CreateBox('fr', {width:s, height:s, depth:0.1}, scene);
  frame.material = mwGlowMat(scene, '#c77dff', 0.5);
  frame.parent = root; frame.isPickable = false;
  const inner = BABYLON.MeshBuilder.CreateBox('fi', {width:s*0.86, height:s*0.86, depth:0.12}, scene);
  inner.material = mwFlatMat(scene, '#1a0f33');
  inner.parent = root; inner.isPickable = false;
  const pic = BABYLON.MeshBuilder.CreatePlane('pic', {size:s*0.72}, scene);
  pic.position.z = 0.075;      // room-facing side of the backing
  pic.rotation.y = Math.PI;    // readable face (-z) turned to point into the room
  pic.material = mwSpriteMat(scene, mwEmojiTexture(scene, emoji, 128));
  pic.parent = root; pic.isPickable = false;
}

function mwBuildSignage(scene, ownerName){
  const name = (ownerName || 'MAYA').toUpperCase().slice(0, 12);
  // big sign outside above entry (faces +z, toward arriving visitors)
  const sign = BABYLON.MeshBuilder.CreatePlane('bigsign', {width:6.8, height:1.7}, scene);
  sign.position.set(0, 4.6, 10.4);
  sign.rotation.y = Math.PI;   // readable face = local -z → point it at +z (arriving visitors)
  sign.material = mwSpriteMat(scene, mwChipTexture(scene, `✨ ${name}'S MUSEUM ✨`, '#ff6eb4', '#3a0f28'));
  sign.isPickable = false;
  // inside version above entry (faces -z into fancy hall)
  mwPlaque(scene, `✨ ${name}'S MUSEUM ✨`, 0, 4.5, 9.7, 0, 6.2, '#ff6eb4', '#3a0f28');

  // room plaques over doors — text = the room you're walking INTO
  mwPlaque(scene, 'Cozy Wear 🧣',      -13.6, 3.8, 0, -Math.PI/2, 3.6, '#5bc8ff', '#0e2a4a'); // seen from fancy
  mwPlaque(scene, 'Fancy Things ✨',   -14.4, 3.8, 0,  Math.PI/2, 3.6, '#c77dff', '#2a0e4a'); // seen from cozy
  mwPlaque(scene, 'Treasure Vault 👑',  13.6, 3.8, 0,  Math.PI/2, 3.8, '#ffe14d', '#4a3a0e'); // seen from fancy
  mwPlaque(scene, 'Fancy Things ✨',    14.4, 3.8, 0, -Math.PI/2, 3.6, '#c77dff', '#2a0e4a'); // seen from vault

  // wall art
  mwArt(scene, '🌈', -7, 2.9, -9.69, 0, 1.6);
  mwArt(scene, '⭐',  7, 2.9, -9.69, 0, 1.6);
  mwArt(scene, '🧵', -8, 2.9,  9.69, Math.PI, 1.6);
  mwArt(scene, '❤️', -28, 2.9, 7.69, Math.PI, 1.5);
  mwArt(scene, '✂️', -18, 2.9, -7.69, 0, 1.5);
  mwArt(scene, '🏆', 23.69, 2.9, 0, -Math.PI/2, 1.5);
  mwArt(scene, '🌈', -25, 2.6, -15.69, 0, 2.3);   // secret room rainbow
}

// ── dais + rugs ──────────────────────────────────────────────
function mwBuildDais(scene){
  function dais(x, z, dia, ringHex){
    const d = BABYLON.MeshBuilder.CreateCylinder('dais', {diameter:dia, height:0.34, tessellation:48}, scene);
    d.position.set(x, 0.17, z);
    d.material = mwFlatMat(scene, '#3a2360', {emissive:'#160d2c'});
    d.isPickable = false;
    const ring = BABYLON.MeshBuilder.CreateTorus('dring', {diameter:dia-0.05, thickness:0.09, tessellation:48}, scene);
    ring.position.set(x, 0.34, z);
    ring.material = mwGlowMat(scene, ringHex, 0.8);
    ring.isPickable = false;
  }
  dais(0, 0, 6.4, '#c77dff');     // fancy
  dais(19, 0, 4.4, '#ffe14d');    // vault

  const crug = BABYLON.MeshBuilder.CreateDisc('crug', {radius:4.4, tessellation:48}, scene);
  crug.rotation.x = Math.PI/2; crug.position.set(0, 0.012, 0);
  crug.material = mwSpriteMat(scene, mwCanvasTexture(scene, 512, 512, (ctx,w,h)=>{
    ctx.fillStyle = '#432a72';
    ctx.beginPath(); ctx.arc(w/2,h/2,w/2-4,0,7); ctx.fill();
    ctx.strokeStyle = '#c77dff'; ctx.setLineDash([20,14]); ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(w/2,h/2,w/2-26,0,7); ctx.stroke();
  }));
  crug.isPickable = false;

  // runner from entry to dais
  const rug = BABYLON.MeshBuilder.CreateGround('rug', {width:3.2, height:5.6}, scene);
  rug.position.set(0, 0.015, 6.8);
  rug.material = mwSpriteMat(scene, mwCanvasTexture(scene, 256, 448, (ctx,w,h)=>{
    ctx.fillStyle = '#8e3d6e'; ctx.beginPath(); ctx.roundRect(0,0,w,h,26); ctx.fill();
    ctx.strokeStyle = '#ffb3d9'; ctx.setLineDash([16,12]); ctx.lineWidth = 6;
    ctx.beginPath(); ctx.roundRect(14,14,w-28,h-28,18); ctx.stroke();
  }));
  rug.isPickable = false;
}

// ── pedestal factory ─────────────────────────────────────────
function mwPedestal(scene, item, spot, idx, unlocked){
  const root = new BABYLON.TransformNode('ped-'+item.key, scene);
  const onDais = item.dais || item.treasure;
  const baseY = onDais ? 0.34 : 0;
  root.position.set(spot.x, baseY, spot.z);

  const h = item.treasure ? 1.5 : 1.15;
  const colM = unlocked ? mwFlatMat(scene, '#8f7cc7', {emissive:'#2b1b52'})
                        : mwFlatMat(scene, '#4e4666', {emissive:'#17132a'});
  const topM = unlocked ? mwFlatMat(scene, '#cabcf0', {emissive:'#40306e'})
                        : mwFlatMat(scene, '#5e5678', {emissive:'#201a38'});
  const col = BABYLON.MeshBuilder.CreateCylinder('col', {diameterTop:1.05, diameterBottom:1.35, height:h, tessellation:20}, scene);
  col.position.y = h/2; col.material = colM; col.parent = root; col.isPickable = false;
  const top = BABYLON.MeshBuilder.CreateCylinder('top', {diameter:1.3, height:0.12, tessellation:20}, scene);
  top.position.y = h+0.06; top.material = topM; top.parent = root; top.isPickable = false;

  const ring = BABYLON.MeshBuilder.CreateTorus('ring', {diameter:1.95, thickness:0.07, tessellation:32}, scene);
  ring.position.y = 0.06;
  ring.material = unlocked ? mwGlowMat(scene, item.color, 0.9) : mwGlowMat(scene, '#55506e', 0.5);
  ring.parent = root; ring.isPickable = false;

  if (unlocked){
    const pool = BABYLON.MeshBuilder.CreateDisc('pool', {radius:1.35, tessellation:28}, scene);
    pool.rotation.x = Math.PI/2; pool.position.y = 0.03;
    pool.material = mwSpriteMat(scene, mwCanvasTexture(scene, 128, 128, (ctx)=>{
      const g = ctx.createRadialGradient(64,64,6, 64,64,62);
      g.addColorStop(0, item.color+'55'); g.addColorStop(1, item.color+'00');
      ctx.fillStyle = g; ctx.fillRect(0,0,128,128);
    }));
    pool.parent = root; pool.isPickable = false;
  }

  const itemY = h + 1.05;
  const plane = BABYLON.MeshBuilder.CreatePlane('item', {size: item.treasure ? 1.7 : 1.5}, scene);
  plane.position.y = itemY;
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
  plane.material = mwSpriteMat(scene, mwEmojiTexture(scene, item.emoji, 256, !unlocked));
  plane.parent = root; plane.isPickable = false;

  const tag = BABYLON.MeshBuilder.CreatePlane('tag', {width:1.0, height:0.44}, scene);
  tag.position.y = h + 0.34;
  tag.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
  tag.material = mwSpriteMat(scene, mwCanvasTexture(scene, 256, 112, (ctx,w,hh)=>{
    ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.94)' : 'rgba(120,115,150,0.85)';
    ctx.beginPath(); ctx.roundRect(4,4,w-8,hh-8,54); ctx.fill();
    ctx.fillStyle = unlocked ? '#3a2360' : '#2a2440';
    ctx.font = '900 54px Nunito, sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(unlocked ? (item.price+' 🪙') : '🔒 not yet', w/2, hh/2+4);
  }));
  tag.parent = root; tag.isPickable = false;

  const pick = BABYLON.MeshBuilder.CreateCylinder('pick', {diameter:2.1, height:h+2.4, tessellation:10}, scene);
  pick.position.y = (h+2.4)/2;
  pick.visibility = 0; pick.isPickable = true;
  pick.parent = root;
  pick.mwPedIndex = idx;

  return { item, x:spot.x, z:spot.z, root, plane, ring, tag, pick,
           itemBaseY:itemY, treasure:!!item.treasure, dais:onDais,
           ghost:!unlocked, phase: idx*0.7, sales:0 };
}

// ── secret room extras ───────────────────────────────────────
function mwBuildSecret(scene){
  // Maya's First Stitch — special exhibit
  const root = new BABYLON.TransformNode('secretPed', scene);
  root.position.set(-25, 0, -12);
  const col = BABYLON.MeshBuilder.CreateCylinder('col', {diameterTop:1.05, diameterBottom:1.4, height:1.3, tessellation:20}, scene);
  col.position.y = 0.65;
  col.material = mwFlatMat(scene, '#a04f7f', {emissive:'#3c1230'});
  col.parent = root; col.isPickable = false;
  const ring = BABYLON.MeshBuilder.CreateTorus('ring', {diameter:2.2, thickness:0.09, tessellation:32}, scene);
  ring.position.y = 0.06;
  ring.material = mwGlowMat(scene, '#ff6eb4');
  ring.parent = root; ring.isPickable = false;
  const plane = BABYLON.MeshBuilder.CreatePlane('item', {size:1.9}, scene);
  plane.position.y = 2.45;
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
  plane.material = mwSpriteMat(scene, mwEmojiTexture(scene, SECRET_EXHIBIT.emoji, 256));
  plane.parent = root; plane.isPickable = false;
  const tag = BABYLON.MeshBuilder.CreatePlane('tag', {width:1.5, height:0.5}, scene);
  tag.position.y = 1.62;
  tag.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
  tag.material = mwSpriteMat(scene, mwCanvasTexture(scene, 384, 128, (ctx,w,h)=>{
    ctx.fillStyle = 'rgba(255,225,77,0.95)';
    ctx.beginPath(); ctx.roundRect(4,4,w-8,h-8,60); ctx.fill();
    ctx.fillStyle = '#4a3a0e';
    ctx.font = '900 52px Nunito, sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('priceless! ✨', w/2, h/2+4);
  }));
  tag.parent = root; tag.isPickable = false;
  const pick = BABYLON.MeshBuilder.CreateCylinder('pick', {diameter:2.2, height:3.6, tessellation:10}, scene);
  pick.position.y = 1.8; pick.visibility = 0; pick.isPickable = true;
  pick.parent = root; pick.mwSecretExhibit = true;

  // sparkle fountain
  const ps = new BABYLON.ParticleSystem('fountain', 90, scene);
  ps.particleTexture = mwCanvasTexture(scene, 32, 32, (ctx)=>{
    const g = ctx.createRadialGradient(16,16,1, 16,16,15);
    g.addColorStop(0,'rgba(255,255,255,0.95)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,32,32);
  });
  ps.emitter = new BABYLON.Vector3(-25, 2.6, -12);
  ps.minEmitBox = new BABYLON.Vector3(-0.2, 0, -0.2);
  ps.maxEmitBox = new BABYLON.Vector3(0.2, 0.2, 0.2);
  ps.color1 = new BABYLON.Color4(1, 0.6, 0.85, 0.9);
  ps.color2 = new BABYLON.Color4(1, 0.9, 0.5, 0.9);
  ps.colorDead = new BABYLON.Color4(1, 1, 1, 0);
  ps.minSize = 0.06; ps.maxSize = 0.16;
  ps.minLifeTime = 0.8; ps.maxLifeTime = 1.6;
  ps.emitRate = 26;
  ps.direction1 = new BABYLON.Vector3(-0.8, 2.2, -0.8);
  ps.direction2 = new BABYLON.Vector3(0.8, 3.2, 0.8);
  ps.minEmitPower = 0.8; ps.maxEmitPower = 1.4;
  ps.gravity = new BABYLON.Vector3(0, -3.4, 0);
  ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
  ps.start();

  // tapestry hiding the doorway (in the cozy south wall gap)
  const tap = BABYLON.MeshBuilder.CreatePlane('tapestry', {width:2.5, height:3.3}, scene);
  tap.position.set(-25, 1.65, -7.72);
  tap.rotation.y = Math.PI;    // readable face toward cozy room (+z)
  tap.material = mwSpriteMat(scene, mwCanvasTexture(scene, 256, 340, (ctx,w,h)=>{
    ctx.fillStyle = '#432a72';
    ctx.beginPath(); ctx.roundRect(2,2,w-4,h-4,10); ctx.fill();
    ctx.strokeStyle = '#c77dff'; ctx.setLineDash([12,10]); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(14,14,w-28,h-28,8); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '54px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('🧵', w/2, h*0.34);
    ctx.globalAlpha = 0.5;
    ctx.font = '900 64px Nunito, sans-serif';
    ctx.fillStyle = '#ffd0e8';
    ctx.fillText('?', w/2, h*0.62);
    ctx.globalAlpha = 1;
    ctx.font = '26px sans-serif';
    ctx.fillText('✨', w*0.22, h*0.82);
    ctx.fillText('✨', w*0.78, h*0.86);
  }));
  tap.isPickable = true;
  tap.mwTapestry = true;

  return {
    pedRoot: root, pedPlane: plane, pick,
    tapestry: tap,
    tapestryAabb: { x0:-26.3, x1:-23.7, z0:-8.35, z1:-7.65 },
  };
}

// ── MAYA (the 3D doll) ───────────────────────────────────────
function mwMakeMaya(scene){
  const root = new BABYLON.TransformNode('maya', scene);
  const body = new BABYLON.TransformNode('mayaBody', scene); body.parent = root;

  const dressM = mwFlatMat(scene, '#ff6eb4', {emissive:'#5c1e3e'});
  const skinM  = mwFlatMat(scene, '#ffdcc0', {emissive:'#4a3226'});
  const hairM  = mwFlatMat(scene, '#5c3a24', {emissive:'#241207'});
  const shoeM  = mwFlatMat(scene, '#ffffff', {emissive:'#444455'});
  const bowM   = mwGlowMat(scene, '#ffe14d', 0.65);

  const dress = BABYLON.MeshBuilder.CreateCylinder('dress', {diameterTop:0.36, diameterBottom:0.95, height:1.0, tessellation:20}, scene);
  dress.position.y = 0.66; dress.material = dressM; dress.parent = body; dress.isPickable = false;
  const head = BABYLON.MeshBuilder.CreateSphere('head', {diameter:0.66, segments:16}, scene);
  head.position.y = 1.5; head.material = skinM; head.parent = body; head.isPickable = false;
  const hair = BABYLON.MeshBuilder.CreateSphere('hair', {diameter:0.74, segments:16}, scene);
  hair.position.set(0, 1.56, 0.08); hair.material = hairM; hair.parent = body; hair.isPickable = false;
  [[-0.3,1.86],[0.3,1.86]].forEach(p=>{
    const bun = BABYLON.MeshBuilder.CreateSphere('bun', {diameter:0.24, segments:10}, scene);
    bun.position.set(p[0], p[1], 0.04); bun.material = hairM; bun.parent = body; bun.isPickable = false;
  });
  const bow = BABYLON.MeshBuilder.CreateSphere('bow', {diameter:0.13, segments:8}, scene);
  bow.position.set(0.3, 1.96, 0.02); bow.material = bowM; bow.parent = body; bow.isPickable = false;

  const face = BABYLON.MeshBuilder.CreatePlane('face', {size:0.5}, scene);
  face.position.set(0, 1.5, -0.297);
  face.rotation.y = 0;   // readable face (-z) = her front
  face.material = mwSpriteMat(scene, mwCanvasTexture(scene, 128, 128, (ctx)=>{
    ctx.fillStyle = '#2a1a1a';
    ctx.beginPath(); ctx.arc(44,56,7,0,7); ctx.fill();
    ctx.beginPath(); ctx.arc(84,56,7,0,7); ctx.fill();
    ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = 5; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(64,66,16,0.35,Math.PI-0.35); ctx.stroke();
    ctx.fillStyle = 'rgba(255,110,140,0.55)';
    ctx.beginPath(); ctx.arc(30,74,8,0,7); ctx.fill();
    ctx.beginPath(); ctx.arc(98,74,8,0,7); ctx.fill();
  }));
  face.parent = body; face.isPickable = false;

  const arms = [];
  [[-0.42,1],[0.42,-1]].forEach(p=>{
    const a = BABYLON.MeshBuilder.CreateCapsule('arm', {radius:0.075, height:0.52, tessellation:8}, scene);
    a.position.set(p[0], 1.02, 0);
    a.rotation.z = p[1]*-0.35;
    a.material = dressM; a.parent = body; a.isPickable = false;
    arms.push(a);
  });
  const feet = [];
  [[-0.17],[0.17]].forEach(p=>{
    const f = BABYLON.MeshBuilder.CreateSphere('foot', {diameter:0.18, segments:8}, scene);
    f.position.set(p[0], 0.09, -0.06); f.material = shoeM; f.parent = body; f.isPickable = false;
    feet.push(f);
  });
  mwBlobShadow(scene, 0.55, root);

  let phase = 0;
  return {
    root, headY: 1.9,
    update(dt, walking){
      if (walking){
        phase += dt*10;
        body.position.y = Math.abs(Math.sin(phase))*0.07;
        body.rotation.z = Math.sin(phase)*0.04;
        arms[0].rotation.x = Math.sin(phase)*0.7;
        arms[1].rotation.x = -Math.sin(phase)*0.7;
        feet[0].position.y = 0.09 + Math.max(0, Math.sin(phase))*0.1;
        feet[1].position.y = 0.09 + Math.max(0, -Math.sin(phase))*0.1;
      } else {
        phase += dt*2;
        body.position.y = Math.sin(phase)*0.015;
        body.rotation.z *= 0.9;
        arms[0].rotation.x *= 0.85; arms[1].rotation.x *= 0.85;
        feet[0].position.y = 0.09; feet[1].position.y = 0.09;
      }
    }
  };
}

// ── VISITOR (emoji sprite) ───────────────────────────────────
let mwVisUid = 0;
function mwMakeVisitor(scene, emoji){
  const root = new BABYLON.TransformNode('visitor', scene);
  const plane = BABYLON.MeshBuilder.CreatePlane('vis', {size:1.55}, scene);
  plane.position.y = 0.95;
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
  plane.material = mwSpriteMat(scene, mwEmojiTexture(scene, emoji, 256));
  plane.parent = root; plane.isPickable = false;
  const shadow = mwBlobShadow(scene, 0.48, root);
  // fat-finger pick target
  const pick = BABYLON.MeshBuilder.CreateCylinder('vpick', {diameter:1.7, height:2.3, tessellation:10}, scene);
  pick.position.y = 1.15; pick.visibility = 0; pick.isPickable = true;
  pick.parent = root;
  pick.mwVisUid = ++mwVisUid;

  let phase = Math.random()*7;
  return {
    root, plane, uid: pick.mwVisUid,
    headY: 1.85,
    update(dt, walking){
      if (walking){
        phase += dt*9;
        plane.position.y = 0.95 + Math.abs(Math.sin(phase))*0.09;
        plane.rotation.z = Math.sin(phase)*0.05;
      } else {
        phase += dt*2.4;
        plane.position.y = 0.95 + Math.sin(phase)*0.02;
        plane.rotation.z *= 0.9;
      }
    },
    dispose(){
      plane.material.diffuseTexture.dispose();
      plane.material.dispose();
      pick.dispose(); plane.dispose(); shadow.dispose(); root.dispose();
    }
  };
}

// ── ambient dust ─────────────────────────────────────────────
function mwSparkles(scene){
  const ps = new BABYLON.ParticleSystem('dust', 70, scene);
  ps.particleTexture = mwCanvasTexture(scene, 32, 32, (ctx)=>{
    const g = ctx.createRadialGradient(16,16,1, 16,16,15);
    g.addColorStop(0,'rgba(255,255,255,0.9)');
    g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0,0,32,32);
  });
  ps.emitter = new BABYLON.Vector3(-5, 2.4, -3);
  ps.minEmitBox = new BABYLON.Vector3(-29, -1.8, -13);
  ps.maxEmitBox = new BABYLON.Vector3(29, 1.8, 13);
  ps.color1 = new BABYLON.Color4(1, 0.85, 1, 0.5);
  ps.color2 = new BABYLON.Color4(0.7, 0.85, 1, 0.4);
  ps.colorDead = new BABYLON.Color4(1, 1, 1, 0);
  ps.minSize = 0.03; ps.maxSize = 0.09;
  ps.minLifeTime = 4; ps.maxLifeTime = 8;
  ps.emitRate = 9;
  ps.direction1 = new BABYLON.Vector3(-0.05, 0.06, -0.05);
  ps.direction2 = new BABYLON.Vector3(0.05, 0.14, 0.05);
  ps.gravity = BABYLON.Vector3.Zero();
  ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
  ps.start();
}

// ── assemble ─────────────────────────────────────────────────
function mwBuildWorld(scene, unlockedSet, ownerName){
  const shells = mwBuildRooms(scene);
  mwBuildSignage(scene, ownerName);
  mwBuildDais(scene);
  mwSparkles(scene);

  const pedestals = MUSEUM_ITEMS.map((item, i)=>
    mwPedestal(scene, item, MW.spots[item.key], i, unlockedSet.has(item.key)));

  const secret = mwBuildSecret(scene);

  // circle colliders: wall pedestals + the two dais platforms + secret ped
  const colliders = pedestals.filter(p=>!p.dais).map(p=>({x:p.x, z:p.z, r:0.95}));
  colliders.push({x:0, z:0, r:3.7});     // fancy dais
  colliders.push({x:19, z:0, r:2.75});   // vault dais
  colliders.push({x:-25, z:-12, r:0.95});// secret exhibit

  return {
    MW, pedestals, secret, colliders,
    walls: shells.walls,
    bulbMats: shells.bulbMats,
    stripMat: shells.stripM,
    update(t){
      for (const p of pedestals){
        p.plane.position.y = p.itemBaseY + Math.sin(t*1.5 + p.phase)*0.11;
      }
      secret.pedPlane.position.y = 2.45 + Math.sin(t*1.5)*0.12;
    }
  };
}
