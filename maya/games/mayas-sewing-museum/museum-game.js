// ════════════════════════════════════════════════════════════
//  MAYA'S SEWING MUSEUM — game logic v2
//  rooms & routing · YOU are the seller · camera + day/night · secret
// ════════════════════════════════════════════════════════════
/* global BABYLON, MUSEUM_ITEMS, MUSEUM_ROOMS, MUSEUM_VISITORS, ADMIRE_LINES,
   WAIT_LINES, BUY_LINES, SIGH_LINES, PASS_LINES, ENTER_LINES, SALE_TOASTS,
   UNICORN_LINES, SECRET_EXHIBIT, mwBuildWorld, mwMakeMaya, mwMakeVisitor */

(function(){
'use strict';

// ── saves ────────────────────────────────────────────────────
/* ===== Per-player saves (MayaSave) =====
   Ari (14) and Asha (10) play on Maya's iPad. Progress used to live under one shared key, so a
   sibling's game overwrote her stars — "Dad, my stars are gone." Keys become `<key>:<visitor>`.
   The visitor is derived exactly the way shared/ga-analytics.js derives it (a ?who= override
   persisted in `maya_visitor`, else the family-chat role in `maya_family_chat_v3`), so the two
   always agree on who is playing. The FIRST read for a player adopts any legacy un-namespaced
   value, so Maya keeps the progress she already earned; the legacy key is left as a safety net.
   Every access is guarded: a bare localStorage read THROWS on her iPad when site data is blocked
   and would abort this whole script, leaving a dead start button (that was the Dust Chasers bug). */
var MayaSave=(function(){
  function raw(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function put(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  var who=(function(){
    try{
      var q=new URLSearchParams(location.search).get('who');
      if(q==='nick'||q==='maya')put('maya_visitor',q);
      var t=raw('maya_visitor');
      if(t==='nick'||t==='maya')return t;
      var s=raw('maya_family_chat_v3');
      if(s){var r=JSON.parse(s).role;if(r==='dad')return 'nick';if(r==='maya')return 'maya';}
    }catch(e){}
    return 'unknown';
  })();
  function nk(k){return k+':'+who;}
  return {
    visitor:who,
    get:function(k){var v=raw(nk(k));if(v!==null)return v;var legacy=raw(k);if(legacy!==null){put(nk(k),legacy);return legacy;}return null;},
    set:function(k,v){put(nk(k),v);},
    remove:function(k){try{localStorage.removeItem(nk(k));}catch(e){}},
    /* Device preferences (mute/volume) are NOT progress: shared across players, still guarded. */
    getPref:raw,setPref:put
  };
})();
window.MayaSave=MayaSave;

function loadJSON(key){
  try { const raw = MayaSave.get(key); if (raw) return JSON.parse(raw); } catch(e){}
  return null;
}
const loaded = loadJSON('museum_save') || {};
const save = Object.assign(
  { coins:0, sales:0, muted:false, night:true, cam:'tp', secretFound:false },
  loaded);
if (loaded.v !== 3){ save.v = 3; save.cam = 'tp'; }   // v3: third-person follow by default — one-thumb walking, easier on iPad/phone
function persist(){
  MayaSave.set('museum_save', JSON.stringify(save));
}

// the Sewing Shop save — what has Maya sewn/unlocked?
const shopSave = loadJSON('maya-sewing-v1') || {};
const unlockedSet = new Set(
  (shopSave.unlocked && shopSave.unlocked.length)
    ? shopSave.unlocked
    : ['cap','scarf','socks','bag','teddy']);   // shop starter set
const ownerName = (shopSave.name || 'Maya');

// ── audio ────────────────────────────────────────────────────
let AC = null, masterGain = null, musicGain = null, musicOn = false;
const CHORDS = [
  [261.63, 329.63, 392.00], [220.00, 261.63, 329.63],
  [174.61, 220.00, 261.63], [196.00, 246.94, 293.66],
];
const PLUCKS = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.5];
let chordIdx = 0, chordTimer = null, pluckTimer = null;

function initAudio(){
  if (window.MayaIOSAudioUnlock) window.MayaIOSAudioUnlock.unlock();
  if (AC) return;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = AC.createGain(); masterGain.gain.value = 0.9;
    masterGain.connect(AC.destination);
    musicGain = AC.createGain(); musicGain.gain.value = 0.0;
    musicGain.connect(masterGain);
  } catch(e){ AC = null; }
}
function tone(freq, dur, type, vol, dest, when){
  if (!AC) return;
  const t = (when || AC.currentTime);
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'sine'; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol || 0.1, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest || masterGain);
  o.start(t); o.stop(t + dur + 0.05);
}
function sfxOpen(){ tone(660,0.14,'sine',0.08); if(AC) tone(990,0.18,'sine',0.06,null,AC.currentTime+0.07); }
function sfxClose(){ tone(520,0.12,'sine',0.06); }
function sfxBoop(){ tone(300,0.1,'sine',0.05); }
function sfxCoin(){ if(!AC) return; [660,830,990,1320].forEach((f,i)=>tone(f,0.16,'square',0.045,null,AC.currentTime+i*0.07)); }
function sfxChime(){ if(!AC) return; tone(784,0.25,'sine',0.06); tone(1046,0.35,'sine',0.05,null,AC.currentTime+0.18); }
function sfxHeart(){ tone(1200+Math.random()*300,0.09,'sine',0.02); }
function sfxSigh(){ if(!AC) return; tone(520,0.3,'sine',0.04); tone(392,0.4,'sine',0.04,null,AC.currentTime+0.22); }
function sfxTada(){ if(!AC) return; [523,659,784,1046,1318].forEach((f,i)=>tone(f,0.3,'triangle',0.06,null,AC.currentTime+i*0.09)); }

function startMusic(){
  if (!AC || musicOn) return;
  musicOn = true;
  musicGain.gain.cancelScheduledValues(AC.currentTime);
  musicGain.gain.setTargetAtTime(0.16, AC.currentTime, 0.8);
  const playChord = ()=>{
    const notes = CHORDS[chordIdx % CHORDS.length]; chordIdx++;
    const t = AC.currentTime;
    notes.forEach(f=>{
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.05, t + 1.2);
      g.gain.linearRampToValueAtTime(0.0001, t + 4.2);
      o.connect(g); g.connect(musicGain);
      o.start(t); o.stop(t + 4.4);
    });
  };
  playChord();
  chordTimer = setInterval(playChord, 3800);
  const pluck = ()=>{
    tone(PLUCKS[Math.floor(Math.random()*PLUCKS.length)], 0.9, 'sine', 0.035, musicGain);
    pluckTimer = setTimeout(pluck, 1200 + Math.random()*2200);
  };
  pluckTimer = setTimeout(pluck, 900);
}
function stopMusic(){
  musicOn = false;
  if (musicGain && AC) musicGain.gain.setTargetAtTime(0, AC.currentTime, 0.3);
  if (chordTimer) clearInterval(chordTimer);
  if (pluckTimer) clearTimeout(pluckTimer);
  chordTimer = pluckTimer = null;
}

