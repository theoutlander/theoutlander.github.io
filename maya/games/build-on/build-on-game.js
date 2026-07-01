/* ===== Build On — game logic & UI wiring ===== */
(function(){
  var BO=window.BO;
  var canvas=document.getElementById('view');
  var state=null, occ=new Map(), curPiece=null, tool='build', started=false, placedStack=[];

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
    BO.audio.resume();
    state=BO.load();
    if(!state||!state.started){
      state={ started:true, day:1, inv:{}, blocks:[], lastCrateDay:BO.todayKey(), crateSeen:null };
      addItems(BO.makeCrate(1,state.lastCrateDay).items);
      BO.save(state);
    } else {
      dayRollover();
    }
    if(!state.half) state.half=BO.HALF;
    BO.scene.setYardSize(state.half);
    restoreBlocks();
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
    applyWorld();
    $('splash').classList.add('gone');
    setTimeout(function(){ $('splash').style.display='none'; }, 560);
    if(state.crateSeen!==state.lastCrateDay){ setTimeout(openToday, 420); }
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
      var root=BO.scene.placePiece(b.t,{x:b.x,y:b.y,z:b.z},b.c,b.pot);
      occ.set(key(b),root);
    });
  }
  function persist(){
    state.blocks=[];
    occ.forEach(function(root){ var m=root.metadata; var rec={x:m.cell.x,y:m.cell.y,z:m.cell.z,t:m.pieceId,c:m.color}; if(m.interactive==='pot'&&m.plant){ rec.pot={seed:m.plant.seed,stage:m.plant.stage}; } state.blocks.push(rec); });
    BO.save(state);
  }

  /* ---------- placement ---------- */
  function columnTop(x,z){
    var top=-1;
    occ.forEach(function(r){ var m=r.metadata.cell; if(m.x===x&&m.z===z&&m.y>top) top=m.y; });
    return top;
  }
  function columnTopHeight(x,z){ var cx=Math.round(x), cz=Math.round(z); if(cx<-BO.HALF||cx>BO.HALF||cz<-BO.HALF||cz>BO.HALF) return 0; var t=columnTop(cx,cz); return t>=0 ? t+1 : 0; }
  function tryPlace(cell){
    if(cell.x<-BO.HALF||cell.x>BO.HALF||cell.z<-BO.HALF||cell.z>BO.HALF) return false;
    if(cell.y<0||cell.y>BO.MAXY) return false;
    if(occ.has(key(cell))) return false;
    if(!curPiece) return false;
    var p=BO.piece(curPiece);
    var color = p.rand ? BO.RAINBOW_COLORS[Math.floor(Math.random()*BO.RAINBOW_COLORS.length)] : (p.color||null);
    var root=BO.scene.placePiece(curPiece,cell,color);
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
    if(!started || tool!=='build' || !t || t.type==='crate' || t.type==='pot' || t.type==='friend' || !curPiece){ BO.scene.hideGhost(); return; }
    var cell=placementCell(t);
    if(!cell || cell.x<-BO.HALF||cell.x>BO.HALF||cell.z<-BO.HALF||cell.z>BO.HALF||cell.y<0||cell.y>BO.MAXY){ BO.scene.hideGhost(); return; }
    var p=BO.piece(curPiece); BO.scene.showGhostAt(cell, (p&&p.color)||'#f2e9ff');
  }
  canvas.addEventListener('pointerdown',function(e){
    active++;
    if(active>1){ multi=true; gesture=null; BO.scene.hideGhost(); return; }
    multi=false;
    gesture={x0:e.clientX,y0:e.clientY,t0:performance.now(),lx:e.clientX,ly:e.clientY,moved:false,id:e.pointerId,target:undefined};
    if(started && tool==='build' && viewMode!=='walk'){ gesture.target=pickTarget(e); ghostFor(gesture.target); }
  });
  canvas.addEventListener('pointermove',function(e){
    if(!gesture||gesture.id!==e.pointerId) return;
    if(!gesture.moved && Math.hypot(e.clientX-gesture.x0,e.clientY-gesture.y0)>THRESH){ gesture.moved=true; BO.scene.hideGhost(); }
    if(viewMode==='walk' && gesture.moved){ BO.scene.walkLook((e.clientX-gesture.lx)*0.005,(e.clientY-gesture.ly)*0.005); }
    gesture.lx=e.clientX; gesture.ly=e.clientY;
  });
  canvas.addEventListener('pointerup',function(e){
    active=Math.max(0,active-1);
    if(multi){ if(active===0) multi=false; if(viewMode!=='walk') BO.scene.hideGhost(); return; }
    if(!gesture||gesture.id!==e.pointerId){ if(viewMode!=='walk') BO.scene.hideGhost(); return; }
    var g=gesture; gesture=null; if(viewMode!=='walk') BO.scene.hideGhost();
    if(g.moved || !started) return;
    if(viewMode==='walk'){ onTapResolved(walkAim); return; }
    onTapResolved(g.target!==undefined ? g.target : pickTarget(e));
  });
  canvas.addEventListener('pointercancel',function(){ active=Math.max(0,active-1); gesture=null; BO.scene.hideGhost(); });

  function onTapResolved(r){
    if(!r) return;
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
    $('selLabel').textContent = tool==='grab' ? '🗑️ Erase — tap a block to remove' : ('👆 Tap to place: '+(p?p.name:''));
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
    toast(m==='walk' ? '🚶 Sticks move & look • tap the screen to build!' : '🔭 Back to bird\'s-eye view');
  }
  $('toolMode').addEventListener('click',function(){ setView(viewMode==='walk'?'orbit':'walk'); BO.sfx.click(); });

  /* ---------- walk controls: dual thumbsticks + keyboard ---------- */
  function makeStick(el, knob, R, dead, onChange){
    var id=null, cx=0, cy=0;
    function start(e){ id=e.pointerId; var r=el.getBoundingClientRect(); cx=r.left+r.width/2; cy=r.top+r.height/2; try{ el.setPointerCapture(e.pointerId); }catch(_){} move(e); }
    function move(e){ if(id!==e.pointerId) return; var dx=e.clientX-cx, dy=e.clientY-cy, d=Math.hypot(dx,dy); if(d>R){ dx=dx/d*R; dy=dy/d*R; } knob.style.transform='translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px)'; var nx=dx/R, ny=dy/R; if(Math.hypot(nx,ny)<dead){ nx=0; ny=0; } onChange(nx,ny); }
    function end(e){ if(id!==e.pointerId) return; id=null; knob.style.transform='translate(0,0)'; onChange(0,0); }
    el.addEventListener('pointerdown',start);
    el.addEventListener('pointermove',move);
    el.addEventListener('pointerup',end);
    el.addEventListener('pointercancel',end);
  }
  makeStick($('joystick'), $('joyknob'), 46, 0.14, function(nx,ny){ BO.scene.setJoy(nx, -ny); });
  makeStick($('lookstick'), $('lookknob'), 46, 0.14, function(nx,ny){ BO.scene.setLook(nx, ny); });

  /* keyboard: WASD move, arrow keys look/turn (works in walk; WASD auto-enters walk) */
  var KEYMAP={KeyW:'fwd',KeyS:'back',KeyA:'left',KeyD:'right',ArrowUp:'lookU',ArrowDown:'lookD',ArrowLeft:'turnL',ArrowRight:'turnR'};
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
  });
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
      var nm={10:'Cozy',14:'Big',19:'Huge',25:'Giant'}[h]||'';
      toast('🌍 '+nm+' yard — build away!');
    });
  });

  /* ---------- weather ---------- */
  function buildRain(){ var r=$('rainLayer'); if(!r||r.childElementCount) return; var h=''; for(var i=0;i<70;i++){ h+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;height:'+(12+Math.random()*14).toFixed(0)+'px;animation-duration:'+(0.5+Math.random()*0.6).toFixed(2)+'s;animation-delay:'+(Math.random()*2).toFixed(2)+'s"></i>'; } r.innerHTML=h; }
  function applyWeather(){ document.body.classList.toggle('rainy', !!(state&&state.weather==='rainy')); }
  function applyWorld(){ if(!state) return; BO.scene.setWorld({time:state.time||'day', env:state.env||'water', sky:state.sky||'clouds'}); applyWeather(); updateWorldSeg(); }
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

  /* toast */
  var toastT=null;
  function toast(msg){ var t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('show'); },2400); }
})();
