/* ===== Garden Work — Mailbox from Dad, rare visitors, weather ===== */
(function(){
  var GW = window.GW;
  var field=document.getElementById('field');
  function el(tag,cls,html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }

  // ---------- MAILBOX ----------
  var mailEl=null;
  GW.setupMailbox=function(){
    if(mailEl) return;
    mailEl=el('div','','<span class="mb-post"></span><span class="mb-box">📭</span><span class="mb-flag">❗</span>');
    mailEl.id='mailbox';
    mailEl.addEventListener('click',function(e){ e.stopPropagation();
      if(GW.state && GW.state.mailWaiting) openLetter(); });
    field.appendChild(mailEl);
    refreshMailbox();
  };
  function refreshMailbox(){
    if(!mailEl||!GW.state) return;
    var waiting=!!GW.state.mailWaiting;
    mailEl.classList.toggle('has-mail', waiting);
    mailEl.querySelector('.mb-box').textContent = waiting ? '📬' : '📭';
  }
  GW.checkMail=function(){
    if(!GW.state) return;
    if(GW.state.day > (GW.state.mailDay||0)){
      GW.state.mailWaiting=true; GW.state.mailDay=GW.state.day;
      GW.state.mailNote = GW.DAD_NOTES[(GW.state.day-1) % GW.DAD_NOTES.length];
      GW.state.mailGift = rollGift();
      GW.save();
    }
    refreshMailbox();
    if(GW.state.mailWaiting){ setTimeout(function(){ GW.setBanner('📬 You have mail from Dad!'); setTimeout(GW.hideBanner,2600); }, 900); }
  };
  function rollGift(){
    var r=Math.random();
    if(r<0.30){
      var seeds=GW.PLANTS.filter(function(p){ return p.unlock===-1 && (GW.state.unlockedSeeds||[]).indexOf(p.id)<0; });
      if(seeds.length){ var s=seeds[(Math.random()*seeds.length)|0]; return {type:'seed', id:s.id, em:s.ripe, name:s.name}; }
    }
    if(r<0.45){
      var disc=GW.state.discovered||{};
      var decs=GW.DECOR.filter(function(d){ return !disc['decor:'+d.id]; });
      if(decs.length){ var d=decs[(Math.random()*decs.length)|0]; return {type:'decor', id:d.id, em:d.em, name:d.name}; }
    }
    return {type:'coins', amount:10+((Math.random()*14)|0)};
  }
  var letterSheet=null;
  function openLetter(){
    if(!letterSheet){
      letterSheet=el('div','sheet'); letterSheet.id='letterSheet';
      letterSheet.innerHTML='<div class="sheet-card letter-card">'+
        '<div class="letter-top">💌 A letter from Dad</div>'+
        '<div class="letter-note" id="letterNote"></div>'+
        '<div class="letter-gift" id="letterGift"></div>'+
        '<button class="bbtn letter-ok" id="letterOk">Thank you, Dad! 💛</button></div>';
      document.body.appendChild(letterSheet);
      letterSheet.querySelector('#letterOk').addEventListener('click',function(){ GW.sfx.click(); claimGift(); letterSheet.classList.remove('show'); });
    }
    var hr=new Date().getHours();
    var greet=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
    letterSheet.querySelector('#letterNote').innerHTML='<span class="letter-greet">'+greet+', Maya!</span>'+(GW.state.mailNote||'Love, Dad');
    var g=GW.state.mailGift||{type:'coins',amount:10};
    var gt = g.type==='coins' ? ('🪙 '+g.amount+' coins!') : (g.em+' '+g.name+(g.type==='seed'?' seeds!':'!'));
    letterSheet.querySelector('#letterGift').innerHTML='<span class="lg-label">Dad sent you a gift:</span><span class="lg-item">'+gt+'</span>';
    GW.sfx.day(); letterSheet.classList.add('show');
  }
  function claimGift(){
    var g=GW.state.mailGift||{type:'coins',amount:10};
    if(g.type==='coins'){ GW.state.coins+=g.amount; GW.floatText(innerWidth/2,innerHeight*0.4,'+'+g.amount+'🪙','#ffe14d'); }
    else if(g.type==='seed'){ if((GW.state.unlockedSeeds||[]).indexOf(g.id)<0) GW.state.unlockedSeeds.push(g.id); GW.discover('plant',g.id); }
    else if(g.type==='decor'){ GW.state.decor.push({type:g.id, x:120+((Math.random()*480)|0), y:300+((Math.random()*120)|0)}); GW.discover('decor',g.id); GW.renderDecor(); }
    GW.sfx.coin(); GW.confetti(16);
    GW.state.mailWaiting=false; GW.state.mailGift=null; GW.renderHUD(); GW.save(); refreshMailbox();
  }

  // ---------- RARE VISITORS ----------
  var vTimer=null, active=null;
  function spawnVisitor(){
    if(!GW.state || GW.state.phase!=='day' || active) return;
    var def=GW.VISITORS[(Math.random()*GW.VISITORS.length)|0];
    var node=el('div','visitor','<span class="fly-em">'+def.em+'</span><span class="fly-tag">'+def.name+' · tap!</span>'); node._def=def;
    node.style.left=(120+Math.random()*(GW.DESIGN_W-240))+'px';
    node.style.top=(300+Math.random()*(GW.DESIGN_H-470))+'px';
    var obj={el:node, alive:true};
    obj.timeout=setTimeout(function(){ if(!obj.alive)return; obj.alive=false; active=null; node.classList.add('leaving'); setTimeout(function(){node.remove();},800); }, 9000);
    node.addEventListener('pointerdown',function(e){ e.stopPropagation(); if(!obj.alive)return;
      obj.alive=false; clearTimeout(obj.timeout); active=null;
      rewardVisitor(def, node);
      node.classList.add('caught'); setTimeout(function(){ node.remove(); },360);
    });
    field.appendChild(node); active=obj;
    GW.setBanner('Look! '+def.msg);
    setTimeout(GW.hideBanner, 3200);
  }
  function rewardVisitor(def, node){
    GW.state.visitorsSeen=(GW.state.visitorsSeen||0)+1; GW.discover('visitor', def.id);
    var r=node.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
    GW.sfx.win(); GW.addXP(6);
    if(GW.sparkleBurst) GW.sparkleBurst(cx,cy);
    if(def.reward==='coins'){
      GW.state.coins+=def.amount; GW.floatText(cx,r.top,'+'+def.amount+'🪙','#ffe14d');
      if(GW.rainbow) GW.rainbow();
    } else if(def.reward==='golden'){
      var made=makeRandomGolden();
      if(GW.rainbow) GW.rainbow();
      GW.floatText(cx,r.top, made?'✨ golden! ✨':'+10🪙','#ffe14d');
      if(!made) GW.state.coins+=10;
    } else { // wish
      var amt=12+((Math.random()*12)|0); GW.state.coins+=amt;
      GW.floatText(cx,r.top,'wish granted! +'+amt+'🪙','#c77dff');
      if(GW.fireworks) GW.fireworks();
    }
    GW.confetti(22); GW.renderHUD(); GW.save();
  }
  function makeRandomGolden(){
    var cands=[];
    GW.state.beds.forEach(function(b){ b.cells.forEach(function(c,i){ if(c.plant&&!c.picked&&!c.golden){ cands.push({b:b,i:i}); } }); });
    if(!cands.length) return false;
    var pick=cands[(Math.random()*cands.length)|0];
    pick.b.cells[pick.i].golden=true; if(pick.b.cells[pick.i].growth<2) pick.b.cells[pick.i].growth=2;
    GW.paintBed(pick.b); return true;
  }

  // ---------- WEATHER ----------
  function applyWeather(){
    var rain=document.getElementById('rain-layer');
    var isRain = GW.state.day>1 && Math.random()<0.22;
    if(isRain){
      if(!rain){ rain=el('div','','' ); rain.id='rain-layer';
        var h=''; for(var i=0;i<40;i++){ h+='<i style="left:'+(Math.random()*100)+'%;animation-delay:'+(Math.random()*1.2)+'s;animation-duration:'+(0.6+Math.random()*0.5)+'s"></i>'; }
        rain.innerHTML=h; document.getElementById('ambient').appendChild(rain);
      }
      rain.style.display='block';
      // rain waters everything for her
      var any=false;
      GW.state.beds.forEach(function(bed){ bed.cells.forEach(function(c){ if(c.plant&&!c.picked&&c.growth<2&&!c.watered){ c.watered=true; any=true; } }); GW.paintBed(bed); });
      if(any){ GW.save(); setTimeout(function(){ GW.setBanner('🌧️ Rain watered your garden for you!'); setTimeout(GW.hideBanner,2800); }, 1400); }
      setTimeout(function(){ if(rain) rain.style.display='none'; }, 7000);
    } else if(rain){ rain.style.display='none'; }
  }

  // ---------- lifecycle ----------
  GW.startEvents=function(){
    GW.stopEvents();
    applyWeather();
    vTimer=setInterval(function(){ if(Math.random()<0.5) spawnVisitor(); }, 22000);
    setTimeout(function(){ if(Math.random()<0.6) spawnVisitor(); }, 9000);
  };
  GW.stopEvents=function(){
    if(vTimer){ clearInterval(vTimer); vTimer=null; }
    if(active){ clearTimeout(active.timeout); active.el.remove(); active=null; }
    var rain=document.getElementById('rain-layer'); if(rain) rain.style.display='none';
  };
})();
