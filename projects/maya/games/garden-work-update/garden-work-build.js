/* ===== Garden Work — Garden Time: build beds, plant & water freely ===== */
(function(){
  var GW = window.GW;
  var ghost=document.querySelector('#ghost');
  var bedSeq=0;
  GW.curBed=null;
  GW.mode='idle';                 // 'idle' | 'placing' | 'planting'
  var selectedPlant=null, placingShape=null, palette=null;

  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function usedPlots(){ return GW.state.beds.map(function(b){return b.plot;}).filter(function(p){return p!=null;}); }
  function nearestEmptyPlot(dx,dy){
    var used=usedPlots(), best=null, bd=1e9, bi=-1;
    GW.PLOTS.forEach(function(p,i){ if(used.indexOf(i)>=0) return;
      var d=(p.x-dx)*(p.x-dx)+(p.y-dy)*(p.y-dy); if(d<bd){bd=d;best=p;bi=i;} });
    return best?{plot:best,idx:bi}:null;
  }
  function syncSeq(){ GW.state.beds.forEach(function(b){ if(b.id>bedSeq) bedSeq=b.id; }); }

  // ---------- TRAY (shape / seed picker) ----------
  function showTray(label, opts, onPick, selId, onDone){
    GW.tray.innerHTML='';
    var lbl=document.createElement('div'); lbl.className='tray-lbl'; lbl.textContent=label; GW.tray.appendChild(lbl);
    var x=document.createElement('button'); x.className='tray-x'; x.innerHTML='✕';
    x.addEventListener('click',function(){ GW.sfx.click(); (onDone||goIdle)(); });
    GW.tray.appendChild(x);
    var row=document.createElement('div'); row.className='tray-row';
    opts.forEach(function(o){
      var b=document.createElement('button'); b.className='opt'+(o.id===selId?' sel':'');
      b.dataset.id=o.id;
      b.innerHTML='<span class="oe">'+o.em+'</span><span class="on">'+o.name+'</span>';
      b.addEventListener('click',function(){ GW.sfx.click(); onPick(o); });
      row.appendChild(b);
    });
    GW.tray.appendChild(row);
    var fade=document.createElement('div'); fade.className='tray-fade'; fade.textContent='›'; GW.tray.appendChild(fade);
    if(palette) palette.style.display='none';   // popup replaces the bottom row (no shrinking)
    GW.tray.classList.remove('hidden');
    setTimeout(function(){ if(row.scrollWidth<=row.clientWidth+4){ fade.style.display='none'; } },30);
  }
  function highlightSeed(id){
    GW.tray.querySelectorAll('.opt').forEach(function(b){ if(b.dataset.id) b.classList.toggle('sel', b.dataset.id===id); });
  }
  function hideTray(){ GW.tray.classList.add('hidden'); if(palette && GW.state && GW.state.buildStep==='garden') palette.style.display='flex'; }
  function clearTransient(){ placingShape=null; ghost.style.display='none'; }

  // ---------- PALETTE ----------
  function makePalette(){
    if(palette) return palette;
    palette=document.createElement('div'); palette.id='palette';
    [['bed','🪵','Bed'],['plant','🌱','Plant'],['water','💧','Water'],['sleep','😴','Sleep']].forEach(function(a){
      var b=document.createElement('button'); b.className='pal-btn pal-'+a[0]; b.dataset.act=a[0];
      b.innerHTML='<span class="pe">'+a[1]+'</span><span class="pl">'+a[2]+'</span>';
      b.addEventListener('click',function(){ GW.audio.resume(); GW.sfx.click(); paletteAction(a[0]); });
      palette.appendChild(b);
    });
    document.getElementById('toolbar').insertBefore(palette, document.getElementById('doneBtn'));
    return palette;
  }
  function setActiveBtn(act){
    if(!palette) return;
    palette.querySelectorAll('.pal-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.act===act); });
  }
  function resetPlantBtn(){ setPlantBtn(null); }
  function goIdle(){ GW.mode='idle'; clearTransient(); deselectBed(); setActiveBtn(null); resetPlantBtn(); hideTray(); }
  function paletteAction(act){
    if(act==='bed'){ goIdle(); enterBedMode(); }
    else if(act==='plant'){ if(GW.mode==='planting'){ goIdle(); GW.setBanner('Garden Time! 🌱'); } else { goIdle(); openSeedTray(); } }
    else if(act==='water'){ goIdle(); waterAll(); }
    else if(act==='sleep'){ doSleep(); }
  }

  GW.startGardenTime=function(){
    syncSeq(); goIdle(); makePalette(); palette.style.display='flex';
    GW.hideTool(); GW.hideDone();
    GW.state.builtToday=true; GW.state.buildStep='garden'; GW.save();
    var ripe=GW.ripeCount?GW.ripeCount():0;
    GW.setBanner(ripe ? 'Pick your ripe plants, then keep gardening! 🧺' : 'Garden Time! Build, plant &amp; water 🌱');
  };
  GW.endGardenTimeUI=function(){ if(palette) palette.style.display='none'; hideTray(); ghost.style.display='none'; };

  // ---------- BED MODE ----------
  function enterBedMode(){ setActiveBtn('bed'); openShapeTray(); }
  function openShapeTray(){
    clearTransient();
    var opts=Object.keys(GW.SHAPES).map(function(k){var s=GW.SHAPES[k];return {id:k,em:s.icon,name:s.label};});
    showTray('Choose a bed shape', opts, function(o){ chooseShape(o.id); }, placingShape, function(){ goIdle(); GW.setBanner('Garden Time! 🌱'); setTimeout(GW.hideBanner,1000); });
  }
  function chooseShape(shape){
    placingShape=shape; hideTray(); GW.mode='placing';
    GW.sizeGhost(shape); ghost.style.display='block';
    var n=nearestEmptyPlot(GW.YARD.x,GW.YARD.y); var p=n?n.plot:GW.PLOTS[0];
    ghost.style.left=p.x+'px'; ghost.style.top=p.y+'px';
    GW.setBanner('Tap a sunny spot to put your bed! ☀️');
  }
  GW.field.addEventListener('pointermove',function(e){
    if(GW.mode==='placing' && placingShape){
      var d=GW.toDesign(e.clientX,e.clientY); var n=nearestEmptyPlot(d.x,d.y);
      var p=n?n.plot:{x:clamp(d.x,90,GW.DESIGN_W-90),y:clamp(d.y,250,GW.DESIGN_H-110)};
      ghost.style.left=p.x+'px'; ghost.style.top=p.y+'px';
    }
  });
  function placeBed(dx,dy){
    var n=nearestEmptyPlot(dx,dy);
    var pos=n?n.plot:{x:clamp(dx,90,GW.DESIGN_W-90),y:clamp(dy,250,GW.DESIGN_H-110)};
    var sh=GW.SHAPES[placingShape];
    var bed={ id:++bedSeq, shape:placingShape, x:pos.x, y:pos.y, plot:n?n.idx:null,
      soil:false, cells:sh.cells.map(function(){return {plant:null,growth:0,picked:false,watered:false};}) };
    GW.state.beds.push(bed); GW.curBed=bed;
    GW.makeBedEl(bed); GW.paintBed(bed);
    GW.mode='idle'; clearTransient(); setActiveBtn(null); GW.sfx.wood();
    bed._el.animate([{transform:'translate(-50%,-50%) scale(.4)',opacity:.3},{transform:'translate(-50%,-50%) scale(1.08)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:360,easing:'ease-out'});
    GW.walkTo(Math.max(110,Math.min(610,bed.x)), Math.min(bed.y+92, GW.DESIGN_H-60));
    GW.sfx.pour();
    GW.pourOver(bed,'🟫',9,function(){
      bed.soil=true; GW.paintBed(bed); if(GW.addXP) GW.addXP(3); GW.save();
      GW.setBanner('Lovely bed! Tap 🌱 Plant to add seeds');
    });
  }

  // ---------- PLANT MODE ----------
  function availablePlants(){
    return GW.PLANTS.filter(function(p){
      return p.unlock===0 || (p.kind==='magic' && GW.state.magic) || (GW.state.unlockedSeeds||[]).indexOf(p.id)>=0;
    }).map(function(p){ return {id:p.id, em:p.ripe, name:p.name}; });
  }
  function setPlantBtn(id){
    var pb=palette&&palette.querySelector('.pal-plant'); if(!pb) return;
    if(id){ pb.querySelector('.pe').textContent=GW.byId(id).ripe; pb.querySelector('.pl').textContent='Planting'; }
    else { pb.querySelector('.pe').textContent='🌱'; pb.querySelector('.pl').textContent='Plant'; }
  }
  function openSeedTray(){
    clearTransient(); setActiveBtn('plant'); GW.mode='planting';
    var opts=availablePlants();
    if(GW.openShop) opts.push({id:'__shop', em:'🛍️', name:'Shop'});
    // keep the previously chosen seed if still available, else pick the first one
    var ids=opts.map(function(o){return o.id;});
    if(!selectedPlant || ids.indexOf(selectedPlant)<0){ selectedPlant = (opts[0]&&opts[0].id!=='__shop') ? opts[0].id : null; }
    showTray('Tap a seed, then tap the soil 🌱', opts, function(o){
      if(o.id==='__shop'){ GW.openShop('seeds'); return; }
      selectedPlant=o.id; highlightSeed(o.id); setPlantBtn(o.id);
      GW.setBanner('Tap the soil to plant '+GW.byId(o.id).name+'! 🌱');
    }, selectedPlant, function(){ goIdle(); GW.setBanner('Nice gardening! Tap 💧 Water when ready'); setTimeout(GW.hideBanner,1400); });
    setPlantBtn(selectedPlant);
    GW.setBanner(selectedPlant ? ('Tap the soil to plant '+GW.byId(selectedPlant).name+'! 🌱') : 'Pick a seed below 👇');
  }
  function plantAt(b, idx){
    var c=b.cells[idx]; if(!b||!c||(c.plant&&!c.picked)||!b.soil||!selectedPlant) return;
    c.plant=selectedPlant; c.growth=0; c.picked=false; c.golden=false; c.watered=false;
    GW.paintBed(b); GW.sfx.plant();
    var cellEl=b._el && b._el.querySelector('.cell[data-idx="'+idx+'"]');
    if(cellEl){
      var pl=cellEl.querySelector('.plant');
      pl && pl.animate([{transform:'scale(0)'},{transform:'scale(1.3)'},{transform:'scale(1)'}],{duration:280,easing:'ease-out'});
    }
    if(GW.addXP) GW.addXP(2);
    if(GW.discoverPlant) GW.discoverPlant(selectedPlant);
    GW.save();
  }

  // ---------- WATER (one tap waters the whole garden) ----------
  function waterAll(){
    var thirsty=[];
    GW.state.beds.forEach(function(bed){ var any=false;
      bed.cells.forEach(function(c){ if(c.plant && !c.picked && c.growth<2 && !c.watered){ c.watered=true; any=true; } });
      if(any) thirsty.push(bed); GW.paintBed(bed);
    });
    if(!thirsty.length){ GW.setBanner('Nothing needs water yet 💧'); GW.sfx.click(); return; }
    GW.sfx.water();
    thirsty.forEach(function(bed){ GW.pourOver(bed,'💧',6); });
    GW.confetti(12); GW.save();
    GW.setBanner('All watered! They will grow tonight 🌙');
  }

  // ---------- SLEEP ----------
  function doSleep(){ goIdle(); GW.endGardenTimeUI(); GW.goToSleep(); }

  // ---------- MOVE / REMOVE BEDS ----------
  var heldBed=null;
  function enterMoveMode(){ setActiveBtn('move'); GW.mode='moving'; heldBed=null; GW.hideDone(); GW.setBanner('Tap a bed to move or remove it ✋'); }
  function deselectBed(){ if(heldBed && heldBed._el) heldBed._el.classList.remove('held'); heldBed=null; }
  function removeHeld(){
    if(!heldBed) return; var b=heldBed; heldBed=null; GW.hideDone();
    GW.state.beds=GW.state.beds.filter(function(x){return x!==b;});
    if(b._el){ var el=b._el; el.classList.remove('held');
      var a=el.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate(-50%,-50%) scale(0)',opacity:0}],{duration:300,easing:'ease-in'});
      a.onfinish=function(){ el.remove(); }; }
    GW.sfx.pour(); GW.save(); GW.setBanner('Bed removed 🌱');
  }
  GW.moveTap=function(dx,dy,ev){
    var bedEl=ev.target.closest('.bed');
    var bed=bedEl ? GW.state.beds.filter(function(b){return b._el===bedEl;})[0] : null;
    if(!heldBed){
      if(bed){ heldBed=bed; bed._el.classList.add('held'); GW.sfx.click();
        GW.showDone('🗑️ Remove this bed', removeHeld);
        GW.setBanner('Tap an empty spot to move it here'); }
      else { GW.setBanner('Tap one of your beds first ✋'); }
      return;
    }
    if(bed===heldBed){ deselectBed(); GW.hideDone(); GW.setBanner('Tap a bed to move or remove it ✋'); return; }
    heldBed.plot=null;
    var n=nearestEmptyPlot(dx,dy);
    var pos=n?n.plot:{x:clamp(dx,90,GW.DESIGN_W-90),y:clamp(dy,250,GW.DESIGN_H-110)};
    heldBed.x=pos.x; heldBed.y=pos.y; heldBed.plot=n?n.idx:null;
    heldBed._el.style.left=heldBed.x+'px'; heldBed._el.style.top=heldBed.y+'px';
    heldBed._el.animate([{transform:'translate(-50%,-50%) scale(1.12)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:240,easing:'ease-out'});
    GW.sfx.wood(); GW.save(); GW.setBanner('Moved! 🌿');
    deselectBed(); GW.hideDone();
  };

  // ---------- FIELD TAP ----------
  GW.buildTap=function(dx,dy,ev){
    if(GW.mode==='placing' && placingShape){ placeBed(dx,dy); return; }
    if(GW.mode==='planting' && selectedPlant){
      var hit=GW.nearestCell(dx,dy,function(bed,c){ return bed.soil && (!c.plant||c.picked); }, 230);
      if(hit) plantAt(hit.bed, hit.idx);
    }
  };

  // ---------- RESUME / COMPAT ----------
  GW.resumeBuild=function(){ GW.startGardenTime(); };
  GW.beginBuild=function(){ GW.startGardenTime(); };

  if(GW.state){ syncSeq(); }
})();
