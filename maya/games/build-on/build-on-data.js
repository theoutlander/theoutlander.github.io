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
    {id:'ball',    name:'Bouncy Ball',   cat:'shapes',  kind:'ball',    emoji:'⚪', rand:true},
    {id:'star',    name:'Star Gem',      cat:'shapes',  kind:'star',    emoji:'⭐'},
    {id:'cloud',   name:'Cloud',         cat:'shapes',  kind:'cloud',   emoji:'☁️'},
    /* nature */
    {id:'pot',     name:'Plant Pot',     cat:'nature',  kind:'pot',     emoji:'🪴'},
    {id:'tree',    name:'Tree',          cat:'nature',  kind:'tree',    emoji:'🌳'},
    {id:'flower',  name:'Flower',        cat:'nature',  kind:'flower',  emoji:'🌸', rand:true},
    {id:'bush',    name:'Bush',          cat:'nature',  kind:'bush',    emoji:'🌿'},
    {id:'mushroom',name:'Mushroom',      cat:'nature',  kind:'mushroom',emoji:'🍄'},
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
    {id:'campfire',name:'Campfire',      cat:'fun',     kind:'standee', char:'🔥', emoji:'🔥'},
    {id:'lollipop',name:'Lollipop',      cat:'fun',     kind:'standee', char:'🍭', emoji:'🍭'},
    {id:'present', name:'Present',        cat:'fun',     kind:'standee', char:'🎁', emoji:'🎁'},
    {id:'rocket',  name:'Rocket',        cat:'fun',     kind:'standee', char:'🚀', emoji:'🚀'},
    {id:'carousel',name:'Carousel',      cat:'fun',     kind:'standee', char:'🎠', emoji:'🎠'}
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
                 glass:4,rainbow:3,roof:6,door:3,window:4,ball:4,star:4,cloud:3,
                 tree:4,flower:5,bush:3,mushroom:3,pot:4,
                 bunny:2,cat:2,puppy:2,bird:2,butterfly:3,unicorn:1,
                 balloon:4,lamp:3,water:5,present:2,lollipop:2};
  var THEMES = [
    {id:'rainbow', name:'Rainbow Day', emoji:'🌈', pieces:['pink','yellow','green','blue','purple','orange','rainbow']},
    {id:'nature',  name:'Nature Day',  emoji:'🌳', pieces:['pot','green','wood','tree','flower','bush','mushroom']},
    {id:'garden',  name:'Garden Day',  emoji:'🪴', pieces:['pot','flower','tree','bush','green','mushroom','wood']},
    {id:'house',   name:'House Day',   emoji:'🏠', pieces:['wood','white','stone','roof','glass','door','window']},
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
  var KEY='buildon_save_v1', mem=null;
  BO.load = function(){ try{ var s=localStorage.getItem(KEY); if(s) return JSON.parse(s); }catch(e){} return mem; };
  BO.save = function(state){ mem=state; try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){} };
  BO.wipe = function(){ mem=null; try{ localStorage.removeItem(KEY); }catch(e){} };

  /* ================= SOUND (Web Audio) ================= */
  var ctx=null, master=null, muted=false;
  try{ muted = localStorage.getItem('buildon_mute')==='1'; }catch(e){}
  function ac(){ if(ctx) return ctx; try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); master=ctx.createGain(); master.gain.value=0.5; master.connect(ctx.destination);}catch(e){ctx=null;} return ctx; }
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
    bloom(){ [523,659,784,1047].forEach(function(f,i){ tone(f,i*0.07,0.3,'triangle',0.14); }); tone(1568,0.28,0.42,'sine',0.1); }
  };

  /* gentle ambient pad loop */
  var mGainNode=null, mTimer=null, beat=0;
  var MEL=[523.25,587.33,659.25,784.00,880.00], CH=[[261.63,329.63,392.00],[293.66,349.23,440.00],[220.00,277.18,329.63]];
  function mGain(){ if(!mGainNode){ mGainNode=ac().createGain(); mGainNode.gain.value=0.42; mGainNode.connect(master);} return mGainNode; }
  function mnote(freq,dur,vol,type){ var c=ac(); if(!c||muted) return; var o=c.createOscillator(),g=c.createGain(); o.type=type||'sine'; o.frequency.value=freq; g.gain.setValueAtTime(0.0001,c.currentTime); g.gain.exponentialRampToValueAtTime(vol,c.currentTime+0.08); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+dur); o.connect(g); g.connect(mGain()); o.start(); o.stop(c.currentTime+dur+0.05); }
  function mstep(){ if(muted) return; if(beat%8===0){ CH[(beat/8)%CH.length].forEach(function(f){ mnote(f,4.6,0.02,'sine'); }); } if(beat%2===0 && Math.random()<0.6){ mnote(MEL[(Math.random()*MEL.length)|0],0.7,0.03,'triangle'); } beat++; }
  function startMusic(){ if(mTimer||muted) return; if(!ac()) return; beat=0; mstep(); mTimer=setInterval(mstep,600); }
  function stopMusic(){ if(mTimer){ clearInterval(mTimer); mTimer=null; } }

  BO.audio = {
    resume(){ var c=ac(); if(c&&c.state==='suspended') c.resume(); if(!muted) startMusic(); },
    isMuted(){ return muted; },
    toggle(){ muted=!muted; try{ localStorage.setItem('buildon_mute', muted?'1':'0'); }catch(e){} if(muted){ stopMusic(); } else { BO.audio.resume(); BO.sfx.click(); } return muted; }
  };
})();
