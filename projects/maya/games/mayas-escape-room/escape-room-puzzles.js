/* Maya's Escape Room — puzzle mini-games (harder edition) */
(function(){
'use strict';
const $p = s => document.querySelector(s);

/* Build the puzzle modal once */
const overlay = document.createElement('div');
overlay.id = 'puzzle-overlay';
overlay.innerHTML = '<div id="puzzle-card"></div>';
document.body.appendChild(overlay);
const card = $p('#puzzle-card');

const style = document.createElement('style');
style.textContent = `
#puzzle-overlay{position:fixed;inset:0;background:rgba(6,4,10,.8);z-index:85;display:none;align-items:center;justify-content:center;padding:16px}
#puzzle-overlay.show{display:flex}
#puzzle-card{background:rgba(20,13,34,.98);border:1px solid rgba(199,125,255,.4);border-radius:20px;padding:22px 20px;max-width:420px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.7);animation:scrollin .35s cubic-bezier(.34,1.56,.64,1)}
.pz-title{font-family:'Fredoka One',cursive;font-size:20px;color:#ffb347;margin-bottom:4px}
.pz-sub{font-size:13px;color:rgba(240,230,255,.6);line-height:1.5;margin-bottom:14px}
.pz-eq{font-family:'Fredoka One',cursive;font-size:36px;color:#f0e6ff;margin:8px 0 14px;letter-spacing:.05em}
.pz-eq .pz-ans{display:inline-block;min-width:56px;border-bottom:4px solid #ffe14d;color:#ffe14d}
.pz-pad{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:320px;margin:0 auto}
.pz-pad button{font-family:'Fredoka One',cursive;font-size:20px;padding:10px 0;min-height:48px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.07);color:#f0e6ff;cursor:pointer;transition:transform .1s,background .15s}
.pz-pad button:hover{background:rgba(199,125,255,.25)}
.pz-pad button:active{transform:scale(.92)}
#puzzle-card.pz-wrong{animation:pzshake .4s}
@keyframes pzshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}50%{transform:translateX(8px)}75%{transform:translateX(-5px)}}
.pz-piano{display:flex;justify-content:center;gap:6px;margin:12px 0}
.pz-piano button{width:52px;height:96px;min-height:96px;border-radius:0 0 10px 10px;border:2px solid rgba(0,0,0,.5);cursor:pointer;font-size:20px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;background:#f0e6ff;transition:transform .08s,filter .1s}
.pz-piano button:active{transform:translateY(3px)}
.pz-piano button.lit{filter:brightness(1.15);transform:translateY(3px);box-shadow:0 0 24px var(--pk)}
.pz-dots{display:flex;justify-content:center;gap:8px;margin-bottom:6px;min-height:18px}
.pz-dots span{width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.15)}
.pz-dots span.hit{background:#5dffb0}
.pz-listen{font-size:13px;font-weight:900;color:#c77dff;min-height:20px;margin-bottom:4px}
.pz-close{margin-top:14px;background:none;border:none;color:rgba(240,230,255,.45);font-size:12px;font-weight:900;cursor:pointer;padding:10px;min-height:44px}
.pz-recipe{font-size:30px;margin:4px 0 10px;letter-spacing:4px;color:#f0e6ff;min-height:40px}
.pz-recipe.pz-hidden{font-size:22px;color:rgba(240,230,255,.5)}
.pz-blanks{display:flex;gap:6px;justify-content:center;margin:8px 0 14px;flex-wrap:wrap}
.pz-blanks span{width:34px;height:46px;border-bottom:4px solid #ffe14d;font-family:'Fredoka One',cursive;font-size:26px;color:#ffe14d;display:flex;align-items:center;justify-content:center}
.pz-pad.pz-ing{grid-template-columns:repeat(3,1fr)}
.pz-pad.pz-ing button{font-size:26px}
.pz-pad button:disabled{opacity:.25;cursor:default}
`;
document.head.appendChild(style);

function openCard(html){ card.innerHTML = html; overlay.classList.add('show'); }
function closeCard(){ overlay.classList.remove('show'); }
function wrong(){ card.classList.remove('pz-wrong'); void card.offsetWidth; card.classList.add('pz-wrong'); }

/* piano note player — uses the shared Snd engine when present */
function note(freq, dur=0.45){
  if(window.Snd){ Snd.note(freq, dur); return; }
}
function snd(k){ if(window.Snd) Snd.play(k); }

function rnd(n){ return Math.floor(Math.random()*n); }

/* number pad that ALWAYS contains the answer + close distractors */
function makePad(pad, ans, onPick){
  const opts=new Set([ans]);
  while(opts.size<10){
    const d=Math.max(0, ans-7+rnd(15));
    opts.add(d);
  }
  [...opts].sort(()=>Math.random()-.5).forEach(n=>{
    const bt=document.createElement('button'); bt.textContent=n;
    bt.addEventListener('click',()=>onPick(n, bt));
    pad.appendChild(bt);
  });
}

function makeQuestion(){
  if(Math.random()<.5){
    const a=3+rnd(10), b=2+rnd(8);
    return {q:`${a} + ${b}`, ans:a+b};
  }
  const big=6+rnd(12), sub=2+rnd(Math.min(big-1,9));
  return {q:`${big} − ${sub}`, ans:big-sub};
}

/* ---------- 1. Math padlock (2 questions in a row!) ---------- */
function mathLock(opts, onWin){
  const ROUNDS=2;
  let round=0;
  openCard(`
    <div class="pz-title">${opts.title}</div>
    <div class="pz-sub">${opts.sub} <b>Two locks — two answers!</b></div>
    <div class="pz-dots" id="pz-dots">${'<span></span>'.repeat(ROUNDS)}</div>
    <div class="pz-eq"><span id="pz-q"></span> = <span class="pz-ans" id="pz-ans">?</span></div>
    <div class="pz-pad" id="pz-pad"></div>
    <button class="pz-close" id="pz-x">Run away 🏃‍♀️</button>`);
  const pad=$p('#pz-pad');
  let cur;
  function nextQ(){
    cur=makeQuestion();
    $p('#pz-q').textContent=cur.q;
    $p('#pz-ans').textContent='?';
    pad.innerHTML='';
    makePad(pad, cur.ans, (n)=>{
      $p('#pz-ans').textContent=n;
      if(n===cur.ans){
        snd('pop');
        $p('#pz-dots').children[round].classList.add('hit');
        round++;
        if(round===ROUNDS){ setTimeout(()=>{ closeCard(); onWin(); },400); }
        else setTimeout(nextQ, 500);
      } else {
        wrong(); note(160,.3);
        setTimeout(()=>$p('#pz-ans').textContent='?', 500);
      }
    });
  }
  nextQ();
  $p('#pz-x').addEventListener('click', closeCard);
}

/* ---------- 2. Piano song (5 notes!) ---------- */
const KEYS = [
  {label:'🔴', color:'#ff6e6e', freq:262},
  {label:'🟡', color:'#ffe14d', freq:330},
  {label:'🟢', color:'#5dffb0', freq:392},
  {label:'🔵', color:'#5bc8ff', freq:523},
];
function pianoSong(onWin, onClose){
  const seq = [...Array(5)].map(()=>rnd(4));
  let step = 0, locked = true;
  openCard(`
    <div class="pz-title">🎹 The Ghost's Song</div>
    <div class="pz-sub">The piano plays a little song... play it back on the colored keys!</div>
    <div class="pz-dots" id="pz-dots">${seq.map(()=>'<span></span>').join('')}</div>
    <div class="pz-listen" id="pz-listen">👂 Listen...</div>
    <div class="pz-piano" id="pz-piano"></div>
    <button class="pz-close" id="pz-x">Run away 🏃‍♀️</button>`);
  const pianoBox = $p('#pz-piano');
  const btns = KEYS.map((k,i)=>{
    const bt = document.createElement('button');
    bt.textContent = k.label;
    bt.style.setProperty('--pk', k.color);
    bt.style.background = k.color;
    bt.addEventListener('click', ()=>{
      if(locked) return;
      light(i); note(k.freq);
      if(i===seq[step]){
        $p('#pz-dots').children[step].classList.add('hit');
        step++;
        if(step===seq.length){ locked=true; setTimeout(()=>{ closeCard(); onWin(); }, 600); }
      } else {
        wrong(); note(130,.4); step=0; locked=true;
        [...$p('#pz-dots').children].forEach(d=>d.classList.remove('hit'));
        $p('#pz-listen').textContent='🙈 Oops! Listen again...';
        setTimeout(play, 900);
      }
    });
    pianoBox.appendChild(bt);
    return bt;
  });
  function light(i){ btns[i].classList.add('lit'); setTimeout(()=>btns[i].classList.remove('lit'), 300); }
  function play(){
    locked = true; step = 0;
    [...$p('#pz-dots').children].forEach(d=>d.classList.remove('hit'));
    $p('#pz-listen').textContent='👂 Listen...';
    seq.forEach((k,idx)=>setTimeout(()=>{ light(k); note(KEYS[k].freq); }, 600+idx*520));
    setTimeout(()=>{ locked=false; $p('#pz-listen').textContent='🎵 Your turn!'; }, 600+seq.length*520);
  }
  $p('#pz-x').addEventListener('click', ()=>{ closeCard(); if(onClose) onClose(); });
  play();
}

/* ---------- 3. Missing number (mirror puzzle, bigger numbers) ---------- */
function missingNumber(onWin){
  const ans = 3+rnd(10), b = 2+rnd(8);
  const plus = Math.random()<.6;
  const eq = plus ? `+ ${b} = ${ans+b}` : `− ${b} = ${Math.max(ans-b,1)===ans-b&&ans>b?ans-b:(ans+b)-b}`;
  // keep subtraction safe: blank − b = ans-b requires ans>b
  let text, answer;
  if(plus){ text=`+ ${b} = ${ans+b}`; answer=ans; }
  else { const big=ans+b; text=`− ${b} = ${big-b}`; answer=big; }
  openCard(`
    <div class="pz-title">🪞 The Backwards Lock</div>
    <div class="pz-sub">In the mirror world, the number is MISSING from the start! What goes in the blank?</div>
    <div class="pz-eq"><span class="pz-ans" id="pz-ans">?</span> ${text}</div>
    <div class="pz-pad" id="pz-pad"></div>
    <button class="pz-close" id="pz-x">Run away 🏃‍♀️</button>`);
  makePad($p('#pz-pad'), answer, (n)=>{
    $p('#pz-ans').textContent=n;
    if(n===answer){ snd('pop'); setTimeout(()=>{ closeCard(); onWin(); }, 350); }
    else { wrong(); note(160,.3); setTimeout(()=>$p('#pz-ans').textContent='?', 500); }
  });
  $p('#pz-x').addEventListener('click', closeCard);
}

/* ---------- 4. Potion mixing (4 steps + the recipe FADES!) ---------- */
function potionMix(onWin){
  const ING=['🦴','🕷️','🌙','⭐','🍄','🐸'];
  const order=[...ING.keys()].sort(()=>Math.random()-.5).slice(0,4);
  const recipeHTML=order.map(i=>ING[i]).join(' ➜ ');
  let step=0, hideTimer=null;
  openCard(`
    <div class="pz-title">⚗️ Goo-B-Gone Potion</div>
    <div class="pz-sub">Memorize the recipe — the magic ink fades away! Toss the ingredients in EXACTLY this order:</div>
    <div class="pz-recipe" id="pz-recipe">${recipeHTML}</div>
    <div class="pz-dots" id="pz-dots">${order.map(()=>'<span></span>').join('')}</div>
    <div class="pz-pad pz-ing" id="pz-pad"></div>
    <button class="pz-close" id="pz-x">Run away 🏃‍♀️</button>`);
  const rec=$p('#pz-recipe');
  function hideRecipe(){ rec.classList.add('pz-hidden'); rec.textContent='❓ ➜ ❓ ➜ ❓ ➜ ❓  ...remember!'; }
  function showRecipe(ms){
    clearTimeout(hideTimer);
    rec.classList.remove('pz-hidden'); rec.innerHTML=recipeHTML;
    hideTimer=setTimeout(hideRecipe, ms);
  }
  showRecipe(4500);
  const pad=$p('#pz-pad');
  ING.forEach((em,i)=>{
    const bt=document.createElement('button'); bt.textContent=em;
    bt.addEventListener('click',()=>{
      if(i===order[step]){
        snd('splash');
        $p('#pz-dots').children[step].classList.add('hit');
        step++;
        if(step===order.length){ clearTimeout(hideTimer); setTimeout(()=>{ closeCard(); onWin(); },500); }
      } else {
        wrong(); snd('poof');
        step=0; [...$p('#pz-dots').children].forEach(d=>d.classList.remove('hit'));
        showRecipe(2500);
      }
    });
    pad.appendChild(bt);
  });
  $p('#pz-x').addEventListener('click', ()=>{ clearTimeout(hideTimer); closeCard(); });
}

/* ---------- 5. Backwards word spell (longer words + trick letters!) ---------- */
function wordSpell(onWin){
  const WORDS=['SPOOKY','POTION','MIRROR','ESCAPE','HAUNTED','PUMPKIN','LANTERN','SPIDER'];
  const word=WORDS[rnd(WORDS.length)];
  const back=word.split('').reverse().join('');
  const AZ='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const tiles=word.split('').concat([AZ[rnd(26)],AZ[rnd(26)]]).sort(()=>Math.random()-.5);
  let step=0;
  openCard(`
    <div class="pz-title">📖 The Backwards Spell</div>
    <div class="pz-sub">The book writes its magic word BACKWARDS:<br><b style="font-size:22px;letter-spacing:4px">${back}</b><br>Tap the letters to spell it the RIGHT way round — but 2 letters are TRICKS!</div>
    <div class="pz-blanks" id="pz-blanks">${word.split('').map(()=>'<span></span>').join('')}</div>
    <div class="pz-pad" id="pz-pad"></div>
    <button class="pz-close" id="pz-x">Run away 🏃‍♀️</button>`);
  const pad=$p('#pz-pad');
  tiles.forEach(ch=>{
    const bt=document.createElement('button'); bt.textContent=ch;
    bt.addEventListener('click',()=>{
      if(bt.disabled) return;
      if(ch===word[step]){
        snd('pop');
        $p('#pz-blanks').children[step].textContent=ch;
        bt.disabled=true; step++;
        if(step===word.length) setTimeout(()=>{ closeCard(); onWin(); },500);
      } else {
        wrong(); note(160,.3);
      }
    });
    pad.appendChild(bt);
  });
  $p('#pz-x').addEventListener('click', closeCard);
}

window.Puzzles = { mathLock, pianoSong, missingNumber, potionMix, wordSpell, closeCard };
})();
