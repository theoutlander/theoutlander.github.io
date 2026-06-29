/* ===== Garden Work — core game (state, day cycle, gardener, render) ===== */
(function(){
  var GW = window.GW;
  var $ = function(s){ return document.querySelector(s); };

  // DOM
  var field=$('#field'), gardener=$('#gardener'), ambient=$('#ambient'), celestial=$('#celestial'),
      banner=$('#banner'), toolBtn=$('#toolBtn'), toolLabel=$('#toolLabel'), toolWrap=$('#toolWrap'),
      doneBtn=$('#doneBtn'), tray=$('#tray'), fx=$('#fx'),
      dayNum=$('#dayNum'), coinNum=$('#coinNum'), basketChip=$('#basketChip'), basketNum=$('#basketNum'),
      daycard=$('#daycard'), splash=$('#splash');

  GW.field=field; GW.gardener=gardener; GW.toolBtn=toolBtn; GW.toolLabel=toolLabel;
  GW.doneBtn=doneBtn; GW.tray=tray; GW.bottomReserve=150;

  // ---------- STATE ----------
  GW.state=null;
  function freshState(){
    return { day:1, coins:0, eaten:0, magic:false, beds:[], basket:[],
             pets:[], petAsked:false, crittersCaught:0,
             xp:0, decor:[], unlockedSeeds:[], discovered:{}, plantsGrown:0,
             gardenName:GW.GARDEN_NAME_DEFAULT, mailDay:0, mailWaiting:false, visitorsSeen:0,
             builtToday:false, buildStep:null, phase:'night' };
  }
  function save(){
    try{ localStorage.setItem('gardenwork_save', JSON.stringify(GW.state)); }catch(e){}
  }
  function load(){
    try{ var r=localStorage.getItem('gardenwork_save'); return r?JSON.parse(r):null; }catch(e){ return null; }
  }
  GW.save=save;

  // ---------- LAYOUT / SCALE ----------
  GW.scale=1;
  GW.baseReserve=function(){ return innerWidth<600 ? 118 : 138; };
  function layout(){
    var vw=innerWidth, vh=innerHeight, top=54, bottom=GW.baseReserve();
    var rightRes = vw<600 ? 54 : 0;   // reserve room for the side dock on phones; iPad/desktop use the margin
    var availH=Math.max(240, vh-top-bottom), availW=vw-10-rightRes;
    var s=Math.min(availW/GW.DESIGN_W, availH/GW.DESIGN_H, 1.3);
    GW.scale=s;
    var offY=(top+availH/2) - vh/2;
    var offX=-rightRes/2;
    field.style.transform='translate(-50%,-50%) translate('+offX+'px,'+offY+'px) scale('+s+')';
  }
  GW.layout=layout;
  GW.setChrome=function(b){ GW.bottomReserve=b; layout(); };
  addEventListener('resize',layout);

  GW.toDesign=function(cx,cy){
    var r=field.getBoundingClientRect(), s=GW.scale||1;
    return { x:(cx-r.left)/s, y:(cy-r.top)/s };
  };

  // ---------- BED DOM ----------
  GW.makeBedEl=function(bed){
    var sh=GW.SHAPES[bed.shape];
    var el=document.createElement('div');
    el.className='bed shape-'+bed.shape;
    el.style.left=bed.x+'px'; el.style.top=bed.y+'px';
    var frame=document.createElement('div'); frame.className='frame';
    var soil=document.createElement('div'); soil.className='soil';
    var iw=sh.cols*sh.unit, ih=sh.rows*sh.unit;
    soil.style.width=iw+'px'; soil.style.height=ih+'px';
    if(sh.tri){ var clip='polygon(50% 3%, 3% 100%, 97% 100%)'; frame.style.clipPath=clip; soil.style.clipPath=clip; }
    sh.cells.forEach(function(c,i){
      var cell=document.createElement('div'); cell.className='cell'; cell.dataset.idx=i;
      cell.style.left=(c.gx*sh.unit)+'px'; cell.style.top=(c.gy*sh.unit)+'px';
      cell.style.width=sh.unit+'px'; cell.style.height=sh.unit+'px';
      soil.appendChild(cell);
    });
    var shine=document.createElement('div'); shine.className='water-shine';
    frame.appendChild(soil); frame.appendChild(shine);
    el.appendChild(frame);
    var del=document.createElement('button'); del.className='bed-del'; del.textContent='✕';
    del.addEventListener('pointerdown', function(e){ e.stopPropagation(); e.preventDefault(); GW.removeBed(bed); });
    el.appendChild(del);
    bed._el=el; field.appendChild(el);
    return el;
  };
  var lastRemoved=null, undoTimer=null;
  GW.removeBed=function(bed){
    GW.state.beds=GW.state.beds.filter(function(b){return b!==bed;});
    var el=bed._el;
    if(el){ el.style.pointerEvents='none';
      var a=el.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:1},{transform:'translate(-50%,-50%) scale(0)',opacity:0}],{duration:280,easing:'ease-in'});
      a.onfinish=function(){ el.remove(); }; }
    bed._el=null; lastRemoved=bed;
    GW.sfx.pour(); save(); showUndo();
  };
  function showUndo(){
    var t=document.getElementById('undoToast');
    if(!t){ t=document.createElement('div'); t.id='undoToast';
      t.innerHTML='<span>Bed removed</span><button id="undoBtn">↩ Undo</button>';
      document.body.appendChild(t);
      t.querySelector('#undoBtn').addEventListener('click', function(){ GW.sfx.click(); doUndo(); });
    }
    t.classList.add('show');
    clearTimeout(undoTimer);
    undoTimer=setTimeout(function(){ t.classList.remove('show'); lastRemoved=null; }, 5000);
  }
  function doUndo(){
    if(!lastRemoved) return;
    var bed=lastRemoved; lastRemoved=null;
    GW.state.beds.push(bed);
    GW.makeBedEl(bed); GW.paintBed(bed);
    bed._el.animate([{transform:'translate(-50%,-50%) scale(0)'},{transform:'translate(-50%,-50%) scale(1.1)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:300,easing:'ease-out'});
    save(); GW.sfx.plant();
    var t=document.getElementById('undoToast'); if(t) t.classList.remove('show');
    clearTimeout(undoTimer);
  }
  GW.sizeGhost=function(shape){
    var g=$('#ghost'), sh=GW.SHAPES[shape], f=g.querySelector('.frame');
    var iw=sh.cols*sh.unit, ih=sh.rows*sh.unit;
    f.style.width=iw+'px'; f.style.height=ih+'px';
    g.className=''; g.classList.add('shape-'+shape);
    if(sh.tri) f.style.clipPath='polygon(50% 3%, 3% 100%, 97% 100%)'; else f.style.clipPath='';
    return g;
  };
  GW.paintBed=function(bed){
    var el=bed._el; if(!el) return;
    el.classList.toggle('has-soil', !!bed.soil);
    var anyWet=false;
    var sh=GW.SHAPES[bed.shape];
    bed.cells.forEach(function(c,i){
      var cell=el.querySelector('.cell[data-idx="'+i+'"]'); if(!cell) return;
      var empty = !c.plant || c.picked;
      cell.classList.toggle('plantable', !!bed.soil && empty);
      cell.classList.remove('ripe'); cell.classList.remove('golden');
      if(empty){ cell.innerHTML=''; return; }
      if(c.watered && c.growth<2) anyWet=true;
      var p=GW.byId(c.plant), em=p.ripe, cls='plant';
      if(c.growth>=2){ cls='plant ripe'; cell.classList.add('ripe');
        if(p.giant) cls+=' giant-plant';
        if(p.glow) cls+=' glow-plant';
        if(c.golden){ cell.classList.add('golden'); cls='plant ripe golden-plant'+(p.giant?' giant-plant':''); } }
      else { cls='plant growing g'+(c.growth||0); if(p.glow) cls+=' glow-plant'; }
      cell.innerHTML='<span class="'+cls+'">'+em+'</span>';
    });
    el.classList.toggle('watered', anyWet);
  };
  GW.renderAllBeds=function(){
    field.querySelectorAll('.bed').forEach(function(b){ b.remove(); });
    GW.state.beds.forEach(function(bed){ GW.makeBedEl(bed); GW.paintBed(bed); });
  };

  // ---------- XP / LEVELS ----------
  GW.addXP=function(n){
    if(!GW.state) return;
    var before=GW.levelInfo(GW.state.xp).level;
    GW.state.xp=(GW.state.xp||0)+n;
    var info=GW.levelInfo(GW.state.xp);
    GW.renderHUD();
    if(info.level>before){ onLevelUp(info); }
    save();
  };
  function onLevelUp(info){
    GW.sfx.win(); if(GW.fireworks) GW.fireworks(); else GW.confetti(40);
    var bonus=info.level*3; GW.state.coins+=bonus; GW.renderHUD();
    GW.setBanner('⭐ Level '+info.level+'! '+info.title+' +'+bonus+'🪙');
    setTimeout(GW.hideBanner, 3000);
    GW.discover('milestone','lvl'+info.level);
  }

  // ---------- DISCOVER (sticker book) ----------
  GW.discover=function(cat, id){
    if(!GW.state.discovered) GW.state.discovered={};
    var key=cat+':'+id;
    if(!GW.state.discovered[key]){ GW.state.discovered[key]=true; GW._journalNew=true; save(); GW.renderHUD(); }
  };
  GW.discoverPlant=function(id){ GW.discover('plant', id); };

  // ---------- DECORATIONS ----------
  GW.renderDecor=function(){
    field.querySelectorAll('.uitem').forEach(function(d){ d.remove(); });
    (GW.state.decor||[]).forEach(function(d){
      var def=GW.decorById(d.type); if(!def) return;
      var el=document.createElement('div'); el.className='uitem'; el.textContent=def.em;
      el.style.left=d.x+'px'; el.style.top=d.y+'px';
      field.appendChild(el);
    });
  };

  // ---------- HUD ----------
  GW.renderHUD=function(){
    var s=GW.state;
    dayNum.textContent='Day '+s.day;
    coinNum.textContent=s.coins;
    basketNum.textContent=s.basket.length;
    basketChip.classList.toggle('empty', s.basket.length===0);
    var lc=$('#lvlChip');
    if(lc){ var info=GW.levelInfo(s.xp);
      $('#lvlNum').textContent=info.level;
      $('#lvlFill').style.width=Math.round(100*info.into/info.need)+'%';
    }
    var bc=$('#bookBtn');
    if(bc) bc.classList.toggle('hasnew', !!GW._journalNew);
  };

  // ---------- AMBIENT / SKY ----------
  var CEL={ night:{em:'🌙',l:18,t:13}, dawn:{em:'☀️',l:22,t:24}, day:{em:'☀️',l:81,t:12}, dusk:{em:'☀️',l:81,t:24} };
  var AMBI={ night:'rgba(18,16,54,.6)', dawn:'linear-gradient(180deg,rgba(255,180,140,.42),rgba(255,210,150,.16))', day:'rgba(255,250,225,0)', dusk:'linear-gradient(180deg,rgba(120,70,150,.4),rgba(255,140,80,.34))' };
  GW.setPhase=function(name){
    GW.state.phase=name;
    ambient.className=name;
    ambient.style.background=AMBI[name]||'rgba(255,250,235,0)';
    var c=CEL[name]; celestial.textContent=c.em;
    celestial.style.left=c.l+'%'; celestial.style.top=c.t+'%';
    celestial.style.fontSize = name==='day' ? '64px' : '54px';
  };
  (function stars(){
    var sb=$('#skystars'), h='';
    for(var i=0;i<46;i++){ h+='<i style="left:'+(Math.random()*100)+'%;top:'+(Math.random()*60)+'%;--d:'+(1.4+Math.random()*2.6)+'s"></i>'; }
    sb.innerHTML=h;
  })();

  // decorative trees & flowers around the yard (placed clear of plots)
  function decorate(){
    if(field.querySelector('.deco')) return;
    // just two scenery trees that frame the house & change with the seasons
    var d=[ {e:'🌳',x:56,y:122,c:'tree sway'},{e:'🌳',x:664,y:122,c:'tree sway'} ];
    d.forEach(function(o){ var s=document.createElement('div'); s.className='deco '+o.c; s.textContent=o.e;
      s.style.left=o.x+'px'; s.style.top=o.y+'px'; field.appendChild(s); });
  }
  GW.decorate=decorate;

  // ---------- FENCE around the property ----------
  GW.renderFence=function(){
    if(field.querySelector('#fence')) return;
    var f=document.createElement('div'); f.id='fence';
    var W=GW.DESIGN_W, H=GW.DESIGN_H, step=26, m=13;
    var gateL=W/2-56, gateR=W/2+56;
    function bump(x,y){ var p=document.createElement('i'); p.className='hedge'; p.style.left=x+'px'; p.style.top=y+'px'; f.appendChild(p); }
    for(var x=m;x<=W-m;x+=step){
      bump(x, m);                                  // back fence runs behind the house
      if(x<gateL-4 || x>gateR+4) bump(x, H-m);     // front fence with a gate opening
    }
    for(var y=m+step;y<=H-m-step;y+=step){ bump(m, y); bump(W-m, y); }
    function post(x){ var p=document.createElement('i'); p.className='gatepost'; p.style.left=x+'px'; p.style.top=(H-m)+'px'; f.appendChild(p); }
    post(gateL); post(gateR);
    field.insertBefore(f, field.firstChild);
  };

  // ---------- FIREWORKS (level up & celebrations) ----------
  GW.fireworks=function(){
    var EM=['🎆','🎇','✨','🎉','🎊','⭐','🌟'];
    for(var b=0;b<3;b++){ (function(b){ setTimeout(function(){
      var cx=20+Math.random()*60, cy=18+Math.random()*32;
      for(var i=0;i<12;i++){ (function(i){
        var d=document.createElement('div'); d.className='fw'; d.textContent=EM[(Math.random()*EM.length)|0];
        var ang=(i/12)*Math.PI*2, dist=60+Math.random()*50;
        d.style.left=cx+'vw'; d.style.top=cy+'vh';
        d.style.setProperty('--dx',Math.cos(ang)*dist+'px');
        d.style.setProperty('--dy',Math.sin(ang)*dist+'px');
        fx.appendChild(d); setTimeout(function(){ d.remove(); },1300);
      })(i); }
      GW.sfx.sparkle();
    }, b*320); })(b); }
  };

  // ---------- SEASONS ----------
  var seasonParticleT=null;
  GW.applySeason=function(){
    var se=GW.seasonForDay(GW.state.day);
    var tint=document.getElementById('season-tint');
    if(!tint){ tint=document.createElement('div'); tint.id='season-tint'; field.appendChild(tint); }
    tint.style.background=se.tint;
    field.querySelectorAll('.deco.tree').forEach(function(t){ t.textContent=se.tree; });
    if(seasonParticleT){ clearInterval(seasonParticleT); seasonParticleT=null; }
    if(se.particle){
      seasonParticleT=setInterval(function(){
        if(GW.state.phase!=='day') return;
        var d=document.createElement('div'); d.className='season-p'; d.textContent=se.particle;
        d.style.left=(Math.random()*100)+'%'; d.style.fontSize=(14+Math.random()*12)+'px';
        d.style.animationDuration=(4+Math.random()*4)+'s';
        document.getElementById('fx').appendChild(d);
        setTimeout(function(){ d.remove(); }, 8500);
      }, 1100);
    }
    var sn=document.getElementById('seasonName'); if(sn) sn.textContent=se.name;
  };

  // ---------- GARDEN NAME SIGN ----------
  GW.renderSign=function(){
    var sign=document.getElementById('gw-sign');
    if(!sign){
      sign=document.createElement('div'); sign.id='gw-sign';
      sign.innerHTML='<span class="sign-board"><span class="sign-em">🌻</span><span class="sign-name"></span></span><span class="sign-post"></span>';
      field.appendChild(sign);
    }
    sign.querySelector('.sign-name').textContent=GW.state.gardenName||GW.GARDEN_NAME_DEFAULT;
  };

  // ---------- DECORATION PLACEMENT ----------
  GW.placeDecoAt=function(dx,dy){
    if(!GW.pendingDeco) return;
    var x=Math.max(40,Math.min(GW.DESIGN_W-40,dx)), y=Math.max(250,Math.min(GW.DESIGN_H-40,dy));
    GW.state.decor.push({type:GW.pendingDeco, x:x, y:y});
    GW.discover('decor', GW.pendingDeco);
    GW.renderDecor(); GW.sfx.plant(); GW.addXP(2);
    var def=GW.decorById(GW.pendingDeco);
    GW.floatText(innerWidth/2, innerHeight*0.4, def.em, '#fff');
    GW.pendingDeco=null; GW.mode='idle';
    document.getElementById('ghost').style.display='none';
    GW.setBanner('Looks lovely! ✨'); setTimeout(GW.hideBanner,1500); save();
  };

  // ---------- GARDENER ----------
  GW.moveGardener=function(x,y){ gardener.style.left=x+'px'; gardener.style.top=y+'px'; if(GW.movePet) GW.movePet(x,y); };
  GW.walkTo=function(x,y,cb){
    gardener.classList.add('walking'); gardener.classList.remove('sleeping');
    GW.moveGardener(x,y);
    setTimeout(function(){ gardener.classList.remove('walking'); if(cb) cb(); }, 1450);
  };
  GW.sleep=function(){ gardener.classList.add('sleeping'); gardener.classList.remove('walking'); };

  // ---------- BANNER ----------
  var bannerT=null;
  GW.setBanner=function(text){
    banner.innerHTML=text.replace(/(💧|☀️|🌱|🧺|🟫)/g,'<span class="pop">$1</span>');
    banner.classList.add('show'); clearTimeout(bannerT);
  };
  GW.hideBanner=function(){ banner.classList.remove('show'); };

  // ---------- TOOL BUTTON ----------
  GW.setTool=function(icon,label,pulse){
    toolWrap.style.display='flex'; toolBtn.classList.remove('hidden');
    toolBtn.querySelector('.ti').textContent=icon;
    toolLabel.textContent=label;
    toolBtn.classList.toggle('pulse', pulse!==false);
  };
  GW.hideTool=function(){ toolBtn.classList.add('hidden'); toolWrap.style.display='none'; };
  toolBtn.addEventListener('click',function(){ GW.audio.resume(); GW.sfx.click(); if(GW.onToolTap) GW.onToolTap(); });

  // doneBtn dynamic action
  GW.showDone=function(text,fn){ doneBtn.textContent=text; doneBtn.classList.add('show'); GW._done=fn; };
  GW.hideDone=function(){ doneBtn.classList.remove('show'); GW._done=null; };
  doneBtn.addEventListener('click',function(){ GW.sfx.click(); if(GW._done) GW._done(); });

  // ---------- FX ----------
  GW.confetti=function(n){
    n=n||26; var EM=['🎉','⭐','🌸','💚','🌼','✨','🌈','🪴'];
    for(var i=0;i<n;i++){ (function(){
      var d=document.createElement('div'); d.className='cf'; d.textContent=EM[(Math.random()*EM.length)|0];
      d.style.left=(Math.random()*100)+'%'; d.style.animationDuration=(1.7+Math.random()*1.7)+'s';
      d.style.fontSize=(16+Math.random()*18)+'px'; fx.appendChild(d);
      setTimeout(function(){ d.remove(); },3600);
    })(); }
  };
  GW.floatText=function(clientX,clientY,text,color){
    var d=document.createElement('div'); d.className='float-up'; d.textContent=text;
    d.style.left=clientX+'px'; d.style.top=clientY+'px'; d.style.color=color||'#ffe14d';
    d.style.fontSize='22px'; fx.appendChild(d);
    setTimeout(function(){ d.remove(); },1100);
  };
  GW.bedClientCenter=function(bed){
    var el=bed._el; if(!el) return {x:innerWidth/2,y:innerHeight/2};
    var r=el.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2};
  };
  GW.pourOver=function(bed,emoji,count,cb){
    var c=GW.bedClientCenter(bed), el=bed._el, r=el.getBoundingClientRect();
    for(var i=0;i<count;i++){ (function(i){ setTimeout(function(){
      var d=document.createElement('div'); d.className='pour'; d.textContent=emoji;
      d.style.left=(r.left+8+Math.random()*(r.width-16))+'px'; d.style.top=(r.top+4)+'px';
      fx.appendChild(d); setTimeout(function(){ d.remove(); },520);
    }, i*55); })(i); }
    if(cb) setTimeout(cb, count*55+260);
  };

  // ---------- BASKET (each plant type can be eaten or sold on its own) ----------
  var basketSheet=$('#basketSheet'), basketGrid=$('#basketGrid');
  GW.addToBasket=function(plantId, golden){ GW.state.basket.push({id:plantId, golden:!!golden}); GW.renderHUD(); save(); };
  function basketGroups(){
    var g=[], map={};
    GW.state.basket.forEach(function(it){
      var key=it.id+(it.golden?'_g':'');
      if(!map[key]){ map[key]={id:it.id, golden:!!it.golden, count:0}; g.push(map[key]); }
      map[key].count++;
    });
    return g;
  }
  function renderBasket(){
    var groups=basketGroups();
    if(!groups.length){ basketGrid.innerHTML='<div class="basket-empty">Your basket is empty 🧺<br>Pick ripe plants, then eat or sell them here!</div>'; return; }
    basketGrid.innerHTML=groups.map(function(gr,i){
      var p=GW.byId(gr.id), tot=p.sell*(gr.golden?GW.GOLDEN_MULT:1)*gr.count;
      return '<div class="bitem'+(gr.golden?' gold':'')+'">'+
        '<span class="be">'+p.ripe+(gr.golden?'<span class="gstar">✨</span>':'')+'</span>'+
        '<span class="bname">'+p.name+(gr.count>1?'<span class="bx"> ×'+gr.count+'</span>':'')+'</span>'+
        '<div class="bacts"><button class="bmini eat" data-g="'+i+'">😋 Eat</button>'+
        '<button class="bmini sell" data-g="'+i+'">🪙 '+tot+'</button></div></div>';
    }).join('');
  }
  function removeGroup(gr){ GW.state.basket=GW.state.basket.filter(function(it){ return !(it.id===gr.id && !!it.golden===gr.golden); }); }
  function eatGroup(gr){
    var p=GW.byId(gr.id), msgs=GW.EAT_MSG[p.kind]||['Yum! 😋'];
    GW.state.eaten=(GW.state.eaten||0)+gr.count; GW.sfx.eat();
    for(var i=0;i<Math.min(gr.count,5);i++){ (function(i){ setTimeout(function(){
      GW.floatText(innerWidth/2+(Math.random()*120-60), innerHeight*0.55, ['😋','💕','😊','✨'][(Math.random()*4)|0], '#ff8ed0');
    }, i*110); })(i); }
    removeGroup(gr); GW.renderHUD(); save(); renderBasket();
    GW.setBanner(p.ripe+' '+msgs[(Math.random()*msgs.length)|0]); setTimeout(GW.hideBanner,1500);
    if(!GW.state.basket.length) closeBasket();
  }
  function sellGroup(gr){
    var p=GW.byId(gr.id), tot=p.sell*(gr.golden?GW.GOLDEN_MULT:1)*gr.count;
    GW.state.coins+=tot; GW.sfx.coin(); GW.addXP(Math.max(1, Math.round(tot/3)));
    GW.floatText(innerWidth/2, innerHeight*0.5, '+'+tot+' 🪙', '#ffe14d'); GW.confetti(gr.golden?20:10);
    if(gr.golden && GW.rainbow) GW.rainbow();
    removeGroup(gr); GW.renderHUD(); save(); renderBasket(); checkMagicUnlock();
    if(!GW.state.basket.length) closeBasket();
  }
  function openBasket(){ renderBasket(); basketSheet.classList.add('show'); }
  function closeBasket(){ basketSheet.classList.remove('show'); }
  basketChip.addEventListener('click',function(){ GW.sfx.click(); openBasket(); });
  $('#basketX').addEventListener('click',function(){ GW.sfx.click(); closeBasket(); });
  basketGrid.addEventListener('click',function(e){
    var btn=e.target.closest('.bmini'); if(!btn) return;
    var gr=basketGroups()[+btn.dataset.g]; if(!gr) return;
    GW.sfx.click();
    if(btn.classList.contains('eat')) eatGroup(gr); else sellGroup(gr);
  });
  var sellAllBtn=$('#sellAllBtn');
  if(sellAllBtn) sellAllBtn.addEventListener('click',function(){
    var b=GW.state.basket; if(!b.length) return;
    var golds=b.filter(function(it){return it.golden;}).length;
    var total=b.reduce(function(s,it){ return s+GW.byId(it.id).sell*(it.golden?GW.GOLDEN_MULT:1); },0);
    var n=b.length;
    GW.state.coins+=total; GW.sfx.coin(); GW.addXP(Math.max(2, Math.round(total/3)));
    GW.floatText(innerWidth/2, innerHeight*0.5, '+'+total+' 🪙', '#ffe14d');
    GW.confetti(n>=5?28:14);
    if((n>=5 || golds>0) && GW.rainbow){ GW.rainbow(); GW.sfx.win(); }
    GW.state.basket=[]; GW.renderHUD(); save(); closeBasket();
    checkMagicUnlock();
  });
  function checkMagicUnlock(){
    if(!GW.state.magic && GW.state.coins>=GW.MAGIC_UNLOCK){
      GW.state.magic=true; save(); GW.sfx.win(); GW.confetti(34);
      if(GW.rainbow) GW.rainbow();
      GW.setBanner('✨ Magic seeds unlocked! 🌈'); setTimeout(GW.hideBanner,2600);
    }
  }
  GW.checkMagicUnlock=checkMagicUnlock;

  // ---------- HARVEST (morning) ----------
  GW.harvestMode=false;
  function ripeCount(){ var n=0; GW.state.beds.forEach(function(bed){ bed.cells.forEach(function(c){ if(c.plant&&!c.picked&&c.growth>=2) n++; }); }); return n; }
  GW.ripeCount=ripeCount;

  // design-space centre of a bed cell (used for forgiving taps)
  GW.cellCenter=function(bed, idx){
    var sh=GW.SHAPES[bed.shape], iw=sh.cols*sh.unit, ih=sh.rows*sh.unit, c=sh.cells[idx];
    return { x: bed.x - iw/2 + c.gx*sh.unit + sh.unit/2, y: bed.y - ih/2 + c.gy*sh.unit + sh.unit/2 };
  };
  // nearest cell (across beds) matching filter(bed,cell), within maxR design px
  GW.nearestCell=function(dx,dy,filter,maxR){
    maxR=maxR||160; var best=null, bd=maxR*maxR;
    GW.state.beds.forEach(function(bed){ bed.cells.forEach(function(c,i){
      if(!filter(bed,c)) return;
      var cc=GW.cellCenter(bed,i), d=(cc.x-dx)*(cc.x-dx)+(cc.y-dy)*(cc.y-dy);
      if(d<bd){ bd=d; best={bed:bed, idx:i}; }
    }); });
    return best;
  };

  GW.harvestAt=function(bed, idx){
    var c=bed.cells[idx]; if(!c||!c.plant||c.picked||c.growth<2) return;
    c.picked=true;
    var p=GW.byId(c.plant); GW.addToBasket(c.plant, c.golden);
    GW.state.plantsGrown=(GW.state.plantsGrown||0)+1;
    GW.discoverPlant(c.plant);
    var cell=bed._el && bed._el.querySelector('.cell[data-idx="'+idx+'"]');
    var r=cell&&cell.getBoundingClientRect();
    if(c.golden){
      GW.sfx.sparkle(); GW.addXP(8);
      if(r){ GW.floatText(r.left+r.width/2, r.top, '✨'+p.ripe+'✨', '#ffe14d'); if(GW.sparkleBurst) GW.sparkleBurst(r.left+r.width/2, r.top+r.height/2); }
      GW.setBanner('✨ A golden '+p.name+'! Worth 3x! ✨');
    } else {
      GW.sfx.harvest(); GW.addXP(3);
      if(r){ GW.floatText(r.left+r.width/2, r.top, p.ripe, '#fff'); }
    }
    GW.paintBed(bed); save();
    if(ripeCount()===0){ GW.setBanner('All picked! 🧺 Tap 🌱 to plant more'); }
  };

  // ---------- FIELD TAP ROUTING (forgiving — taps snap to nearest cell) ----------
  field.addEventListener('pointerdown', function(e){
    var d=GW.toDesign(e.clientX,e.clientY);
    if(GW.mode==='deco'){ if(GW.placeDecoAt) GW.placeDecoAt(d.x,d.y); return; }
    if(GW.mode==='placing' || GW.mode==='planting'){ if(GW.buildTap) GW.buildTap(d.x,d.y,e); return; }
    var hit=GW.nearestCell(d.x,d.y,function(bed,c){ return c.plant&&!c.picked&&c.growth>=2; });
    if(hit) GW.harvestAt(hit.bed, hit.idx);
  });

  // ---------- DAY CARD ----------
  var SUBS=['A bright new morning!','The sun is shining! ☀️','Birds are singing 🐦','Fresh dew on the grass 🌿','Another day to grow 🌱'];
  GW.showDayCard=function(cb){
    $('#dcDay').textContent='Day '+GW.state.day;
    $('#dcSub').textContent=SUBS[(GW.state.day-1)%SUBS.length];
    daycard.classList.add('show');
    setTimeout(function(){ daycard.classList.remove('show'); if(cb) cb(); }, 1700);
  };

  // ---------- MORNING ----------
  GW.runMorning=function(){
    GW.setPhase('night'); GW.moveGardener(GW.DOOR.x, GW.DOOR.y); GW.sleep();
    GW.hideTool(); GW.hideDone(); GW.tray.classList.add('hidden'); GW.hideBanner();
    if(GW.endGardenTimeUI) GW.endGardenTimeUI();
    GW.showDayCard(function(){
      GW.sfx.day(); GW.setPhase('dawn');
      setTimeout(function(){
        GW.walkTo(GW.YARD.x, GW.YARD.y, function(){
          GW.setPhase('day');
          GW.applySeason();
          if(GW.startCritters) GW.startCritters();
          if(GW.startEvents) GW.startEvents();
          if(GW.maybeOfferPet) GW.maybeOfferPet();
          if(GW.checkMail) GW.checkMail();
          GW.startGardenTime();
        });
      }, 700);
    });
  };

  // ---------- SLEEP → NEXT DAY ----------
  GW.goToSleep=function(){
    GW.hideTool(); GW.hideDone(); GW.tray.classList.add('hidden');
    if(GW.endGardenTimeUI) GW.endGardenTimeUI();
    if(GW.stopCritters) GW.stopCritters();
    if(GW.stopEvents) GW.stopEvents();
    GW.setBanner(GW.BANNER.goodnight);
    GW.walkTo(GW.DOOR.x, GW.DOOR.y, function(){
      GW.sleep(); GW.setPhase('dusk'); GW.sfx.night();
      setTimeout(function(){
        GW.setPhase('night');
        // watered plants grow overnight (some sparkle into golden!)
        GW.state.beds.forEach(function(bed){ bed.cells.forEach(function(c){
          if(c.plant && !c.picked && c.growth<2 && c.watered){ c.growth=2; c.watered=false;
            if(!c.golden && Math.random()<GW.GOLDEN_CHANCE) c.golden=true; } }); });
        GW.state.day++; GW.state.builtToday=false; GW.state.buildStep=null;
        save();
        setTimeout(function(){ GW.renderAllBeds(); GW.runMorning(); }, 900);
      }, 1500);
    });
  };

  // ---------- MENU ----------
  var menuSheet=$('#menuSheet');
  $('#menuBtn').addEventListener('click',function(){ GW.sfx.click(); menuSheet.classList.add('show'); });
  $('#menuX').addEventListener('click',function(){ GW.sfx.click(); menuSheet.classList.remove('show'); });
  function updMute(){ var m=GW.audio.isMuted(); $('#muteLbl').textContent='Sound: '+(m?'Off':'On'); $('#muteBtn .me').textContent=m?'🔇':'🔊'; }
  updMute();
  $('#muteBtn').addEventListener('click',function(){ GW.audio.toggle(); updMute(); });
  $('#labBtn').addEventListener('click',function(){ if(window.MayaPortal) MayaPortal.leaveToLab(); else history.back(); });
  $('#resetBtn').addEventListener('click',function(){
    if(!confirm('Start a brand new garden? Your current garden will be cleared.')) return;
    try{ localStorage.removeItem('gardenwork_save'); }catch(e){}
    GW.state=freshState(); save(); menuSheet.classList.remove('show');
    field.querySelectorAll('.bed').forEach(function(b){b.remove();});
    field.querySelectorAll('.uitem').forEach(function(b){b.remove();});
    if(GW.stopCritters) GW.stopCritters();
    if(GW.stopEvents) GW.stopEvents();
    if(GW.setupPet) GW.setupPet();
    GW.renderSign(); GW.applySeason();
    GW.renderHUD(); GW.runMorning();
  });

  // ---------- START ----------
  function begin(state){
    GW.state=state;
    if(state.basket && state.basket.length && typeof state.basket[0]==='string'){
      state.basket=state.basket.map(function(id){return {id:id, golden:false};});
    }
    if(!state.unlockedSeeds) state.unlockedSeeds=[];
    if(!state.pets) state.pets = state.pet ? [state.pet] : [];
    if(!state.decor) state.decor=[];
    if(!state.discovered) state.discovered={};
    if(typeof state.xp!=='number') state.xp=0;
    if(typeof state.plantsGrown!=='number') state.plantsGrown=0;
    if(!state.gardenName) state.gardenName=GW.GARDEN_NAME_DEFAULT;
    if(typeof state.mailDay!=='number') state.mailDay=0;
    (state.beds||[]).forEach(function(bed){ bed.cells.forEach(function(c){
      if(typeof c.watered!=='boolean') c.watered = !!bed.watered && !!c.plant && !c.picked && (c.growth||0)<2; }); });
    if(GW.buildDock) GW.buildDock();
    if(GW.setupMailbox) GW.setupMailbox();
    layout(); decorate(); GW.renderFence(); GW.renderDecor(); GW.renderSign(); GW.applySeason();
    GW.renderHUD(); GW.renderAllBeds();
    splash.classList.add('gone');
    GW.audio.resume();
    if(GW.setupPet) GW.setupPet();
    // resume mid-build?
    if(state.builtToday && state.buildStep && GW.resumeBuild){
      GW.setPhase('day'); GW.moveGardener(GW.YARD.x,GW.YARD.y);
      if(GW.startCritters) GW.startCritters();
      if(GW.startEvents) GW.startEvents();
      GW.resumeBuild();
    } else {
      GW.runMorning();
    }
  }
  var saved=load();
  if(saved && saved.beds && (saved.beds.length || saved.day>1)){
    $('#continueBtn').style.display='inline-block';
    $('#continueBtn').textContent='↩ Keep my garden (Day '+saved.day+')';
  }
  $('#startBtn').addEventListener('click',function(){ GW.audio.resume(); GW.sfx.click(); begin(freshState()); });
  $('#continueBtn').addEventListener('click',function(){ GW.audio.resume(); GW.sfx.click(); begin(saved||freshState()); });
  GW.freshState=freshState;

  layout();
})();
