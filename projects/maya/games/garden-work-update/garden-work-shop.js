/* ===== Garden Work — Shop, Sticker Book, Name, Show card, side dock ===== */
(function(){
  var GW = window.GW;
  function el(tag,cls,html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }

  // ---------- SIDE DOCK ----------
  function buildDock(){
    if(document.getElementById('dock')) return;
    var dock=el('div','','' ); dock.id='dock';
    [['shop','🛍️','Shop'],['show','📸','Picture']].forEach(function(a){
      var b=el('button','dock-btn','<span class="de">'+a[1]+'</span><span class="dl">'+a[2]+'</span>');
      b.id=a[0]+'Btn'; b.dataset.act=a[0]; b.setAttribute('aria-label',a[2]);
      b.addEventListener('click',function(){ GW.audio.resume(); GW.sfx.click();
        if(a[0]==='shop') GW.openShop();
        else GW.openShow();
      });
      dock.appendChild(b);
    });
    document.body.appendChild(dock);
  }
  GW.buildDock=buildDock;

  // ---------- SHOP ----------
  var shopSheet=null, shopTab='seeds';
  function ensureShop(){
    if(shopSheet) return shopSheet;
    shopSheet=el('div','sheet'); shopSheet.id='shopSheet';
    shopSheet.innerHTML=
      '<div class="sheet-card shop-card">'+
        '<div class="sheet-h"><span style="font-size:24px">🛍️</span><h3>Garden Shop</h3>'+
          '<span class="shop-coins"><span class="em">🪙</span><b id="shopCoins">0</b></span>'+
          '<button class="sheet-x" id="shopX">✕</button></div>'+
        '<div class="shop-tabs">'+
          '<button class="shop-tab" data-tab="seeds">🌱 Seeds</button>'+
          '<button class="shop-tab" data-tab="pets">🐾 Pets</button>'+
          '<button class="shop-tab" data-tab="decor">🏡 Decor</button></div>'+
        '<div class="shop-grid" id="shopGrid"></div>'+
      '</div>';
    document.body.appendChild(shopSheet);
    shopSheet.querySelector('#shopX').addEventListener('click',function(){ GW.sfx.click(); closeShop(); });
    shopSheet.querySelectorAll('.shop-tab').forEach(function(t){
      t.addEventListener('click',function(){ GW.sfx.click(); shopTab=t.dataset.tab; renderShop(); });
    });
    shopSheet.addEventListener('click',function(e){ if(e.target===shopSheet) closeShop(); });
    return shopSheet;
  }
  function owned(id, cat){
    if(cat==='seeds') return (GW.state.unlockedSeeds||[]).indexOf(id)>=0;
    if(cat==='pets') return (GW.state.pets||[]).indexOf(id)>=0;
    return false; // decor can be bought repeatedly
  }
  function renderShop(){
    var s=ensureShop();
    s.querySelector('#shopCoins').textContent=GW.state.coins;
    s.querySelectorAll('.shop-tab').forEach(function(t){ t.classList.toggle('on', t.dataset.tab===shopTab); });
    var grid=s.querySelector('#shopGrid'); grid.innerHTML='';
    var items;
    if(shopTab==='seeds') items = GW.PLANTS.filter(function(p){ return p.unlock===-1; }).map(function(p){ return {id:p.id, em:p.ripe, name:p.name, price:p.price, cat:'seeds', sub:p.kind==='giant'?'GIANT':'+'+p.sell+'🪙'}; });
    else if(shopTab==='pets') items = GW.PETS.map(function(p){ return {id:p.id, em:p.em, name:p.name, price:p.price, cat:'pets', sub:'digs coins'}; });
    else items = GW.DECOR.map(function(d){ return {id:d.id, em:d.em, name:d.name, price:d.price, cat:'decor'}; });
    items.forEach(function(it){
      var have=owned(it.id, it.cat);
      var afford=GW.state.coins>=it.price;
      var card=el('button','shop-item'+(have?' owned':'')+(!afford&&!have?' broke':''));
      card.innerHTML='<span class="si-em">'+it.em+'</span><span class="si-name">'+it.name+'</span>'+
        (it.sub?'<span class="si-sub">'+it.sub+'</span>':'')+
        '<span class="si-price">'+(have?'✓ Owned':('🪙 '+it.price))+'</span>';
      if(!have){ card.addEventListener('click',function(){ buy(it); }); }
      grid.appendChild(card);
    });
  }
  function buy(it){
    if(GW.state.coins<it.price){ GW.sfx.click(); GW.setBanner('Not enough coins yet. Grow and sell more! 🪙'); setTimeout(GW.hideBanner,1800); return; }
    GW.state.coins-=it.price; GW.sfx.coin();
    if(it.cat==='seeds'){
      GW.state.unlockedSeeds.push(it.id); GW.discover('plant', it.id);
      GW.renderHUD(); GW.save(); renderShop();
      GW.confetti(14); GW.setBanner('New seed unlocked: '+it.em+' '+it.name+'!'); setTimeout(GW.hideBanner,2000);
    } else if(it.cat==='pets'){
      GW.adoptPet(it.id);
      GW.renderHUD(); GW.save(); renderShop();
      GW.confetti(18); GW.setBanner('Welcome '+it.em+' '+it.name+' to your garden!'); setTimeout(GW.hideBanner,2200);
    } else {
      GW.renderHUD(); GW.save(); closeShop();
      GW.pendingDeco=it.id; GW.mode='deco';
      var g=document.getElementById('ghost'); // hide bed ghost
      if(g) g.style.display='none';
      GW.setBanner('Tap anywhere to place your '+it.name+'! '+it.em);
    }
  }
  GW.openShop=function(tab){ if(tab) shopTab=tab; ensureShop(); renderShop(); shopSheet.classList.add('show'); };
  function closeShop(){ if(shopSheet) shopSheet.classList.remove('show'); }

  // ---------- STICKER BOOK ----------
  var jSheet=null;
  GW.collectionGroups=function(){
    return [
      {key:'plant',  title:'🌱 Plants',   items:GW.PLANTS.map(function(p){return {id:p.id, em:p.ripe, name:p.name};})},
      {key:'critter',title:'🦋 Bugs & Critters', items:GW.CRITTERS.concat(GW.PESTS).map(function(c){return {id:c.id, em:c.em, name:c.name};})},
      {key:'visitor',title:'🦄 Visitors', items:GW.VISITORS.map(function(v){return {id:v.id, em:v.em, name:v.name};})},
      {key:'decor',  title:'🏡 Decorations', items:GW.DECOR.map(function(d){return {id:d.id, em:d.em, name:d.name};})}
    ];
  };
  GW.collectionCounts=function(){
    var have=0,total=0, disc=GW.state.discovered||{};
    GW.collectionGroups().forEach(function(g){ g.items.forEach(function(it){ total++; if(disc[g.key+':'+it.id]) have++; }); });
    return {have:have, total:total};
  };
  function ensureJournal(){
    if(jSheet) return jSheet;
    jSheet=el('div','sheet'); jSheet.id='jSheet';
    jSheet.innerHTML='<div class="sheet-card j-card">'+
      '<div class="sheet-h"><span style="font-size:24px">📖</span><h3>Sticker Book</h3>'+
      '<span class="j-count" id="jCount"></span><button class="sheet-x" id="jX">✕</button></div>'+
      '<div class="j-body" id="jBody"></div></div>';
    document.body.appendChild(jSheet);
    jSheet.querySelector('#jX').addEventListener('click',function(){ GW.sfx.click(); jSheet.classList.remove('show'); });
    jSheet.addEventListener('click',function(e){ if(e.target===jSheet) jSheet.classList.remove('show'); });
    return jSheet;
  }
  GW.openJournal=function(){
    GW._journalNew=false; GW.renderHUD();
    ensureJournal();
    var disc=GW.state.discovered||{}, body=jSheet.querySelector('#jBody'); body.innerHTML='';
    GW.collectionGroups().forEach(function(g){
      var sec=el('div','j-sec'); sec.appendChild(el('div','j-sec-t',g.title));
      var grid=el('div','j-grid');
      g.items.forEach(function(it){
        var got=!!disc[g.key+':'+it.id];
        var cell=el('div','j-sticker'+(got?' got':''));
        cell.innerHTML='<span class="js-em">'+(got?it.em:'❓')+'</span>';
        if(got) cell.title=it.name;
        grid.appendChild(cell);
      });
      sec.appendChild(grid); body.appendChild(sec);
    });
    var c=GW.collectionCounts();
    jSheet.querySelector('#jCount').textContent=c.have+' / '+c.total;
    if(c.have===c.total){ var done=el('div','j-done','🏆 You collected everything! Amazing! 🏆'); body.appendChild(done); }
    jSheet.classList.add('show');
  };

  // ---------- NAME THE GARDEN ----------
  GW.renameGarden=function(){
    var cur=GW.state.gardenName||GW.GARDEN_NAME_DEFAULT;
    var name=prompt("What's your garden called?", cur);
    if(name && name.trim()){ GW.state.gardenName=name.trim().slice(0,22); GW.save(); GW.renderSign();
      GW.sfx.sparkle(); GW.setBanner('🪧 Welcome to '+GW.state.gardenName+'!'); setTimeout(GW.hideBanner,2000); }
  };

  // ---------- SHOW MY GARDEN ----------
  function roundRect(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
  GW.snapPicture=function(){
    var s=GW.state, info=GW.levelInfo(s.xp), se=GW.seasonForDay(s.day);
    var W=760,H=900, cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    var x=cv.getContext('2d'); x.textAlign='center';
    var g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#ffffff'); g.addColorStop(.55,'#ffe6f3'); g.addColorStop(1,'#e7d6ff');
    x.fillStyle=g; roundRect(x,0,0,W,H,42); x.fill();
    x.fillStyle='#a05ad0'; x.font='bold 30px Nunito,sans-serif'; x.fillText(se.name, W/2, 88);
    x.fillStyle='#c44fa0'; x.font='800 66px "Fredoka One",Nunito,sans-serif'; x.fillText(s.gardenName||GW.GARDEN_NAME_DEFAULT, W/2, 168);
    x.fillStyle='#7a5a9a'; x.font='bold 30px Nunito,sans-serif'; x.fillText('Day '+s.day+'   •   Level '+info.level, W/2, 222);
    x.fillStyle='#9a7ab8'; x.font='bold 24px Nunito,sans-serif'; x.fillText(info.title, W/2, 260);
    var seen={}, order=[]; s.beds.forEach(function(b){ b.cells.forEach(function(c){ if(c.plant&&!seen[c.plant]){seen[c.plant]=1;order.push(c.plant);} }); });
    var ems=order.slice(0,7).map(function(id){return GW.byId(id).ripe;});
    (s.pets||[]).slice(0,3).forEach(function(id){ ems.push(GW.petById(id).em); });
    if(!ems.length) ems=['🌱'];
    x.font='62px sans-serif'; var n=Math.min(ems.length,7), sx=W/2-(n-1)*78/2;
    ems.slice(0,7).forEach(function(e,i){ x.fillText(e, sx+i*78, 358); });
    var decos=(s.decor||[]).slice(0,8).map(function(d){ var def=GW.decorById(d.type); return def?def.em:''; }).filter(Boolean);
    if(decos.length){ x.font='38px sans-serif'; var dn=Math.min(decos.length,8), dx=W/2-(dn-1)*52/2; decos.slice(0,8).forEach(function(e,i){ x.fillText(e, dx+i*52, 430); }); }
    var stats=[[s.plantsGrown||0,'grown 🌸'],[s.coins,'coins 🪙'],[s.crittersCaught||0,'caught 🦋']];
    var stn=stats.length, stsx=W/2-(stn-1)*210/2;
    stats.forEach(function(st,i){ var cx=stsx+i*210; x.fillStyle='#ffffff'; roundRect(x,cx-92,478,184,150,20); x.fill();
      x.fillStyle='#c2410c'; x.font='800 46px "Fredoka One",Nunito,sans-serif'; x.fillText(''+st[0], cx, 548);
      x.fillStyle='#7a5a9a'; x.font='bold 22px Nunito,sans-serif'; x.fillText(st[1], cx, 590); });
    x.font='86px sans-serif'; x.fillText('👧', W/2-((s.pets||[]).length?60:0), 730);
    (s.pets||[]).slice(0,3).forEach(function(id,i){ x.fillText(GW.petById(id).em, W/2+30+i*64, 730); });
    x.fillStyle='#3a8a3f'; x.font='800 30px "Fredoka One",Nunito,sans-serif'; x.fillText('🌻 Come play Garden Work! 🌻', W/2, 820);
    try{
      var a=document.createElement('a');
      a.href=cv.toDataURL('image/png');
      a.download=(s.gardenName||'My Garden').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')+'-day-'+s.day+'.png';
      document.body.appendChild(a); a.click(); a.remove();
      return true;
    }catch(e){ return false; }
  };
  var showOv=null;
  GW.openShow=function(){
    if(!showOv){
      showOv=el('div',''); showOv.id='showOv';
      showOv.innerHTML='<div class="show-card" id="showCard"></div>'+
        '<div class="show-hint">📸 Take a screenshot to show your friends!</div>'+
        '<div class="show-actions"><button class="bbtn show-close" id="showClose">Done</button></div>';
      document.body.appendChild(showOv);
      showOv.querySelector('#showClose').addEventListener('click',function(){ GW.sfx.click(); showOv.classList.remove('show'); });
      showOv.addEventListener('click',function(e){ if(e.target===showOv) showOv.classList.remove('show'); });
    }
    var s=GW.state, info=GW.levelInfo(s.xp), se=GW.seasonForDay(s.day);
    var seen={}, order=[];
    s.beds.forEach(function(b){ b.cells.forEach(function(cl){ if(cl.plant && !seen[cl.plant]){ seen[cl.plant]=1; order.push(cl.plant);} }); });
    var row=order.slice(0,7).map(function(id){ return '<span>'+GW.byId(id).ripe+'</span>'; }).join('');
    if(!row) row='<span>🌱</span>';
    var pets=(s.pets||[]).slice(0,4).map(function(id){ var p=GW.petById(id); return p?'<span class="sc-pet">'+p.em+'</span>':''; }).join('');
    var decoRow=(s.decor||[]).slice(0,8).map(function(d){ var def=GW.decorById(d.type); return def?'<span>'+def.em+'</span>':''; }).join('');
    showOv.querySelector('#showCard').innerHTML=
      '<div class="sc-top">'+se.name+'</div>'+
      '<div class="sc-title">'+(s.gardenName||GW.GARDEN_NAME_DEFAULT)+'</div>'+
      '<div class="sc-sub">Day '+s.day+' • Level '+info.level+' • '+info.title+'</div>'+
      '<div class="sc-plants">'+row+pets+'</div>'+
      (decoRow?'<div class="sc-deco">'+decoRow+'</div>':'')+
      '<div class="sc-stats">'+
        '<div class="sc-stat"><b>'+(s.plantsGrown||0)+'</b><span>grown 🌸</span></div>'+
        '<div class="sc-stat"><b>'+s.coins+'</b><span>coins 🪙</span></div>'+
        '<div class="sc-stat"><b>'+(s.crittersCaught||0)+'</b><span>caught 🦋</span></div>'+
      '</div>'+
      '<div class="sc-foot">🌻 Come play Garden Work with me! 🌻</div>';
    showOv.classList.add('show');
  };
})();
