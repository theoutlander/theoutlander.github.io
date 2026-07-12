/* ===== Build On — data: pieces, daily crates, save, sound ===== */
(function(){
  var BO = window.BO = window.BO || {};

  /* ---- palette colours (match Maya's Game Lab) ---- */
  var C = {
    pink:'#ff6eb4', yellow:'#ffe14d', green:'#5dffb0', blue:'#5bc8ff',
    purple:'#c77dff', orange:'#ff9a3c', white:'#f2e9ff', wood:'#b07a42',
    stone:'#9aa6b4', roof:'#e0574a', glass:'#bfe6ff',
    leaf:'#4fbf5a', trunk:'#8a5a2b', stem:'#3fae52'
  };
  BO.C = C;
  var RAINBOW = [C.pink,C.yellow,C.green,C.blue,C.purple,C.orange];
  BO.RAINBOW_COLORS = RAINBOW;

  /* ---- categories (tab order) ---- */
  var CATEGORIES = [
    {id:'blocks',  name:'Blocks',  emoji:'🧱'},
    {id:'shapes',  name:'Shapes',  emoji:'🔺'},
    {id:'nature',  name:'Nature',  emoji:'🌳'},
    {id:'town',    name:'Town',    emoji:'🏘️'},
    {id:'build',   name:'Builds',  emoji:'🏗️'},
    {id:'friends', name:'Friends', emoji:'🐰'},
    {id:'fun',     name:'Fun',     emoji:'🎉'}
  ];
  BO.CATEGORIES = CATEGORIES;

  /* ---- piece catalog (array order = palette order within a category) ---- */
  var PIECES = [
    /* blocks */
    {id:'pink',    name:'Pink Block',    cat:'blocks',  kind:'cube',    color:C.pink},
    {id:'yellow',  name:'Yellow Block',  cat:'blocks',  kind:'cube',    color:C.yellow},
    {id:'green',   name:'Green Block',   cat:'blocks',  kind:'cube',    color:C.green},
    {id:'blue',    name:'Blue Block',    cat:'blocks',  kind:'cube',    color:C.blue},
    {id:'purple',  name:'Purple Block',  cat:'blocks',  kind:'cube',    color:C.purple},
    {id:'orange',  name:'Orange Block',  cat:'blocks',  kind:'cube',    color:C.orange},
    {id:'white',   name:'White Block',   cat:'blocks',  kind:'cube',    color:C.white},
    {id:'wood',    name:'Wood Block',    cat:'blocks',  kind:'cube',    color:C.wood},
    {id:'stone',   name:'Stone Block',   cat:'blocks',  kind:'cube',    color:C.stone},
    {id:'glass',   name:'Glass Block',   cat:'blocks',  kind:'glass',   color:C.glass},
    {id:'rainbow', name:'Rainbow Block', cat:'blocks',  kind:'rainbow'},
    /* shapes & house */
    {id:'roof',    name:'Roof',          cat:'shapes',  kind:'roof',    color:C.roof,  emoji:'🔺'},
    {id:'door',    name:'Door',          cat:'shapes',  kind:'facetex', tex:'door',    emoji:'🚪'},
    {id:'window',  name:'Window',        cat:'shapes',  kind:'facetex', tex:'window',  emoji:'🪟'},
    {id:'stairs',  name:'Stairs',        cat:'shapes',  kind:'stairs',  color:C.wood},
    {id:'slab',    name:'Slab',          cat:'shapes',  kind:'slab',    color:C.stone},
    {id:'pillar',  name:'Pillar',        cat:'shapes',  kind:'pillar',  color:C.white},
    {id:'fence',   name:'Fence',         cat:'shapes',  kind:'fence',   color:C.wood},
    {id:'ball',    name:'Bouncy Ball',   cat:'shapes',  kind:'ball',    emoji:'⚪', rand:true},
    {id:'star',    name:'Star Gem',      cat:'shapes',  kind:'star',    emoji:'⭐'},
    {id:'cloud',   name:'Cloud',         cat:'shapes',  kind:'cloud',   emoji:'☁️'},
    /* nature */
    {id:'pot',     name:'Plant Pot',     cat:'nature',  kind:'pot',     emoji:'🪴'},
    {id:'tree',    name:'Tree',          cat:'nature',  kind:'tree',    emoji:'🌳'},
    {id:'flower',  name:'Flower',        cat:'nature',  kind:'flower',  emoji:'🌸', rand:true},
    {id:'bush',    name:'Bush',          cat:'nature',  kind:'bush',    emoji:'🌿'},
    {id:'mushroom',name:'Mushroom',      cat:'nature',  kind:'mushroom',emoji:'🍄'},
    {id:'pine',    name:'Pine Tree',     cat:'nature',  kind:'pine',    emoji:'🌲'},
    {id:'rock',    name:'Rock',          cat:'nature',  kind:'rock',    emoji:'🪨'},
    /* town — realistic world items */
    {id:'bench',   name:'Bench',         cat:'town',    kind:'bench',   emoji:'🪑'},
    {id:'table',   name:'Cafe Table',    cat:'town',    kind:'table',   emoji:'☕'},
    {id:'streetlamp',name:'Street Lamp',  cat:'town',    kind:'streetlamp',emoji:'🏰'},
    {id:'car',     name:'Car',           cat:'town',    kind:'car',     color:C.pink, emoji:'🚗', rand:true},
    {id:'well',    name:'Wishing Well',  cat:'town',    kind:'well',    emoji:'🪣'},
    {id:'stall',   name:'Market Stall',  cat:'town',    kind:'stall',   emoji:'🏪'},
    /* builds — big walk-in structures */
    {id:'cottage', name:'Cottage',       cat:'build',   kind:'cottage', struct:true, foot:5, tall:2.7, emoji:'🏠'},
    {id:'store',   name:'Shop',          cat:'build',   kind:'store',   struct:true, foot:5, tall:2.7, color:C.yellow, emoji:'🏬'},
    {id:'tower',   name:'Tower',         cat:'build',   kind:'tower',   struct:true, foot:3, tall:4.4, emoji:'🏰'},
    /* friends (billboard characters) */
    {id:'bunny',   name:'Bunny',         cat:'friends', kind:'friend',  char:'🐰', emoji:'🐰'},
    {id:'cat',     name:'Kitty',         cat:'friends', kind:'friend',  char:'🐱', emoji:'🐱'},
    {id:'puppy',   name:'Puppy',         cat:'friends', kind:'friend',  char:'🐶', emoji:'🐶'},
    {id:'bird',    name:'Birdie',        cat:'friends', kind:'friend',  char:'🐦', emoji:'🐦'},
    {id:'butterfly',name:'Butterfly',    cat:'friends', kind:'friend',  char:'🦋', emoji:'🦋'},
    {id:'frog',    name:'Froggy',        cat:'friends', kind:'friend',  char:'🐸', emoji:'🐸'},
    {id:'unicorn', name:'Unicorn',       cat:'friends', kind:'friend',  char:'🦄', emoji:'🦄'},
    {id:'bear',    name:'Teddy',         cat:'friends', kind:'friend',  char:'🐻', emoji:'🐻'},
    /* fun */
    {id:'balloon', name:'Balloon',       cat:'fun',     kind:'balloon', color:C.pink, emoji:'🎈', rand:true},
    {id:'lamp',    name:'Lamp',          cat:'fun',     kind:'lamp',    emoji:'💡'},
    {id:'water',   name:'Pond',          cat:'fun',     kind:'water',   emoji:'💧'},
    {id:'fountain',name:'Fountain',      cat:'fun',     kind:'fountain',emoji:'⛲'},
    {id:'campfire',name:'Campfire',      cat:'fun',     kind:'campfire',emoji:'🔥'},
    {id:'lollipop',name:'Lollipop',      cat:'fun',     kind:'lollipop',emoji:'🍭'},
    {id:'present', name:'Present',        cat:'fun',     kind:'present', color:C.pink, emoji:'🎁'},
    {id:'rocket',  name:'Rocket',        cat:'fun',     kind:'rocket',  color:C.white, emoji:'🚀'}
  ];
  BO.PIECES = PIECES;
  var BY = {}; PIECES.forEach(function(p){ BY[p.id]=p; });
  BO.piece = function(id){ return BY[id]; };
  BO.piecesInCat = function(cat){ return PIECES.filter(function(p){ return p.cat===cat; }); };

  /* ---- seeds you can grow in a Plant Pot (tap pot -> pick -> water x3 -> bloom) ---- */
  var SEEDS = [
    {id:'sunflower', emoji:'🌻', name:'Sunflower'},
    {id:'tulip',     emoji:'🌷', name:'Tulip'},
    {id:'rose',      emoji:'🌹', name:'Rose'},
    {id:'blossom',   emoji:'🌸', name:'Blossom'},
    {id:'strawberry',emoji:'🍓', name:'Strawberry'},
    {id:'tomato',    emoji:'🍅', name:'Tomato'},
    {id:'pumpkin',   emoji:'🎃', name:'Pumpkin'},
    {id:'cactus',    emoji:'🌵', name:'Cactus'}
  ];
  BO.SEEDS = SEEDS;

  /* ---- daily crate themes ---- */
  var STARTER = {pink:6,yellow:6,green:6,blue:6,purple:6,orange:6,white:6,wood:10,stone:8,
                 glass:4,rainbow:3,roof:6,door:3,window:4,stairs:12,slab:10,pillar:6,fence:12,ball:4,star:4,cloud:3,
                 tree:4,flower:5,bush:3,mushroom:3,pot:4,
                 bunny:2,cat:2,puppy:2,bird:2,butterfly:3,unicorn:1,
                 balloon:4,lamp:3,water:8,present:2,lollipop:2,fountain:2,campfire:2,rocket:1,
                 pine:4,rock:5,bench:3,table:2,streetlamp:3,car:2,well:1,stall:1,cottage:2,store:1,tower:1};
  var THEMES = [
    {id:'rainbow', name:'Rainbow Day', emoji:'🌈', pieces:['pink','yellow','green','blue','purple','orange','rainbow']},
    {id:'nature',  name:'Nature Day',  emoji:'🌳', pieces:['pot','green','wood','tree','flower','bush','mushroom']},
    {id:'garden',  name:'Garden Day',  emoji:'🪴', pieces:['pot','flower','tree','bush','green','mushroom','wood']},
    {id:'house',   name:'House Day',   emoji:'🏠', pieces:['wood','white','stone','roof','glass','door','window','stairs','fence']},
    {id:'sky',     name:'Sky Day',     emoji:'⭐', pieces:['blue','white','cloud','star','rainbow','unicorn']},
    {id:'candy',   name:'Candy Day',   emoji:'🍭', pieces:['pink','purple','ball','white','star']},
    {id:'friends', name:'Friends Day', emoji:'🐾', pieces:['bunny','cat','puppy','bird','butterfly','tree','flower']},
    {id:'party',   name:'Party Day',   emoji:'🎉', pieces:['balloon','present','lamp','lollipop','rainbow','star']}
  ];
  BO.THEMES = THEMES;

  function hashStr(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
  function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  BO.todayKey = function(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); };

  BO.makeCrate = function(day, dateStr){
    if(day<=1){ return {themeId:'starter', name:'Starter Kit', emoji:'🎁', items:Object.assign({},STARTER)}; }
    var rnd=mulberry32(hashStr('buildon-'+dateStr));
    var theme=THEMES[Math.floor(rnd()*THEMES.length)];
    var items={};
    theme.pieces.forEach(function(pid){ items[pid]=5+Math.floor(rnd()*6); }); // 5..10 each
    var bonus=1+Math.floor(rnd()*2);                                          // 1-2 surprise pieces
    for(var i=0;i<bonus;i++){ var p=PIECES[Math.floor(rnd()*PIECES.length)]; items[p.id]=(items[p.id]||0)+(2+Math.floor(rnd()*3)); }
    return {themeId:theme.id, name:theme.name, emoji:theme.emoji, items:items};
  };

  /* ---- save / load (localStorage + in-memory fallback) ---- */
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

  var KEY='buildon_save_v1', mem=null;
  BO.load = function(){ try{ var s=MayaSave.get(KEY); if(s) return JSON.parse(s); }catch(e){} return mem; };
  BO.save = function(state){ mem=state; MayaSave.set(KEY, JSON.stringify(state)); };
  BO.wipe = function(){ mem=null; MayaSave.remove(KEY); };

  /* ================= SOUND (Web Audio) ================= */
  var ctx=null, master=null, musicBus=null, ambBus=null, muted=false, vol=0.62;
  muted = MayaSave.getPref('buildon_mute')==='1';
  var _sv=MayaSave.getPref('buildon_vol'); if(_sv!=null){ vol=parseFloat(_sv); if(isNaN(vol)) vol=0.62; }
  function ac(){ if(window.MayaIOSAudioUnlock) window.MayaIOSAudioUnlock.unlock(); if(ctx) return ctx; try{
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain(); master.gain.value=muted?0:vol; master.connect(ctx.destination);
      musicBus=ctx.createGain(); musicBus.gain.value=0.85; musicBus.connect(master);
      ambBus=ctx.createGain(); ambBus.gain.value=0.9; ambBus.connect(master);
    }catch(e){ctx=null;} return ctx; }
  function tone(freq,t0,dur,type,vol,slideTo){ var c=ac(); if(!c||muted) return; var o=c.createOscillator(),g=c.createGain(); o.type=type||'sine'; o.frequency.setValueAtTime(freq,c.currentTime+t0); if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo,c.currentTime+t0+dur); g.gain.setValueAtTime(0.0001,c.currentTime+t0); g.gain.exponentialRampToValueAtTime(vol||0.3,c.currentTime+t0+0.012); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t0+dur); o.connect(g); g.connect(master); o.start(c.currentTime+t0); o.stop(c.currentTime+t0+dur+0.02); }
  function noise(t0,dur,vol,lp){ var c=ac(); if(!c||muted) return; var n=Math.floor(dur*c.sampleRate),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0); for(var i=0;i<n;i++){ d[i]=(Math.random()*2-1)*(1-i/n); } var s=c.createBufferSource(); s.buffer=buf; var f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=lp||1400; var g=c.createGain(); g.gain.value=vol||0.16; s.connect(f); f.connect(g); g.connect(master); s.start(c.currentTime+t0); }

  BO.sfx = {
    click(){ tone(560,0,0.06,'triangle',0.14); },
    place(){ tone(150,0,0.09,'square',0.2,110); noise(0,0.09,0.12,900); tone(300,0.02,0.08,'sine',0.12); },
    pop(){ tone(520,0,0.12,'sine',0.18,180); noise(0,0.08,0.08,1200); },
    open(){ [660,880,1175,1568].forEach(function(f,i){ tone(f,i*0.06,0.2,'triangle',0.15); }); },
    star(){ [988,1319,1760].forEach(function(f,i){ tone(f,i*0.05,0.16,'triangle',0.12); }); },
    day(){ [523,659,784,1047,1319].forEach(function(f,i){ tone(f,i*0.11,0.42,'triangle',0.16); }); },
    plant(){ tone(330,0,0.11,'sine',0.16,470); noise(0,0.08,0.06,700); },
    water(){ tone(780,0,0.14,'sine',0.13,280); noise(0.02,0.16,0.05,520); },
    grow(){ tone(392,0,0.18,'triangle',0.14,660); },
    bloom(){ [523,659,784,1047].forEach(function(f,i){ tone(f,i*0.07,0.3,'triangle',0.14); }); tone(1568,0.28,0.42,'sine',0.1); },
    bonk(){ tone(180,0,0.08,'square',0.2,90); noise(0,0.07,0.14,1500); tone(540,0.03,0.09,'triangle',0.12,300); },
    bite(){ tone(150,0,0.05,'sawtooth',0.16,80); tone(90,0.045,0.09,'square',0.14); noise(0,0.05,0.1,700); },
    hurt(){ tone(420,0,0.13,'triangle',0.16,170); tone(210,0.02,0.12,'sine',0.1); },
    poofMob(){ [700,900,1200].forEach(function(f,i){ tone(f,i*0.05,0.14,'triangle',0.13); }); noise(0,0.12,0.09,1100); },
    monstersOn(){ [220,175,140].forEach(function(f,i){ tone(f,i*0.09,0.22,'sawtooth',0.12); }); },
    growl(){ tone(70,0,0.36,'sawtooth',0.13,46); tone(54,0.04,0.32,'square',0.09,40); noise(0,0.3,0.05,300); },
    monstersOff(){ [523,659,880].forEach(function(f,i){ tone(f,i*0.06,0.2,'triangle',0.12); }); },
    critter(){ tone(1046,0,0.07,'sine',0.09,1400); tone(1568,0.05,0.07,'sine',0.05); }
  };

  /* ---- background music: gentle, cheerful loop (audible but soft) ---- */
  var musicTimer=null, mbeat=0;
  var MEL=[523.25,587.33,659.25,784.00,880.00,1046.50];   // C D E G A C  (pentatonic, happy)
  var BASS=[130.81,164.81,174.61,196.00];                 // C E F G
  function mtone(freq,delay,dur,vol,type,bus){ var c=ac(); if(!c) return; var o=c.createOscillator(),g=c.createGain(); o.type=type||'sine'; o.frequency.value=freq; var t=c.currentTime+(delay||0); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.05); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(bus||musicBus); o.start(t); o.stop(t+dur+0.05); }
  function mstep(){ if(muted) return;
    if(mbeat%4===0){ var b=BASS[(mbeat/4)%BASS.length]; mtone(b,0,1.9,0.06,'sine'); mtone(b*2,0,1.9,0.035,'triangle'); }      // soft chord bed
    if(Math.random()<0.62){ mtone(MEL[(Math.random()*MEL.length)|0],0,0.6,0.085,'triangle'); }                             // melody
    if(mbeat%8===5 && Math.random()<0.5){ mtone(MEL[4+((Math.random()*2)|0)]*1.5,0,0.5,0.04,'sine'); }                     // sparkle
    mbeat++;
  }
  function startMusic(){ if(musicTimer||muted) return; if(!ac()) return; mbeat=0; mstep(); musicTimer=setInterval(mstep,540); }
  function stopMusic(){ if(musicTimer){ clearInterval(musicTimer); musicTimer=null; } }

  /* ---- environment ambience: birds / water / rain / crickets / space ---- */
  function noiseBuf(sec){ var c=ac(); var n=Math.floor(sec*c.sampleRate),buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0); for(var i=0;i<n;i++) d[i]=Math.random()*2-1; return buf; }
  function atone(freq,delay,dur,vol,type){ var c=ac(); if(!c||muted) return; var o=c.createOscillator(),g=c.createGain(); o.type=type||'sine'; o.frequency.value=freq; var t=c.currentTime+(delay||0); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(ambBus); o.start(t); o.stop(t+dur+0.03); }
  function noiseBed(type,freq,q,vol,lfoRate,lfoDepth){ var c=ac(); var src=c.createBufferSource(); src.buffer=noiseBuf(2.4); src.loop=true; var f=c.createBiquadFilter(); f.type=type; f.frequency.value=freq; if(q) f.Q.value=q; var g=c.createGain(); g.gain.value=vol; src.connect(f); f.connect(g); g.connect(ambBus); src.start(); var lfo=null; if(lfoRate){ lfo=c.createOscillator(); lfo.frequency.value=lfoRate; var lg=c.createGain(); lg.gain.value=lfoDepth; lfo.connect(lg); lg.connect(g.gain); lfo.start(); } return function(){ try{src.stop();}catch(e){} try{if(lfo)lfo.stop();}catch(e){} try{g.disconnect();}catch(e){} try{f.disconnect();}catch(e){} try{src.disconnect();}catch(e){} }; }
  function scheduler(fn,minMs,maxMs){ var id=null; function loop(){ if(!muted) fn(); id=setTimeout(loop, minMs+Math.random()*(maxMs-minMs)); } id=setTimeout(loop, 400+Math.random()*(maxMs-minMs)); return function(){ if(id) clearTimeout(id); }; }
  var BEDS={
    birds:function(){ return scheduler(function(){ var base=1900+Math.random()*1500, n=2+((Math.random()*3)|0); for(var i=0;i<n;i++) atone(base*(1-i*0.05)+(Math.random()*90-45), i*0.06, 0.07, 0.05, 'sine'); }, 1500, 4200); },
    crickets:function(){ return scheduler(function(){ var f=4200+Math.random()*500; for(var i=0;i<3;i++) atone(f, i*0.035, 0.02, 0.028, 'square'); }, 260, 640); },
    water:function(){ return noiseBed('lowpass',430,0,0.03,0.09,0.016); },
    rain:function(){ var a=noiseBed('lowpass',2600,0,0.04,0,0), b=noiseBed('lowpass',760,0,0.022,0.4,0.008); return function(){ a(); b(); }; },
    wind:function(){ return noiseBed('lowpass',360,0,0.028,0.07,0.016); },
    space:function(){ var d=noiseBed('lowpass',180,0,0.03,0.05,0.012), t=scheduler(function(){ atone(1200+Math.random()*900,0,0.5,0.025,'sine'); },1600,4200); return function(){ d(); t(); }; }
  };
  var ambState={env:'water',time:'day',weather:'sunny'}, ambStops=[];
  function stopAmb(){ ambStops.forEach(function(s){ try{s();}catch(e){} }); ambStops=[]; }
  function applyAmb(){ stopAmb(); if(muted||!ac()) return;
    var beds=[], rainy=ambState.weather==='rainy', space=ambState.env==='space', night=ambState.time==='night';
    if(rainy){ beds=['rain']; }
    else if(space){ beds=['space']; }
    else { if(ambState.env==='water') beds.push('water'); beds.push(night?'crickets':'birds'); }
    beds.forEach(function(k){ if(BEDS[k]) ambStops.push(BEDS[k]()); });
  }

  BO.audio = {
    resume(){ var c=ac(); if(c&&c.state==='suspended') c.resume(); if(!muted){ startMusic(); applyAmb(); } },
    isMuted(){ return muted; },
    getVolume(){ return vol; },
    setVolume(v){ vol=Math.max(0,Math.min(1,v)); MayaSave.setPref('buildon_vol', vol); if(v>0 && muted){ muted=false; try{ localStorage.setItem('buildon_mute','0'); }catch(e){} BO.audio.resume(); } if(master && !muted) master.gain.value=vol; return vol; },
    toggle(){ muted=!muted; MayaSave.setPref('buildon_mute', muted?'1':'0');
      if(master) master.gain.value = muted?0:vol;
      if(muted){ stopMusic(); stopAmb(); } else { BO.audio.resume(); BO.sfx.click(); }
      return muted; }
  };
  BO.ambience = {
    set:function(o){ o=o||{}; if(o.env)ambState.env=o.env; if(o.time)ambState.time=o.time; if(o.weather)ambState.weather=o.weather; applyAmb(); }
  };
})();
