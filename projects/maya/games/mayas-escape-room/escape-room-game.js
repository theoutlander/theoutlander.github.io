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
const TOTAL_GEMS = 6;

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
    noteRead:false, chestOpen:false, hintUsed:{},
    bookShelves:[], bookTarget:{shelf:0,color:0},
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

/* ---------------- Spooks (wrong moves!) ---------------- */
function spook(el){
  const kind=Math.floor(Math.random()*3);
  if(kind===0){
    const g=$('#big-ghost'); g.classList.remove('swoop'); void g.offsetWidth; g.classList.add('swoop');
    sfx('ghost');
  } else if(kind===1 && el){
    const r=el.getBoundingClientRect();
    sfx('screech');
    for(let i=0;i<3;i++){
      const b=document.createElement('span'); b.className='batburst'; b.textContent='🦇';
      b.style.left=(r.left+r.width/2)+'px'; b.style.top=(r.top+r.height/2)+'px';
      b.style.setProperty('--dx',(Math.random()*260-130)+'px');
      b.style.setProperty('--dy',(-60-Math.random()*180)+'px');
      document.body.appendChild(b); setTimeout(()=>b.remove(),1200);
    }
  } else {
    const L=$('#lightning'); L.classList.remove('flash'); void L.offsetWidth; L.classList.add('flash');
    sfx('thunder');
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
  if(S.phase==='secret') return S.chestOpen ? 'Take the back door when you\u2019re done exploring! 🚪' : 'A treasure chest! Open it!';
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
  if(p==='secret') return '“Open the chest, silly! Treasure doesn\u2019t open itself! 🤫”';
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
  return '“Hee hee... I\u2019ve got nothing. You\u2019re on your own, brave one!”';
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
function doorClick(){
  if(S.phase!=='room1') return;
  const d=$('#door1');
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
  msg('🤫 A <b>SECRET ROOM!</b> Nobody has been in here for a hundred years...', 4000);
}

function chestClick(){
  if(S.phase!=='secret') return;
  const ch=$('#chest');
  if(!S.chestOpen){
    S.chestOpen=true; ch.classList.add('open'); sfx('magic'); updateHUD();
    addGem('chest','It was inside the treasure chest!');
    const sup={text:'🌟 SUPER CLUE: The '+THEME.exitPropName+' key hides in the '+S.trueSpot.name.toUpperCase()+'!', true:true};
    if(!S.cluesFound.some(x=>x.text===sup.text)) S.cluesFound.push(sup);
    setTimeout(()=>{ updateHUD(); msg('📜 The chest also held a <b>GOLDEN SUPER CLUE!</b> Check your 📜 Clues — it\u2019ll help later!', 4500); }, 2000);
  } else {
    msg('🧰 Empty now... except for a hundred years of dust. ACHOO! 🤧');
  }
}

/* ---------------- Kitchen ---------------- */
function enterKitchen(){
  S.phase='kitchen'; updateHUD();
  show('#s-kitchen');
  msg(THEME.kitchenEnterMsg, 4500);
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
  msg(THEME.libraryEnterMsg, 4500);
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
  const best = Number(localStorage.getItem('mayaEscapeBest')||0);
  if(!best || S.elapsed<best){
    localStorage.setItem('mayaEscapeBest', String(S.elapsed));
    if(best) $('#win-time').textContent += ' 🏆 NEW BEST TIME!';
  }
  sfx('fanfare'); confetti(); setTimeout(confetti, 900);
  if(window.Snd) Snd.ambient(null);
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
  const m=$('#mirror'); m.classList.remove('unlocked','enter-anim');
  $('#m-keyhole').textContent='🔒';
  $('#hud').classList.add('show'); $('#goal').classList.add('show'); $('#hint-ghost').classList.add('show');
  updateHUD(); startTimer(); $('#timer').textContent='0:00';
  if(window.Snd) Snd.ambient('mansion');
  show('#s-room1');
  msg(THEME.welcomeMsg, 4500);
}

function updateBestTimeDisplay(){
  const best=Number(localStorage.getItem('mayaEscapeBest')||0);
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
$('#secret-back').addEventListener('click', ()=>{ S.phase='room1'; updateHUD(); show('#s-room1'); msg('Back to the '+THEME.roomNames.room1+'!'); });
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
  $('#bm-left').innerHTML='<h3>The Ticklish Portrait</h3><span class="cap">O</span>nce upon a spooky night, a little ghost named <b>Lottie</b> lived in a grand old mansion. Her favorite game was hiding shiny treasures where nobody would ever look — and her BEST hiding place was behind the grumpy old <b>portrait</b> in the Chair Parlor.<span class="pnum">— 1 —</span>';
  $('#bm-right').innerHTML='<h3>&nbsp;</h3>But the portrait had a secret: it was <b>terribly ticklish</b>. One tickle — a wiggle. Two tickles — a giggle. <b>THREE tickles</b> — and it swung wide open with a great big “HEE HEE!”, showing a little red button... and a room nobody had seen for a hundred years. <b>The End</b> 🌙<span class="pnum">— 2 —</span>';
  $('#bookmodal').classList.add('show');
});
$('#bm-close').addEventListener('click',()=>$('#bookmodal').classList.remove('show'));
$('#bookmodal').addEventListener('click',e=>{ if(e.target.id==='bookmodal') $('#bookmodal').classList.remove('show'); });
$('#mirror').addEventListener('click', mirrorClick);
$('#mghost').addEventListener('click', ()=>{
  if(S.phase==='room2' && $('#mghost').classList.contains('boo')) addGem('mghost','You tapped the ghost near the '+THEME.exitPropName+' mid-haunt! So brave!');
});
$('#float-chair').addEventListener('click', ()=>{ if(S.phase==='room3') addGem('floatchair','The upside-down floating chair was keeping it warm!'); });
$('#exit-door').addEventListener('click', ()=>{
  if(S.exitOpen) return winGame();
  msg('🪞 The exit has one last <b>backwards puzzle...</b>', 2000);
  Puzzles.missingNumber(()=>{ S.exitOpen=true; winGame(); });
});

// hint ghost
$('#hint-ghost').addEventListener('click', ()=>{
  if(!S || S.phase==='title' || S.phase==='win') return;
  sfx('ghost');
  if(S.hintUsed[S.phase]){
    msg('👻 “Hee hee — I already helped you in this room! You can do it!” 💜', 3000);
    return;
  }
  S.hintUsed[S.phase]=true;
  msg('👻 '+hintFor(), 5000);
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
      const FLY={room1:['#s-room1 .wall','🦇'],kitchen:['#s-kitchen .floor','🐀'],library:['#s-library .wall','🦉'],room2:['#s-room2 .wall','👻']};
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
  // ⚡ lightning + thunder
  (function storm(){
    setTimeout(()=>{
      if(S && S.phase!=='title' && S.phase!=='win'){
        const L=$('#lightning'); L.classList.remove('flash'); void L.offsetWidth; L.classList.add('flash');
        sfx('thunder');
      }
      storm();
    }, 25000+Math.random()*25000);
  })();
  // 🕷️ spider drops
  (function creep(){
    setTimeout(()=>{
      const sel={room1:'#s-room1 .wall',kitchen:'#s-kitchen .wall',library:'#s-library .wall'}[S&&S.phase];
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