// ── DOM ──────────────────────────────────────────────────────
const $ = (id)=>document.getElementById(id);
const canvas = $('scene3d');
const overlay = $('overlay');
const cardEl = $('card');
const hintEl = $('taphint');
const arrowEl = $('sellarrow');
const joyBase = $('joybase');
const joyKnob = $('joyknob');
function setCoins(){ $('coins').textContent = save.coins; $('sales').textContent = save.sales; }
setCoins();

let toastTimer = null;
function toast(msg){
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2600);
}

const CONF_COLORS = ['#ff6eb4','#ffe14d','#5dffb0','#5bc8ff','#c77dff','#ff9a3c'];
function confetti(x, y, n){
  for (let i=0; i<(n||16); i++){
    const p = document.createElement('div');
    p.className = 'conf';
    p.style.background = CONF_COLORS[i % CONF_COLORS.length];
    p.style.left = x+'px'; p.style.top = y+'px';
    if (i%3===0) p.style.borderRadius = '50%';
    overlay.appendChild(p);
    const ang = Math.random()*Math.PI*2, v = 60 + Math.random()*110;
    const dx = Math.cos(ang)*v, dy = Math.sin(ang)*v - 90;
    p.animate([
      { transform:'translate(0,0) rotate(0deg)', opacity:1 },
      { transform:`translate(${dx}px, ${dy + 160}px) rotate(${(Math.random()*720-360)}deg)`, opacity:0 }
    ], { duration: 900 + Math.random()*500, easing:'cubic-bezier(.2,.7,.4,1)' }).onfinish = ()=> p.remove();
  }
}

// ── boot ─────────────────────────────────────────────────────
const engine = new BABYLON.Engine(canvas, true, { stencil:true, adaptToDeviceRatio:false });
engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, 2));
const scene = new BABYLON.Scene(engine);

const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0.2, 1, 0.1), scene);
const dir = new BABYLON.DirectionalLight('dir', new BABYLON.Vector3(-0.3, -1, 0.4), scene);
const glow = new BABYLON.GlowLayer('glow', scene);
glow.customEmissiveColorSelector = function(mesh, subMesh, material, result){
  if (material && material.mwNoGlow){ result.set(0,0,0,0); }
  else if (material && material.emissiveColor){
    const c = material.emissiveColor; result.set(c.r, c.g, c.b, 1);
  } else result.set(0,0,0,0);
};

const world = mwBuildWorld(scene, unlockedSet, ownerName);
const MW = world.MW;
const maya = mwMakeMaya(scene);
maya.root.position.set(0, 0, 4.2);

// wall AABBs used for collision (tapestry counts until opened)
const wallAabbs = world.walls.map(w=>w.aabb);
let tapestryOpen = !!save.secretFound;
if (tapestryOpen){ world.secret.tapestry.setEnabled(false); }
else { wallAabbs.push(world.secret.tapestryAabb); }

// ── day / night ──────────────────────────────────────────────
let dayT = save.night ? 0 : 1, dayTarget = dayT;
function lerp(a,b,t){ return a+(b-a)*t; }
function applyDayNight(){
  const t = dayT;
  hemi.intensity = lerp(0.95, 1.4, t);
  hemi.diffuse = new BABYLON.Color3(lerp(0.85,1,t), lerp(0.8,0.98,t), lerp(1,0.93,t));
  hemi.groundColor = new BABYLON.Color3(lerp(0.25,0.5,t), lerp(0.15,0.44,t), lerp(0.4,0.6,t));
  dir.intensity = lerp(0.35, 0.6, t);
  scene.clearColor = new BABYLON.Color4(lerp(0.05,0.5,t), lerp(0.035,0.45,t), lerp(0.11,0.74,t), 1);
  glow.intensity = lerp(0.55, 0.2, t);
  const dim = 1 - 0.68*t;
  for (const m of world.bulbMats) m.emissiveColor = m._baseEm.scale(dim);
  world.stripMat.emissiveColor = world.stripMat._baseEm.scale(1 - 0.5*t);
}
applyDayNight();

// ── camera (TP follow · FP look) ─────────────────────────────
const camera = new BABYLON.UniversalCamera('cam', new BABYLON.Vector3(0, 7.2, 15), scene);
let camMode = save.cam === 'tp' ? 'tp' : 'fp';
let camYaw = Math.PI, camPitch = 0, bobPhase = 0;
let mayaWalking = false;
const CAM_HD = 8.2, CAM_H = 7.2;
const camTarget = new BABYLON.Vector3(0, 1.3, 4.2);

function applyCamMode(){
  maya.root.setEnabled(camMode === 'tp');
  $('camBtn').textContent = camMode === 'tp' ? '🎥' : '👁️';
}
function updateCamera(dt){
  const p = maya.root.position;
  if (camMode === 'fp'){
    bobPhase += dt * (mayaWalking ? 10 : 2);
    const bobY = mayaWalking ? Math.abs(Math.sin(bobPhase))*0.05 : 0;
    camera.position.set(p.x, 1.55 + bobY, p.z);
    const cp = Math.cos(camPitch), sp = Math.sin(camPitch);
    camera.setTarget(new BABYLON.Vector3(
      p.x + Math.sin(camYaw)*cp, camera.position.y + sp, p.z + Math.cos(camYaw)*cp));
    return;
  }
  const k = 1 - Math.exp(-dt*6);
  camTarget.x += (p.x - camTarget.x)*k;
  camTarget.z += (p.z - camTarget.z)*k;
  camTarget.y = 1.3;
  const cx = Math.max(-33.5, Math.min(23.5, camTarget.x - Math.sin(camYaw)*CAM_HD));
  const cz = Math.max(-15.5, Math.min(9.5,  camTarget.z - Math.cos(camYaw)*CAM_HD));
  const k2 = 1 - Math.exp(-dt*8);
  camera.position.x += (cx - camera.position.x)*k2;
  camera.position.z += (cz - camera.position.z)*k2;
  camera.position.y += (CAM_H - camera.position.y)*k2;
  camera.setTarget(camTarget);
}
applyCamMode();
updateCamera(1);

