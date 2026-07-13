/* Maya's Escape Room — game logic */
(function(){
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------------- Data ---------------- */
const CHAIR_COLORS = ['#5a2d6e','#6e2d3a','#2d4a6e','#2d6e4a','#6e5a2d'];
const COLOR_RIDDLES = [
  'a wizard\u2019s magic hat \ud83e\uddd9',
  'a yummy strawberry \ud83c\udf53',
  'the deep night sea \ud83c\udf0a',
  'a sneaky little frog \ud83d\udc38',
  'a pirate\u2019s shiny gold \ud83e\ude99',
];

const BOOK_EMOJI = ['📕','📗','📘','📙'];
const BOOK_NAMES = ['RED','GREEN','BLUE','ORANGE'];
const SHELF_NAMES = ['TOP','MIDDLE','BOTTOM'];
const TOTAL_GEMS = 11;
const ITEM_ORDER = ['candle','brasskey','musicbox','teddy','page0','page1','page2'];
const TOTAL_ITEMS = ITEM_ORDER.length;

/* Guarded storage — iPad Safari THROWS on localStorage when site data is
   blocked; never touch it bare (see CLAUDE.md hard rules). */
const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} },
};

// Theme-driven content — populated by applyTheme() before each round.
let THEME = null;
let SPOTS, FAKE_CLUES, DUSTY_LINES, WRONG_BOOK_LINES;

function applyTheme(id){
  THEME = window.THEMES[id];
  SPOTS = THEME.SPOTS;
  FAKE_CLUES = THEME.FAKE_CLUES;
  DUSTY_LINES = THEME.DUSTY_LINES;
  WRONG_BOOK_LINES = THEME.WRONG_BOOK_LINES;
  $('#owl').textContent = THEME.hintAnimal.emoji;
  $('#furnace-emoji').textContent = THEME.furnace.emoji;
  $('#furnace-label').textContent = THEME.furnace.name;
  $('#kitchen-candle-label').textContent = THEME.items.candle.name;
}

/* ---------------- State ---------------- */
let S = null;
let timerInt = null;

function newState(){
  return {
    phase:'title', sits:3, key1:false, key2:false, key3:false,
    chairs:[], trueSpot:null, cluesFound:[], lidsOpen:false,
    keyTaken:false, start:0, elapsed:0, mirrorUnlocked:false,
    door1Open:false, songDone:false, spotFound:false, exitOpen:false,
    potionDone:false, wordDone:false,
    gems:[], portraitTaps:0, jarTaps:0, owlTaps:0,
    noteRead:false, chestOpen:false, chestRattled:false, hintUsed:{},
    bookShelves:[], bookTarget:{shelf:0,color:0},
    items:[], diaryRead:[], diaryBonusPending:false, scares:0,
    floorboardFound:false, leverPulled:false,
    mimicCrate:0, cratesOpened:[], furnaceTaps:0,
    trunkRattled:false, trunkOpen:false, trunkGemTaken:false,
    chandTaps:0, toyTaps:0, grannyTaps:0, wallTaps:{}, moonTaps:0,
  };
}

