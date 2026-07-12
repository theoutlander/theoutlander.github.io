/* ===== Build On — game logic & UI wiring ===== */
(function(){
  var BO=window.BO;
  var canvas=document.getElementById('view');
  var isTouchDevice=matchMedia('(pointer: coarse)').matches;
  document.body.classList.toggle('no-touch', !isTouchDevice);   // hide on-screen sticks when there's a real mouse+keyboard
  var state=null, occ=new Map(), curPiece=null, tool='build', started=false, placedStack=[], placeRot=0;
  var buildOcc=new Map(), buildings=[], buildSeq=0;
  var hearts=5, maxHearts=5, invuln=0, regenT=0, playerAlive=true;

  function key(c){ return c.x+','+c.y+','+c.z; }
  function invCount(id){ return (state && state.inv[id]) || 0; }
  function $(id){ return document.getElementById(id); }

  /* boot the 3D scene straight away (renders behind the splash) */
  BO.scene.init(canvas);

  /* ---------- splash ---------- */
  var save=BO.load();
  if(save&&save.started){ $('startBtn').textContent='🧱 Keep Building!'; }
  $('startBtn').addEventListener('click', start);

  function start(){
    if(started) return; started=true;
    if(window.mayaGameStart)window.mayaGameStart();
    BO.audio.resume();
    state=BO.load();
    if(!state||!state.started){
      state={ started:true, day:1, inv:{}, blocks:[], lastCrateDay:BO.todayKey(), crateSeen:null };
      addItems(BO.makeCrate(1,state.lastCrateDay).items);
      BO.save(state);
    } else {
      dayRollover();
    }
    if(!state.half) state.half=28;
    if(state.half<=14 && !state.bigStart) state.half=28;   // grow older small worlds to the new bigger default (one time)
    state.bigStart=true;
    BO.scene.setYardSize(state.half);
    migratePets();
    restoreBlocks();
    restoreBuilds();
    renderTabs();
    renderPalette();
    renderSeeds();
    selectFirstAvailable();
    setTool('build');
    updateHUD();
    updateUndo();
    updateSizeSeg();
    buildRain();
    BO.scene.setFloorFn(columnTopHeight);
    initMobs();
    initCritters();
    spawnPets();
    applyWorld();
    $('splash').classList.add('gone');
    setTimeout(function(){ $('splash').style.display='none'; }, 560);
    BO.scene.frameCamera();
  }

  function addItems(items){ for(var k in items){ state.inv[k]=(state.inv[k]||0)+items[k]; } }

  function dayRollover(){
    var today=BO.todayKey();
    if(state.lastCrateDay!==today){
      state.day=(state.day||1)+1;
      addItems(BO.makeCrate(state.day,today).items);
      state.lastCrateDay=today; state.crateSeen=null;
      BO.save(state); BO.sfx.day();
    }
  }

  function restoreBlocks(){
    (state.blocks||[]).forEach(function(b){
      if(!BO.piece(b.t)) return;   // skip retired/unknown pieces safely
      var root=BO.scene.placePiece(b.t,{x:b.x,y:b.y,z:b.z},b.c,b.pot,b.r);
      occ.set(key(b),root);
    });
  }
  /* ---- big drop-in buildings (multi-tile, walk-in) ---- */
  function bkey(x,z){ return x+','+z; }
  function structFootCells(cx,cz,foot){ var h=(foot-1)/2, cells=[]; for(var x=cx-h;x<=cx+h;x++){ for(var z=cz-h;z<=cz+h;z++){ cells.push([x,z]); } } return cells; }
  function structWallCells(cx,cz,foot){ var h=(foot-1)/2, doorZ=cz-h, out=[]; structFootCells(cx,cz,foot).forEach(function(c){ var per=(c[0]===cx-h||c[0]===cx+h||c[1]===cz-h||c[1]===cz+h); if(per && !(c[0]===cx&&c[1]===doorZ)) out.push(bkey(c[0],c[1])); }); return out; }
  function placeStructureAt(id, cell){
    var p=BO.piece(id); if(!p) return false;
    var foot=p.foot||3, tall=p.tall||2.6, h=(foot-1)/2, cx=cell.x, cz=cell.z;
    if(cx-h<-BO.HALF||cx+h>BO.HALF||cz-h<-BO.HALF||cz+h>BO.HALF){ toast('🏠 Needs more room — try nearer the middle!'); return false; }
    var busy=false; structFootCells(cx,cz,foot).forEach(function(c){ if(occ.has(c[0]+',0,'+c[1]) || buildOcc.has(bkey(c[0],c[1]))) busy=true; });
    if(busy){ toast('🏠 Something is in the way there!'); return false; }
    var root=BO.scene.placeStructure(id, cx, cz, foot, tall, placeRot, p.color);
    var wallCells=structWallCells(cx,cz,foot); wallCells.forEach(function(k){ buildOcc.set(k, tall); });
    buildSeq++; var rec={seq:buildSeq, id:id, x:cx, z:cz, r:placeRot||0};
    root.metadata.structure.seq=buildSeq;
    buildings.push({rec:rec, root:root, wallCells:wallCells});
    state.builds=state.builds||[]; state.builds.push(rec);
    BO.sfx.place(); toast('🏠 '+p.name+' dropped in — walk in the front door!');
    persist(); return true;
  }
  function removeStructure(root){
    var st=root.metadata&&root.metadata.structure; if(!st) return;
    var b=buildings.filter(function(x){ return x.root===root; })[0];
    if(b) b.wallCells.forEach(function(k){ buildOcc.delete(k); });
    buildings=buildings.filter(function(x){ return x.root!==root; });
    state.builds=(state.builds||[]).filter(function(r){ return r.seq!==st.seq; });
    root.getChildMeshes(false).forEach(function(c){ if(BO.scene.rmShadow) BO.scene.rmShadow(c); c.dispose(); });
    root.dispose();
    BO.sfx.pop(); toast('🏠 Building removed'); persist();
  }
  function restoreBuilds(){ (state.builds||[]).forEach(function(r){ var p=BO.piece(r.id); if(!p) return; buildSeq=Math.max(buildSeq, r.seq||0); var foot=p.foot||3, tall=p.tall||2.6; var root=BO.scene.placeStructure(r.id, r.x, r.z, foot, tall, r.r||0, p.color); root.metadata.structure.seq=r.seq; var wallCells=structWallCells(r.x,r.z,foot); wallCells.forEach(function(k){ buildOcc.set(k, tall); }); buildings.push({rec:r, root:root, wallCells:wallCells}); }); }
  function persist(){
    state.blocks=[];
    occ.forEach(function(root){ var m=root.metadata; var rec={x:m.cell.x,y:m.cell.y,z:m.cell.z,t:m.pieceId,c:m.color}; if(m.rot) rec.r=m.rot; if(m.interactive==='pot'&&m.plant){ rec.pot={seed:m.plant.seed,stage:m.plant.stage}; } state.blocks.push(rec); });
    BO.save(state);
  }

  /* ---------- placement ---------- */
  function columnTop(x,z){
    var top=-1;
    occ.forEach(function(r){ var m=r.metadata.cell; if(m.x===x&&m.z===z&&m.y>top) top=m.y; });
    return top;
  }
  function columnTopHeight(x,z){ var cx=Math.round(x), cz=Math.round(z); if(cx<-BO.HALF||cx>BO.HALF||cz<-BO.HALF||cz>BO.HALF) return 0; var t=columnTop(cx,cz); var bh=buildOcc.get(cx+','+cz)||0; return Math.max(t>=0 ? t+1 : 0, bh); }
  function tryPlace(cell){
    if(cell.x<-BO.HALF||cell.x>BO.HALF||cell.z<-BO.HALF||cell.z>BO.HALF) return false;
    var _fp=BO.piece(curPiece); if(_fp && _fp.kind==='friend'){ return placePet(curPiece, cell); }
    if(_fp && _fp.struct){ return placeStructureAt(curPiece, cell); }
    if(cell.y<0||cell.y>BO.MAXY) return false;
    if(occ.has(key(cell))) return false;
    if(!curPiece) return false;
    var p=BO.piece(curPiece);
    var color = p.rand ? BO.RAINBOW_COLORS[Math.floor(Math.random()*BO.RAINBOW_COLORS.length)] : (p.color||null);
    var root=BO.scene.placePiece(curPiece,cell,color,null,placeRot);
    occ.set(key(cell),root);
    BO.sfx.place();
    if(p.kind==='star'||p.kind==='rainbow') BO.sfx.star();
    if(curPiece==='pot' && state && !state.potTip){ state.potTip=true; toast('🪴 Tap your pot to plant a seed!'); }
    placedStack.push(key(cell)); updateUndo();
    persist();
    return true;
  }
  function handleGroundTap(cell){
    if(occ.has(key(cell))){ cell={x:cell.x, y:columnTop(cell.x,cell.z)+1, z:cell.z}; }
    tryPlace(cell);
  }
  function removeBlock(root){
    var m=root.metadata;
    BO.scene.removePiece(root);
    var kk=key(m.cell);
    occ.delete(kk);
    placedStack=placedStack.filter(function(x){ return x!==kk; });
    BO.sfx.pop();
    updateUndo();
    persist();
  }

  /* ---------- gesture: quick tap = place/remove, drag = spin/look ---------- */
  var THRESH=18, active=0, multi=false, gesture=null;
  function canvasXY(e){ var r=canvas.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; }
  function pickTarget(e){ var c=canvasXY(e); return BO.scene.resolveTapAt(c.x,c.y); }
  function placementCell(t){
    if(!t) return null;
    if(t.type==='ground'){ var c=t.cell; if(occ.has(key(c))) return {x:c.x,y:columnTop(c.x,c.z)+1,z:c.z}; return {x:c.x,y:0,z:c.z}; }
    if(t.type==='block') return t.place;
    return null;
  }
  function ghostFor(t){
    if(!started || tool!=='build' || !t || t.type==='crate' || t.type==='pot' || t.type==='friend' || t.type==='mob' || t.type==='critter' || !curPiece){ BO.scene.hideGhost(); return; }
    var _gp=BO.piece(curPiece); if(_gp && (_gp.kind==='friend'||_gp.struct)){ BO.scene.hideGhost(); return; }
    var cell=placementCell(t);
    if(!cell || cell.x<-BO.HALF||cell.x>BO.HALF||cell.z<-BO.HALF||cell.z>BO.HALF||cell.y<0||cell.y>BO.MAXY){ BO.scene.hideGhost(); return; }
    var p=BO.piece(curPiece); BO.scene.showGhostAt(cell, (p&&p.color)||'#f2e9ff', placeRot);
  }
  /* ---------- desktop mouse-look (pointer lock) — click the canvas to look around, like other 3D games ---------- */
  var mouseLocked=false, LOOK_SENS=0.0028;
  canvas.addEventListener('contextmenu',function(e){ e.preventDefault(); });   // no browser menu on right-click
  document.addEventListener('pointerlockchange',function(){
    mouseLocked = (document.pointerLockElement===canvas);
    if(!mouseLocked) gesture=null;   // dropping lock (e.g. Esc) shouldn't leave a stale drag in progress
  });
  canvas.addEventListener('mousemove',function(e){
    if(!mouseLocked || viewMode!=='walk') return;
    BO.scene.walkLook((e.movementX||0)*LOOK_SENS, (e.movementY||0)*LOOK_SENS);
  });
  /* left-click breaks whatever's at the crosshair; right-click places/uses it — Minecraft's convention */
  function breakAt(r){
    if(!r) return;
    if(r.type==='mob'){ BO.mobs.hit(r.mob); return; }
    if(r.type==='critter'){ if(r.critter.isPet) removePet(r.critter); return; }
    if(r.type==='structure'){ removeStructure(r.root); return; }
    if(r.type==='block'||r.type==='pot'||r.type==='friend'){ removeBlock(r.root); return; }
  }
  function useAt(r){
    if(!r) return;
    if(r.type==='crate'){ openToday(); return; }
    if(r.type==='pot'){ handlePotTap(r.root); return; }
    if(r.type==='friend'){ BO.scene.petFriend(r.root); BO.sfx.pop(); toast('💗 Aww!'); return; }
    if(r.type==='critter'){ BO.critters.pet(r.critter); return; }
    if(r.type==='ground'){ handleGroundTap(r.cell); return; }
    if(r.type==='block'){ tryPlace(r.place); return; }
  }

  canvas.addEventListener('pointerdown',function(e){
    if(started && viewMode==='walk' && e.pointerType==='mouse' && !mouseLocked){ canvas.requestPointerLock(); return; }   // first click just captures the mouse
    try{ canvas.setPointerCapture(e.pointerId); }catch(_){}
    active++;
    if(active>1){ multi=true; gesture=null; BO.scene.hideGhost(); return; }
    multi=false;
    gesture={x0:e.clientX,y0:e.clientY,t0:performance.now(),lx:e.clientX,ly:e.clientY,moved:false,id:e.pointerId,target:undefined};
    if(started && tool==='build' && viewMode!=='walk'){ gesture.target=pickTarget(e); ghostFor(gesture.target); }
  });
  canvas.addEventListener('pointermove',function(e){
    if(!gesture||gesture.id!==e.pointerId){
      // hover preview: with no button held, keep the landing box under the mouse cursor
      // (desktop only — touch has no hover, so it stays tap-to-place there)
      if(e.pointerType!=='touch' && started && tool==='build' && viewMode!=='walk'){ ghostFor(pickTarget(e)); }
      return;
    }
    if(!gesture.moved && Math.hypot(e.clientX-gesture.x0,e.clientY-gesture.y0)>THRESH){ gesture.moved=true; BO.scene.hideGhost(); }
    if(viewMode==='walk' && gesture.moved){ BO.scene.walkLook((e.clientX-gesture.lx)*0.005,(e.clientY-gesture.ly)*0.005); }
    gesture.lx=e.clientX; gesture.ly=e.clientY;
  });
  canvas.addEventListener('pointerleave',function(){ if(!gesture && viewMode!=='walk') BO.scene.hideGhost(); });
  canvas.addEventListener('pointerup',function(e){
    active=Math.max(0,active-1);
    if(multi){ if(active===0) multi=false; if(viewMode!=='walk') BO.scene.hideGhost(); return; }
    if(!gesture||gesture.id!==e.pointerId){ if(viewMode!=='walk') BO.scene.hideGhost(); return; }
    var g=gesture; gesture=null; if(viewMode!=='walk') BO.scene.hideGhost();
    if(g.moved || !started) return;
    if(viewMode==='walk'){
      if(e.pointerType==='mouse' && mouseLocked){
        // recompute fresh at the moment of the click rather than trusting the once-per-frame cached walkAim —
        // keeps clicks accurate to the crosshair even if a frame was dropped
        var rr=canvas.getBoundingClientRect(); var aim=BO.scene.resolveTapAt(rr.width/2, rr.height/2);
        if(e.button===2) useAt(aim); else if(e.button===0) breakAt(aim);
        return;
      }
      onTapResolved(walkAim); return;
    }
    onTapResolved(g.target!==undefined ? g.target : pickTarget(e));
  });
  canvas.addEventListener('pointercancel',function(){ active=Math.max(0,active-1); gesture=null; BO.scene.hideGhost(); });
  window.addEventListener('pointerup',function(e){ if(gesture && gesture.id===e.pointerId){ gesture=null; if(viewMode!=='walk') BO.scene.hideGhost(); } });
  window.addEventListener('blur',function(){ gesture=null; active=0; multi=false; });

  function onTapResolved(r){
    if(!r) return;
    if(r.type==='mob'){ BO.mobs.hit(r.mob); return; }
    if(r.type==='critter'){ if(tool==='grab' && r.critter.isPet){ removePet(r.critter); } else { BO.critters.pet(r.critter); } return; }
    if(r.type==='structure'){ if(tool==='grab') removeStructure(r.root); return; }
    if(r.type==='crate'){ openToday(); return; }
    if(tool==='grab'){ if(r.type==='block'||r.type==='pot'||r.type==='friend') removeBlock(r.root); return; }
    if(r.type==='pot'){ handlePotTap(r.root); return; }
    if(r.type==='friend'){ BO.scene.petFriend(r.root); BO.sfx.pop(); toast('💗 Aww!'); return; }
    if(r.type==='ground') handleGroundTap(r.cell);
    else if(r.type==='block') tryPlace(r.place);
  }
  function handlePotTap(root){
    var plant=BO.scene.getPot(root);
    if(!plant){ openSeedPicker(root,false); return; }
    if(plant.stage<3){
      var st=BO.scene.potWater(root); BO.sfx.water();
      if(st>=3){ BO.sfx.bloom(); toast('✨ It bloomed! Beautiful!'); } else { BO.sfx.grow(); }
      persist(); return;
    }
    openSeedPicker(root,true);
  }

  /* ---------- undo last placed piece ---------- */
  function updateUndo(){ var b=$('undoBtn'); if(b) b.style.display = placedStack.length ? 'flex' : 'none'; }
  function doUndo(){ while(placedStack.length){ var k=placedStack.pop(); var r=occ.get(k); if(r){ removeBlock(r); return; } } updateUndo(); }
  $('undoBtn').addEventListener('click',doUndo);

  /* ---------- palette + category tabs ---------- */
  var curCat='blocks';
  function renderTabs(){
    var el=$('tabs'); el.innerHTML='';
    BO.CATEGORIES.forEach(function(c){
      var b=document.createElement('button'); b.className='tab'+(c.id===curCat?' on':''); b.dataset.cat=c.id;
      b.innerHTML='<span class="tab-e">'+c.emoji+'</span><span class="tab-l">'+c.name+'</span>';
      b.addEventListener('click',function(){ curCat=c.id; if(tool==='grab') setTool('build'); renderTabs(); renderPalette(); BO.sfx.click(); });
      el.appendChild(b);
    });
  }
  function renderPalette(){
    var el=$('palette'); el.innerHTML='';
    BO.piecesInCat(curCat).forEach(function(p){
      var b=document.createElement('button'); b.className='pc'; b.dataset.id=p.id;
      var ic=document.createElement('span'); ic.className='pc-ic';
      if(p.emoji){ ic.classList.add('emoji'); ic.textContent=p.emoji; }
      else if(p.kind==='rainbow'){ ic.classList.add('rb'); }
      else if(p.kind==='glass'){ ic.classList.add('glass'); ic.style.background=p.color; }
      else { ic.style.background=p.color; }
      var nm=document.createElement('span'); nm.className='pc-nm'; nm.textContent=p.name;
      b.appendChild(ic); b.appendChild(nm);
      b.addEventListener('click',function(){ if(tool==='grab') setTool('build'); selectPiece(p.id); BO.sfx.click(); });
      el.appendChild(b);
    });
    updatePaletteCounts();
  }
  function updatePaletteCounts(){
    document.querySelectorAll('#palette .pc').forEach(function(b){
      b.classList.toggle('sel', b.dataset.id===curPiece && tool==='build');
    });
  }
  function selectPiece(id){ curPiece=id; updatePaletteCounts(); updateSelLabel(); }
  function selectFirstAvailable(){
    curPiece = BO.PIECES[0].id;
    updatePaletteCounts(); updateSelLabel();
  }
  function updateSelLabel(){
    var p=BO.piece(curPiece);
    $('selLabel').textContent = tool==='grab' ? '🗑️ Erase — tap a block to remove' : ('👆 Tap to place: '+(p?p.name:'')+(placeRot?'  ↻'+(placeRot*90)+'°':''));
  }

  /* ---------- tools ---------- */
  function updateWalkBtn(){ var b=$('buildBtn'); if(!b) return; var er=tool==='grab'; b.classList.toggle('erase',er); b.innerHTML=er?'🗑️':'🔨'; }
  function setTool(t){
    tool=t;
    $('toolBuild').classList.toggle('on',t==='build');
    $('toolGrab').classList.toggle('on',t==='grab');
    document.body.classList.toggle('grab-mode',t==='grab');
    updatePaletteCounts(); updateSelLabel(); updateWalkBtn();
  }
  $('toolBuild').addEventListener('click',function(){ setTool('build'); toast('🧱 Build mode'); BO.sfx.click(); });
  $('toolGrab').addEventListener('click',function(){ setTool('grab'); toast('🗑️ Erase mode — remove blocks'); BO.sfx.click(); });
  $('toolRotate').addEventListener('click',function(){ placeRot=(placeRot+1)%4; if(tool!=='build') setTool('build'); updateSelLabel(); BO.sfx.click(); toast('↻ Turned to '+(placeRot*90)+'° — great for stairs & fences!'); });
  $('toolRecenter').addEventListener('click',function(){ if(viewMode==='walk'){ BO.scene.recenterWalk(); toast('🎯 Back to the middle'); } else { BO.scene.frameCamera(); toast('🎯 View reset'); } BO.sfx.click(); });

  /* ---------- fly / walk mode ---------- */
  var viewMode='orbit';
  var ICON_MOVE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16M4 12h16"/><path d="M9.6 6.4L12 4l2.4 2.4M9.6 17.6L12 20l2.4-2.4M6.4 9.6L4 12l2.4 2.4M17.6 9.6L20 12l-2.4 2.4"/></svg>';
  var ICON_ORBIT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.6 4.6V8h-3.4"/></svg>';
  function setView(m){
    viewMode=m;
    BO.scene.setMode(m);
    document.body.classList.toggle('walking', m==='walk');
    $('toolMode').querySelector('.tl').textContent = 'Walk';
    $('toolMode').classList.toggle('on', m==='walk');
    updateWalkBtn();
    updateMonsterUI();
    resetSticks();
    toast(m==='walk' ? (isTouchDevice ? '🚶 Sticks move & look • tap the screen to build!' : '🖱️ Click to look around • left-click break, right-click place • Esc for menu') : '🔭 Back to bird\'s-eye view');
  }
  $('toolMode').addEventListener('click',function(){ setView(viewMode==='walk'?'orbit':'walk'); BO.sfx.click(); });

  /* ---------- walk controls: dual thumbsticks + keyboard ---------- */
  function makeStick(el, knob, R, dead, onChange){
    var id=null, cx=0, cy=0;
    function forceEnd(){ id=null; knob.style.transform='translate(0,0)'; onChange(0,0); }
    function start(e){ id=e.pointerId; var r=el.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height/2; try{ el.setPointerCapture(e.pointerId); }catch(_){} move(e); }
    function move(e){ if(id!==e.pointerId) return; var dx=e.clientX-cx, dy=e.clientY-cy, d=Math.hypot(dx,dy); if(d>R){ dx=dx/d*R; dy=dy/d*R; } knob.style.transform='translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px)'; var nx=dx/R, ny=dy/R; if(Math.hypot(nx,ny)<dead){ nx=0; ny=0; } onChange(nx,ny); }
    function end(e){ if(e && id!==e.pointerId) return; forceEnd(); }
    el.addEventListener('pointerdown',start);
    el.addEventListener('pointermove',move);
    el.addEventListener('pointerup',end);
    el.addEventListener('pointercancel',end);
    el.addEventListener('lostpointercapture',end);
    window.addEventListener('pointerup',forceEnd);
    window.addEventListener('pointercancel',forceEnd);
    window.addEventListener('touchend',forceEnd);
    window.addEventListener('mouseup',forceEnd);
    window.addEventListener('blur',forceEnd);
    document.addEventListener('visibilitychange',function(){ if(document.hidden) forceEnd(); });
    return { reset:forceEnd };
  }
  var moveStick=makeStick($('joystick'), $('joyknob'), 46, 0.14, function(nx,ny){ BO.scene.setJoy(nx, -ny); });
  var lookStick=makeStick($('lookstick'), $('lookknob'), 46, 0.14, function(nx,ny){ BO.scene.setLook(nx, ny); });
  function resetSticks(){ if(moveStick) moveStick.reset(); if(lookStick) lookStick.reset(); if(BO.scene){ BO.scene.setJoy(0,0); BO.scene.setLook(0,0); } }

  /* keyboard: WASD move, arrow keys look/turn (works in walk; WASD auto-enters walk) */
  var KEYMAP={KeyW:'fwd',KeyS:'back',KeyA:'turnL',KeyD:'turnR',ArrowUp:'fwd',ArrowDown:'back',ArrowLeft:'turnL',ArrowRight:'turnR'};
  function onKey(e,down){
    if(e.code==='Space'){ if(down && started && viewMode==='walk') BO.scene.jump(); if(viewMode==='walk') e.preventDefault(); return; }
    if(e.code==='Enter'){ if(down && started && viewMode==='walk' && walkAim) onTapResolved(walkAim); if(down && viewMode==='walk') e.preventDefault(); return; }
    var k=KEYMAP[e.code]; if(!k) return;
    if(viewMode!=='walk'){
      if(down && (k==='fwd'||k==='back'||k==='left'||k==='right')){ setView('walk'); }
      else return;
    }
    BO.scene.setKey(k,down); e.preventDefault();
  }
  window.addEventListener('keydown',function(e){ onKey(e,true); });
  window.addEventListener('keyup',function(e){ onKey(e,false); });

  /* ---------- build while walking: aim from screen centre ---------- */
  var walkAim=null;
  function walkAimTick(){
    if(started && viewMode==='walk' && (tool==='build'||tool==='grab')){
      var r=canvas.getBoundingClientRect();
      walkAim=BO.scene.resolveTapAt(r.width/2, r.height/2);
      if(tool==='build') ghostFor(walkAim); else BO.scene.hideGhost();
    } else if(walkAim!==null){ walkAim=null; if(viewMode==='walk') BO.scene.hideGhost(); }
    requestAnimationFrame(walkAimTick);
  }
  requestAnimationFrame(walkAimTick);
  $('buildBtn').addEventListener('click',function(){ if(walkAim){ onTapResolved(walkAim); BO.sfx.click(); } else { toast('Look down at the ground to aim 🔨'); } });
  $('jumpBtn').addEventListener('click',function(){ if(viewMode==='walk') BO.scene.jump(); });

  /* ---------- HUD ---------- */
  function updateHUD(){
    $('dayNum').textContent='Day '+(state.day||1);
    $('todayBtn').classList.toggle('hasnew', state.crateSeen!==state.lastCrateDay);
  }

  /* ---------- today's crate card ---------- */
  function openToday(){
    var crate=BO.makeCrate(state.day, state.lastCrateDay);
    $('tcEmoji').textContent=crate.emoji;
    $('tcName').textContent=crate.name;
    $('tcDay').textContent='Day '+(state.day||1);
    var g=$('tcItems'); g.innerHTML='';
    Object.keys(crate.items).forEach(function(id){
      var p=BO.piece(id); if(!p) return;
      var row=document.createElement('div'); row.className='tc-item';
      var ic=document.createElement('span'); ic.className='pc-ic';
      if(p.emoji){ ic.classList.add('emoji'); ic.textContent=p.emoji; }
      else if(p.kind==='rainbow'){ ic.classList.add('rb'); }
      else { ic.style.background=p.color; if(p.kind==='glass') ic.classList.add('glass'); }
      var nm=document.createElement('span'); nm.className='tc-nm'; nm.textContent=p.name;
      var ct=document.createElement('span'); ct.className='tc-x'; ct.textContent='×'+crate.items[id];
      row.appendChild(ic); row.appendChild(nm); row.appendChild(ct); g.appendChild(row);
    });
    $('todayCard').classList.add('show');
    BO.sfx.open();
    state.crateSeen=state.lastCrateDay; BO.save(state); updateHUD();
  }
  $('tcClose').addEventListener('click',function(){ $('todayCard').classList.remove('show'); });
  $('todayBtn').addEventListener('click',openToday);

  /* ---------- menu ---------- */
  var menu=$('menuSheet');
  $('menuBtn').addEventListener('click',function(){ menu.classList.add('show'); });
  $('menuX').addEventListener('click',function(){ menu.classList.remove('show'); });
  menu.addEventListener('click',function(e){ if(e.target===menu) menu.classList.remove('show'); });
  $('muteBtn').addEventListener('click',function(){
    var m=BO.audio.toggle();
    $('muteLbl').textContent='Sound: '+(m?'Off':'On');
    document.querySelector('#muteBtn .me').textContent=m?'🔇':'🔊';
    var vs=$('volSlider'); if(vs && !m) vs.value=Math.round((BO.audio.getVolume?BO.audio.getVolume():0.62)*100);
  });
  (function(){ var vs=$('volSlider'); if(!vs) return; vs.value=Math.round((BO.audio.getVolume?BO.audio.getVolume():0.62)*100); vs.addEventListener('input',function(){ if(BO.audio.setVolume) BO.audio.setVolume(this.value/100); var m=BO.audio.isMuted(); $('muteLbl').textContent='Sound: '+(m?'Off':'On'); document.querySelector('#muteBtn .me').textContent=m?'🔇':'🔊'; }); })();
  $('labBtn').addEventListener('click',function(){ if(window.MayaPortal){ MayaPortal.leaveToLab(); } else { history.back(); } });
  $('resetBtn').addEventListener('click',function(){
    if(confirm('Start a brand new world? This clears everything you built.')){ BO.wipe(); location.reload(); }
  });

  /* ---------- build area size ---------- */
  function updateSizeSeg(){ document.querySelectorAll('#sizeSeg [data-half]').forEach(function(b){ b.classList.toggle('on', +b.dataset.half===BO.HALF); }); }
  document.querySelectorAll('#sizeSeg [data-half]').forEach(function(b){
    b.addEventListener('click',function(){
      var h=+b.dataset.half; if(h===BO.HALF) return;
      BO.scene.setYardSize(h); if(state) state.half=h; updateSizeSeg();
      if(started) persist(); BO.sfx.star();
      var nm={14:'Cozy',20:'Big',28:'Huge',40:'Giant'}[h]||'';
      toast('🌍 '+nm+' yard — build away!');
    });
  });

  /* ---------- weather ---------- */
  function buildRain(){ var r=$('rainLayer'); if(!r||r.childElementCount) return; var h=''; for(var i=0;i<70;i++){ h+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;height:'+(12+Math.random()*14).toFixed(0)+'px;animation-duration:'+(0.5+Math.random()*0.6).toFixed(2)+'s;animation-delay:'+(Math.random()*2).toFixed(2)+'s"></i>'; } r.innerHTML=h; }
  function applyWeather(){ document.body.classList.toggle('rainy', !!(state&&state.weather==='rainy')); }
  function applyWorld(){ if(!state) return; BO.scene.setWorld({time:state.time||'day', env:state.env||'water', sky:state.sky||'clouds'}); applyWeather(); if(BO.ambience) BO.ambience.set({time:state.time||'day', env:state.env||'water', weather:state.weather||'sunny'}); updateWorldSeg(); }
  function updateWorldSeg(){ if(!state) return; function set(id,val){ document.querySelectorAll('#'+id+' [data-v]').forEach(function(b){ b.classList.toggle('on', b.dataset.v===val); }); } set('segTime',state.time||'day'); set('segWeather',state.weather||'sunny'); set('segEnv',state.env||'water'); set('segSky',state.sky||'clouds'); }
  function wireSeg(id,key,after){ document.querySelectorAll('#'+id+' [data-v]').forEach(function(b){ b.addEventListener('click',function(){ if(!state) return; state[key]=b.dataset.v; if(after) after(); applyWorld(); persist(); BO.sfx.click(); }); }); }
  wireSeg('segTime','time'); wireSeg('segWeather','weather',function(){ buildRain(); }); wireSeg('segEnv','env'); wireSeg('segSky','sky');
  $('worldBtn').addEventListener('click',function(){ $('worldSheet').classList.add('show'); });
  $('worldX').addEventListener('click',function(){ $('worldSheet').classList.remove('show'); });
  $('worldSheet').addEventListener('click',function(e){ if(e.target===$('worldSheet')) $('worldSheet').classList.remove('show'); });

  /* ---------- seed picker (plant pot) ---------- */
  var pickerPot=null;
  function renderSeeds(){
    var g=$('seedGrid'); if(!g) return; g.innerHTML='';
    (BO.SEEDS||[]).forEach(function(s){
      var b=document.createElement('button'); b.className='seed-opt';
      b.innerHTML='<span class="se">'+s.emoji+'</span><span class="sn">'+s.name+'</span>';
      b.addEventListener('click',function(){ chooseSeed(s); });
      g.appendChild(b);
    });
  }
  function openSeedPicker(root, replant){
    pickerPot=root;
    $('seedTitle').textContent = replant ? '🌸 Plant something new!' : 'What should we plant?';
    $('seedSheet').classList.add('show'); BO.sfx.click();
  }
  function closeSeeds(){ $('seedSheet').classList.remove('show'); pickerPot=null; }
  function chooseSeed(s){
    if(!pickerPot) return;
    BO.scene.potPlant(pickerPot, s.emoji);
    BO.sfx.plant();
    toast('Now tap the pot to water it 💧');
    $('seedSheet').classList.remove('show');
    persist();
    pickerPot=null;
  }
  $('seedX').addEventListener('click',closeSeeds);
  $('seedSheet').addEventListener('click',function(e){ if(e.target===$('seedSheet')) closeSeeds(); });

  /* ---------- monsters (mobs you fight off) ---------- */
  function initMobs(){
    BO.mobs.init({
      onBite:onBitten,
      canBite:function(){ return playerAlive && invuln<=0; },
      onDefeat:onMobDefeated,
      onChange:onMonsterState
    });
    setInterval(function(){
      if(invuln>0) invuln=Math.max(0,invuln-0.25);
      if(BO.mobs.isActive() && BO.scene.isWalking() && playerAlive && hearts<maxHearts){
        regenT+=0.25; if(regenT>=3.2){ regenT=0; hearts=Math.min(maxHearts,hearts+1); renderHearts(); }
      }
    }, 250);
    renderHearts();
  }
  function renderHearts(){ var r=$('heartsRow'); if(!r) return; var s=''; for(var i=0;i<maxHearts;i++){ s += i<hearts ? '❤️' : '🖤'; } r.textContent=s; }
  function updateMonsterUI(){
    var on = !!(BO.mobs && BO.mobs.isActive && BO.mobs.isActive());
    var mb=$('monsterBtn'); if(mb) mb.classList.toggle('on', on);
    var hc=$('heartsChip'); if(hc) hc.style.display = (on && BO.scene.isWalking()) ? 'flex' : 'none';
    renderHearts();
  }
  function onMonsterState(on){ document.body.classList.toggle('monsters-on', !!on); if(!on) showFightHint(false); updateMonsterUI(); }
  function onMobDefeated(n,reason){ showFightHint(false); if(reason==='trap'){ toast('📦 Trapped it! Way to go! ⭐'); } else if(n>0 && n%5===0){ toast('💥 '+n+' monsters bopped! Wow!'); } }
  var fightHintT=null;
  function showFightHint(on){ var h=$('fightHint'); if(!h) return; if(fightHintT){ clearTimeout(fightHintT); fightHintT=null; } if(on){ h.classList.add('show'); fightHintT=setTimeout(function(){ if(h) h.classList.remove('show'); }, 7000); } else { h.classList.remove('show'); } }
  function flashHurt(){ var f=$('hurtFx'); if(!f) return; f.classList.add('flash'); setTimeout(function(){ f.classList.remove('flash'); }, 150); }
  function onBitten(){
    if(!playerAlive || invuln>0) return;
    hearts=Math.max(0,hearts-1); invuln=1.0; regenT=0;
    renderHearts(); flashHurt(); BO.sfx.hurt();
    if(hearts<=0) oof();
  }
  function oof(){
    playerAlive=false; BO.mobs.reset();
    toast('😵 Oof! The monsters won that round — tap 👾 to try again!');
    setTimeout(function(){
      if(BO.scene.isWalking()) BO.scene.recenterWalk();
      hearts=maxHearts; playerAlive=true; invuln=1.2; regenT=0;
      renderHearts(); updateMonsterUI();
    }, 950);
  }
  $('monsterBtn').addEventListener('click',function(){
    if(!started) return;
    BO.mobs.toggle(); BO.sfx.click();
    if(BO.mobs.isActive()){
      hearts=maxHearts; playerAlive=true; invuln=0; regenT=0; renderHearts();
      showFightHint(true);
      toast(BO.scene.isWalking() ? '👾 Monsters incoming! Tap one to bonk it 👊' : '👾 Tap a monster to bonk it — or Walk in & wall them off!');
    } else { showFightHint(false); toast('☮️ Sent the monsters home — build in peace!'); }
  });
  $('bonkBtn').addEventListener('click',function(){ if(BO.mobs.isActive()){ BO.mobs.bonkFront(); BO.sfx.click(); } });

  /* ---------- wildlife (animals that roam the island) ---------- */
  function initCritters(){ if(!BO.critters) return; BO.critters.init({ onPet:function(){ if(BO.sfx.critter) BO.sfx.critter(); } }); BO.critters.setActive(!state || state.wildlife!==false); updatePetBtn(); }
  function updatePetBtn(){ var b=$('petBtn'); if(b) b.classList.toggle('on', !!(BO.critters&&BO.critters.isActive())); }
  $('petBtn').addEventListener('click',function(){ if(!started) return; var on=BO.critters.toggle(); if(state){ state.wildlife=on; persist(); } updatePetBtn(); BO.sfx.click(); toast(on?'🐾 The animals came out to play!':'🐾 The animals went home for a nap'); });

  /* placed "Friends" become REAL roaming animals (pets), saved across reloads */
  function placePet(id, cell){
    if(!BO.critters) return false;
    state.pets = state.pets||[]; state.petSeq=(state.petSeq||0)+1; var pid=state.petSeq;
    state.pets.push({id:pid, t:id, x:cell.x, z:cell.z});
    BO.critters.spawnPet(id, cell.x, cell.z, pid);
    BO.sfx.place(); if(BO.sfx.critter) BO.sfx.critter();
    var nm=(BO.piece(id)||{}).name||'friend';
    toast('🐾 A '+nm+' came to life — it roams your world now!');
    persist(); return true;
  }
  function migratePets(){
    state.pets = state.pets||[];
    if(state.blocks && state.blocks.length){
      var remain=[]; state.blocks.forEach(function(b){ var pp=BO.piece(b.t); if(pp && pp.kind==='friend'){ state.petSeq=(state.petSeq||0)+1; state.pets.push({id:state.petSeq, t:b.t, x:b.x, z:b.z}); } else remain.push(b); });
      state.blocks=remain;
    }
    state.pets.forEach(function(pt){ if((pt.id||0)>(state.petSeq||0)) state.petSeq=pt.id; });
  }
  function spawnPets(){ (state.pets||[]).forEach(function(pt){ if(BO.critters && BO.piece(pt.t)) BO.critters.spawnPet(pt.t, pt.x, pt.z, pt.id); }); }
  function removePet(critter){
    if(!critter || critter.petId==null) return;
    state.pets = (state.pets||[]).filter(function(pt){ return pt.id!==critter.petId; });
    BO.critters.removePet(critter.petId);
    BO.sfx.pop(); toast('👋 Bye, little friend!');
    persist();
  }

  /* toast */
  var toastT=null;
  function toast(msg){ var t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('show'); },2400); }
})();