// walls between camera and Maya fade out (third person only)
function segHitsAabb(x1,z1,x2,z2,b,pad){
  const x0 = b.x0-pad, X1 = b.x1+pad, z0 = b.z0-pad, Z1 = b.z1+pad;
  let t0 = 0, t1 = 1;
  const dx = x2-x1, dz = z2-z1;
  const clip = (p, q)=>{
    if (Math.abs(p) < 1e-9) return q >= 0;
    const r = q/p;
    if (p < 0){ if (r > t1) return false; if (r > t0) t0 = r; }
    else { if (r < t0) return false; if (r < t1) t1 = r; }
    return true;
  };
  return clip(-dx, x1-x0) && clip(dx, X1-x1) && clip(-dz, z1-z0) && clip(dz, Z1-z1);
}
function updateWallFade(dt){
  const p = maya.root.position, c = camera.position;
  for (const w of world.walls){
    let target = 1;
    if (camMode === 'tp' && segHitsAabb(c.x, c.z, p.x, p.z, w.aabb, 0.3)) target = 0.22;
    const v = w.mesh.visibility + (target - w.mesh.visibility)*Math.min(1, dt*8);
    w.mesh.visibility = v;
    w.strip.visibility = Math.max(v, 0.5);
  }
}

// ── projection helper ────────────────────────────────────────
function project(vec){
  const w = engine.getRenderWidth(), h = engine.getRenderHeight();
  const proj = BABYLON.Vector3.Project(
    vec, BABYLON.Matrix.Identity(), scene.getTransformMatrix(),
    new BABYLON.Viewport(0, 0, w, h));
  const sx = canvas.clientWidth / w, sy = canvas.clientHeight / h;
  return { x: proj.x*sx, y: proj.y*sy, visible: proj.z > 0 && proj.z < 1 };
}