function shuffle(a){ a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

function setupRound(){
  S = newState();
  S.trueSpot = SPOTS[Math.floor(Math.random()*SPOTS.length)];
  const silly = shuffle(FAKE_CLUES).slice(0,2);
  const wrongSpot = shuffle(SPOTS.filter(s=>s.id!==S.trueSpot.id))[0];
  const ratFake = 'Pssst! The key is in the '+wrongSpot.name.toUpperCase()+'! Really truly! — signed, a sneaky rat 🐀';
  let contents = shuffle([
    {type:'key'},
    {type:'clue', text:S.trueSpot.riddle, true:true},
    {type:'clue', text:ratFake},
    {type:'clue', text:silly[0]}, {type:'clue', text:silly[1]},
  ]);
  const nonKey = contents.map((c,i)=>i).filter(i=>contents[i].type!=='key');
  const magicIdx = nonKey[Math.floor(Math.random()*nonKey.length)];
  S.chairs = contents.map((c,i)=>({ ...c, magic:i===magicIdx, opened:false, sat:false }));
  S.keyChairIdx = S.chairs.findIndex(c=>c.type==='key');
  // library books: 3 shelves, each with the 4 colors shuffled
  S.bookShelves = [0,1,2].map(()=>shuffle([0,1,2,3]));
  S.bookTarget = { shelf: Math.floor(Math.random()*3), color: Math.floor(Math.random()*4) };
  S.mimicCrate = Math.floor(Math.random()*3);
}

/* ---------------- Helpers ---------------- */
function show(id){
  $$('.scene').forEach(s=>s.classList.remove('on','fadein'));
  const el = $(id); el.classList.add('on','fadein');
}
let msgTimeout=null;
function msg(text, ms=3200){
  const m = $('#msg'); m.innerHTML = text; m.classList.add('show');
  clearTimeout(msgTimeout);
  msgTimeout = setTimeout(()=>m.classList.remove('show'), ms);
}
function fmt(t){ const s=Math.floor(t/1000); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
function startTimer(){
  S.start = Date.now();
  clearInterval(timerInt);
  timerInt = setInterval(()=>{ $('#timer').textContent = fmt(Date.now()-S.start); }, 500);
}
function sfx(kind){ try{ if(window.Snd) Snd.play(kind); }catch(e){} }

function confetti(){
  const colors=['#ffe14d','#ff6eb4','#5dffb0','#5bc8ff','#c77dff'];
  for(let i=0;i<80;i++){
    const c=document.createElement('div'); c.className='cp';
    const s=6+Math.random()*8;
    c.style.cssText=`left:${Math.random()*100}vw;width:${s}px;height:${s*.6}px;background:${colors[i%5]};animation-duration:${2+Math.random()*2.5}s;animation-delay:${Math.random()*0.8}s;border-radius:2px`;
    document.body.appendChild(c); setTimeout(()=>c.remove(),5500);
  }
}

/* ---------------- Spooks & jump scares ---------------- */
const JUMPFACES=['🎃','💀','👻','🕷️'];
function scareFace(){
  const jf=$('#jumpface');
  jf.querySelector('span').textContent=JUMPFACES[Math.floor(Math.random()*JUMPFACES.length)];
  jf.classList.remove('go'); void jf.offsetWidth; jf.classList.add('go');
  sfx('stinger');
  setTimeout(()=>jf.classList.remove('go'),1000);
}
function scareHands(){
  sfx('growl'); sfx('whisper');
  ['l','r'].forEach(side=>{
    const h=document.createElement('span'); h.className='sidehand '+side;
    h.textContent = side==='l' ? '🫱' : '🫲';
    document.body.appendChild(h); setTimeout(()=>h.remove(),1600);
  });
}
function scareEyes(){
  const d=$('#darkout'); d.innerHTML='';
  for(let i=0;i<6;i++){
    const e=document.createElement('span'); e.className='do-eyes';
    e.style.cssText=`left:${8+Math.random()*80}%;top:${12+Math.random()*70}%;animation-delay:${i*.14}s;transform:scale(${.7+Math.random()*.9})`;
    d.appendChild(e);
  }
  d.classList.add('go'); sfx('whisper'); setTimeout(()=>sfx('growl'),500);
  setTimeout(()=>{ d.classList.remove('go'); setTimeout(()=>d.innerHTML='',400); },1700);
}
function scareKnock(){
  sfx('knock');
  const st=$('#stage'); st.classList.remove('shudder'); void st.offsetWidth; st.classList.add('shudder');
  setTimeout(()=>st.classList.remove('shudder'),500);
}
function scareBats(el){
  const r=(el||$('#stage')).getBoundingClientRect();
  sfx('screech');
  for(let i=0;i<3;i++){
    const b=document.createElement('span'); b.className='batburst'; b.textContent='🦇';
    b.style.left=(r.left+r.width/2)+'px'; b.style.top=(r.top+r.height/2)+'px';
    b.style.setProperty('--dx',(Math.random()*260-130)+'px');
    b.style.setProperty('--dy',(-60-Math.random()*180)+'px');
    document.body.appendChild(b); setTimeout(()=>b.remove(),1200);
  }
}
function scareLightning(){
  const L=$('#lightning'); L.classList.remove('flash'); void L.offsetWidth; L.classList.add('flash');
  sfx('thunder');
}
function scareGhost(){
  const g=$('#big-ghost'); g.classList.remove('swoop'); void g.offsetWidth; g.classList.add('swoop');
  sfx('ghost');
}
function spook(el){
  S.scares++;
  // first scare stays gentle; after that the REAL scares join the pool
  const pool = S.scares<2
    ? [scareGhost, ()=>scareBats(el), scareLightning, scareKnock]
    : [scareGhost, ()=>scareBats(el), scareLightning, scareKnock, scareFace, scareHands, scareEyes];
  pool[Math.floor(Math.random()*pool.length)]();
}

/* ---------------- Items & satchel ---------------- */
function itemDef(id){
  if(id.startsWith('page')){
    const i=+id.slice(4);
    return { emoji:'📜', name:THEME.diaryTitle+' — Page '+(i+1), flavor:'Tap to read it again!' };
  }
  return THEME.items[id];
}
function hasItem(id){ return S.items.includes(id); }
function addItem(id, silent){
  if(hasItem(id)) return;
  S.items.push(id); sfx('key'); updateHUD();
  if(!silent) msg(itemDef(id).takeMsg || ('🎒 You got the <b>'+itemDef(id).name+'</b>!'), 4200);
}
function buildSatchel(){
  const g=$('#sat-grid'); g.innerHTML='';
  ITEM_ORDER.forEach(id=>{
    const owned=hasItem(id);
    const el=document.createElement('div');
    el.className='sat-item'+(owned?'':' empty');
    const def=owned?itemDef(id):null;
    el.innerHTML = owned
      ? `<span class="si-em">${def.emoji}</span><span class="si-name">${def.name}</span>`
      : '<span class="si-em">❓</span><span class="si-name">???</span>';
    if(owned) el.addEventListener('click',()=>satchelItemTap(id, def));
    g.appendChild(el);
  });
}
function satchelItemTap(id, def){
  if(id.startsWith('page')){
    $('#satmodal').classList.remove('show');
    diaryPage(+id.slice(4));
    return;
  }
  if(id==='musicbox'){
    sfx('musicbox');
    if(S.phase==='room2' && !S.gems.includes('mghost')){
      $('#satmodal').classList.remove('show');
      const g=$('#mghost'); g.classList.remove('boo'); void g.offsetWidth; g.classList.add('boo');
      setTimeout(()=>addGem('mghost','The ghost heard the music box and DANCED! It dropped this!'), 900);
      return;
    }
    $('#sat-note').innerHTML='🎼 The music box plays its spooky little song... someone would love to hear this. 🪞';
    return;
  }
  if(id==='candle'){ sfx('pop'); }
  $('#sat-note').innerHTML = def.emoji+' <b>'+def.name+'</b> — '+def.flavor;
}
function openSatchel(){
  buildSatchel();
  $('#sat-note').textContent='Tap a treasure to peek at it!';
  sfx('paper');
  $('#satmodal').classList.add('show');
}

/* ---------------- Diary ---------------- */
function diaryPage(i){
  const p=THEME.diaryPages[i];
  sfx('paper');
  $('#bm-left').innerHTML=p.left;
  $('#bm-right').innerHTML=p.right;
  $('#bookmodal').classList.add('show');
  if(!S.diaryRead.includes(i)){
    S.diaryRead.push(i);
    if(S.diaryRead.length===THEME.diaryPages.length) S.diaryBonusPending=true;
  }
}

/* ---------------- Gems ---------------- */
function addGem(id, text){
  if(S.gems.includes(id)) return;
  S.gems.push(id); sfx('gem'); updateHUD();
  msg('💎 <b>HIDDEN GEM!</b> '+text+' <b>('+S.gems.length+'/'+TOTAL_GEMS+')</b>', 4000);
}

/* ---------------- HUD ---------------- */
function updateHUD(){
  const dots=$$('#sits .sit-dot');
  dots.forEach((d,i)=>d.classList.toggle('used', i >= S.sits));
  $('#k1').classList.toggle('got', S.key1);
  $('#k2').classList.toggle('got', S.key2);
  $('#gem-n').textContent = S.gems.length;
  $('#item-n').textContent = S.items.length;
  $('#satchel-btn').classList.toggle('show', S.items.length>0);
  $('#room-back').classList.toggle('show', !!BACK_MAP[S.phase]);
  $('#clue-btn').classList.toggle('show', S.cluesFound.length>0);
  $('#sits').style.display = (S.phase==='room1') ? 'flex':'none';
  $('#room-name').textContent = THEME.roomNames[S.phase] || '';
  const t=goalText(); $('#goal').textContent = t ? '🎯 '+t : '';
}

function goalText(){
  if(S.phase==='room1'){
    if(!S.keyTaken){
      if(!S.noteRead) return THEME.room1GoalMsg;
      return THEME.room1ColorGoalMsg;
    }
    if(!S.door1Open) return 'Grab the scrolls 📜, then tap the door and crack its number locks!';
    return 'Go through the door! 🚪';
  }
  if(S.phase==='secret') return S.chestOpen ? 'Take the back door when you\u2019re done exploring! 🚪' : 'A treasure chest! It’s... moving?! Open it if you dare!';
  if(S.phase==='cellar') return 'Explore everything — then take the ladder back up! 🪜';
  if(S.phase==='attic') return 'Explore everything — then take the ladder back down! 🪜';
  if(S.phase==='kitchen') return S.potionDone ? 'The door is unstuck — go through! 🚪' : 'Tap the cauldron — memorize the recipe FAST! ⚗️';
  if(S.phase==='library'){
    if(!S.key3) return 'A key hides behind ONE book... the '+THEME.hintAnimal.name+' '+THEME.hintAnimal.emoji+' knows which!';
    if(!S.wordDone) return 'Key found! Now tap the glowing book 📖 and break the magic seal!';
    return 'The door is open — go through! 🚪';
  }
  if(S.phase==='room2'){
    if(!S.key2){
      if(S.spotFound) return 'Tap the glowing '+S.trueSpot.name.toLowerCase()+' and play the ghost\u2019s song! 🎹';
      return 'Tap 📜 Clues — but beware, some scrolls LIE! 🤥';
    }
    if(!S.mirrorUnlocked) return 'You have the '+THEME.exitPropName+' key — tap the '+THEME.exitPropName+'! 🪞';
    return 'Tap the '+THEME.exitPropName+' again to step through! ✨';
  }
  if(S.phase==='room3') return 'Tap the glowing EXIT and solve the backwards lock!';
  return '';
}

/* ---------------- Hint ghost ---------------- */
function hintFor(){
  const p=S.phase;
  if(p==='room1'){
    if(!S.keyTaken && !S.noteRead) return '“Psst! See that pinned note 📌 on the wall? It knows WHICH '+THEME.seatNoun+'!”';
    if(!S.keyTaken) return '“The riddle is a COLOR. Look at each '+THEME.seatNoun+' and think hard!”';
    return '“The door lock loves math — TWO answers in a row. You\u2019ve got this!”';
  }
  if(p==='secret') return '“Open the chest, silly! Treasure doesn’t open itself! 🤫”';
  if(p==='cellar') return '“Grab everything shiny down here, then head back up the ladder! 🪜”';
  if(p==='attic') return '“Open the singing trunk, grab the old page, then back down the ladder! 🪜”';
  if(p==='kitchen') return '“Watch the recipe QUICK before the magic ink fades... then tap in order!”';
  if(p==='library'){
    if(!S.key3) return '“The '+THEME.hintAnimal.name+' '+THEME.hintAnimal.emoji+' saw where the key went. Tap it and LISTEN!”';
    return '“Read the backwards word from RIGHT to LEFT... and dodge the 2 trick letters!”';
  }
  if(p==='room2'){
    if(!S.spotFound){
      if(S.cluesFound.some(c=>c.true)) return '“The GOLDEN scroll never lies! Search the spot IT names!”';
      return '“One scroll is special... the portrait whispered why. GOLDEN things tell the truth!”';
    }
    return '“Play my cousin\u2019s song at the glowing spot! Listen first, then copy! 🎹”';
  }
  if(p==='room3') return '“Backwards land! The mystery number goes FIRST. Count carefully!”';
  return '“Hee hee... I’ve got nothing. You’re on your own, brave one!”';
}
function secretHintFor(){
  const p=S.phase;
  if(p==='room1') return '“Wanna know a SECRET? That grumpy portrait 🧐 is terribly ticklish. Tap it three times! And the chandelier is hiding something...”';
  if(p==='secret') return '“Poke EVERYTHING — the toys squeak, granny whispers, the chair rocks itself... and is that an old PAGE on the wall? 📜”';
  if(p==='kitchen') return hasItem('candle')
    ? '“One floorboard near the cauldron looks... crooked. You have a candle now, don’t you? 🕯️”'
    : '“I smell secrets UNDER this floor. Find a light first — look around the shelves! 🕯️”';
  if(p==='cellar') return '“Peek in ALL the crates... one of them is hungry, hee hee! And say hi to '+THEME.furnace.name+' for me!”';
  if(p==='library') return S.leverPulled
    ? (hasItem('brasskey') ? '“The glowing crack in the wall wants your little brass key! 🔑”' : '“That crack in the wall has a KEYHOLE. Brass keys love dark cellars, hee hee...”')
    : '“Psst... one of the candle sconces on the wall is secretly a LEVER. Give it a pull! 🕯️”';
  if(p==='attic') return '“The trunk sings when you tap it! And there’s an old page up here somewhere... 📜”';
  if(p==='room2') return '“That door on the left is painted on, hee hee! And if you found a music box... the mirror ghost LOVES music. 🎼”';
  if(p==='room3') return '“Tap the floating chair! It’s keeping something warm, hee hee!”';
  return '“Hee hee... every room has secrets. Poke EVERYTHING!”';
}

/* ---------------- Room 1: chairs ---------------- */
function buildChairs(){
  const row = $('#chair-row'); row.innerHTML='';
  S.chairs.forEach((c,i)=>{
    const el=document.createElement('div');
    el.className='chair'; el.dataset.i=i;
    el.style.setProperty('--cc', CHAIR_COLORS[i]);
    el.innerHTML = `<div class="sitter">👧</div><div class="c-back"></div>
      <div class="c-box"><div class="c-content"></div><div class="c-lid"></div></div>
      <div class="c-legs"><span></span><span></span></div>`;
    el.addEventListener('click', ()=>chairClick(i, el));
    row.appendChild(el);
  });
}

function openLid(i, el){
  const c=S.chairs[i]; if(c.opened) return;
  c.opened=true;
  const content = el.querySelector('.c-content');
  content.textContent = c.type==='key' ? '🗝️' : '📜';
  content.classList.add('takeable');
  el.classList.add('open');
  sfx('pop');
}

function openAllLids(skipKey){
  S.lidsOpen = true;
  $$('#chair-row .chair').forEach((el,i)=>{
    if(skipKey && S.chairs[i].type==='key') return;
    setTimeout(()=>openLid(i,el), i*140);
  });
}

function chairClick(i, el){
  const c = S.chairs[i];
  if(S.phase!=='room1') return;
  if(c.opened){
    if(c.type==='key' && !S.keyTaken){
      S.keyTaken=true; S.key1=true; el.classList.add('taken');
      el.querySelector('.c-content').textContent='';
      sfx('key'); updateHUD();
      msg('🗝️ You got the <b>'+THEME.room1KeyName+' key!</b> The other lids popped — read those scrolls, then unlock the door!');
      openAllLids(false);
    } else if(c.type==='clue'){
      if(!S.cluesFound.some(x=>x.text===c.text)) S.cluesFound.push({text:c.text, true:!!c.true});
      updateHUD();
      showScroll(c.true?'✨ A scroll... it feels warm?':'📜 A dusty scroll', c.text.replace(/\n/g,'<br>') + '<em>Hmm... is this clue real, or is it tricking you?</em>', c.true);
    }
    return;
  }
  if(el.classList.contains('sitting')) return;
  if(S.chairs[i].opened) return;
  if(S.lidsOpen && !S.keyTaken && S.chairs[i].type!=='key' ) return;
  if(S.lidsOpen && S.keyTaken) return;
  // Sit!
  S.sits--; c.sat=true; updateHUD();
  el.classList.add('sitting'); sfx('creak');
  setTimeout(()=>{
    el.classList.remove('sitting');
    if(c.type==='key'){
      openLid(i, el);
      msg('Wait... you hear a <b>click</b> under the seat! The lid popped open! 👀');
    } else if(c.magic){
      sfx('boing');
      msg('✨ <b>WHOA!</b> A magic '+THEME.seatNoun+' — all the SCROLL lids popped open! (The key '+THEME.seatNoun+' stays shut... sneaky!)', 4000);
      openAllLids(true);
    } else {
      el.classList.add('dusty'); setTimeout(()=>el.classList.remove('dusty'),450);
      sfx('bad');
      if(Math.random()<.45) spook(el);
      if(S.sits<=0){ setTimeout(trap, 600); }
      else msg(DUSTY_LINES[Math.floor(Math.random()*DUSTY_LINES.length)] + ` <b>${S.sits} sit${S.sits===1?'':'s'} left!</b>`);
    }
  }, 800);
}

function trap(){
  sfx('net');
  $('#net').classList.add('show');
  $('#net-card p').innerHTML = THEME.netTrapMsg;
  const mesh=$('#net-mesh'); mesh.style.animation='none'; void mesh.offsetWidth; mesh.style.animation='';
}

/* ---------------- Room 1: door, note, portrait, secret ---------------- */
/* Backtracking — every unlocked door works both ways, so nothing (candle,
   brass key, pages, gems) is ever permanently missable mid-run. */
const BACK_MAP = {
  kitchen: { phase:'room1',   scene:'#s-room1',   ambient:'mansion' },
  library: { phase:'kitchen', scene:'#s-kitchen', ambient:'kitchen' },
  room2:   { phase:'library', scene:'#s-library', ambient:'library' },
};
function goBackRoom(){
  const b=BACK_MAP[S && S.phase]; if(!b) return;
  S.phase=b.phase; updateHUD();
  show(b.scene);
  if(window.Snd) Snd.ambient(b.ambient);
  sfx('creakopen');
  msg('⬅️ Back to the '+THEME.roomNames[b.phase]+'! Every door you opened stays open.');
}

function doorClick(){
  if(S.phase!=='room1') return;
  const d=$('#door1');
  if(S.door1Open){ sfx('creakopen'); enterKitchen(); return; }
  if(!S.key1){
    d.classList.add('shake'); setTimeout(()=>d.classList.remove('shake'),450);
    sfx('bad'); msg(THEME.door1LockedMsg);
    return;
  }
  if(S.lidsOpen && S.cluesFound.length<4){
    d.classList.add('shake'); setTimeout(()=>d.classList.remove('shake'),450);
    sfx('bad'); msg(THEME.doorSealedMsg, 4000);
    return;
  }
  if(!S.door1Open){
    msg('🔐 The key fits... but <b>number padlocks</b> guard the door too!', 2500);
    Puzzles.mathLock(
      {title:'🔐 The Number Padlocks', sub:'The old door has math locks.'},
      ()=>{
        S.door1Open=true; sfx('key'); sfx('creakopen'); updateHUD();
        $('#door1-lock').textContent='🔓';
        d.classList.add('open-anim');
        msg('🔓 <b>Click-clack!</b> Math power! The door creaks open...');
        setTimeout(()=>enterKitchen(), 1000);
      });
    return;
  }
}

function noteClick(){
  if(S.phase!=='room1') return;
  S.noteRead=true; updateHUD();
  showScroll('📌 A pinned note',
    'The key sleeps on the '+THEME.seatNoun+' the color of...<br><b>'+COLOR_RIDDLES[S.keyChairIdx]+'</b><em>Solve the color riddle, then sit on THAT '+THEME.seatNoun+'!</em>');
}

function portraitClick(){
  if(S.phase!=='room1') return;
  S.portraitTaps++;
  if(S.gems.includes('portrait')){
    sfx('ghost'); msg('🧐 “Only the GOLDEN scroll tells the truth,” the portrait whispers again.');
    return;
  }
  if(S.portraitTaps===1){ sfx('ghost'); msg('🧐 The portrait whispers... “Only the <b>GOLDEN scroll</b> tells the truth. Also... hee hee... I\u2019m ticklish.”', 4200); }
  else if(S.portraitTaps===2){ sfx('creak'); msg('🖼️ The portrait wiggles! “Hee hee! Stop! There\u2019s a — hee — SECRET back here!”'); }
  else {
    sfx('pop');
    $('#portrait').classList.add('swung');
    $('#secret-btn').classList.add('show');
    addGem('portrait','It was taped behind the ticklish portrait!');
    setTimeout(()=>msg('🔘 Wait... there\u2019s a <b>secret button</b> behind the portrait! Press it!', 4000), 1500);
  }
}

function enterSecret(){
  S.phase='secret'; updateHUD();
  show('#s-secret');
  sfx('creakopen');
  if(window.Snd) Snd.ambient('secret');
  if(window.mayaTrack) mayaTrack('er_secret_room',{room:'secret'});
  msg('🤫 A <b>SECRET ROOM!</b> Nobody has been in here for a hundred years...', 4000);
}

function chestClick(){
  if(S.phase!=='secret') return;
  const ch=$('#chest');
  if(!S.chestRattled){
    S.chestRattled=true;
    ch.classList.add('rattle'); setTimeout(()=>ch.classList.remove('rattle'),700);
    sfx('growl'); sfx('creak');
    msg(THEME.chestRattleMsg, 3500);
    return;
  }
  if(!S.chestOpen){
    S.chestOpen=true; ch.classList.add('open'); updateHUD();
    scareBats(ch); sfx('stinger');
    setTimeout(()=>{ sfx('magic'); addGem('chest','It was inside the rattling treasure chest!'); }, 700);
    const sup={text:'🌟 SUPER CLUE: The '+THEME.exitPropName+' key hides in the '+S.trueSpot.name.toUpperCase()+'!', true:true};
    if(!S.cluesFound.some(x=>x.text===sup.text)) S.cluesFound.push(sup);
    setTimeout(()=>{ updateHUD(); msg('📜 The chest also held a <b>GOLDEN SUPER CLUE!</b> Check your 📜 Clues — it will help later!', 4000); }, 2800);
    setTimeout(()=>addItem('teddy'), 7000);
  } else {
    msg('🧰 Empty now... except for a hundred years of dust. ACHOO! 🤧');
  }
}

/* ---------------- Kitchen ---------------- */
function enterKitchen(){
  S.phase='kitchen'; updateHUD();
  show('#s-kitchen');
  if(window.Snd) Snd.ambient('kitchen');
  msg(THEME.kitchenEnterMsg, 4500);
}
function candleClick(){
  if(S.phase!=='kitchen' || hasItem('candle')) return;
  const el=$('#kitchen-candle');
  el.classList.add('found');
  addItem('candle');
  $('#trapdoor').classList.add('found');
  setTimeout(()=>{ el.style.display='none'; }, 700);
  setTimeout(()=>msg('🕯️ Hmm... in the candlelight, one <b>floorboard</b> near the cauldron looks crooked... 👀', 4200), 4500);
}
function trapdoorClick(){
  if(S.phase!=='kitchen') return;
  const td=$('#trapdoor');
  td.classList.add('wiggle'); setTimeout(()=>td.classList.remove('wiggle'),450);
  if(!S.floorboardFound){
    S.floorboardFound=true;
    sfx('creak'); sfx('skitter');
    msg('🪵 This floorboard is <b>LOOSE!</b> Something skitters underneath... there’s a whole room down there!', 4200);
    if(!hasItem('candle')) setTimeout(()=>msg(THEME.cellarDarkMsg, 4500), 4400);
    return;
  }
  if(!hasItem('candle')){ sfx('bad'); msg(THEME.cellarDarkMsg, 4500); return; }
  enterCellar();
}

/* ---------------- Cellar (secret room #2) ---------------- */
function buildCellar(){
  const row=$('#cellar-floor'); row.innerHTML='';
  for(let i=0;i<3;i++){
    const el=document.createElement('div'); el.className='spot';
    el.innerHTML='<span class="s-emoji">📦</span><span class="s-label">Crate</span>';
    el.addEventListener('click',()=>crateClick(i,el));
    row.appendChild(el);
  }
  const pg=document.createElement('div'); pg.className='spot page-spot';
  pg.innerHTML='<span class="s-emoji">📜</span><span class="s-label">Old Page</span>';
  pg.addEventListener('click',()=>{ if(S.phase!=='cellar')return; addItem('page1',true); diaryPage(1); });
  row.appendChild(pg);
}
function enterCellar(){
  S.phase='cellar'; updateHUD();
  show('#s-cellar');
  sfx('creakopen');
  if(window.Snd) Snd.ambient('cellar');
  if(window.mayaTrack) mayaTrack('er_secret_room',{room:'cellar'});
  msg(THEME.cellarEnterMsg, 4500);
}
function crateClick(i, el){
  if(S.phase!=='cellar') return;
  if(i===S.mimicCrate && !S.gems.includes('cellar')){
    el.classList.add('mimic-rage');
    el.querySelector('.s-emoji').textContent='👁️📦👁️';
    sfx('screech'); sfx('growl'); scareKnock();
    setTimeout(scareFace, 350);
    setTimeout(()=>{
      el.classList.remove('mimic-rage');
      el.querySelector('.s-emoji').textContent='📦';
      msg(THEME.mimicMsg, 4200);
    }, 1300);
    setTimeout(()=>addGem('cellar','The mimic coughed it up! 😝'), 5600);
    return;
  }
  if(S.cratesOpened.includes(i)){ msg('📦 Just the same old stuff. The crate looks offended.'); return; }
  S.cratesOpened.push(i);
  el.classList.add('wiggle'); setTimeout(()=>el.classList.remove('wiggle'),450);
  sfx('creak');
  msg(THEME.crateLines[i%THEME.crateLines.length], 3800);
}
function furnaceClick(){
  if(S.phase!=='cellar') return;
  S.furnaceTaps++;
  sfx('heartbeat');
  if(S.furnaceTaps===1) msg(THEME.thumpExplainMsg, 4200);
  else msg('💤 '+THEME.furnace.name+' snores louder. <i>Thump... thump...</i> Sweet dreams, big guy.', 3200);
}
function cellarKeyClick(){
  if(S.phase!=='cellar' || hasItem('brasskey')) return;
  const el=$('#cellar-key');
  el.classList.add('found');
  addItem('brasskey');
  setTimeout(()=>{ el.style.display='none'; }, 800);
}
function cauldronClick(){
  if(S.phase!=='kitchen') return;
  if(S.potionDone){ msg(THEME.kitchenAlreadyDoneMsg); return; }
  Puzzles.potionMix(()=>{
    S.potionDone=true; sfx('magic'); updateHUD();
    $('#door-k-lock').textContent='🔓';
    msg(THEME.kitchenDoneMsg, 3500);
  });
}
function doorKClick(){
  if(S.phase!=='kitchen') return;
  const d=$('#door-k');
  if(!S.potionDone){
    d.classList.add('shake'); setTimeout(()=>d.classList.remove('shake'),450);
    sfx('bad'); msg(THEME.kitchenLockedMsg);
    return;
  }
  sfx('creakopen'); d.classList.add('open-anim');
  setTimeout(()=>enterLibrary(), 900);
}
function jarClick(){
  if(S.phase!=='kitchen' || S.gems.includes('jar')) return;
  S.jarTaps++;
  if(S.jarTaps===1){ sfx('pop'); msg('🫙 A sticky old jar... something <b>rattles</b> inside!'); }
  else if(S.jarTaps===2){ sfx('creak'); msg('🫙 The lid is turning... one more twist!'); }
  else addGem('jar','It was rattling inside the sticky jar!');
}

/* ---------------- Library ---------------- */
function buildLibrary(){
  const wall=$('#book-wall'); wall.innerHTML='';
  S.bookShelves.forEach((colors, sIdx)=>{
    const row=document.createElement('div'); row.className='shelfrow';
    colors.forEach(cIdx=>{
      const b=document.createElement('button'); b.className='bk';
      b.textContent=BOOK_EMOJI[cIdx];
      b.addEventListener('click',()=>bookClick(sIdx,cIdx,b));
      row.appendChild(b);
    });
    wall.appendChild(row);
  });
}
function hintAnimalRiddle(){
  const a = THEME.hintAnimal;
  return a.emoji+' “'+a.call+' The key sleeps behind the <b>'+BOOK_NAMES[S.bookTarget.color]+'</b> book on the <b>'+SHELF_NAMES[S.bookTarget.shelf]+'</b> shelf!”';
}
function owlClick(){
  if(S.phase!=='library') return;
  S.owlTaps++;
  sfx('hoot');
  if(S.owlTaps===3 && !S.gems.includes('owl')){
    addGem('owl', THEME.hintAnimal.foundGemLine);
    setTimeout(()=>msg(hintAnimalRiddle(), 4500), 4200);
    return;
  }
  msg(hintAnimalRiddle(), 4500);
}
function bookClick(sIdx,cIdx,b){
  if(S.phase!=='library') return;
  if(S.key3){ msg('📚 Just books now. Nice books. Spooky books.'); return; }
  if(sIdx===S.bookTarget.shelf && cIdx===S.bookTarget.color){
    S.key3=true; b.classList.add('gotkey'); sfx('key'); updateHUD();
    msg('🗝️ <b>CLINK!</b> A little key falls from behind the '+BOOK_NAMES[cIdx].toLowerCase()+' book! Now for the glowing book\u2019s spell...', 4000);
  } else {
    b.classList.add('wiggle'); setTimeout(()=>b.classList.remove('wiggle'),450);
    sfx('bad');
    if(Math.random()<.4) spook(b);
    msg(WRONG_BOOK_LINES[Math.floor(Math.random()*WRONG_BOOK_LINES.length)]);
  }
}
function enterLibrary(){
  S.phase='library'; updateHUD();
  show('#s-library');
  if(window.Snd) Snd.ambient('library');
  msg(THEME.libraryEnterMsg, 4500);
}
function leverClick(){
  if(S.phase!=='library') return;
  const lv=$('#lever-sconce');
  if(!S.leverPulled){
    S.leverPulled=true;
    lv.classList.add('pulled');
    sfx('creak'); sfx('growl'); scareKnock();
    setTimeout(()=>{
      $('#wall-crack').classList.add('show');
      sfx('magic');
      msg('🕯️ <b>CLUNK!</b> That sconce is a LEVER! A glowing <b>crack</b> opens in the wall... with a tiny brass keyhole! 🔑', 5000);
    }, 600);
    return;
  }
  sfx('creak'); msg('🕯️ The lever wiggles. The secret crack is already open! 👀');
}
function crackClick(){
  if(S.phase!=='library') return;
  const c=$('#wall-crack');
  if(!hasItem('brasskey')){
    c.classList.add('wiggle'); setTimeout(()=>c.classList.remove('wiggle'),450);
    sfx('bad');
    msg(THEME.atticLockedMsg, 4500);
    return;
  }
  enterAttic();
}

/* ---------------- Attic (secret room #3) ---------------- */
function enterAttic(){
  S.phase='attic'; updateHUD();
  show('#s-attic');
  sfx('creakopen'); sfx('wind');
  if(window.Snd) Snd.ambient('attic');
  if(window.mayaTrack) mayaTrack('er_secret_room',{room:'attic'});
  msg(THEME.atticEnterMsg, 4500);
}
function trunkClick(){
  if(S.phase!=='attic') return;
  const tr=$('#att-trunk');
  if(!S.trunkRattled){
    S.trunkRattled=true;
    tr.classList.add('rattle'); setTimeout(()=>tr.classList.remove('rattle'),700);
    sfx('growl'); sfx('musicbox');
    msg(THEME.trunkRattleMsg, 3500);
    return;
  }
  if(!S.trunkOpen){
    S.trunkOpen=true; tr.classList.add('open');
    scareBats(tr); sfx('stinger');
    setTimeout(()=>addItem('musicbox'), 700);
    return;
  }
  if(!S.trunkGemTaken){
    S.trunkGemTaken=true;
    addGem('attic','It was under the trunk’s velvet lining!');
    return;
  }
  msg('🧳 Just moth holes and memories now.');
}
function updateLibDoor(){
  if(S.key3 && S.wordDone) $('#door-l-lock').textContent='🔓';
}
function booksClick(){
  if(S.phase!=='library') return;
  if(S.wordDone){ msg('📖 The book purrs like a cat. Wait — books don\u2019t purr?! 🚪'); return; }
  Puzzles.wordSpell(()=>{
    S.wordDone=true; sfx('magic'); updateHUD(); updateLibDoor();
    msg(S.key3 ? '📖✨ <b>ZING!</b> The seal breaks — the door swings open! 🚪' : '📖✨ <b>ZING!</b> The seal breaks! Now find the key behind a book — ask the '+THEME.hintAnimal.name+'! '+THEME.hintAnimal.emoji, 4000);
  });
}
function doorLClick(){
  if(S.phase!=='library') return;
  const d=$('#door-l');
  if(!S.key3 || !S.wordDone){
    d.classList.add('shake'); setTimeout(()=>d.classList.remove('shake'),450);
    sfx('bad');
    if(!S.key3 && !S.wordDone) msg('🔒 Double-locked! It needs a <b>hidden key</b> (behind a book 📚) and the <b>magic word</b> (glowing book 📖)!', 4200);
    else if(!S.key3) msg('🔒 The magic seal is broken, but the keyhole is empty! A key hides behind ONE book — the '+THEME.hintAnimal.name+' '+THEME.hintAnimal.emoji+' knows!', 4200);
    else msg('🔒 You have the key, but a <b>magic seal</b> remains! Tap the glowing book 📖 and spell its word!', 4200);
    return;
  }
  sfx('creakopen'); d.classList.add('open-anim');
  setTimeout(()=>enterRoom2(), 900);
}

/* ---------------- Room 2 ---------------- */
function buildRoom2(){
  const floorBox=$('#r2-floor-items'), wallBox=$('#r2-wall-items');
  floorBox.innerHTML=''; wallBox.innerHTML='';
  const wallPos=[{left:'8%',top:'16%'},{right:'8%',top:'16%'}];
  let w=0, floorSpots=SPOTS.filter(s=>!s.wall), wallSpots=SPOTS.filter(s=>s.wall);
  wallSpots.forEach(sp=>{
    const el=document.createElement('div'); el.className='spot-wall'; 
    Object.assign(el.style, wallPos[w++ % wallPos.length]);
    el.innerHTML=`<span class="s-emoji">${sp.emoji}</span><span class="s-label">${sp.name}</span>`;
    el.addEventListener('click',()=>spotClick(sp,el));
    wallBox.appendChild(el);
  });
  floorSpots.forEach((sp)=>{
    const el=document.createElement('div'); el.className='spot';
    el.innerHTML=`<span class="s-emoji">${sp.emoji}</span><span class="s-label">${sp.name}</span>`;
    el.addEventListener('click',()=>spotClick(sp,el));
    floorBox.appendChild(el);
  });
}

function enterRoom2(){
  S.phase='room2'; updateHUD();
  show('#s-room2');
  if(window.Snd) Snd.ambient('mirrorroom');
  msg(THEME.room2EnterMsg, 4500);
}

function spotClick(sp, el){
  if(S.phase!=='room2' || S.key2) return;
  if(sp.id===S.trueSpot.id){
    if(!S.spotFound){
      S.spotFound=true; el.classList.add('found'); sfx('pop'); updateHUD();
      msg('👀 Something glitters in the '+sp.name.toLowerCase()+'... but a ghost grabs it! 👻 “Play my song and it\u2019s yours!”', 3000);
      setTimeout(()=>Puzzles.pianoSong(songWon, ghostHint), 1800);
    } else if(!S.songDone){
      Puzzles.pianoSong(songWon, ghostHint);
    }
  } else {
    el.classList.add('wiggle'); setTimeout(()=>el.classList.remove('wiggle'),450);
    sfx('bad');
    if(S.spotFound && !S.songDone){ ghostHint(); return; }
    if(Math.random()<.4) spook(el);
    msg(sp.fail);
  }
}

function ghostHint(){ msg('👻 “My sooong!” — tap the glowing '+S.trueSpot.name.toLowerCase()+' when you\u2019re ready to play the ghost\u2019s song again! 🎹', 3500); }

function songWon(){
  S.songDone=true; S.key2=true; updateHUD(); sfx('key');
  msg('🎶✨ The ghost claps! 👻 “Beautiful!” It drops the <b>'+THEME.exitPropName.toUpperCase()+' KEY!</b> Now unlock the '+THEME.exitPropName+'!', 4000);
}

function mirrorClick(){
  if(S.phase!=='room2') return;
  const m=$('#mirror');
  if(!S.key2){
    m.classList.add('wiggle'); sfx('bad');
    if(S.spotFound) msg('🔒 The ghost still has the '+THEME.exitPropName+' key! Tap the glowing '+S.trueSpot.name.toLowerCase()+' and play its song! 🎹', 4000);
    else msg('🔒 Locked with a tiny keyhole! ONE of your scrolls 📜 tells the truth about where the key hides...', 4000);
    setTimeout(()=>m.classList.remove('wiggle'),450);
    return;
  }
  if(!S.mirrorUnlocked){
    S.mirrorUnlocked=true;
    sfx('magic'); updateHUD();
    $('#m-keyhole').textContent='🔓';
    m.classList.add('unlocked');
    msg('🔓 The '+THEME.exitPropName+' <b>ripples like water...</b> Tap it again to step through!', 3500);
    return;
  }
  S.phase='entering';
  m.classList.add('enter-anim');
  setTimeout(()=>enterRoom3(), 900);
}

/* ---------------- Room 3 + win ---------------- */
function enterRoom3(){
  S.phase='room3'; updateHUD();
  show('#s-room3');
  if(window.Snd) Snd.ambient('mirror');
  const wall=$('#s-room3 .wall');
  wall.querySelectorAll('.sparkle').forEach(e=>e.remove());
  for(let i=0;i<14;i++){
    const sp=document.createElement('span'); sp.className='sparkle'; sp.textContent=['✨','⭐','💫'][i%3];
    sp.style.cssText=`left:${Math.random()*96}%;bottom:-20px;animation-duration:${4+Math.random()*4}s;animation-delay:${Math.random()*4}s`;
    wall.appendChild(sp);
  }
  sfx('magic');
}

function winGame(){
  S.phase='win'; S.elapsed=Date.now()-S.start;
  clearInterval(timerInt);
  $('#hud').classList.remove('show'); $('#goal').classList.remove('show'); $('#hint-ghost').classList.remove('show');
  show('#s-win');
  $('#win-sub').textContent = THEME.winSub;
  $('#win-time').textContent='⏱️ You escaped in '+fmt(S.elapsed)+'!';
  $('#win-gems').textContent='💎 Hidden gems found: '+S.gems.length+'/'+TOTAL_GEMS+(S.gems.length===TOTAL_GEMS?' — TREASURE MASTER!! 🏆':'');
  $('#win-items').textContent='🎒 Treasures collected: '+S.items.length+'/'+TOTAL_ITEMS+(S.diaryRead.length>=3?' — you know the WHOLE story! 📔':'');
  const best = Number(store.get('mayaEscapeBest')||0);
  if(!best || S.elapsed<best){
    store.set('mayaEscapeBest', String(S.elapsed));
    if(best) $('#win-time').textContent += ' 🏆 NEW BEST TIME!';
  }
  sfx('fanfare'); confetti(); setTimeout(confetti, 900);
  if(window.Snd) Snd.ambient(null);
  if(window.mayaGameEnd) mayaGameEnd({score:S.gems.length, outcome:'win', theme:THEME.id, items:S.items.length, seconds:Math.round(S.elapsed/1000)});
}

/* ---------------- Scroll modal ---------------- */
function showScroll(title, html, gold){
  sfx('paper');
  $('#scroll-paper').classList.toggle('gold', !!gold);
  $('#sp-title').innerHTML=title;
  $('#sp-body').innerHTML=html;
  $('#modal').classList.add('show');
}
$('#sp-close').addEventListener('click',()=>$('#modal').classList.remove('show'));
$('#modal').addEventListener('click',e=>{ if(e.target.id==='modal') $('#modal').classList.remove('show'); });

$('#clue-btn').addEventListener('click',()=>{
  const html = S.cluesFound.map(c=>`<div class="clue-item${c.true?' clue-gold':''}">📜 ${c.text.replace(/\n/g,'<br>')}</div>`).join('') || 'No clues yet!';
  showScroll('📜 Your scrolls', html + '<em>Careful... the sneaky scrolls LIE! 🤥</em>');
});

/* ---------------- Flow ---------------- */
function startGame(themeId){
  if(window.mayaGameStart)window.mayaGameStart({theme:themeId});
  applyTheme(themeId);
  setupRound();
  S.phase='room1';
  buildChairs(); buildRoom2(); buildLibrary();
  // reset visuals
  $('#door1').classList.remove('open-anim'); $('#door1-lock').textContent='🔒';
  $('#door-k').classList.remove('open-anim'); $('#door-k-lock').textContent='🔒';
  $('#door-l').classList.remove('open-anim'); $('#door-l-lock').textContent='🔒';
  $('#portrait').classList.remove('swung');
  $('#secret-btn').classList.remove('show');
  $('#chest').classList.remove('open');
  $('#trapdoor').classList.remove('found');
  $('#lever-sconce').classList.remove('pulled');
  $('#wall-crack').classList.remove('show');
  $('#att-trunk').classList.remove('open');
  const ck=$('#cellar-key'); ck.style.display=''; ck.classList.remove('found');
  const kc=$('#kitchen-candle'); kc.style.display=''; kc.classList.remove('found');
  buildCellar();
  const m=$('#mirror'); m.classList.remove('unlocked','enter-anim');
  $('#m-keyhole').textContent='🔒';
  $('#hud').classList.add('show'); $('#goal').classList.add('show'); $('#hint-ghost').classList.add('show');
  updateHUD(); startTimer(); $('#timer').textContent='0:00';
  if(window.Snd) Snd.ambient('mansion');
  show('#s-room1');
  msg(THEME.welcomeMsg, 4500);
}

function updateBestTimeDisplay(){
  const best=Number(store.get('mayaEscapeBest')||0);
  $('#best-time').textContent = best ? '🏆 Best escape: '+fmt(best) : '';
}

function backToPicker(){
  show('#s-title');
  updateBestTimeDisplay();
}

function buildThemePicker(){
  const box = $('#theme-picker'); box.innerHTML='';
  window.THEME_ORDER.forEach(id=>{
    const t = window.THEMES[id];
    const el = document.createElement('button');
    el.className='theme-card';
    el.innerHTML = `<span class="tc-icon">${t.icon}</span><span class="tc-name">${t.name}</span><span class="tc-teaser">${t.cardTeaser}</span>`;
    el.addEventListener('click', ()=>startGame(id));
    box.appendChild(el);
  });
}
buildThemePicker();
$('#surprise-btn').addEventListener('click', ()=>{
  const ids = window.THEME_ORDER;
  startGame(ids[Math.floor(Math.random()*ids.length)]);
});
$('#again-btn').addEventListener('click', backToPicker);
$('#retry-btn').addEventListener('click', ()=>{
  $('#net').classList.remove('show');
  startGame(THEME.id);
  msg('The net lets you go... this time. 😤 New round — everything moved! Only <b>3 sits!</b>', 4000);
});
$('#door1').addEventListener('click', doorClick);
$('#chair-note').addEventListener('click', noteClick);
$('#portrait').addEventListener('click', portraitClick);
$('#secret-btn').addEventListener('click', ()=>{ if(S.phase==='room1') enterSecret(); });
$('#secret-back').addEventListener('click', ()=>{ S.phase='room1'; updateHUD(); show('#s-room1'); if(window.Snd) Snd.ambient('mansion'); msg('Back to the '+THEME.roomNames.room1+'!'); });
$('#chest').addEventListener('click', chestClick);
$('#door-k').addEventListener('click', doorKClick);
$('#cauldron').addEventListener('click', cauldronClick);
$('#secret-jar').addEventListener('click', jarClick);
$('#door-l').addEventListener('click', doorLClick);
$('#magic-books').addEventListener('click', booksClick);
$('#owl').addEventListener('click', owlClick);
$('#storybook').addEventListener('click', ()=>{
  if(S.phase!=='library') return;
  sfx('paper');
  $('#bm-left').innerHTML=THEME.storybook.left;
  $('#bm-right').innerHTML=THEME.storybook.right;
  $('#bookmodal').classList.add('show');
});
function closeBook(){
  $('#bookmodal').classList.remove('show');
  if(S && S.diaryBonusPending){
    S.diaryBonusPending=false;
    msg(THEME.diaryDoneMsg, 4200);
    setTimeout(()=>addGem('diary','Reading the WHOLE story earned you this!'), 3200);
  }
}
$('#bm-close').addEventListener('click',closeBook);
$('#bookmodal').addEventListener('click',e=>{ if(e.target.id==='bookmodal') closeBook(); });
$('#mirror').addEventListener('click', mirrorClick);
$('#mghost').addEventListener('click', ()=>{
  if(S.phase==='room2' && $('#mghost').classList.contains('boo')) addGem('mghost','You tapped the ghost near the '+THEME.exitPropName+' mid-haunt! So brave!');
});
$('#float-chair').addEventListener('click', ()=>{ if(S.phase==='room3') addGem('floatchair','The upside-down floating chair was keeping it warm!'); });
$('#chandelier').addEventListener('click', ()=>{
  if(S.phase!=='room1') return;
  S.chandTaps++;
  if(S.gems.includes('chand')){ sfx('creak'); msg('🕯️ The chandelier sways... shadows dance on the walls. Spooky!'); return; }
  if(S.chandTaps===1){ sfx('creak'); msg('🕯️ The chandelier <b>sways</b>... something up there glints! Tap it again!'); }
  else { scareLightning(); addGem('chand','It was balanced up in the chandelier!'); }
});
$('#kitchen-candle').addEventListener('click', candleClick);
$('#trapdoor').addEventListener('click', trapdoorClick);
$('#furnace').addEventListener('click', furnaceClick);
$('#cellar-key').addEventListener('click', cellarKeyClick);
$('#cellar-back').addEventListener('click', ()=>{
  if(S.phase!=='cellar') return;
  S.phase='kitchen'; updateHUD(); show('#s-kitchen');
  if(window.Snd) Snd.ambient('kitchen');
  sfx('creakopen');
  msg('🪜 Back up to the '+THEME.roomNames.kitchen+'!');
});
$('#lever-sconce').addEventListener('click', leverClick);
$('#wall-crack').addEventListener('click', crackClick);
$('#att-trunk').addEventListener('click', trunkClick);
$('#attic-page').addEventListener('click', ()=>{ if(S.phase!=='attic')return; addItem('page2',true); diaryPage(2); });
$('#attic-back').addEventListener('click', ()=>{
  if(S.phase!=='attic') return;
  S.phase='library'; updateHUD(); show('#s-library');
  if(window.Snd) Snd.ambient('library');
  sfx('creakopen');
  msg('🪜 Back down to the '+THEME.roomNames.library+'!');
});
$('#fake-door').addEventListener('click', ()=>{
  if(S.phase!=='room2') return;
  const fd=$('#fake-door');
  fd.classList.add('wiggle'); setTimeout(()=>fd.classList.remove('wiggle'),450);
  if(!S.gems.includes('fakedoor')){
    sfx('cackle');
    msg('🖌️ This door is <b>PAINTED ON!</b> Who paints a door on a wall?! ...wait, something’s stuck in the paint!', 3400);
    setTimeout(()=>addGem('fakedoor','It was stuck in the wet paint of the prank door!'), 2400);
  } else {
    sfx('knock'); msg('🚪 Knock knock. Nobody home. Because it’s PAINT. 😆');
  }
});
$('#granny-portrait').addEventListener('click', ()=>{
  if(S.phase!=='secret') return;
  S.grannyTaps++;
  sfx('whisper');
  const lines=[
    '👵 The old portrait whispers... “The <b>toys</b> still squeak, dearie. Give them a poke.”',
    '👵 “The rocking chair rocks ALL BY ITSELF. Nobody knows why. I know why. Hee hee.”',
    '👵 “Read the old <b>pages</b>, dearie. Then the spooky sounds won’t be spooky anymore.”',
  ];
  msg(lines[(S.grannyTaps-1)%lines.length], 4200);
});
$('#toy-pile').addEventListener('click', ()=>{
  if(S.phase!=='secret') return;
  S.toyTaps++;
  if(S.toyTaps===1){ sfx('pop'); msg('🪆 SQUEAK! The old toys giggle. One winds itself up...'); }
  else {
    sfx('skitter');
    const f=document.createElement('span'); f.className='scurry'; f.textContent='🐭';
    $('#s-secret .floor').appendChild(f); setTimeout(()=>f.remove(),6000);
    msg('🐭 A wind-up mouse zooms across the floor! ZOOM!');
  }
});
$('#rock-chair').addEventListener('click', ()=>{
  if(S.phase!=='secret') return;
  sfx('creak');
  if(Math.random()<.35){ spook($('#rock-chair')); msg('🪑 The chair rocks FASTER... okay, WHO is rocking this chair?!', 3600); }
  else msg('🪑 It rocks all by itself. Creeeak... creeeak... Maybe a ghost is napping?', 3600);
});
$('#secret-page').addEventListener('click', ()=>{ if(S.phase!=='secret')return; addItem('page0',true); diaryPage(0); });
$('#satchel-btn').addEventListener('click', openSatchel);
$('#sat-close').addEventListener('click',()=>$('#satmodal').classList.remove('show'));
$('#satmodal').addEventListener('click',e=>{ if(e.target.id==='satmodal') $('#satmodal').classList.remove('show'); });
// moonlit windows: something howls outside...
$$('.m-window').forEach(w=>w.addEventListener('click', ()=>{
  if(!S || S.phase==='title' || S.phase==='win') return;
  if(S.phase==='room3'){ sfx('whistle'); msg('🪞 Backwards wind whistles past the backwards sun. Even the weather is confused here!'); return; }
  const i=S.moonTaps++ % 3;
  sfx(i===2 ? 'scratch' : 'wolfhowl');
  const lines=[
    '🌕 Awooooo... wolves howl at the moon, somewhere far away. 🐺',
    '🌕 The moon peeks through the clouds... something howls BACK. 🐺',
    '🌕 <i>Scratch scratch...</i> is something climbing the wall OUTSIDE?! 🐾',
  ];
  msg(lines[i], 3800);
}));
// things in the walls (tap an empty bit of wall)
$$('.wall').forEach(w=>w.addEventListener('click', e=>{
  if(e.target!==w || !S || S.phase==='title' || S.phase==='win') return;
  const n=(S.wallTaps[S.phase]||0)+1; S.wallTaps[S.phase]=n;
  if(n===1){ sfx('skitter'); msg('🐁 <i>skitter skitter...</i> Something small is running around INSIDE the wall!', 3400); }
  else if(n===2){ sfx('scratch'); msg('🐁 <i>scratch scratch...</i> It’s in the walls again! It sounds... fluffy?', 3400); }
}));
$('#exit-door').addEventListener('click', ()=>{
  if(S.exitOpen) return winGame();
  msg('🪞 The exit has one last <b>backwards puzzle...</b>', 2000);
  Puzzles.missingNumber(()=>{ S.exitOpen=true; winGame(); });
});

// back a room (only shows where a previous room exists)
$('#room-back').addEventListener('click', goBackRoom);

// hint ghost
$('#hint-ghost').addEventListener('click', ()=>{
  if(!S || S.phase==='title' || S.phase==='win') return;
  sfx('ghost');
  // alternate main hint / secret hint; re-taps always re-show (no refusing!)
  const n = S.hintUsed[S.phase]||0;
  S.hintUsed[S.phase]=n+1;
  msg('👻 '+(n%2===0 ? hintFor() : secretHintFor()), 6500);
});

// home button — always visible (not gated on portal detection), so there's
// always a way back to the Lab even if that detection fails on some device
$('#home-btn').addEventListener('click', ()=>{
  if(window.MayaPortal) MayaPortal.leaveToLab();
  else window.location.href = '../../index.html';
});

// mute button
const muteBtn=$('#mute-btn');
function syncMute(){ const m=!!(window.Snd&&Snd.muted); muteBtn.textContent=m?'🔇':'🔊'; muteBtn.classList.toggle('off',m); }
muteBtn.addEventListener('click',()=>{ if(!window.Snd) return; Snd.toggle(); syncMute(); if(!Snd.muted) sfx('pop'); });
syncMute();

// ambient decor: dust motes + flybys
(function(){
  [['#s-room1 .wall',10],['#s-room2 .wall',8]].forEach(([sel,n])=>{
    const w=$(sel);
    for(let i=0;i<n;i++){ const m=document.createElement('span'); m.className='mote';
      m.style.cssText=`left:${Math.random()*96}%;bottom:${Math.random()*30}%;animation-duration:${9+Math.random()*10}s;animation-delay:${Math.random()*9}s`;
      w.appendChild(m); }
  });
  (function fly(){
    setTimeout(()=>{
      const FLY={room1:['#s-room1 .wall','🦇'],kitchen:['#s-kitchen .floor','🐀'],library:['#s-library .wall','🦉'],room2:['#s-room2 .wall','👻'],secret:['#s-secret .floor','🐭'],cellar:['#s-cellar .floor','🐀'],attic:['#s-attic .wall','🦇']};
      if(S && FLY[S.phase]){
        const [sel,em]=FLY[S.phase];
        const wall=$(sel);
        const f=document.createElement('span');
        f.className = em==='🐀' ? 'scurry' : 'flyby';
        f.textContent = em;
        if(f.className==='flyby') f.style.top=(8+Math.random()*38)+'%';
        wall.appendChild(f); setTimeout(()=>f.remove(),9000);
      }
      fly();
    }, 9000+Math.random()*8000);
  })();
  // ⚡ storm: close thunder, distant rumbles, wolves, whistling wind
  (function storm(){
    setTimeout(()=>{
      if(S && S.phase!=='title' && S.phase!=='win'){
        const r=Math.random();
        if(r<.4){
          const L=$('#lightning'); L.classList.remove('flash'); void L.offsetWidth; L.classList.add('flash');
          sfx('thunder');
        } else if(r<.7) sfx('rumble');
        else if(r<.87) sfx('wolfhowl');
        else sfx('whistle');
      }
      storm();
    }, 14000+Math.random()*18000);
  })();
  // 🕷️ spider drops
  (function creep(){
    setTimeout(()=>{
      const sel={room1:'#s-room1 .wall',kitchen:'#s-kitchen .wall',library:'#s-library .wall',secret:'#s-secret .wall',cellar:'#s-cellar .wall',attic:'#s-attic .wall'}[S&&S.phase];
      if(sel){
        const sp=document.createElement('span'); sp.className='spiderdrop';
        sp.style.left=(15+Math.random()*70)+'%'; sp.textContent='🕷️';
        $(sel).appendChild(sp); setTimeout(()=>sp.remove(),6000);
      }
      creep();
    }, 14000+Math.random()*14000);
  })();
  // 👻 haunting the mirror glass
  (function haunt(){
    setTimeout(()=>{
      if(S && S.phase==='room2'){
        const g=$('#mghost'); g.classList.remove('boo'); void g.offsetWidth; g.classList.add('boo');
        sfx('ghost');
      }
      haunt();
    }, 12000+Math.random()*14000);
  })();
})();

// show best time on title
updateBestTimeDisplay();
})();
