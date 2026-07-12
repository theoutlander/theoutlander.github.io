// ════════════════════════════════════════════════════════════
//  MAYA'S SEWING SHOP — game logic
//  Sew items → customers stroll by → they talk → you pick a reply!
// ════════════════════════════════════════════════════════════
(function(){
'use strict';

var SAVE='maya-sewing-v1';
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

var SHELF_MAX=5;

// ── state ──
var S={ name:'', avatar:KEEPERS[0], coins:0, rep:65, muted:false, shelf:[], day:1, dayCoins:0, bestDay:0, unlocked:STARTER_KEYS.slice() };
try{ var raw=MayaSave.get(SAVE); if(raw) S=Object.assign(S,JSON.parse(raw)); }catch(e){}
if(!S.unlocked || !S.unlocked.length) S.unlocked=STARTER_KEYS.slice();
if(!S.day) S.day=1;
if(S.dayCoins==null) S.dayCoins=0;
if(S.bestDay==null) S.bestDay=0;
if(S.rep==null) S.rep=65;
function save(){ MayaSave.set(SAVE,JSON.stringify(S)); }

function goal(){ return 20 + (S.day-1)*15; }              // day 1=20, 2=35, 3=50…
function itemByKey(k){ for(var i=0;i<ITEMS.length;i++){ if(ITEMS[i].key===k) return ITEMS[i]; } return null; }
function nextLocked(){ for(var i=0;i<UNLOCK_ORDER.length;i++){ if(S.unlocked.indexOf(UNLOCK_ORDER[i])<0) return UNLOCK_ORDER[i]; } return null; }

// ── dom refs ──
var $=function(id){return document.getElementById(id);};
var scene=$('scene'), panel=$('panel'), shelfEl=$('shelf-items');
var keeper=$('keeper'), kFig=$('k-fig'), machine=$('machine');

var busy=false;            // a customer is being handled
var spawnT=null;           // next-spawn timer
var current=null;          // current customer element
var lastMilestone=0;
var paused=false;          // overlays (design / win-day) pause spawning
var uidc=0;                // unique id for shelf items
var dayShown=false;        // guard so win-day fires once per day
var goalMet=false;         // today's goal reached — now racing to beat the record
var buzz=0;                // word-of-mouth: eager referred customers queued
var lured=false;           // the next customer was called over
var rushLeft=0;            // customers remaining in a rush
var protesting=false;      // town is protesting outside
var coolOff=false;         // call-out cooldown

// ════════ AUDIO ════════
var AC=null, MASTER=null;
function ac(){
  if(window.MayaIOSAudioUnlock) window.MayaIOSAudioUnlock.unlock();
  if(!AC){
    try{
      AC=new (window.AudioContext||window.webkitAudioContext)();
      MASTER=AC.createGain(); MASTER.gain.value=0.32; MASTER.connect(AC.destination);
    }catch(e){}
  }
  if(AC && AC.state==='suspended'){ try{ AC.resume(); }catch(e){} }
  return AC;
}

// musical note names → frequency (so jingles read like little tunes)
var NOTE={C4:261.6,D4:293.7,E4:329.6,F4:349.2,G4:392.0,A4:440.0,B4:493.9,
  C5:523.3,D5:587.3,E5:659.3,F5:698.5,G5:784.0,A5:880.0,B5:987.8,C6:1046.5,
  E6:1318.5,G6:1568.0};

// one voice: freq (Hz or note name), start delay, duration, waveform, volume
function tone(freq,when,dur,type,vol){
  var c=ac(); if(!c||S.muted) return;
  if(typeof freq==='string') freq=NOTE[freq]||440;
  var t=c.currentTime+(when||0);
  var o=c.createOscillator(), g=c.createGain();
  o.type=type||'triangle';
  o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(vol||0.5,t+0.012);          // quick attack
  g.gain.exponentialRampToValueAtTime(0.0001,t+(dur||0.18));      // smooth decay
  o.connect(g); g.connect(MASTER); o.start(t); o.stop(t+(dur||0.18)+0.03);
}
// a little glide between two pitches (for boings / whooshes)
function slide(f1,f2,when,dur,type,vol){
  var c=ac(); if(!c||S.muted) return;
  if(typeof f1==='string') f1=NOTE[f1]||440; if(typeof f2==='string') f2=NOTE[f2]||440;
  var t=c.currentTime+(when||0);
  var o=c.createOscillator(), g=c.createGain();
  o.type=type||'sine'; o.frequency.setValueAtTime(f1,t);
  o.frequency.exponentialRampToValueAtTime(f2,t+(dur||0.2));
  g.gain.setValueAtTime(0.0001,t);
  g.gain.exponentialRampToValueAtTime(vol||0.4,t+0.02);
  g.gain.exponentialRampToValueAtTime(0.0001,t+(dur||0.2));
  o.connect(g); g.connect(MASTER); o.start(t); o.stop(t+(dur||0.2)+0.03);
}
// play a sequence: [[note,dur,vol?,type?], ...] with a gap between each
function jingle(notes,gap,type){
  var when=0;
  notes.forEach(function(n){
    tone(n[0], when, n[1], n[3]||type||'triangle', n[2]||0.5);
    when += (gap!=null?gap:n[1]);
  });
}

// ── the fun sounds ──
function sfxStitch(){ tone(560+Math.random()*120,0,0.05,'square',0.18); }          // sewing machine tick
function sfxCoin(){ jingle([['E5',0.08],['G5',0.08],['C6',0.16,0.55]],0.07,'triangle'); } // cha-ching!
function sfxHeart(){ jingle([['E5',0.1],['A5',0.16,0.5]],0.09,'sine'); }            // warm two-note
function sfxShoo(){ slide('A4','C4',0,0.28,'sawtooth',0.4); }                       // downward "out!"
function sfxBlip(){ tone('E5',0,0.07,'triangle',0.32); }                            // soft UI tap
function sfxDoor(){ jingle([['C5',0.09],['E5',0.09],['G5',0.12,0.45]],0.08,'sine'); } // shop-door chime
function sfxPop(){ slide(400,1000,0,0.09,'sine',0.4); tone(1100,0.05,0.06,'triangle',0.25); } // bubble pop
function sfxBuy(){ jingle([['G4',0.08],['C5',0.08],['E5',0.1],['G5',0.18,0.55]],0.07,'triangle'); } // happy purchase
function sfxRipoff(){ // sad trombone wah-wah-waaah
  slide(330,294,0,0.22,'sawtooth',0.4);
  slide(294,277,0.22,0.24,'sawtooth',0.38);
  slide(277,220,0.46,0.55,'sawtooth',0.36);
}
function sfxMake(){ jingle([['C5',0.1],['E5',0.1],['G5',0.1],['C6',0.22,0.55]],0.08,'triangle'); } // ta-da (designed it!)
function sfxFanfare(){ // win the day!
  jingle([['C5',0.14],['E5',0.14],['G5',0.14],['C6',0.28,0.6],['G5',0.14],['C6',0.4,0.6]],null,'triangle');
  tone('E6',0.7,0.4,'sine',0.35); tone('G6',0.7,0.4,'sine',0.3);
}
function sfxYoohoo(){ slide('E5','A5',0,0.16,'sine',0.4); slide('A5','E5',0.16,0.18,'sine',0.34); } // call-out
function sfxPoof(){ slide(700,180,0,0.22,'triangle',0.3); }                          // take item down
function sfxProtest(){ slide(220,170,0,0.4,'sawtooth',0.32); tone(160,0.2,0.4,'square',0.18); } // angry crowd

// ── gentle background music: a sparse, cheerful loop ──
var musicOn=false, musicTimer=null, mStep=0;
// a happy little melody (note, beats) in a major key
var MELODY=[['C5',1],['E5',1],['G5',1],['E5',1],['F5',1],['A5',1],['G5',2],
            ['E5',1],['G5',1],['C6',1],['G5',1],['A5',1],['F5',1],['G5',2],
            ['D5',1],['F5',1],['A5',1],['F5',1],['E5',1],['G5',1],['C5',2]];
var BASS=['C4','C4','F4','F4','G4','C4','C4'];
var BEAT=0.34; // seconds per beat
function musicTick(){
  if(!musicOn||S.muted){ return; }
  var note=MELODY[mStep%MELODY.length];
  var dur=note[1]*BEAT;
  tone(note[0],0,Math.min(dur*0.9,0.5),'triangle',0.12);          // soft melody
  if(mStep%2===0) tone(BASS[(mStep/2|0)%BASS.length],0,0.5,'sine',0.10); // gentle bass
  mStep++;
  musicTimer=setTimeout(musicTick, dur*1000);
}
function startMusic(){ if(musicOn||S.muted) return; ac(); musicOn=true; mStep=0; musicTick(); }
function stopMusic(){ musicOn=false; clearTimeout(musicTimer); }

// ════════ STARS + LIGHTS ════════
(function stars(){
  var s=$('stars'); var f=document.createDocumentFragment();
  for(var i=0;i<80;i++){ var d=document.createElement('div'); d.className='star';
    var z=Math.random()*2.2+.4;
    d.style.cssText='width:'+z+'px;height:'+z+'px;left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;--d:'+(1.5+Math.random()*3)+'s;--o:'+(.2+Math.random()*.8)+';animation-delay:'+(Math.random()*4)+'s';
    f.appendChild(d);
  } s.appendChild(f);
})();
(function lights(){
  var cols=['#ff6eb4','#ffe14d','#5dffb0','#5bc8ff','#c77dff','#ff9a3c'];
  var L=$('lights'), f=document.createDocumentFragment();
  for(var i=0;i<11;i++){ var b=document.createElement('b'); var c=cols[i%cols.length];
    b.style.color=c; b.style.background=c; b.style.setProperty('--m',(i%2?9:3)+'px');
    b.style.animationDelay=(i*0.18)+'s'; f.appendChild(b);
  } L.appendChild(f);
})();

// ════════ HELPERS ════════
function rnd(a){ return a[Math.floor(Math.random()*a.length)]; }
function itemLabel(it){ return it.emoji+' '+it.name; }
function setTop(){
  $('s-coins').textContent=S.coins;
  var b=$('s-best'); if(b) b.textContent=S.bestDay;
  updateMood();
}

// ── TOWN HAPPINESS (reputation) ──
function moodFace(){
  var r=S.rep;
  if(r>=85) return '😍';
  if(r>=60) return '😊';
  if(r>=35) return '😐';
  if(r>=15) return '😟';
  return '😠';
}
function updateMood(){
  var f=$('mood-face'); if(f) f.textContent=moodFace();
  var v=$('s-rep'); if(v) v.textContent=Math.round(S.rep);
  var chip=$('chip-mood');
  if(chip){ chip.classList.toggle('low', S.rep<35); chip.classList.toggle('high', S.rep>=85); }
}
function applyRep(delta){
  S.rep=Math.max(0,Math.min(100,S.rep+delta));
  save(); updateMood();
  if(delta!==0) floatRep(delta);
  if(delta>0) bumpChip('mood');
  if(S.rep<15 && !protesting) startProtest();
  else if(S.rep>=22 && protesting) stopProtest();
}
function floatRep(delta){
  var chip=$('chip-mood'); if(!chip) return;
  var r=chip.getBoundingClientRect();
  var el=document.createElement('div'); el.className='repfloat '+(delta>0?'up':'down');
  el.textContent=(delta>0?'+':'')+delta+(delta>0?' 💛':' 💔');
  el.style.left=(r.left+r.width/2)+'px'; el.style.top=r.bottom+'px';
  document.body.appendChild(el);
  setTimeout(function(){ el.remove(); },1100);
}

// coins flow through here so the daily goal + record stay in sync
function addCoins(n){ S.coins+=n; S.dayCoins+=n; save(); setTop(); updateGoal(); checkMilestone(); checkDay(); }
function spendCoins(n){ S.coins=Math.max(0,S.coins-n); save(); setTop(); }

function updateGoal(){
  var g=goal();
  var f=$('goal-fill'); var t=$('goal-txt');
  if(!goalMet){
    var pct=Math.max(0,Math.min(100, Math.round(S.dayCoins/g*100)));
    if(f) f.style.width=pct+'%';
    if(t) t.textContent='🎯 Day '+S.day+' — '+Math.min(S.dayCoins,g)+' / '+g+' 🪙';
  } else {
    if(f){ f.style.width='100%'; f.classList.add('done'); }
    if(t) t.textContent='⭐ Earned 🪙'+S.dayCoins+' — beat your best 🏆'+S.bestDay+'!';
  }
}

function checkDay(){ if(!goalMet && S.dayCoins>=goal()) reachGoal(); }

// goal reached mid-day: unlock the next item NOW, keep selling to pad the record
function reachGoal(){
  goalMet=true;
  var nk=nextLocked(); var got=null;
  if(nk && S.unlocked.indexOf(nk)<0){ S.unlocked.push(nk); got=itemByKey(nk); save(); }
  var msg='🎯 Goal smashed! ';
  if(got) msg+='Unlocked '+got.emoji+' '+got.name+'s! ';
  msg+='Keep selling — then tap 🌙 End Day!';
  toast(msg); sfxFanfare(); confetti(30);
  var eb=$('btn-endday'); if(eb) eb.classList.add('ready');
  updateGoal();
  if(!busy) renderSew();
}

// player ends the day → tally up, celebrate, compare to best ever
function endDay(){
  if(!goalMet){ toast('Hit your 🎯 goal first!'); sfxBlip(); return; }
  if(dayShown) return;
  dayShown=true; paused=true; clearTimeout(spawnT);
  var record = S.dayCoins > S.bestDay;
  if(record) S.bestDay = S.dayCoins;
  save(); setTop();
  $('day-num').textContent=S.day;
  var msg;
  if(record){ msg='🏆 <b>NEW BEST DAY!</b> 🏆<br>You made 🪙'+S.dayCoins+' — a new record!'; }
  else { msg='You made 🪙'+S.dayCoins+' today! ⭐<br><br>Your best is 🏆'+S.bestDay+'. Beat it tomorrow!'; }
  var nk=nextLocked();
  if(nk){ var it=itemByKey(nk); if(it) msg+='<br><br>🔒 Tomorrow: hit the goal to unlock '+it.emoji+' '+it.name+'s!'; }
  else msg+='<br><br>You\u2019ve unlocked everything — you\u2019re a sewing star! 🌟';
  $('day-msg').innerHTML=msg;
  $('ov-day').classList.remove('hidden');
  confetti(record?60:40); sfxFanfare();
}

function nextDay(){
  S.day+=1; S.dayCoins=0; goalMet=false; dayShown=false; save();
  $('ov-day').classList.add('hidden');
  var f=$('goal-fill'); if(f) f.classList.remove('done');
  var eb=$('btn-endday'); if(eb) eb.classList.remove('ready');
  updateGoal(); setTop();
  paused=false; busy=false;
  renderSew();
  scheduleSpawn(1500);
}
function toast(msg){ var t=$('toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast._t); toast._t=setTimeout(function(){t.classList.remove('show');},2400); }

function confetti(n){
  var CE=['🎉','⭐','🎊','💫','🌈','🧵','✨','🎀','💕','🪙','🧷','🎁'];
  for(var i=0;i<(n||18);i++){ (function(i){ setTimeout(function(){
    var el=document.createElement('div'); el.className='cp'; el.textContent=rnd(CE);
    el.style.cssText='left:'+(Math.random()*100)+'%;animation-duration:'+(1.8+Math.random()*2)+'s;font-size:'+(14+Math.random()*20)+'px';
    document.body.appendChild(el); setTimeout(function(){el.remove();},4200);
  },i*55); })(i); }
}

// burst of emoji rising from a screen point
function burstAt(clientX,clientY,emoji,count){
  for(var i=0;i<(count||5);i++){
    var el=document.createElement('div'); el.className='burst'; el.textContent=emoji;
    el.style.left=clientX+'px'; el.style.top=clientY+'px';
    el.style.setProperty('--bx',((Math.random()*60)-30)+'px');
    el.style.animationDelay=(i*0.05)+'s';
    document.body.appendChild(el); (function(el){ setTimeout(function(){el.remove();},1000); })(el);
  }
}

// ════════ SHELF ════════
function renderShelf(){
  shelfEl.innerHTML='';
  for(var i=0;i<SHELF_MAX;i++){
    var slot=document.createElement('div'); slot.className='shelf-slot';
    var it=S.shelf[i];
    if(it){
      var d=document.createElement('div'); d.className='shelf-item'+(it.custom?' custom':''); d.dataset.idx=i;
      if(it.custom){
        var stk=(it.stickers&&it.stickers.length)?'<span class="si-csticker">'+it.stickers[0]+'</span>':'';
        d.innerHTML='<div class="si-card" style="background:'+it.color+'"><span class="si-cbase">'+it.base+'</span>'+stk+'</div><span class="si-pr">🪙'+it.price+'</span>';
      } else {
        d.innerHTML='<span class="si-em">'+it.emoji+'</span><span class="si-pr">🪙'+it.price+'</span>';
      }
      slot.appendChild(d);
    }
    shelfEl.appendChild(slot);
  }
}

// ════════ SEWING STATION (idle panel) ════════
function renderSew(){
  if(busy) return;
  panel.innerHTML='';
  var t=document.createElement('div'); t.className='panel-title';
  t.innerHTML='🧵 What should we make? <span style="color:var(--muted);font-weight:800">('+S.shelf.length+'/'+SHELF_MAX+' on the shelf)</span>';
  panel.appendChild(t);

  var scrollr=document.createElement('div'); scrollr.className='sew-scroll';
  var grid=document.createElement('div'); grid.className='sew-grid';

  // design-your-own button (full width)
  var dbtn=document.createElement('button'); dbtn.className='sew-btn design';
  dbtn.innerHTML='<span class="se">🎨</span><span><b>Design your own!</b><br><small>Make something unique &amp; hang it up</small></span>';
  dbtn.onclick=function(){ openDesign(); };
  grid.appendChild(dbtn);

  ITEMS.forEach(function(it){
    var locked = S.unlocked.indexOf(it.key)<0;
    var b=document.createElement('button'); b.className='sew-btn'+(locked?' locked':'');
    if(locked){
      b.innerHTML='<span class="se">🔒</span><span class="sn">'+it.name+'</span><span class="sp">soon</span>';
      b.onclick=function(){ toast('🔒 Win the day to unlock '+it.emoji+' '+it.name+'s!'); sfxBlip(); };
    } else {
      b.innerHTML='<span class="se">'+it.emoji+'</span><span class="sn">'+it.name+'</span><span class="sp">🪙'+it.price+'</span>';
      b.onclick=function(){ sew(it,b); };
    }
    grid.appendChild(b);
  });
  scrollr.appendChild(grid);
  panel.appendChild(scrollr);

  // manage the shelf: take things down to free up space
  if(S.shelf.length>0){
    var mt=document.createElement('div'); mt.className='manage-title';
    mt.textContent='🧺 On your shelf'+(S.shelf.length>=SHELF_MAX?' (full! take one down)':'')+':';
    panel.appendChild(mt);
    var row=document.createElement('div'); row.className='manage-row';
    S.shelf.forEach(function(it){
      var chip=document.createElement('button'); chip.className='take-chip';
      var face = it.custom ? '<span class="tc-card" style="background:'+it.color+'">'+it.base+'</span>' : '<span class="tc-em">'+it.emoji+'</span>';
      chip.innerHTML=face+'<span class="tc-x">✕</span>';
      chip.title='Take down';
      chip.onclick=function(){ takeDown(it, chip); };
      row.appendChild(chip);
    });
    panel.appendChild(row);
  }

  var h=document.createElement('div'); h.className='sew-hint';
  h.textContent = S.shelf.length===0 ? '👆 Tap something to start making!' : '👋 A customer will wander by soon…';
  panel.appendChild(h);
}

// take an item off the shelf to free a slot (she made it, so no coins back)
function takeDown(it, chip){
  var idx=shelfIndexOf(it);
  if(idx<0) return;
  var node=shelfEl.querySelector('.shelf-item[data-idx="'+idx+'"]');
  if(node){ node.classList.add('selling'); }
  S.shelf.splice(idx,1); save();
  sfxPoof();
  if(chip){ chip.style.transition='transform .15s,opacity .15s'; chip.style.transform='scale(0)'; chip.style.opacity='0'; }
  setTimeout(function(){ renderShelf(); if(!busy) renderSew(); },200);
  toast('Took down the '+(it.custom?it.name:it.name)+' — slot free! 🧵');
}

var sewing=false;
function sew(it,btn){
  if(sewing) return;
  if(S.shelf.length>=SHELF_MAX){ toast('Shelf is full — sell something first! 🧺'); sfxBlip(); return; }
  sewing=true;
  keeper.classList.add('sewing'); machine.classList.add('go');
  // stitch ticks
  var ticks=0, iv=setInterval(function(){ sfxStitch(); if(++ticks>=4) clearInterval(iv); },180);
  // little "stitching" hint on the button
  btn.style.opacity='.5';
  setTimeout(function(){
    keeper.classList.remove('sewing'); machine.classList.remove('go');
    S.shelf.push({key:it.key,emoji:it.emoji,name:it.name,price:it.price,uid:++uidc});
    save(); renderShelf(); sfxBlip();
    sewing=false;
    renderSew();
  },820);
}

// ════════ DESIGN STUDIO (make your own!) ════════
var curBase=null, curColor=null, curStickers=[];
var STK_SLOTS=[
  {top:'8%',left:'8%'}, {top:'8%',right:'8%'},
  {bottom:'10%',left:'9%'}, {bottom:'10%',right:'9%'},
  {top:'4%',left:'50%',transform:'translateX(-50%)'}
];
var designBuilt=false;

function buildDesignPickers(){
  if(designBuilt) return; designBuilt=true;
  var bWrap=$('ds-bases');
  DESIGN_BASES.forEach(function(b){
    var el=document.createElement('button'); el.className='pick'; el.textContent=b.emoji;
    el.onclick=function(){ curBase=b; markSel(bWrap,el); drawDesign(); };
    bWrap.appendChild(el);
  });
  var cWrap=$('ds-colors');
  FABRICS.forEach(function(f){
    var el=document.createElement('button'); el.className='swatch'; el.style.background=f.css;
    el.title=f.name;
    el.onclick=function(){ curColor=f; markSel(cWrap,el); drawDesign(); };
    cWrap.appendChild(el);
  });
  var sWrap=$('ds-stickers');
  STICKERS.forEach(function(s){
    var el=document.createElement('button'); el.className='pick'; el.textContent=s;
    el.onclick=function(){ toggleSticker(s,el); };
    sWrap.appendChild(el);
  });
}
function markSel(wrap,el){ Array.prototype.forEach.call(wrap.children,function(x){x.classList.remove('sel');}); el.classList.add('sel'); }
function toggleSticker(s,el){
  var i=curStickers.indexOf(s);
  if(i>=0){ curStickers.splice(i,1); el.classList.remove('sel'); }
  else { if(curStickers.length>=5){ toast('Up to 5 stickers! ✨'); return; } curStickers.push(s); el.classList.add('sel'); }
  sfxBlip(); drawDesign();
}
function drawDesign(){
  var stage=$('design-stage');
  stage.style.background=curColor?curColor.css:'#ff6eb4';
  // clear placed stickers
  Array.prototype.slice.call(stage.querySelectorAll('.ds-stk')).forEach(function(x){x.remove();});
  $('ds-base').textContent=curBase?curBase.emoji:'👗';
  curStickers.forEach(function(s,i){
    var slot=STK_SLOTS[i%STK_SLOTS.length];
    var el=document.createElement('span'); el.className='ds-stk'; el.textContent=s;
    if(slot.top)el.style.top=slot.top; if(slot.bottom)el.style.bottom=slot.bottom;
    if(slot.left)el.style.left=slot.left; if(slot.right)el.style.right=slot.right;
    if(slot.transform)el.style.transform=slot.transform;
    el.onclick=function(){ var idx=curStickers.indexOf(s); if(idx>=0)curStickers.splice(idx,1);
      // also clear its tray selection
      var tray=$('ds-stickers'); Array.prototype.forEach.call(tray.children,function(x){ if(x.textContent===s)x.classList.remove('sel'); });
      sfxBlip(); drawDesign(); };
    stage.appendChild(el);
  });
  var price=(curBase?curBase.base:6)+curStickers.length*2;
  $('ds-price').textContent='Sells for 🪙'+price;
}
function openDesign(){
  buildDesignPickers();
  curBase=DESIGN_BASES[0]; curColor=FABRICS[0]; curStickers=[];
  markSel($('ds-bases'), $('ds-bases').children[0]);
  markSel($('ds-colors'), $('ds-colors').children[0]);
  Array.prototype.forEach.call($('ds-stickers').children,function(x){x.classList.remove('sel');});
  $('design-name').value='';
  drawDesign();
  paused=true; clearTimeout(spawnT);
  $('ov-design').classList.remove('hidden');
  $('ov-design').scrollTop=0;
}
function closeDesign(){
  $('ov-design').classList.add('hidden');
  paused=false;
  scheduleSpawn(1400);
}
function makeDesign(){
  if(S.shelf.length>=SHELF_MAX){ toast('Shelf is full — sell something first! 🧺'); sfxBlip(); return; }
  var price=(curBase?curBase.base:6)+curStickers.length*2;
  var nm=$('design-name').value.trim();
  if(!nm) nm=rnd(DESIGN_WORDS)+' '+(curBase?curBase.name:'thing');
  S.shelf.push({
    custom:true, base:curBase.emoji, name:nm, color:curColor.css,
    stickers:curStickers.slice(), emoji:curBase.emoji, price:price, uid:++uidc
  });
  save();
  $('ov-design').classList.add('hidden'); paused=false;
  renderShelf(); renderSew();
  toast('🎨 You made "'+nm+'"!'); sfxMake(); confetti(16);
  scheduleSpawn(1600);
}

// ════════ CUSTOMER SPAWNING ════════
function scheduleSpawn(delay){
  clearTimeout(spawnT);
  if(delay==null){
    var factor = 1.7 - (S.rep/100)*1.1;          // happy town → faster; grumpy → slower
    var base = (1500 + Math.random()*1600) * factor;
    if(rushLeft>0) base *= 0.4;                   // rush hour
    if(buzz>0)     base *= 0.6;                   // word-of-mouth
    delay = base;
  }
  spawnT=setTimeout(spawn, delay);
}

function makeCustomer(cfg){
  var c=cfg||rnd(CUSTOMERS);
  var el=document.createElement('div'); el.className='cust';
  el.innerHTML='<div class="bubble"></div><span class="gift">🎁</span>'+
               '<div class="cust-fig">'+c.emoji+'</div><div class="cust-shadow"></div>';
  el.style.left='108%';
  scene.appendChild(el);
  el._c=c;
  return el;
}

function showBubble(el,text,cls){
  var b=el.querySelector('.bubble');
  b.className='bubble'+(cls?(' '+cls):'');
  b.textContent=text;
  // force reflow then animate in
  void b.offsetWidth;
  b.classList.add('show');
}
function hideBubble(el){ var b=el.querySelector('.bubble'); if(b) b.classList.remove('show'); }

function spawn(){
  if(paused){ scheduleSpawn(700); return; }
  if(busy) { scheduleSpawn(800); return; }

  // PROTEST MODE: mostly picketers; a few brave shoppers still stop
  if(protesting && Math.random()<0.62){ spawnProtester(); return; }

  var lure=lured; lured=false;                 // consume a pending call-out
  var referred=(buzz>0);                        // word-of-mouth customer
  var haveItems=S.shelf.length>0;
  var vip = haveItems && !referred && Math.random()<0.12;   // rare fancy double-payer

  var passProb = 0.30 + (1 - S.rep/100)*0.45;   // grumpy town → more walk past
  var passes = !lure && !referred && !vip && (Math.random() < passProb);
  if(!haveItems && Math.random()<0.5) passes=false;        // nudge an empty shelf

  var el=makeCustomer(vip ? rnd(VIPS) : null);
  current=el;
  if(vip){ el._vip=true; }
  if(referred && !vip){ el._ref=true; buzz--; }

  if(passes){
    el.style.setProperty('--walk','5.4s');
    setTimeout(function(){ el.style.left='-28%'; },50);
    setTimeout(function(){ showBubble(el,rnd(PASS_THOUGHTS),'think'); },700);
    setTimeout(function(){ if(el.parentNode) el.remove(); if(current===el) current=null; renderSew(); scheduleSpawn(); },5400);
    return;
  }

  // a stopper walks to the counter (lured ones hurry in)
  busy=true;
  if(rushLeft>0) rushLeft--;
  el.style.setProperty('--walk', lure?'1.5s':'2.4s');
  setTimeout(function(){ el.style.left='38%'; },50);
  setTimeout(function(){
    if(!el.parentNode) return;
    el.classList.add('stopped');
    if(el._vip){ el.classList.add('vip'); sfxFanfare(); }
    else sfxDoor();
    startTalk(el);
  }, lure?1550:2450);
}

// picketers march past with angry signs when the town is upset
function spawnProtester(){
  var faces=['😠','😤','🙅','😾'];
  var el=document.createElement('div'); el.className='cust protester';
  el.innerHTML='<div class="bubble mean"></div><div class="psign">'+rnd(PROTEST_SIGNS)+'</div>'+
               '<div class="cust-fig">'+rnd(faces)+'</div><div class="cust-shadow"></div>';
  el.style.left='108%'; scene.appendChild(el);
  el.style.setProperty('--walk','5.0s');
  setTimeout(function(){ el.style.left='-28%'; },50);
  setTimeout(function(){ showBubble(el,rnd(PROTEST_CHANTS),'mean'); sfxProtest(); },600);
  setTimeout(function(){ if(el.parentNode) el.remove(); scheduleSpawn(); },5000);
}
function startProtest(){
  if(protesting) return; protesting=true;
  scene.classList.add('protest');
  var b=$('protest-banner'); if(b) b.classList.add('show');
  toast('😤 Uh oh — the town is PROTESTING! Be kind to win them back!');
  sfxProtest();
}
function stopProtest(){
  if(!protesting) return; protesting=false;
  scene.classList.remove('protest');
  var b=$('protest-banner'); if(b) b.classList.remove('show');
  toast('😊 The town is happy again! Customers are back!');
  sfxHeart();
}

// 📣 Call Out — lure the next customer in fast
function callOut(){
  if(coolOff) return;
  if(busy){ toast('Finish with this customer first! 😊'); sfxBlip(); return; }
  if(protesting){ toast('Nobody’s listening — they’re protesting! 😬'); sfxBlip(); return; }
  lured=true; sfxYoohoo();
  toast('📣 “Come on in!”');
  clearTimeout(spawnT); scheduleSpawn(500);
  coolOff=true;
  var btn=$('btn-callout'); if(btn) btn.classList.add('cooling');
  setTimeout(function(){ coolOff=false; var b=$('btn-callout'); if(b) b.classList.remove('cooling'); },5000);
}

// ════════ TALK: build the encounter + reply buttons ════════
function startTalk(el){
  var haveItems=S.shelf.length>0;
  var canSell=S.coins>=3;
  var r=Math.random();
  var enc;

  if((el._vip||el._ref) && haveItems){ enc=encWant(el); }   // VIPs & referred friends come to BUY
  else if(!haveItems){
    if(canSell && r<0.18) enc=encSeller();
    else if(r<0.5) enc=encEmpty();
    else enc=encSpecial();
  } else {
    if(canSell && r<0.13) enc=encSeller();
    else if(r<0.18) enc=encSpecial();
    else if(r<0.27) enc=encFree();
    else enc=encWant(el);
  }

  // a trickster seller swaps in their own shady face
  if(enc.seller){
    el.querySelector('.cust-fig').textContent=enc.seller.emoji;
    el._c={name:'A traveling seller'};
  }

  showBubble(el, enc.say, enc.bubbleClass);
  renderReplies(el, enc);
  sfxPop();
}

function encWant(el){
  var it=rnd(S.shelf);
  var vip = el && el._vip, ref = el && el._ref;
  var price = vip ? it.price*2 : it.price;
  var label = it.custom ? (it.base+' '+it.name) : itemLabel(it);
  var pool = vip ? VIP_WANT_LINES : (ref ? REFERRAL_LINES : (it.custom ? CUSTOM_WANT_LINES : WANT_LINES));
  var say=rnd(pool).replace('{item}', label);
  var opts=[ { text:"Sure! That's 🪙"+price+" 😊", cls:'sell', kind:'sell' } ];
  if(vip) opts.push({ text:"Double?! Yes please! 🪙"+price+" 💎", cls:'sell', kind:'sell' });
  else opts.push({ text:"For YOU… 🪙"+(price+3)+"! 😏", cls:'sell', kind:'sellhigh' });
  opts.push({ text:(vip?"No! Out, fancy pants! 😤":"No! Get out of my shop! 😤"), cls:'mean', kind:'mean' });
  return { ctx:{item:it, price:price, vip:vip}, say:say, options:opts };
}

function encSeller(){
  var sp=rnd(SELLERS);
  var afford = S.coins>=sp.cost;
  var room = S.shelf.length<SHELF_MAX;
  return { seller:sp, ctx:{seller:sp}, say:sp.say, options:[
    { text:"Okay! Here's 🪙"+sp.cost+" 🤝", cls:'sell', kind:'buy', disabled:(!afford||!room),
      note:(!afford?"(need 🪙"+sp.cost+")":(!room?"(shelf full)":"")) },
    { text:"No thank you! 🙅", cls:'kind', kind:'refuse' },
    { text:"That's a SCAM! Out! 😤", cls:'mean', kind:'mean' },
  ]};
}
function encFree(){
  var it=rnd(S.shelf);
  return { ctx:{item:it}, say:"Can I have the "+itemLabel(it)+" for FREE? Pretty please? 🥺", options:[
    { text:"No way — 🪙"+it.price+" please! 🪙", cls:'sell', kind:'sell' },
    { text:"…okay, just this once 🥹", cls:'kind', kind:'gift', reply:"You're the BEST! 💖" },
    { text:"Get out of my shop! 😤", cls:'mean', kind:'mean' },
  ]};
}
function encEmpty(){
  return { ctx:{}, say:rnd(EMPTY_WANTS), options:[
    { text:"Sure! Gimme a sec 🧵", cls:'kind', kind:'thanks', reply:"Yay! I'll wait! 😊" },
    { text:"No! Get out of my shop! 😤", cls:'mean', kind:'mean' },
  ]};
}
function encSpecial(){
  var pool=SPECIALS.filter(function(s){return s.id!=='free';});
  var sp=rnd(pool);
  return { ctx:{special:sp.id}, say:sp.say, options:sp.options.map(function(o){
    return { text:o.text, kind:o.kind, reply:o.reply,
             cls:(o.kind==='mean'?'mean':(o.kind==='kind'?'kind':'sell')) };
  })};
}

function renderReplies(el, enc){
  panel.innerHTML='';
  var t=document.createElement('div'); t.className='panel-title';
  t.innerHTML='💬 '+(el._c?el._c.name:'')+' is talking — what do you say?';
  panel.appendChild(t);
  var wrap=document.createElement('div'); wrap.className='replies';
  enc.options.forEach(function(o){
    var b=document.createElement('button'); b.className='reply-btn '+(o.cls||'');
    var note = o.note ? ' <span style="opacity:.55;font-size:.8em">'+o.note+'</span>' : '';
    b.innerHTML='<span class="you-tag">You</span>'+o.text+note;
    if(o.disabled){ b.disabled=true; b.style.opacity='.45'; }
    b.onclick=function(){ if(b.disabled) return;
      Array.prototype.forEach.call(wrap.children,function(x){x.disabled=true;x.style.opacity='.55';});
      b.style.opacity='1';
      resolve(el, enc, o);
    };
    wrap.appendChild(b);
  });
  panel.appendChild(wrap);
}
function reenableReplies(){
  var w=panel.querySelector('.replies');
  if(w) Array.prototype.forEach.call(w.children,function(x){ if(!x.dataset.lock){ x.disabled=false; x.style.opacity='1'; } });
}

// ════════ RESOLVE a choice ════════
function resolve(el, enc, opt){
  var price = (enc.ctx && enc.ctx.price!=null) ? enc.ctx.price : (enc.ctx.item?enc.ctx.item.price:0);
  var vip = enc.ctx && enc.ctx.vip;
  switch(opt.kind){
    case 'sell':     sellItem(el, enc.ctx.item, price, rnd(vip?VIP_BUY_LINES:BUY_LINES), vip); break;
    case 'sellhigh':
      if(Math.random()<0.72){ sellItem(el, enc.ctx.item, price+3, "Worth every coin! 🤑", vip); }
      else { showBubble(el,"Too pricey! Hmph! 😤",'mean'); applyRep(-3); sfxShoo(); leave(el,true); endTalk(); }
      break;
    case 'gift':     giftItem(el, enc.ctx.item, opt.reply||"Thank you! 💖"); break;
    case 'mean':     shoo(el); break;
    case 'kind':     kindLeave(el, opt.reply||"Thank you! 🙏"); break;
    case 'thanks':   friendly(el, opt.reply||"Thanks! 👋"); break;
    case 'buy':      buyFromSeller(el, enc.ctx.seller); break;
    case 'refuse':   friendly(el, rnd(SELLER_REFUSE)); break;
    default:         friendly(el, opt.reply||"Bye! 👋");
  }
}

// Maya buys an item from a trickster seller
function buyFromSeller(el, sp){
  if(S.coins<sp.cost){ toast('Not enough coins! 🪙'); sfxBlip(); reenableReplies(); return; }
  if(S.shelf.length>=SHELF_MAX){ toast('Shelf is full! 🧺'); sfxBlip(); reenableReplies(); return; }
  spendCoins(sp.cost);
  S.shelf.push({ key:'bought', emoji:sp.item.emoji, name:sp.item.name, price:sp.value, uid:++uidc });
  save(); renderShelf();
  var bargain = sp.value>=sp.cost;
  showBubble(el, bargain?rnd(SELLER_GOODBUY):rnd(SELLER_RIPOFF), bargain?'':'mean');
  if(bargain){ applyRep(1); sfxBuy(); var p=custPoint(el); burstAt(p.x,p.y,'✨',3); toast('Smart! It sells for 🪙'+sp.value+' — profit! 💰'); }
  else { applyRep(-1); sfxRipoff(); toast('Uh oh — a rip-off! It only sells for 🪙'+sp.value+'!'); }
  el.classList.remove('stopped');
  leave(el,false,1100);
  endTalk();
}

function custPoint(el){
  var r=el.getBoundingClientRect();
  return { x:r.left+r.width/2, y:r.top+r.height*0.25 };
}

function shelfIndexOf(it){
  var i=S.shelf.indexOf(it);
  if(i>=0) return i;
  if(it&&it.uid!=null){ for(var j=0;j<S.shelf.length;j++){ if(S.shelf[j].uid===it.uid) return j; } }
  for(var k=0;k<S.shelf.length;k++){ if(S.shelf[k].key===it.key) return k; }
  return -1;
}

function sellItem(el, it, price, line, vip){
  var idx=shelfIndexOf(it);
  if(idx>=0){
    var node=shelfEl.querySelector('.shelf-item[data-idx="'+idx+'"]');
    if(node) node.classList.add('selling');
    S.shelf.splice(idx,1);
    setTimeout(function(){ renderShelf(); },480);
  }
  applyRep(vip?5:3); addCoins(price);
  showBubble(el, line, '');
  el.classList.add('has-gift');
  sfxCoin();
  var p=custPoint(el); burstAt(p.x,p.y,'🪙',Math.min(8,Math.max(3,Math.round(price/2))));
  confetti(vip?22:12);
  bumpChip('coins');
  el.classList.add('happy');
  leave(el,false,900);
  endTalk();
}

function giftItem(el, it, line){
  var idx=shelfIndexOf(it);
  if(idx>=0){
    var node=shelfEl.querySelector('.shelf-item[data-idx="'+idx+'"]');
    if(node) node.classList.add('selling');
    S.shelf.splice(idx,1);
    setTimeout(function(){ renderShelf(); },480);
  }
  applyRep(6);
  buzz+=2;                                   // word of mouth! friends will come
  showBubble(el, line, '');
  el.classList.add('has-gift','happy');
  sfxHeart();
  var p=custPoint(el); burstAt(p.x,p.y,'💕',5);
  setTimeout(function(){ toast('🎁 Word of mouth! Their friends are coming!'); },900);
  leave(el,false,900);
  endTalk();
}

function shoo(el){
  showBubble(el, rnd(SHOO_LINES), 'mean');
  applyRep(-10);
  sfxShoo();
  el.classList.remove('stopped');
  leave(el,true);
  endTalk();
}

function kindLeave(el, line){
  // bathroom-style: thank you, then they come back and buy if there's stock
  applyRep(5);
  showBubble(el, line, '');
  sfxHeart();
  var p=custPoint(el); burstAt(p.x,p.y,'💕',3);
  if(S.shelf.length>0){
    setTimeout(function(){
      if(!el.parentNode) return;
      var it=rnd(S.shelf);
      showBubble(el, "Now I'll take this "+it.emoji+"! 🪙", '');
      sellItemQuiet(el, it, it.price);
    },1500);
    setTimeout(function(){ el.classList.add('happy'); leave(el,false); },3000);
  } else {
    el.classList.add('happy');
    leave(el,false,1500);
  }
  endTalk();
}

// a sale with no extra bubble (used inside kindLeave)
function sellItemQuiet(el, it, price){
  var idx=shelfIndexOf(it);
  if(idx>=0){
    var node=shelfEl.querySelector('.shelf-item[data-idx="'+idx+'"]');
    if(node) node.classList.add('selling');
    S.shelf.splice(idx,1);
    setTimeout(function(){ renderShelf(); },480);
  }
  addCoins(price);
  applyRep(2);
  el.classList.add('has-gift');
  sfxCoin(); bumpChip('coins');
  var p=custPoint(el); burstAt(p.x,p.y,'🪙',3);
  confetti(8);
}

function friendly(el, line){
  applyRep(2);
  showBubble(el, line, '');
  sfxBlip();
  el.classList.add('happy');
  leave(el,false,1300);
  endTalk();
}

// ════════ LEAVE + cleanup ════════
function leave(el, fast, delay){
  setTimeout(function(){
    if(!el.parentNode) return;
    hideBubble(el);
    el.classList.remove('stopped','happy');
    el.classList.add('leaving');
    el.style.setProperty('--walk', fast?'1.5s':'2.6s');
    el.style.left='-28%';
    setTimeout(function(){ if(el.parentNode) el.remove(); if(current===el) current=null; },fast?1500:2600);
  }, delay||1200);
}

// reopen sewing + queue next customer
function endTalk(){
  busy=false;
  setTimeout(function(){ renderSew(); }, 700);
  // a happy town sometimes triggers a RUSH of eager shoppers
  if(!rushLeft && !protesting && S.rep>72 && Math.random()<0.16){
    rushLeft = 2+Math.floor(Math.random()*2);
    setTimeout(function(){ toast('🎉 Rush hour! Everyone wants in!'); },600);
  }
  if(buzz>0 || rushLeft>0) scheduleSpawn();        // hurry them in
  else scheduleSpawn(3200+Math.random()*2200);     // comfy window to sew & restock
}

function bumpChip(which){
  var el=document.querySelector('.chip.'+which);
  if(!el) return; el.style.transition='transform .15s';
  el.style.transform='scale(1.18)';
  setTimeout(function(){ el.style.transform='scale(1)'; },170);
}

function checkMilestone(){
  var marks=[25,50,100,200,400];
  for(var i=0;i<marks.length;i++){
    if(S.coins>=marks[i] && lastMilestone<marks[i]){
      lastMilestone=marks[i];
      var msgs={25:'🎉 25 coins! Word is spreading!',50:'⭐ 50 coins! Your shop is popular!',100:'🌈 100 coins! Famous in town!',200:'👑 200 coins! Best shop ever!',400:'🏆 400 coins! A sewing legend!'};
      toast(msgs[marks[i]]||('🎉 '+marks[i]+' coins!')); confetti(26);
    }
  }
}

// ════════ TITLE / SETUP ════════
(function setup(){
  var grid=$('avatar-grid');
  KEEPERS.forEach(function(em){
    var b=document.createElement('div'); b.className='av'+(em===S.avatar?' sel':'');
    b.textContent=em;
    b.onclick=function(){ S.avatar=em; Array.prototype.forEach.call(grid.children,function(x){x.classList.remove('sel');}); b.classList.add('sel'); };
    grid.appendChild(b);
  });
  if(S.name) $('name-in').value=S.name;
  $('btn-open').onclick=function(){
    var n=$('name-in').value.trim();
    S.name = n || 'Maya';
    save();
    kFig.textContent=S.avatar;
    $('ov-title').classList.add('hidden');
    startGame();
  };
})();

function startGame(){
  if(window.mayaGameStart)window.mayaGameStart();
  setTop(); updateMood(); updateGoal(); renderShelf(); renderSew();
  lastMilestone = S.coins;
  dayShown=false;
  if(S.rep<15) startProtest();
  startMusic();
  scheduleSpawn(1400);
}

// ════════ TOP BAR BUTTONS ════════
$('btn-mute').onclick=function(){
  S.muted=!S.muted; save();
  $('btn-mute').textContent=S.muted?'🔇':'🔊';
  if(S.muted){ stopMusic(); }
  else { ac(); sfxBlip(); startMusic(); }
};
$('btn-mute').textContent=S.muted?'🔇':'🔊';

$('btn-leave').onclick=function(){
  stopMusic();
  if(window.MayaPortal) window.MayaPortal.leaveToLab();
  else history.back();
};

// design studio + day buttons
$('ds-cancel').onclick=closeDesign;
$('ds-make').onclick=makeDesign;
$('day-next').onclick=nextDay;
$('btn-endday').onclick=endDay;
$('btn-callout').onclick=callOut;

// resume audio on first touch (mobile) + kick off music
document.addEventListener('pointerdown',function once(){ ac(); if(!S.muted && !musicOn) startMusic(); document.removeEventListener('pointerdown',once); });

})();
