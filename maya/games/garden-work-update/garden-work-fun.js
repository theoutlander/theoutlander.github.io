/* ===== Garden Work — extra fun: critters, pet, rainbow, sparkles ===== */
(function(){
  var GW = window.GW;
  var field = document.getElementById('field');
  var fx = document.getElementById('fx');

  // ---------- sparkle burst ----------
  GW.sparkleBurst=function(cx,cy){
    for(var i=0;i<10;i++){ (function(){
      var d=document.createElement('div'); d.className='float-up'; d.textContent='✨';
      d.style.left=(cx+(Math.random()*70-35))+'px'; d.style.top=(cy+(Math.random()*40-20))+'px';
      d.style.color='#ffe14d'; d.style.fontSize=(13+Math.random()*15)+'px';
      fx.appendChild(d); setTimeout(function(){ d.remove(); },1100);
    })(); }
  };

  // ---------- rainbow arc across the sky ----------
  GW.rainbow=function(){
    var r=document.getElementById('gw-rainbow');
    if(!r){ r=document.createElement('div'); r.id='gw-rainbow'; r.textContent='🌈';
      document.getElementById('ambient').appendChild(r); }
    r.classList.remove('show'); void r.offsetWidth; r.classList.add('show');
    setTimeout(function(){ r.classList.remove('show'); }, 4300);
  };

  // ---------- CRITTERS & PESTS (each has a clear job — tap to use it!) ----------
  var critterTimer=null, critters=[], pests=[], coins=[];

  function makeFlyer(cls, emoji, name, onTap){
    var el=document.createElement('div'); el.className=cls;
    el.innerHTML='<span class="fly-em">'+emoji+'</span>'+(name?'<span class="fly-tag">'+name+'</span>':'');
    el.style.left=(110+Math.random()*(GW.DESIGN_W-220))+'px';
    el.style.top=(300+Math.random()*(GW.DESIGN_H-470))+'px';
    el.style.setProperty('--fx',(14+Math.random()*22)+'px');
    el.style.setProperty('--fy',(10+Math.random()*16)+'px');
    var obj={el:el, alive:true};
    el.addEventListener('pointerdown', function(e){ e.stopPropagation(); if(!obj.alive) return; onTap(obj, el); });
    field.appendChild(el);
    return obj;
  }
  function leave(obj, arr){
    if(!obj.alive) return; obj.alive=false;
    var i=arr.indexOf(obj); if(i>=0) arr.splice(i,1);
    clearTimeout(obj.timeout);
    obj.el.classList.add('leaving'); setTimeout(function(){ obj.el.remove(); },720);
  }
  function fly(obj, arr){ obj.alive=false; var i=arr.indexOf(obj); if(i>=0)arr.splice(i,1); clearTimeout(obj.timeout);
    obj.el.classList.add('caught'); setTimeout(function(){ obj.el.remove(); },340); }
  function growingCells(){ var out=[]; GW.state.beds.forEach(function(b){ b.cells.forEach(function(c,i){ if(c.plant&&!c.picked&&c.growth<2) out.push({b:b,i:i}); }); }); return out; }
  function anyPlants(){ return GW.state.beds.some(function(b){ return b.cells.some(function(c){ return c.plant&&!c.picked; }); }); }

  function spawnCritter(){
    if(!GW.state || GW.state.phase!=='day' || critters.length>=2) return;
    var def=GW.CRITTERS[(Math.random()*GW.CRITTERS.length)|0];
    var obj=makeFlyer('critter', def.em, def.name, function(o,el){
      var r=el.getBoundingClientRect(), cx=r.left+r.width/2;
      fly(o, critters);
      GW.state.crittersCaught=(GW.state.crittersCaught||0)+1; GW.discover('critter',def.id); GW.addXP(2);
      GW.sfx.sparkle(); GW.sparkleBurst(cx, r.top+r.height/2);
      if(def.job==='bloom'){
        var g=growingCells();
        if(g.length){ var pk=g[(Math.random()*g.length)|0]; pk.b.cells[pk.i].growth=2; pk.b.cells[pk.i].watered=false; GW.paintBed(pk.b);
          GW.floatText(cx, r.top, 'Bloomed a plant! 🌸', '#5dffb0'); }
        else { GW.state.coins+=def.coins; GW.floatText(cx, r.top, '+'+def.coins+'🪙', '#ffe14d'); }
      } else if(def.job==='guard'){
        var n=pests.length; pests.slice().forEach(function(p){ leave(p, pests); });
        GW.state.coins+=def.coins;
        GW.floatText(cx, r.top, n?('Shooed '+n+' pests! 🛡️'):('On guard! +'+def.coins+'🪙'), '#5dffb0');
      } else {
        GW.state.coins+=def.coins; GW.floatText(cx, r.top, 'Lucky! +'+def.coins+'🪙', '#ffe14d');
      }
      GW.renderHUD(); GW.save();
    });
    obj.timeout=setTimeout(function(){ leave(obj, critters); }, 8000+Math.random()*4000);
    critters.push(obj);
  }
  function spawnPest(){
    if(!GW.state || GW.state.phase!=='day' || pests.length>=2 || !anyPlants()) return;
    var def=GW.PESTS[(Math.random()*GW.PESTS.length)|0];
    var obj=makeFlyer('critter pest', def.em, 'Shoo!', function(o,el){
      var r=el.getBoundingClientRect(), cx=r.left+r.width/2;
      fly(o, pests);
      GW.state.coins+=2; GW.discover('critter', def.id); GW.addXP(2); GW.sfx.harvest();
      GW.floatText(cx, r.top, 'Protected! 🛡️ +2🪙', '#5dffb0'); GW.sparkleBurst(cx, r.top+r.height/2);
      GW.renderHUD(); GW.save();
    });
    obj.timeout=setTimeout(function(){ leave(obj, pests); }, 7000+Math.random()*3000);
    pests.push(obj);
    GW.setBanner('A hungry '+def.name+'! Tap it to protect your garden 🛡️'); setTimeout(GW.hideBanner, 2800);
  }

  function spawnCoin(){
    if(!GW.state || GW.state.phase!=='day' || coins.length>=2) return;
    var amt=2+((Math.random()*3)|0);
    var obj=makeFlyer('coinpick','🪙','', function(o,el){
      var r=el.getBoundingClientRect(), cx=r.left+r.width/2;
      fly(o, coins);
      GW.state.coins+=amt; GW.sfx.coin(); GW.addXP(1);
      GW.floatText(cx, r.top, '+'+amt+'🪙', '#ffe14d'); GW.sparkleBurst(cx, r.top+r.height/2);
      GW.renderHUD(); GW.save();
    });
    obj.timeout=setTimeout(function(){ leave(obj, coins); }, 6000+Math.random()*3000);
    coins.push(obj);
  }
  GW.startCritters=function(){
    GW.stopCritters();
    critterTimer=setInterval(function(){
      var roll=Math.random();
      if(roll<0.5) spawnCritter();
      else if(roll<0.68) spawnPest();
      else if(roll<0.95) spawnCoin();
    }, 4000);
    setTimeout(spawnCritter, 2000);
    setTimeout(spawnCoin, 3500);
  };
  GW.stopCritters=function(){
    if(critterTimer){ clearInterval(critterTimer); critterTimer=null; }
    critters.concat(pests).concat(coins).forEach(function(o){ clearTimeout(o.timeout); o.el.remove(); });
    critters=[]; pests=[]; coins=[];
  };

  // ---------- PETS (live in the garden, follow her & dig up coins to help) ----------
  var petEls={};
  function happyPet(el){ el.classList.remove('happy'); void el.offsetWidth; el.classList.add('happy'); }
  function makePetEl(id){
    var def=GW.petById(id);
    var pe=document.createElement('div'); pe.className='pet'; pe.dataset.id=id;
    pe.innerHTML='<span class="p-heart">💕</span><span class="p-em">'+(def?def.em:'🐾')+'</span>';
    pe.addEventListener('pointerdown', function(e){
      e.stopPropagation(); happyPet(pe); GW.sfx.eat();
      var r=pe.getBoundingClientRect();
      GW.floatText(r.left+r.width/2, r.top, ['💕','😊','🐾','✨'][(Math.random()*4)|0], '#ff8ed0');
    });
    field.appendChild(pe); return pe;
  }
  function petList(){ return (GW.state && GW.state.pets) || []; }
  GW.setupPet=function(){
    if(!GW.state) return;
    var pets=petList();
    Object.keys(petEls).forEach(function(id){ if(pets.indexOf(id)<0){ petEls[id].remove(); delete petEls[id]; } });
    pets.forEach(function(id){ if(!petEls[id]) petEls[id]=makePetEl(id); });
    positionPets(); updatePetMenu();
  };
  function positionPets(gx,gy){
    if(gx==null){ var g=GW.gardener; gx=parseFloat(g.style.left)||GW.YARD.x; gy=parseFloat(g.style.top)||GW.YARD.y; }
    Object.keys(petEls).forEach(function(id,i){
      var side=(i%2===0)?-1:1, dist=50+Math.floor(i/2)*40;
      petEls[id].style.left=(gx+side*dist)+'px';
      petEls[id].style.top=(gy+34+(i%2)*10)+'px';
    });
  }
  GW.movePet=function(x,y){ positionPets(x,y); };
  // pets dig up coins now and then
  setInterval(function(){
    if(!GW.state || GW.state.phase!=='day') return;
    var any=false;
    Object.keys(petEls).forEach(function(id){
      if(Math.random()<0.55){ GW.state.coins+=1; any=true;
        var r=petEls[id].getBoundingClientRect();
        GW.floatText(r.left+r.width/2, r.top, '+1🪙', '#ffe14d'); happyPet(petEls[id]); }
    });
    if(any){ GW.sfx.coin(); GW.renderHUD(); GW.save(); }
  }, 11000);

  // ---------- PET ADOPTION (first pet is free) ----------
  GW.adoptPet=function(id){
    if(!GW.state.pets) GW.state.pets=[];
    if(GW.state.pets.indexOf(id)<0) GW.state.pets.push(id);
    GW.state.petAsked=true; GW.save(); GW.setupPet();
  };
  function buildPetSheet(){
    var s=document.createElement('div'); s.className='sheet'; s.id='petSheet';
    var opts=GW.PETS.slice(0,4).map(function(p){ return '<button class="pet-opt" data-id="'+p.id+'"><span class="pe">'+p.em+'</span><span class="pn">'+p.name+'</span></button>'; }).join('');
    s.innerHTML='<div class="sheet-card"><div class="sheet-h"><span style="font-size:24px">🐾</span><h3>A new friend!</h3></div>'+
      '<p class="pet-note">A little friend wants to live in your garden. Pick one to keep. It digs up coins for you! 💕</p>'+
      '<div class="pet-grid">'+opts+'</div>'+
      '<button class="bbtn pet-skip" id="petSkip">Maybe later</button></div>';
    document.body.appendChild(s);
    s.querySelectorAll('.pet-opt').forEach(function(b){
      b.addEventListener('click', function(){
        GW.sfx.win(); GW.adoptPet(b.dataset.id); s.classList.remove('show'); GW.confetti(22);
        var p=GW.petById(b.dataset.id);
        GW.setBanner(p.em+' '+p.name+' loves your garden!'); setTimeout(GW.hideBanner,2400);
      });
    });
    s.querySelector('#petSkip').addEventListener('click', function(){
      GW.sfx.click(); GW.state.petAsked=true; GW.save(); s.classList.remove('show'); updatePetMenu();
    });
    return s;
  }
  GW.offerPet=function(){ (document.getElementById('petSheet')||buildPetSheet()).classList.add('show'); };
  GW.maybeOfferPet=function(){
    if(GW.state && !petList().length && !GW.state.petAsked && GW.state.day>=2){ setTimeout(GW.offerPet, 700); }
  };
  function updatePetMenu(){
    var row=document.querySelector('#menuSheet .menu-row'); if(!row) return;
    var btn=document.getElementById('petMenuBtn');
    if(GW.state && !petList().length){
      if(!btn){ btn=document.createElement('button'); btn.className='menu-btn'; btn.id='petMenuBtn';
        btn.innerHTML='<span class="me">🐾</span>Adopt a pet';
        btn.addEventListener('click', function(){ document.getElementById('menuSheet').classList.remove('show'); GW.offerPet(); });
        row.insertBefore(btn, row.firstChild);
      }
    } else if(btn){ btn.remove(); }
  }
  GW.updatePetMenu=updatePetMenu;
})();
