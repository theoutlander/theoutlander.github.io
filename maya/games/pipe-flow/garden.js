/* ============================================================
   Pip's Rainbow Garden — meta layer for Pipe Flow!
   Sits on top of the (untouched) puzzle engine in pipe-flow.html.
   Adds: Dewdrops currency, a forever Garden that grows, a Collection
   sticker book, a Daily Challenge + streak, Pip the rainbow dragon
   mascot, win rewards/juice, and gentle music.
   All emoji + CSS — no external assets. Single sibling script,
   same global scope as the engine (so it can read levelIdx, moves,
   LEVELS, saveData, tone(), loadLevel(), etc).
   ============================================================ */
(function(){
"use strict";

/* ---------- Collectible catalog ---------- */
// cat: flower (plantable) | critter (roams garden) | hat (for Pip) | decor (plantable scenery)
// price: buyable in shop for that many 💧 (omit = only via drops/streaks)
// start: owned from the beginning
const CATALOG=[
  // flowers
  {id:'f_daisy',e:'🌼',n:'Daisy',cat:'flower',price:15,start:true},
  {id:'f_tulip',e:'🌷',n:'Tulip',cat:'flower',price:20,start:true},
  {id:'f_sun',e:'🌻',n:'Sunflower',cat:'flower',price:25},
  {id:'f_rose',e:'🌹',n:'Rose',cat:'flower',price:30},
  {id:'f_hibiscus',e:'🌺',n:'Hibiscus',cat:'flower',price:30},
  {id:'f_blossom',e:'🌸',n:'Cherry Blossom',cat:'flower',price:35},
  {id:'f_lotus',e:'🪷',n:'Lotus',cat:'flower',price:45},
  {id:'f_cactus',e:'🌵',n:'Cactus Flower',cat:'flower',price:25},
  {id:'f_rosette',e:'🏵️',n:'Golden Rosette',cat:'flower',price:55},
  {id:'f_bouquet',e:'💐',n:'Bouquet',cat:'flower',price:60},
  // critters
  {id:'c_butterfly',e:'🦋',n:'Flutter',cat:'critter',start:true},
  {id:'c_bee',e:'🐝',n:'Buzzy',cat:'critter',price:30},
  {id:'c_bunny',e:'🐰',n:'Hops',cat:'critter'},
  {id:'c_hedgehog',e:'🦔',n:'Prickles',cat:'critter'},
  {id:'c_squirrel',e:'🐿️',n:'Nutkin',cat:'critter'},
  {id:'c_turtle',e:'🐢',n:'Shelldon',cat:'critter'},
  {id:'c_duck',e:'🦆',n:'Waddles',cat:'critter'},
  {id:'c_ladybug',e:'🐞',n:'Dot',cat:'critter'},
  {id:'c_snail',e:'🐌',n:'Speedy',cat:'critter'},
  {id:'c_frog',e:'🐸',n:'Hopkins',cat:'critter'},
  // Pip hats
  {id:'h_bow',e:'🎀',n:'Bow',cat:'hat',start:true},
  {id:'h_crown',e:'👑',n:'Crown',cat:'hat',price:60},
  {id:'h_star',e:'⭐',n:'Star',cat:'hat',price:40},
  {id:'h_rainbow',e:'🌈',n:'Rainbow',cat:'hat',price:50},
  {id:'h_cap',e:'🧢',n:'Cap',cat:'hat',price:35},
  {id:'h_top',e:'🎩',n:'Top Hat',cat:'hat',price:45},
  {id:'h_party',e:'🥳',n:'Party',cat:'hat'},
  {id:'h_unicorn',e:'🦄',n:'Unicorn',cat:'hat'},
  // decorations
  {id:'d_rainbow',e:'🌈',n:'Rainbow',cat:'decor',price:50},
  {id:'d_fountain',e:'⛲',n:'Fountain',cat:'decor',price:70},
  {id:'d_cottage',e:'🏡',n:'Cottage',cat:'decor',price:90},
  {id:'d_tree',e:'🌳',n:'Big Tree',cat:'decor',price:40},
  {id:'d_mushroom',e:'🍄',n:'Mushroom',cat:'decor',price:25},
  {id:'d_balloon',e:'🎈',n:'Balloon',cat:'decor',price:30},
  {id:'d_lantern',e:'🏮',n:'Lantern',cat:'decor',price:35},
  {id:'d_castle',e:'🏰',n:'Castle',cat:'decor',price:120},
  {id:'d_flamingo',e:'🦩',n:'Flamingo',cat:'decor',price:55},
  {id:'d_gnome',e:'🧚',n:'Garden Fairy',cat:'decor'},
];
const BY_ID={};
CATALOG.forEach(function(i){BY_ID[i.id]=i;});

/* ---------- Save / meta state ---------- */
const META_KEY='pipeflow_meta';
function todayStr(){
  const d=new Date();
  return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
}
function dayNumber(){ // integer day index, for "missed a day" math
  return Math.floor(Date.now()/86400000 - (new Date().getTimezoneOffset()/1440));
}
function defaultMeta(){
  const owned={};
  CATALOG.forEach(function(i){if(i.start)owned[i.id]=true;});
  return {
    dew:0,
    owned:owned,
    garden:new Array(12).fill(null),
    gardenSize:12,
    hat:'h_bow',
    seen:{},
    music:true,
    bloomXP:0,
    harvested:[],
    completed:false,
    daily:{streak:0,best:0,lastDay:null,claimedDate:null},
  };
}

/* ---------- garden level system ---------- */
const GARDEN_LEVELS=[
  {lvl:1,need:0,name:'Sprout Patch'},
  {lvl:2,need:3,name:'Little Meadow'},
  {lvl:3,need:7,name:'Flower Bed'},
  {lvl:4,need:12,name:'Blossom Garden'},
  {lvl:5,need:18,name:'Rainbow Garden'},
  {lvl:6,need:26,name:'Starlit Garden'},
  {lvl:7,need:36,name:"Pip's Paradise"},
];
const GARDEN_MAX_LVL=GARDEN_LEVELS.length;
const LEVEL_EMOJI=['🌱','🌿','🌷','🌸','🌈','✨','🏆'];
function gardenLevelInfo(xp){
  if(xp==null)xp=M.bloomXP||0;
  let cur=GARDEN_LEVELS[0];
  for(let i=0;i<GARDEN_LEVELS.length;i++){ if(xp>=GARDEN_LEVELS[i].need)cur=GARDEN_LEVELS[i]; }
  const nextL=GARDEN_LEVELS[cur.lvl]; // next entry (index = lvl since 1-based)
  if(!nextL) return {lvl:cur.lvl,name:cur.name,pct:100,into:0,span:0,toNext:0,max:true};
  const span=nextL.need-cur.need;
  const into=xp-cur.need;
  return {lvl:cur.lvl,name:cur.name,pct:Math.round(into/span*100),into:into,span:span,toNext:nextL.need-xp,max:false};
}
function completionPct(){
  const coll=ownedCount()/CATALOG.length;
  const gl=gardenLevelInfo().lvl/GARDEN_MAX_LVL;
  return Math.round((coll*0.7+gl*0.3)*100);
}
let M=defaultMeta();
function load(){
  try{
    // MayaSave (defined in index.html, same global scope) namespaces the key per player and
    // guards every access — see the comment there. Her garden must not be overwritten by a sibling.
    const raw=window.MayaSave?window.MayaSave.get(META_KEY):null;
    if(!raw)return;
    const p=JSON.parse(raw);
    M=Object.assign(defaultMeta(),p);
    M.owned=Object.assign({},defaultMeta().owned,p.owned||{});
    M.daily=Object.assign(defaultMeta().daily,p.daily||{});
    if(!Array.isArray(M.garden))M.garden=new Array(M.gardenSize||12).fill(null);
    M.seen=p.seen||{};
  }catch(e){}
}
function save(){
  if(window.MayaSave)window.MayaSave.set(META_KEY,JSON.stringify(M));
}
function owns(id){return !!M.owned[id];}
function ownItem(id){if(!owns(id)){M.owned[id]=true;return true;}return false;}
function addDew(n){M.dew=Math.max(0,M.dew+n);}
function ownedCount(){return Object.keys(M.owned).filter(function(k){return M.owned[k];}).length;}
function ownedPlantables(){
  return CATALOG.filter(function(i){return (i.cat==='flower'||i.cat==='decor')&&owns(i.id);});
}
function ownedFlowers(){
  return CATALOG.filter(function(i){return i.cat==='flower'&&owns(i.id);});
}
function ownedCritters(){
  return CATALOG.filter(function(i){return i.cat==='critter'&&owns(i.id);});
}

/* ---------- tiny DOM helpers ---------- */
function el(id){return document.getElementById(id);}
function show(node){if(node)node.classList.remove('hidden');}
function hide(node){if(node)node.classList.add('hidden');}
function hideAllMeta(){
  ['garden-ov','collection-ov','daily-ov','picker-ov'].forEach(function(i){var n=el(i);if(n)n.classList.add('hidden');});
}

/* ---------- Sound (rewards + music) ---------- */
function sfxCoin(){ if(typeof tone!=='function')return; [880,1180].forEach(function(f,i){setTimeout(function(){tone(f,.08,'triangle',.10);},i*60);}); }
function sfxUnlock(){ if(typeof tone!=='function')return; [659,784,988,1319].forEach(function(f,i){setTimeout(function(){tone(f,.16,'sine',.16);},i*90);}); }
function sfxPlant(){ if(typeof tone!=='function')return; tone(523,.1,'sine',.12); setTimeout(function(){tone(784,.12,'sine',.10);},80); }
function sfxTab(){ if(typeof tone!=='function')return; tone(620,.05,'sine',.07); }

// gentle ambient music — soft pentatonic wander, low volume, looping
let musicTimer=null, musicMaster=null, musicStep=0;
const SCALE=[261.63,293.66,329.63,392.0,440.0,523.25,587.33,659.25];
function musicCtx(){ try{ return (typeof au==='function')?au():null; }catch(e){ return null; } }
function musicNote(freq,dur,vol,type){
  const c=musicCtx(); if(!c||!musicMaster)return;
  const o=c.createOscillator(), g=c.createGain();
  o.type=type||'sine'; o.frequency.value=freq;
  o.connect(g); g.connect(musicMaster);
  const t=c.currentTime;
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(vol,t+0.08);
  g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.start(t); o.stop(t+dur+0.05);
}
function musicStart(){
  if(musicTimer||!M.music)return;
  const c=musicCtx(); if(!c)return;
  if(!musicMaster){ musicMaster=c.createGain(); musicMaster.gain.value=0.5; musicMaster.connect(c.destination); }
  musicStep=0;
  musicTimer=setInterval(function(){
    if(!M.music){musicStop();return;}
    const s=musicStep++;
    // melody
    const idx=(Math.sin(s*0.7)*3 + (s%5) + (Math.random()<0.3?1:0));
    const n=SCALE[((Math.round(idx))%SCALE.length+SCALE.length)%SCALE.length];
    musicNote(n,1.1,0.05,'sine');
    if(s%2===0) musicNote(n/2,1.6,0.035,'triangle'); // soft bass
    if(s%4===0) musicNote(SCALE[(s/4)%5|0]*2,0.9,0.02,'sine'); // sparkle
  },820);
}
function musicStop(){ if(musicTimer){clearInterval(musicTimer);musicTimer=null;} }
function setMusic(on){
  M.music=on; save();
  if(on)musicStart(); else musicStop();
  syncMusicBtns();
}
function syncMusicBtns(){
  document.querySelectorAll('.music-toggle').forEach(function(b){
    b.textContent=M.music?'🎵':'🔇';
    b.classList.toggle('off',!M.music);
  });
}

/* ---------- Pip the dragon ---------- */
const PIP_GREETINGS=[
  "Hi Maya! Ready to make rainbows? 🌈",
  "Let's water some flowers! 💧",
  "I missed you! Wanna play? 🐉",
  "Your garden is looking lovely!",
  "Solve a puzzle to grow a new flower!",
  "Tip: extra drips are totally fine!",
  "Dad says hi — he loves your garden 💛",
  "What should we plant today?",
];
function hatEmoji(){ const h=BY_ID[M.hat]; return h?h.e:''; }
function pipSay(msg){
  const b=el('pip-bubble'); if(b)b.textContent=msg;
}
function refreshPip(){
  const hat=el('pip-hat'); if(hat)hat.textContent=hatEmoji();
  // contextual greeting
  let msg;
  if(dailyAvailable()) msg="Today's Daily Challenge is ready! ☀️";
  else if(M.daily.streak>1 && Math.random()<0.5) msg="🔥 "+M.daily.streak+"-day streak! Amazing!";
  else msg=PIP_GREETINGS[Math.floor(Math.random()*PIP_GREETINGS.length)];
  pipSay(msg);
}

/* ---------- Menu HUD ---------- */
function fmtDew(){ return M.dew; }
function refreshHud(){
  document.querySelectorAll('.dew-val').forEach(function(n){n.textContent=fmtDew();});
  const gd=el('garden-dew'); if(gd)gd.textContent=fmtDew();
  const sd=el('shop-dew'); if(sd)sd.textContent=fmtDew();
  document.querySelectorAll('.streak-val').forEach(function(n){n.textContent=M.daily.streak||0;});
  const cc=el('coll-count-badge'); if(cc)cc.textContent=ownedCount()+'/'+CATALOG.length;
  const gl=el('garden-lvl-badge'); if(gl)gl.textContent='Lv '+gardenLevelInfo().lvl;
  const ds=el('daily-state-badge');
  if(ds) ds.textContent=dailyAvailable()?'NEW!':'✓ Done';
  const db=el('menu-daily-btn');
  if(db) db.classList.toggle('ready',dailyAvailable());
  syncMusicBtns();
}
function onMenu(){
  if(dailyActive)finishDailyExit();
  hideAllMeta();
  refreshHud();
  refreshPip();
}

/* ---------- Garden ---------- */
function ensureGardenCapacity(){
  if(M.garden.length<M.gardenSize){
    while(M.garden.length<M.gardenSize)M.garden.push(null);
  }
}
function autoPlant(){
  // drop a random owned flower into the first empty plot; grow the bed if full
  ensureGardenCapacity();
  let slot=M.garden.indexOf(null);
  if(slot<0){
    if(M.gardenSize<30){ M.gardenSize+=4; ensureGardenCapacity(); slot=M.garden.indexOf(null); }
  }
  if(slot<0)return null;
  const fl=ownedFlowers();
  if(!fl.length)return null;
  const pick=fl[Math.floor(Math.random()*fl.length)];
  M.garden[slot]=pick.id;
  M.bloomXP=(M.bloomXP||0)+1;
  return pick.e;
}

/* ---------- harvest ---------- */
const HARVEST_PER=2;
function isFlowerSlot(slot){
  const id=M.garden[slot];
  return id && BY_ID[id] && BY_ID[id].cat==='flower';
}
function isRipe(slot){
  return isFlowerSlot(slot) && M.harvested.indexOf(slot)<0;
}
function ripeSlots(){
  const out=[];
  for(let i=0;i<M.garden.length;i++)if(isRipe(i))out.push(i);
  return out;
}
function harvestSlot(slot,silent){
  if(!isRipe(slot))return 0;
  M.harvested.push(slot);
  addDew(HARVEST_PER);
  if(!silent){
    floatHarvest(slot,HARVEST_PER);
    const cell=document.querySelector('.plot[data-slot="'+slot+'"]');
    if(cell){ cell.classList.remove('ripe'); cell.classList.add('harvestpop'); setTimeout(function(){cell&&cell.classList.remove('harvestpop');},420); }
    sfxCoin();
  }
  return HARVEST_PER;
}
function harvestAll(){
  const r=ripeSlots();
  if(!r.length)return;
  let total=0;
  r.forEach(function(slot,i){
    setTimeout(function(){ harvestSlot(slot); updateHarvestBtn(); refreshHud(); },i*70);
    total+=HARVEST_PER;
  });
  save();
  setTimeout(function(){ flashToast('Harvested +'+total+' 💧!'); save(); refreshHud(); renderGarden(); checkComplete(); },r.length*70+120);
}
function floatHarvest(slot,amt){
  const cell=document.querySelector('.plot[data-slot="'+slot+'"]');
  const scene=el('garden-scene');
  if(!cell||!scene)return;
  const cr=cell.getBoundingClientRect(), sr=scene.getBoundingClientRect();
  const f=document.createElement('div');
  f.className='harvest-float';
  f.textContent='+'+amt+' 💧';
  f.style.left=(cr.left-sr.left+cr.width/2-16)+'px';
  f.style.top=(cr.top-sr.top)+'px';
  scene.appendChild(f);
  setTimeout(function(){f.remove();},1000);
}
function updateHarvestBtn(){
  const btn=el('garden-harvest-btn');
  if(!btn)return;
  const n=ripeSlots().length;
  if(n>0){ btn.classList.remove('hidden'); btn.textContent='🧺 Harvest +'+(n*HARVEST_PER); }
  else btn.classList.add('hidden');
}
let pickerSlot=-1;
function openGarden(){
  hideAllMeta();
  el('menu-ov')&&el('menu-ov').classList.add('hidden');
  hideEngineOverlays();
  renderGarden();
  show(el('garden-ov'));
  refreshHud();
  startMusicOnGesture();
}
function renderGarden(){
  ensureGardenCapacity();
  applyGardenLevelTheme();
  renderGardenMeter();
  const grid=el('garden-grid'); if(!grid)return;
  grid.innerHTML='';
  for(let i=0;i<M.garden.length;i++){
    const id=M.garden[i];
    const item=id?BY_ID[id]:null;
    const cell=document.createElement('button');
    cell.type='button';
    cell.className='plot'+(item?' filled':'')+(isRipe(i)?' ripe':'');
    cell.setAttribute('data-slot',i);
    cell.innerHTML=item?('<span class="plot-item">'+item.e+'</span>'):'<span class="plot-plus">+</span>';
    grid.appendChild(cell);
  }
  // roaming critters layer
  const layer=el('garden-critters');
  if(layer){
    layer.innerHTML='';
    const cr=ownedCritters().slice(0,8);
    cr.forEach(function(c,idx){
      const s=document.createElement('span');
      s.className='roamer';
      s.textContent=c.e;
      s.style.top=(12+ (idx*37)%70)+'%';
      s.style.animationDuration=(7+ (idx%5)*2.5)+'s';
      s.style.animationDelay=(-idx*1.7)+'s';
      if(idx%2)s.classList.add('rev');
      layer.appendChild(s);
    });
  }
  updateHarvestBtn();
  const dew=el('garden-dew'); if(dew)dew.textContent=fmtDew();
  const tip=el('garden-tip');
  if(ripeSlots().length>0) tip&&(tip.textContent='Your flowers are ripe! Tap 🧺 to collect 💧');
  else if(tip)tip.textContent=ownedPlantables().length>2?'Tap a plot to plant 🌱 · tap 🛒 for more':'Win puzzles to grow flowers & level up your garden!';
}
function renderGardenMeter(){
  const info=gardenLevelInfo();
  const lv=el('gm-level');
  if(lv)lv.textContent=(LEVEL_EMOJI[info.lvl-1]||'🌱')+' Level '+info.lvl+' · '+info.name;
  const fill=el('gm-fill'); if(fill)fill.style.width=info.pct+'%';
  const nxt=el('gm-next');
  if(nxt){
    if(info.max)nxt.textContent='🏆 Top level! Collect everything to complete your garden.';
    else nxt.textContent='Grow '+info.toNext+' more flower'+(info.toNext===1?'':'s')+' to reach Level '+(info.lvl+1)+'!';
  }
  const comp=el('gm-complete'); if(comp)comp.textContent=completionPct()+'% complete';
}
function applyGardenLevelTheme(){
  const ov=el('garden-ov'); if(!ov)return;
  const info=gardenLevelInfo();
  for(let i=1;i<=GARDEN_MAX_LVL;i++)ov.classList.remove('gl'+i);
  ov.classList.add('gl'+info.lvl);
  // populate stars / petals once
  const stars=el('garden-stars');
  if(stars&&!stars.childElementCount){
    let h='';
    for(let i=0;i<26;i++){ h+='<span style="left:'+(Math.random()*96)+'%;top:'+(Math.random()*46)+'%;animation-delay:'+(-Math.random()*2.4)+'s">'+(Math.random()<.3?'⭐':'✨')+'</span>'; }
    stars.innerHTML=h;
  }
  const petals=el('garden-petals');
  if(petals&&!petals.childElementCount){
    const pe=['🌸','🌺','🌼','💮'];
    let h='';
    for(let i=0;i<10;i++){ h+='<span style="left:'+(Math.random()*96)+'%;animation-duration:'+(7+Math.random()*6)+'s;animation-delay:'+(-Math.random()*8)+'s">'+pe[i%pe.length]+'</span>'; }
    petals.innerHTML=h;
  }
}
function onGardenClick(e){
  const cell=e.target.closest('.plot');
  if(!cell)return;
  const slot=+cell.getAttribute('data-slot');
  if(isRipe(slot)){
    harvestSlot(slot);
    save(); updateHarvestBtn(); refreshHud();
    const dew=el('garden-dew'); if(dew)dew.textContent=fmtDew();
    return;
  }
  pickerSlot=slot;
  openPicker();
}
function openPicker(){
  const ov=el('picker-ov'); if(!ov)return;
  const grid=el('picker-grid');
  grid.innerHTML='';
  // clear option
  const clear=document.createElement('button');
  clear.type='button'; clear.className='pick-tile clear';
  clear.innerHTML='<span class="pe">🚮</span><span class="pn">Clear</span>';
  clear.onclick=function(){ M.garden[pickerSlot]=null; save(); sfxPlant(); ov.classList.add('hidden'); renderGarden(); };
  grid.appendChild(clear);
  ownedPlantables().forEach(function(it){
    const b=document.createElement('button');
    b.type='button'; b.className='pick-tile'+(M.garden[pickerSlot]===it.id?' sel':'');
    b.innerHTML='<span class="pe">'+it.e+'</span><span class="pn">'+it.n+'</span>';
    b.onclick=function(){ M.garden[pickerSlot]=it.id; save(); sfxPlant(); ov.classList.add('hidden'); renderGarden(); };
    grid.appendChild(b);
  });
  show(ov);
}

/* ---------- Shop ---------- */
function openShop(){ renderShop(); show(el('shop-panel')); }
function closeShop(){ el('shop-panel')&&el('shop-panel').classList.add('hidden'); }
let shopCat='flower';
function renderShop(){
  const grid=el('shop-grid'); if(!grid)return;
  el('shop-dew')&&(el('shop-dew').textContent=fmtDew());
  document.querySelectorAll('#shop-tabs .shop-tab').forEach(function(t){
    t.classList.toggle('on',t.getAttribute('data-cat')===shopCat);
  });
  grid.innerHTML='';
  CATALOG.filter(function(i){return i.cat===shopCat&&i.price;}).forEach(function(it){
    const have=owns(it.id);
    const afford=M.dew>=it.price;
    const b=document.createElement('button');
    b.type='button';
    b.className='shop-item'+(have?' owned':'')+((!have&&!afford)?' broke':'');
    b.innerHTML='<span class="se">'+it.e+'</span><span class="sn">'+it.n+'</span>'+
      (have?'<span class="sp owned">Owned ✓</span>':'<span class="sp">💧 '+it.price+'</span>');
    if(!have)b.onclick=function(){ buy(it); };
    grid.appendChild(b);
  });
}
function buy(it){
  if(owns(it.id))return;
  if(M.dew<it.price){ flashToast("Not enough 💧 — win some puzzles!"); return; }
  addDew(-it.price);
  ownItem(it.id);
  save(); sfxUnlock();
  flashToast("Got "+it.e+" "+it.n+"!");
  renderShop(); refreshHud(); renderGarden();
  checkComplete();
}

/* ---------- Collection sticker book ---------- */
let collCat='flower';
function openCollection(){
  hideAllMeta();
  el('menu-ov')&&el('menu-ov').classList.add('hidden');
  hideEngineOverlays();
  renderCollection();
  show(el('collection-ov'));
  startMusicOnGesture();
}
function renderCollection(){
  const grid=el('coll-grid'); if(!grid)return;
  el('coll-total')&&(el('coll-total').textContent=ownedCount()+' / '+CATALOG.length);
  document.querySelectorAll('#coll-tabs .coll-tab').forEach(function(t){
    t.classList.toggle('on',t.getAttribute('data-cat')===collCat);
  });
  grid.innerHTML='';
  CATALOG.filter(function(i){return i.cat===collCat;}).forEach(function(it){
    const have=owns(it.id);
    const card=document.createElement('div');
    card.className='sticker'+(have?' have':' locked');
    if(it.cat==='hat'&&have){
      card.classList.add('tappable');
      if(M.hat===it.id)card.classList.add('equipped');
    }
    card.innerHTML='<div class="st-e">'+(have?it.e:'❓')+'</div>'+
      '<div class="st-n">'+(have?it.n:'???')+'</div>'+
      (it.cat==='hat'&&have?('<div class="st-tag">'+(M.hat===it.id?'On Pip ✓':'Tap to wear')+'</div>'):'');
    if(it.cat==='hat'&&have){
      card.onclick=function(){ M.hat=(M.hat===it.id?null:it.id); save(); sfxTab(); renderCollection(); refreshPip(); };
    }
    grid.appendChild(card);
  });
}

/* ---------- Daily Challenge ---------- */
// curated tougher pool of standalone single-finish levels (engine indices)
const DAILY_POOL=[4,7,9,10,11,12,13,14,15,17,18,22];
let dailyActive=false;
let campaignSnapshot=null;
function dailyIndexForToday(){
  // deterministic-ish pick from date
  const d=new Date();
  const seed=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
  return DAILY_POOL[seed%DAILY_POOL.length];
}
function dailyAvailable(){ return M.daily.claimedDate!==todayStr(); }
function openDaily(){
  hideAllMeta();
  el('menu-ov')&&el('menu-ov').classList.add('hidden');
  hideEngineOverlays();
  const lv=LEVELS[dailyIndexForToday()];
  el('daily-name')&&(el('daily-name').textContent=lv?lv.name:'Mystery Garden');
  el('daily-streak-num')&&(el('daily-streak-num').textContent=M.daily.streak||0);
  el('daily-best-num')&&(el('daily-best-num').textContent=M.daily.best||0);
  const avail=dailyAvailable();
  const btn=el('daily-play-btn');
  if(btn)btn.textContent=avail?'Play Today\'s Puzzle ☀️':'Play Again (no bonus)';
  const note=el('daily-note');
  if(note)note.textContent=avail?'Win to earn +20 💧, a surprise gift, and keep your streak alive!':'You already claimed today — see you tomorrow! 🌙';
  show(el('daily-ov'));
  startMusicOnGesture();
}
function startDaily(){
  // snapshot campaign so daily play doesn't disturb saved progress
  campaignSnapshot={levelIdx:levelIdx, save:JSON.parse(JSON.stringify(saveData))};
  dailyActive=true;
  hideAllMeta();
  el('menu-ov')&&el('menu-ov').classList.add('hidden');
  hideEngineOverlays();
  mode='play';
  if(typeof canvas!=='undefined'&&canvas)canvas.style.cursor='grab';
  levelIdx=dailyIndexForToday();
  loadLevel(levelIdx);
  // restyle badge for daily
  const badge=el('level-badge');
  if(badge)badge.textContent='☀️ Daily';
  startMusicOnGesture();
}
function restoreCampaignSave(){
  if(!campaignSnapshot)return;
  try{
    saveData.nextLevel=campaignSnapshot.save.nextLevel;
    saveData.stars=campaignSnapshot.save.stars;
    saveData.maxBeaten=campaignSnapshot.save.maxBeaten;
    persistSave();
  }catch(e){}
}
function finishDailyExit(){
  // called when leaving a daily session — restore campaign level pointer
  if(campaignSnapshot){
    restoreCampaignSave();
    levelIdx=campaignSnapshot.levelIdx;
    campaignSnapshot=null;
  }
  dailyActive=false;
}

/* ---------- Reward flow (hooked from showWin) ---------- */
function hideEngineOverlays(){
  ['win-ov','lose-ov'].forEach(function(i){var n=el(i);if(n)n.classList.add('hidden');});
}
function rollGift(){
  const pool=CATALOG.filter(function(i){return !owns(i.id);});
  if(!pool.length)return null;
  // weight: critters & hats a bit rarer feel — but keep simple, uniform with slight flower bias
  const pick=pool[Math.floor(Math.random()*pool.length)];
  ownItem(pick.id);
  return pick;
}
function onWin(){
  // runs at the end of engine showWin(); compute & inject rewards
  const idx=levelIdx;
  const stars=(typeof starGrade==='function')?starGrade(moves,levelPar):1;
  let dew = stars>=3?12 : stars>=2?8 : 5;
  const lines=[];
  lines.push((stars>=3?'⭐⭐⭐ Perfect':stars>=2?'⭐⭐ Great':'⭐ Cleared')+'  +'+(stars>=3?12:stars>=2?8:5)+' 💧');

  const firstClear=!M.seen[idx] && !dailyActive;
  if(firstClear){ dew+=8; M.seen[idx]=true; lines.push('🌟 First clear bonus  +8 💧'); }

  // no-hint skill bonus
  if(!window.pipHintUsed){ dew+=5; lines.push('🧠 No-Hint bonus  +5 💧'); }

  // daily
  let dailyGiftGuaranteed=false;
  if(dailyActive && dailyAvailable()){
    dew+=20;
    const dn=dayNumber();
    if(M.daily.lastDay===dn-1) M.daily.streak=(M.daily.streak||0)+1;
    else M.daily.streak=1;
    M.daily.lastDay=dn;
    M.daily.best=Math.max(M.daily.best||0,M.daily.streak);
    M.daily.claimedDate=todayStr();
    lines.push('☀️ Daily Challenge  +20 💧');
    lines.push('🔥 '+M.daily.streak+'-day streak!');
    dailyGiftGuaranteed=true;
  }

  // daily play must not alter the saved campaign progress
  if(dailyActive) restoreCampaignSave();

  // grow the garden + maybe level it up
  const oldLvl=gardenLevelInfo().lvl;
  const bloom=autoPlant();
  const newLvl=gardenLevelInfo().lvl;
  const leveledUp=newLvl>oldLvl;
  if(leveledUp){
    const lvlBonus=newLvl*5;
    dew+=lvlBonus;
    lines.push('🌿 Garden grew to Level '+newLvl+'! +'+lvlBonus+' 💧');
  }

  addDew(dew);

  // flowers ripen again so there's something to harvest in the garden
  M.harvested=[];

  // exactly one mystery gift: level-up > daily > random chance
  let gift=null;
  const giftChance=firstClear?0.7:0.4;
  if(leveledUp) gift=rollGift();
  else if(dailyGiftGuaranteed) gift=rollGift();
  else if(!dailyActive && Math.random()<giftChance) gift=rollGift();

  save();
  refreshHud();

  renderReward(dew,bloom,gift,lines,leveledUp?newLvl:0);
  checkComplete();

  // adapt win overlay copy/buttons for daily
  if(dailyActive){
    el('win-title')&&(el('win-title').textContent='Daily done! 🔥');
    el('next-btn')&&(el('next-btn').textContent='Back to Menu 🏠');
  }
}
function renderReward(dew,bloom,gift,lines,levelUp){
  const box=el('pip-reward'); if(!box)return;
  let html='';
  if(levelUp){ html+='<div class="rw-levelup">🌿 Garden Level '+levelUp+'!</div>'; }
  html+='<div class="rw-total">+'+dew+' <span class="rw-dew">💧</span></div>';
  html+='<div class="rw-lines">';
  lines.forEach(function(l){ html+='<div class="rw-line">'+l+'</div>'; });
  if(bloom) html+='<div class="rw-line">🌱 A new '+bloom+' bloomed in your garden!</div>';
  html+='</div>';
  if(gift){
    html+='<div class="rw-gift" id="rw-gift"><div class="gift-box" id="gift-box">🎁</div>'+
      '<div class="gift-reveal hidden" id="gift-reveal"><div class="gr-e">'+gift.e+'</div>'+
      '<div class="gr-n">New! '+gift.n+'</div><div class="gr-sub">Added to your Collection 📖</div></div>'+
      '<div class="gift-tap" id="gift-tap">Tap the gift! 🎁</div></div>';
  }
  box.innerHTML=html;
  sfxCoin();
  if(gift){
    const gb=el('gift-box'), gr=el('gift-reveal'), gt=el('gift-tap');
    const open=function(){
      gb.classList.add('open');
      setTimeout(function(){
        gb.classList.add('hidden'); gt.classList.add('hidden');
        gr.classList.remove('hidden'); sfxUnlock();
      },260);
    };
    gb.onclick=open;
  }
}

/* ---------- completion ---------- */
function checkComplete(){
  if(M.completed)return;
  if(ownedCount()===CATALOG.length && gardenLevelInfo().lvl>=GARDEN_MAX_LVL){
    M.completed=true; save();
    setTimeout(function(){ const ov=el('complete-ov'); if(ov)ov.classList.remove('hidden'); sfxUnlock(); },500);
  }
}

/* ---------- toast ---------- */
let toastTimer=null;
function flashToast(msg){
  let t=el('pip-toast');
  if(!t){ t=document.createElement('div'); t.id='pip-toast'; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add('show');
  if(toastTimer)clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){t.classList.remove('show');},1600);
}

/* ---------- music on first gesture ---------- */
let gestureArmed=false;
function startMusicOnGesture(){
  if(gestureArmed)return;
  gestureArmed=true;
  if(M.music)setTimeout(musicStart,50);
}

/* ---------- engine hooks (called from lightly-edited engine source) ---------- */
// returns true if the meta layer handled "next" (daily -> back to menu)
function onNext(){
  if(dailyActive){
    el('win-ov')&&el('win-ov').classList.add('hidden');
    finishDailyExit();
    if(typeof window.showMenu==='function')window.showMenu();
    return true;
  }
  return false;
}
function onStartGame(){ startMusicOnGesture(); }
function onHintUsed(){ window.pipHintUsed=true; }

/* ---------- wire DOM ---------- */
function wireUI(){
  // menu home buttons
  bind(el('menu-garden-btn'),openGarden);
  bind(el('menu-collection-btn'),openCollection);
  bind(el('menu-daily-btn'),openDaily);
  // garden
  bind(el('garden-back'),backToMenu);
  bind(el('garden-shop-btn'),openShop);
  bind(el('garden-harvest-btn'),harvestAll);
  const gg=el('garden-grid'); if(gg)gg.addEventListener('click',onGardenClick);
  bind(el('shop-close'),closeShop);
  // completion finale
  bind(el('complete-ok'),function(){ el('complete-ov')&&el('complete-ov').classList.add('hidden'); });
  document.querySelectorAll('#shop-tabs .shop-tab').forEach(function(t){
    t.addEventListener('click',function(){ shopCat=t.getAttribute('data-cat'); sfxTab(); renderShop(); });
  });
  // picker
  bind(el('picker-close'),function(){ el('picker-ov').classList.add('hidden'); });
  // collection
  bind(el('collection-back'),backToMenu);
  document.querySelectorAll('#coll-tabs .coll-tab').forEach(function(t){
    t.addEventListener('click',function(){ collCat=t.getAttribute('data-cat'); sfxTab(); renderCollection(); });
  });
  // daily
  bind(el('daily-back'),backToMenu);
  bind(el('daily-play-btn'),startDaily);
  // music toggles
  document.querySelectorAll('.music-toggle').forEach(function(b){
    b.addEventListener('click',function(e){ e.stopPropagation(); setMusic(!M.music); startMusicOnGesture(); });
  });
}
function bind(node,fn){
  if(!node)return;
  let touched=false;
  node.addEventListener('touchend',function(e){ e.preventDefault(); touched=true; fn(e); setTimeout(function(){touched=false;},400); },{passive:false});
  node.addEventListener('click',function(e){ if(touched)return; fn(e); });
}
function backToMenu(){
  hideAllMeta();
  if(typeof window.showMenu==='function')window.showMenu();
  else { el('menu-ov')&&el('menu-ov').classList.remove('hidden'); onMenu(); }
}

/* ---------- boot ---------- */
function boot(){
  load();
  wireUI();
  onMenu();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();

// expose for engine hooks + debugging
window.PipMeta={
  onWin:onWin, onMenu:onMenu, onNext:onNext, onStartGame:onStartGame, onHintUsed:onHintUsed,
  addDew:addDew, save:save, get meta(){return M;}
};

})();