// ── rooms + routing ──────────────────────────────────────────
function roomOf(x, z){
  for (const k in MW.rooms){
    const r = MW.rooms[k];
    if (x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return k;
  }
  return 'outside';
}
function roomCenter(k){
  const r = MW.rooms[k];
  return { x:(r.x0+r.x1)/2, z:(r.z0+r.z1)/2 };
}
const ADJ = {
  outside: [['fancy','entry']],
  fancy:   [['outside','entry'],['cozy','cf'],['vault','fv']],
  cozy:    [['fancy','cf'],['secret','cs']],
  vault:   [['fancy','fv']],
  secret:  [['cozy','cs']],
};
function routeDoors(from, to){
  if (from === to) return [];
  const prev = {}; const q = [from]; prev[from] = null;
  while (q.length){
    const cur = q.shift();
    for (const [nxt, door] of ADJ[cur]){
      if (nxt in prev) continue;
      prev[nxt] = [cur, door];
      if (nxt === to){
        const doors = [];
        let n = to;
        while (prev[n]){ doors.unshift(prev[n][1]); n = prev[n][0]; }
        return doors;
      }
      q.push(nxt);
    }
  }
  return [];
}
function doorCrossing(doorKey, fromPos){
  const d = MW.doors[doorKey];
  if (d.axis === 'x'){
    const s = fromPos.x < d.x ? -1 : 1;
    return [{x:d.x + s*1.5, z:d.z}, {x:d.x - s*1.5, z:d.z}];
  }
  const s = fromPos.z < d.z ? -1 : 1;
  return [{x:d.x, z:d.z + s*1.5}, {x:d.x, z:d.z - s*1.5}];
}
function buildPath(fromPos, targetPos){
  const doors = routeDoors(roomOf(fromPos.x, fromPos.z), roomOf(targetPos.x, targetPos.z));
  const pts = [];
  let cur = fromPos;
  for (const dk of doors){
    const wps = doorCrossing(dk, cur);
    pts.push(wps[0], wps[1]);
    cur = wps[1];
  }
  pts.push({x:targetPos.x, z:targetPos.z});
  return pts;
}

// ── input ────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e=>{ keys[e.key.toLowerCase()] = true; if (e.key===' ') e.preventDefault(); });
window.addEventListener('keyup',   e=>{ keys[e.key.toLowerCase()] = false; });

let joyId = null;   // (legacy names kept for DOM refs)
const sticks = {
  move: { id:null, ox:0, oy:0, vx:0, vy:0, shown:false, base:joyBase, knob:joyKnob },
  look: { id:null, ox:0, oy:0, vx:0, vy:0, shown:false, base:$('lookbase'), knob:$('lookknob') },
};
let tapCand = null;
let autoWalk = null;   // tap-to-walk state: {path,arrive,close,ped,...} or null
const hasPointerLock = 'requestPointerLock' in (canvas || {});
function isLocked(){ return document.pointerLockElement === canvas; }

function stickShow(s){
  s.shown = true;
  s.base.style.display = s.knob.style.display = 'block';
  s.base.style.left = s.ox+'px'; s.base.style.top = s.oy+'px';
  stickMove(s, s.ox, s.oy);
}
function stickMove(s, x, y){
  const dx = x - s.ox, dy = y - s.oy;
  const d = Math.hypot(dx, dy), max = 52, cl = d > max ? max/d : 1;
  s.knob.style.left = (s.ox + dx*cl)+'px';
  s.knob.style.top  = (s.oy + dy*cl)+'px';
  if (d < 8){ s.vx = 0; s.vy = 0; }
  else { s.vx = (dx*cl)/max; s.vy = (dy*cl)/max; }
}
function stickEnd(s){
  s.id = null; s.vx = s.vy = 0; s.shown = false;
  s.base.style.display = s.knob.style.display = 'none';
}
canvas.style.touchAction = 'none';

function onDown(e){
  if (!started) return;
  if (cardOpen){
    if (!cardEl.contains(e.target)) closeCard();
    return;
  }
  if (cardEl.contains(e.target) || (e.target.closest && e.target.closest('.iconbtn'))) return;
  const x = e.clientX, y = e.clientY;
  if (e.pointerType === 'touch'){
    // third-person (default): ONE walk stick anywhere · first-person: twin sticks (right = look)
    if (camMode === 'fp'){
      const s = (x < window.innerWidth*0.5) ? sticks.move : sticks.look;
      if (s.id === null){ s.id = e.pointerId; s.ox = x; s.oy = y; }
    } else if (sticks.move.id === null){
      sticks.move.id = e.pointerId; sticks.move.ox = x; sticks.move.oy = y;
    }
    if (tapCand === null) tapCand = { id:e.pointerId, x, y, t:performance.now(), moved:false };
  } else if (camMode === 'fp' && hasPointerLock){
    // first-person desktop: pointer-lock mouse-look
    if (isLocked()){
      handleTapGo(window.innerWidth/2, window.innerHeight/2);
    } else {
      const hit = pickThing(x, y);
      if (hit) goInteract(hit);
      else { try { canvas.requestPointerLock(); } catch(err){} }
    }
  } else {
    // third-person desktop: click to walk / peek / sell
    handleTapGo(x, y);
  }
}
function onMove(e){
  for (const k in sticks){
    const s = sticks[k];
    if (s.id === e.pointerId){
      if (!s.shown && Math.hypot(e.clientX - s.ox, e.clientY - s.oy) > 6) stickShow(s);
      if (s.shown) stickMove(s, e.clientX, e.clientY);
    }
  }
  if (tapCand && tapCand.id === e.pointerId &&
      Math.hypot(e.clientX - tapCand.x, e.clientY - tapCand.y) > 10) tapCand.moved = true;
  if (isLocked() && !cardOpen){
    camYaw -= (e.movementX || 0) * 0.0022;
    if (camMode === 'fp'){
      camPitch = Math.max(-0.55, Math.min(0.6, camPitch - (e.movementY || 0) * 0.0022));
    }
  }
}
function onUp(e){
  for (const k in sticks){ if (sticks[k].id === e.pointerId) stickEnd(sticks[k]); }
  if (tapCand && tapCand.id === e.pointerId){
    if (!tapCand.moved && performance.now() - tapCand.t < 400) handleTapGo(e.clientX, e.clientY);
    tapCand = null;
  }
}
document.addEventListener('pointerlockchange', ()=>{
  const cross = $('crosshair');
  if (cross) cross.style.display = isLocked() ? 'block' : 'none';
});
window.addEventListener('pointerdown', onDown);
window.addEventListener('pointermove', onMove);
window.addEventListener('pointerup', onUp);
window.addEventListener('pointercancel', onUp);

// ── tapping things ───────────────────────────────────────────
const REACH = 4.4, SELL_REACH = 3.4;
function dist2d(ax, az, bx, bz){ return Math.hypot(ax-bx, az-bz); }
function pedDist(p){ return dist2d(p.x, p.z, maya.root.position.x, maya.root.position.z); }

// what interactable (if any) is under this screen point?
function pickThing(cx, cy){
  const rect = canvas.getBoundingClientRect();
  // scene.pick expects canvas-relative CSS pixels (hardware scaling is applied internally)
  const hit = scene.pick(cx - rect.left, cy - rect.top, m => m.isPickable &&
    (m.mwPedIndex !== undefined || m.mwVisUid !== undefined || m.mwTapestry || m.mwSecretExhibit));
  if (!hit || !hit.hit || !hit.pickedMesh) return null;
  const m = hit.pickedMesh;
  if (m.mwVisUid !== undefined){
    const v = visitors.find(o=>o.sprite.uid === m.mwVisUid);
    if (!v) return null;
    return { kind: v.state === 'waiting' ? 'buyer' : 'heart', v };
  }
  if (m.mwTapestry) return { kind:'tapestry' };
  if (m.mwSecretExhibit) return { kind:'secret' };
  if (m.mwPedIndex !== undefined) return { kind:'ped', ped: world.pedestals[m.mwPedIndex] };
  return null;
}

// where on the floor (the y=0 plane) does this screen point land?
function floorPoint(cx, cy){
  const rect = canvas.getBoundingClientRect();
  const ray = scene.createPickingRay(cx - rect.left, cy - rect.top, BABYLON.Matrix.Identity(), camera);
  if (Math.abs(ray.direction.y) < 1e-4) return null;
  const t = -ray.origin.y / ray.direction.y;
  if (t <= 0) return null;
  const p = ray.origin.add(ray.direction.scale(t));
  return { x: Math.max(-35, Math.min(25, p.x)), z: Math.max(-17, Math.min(14, p.z)) };
}

// a tap: walk to (and interact with) a thing, or walk to a floor point
function tapRipple(x, y){
  const el = document.createElement('div');
  el.className = 'tapring';
  el.style.left = x+'px'; el.style.top = y+'px';
  overlay.appendChild(el);
  el.animate([
    { transform:'translate(-50%,-50%) scale(0.4)', opacity:0.95 },
    { transform:'translate(-50%,-50%) scale(2.4)', opacity:0 }
  ], { duration:520, easing:'ease-out' }).onfinish = ()=> el.remove();
}
function handleTapGo(cx, cy){
  const thing = pickThing(cx, cy);
  if (thing){ tapRipple(cx, cy); goInteract(thing); return true; }
  const fp = floorPoint(cx, cy);
  if (fp && roomOf(fp.x, fp.z) !== 'outside'){
    tapRipple(cx, cy);
    startWalk(buildPath(maya.root.position, fp), {});
    return true;
  }
  return false;
}

// decide how to reach a tapped thing: interact now if close, else walk up first
function goInteract(t){
  const mp = maya.root.position;
  if (t.kind === 'ped'){
    const ped = t.ped;
    if (pedDist(ped) <= REACH){ openCard(ped); return; }
    startWalk(buildPath(mp, approachPoint(ped)), {
      interact:true, ped, close:()=> pedDist(ped) <= REACH, arrive:()=> openCard(ped) });
  } else if (t.kind === 'buyer'){
    const v = t.v;
    const near = ()=>{ if (visitors.indexOf(v) < 0) return false;
      const q = v.sprite.root.position; return dist2d(q.x, q.z, mp.x, mp.z) <= SELL_REACH; };
    if (near()){ sellTo(v); return; }
    const vp = v.sprite.root.position;
    startWalk(buildPath(mp, {x:vp.x, z:vp.z}), {
      interact:true,
      close:()=> near() || visitors.indexOf(v) < 0 || v.state !== 'waiting',
      arrive:()=>{ if (near() && v.state === 'waiting') sellTo(v); } });
  } else if (t.kind === 'heart'){
    sfxHeart(); heartAt(t.v.sprite.root.position, t.v.sprite.headY);
  } else if (t.kind === 'tapestry'){
    if (dist2d(-25, -7.7, mp.x, mp.z) <= 4){ openTapestry(); return; }
    startWalk(buildPath(mp, {x:-25, z:-6.8}), {
      interact:true, close:()=> dist2d(-25, -7.7, mp.x, mp.z) <= 4, arrive: openTapestry });
  } else if (t.kind === 'secret'){
    if (dist2d(-25, -12, mp.x, mp.z) <= REACH){ openSecretCard(); return; }
    startWalk(buildPath(mp, {x:-25, z:-12}), {
      interact:true, close:()=> dist2d(-25, -12, mp.x, mp.z) <= REACH, arrive: openSecretCard });
  }
}

// ── auto-walk (tap-to-move) engine ───────────────────────────
function startWalk(path, opts){
  autoWalk = Object.assign({ path, prevMin:Infinity, noProg:0, ped:null, close:null, arrive:function(){} }, opts);
  if (!autoWalk.path || !autoWalk.path.length){ finishWalk(); return; }
  sfxBoop();
}
function finishWalk(){
  const cb = autoWalk ? autoWalk.arrive : null;
  autoWalk = null;
  mayaWalking = false;
  if (cb) cb();
}
function followWalk(dt){
  if (cardOpen){ maya.update(dt, false); return; }
  autoWalk.age = (autoWalk.age || 0) + dt;
  if ((autoWalk.close && autoWalk.close()) || (autoWalk.interact && autoWalk.age > 12)){ finishWalk(); return; }
  const p = maya.root.position;
  const t = autoWalk.path[0];
  if (!t){ finishWalk(); return; }
  const dx = t.x - p.x, dz = t.z - p.z, d = Math.hypot(dx, dz);
  if (d < autoWalk.prevMin - 0.03){ autoWalk.prevMin = d; autoWalk.noProg = 0; }
  else autoWalk.noProg += dt;
  if (d < 0.3 || autoWalk.noProg > 1.1){          // reached, or wedged — advance waypoint
    autoWalk.path.shift(); autoWalk.prevMin = Infinity; autoWalk.noProg = 0;
    if (!autoWalk.path.length) finishWalk();
    return;
  }
  const mx = dx/d, mz = dz/d;
  moveActor(p, mx, mz, 4.6, dt, 0.45);
  const target = Math.atan2(-mx, -mz);
  let diff = target - maya.root.rotation.y;
  while (diff > Math.PI) diff -= Math.PI*2;
  while (diff < -Math.PI) diff += Math.PI*2;
  maya.root.rotation.y += diff * Math.min(1, dt*12);
  mayaWalking = true;
  maya.update(dt, true);
}

// ── floating labels / hearts ─────────────────────────────────
function floatAt(pos, txt, yOff){
  const el = document.createElement('div');
  el.className = 'floatnote';
  el.textContent = txt;
  overlay.appendChild(el);
  const update = ()=>{
    const pr = project(new BABYLON.Vector3(pos.x, (yOff||2), pos.z));
    el.style.left = pr.x+'px'; el.style.top = pr.y+'px';
  };
  update();
  const iv = setInterval(update, 40);
  setTimeout(()=>{ clearInterval(iv); el.remove(); }, 1400);
}
function heartAt(pos, yOff){
  const pr = project(new BABYLON.Vector3(pos.x + (Math.random()-0.5)*0.6, (yOff||1.6)+0.6, pos.z));
  if (!pr.visible) return;
  const el = document.createElement('div');
  el.className = 'heartfloat';
  el.textContent = ['❤️','💖','💕','😍','✨'][Math.floor(Math.random()*5)];
  el.style.left = pr.x+'px'; el.style.top = pr.y+'px';
  overlay.appendChild(el);
  el.animate([
    { transform:'translate(-50%,0) scale(0.6)', opacity:0 },
    { transform:'translate(-50%,-20px) scale(1)', opacity:1, offset:0.3 },
    { transform:'translate(-50%,-60px) scale(1)', opacity:0 }
  ], { duration:1300, easing:'ease-out' }).onfinish = ()=> el.remove();
}

// ── item card ────────────────────────────────────────────────
let cardOpen = false;
function showCard(){ cardOpen = true; cardEl.classList.add('open'); sfxOpen();
  if (isLocked()) document.exitPointerLock(); }
function openCard(ped){
  const it = ped.item;
  $('cardEmoji').textContent = it.emoji;
  $('cardName').textContent = ped.ghost ? it.name + ' … ?' : it.name;
  $('cardPrice').textContent = it.price + ' 🪙';
  $('cardPrice').style.display = ped.ghost ? 'none' : 'inline-flex';
  $('cardDesc').textContent = ped.ghost
    ? 'Maya hasn\u2019t sewn this yet! Sew it in the Sewing Shop and it will appear here. 🧵'
    : it.desc;
  $('cardStamp').style.display = ped.ghost ? 'none' : 'inline-flex';
  $('cardTreasure').style.display = (!ped.ghost && it.treasure) ? 'inline-flex' : 'none';
  $('cardPriceless').style.display = 'none';
  $('cardShop').style.display = ped.ghost ? 'inline-flex' : 'none';
  $('cardSales').textContent = (!ped.ghost && ped.sales > 0) ? `💖 Sold ${ped.sales} today!` : '';
  showCard();
}
function openSecretCard(){
  $('cardEmoji').textContent = SECRET_EXHIBIT.emoji;
  $('cardName').textContent = SECRET_EXHIBIT.name;
  $('cardPrice').style.display = 'none';
  $('cardDesc').textContent = SECRET_EXHIBIT.desc;
  $('cardStamp').style.display = 'inline-flex';
  $('cardTreasure').style.display = 'none';
  $('cardPriceless').style.display = 'inline-flex';
  $('cardShop').style.display = 'none';
  $('cardSales').textContent = '';
  showCard();
}
function closeCard(){
  if (!cardOpen) return;
  cardOpen = false;
  cardEl.classList.remove('open');
  sfxClose();
}
$('cardClose').addEventListener('click', closeCard);

// ── secret room ──────────────────────────────────────────────
function openTapestry(){
  if (tapestryOpen) return;
  tapestryOpen = true;
  const i = wallAabbs.indexOf(world.secret.tapestryAabb);
  if (i >= 0) wallAabbs.splice(i, 1);
  const tap = world.secret.tapestry;
  let t = 0;
  const obs = scene.onBeforeRenderObservable.add(()=>{
    t += engine.getDeltaTime()/1000;
    tap.position.y = 1.65 + t*3.4;
    tap.visibility = Math.max(0, 1 - t*1.2);
    if (t > 1){ tap.setEnabled(false); scene.onBeforeRenderObservable.remove(obs); }
  });
  sfxTada();
  confetti(window.innerWidth/2, window.innerHeight*0.4, 26);
  if (!save.secretFound){
    save.secretFound = true;
    save.coins += 25;
    persist(); setCoins();
    toast('🤫 You found the SECRET ROOM! +25 🪙');
  } else toast('🤫 The secret room!');
}

// ── movement + collision ─────────────────────────────────────
function circleVsWalls(px, pz, r){
  for (const b of wallAabbs){
    const cx = Math.max(b.x0, Math.min(b.x1, px));
    const cz = Math.max(b.z0, Math.min(b.z1, pz));
    const dx = px-cx, dz = pz-cz;
    const d2 = dx*dx + dz*dz;
    if (d2 < r*r){
      if (d2 > 1e-6){
        const d = Math.sqrt(d2);
        px = cx + dx/d*r; pz = cz + dz/d*r;
      } else {
        const pen = [px-b.x0, b.x1-px, pz-b.z0, b.z1-pz];
        const m = Math.min(...pen);
        if (m === pen[0]) px = b.x0 - r;
        else if (m === pen[1]) px = b.x1 + r;
        else if (m === pen[2]) pz = b.z0 - r;
        else pz = b.z1 + r;
      }
    }
  }
  return {x:px, z:pz};
}
function circleVsPeds(px, pz, r, skipPed){
  for (const c of world.colliders){
    if (skipPed && Math.abs(c.x - skipPed.x) < 0.01 && Math.abs(c.z - skipPed.z) < 0.01) continue;
    const dx = px - c.x, dz = pz - c.z;
    const d = Math.hypot(dx, dz), min = c.r + r;
    if (d < min && d > 0.0001){ px = c.x + dx/d*min; pz = c.z + dz/d*min; }
  }
  return {x:px, z:pz};
}
function moveActor(pos, mx, mz, speed, dt, r, skipPed){
  let nx = pos.x + mx*speed*dt, nz = pos.z + mz*speed*dt;
  let c = circleVsPeds(nx, nz, r, skipPed);
  c = circleVsWalls(c.x, c.z, r);
  c.x = Math.max(-35.5, Math.min(25.5, c.x));
  c.z = Math.max(-17.5, Math.min(14.5, c.z));
  pos.x = c.x; pos.z = c.z;
}

function updateMaya(dt){
  let ix = sticks.move.vx, iy = -sticks.move.vy;
  let manual = Math.hypot(sticks.move.vx, sticks.move.vy) > 0.05;
  if (keys['w'] || keys['arrowup']){ iy += 1; manual = true; }
  if (keys['s'] || keys['arrowdown']){ iy -= 1; manual = true; }
  if (keys['a'] || keys['arrowleft']){ ix -= 1; manual = true; }
  if (keys['d'] || keys['arrowright']){ ix += 1; manual = true; }
  if (manual && autoWalk) autoWalk = null;        // player grabbed the stick/keys — cancel auto-walk
  if (autoWalk){ followWalk(dt); return; }
  const mag = Math.hypot(ix, iy);
  mayaWalking = mag > 0.05 && !cardOpen;
  if (mayaWalking){
    if (mag > 1){ ix/=mag; iy/=mag; }
    const fx = Math.sin(camYaw), fz = Math.cos(camYaw);
    const rx = fz, rz = -fx;
    const mx = fx*iy + rx*ix, mz = fz*iy + rz*ix;
    moveActor(maya.root.position, mx, mz, 4.6, dt, 0.45);
    const target = Math.atan2(-mx, -mz);
    let diff = target - maya.root.rotation.y;
    while (diff > Math.PI) diff -= Math.PI*2;
    while (diff < -Math.PI) diff += Math.PI*2;
    maya.root.rotation.y += diff * Math.min(1, dt*12);
  }
  maya.update(dt, mayaWalking);
}

// ── room announcements ───────────────────────────────────────
let lastRoom = 'fancy', roomToastAt = -10;
function updateRoomToast(){
  const r = roomOf(maya.root.position.x, maya.root.position.z);
  if (r !== lastRoom){
    lastRoom = r;
    if (MUSEUM_ROOMS[r] && clockT - roomToastAt > 5){
      roomToastAt = clockT;
      toast(`${MUSEUM_ROOMS[r].emoji} ${MUSEUM_ROOMS[r].name}`);
    }
  }
}

// ── speech bubbles ───────────────────────────────────────────
function makeBubble(cls){
  const el = document.createElement('div');
  el.className = cls || 'bubble';
  el.style.display = 'none';
  overlay.appendChild(el);
  return el;
}

// ── visitors (with rooms + seller mechanic) ──────────────────
const roster = MUSEUM_VISITORS.slice().sort(()=>Math.random()-0.5);
let rosterIdx = 0;
const visitors = [];
let lastWantEnd = -20;
let clockT = 0;
const SPAWN = { x:0, z:12.6 };

function pickFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function fmt(s, vis, item){
  return s.replace('{item}', item ? item.name : '')
          .replace('{name}', vis ? vis.data.name : '')
          .replace('{price}', item ? item.price : '');
}
function displayedPeds(){ return world.pedestals.filter(p=>!p.ghost); }

function approachPoint(ped){
  if (ped.dais){
    const c = ped.item.room === 'vault' ? {x:19, z:0, r:3.35} : {x:0, z:0, r:4.35};
    const dx = ped.x - c.x, dz = ped.z - c.z, d = Math.hypot(dx, dz) || 1;
    return { x: c.x + dx/d*c.r, z: c.z + dz/d*c.r };
  }
  const rc = roomCenter(ped.item.room);
  const dx = rc.x - ped.x, dz = rc.z - ped.z, d = Math.hypot(dx, dz) || 1;
  return { x: ped.x + dx/d*1.7 + (Math.random()-0.5)*0.5,
           z: ped.z + dz/d*1.7 + (Math.random()-0.5)*0.5 };
}

function spawnVisitor(){
  if (rosterIdx >= roster.length) rosterIdx = 0;
  const data = roster[rosterIdx++];
  const sprite = mwMakeVisitor(scene, data.emoji);
  sprite.root.position.set(SPAWN.x + (Math.random()-0.5)*1.5, 0, SPAWN.z);
  const v = {
    data, sprite,
    bubble: makeBubble(),
    marker: makeBubble('sellmark'),
    bubbleUntil: 0,
    state: 'enter',
    path: buildPath(sprite.root.position, {x:(Math.random()-0.5)*6, z:4.5}),
    ped: null, stateT: 0, heartT: 0,
    seen: 0, maxSee: 3 + Math.floor(Math.random()*3),
    walking: true, patience: 0,
  };
  v.marker.textContent = '🪙❗';
  visitors.push(v);
  sfxChime();
  say(v, pickFrom(ENTER_LINES), 2.2);
}

function say(v, text, secs){
  v.bubble.textContent = text;
  v.bubbleUntil = clockT + (secs || 2.4);
}

function nextStop(v){
  const opts = displayedPeds().filter(pd => pd !== v.ped);
  if (!opts.length){ startLeave(v); return; }
  // prefer same room 60% of the time
  const here = roomOf(v.sprite.root.position.x, v.sprite.root.position.z);
  const sameRoom = opts.filter(p=>p.item.room === here);
  v.ped = (sameRoom.length && Math.random() < 0.6) ? pickFrom(sameRoom) : pickFrom(opts);
  v.path = buildPath(v.sprite.root.position, approachPoint(v.ped));
  v.state = 'toPed'; v.stateT = 0; v.walking = true;
}
function startLeave(v){
  v.state = 'leave'; v.ped = null;
  v.path = buildPath(v.sprite.root.position, SPAWN);
  v.walking = true;
  if (Math.random() < 0.5) say(v, 'Bye Maya! 👋', 2);
}
function despawn(v){
  v.bubble.remove(); v.marker.remove();
  v.sprite.dispose();
  const i = visitors.indexOf(v);
  if (i >= 0) visitors.splice(i, 1);
  setTimeout(()=>{ if (started) spawnVisitor(); }, 2500 + Math.random()*4500);
}

function sellTo(v){
  const it = v.ped.item;
  save.coins += it.price;
  save.sales += 1;
  v.ped.sales += 1;
  persist(); setCoins();
  lastWantEnd = clockT;
  sfxCoin();
  toast(fmt(pickFrom(SALE_TOASTS), v, it));
  const vp = v.sprite.root.position;
  const pr = project(new BABYLON.Vector3(vp.x, 1.4, vp.z));
  if (pr.visible) confetti(pr.x, pr.y, 22);
  // exhibit does a happy bounce
  const plane = v.ped.plane, s0 = plane.scaling.x;
  let bt = 0;
  const obs = scene.onBeforeRenderObservable.add(()=>{
    bt += engine.getDeltaTime()/1000;
    const s = s0 * (1 + Math.sin(Math.min(bt*7, Math.PI))*0.35);
    plane.scaling.set(s, s, s);
    if (bt > 0.5){ plane.scaling.set(s0,s0,s0); scene.onBeforeRenderObservable.remove(obs); }
  });
  say(v, pickFrom(BUY_LINES), 2.4);
  v.state = 'bought'; v.stateT = 0;
}

function updateVisitor(v, dt){
  const p = v.sprite.root.position;
  v.stateT += dt;

  // walking along path
  if (v.state === 'enter' || v.state === 'toPed' || v.state === 'leave'){
    const t = v.path[0];
    if (t){
      const dx = t.x - p.x, dz = t.z - p.z, d = Math.hypot(dx, dz);
      if (d > 0.3){
        moveActor(p, dx/d, dz/d, 2.3, dt, 0.35, v.ped);
        v.walking = true;
      } else v.path.shift();
    } else {
      v.walking = false;
      if (v.state === 'toPed' && v.ped){
        v.state = 'admire'; v.stateT = 0;
        v.admireFor = 2.4 + Math.random()*2.6;
        if (Math.random() < 0.65) say(v, fmt(pickFrom(ADMIRE_LINES), v, v.ped.item), 2.4);
      } else if (v.state === 'leave'){ despawn(v); return; }
      else nextStop(v);
    }
  }
  else if (v.state === 'admire'){
    v.heartT += dt;
    if (v.heartT > 1.1){
      v.heartT = 0;
      heartAt(p, v.sprite.headY);
      if (Math.random() < 0.5) sfxHeart();
    }
    if (v.stateT > v.admireFor){
      const someoneWaiting = visitors.some(o=>o.state === 'waiting');
      if (!someoneWaiting && clockT - lastWantEnd > 8 && Math.random() < 0.38){
        v.state = 'waiting'; v.stateT = 0; v.patience = 24;
        say(v, fmt(pickFrom(WAIT_LINES), v, v.ped.item), 3.2);
      } else {
        v.seen++;
        if (v.seen >= v.maxSee) startLeave(v);
        else {
          if (Math.random() < 0.3) say(v, pickFrom(PASS_LINES), 2);
          nextStop(v);
        }
      }
    }
  }
  else if (v.state === 'waiting'){
    v.patience -= dt;
    if (Math.floor(v.stateT) % 4 === 3 && v.bubbleUntil < clockT){
      say(v, fmt(pickFrom(WAIT_LINES), v, v.ped.item), 2.6);
    }
    if (v.patience <= 0){
      lastWantEnd = clockT;
      say(v, pickFrom(SIGH_LINES), 2.4);
      sfxSigh();
      v.state = 'bought'; v.stateT = 0;   // reuse cooldown state
    }
  }
  else if (v.state === 'bought'){
    if (v.stateT > 2.2){
      v.seen++;
      if (v.seen >= v.maxSee) startLeave(v);
      else nextStop(v);
    }
  }

  v.sprite.update(dt, v.walking);

  // bubble + waiting marker
  const showBubble = v.bubbleUntil > clockT;
  if (showBubble){
    const pr = project(new BABYLON.Vector3(p.x, p.y + v.sprite.headY, p.z));
    if (pr.visible){
      v.bubble.style.display = 'block';
      v.bubble.style.left = pr.x+'px'; v.bubble.style.top = pr.y+'px';
    } else v.bubble.style.display = 'none';
  } else v.bubble.style.display = 'none';

  if (v.state === 'waiting' && !showBubble){
    const pr = project(new BABYLON.Vector3(p.x, p.y + v.sprite.headY, p.z));
    if (pr.visible){
      v.marker.style.display = 'block';
      v.marker.style.left = pr.x+'px'; v.marker.style.top = pr.y+'px';
    } else v.marker.style.display = 'none';
  } else v.marker.style.display = 'none';
}

// arrow pointing to a waiting buyer when they're offscreen
function updateSellArrow(){
  const v = visitors.find(o=>o.state === 'waiting');
  if (!v || cardOpen){ arrowEl.style.display = 'none'; return; }
  const p = v.sprite.root.position;
  const pr = project(new BABYLON.Vector3(p.x, 1.4, p.z));
  const m = 70;
  const onScreen = pr.visible && pr.x > m && pr.x < window.innerWidth-m && pr.y > m && pr.y < window.innerHeight-m;
  if (onScreen){ arrowEl.style.display = 'none'; return; }
  const mp = maya.root.position;
  const ang = Math.atan2(p.x - mp.x, p.z - mp.z) - camYaw;   // 0 = straight ahead
  const R = Math.min(window.innerWidth, window.innerHeight)*0.34;
  const x = window.innerWidth/2 + Math.sin(ang)*R;
  const y = window.innerHeight/2 - Math.cos(ang)*R;
  arrowEl.style.display = 'flex';
  arrowEl.style.left = x+'px'; arrowEl.style.top = y+'px';
  const deg = ang*180/Math.PI - 90;   // ➤ glyph points right; 0 = ahead/up
  arrowEl.style.transform = `translate(-50%,-50%) rotate(${deg}deg)`;
}

// ── the unicorn in the secret room ───────────────────────────
let unicorn = null;
function spawnUnicorn(){
  unicorn = {
    sprite: mwMakeVisitor(scene, '🦄'),
    bubble: makeBubble(),
    target: {x:-25, z:-12.5}, t: 0, sayT: 4,
  };
  unicorn.sprite.root.position.set(-27, 0, -13.5);
}
function updateUnicorn(dt){
  const u = unicorn; if (!u) return;
  const p = u.sprite.root.position;
  u.t -= dt; u.sayT -= dt;
  const dx = u.target.x - p.x, dz = u.target.z - p.z, d = Math.hypot(dx, dz);
  let walking = false;
  if (d > 0.3){ moveActor(p, dx/d, dz/d, 1.1, dt, 0.3); walking = true; }
  else if (u.t <= 0){
    u.t = 3 + Math.random()*5;
    u.target = { x: -27.5 + Math.random()*5, z: -14.8 + Math.random()*4.6 };
  }
  u.sprite.update(dt, walking);
  const mayaIn = roomOf(maya.root.position.x, maya.root.position.z) === 'secret';
  if (mayaIn && u.sayT <= 0){
    u.sayT = 7 + Math.random()*5;
    u.bubbleUntil = clockT + 2.6;
    u.bubble.textContent = pickFrom(UNICORN_LINES);
  }
  if (u.bubbleUntil > clockT && tapestryOpen){
    const pr = project(new BABYLON.Vector3(p.x, 1.85, p.z));
    if (pr.visible){
      u.bubble.style.display = 'block';
      u.bubble.style.left = pr.x+'px'; u.bubble.style.top = pr.y+'px';
    } else u.bubble.style.display = 'none';
  } else u.bubble.style.display = 'none';
}

// ── tap hint ─────────────────────────────────────────────────
let hintPed = null;
function updateHint(){
  if (cardOpen || !started){ hintEl.style.display='none'; hintPed=null; return; }
  const mp = maya.root.position;
  // waiting buyer nearby beats everything
  const waiter = visitors.find(v=>v.state === 'waiting' &&
    dist2d(v.sprite.root.position.x, v.sprite.root.position.z, mp.x, mp.z) < SELL_REACH);
  if (waiter){
    const p = waiter.sprite.root.position;
    const pr = project(new BABYLON.Vector3(p.x, 2.6, p.z));
    if (pr.visible){
      hintEl.textContent = '🪙 tap to sell!';
      hintEl.style.display = 'block';
      hintEl.style.left = pr.x+'px'; hintEl.style.top = pr.y+'px';
      hintPed = null;
      return;
    }
  }
  let best = null, bd = 3.6;
  for (const p of world.pedestals){
    const d = pedDist(p);
    if (d < bd){ bd = d; best = p; }
  }
  hintPed = best;
  if (best){
    const pos = best.root.position;
    const pr = project(new BABYLON.Vector3(pos.x, pos.y + best.itemBaseY + 1.15, pos.z));
    if (pr.visible){
      hintEl.textContent = best.ghost ? '🔒 tap to peek' : '👀 tap to peek!';
      hintEl.style.display = 'block';
      hintEl.style.left = pr.x+'px'; hintEl.style.top = pr.y+'px';
    } else hintEl.style.display = 'none';
  } else hintEl.style.display = 'none';
}
window.addEventListener('keydown', e=>{
  if ((e.key===' '||e.key==='Enter') && started){
    if (cardOpen){ closeCard(); return; }
    const mp = maya.root.position;
    const waiter = visitors.find(v=>v.state === 'waiting' &&
      dist2d(v.sprite.root.position.x, v.sprite.root.position.z, mp.x, mp.z) < SELL_REACH);
    if (waiter) sellTo(waiter);
    else if (hintPed) openCard(hintPed);
  }
  if (e.key==='Escape') closeCard();
});

// ── main loop ────────────────────────────────────────────────
let started = false;
engine.runRenderLoop(()=>{
  const dt = Math.min(engine.getDeltaTime()/1000, 0.05);
  clockT += dt;
  if (started){
    // right stick = continuous look
    if (sticks.look.vx || sticks.look.vy){
      camYaw -= sticks.look.vx * dt * 2.8;
      if (camMode === 'fp'){
        camPitch = Math.max(-0.5, Math.min(0.55, camPitch - sticks.look.vy * dt * 1.9));
      }
    }
    updateMaya(dt);
    for (let i = visitors.length-1; i >= 0; i--) updateVisitor(visitors[i], dt);
    updateUnicorn(dt);
    updateHint();
    updateSellArrow();
    updateRoomToast();
  }
  updateCamera(dt);
  updateWallFade(dt);
  world.update(clockT);
  for (const p of world.pedestals){
    const near = p === hintPed;
    const s = near ? 1 + Math.sin(clockT*5)*0.09 : 1;
    p.ring.scaling.set(s, 1, s);
  }
  // day/night crossfade
  if (dayT !== dayTarget){
    dayT += Math.sign(dayTarget - dayT) * Math.min(dt*0.9, Math.abs(dayTarget - dayT));
    applyDayNight();
  }
  scene.render();
});
window.addEventListener('resize', ()=> engine.resize());

// ── buttons ──────────────────────────────────────────────────
$('playBtn').addEventListener('click', ()=>{
  if (started) return;
  initAudio();
  if (AC && AC.state === 'suspended') AC.resume();
  $('splash').classList.add('hide');
  setTimeout(()=> $('splash').style.display = 'none', 650);
  started = true;
  if (!save.muted) startMusic();
  $('musicBtn').textContent = save.muted ? '🔇' : '🎵';
  $('dayBtn').textContent = save.night ? '🌙' : '☀️';
  spawnUnicorn();
  setTimeout(spawnVisitor, 1200);
  setTimeout(spawnVisitor, 7000);
  setTimeout(spawnVisitor, 15000);
});
$('musicBtn').addEventListener('click', ()=>{
  save.muted = !save.muted; persist();
  $('musicBtn').textContent = save.muted ? '🔇' : '🎵';
  if (save.muted) stopMusic(); else { initAudio(); startMusic(); }
});
$('dayBtn').addEventListener('click', ()=>{
  save.night = !save.night; persist();
  dayTarget = save.night ? 0 : 1;
  $('dayBtn').textContent = save.night ? '🌙' : '☀️';
  toast(save.night ? '🌙 Night at the museum…' : '☀️ Good morning, museum!');
});
$('camBtn').addEventListener('click', ()=>{
  camMode = camMode === 'tp' ? 'fp' : 'tp';
  save.cam = camMode; persist();
  camPitch = 0;
  applyCamMode();
  toast(camMode === 'fp' ? '👁️ You ARE the visitor!' : '🎥 Watching Maya');
});
$('helpBtn').addEventListener('click', ()=>{
  toast(window.matchMedia('(pointer:coarse)').matches
    ? '👆 Tap where to go · tap an exhibit to peek · tap a 🙋 buyer to SELL!'
    : '👆 Click to walk · WASD works too · click a 🙋 buyer to SELL!');
});

})();
