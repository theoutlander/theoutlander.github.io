/* Maya's Escape Room — sound engine (WebAudio, no files needed) */
(function(){
'use strict';
/* Guarded storage — iPad Safari THROWS on any localStorage access when site
   data is blocked; a bare read here would kill this whole file (no sound). */
const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} },
};
let AC=null, master=null, ambGain=null, ambTimer=null, ambNodes=[];
let muted = store.get('mayaEscapeMuted')==='1';

function ctx(){
  if (window.MayaIOSAudioUnlock) window.MayaIOSAudioUnlock.unlock();
  if(!AC){
    AC = new (window.AudioContext||window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = muted?0:0.55; master.connect(AC.destination);
    ambGain = AC.createGain(); ambGain.gain.value = 1; ambGain.connect(master);
  }
  if(AC.state==='suspended') AC.resume();
  return AC;
}
function noiseBuf(){
  const a=ctx(), b=a.createBuffer(1, a.sampleRate*1.2, a.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  return b;
}
let NB=null;
function osc(type,f0,f1,t0,dur,vol,dest){
  const a=ctx(), o=a.createOscillator(), g=a.createGain();
  o.type=type; o.frequency.setValueAtTime(f0,t0);
  if(f1) o.frequency.exponentialRampToValueAtTime(Math.max(f1,1),t0+dur);
  g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  o.connect(g); g.connect(dest||master); o.start(t0); o.stop(t0+dur+.05);
  return o;
}
function whoosh(t0,dur,vol,fc0,fc1,dest){
  const a=ctx(); NB=NB||noiseBuf();
  const s=a.createBufferSource(); s.buffer=NB; s.loop=true;
  const f=a.createBiquadFilter(); f.type='bandpass'; f.Q.value=1.2;
  f.frequency.setValueAtTime(fc0,t0); f.frequency.exponentialRampToValueAtTime(fc1,t0+dur);
  const g=a.createGain(); g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  s.connect(f); f.connect(g); g.connect(dest||master); s.start(t0); s.stop(t0+dur+.05);
}

/* musical note with soft harmonic — used by piano too */
function note(freq,dur=0.45,vol=0.16){
  const a=ctx(), t=a.currentTime;
  osc('triangle',freq,0,t,dur,vol);
  osc('sine',freq*2,0,t,dur*.6,vol*.25);
}

const P5=[523,587,659,784,880,1047,1175,1319]; // C major-ish pentatonic-y

const FX={
  pop(){ const t=ctx().currentTime; osc('triangle',420,900,t,.14,.14); },
  thump(){ const t=ctx().currentTime; osc('sine',100,45,t,.22,.3); whoosh(t,.15,.06,300,120); },
  creak(){ const t=ctx().currentTime; const o=osc('sawtooth',150,70,t,.5,.05);
    o.frequency.setValueAtTime(150,t); o.frequency.linearRampToValueAtTime(95,t+.2); o.frequency.linearRampToValueAtTime(120,t+.32); o.frequency.linearRampToValueAtTime(60,t+.5); },
  creakopen(){ const t=ctx().currentTime; const o=osc('sawtooth',90,0,t,1.1,.045);
    o.frequency.setValueAtTime(90,t); o.frequency.linearRampToValueAtTime(140,t+.4); o.frequency.linearRampToValueAtTime(70,t+.75); o.frequency.linearRampToValueAtTime(110,t+1.05);
    whoosh(t+.1,.9,.03,200,500); },
  key(){ const t=ctx().currentTime; [1568,1976,2349,2637].forEach((f,i)=>osc('triangle',f,0,t+i*.06,.18,.09)); whoosh(t,.1,.04,3000,5000); },
  bad(){ const t=ctx().currentTime; osc('sawtooth',200,110,t,.3,.09); osc('sawtooth',150,80,t+.05,.3,.07); },
  boing(){ const t=ctx().currentTime; const o=osc('triangle',260,0,t,.5,.16);
    o.frequency.setValueAtTime(260,t); o.frequency.linearRampToValueAtTime(80,t+.12); o.frequency.linearRampToValueAtTime(180,t+.24); o.frequency.linearRampToValueAtTime(70,t+.4); },
  paper(){ const t=ctx().currentTime; whoosh(t,.28,.10,1200,2600); whoosh(t+.12,.2,.07,2000,900); },
  net(){ const t=ctx().currentTime; whoosh(t,.5,.16,1400,200); osc('triangle',300,80,t+.35,.3,.14); FX.giggle(t+.7); },
  giggle(at){ const a=ctx(), t=at||a.currentTime; [660,784,880,784,988].forEach((f,i)=>osc('sine',f,f*1.06,t+i*.09,.09,.07)); },
  ghost(){ const a=ctx(), t=a.currentTime; const o=a.createOscillator(),g=a.createGain(),l=a.createOscillator(),lg=a.createGain();
    o.type='sine'; o.frequency.setValueAtTime(440,t); o.frequency.linearRampToValueAtTime(330,t+1.2);
    l.frequency.value=5.5; lg.gain.value=18; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.06,t+.25); g.gain.linearRampToValueAtTime(.0001,t+1.3);
    o.connect(g); g.connect(master); o.start(t); l.start(t); o.stop(t+1.35); l.stop(t+1.35); },
  win(){ const t=ctx().currentTime; P5.slice(0,6).forEach((f,i)=>osc('triangle',f,0,t+i*.07,.3,.1)); whoosh(t,.5,.05,2000,6000); },
  magic(){ const t=ctx().currentTime; [523,659,784,1047,1319,1568].forEach((f,i)=>{osc('triangle',f,0,t+i*.09,.5,.09); osc('sine',f*2,0,t+i*.09,.3,.04);}); },
  fanfare(){ const a=ctx(), t=a.currentTime;
    const mel=[[523,.0,.22],[523,.18,.22],[659,.36,.22],[784,.54,.3],[659,.86,.18],[784,1.02,.55],[1047,1.35,.8]];
    mel.forEach(([f,at,d])=>{ osc('square',f,0,t+at,d,.055); osc('triangle',f,0,t+at,d,.12); osc('sine',f*2,0,t+at,d*.7,.04); });
    whoosh(t+1.35,.8,.06,3000,7000); },
  twinkle(){ const t=ctx().currentTime; const f=P5[4+Math.floor(Math.random()*4)]||1047; osc('sine',f,0,t,.6,.045); osc('sine',f*2.02,0,t,.4,.02); },
  splash(){ const t=ctx().currentTime; whoosh(t,.25,.14,600,2400); osc('sine',300,900,t,.18,.1); },
  poof(){ const t=ctx().currentTime; whoosh(t,.35,.16,900,150); osc('sawtooth',180,60,t,.3,.06); },
  hoot(){ const t=ctx().currentTime; osc('sine',520,392,t,.25,.12); osc('sine',494,370,t+.3,.35,.12); },
  thunder(){ const t=ctx().currentTime; whoosh(t,1.8,.14,140,50); osc('sine',52,28,t,1.6,.16); osc('sine',40,25,t+.4,1.2,.1); },
  gem(){ const t=ctx().currentTime; [880,1175,1568,2093].forEach((f,i)=>osc('triangle',f,0,t+i*.07,.3,.1)); whoosh(t,.35,.04,3000,7000); },
  screech(){ const t=ctx().currentTime; osc('sawtooth',1900,900,t,.18,.055); osc('sawtooth',1600,700,t+.12,.2,.05); },
  distantcreak(){ const t=ctx().currentTime; const o=osc('sawtooth',60+Math.random()*40,0,t,.9,.018);
    o.frequency.linearRampToValueAtTime(50+Math.random()*30,t+.9); },
  /* --- deluxe scary (but friendly) pack --- */
  knock(){ const t=ctx().currentTime; [0,.32,.64].forEach(at=>{ osc('sine',130,55,t+at,.16,.24); whoosh(t+at,.08,.07,400,150); }); },
  heartbeat(){ const t=ctx().currentTime; osc('sine',70,38,t,.22,.2); osc('sine',62,34,t+.32,.28,.15); },
  drip(){ const t=ctx().currentTime; osc('sine',1400,320,t,.12,.07); osc('sine',900,2200,t+.14,.1,.03); },
  wind(){ const a=ctx(), t=a.currentTime; NB=NB||noiseBuf();
    const s=a.createBufferSource(); s.buffer=NB; s.loop=true;
    const f=a.createBiquadFilter(); f.type='bandpass'; f.Q.value=2.5;
    f.frequency.setValueAtTime(300,t); f.frequency.linearRampToValueAtTime(750,t+1.4); f.frequency.linearRampToValueAtTime(220,t+3);
    const g=a.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.05,t+.9); g.gain.exponentialRampToValueAtTime(.0001,t+3.1);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t+3.2); },
  whisper(){ const t=ctx().currentTime; whoosh(t,.35,.035,1800,3400); whoosh(t+.4,.3,.03,2600,1500); whoosh(t+.78,.4,.028,2000,3800); },
  cackle(){ const t=ctx().currentTime; [520,620,560,660,590,700,540].forEach((f,i)=>osc('square',f,f*.82,t+i*.11,.1,.028)); },
  belltoll(){ const t=ctx().currentTime; osc('sine',196,0,t,2.6,.07); osc('sine',392.5,0,t,1.8,.03); osc('triangle',589,0,t,1.1,.015); },
  musicbox(){ const t=ctx().currentTime;
    const mel=[1047,1319,1568,1319,1047,1568,2093,1568,1319,1047,1175,1047];
    mel.forEach((f,i)=>{ osc('triangle',f,0,t+i*.28,.5,.08); osc('sine',f*2,0,t+i*.28,.3,.02); }); },
  bubble(){ const t=ctx().currentTime; osc('sine',180+Math.random()*160,500+Math.random()*400,t,.16,.04); },
  rustle(){ const t=ctx().currentTime; whoosh(t,.22,.05,1000,2200); },
  /* jump-scare stingers + storm & critter pack */
  stinger(){ const t=ctx().currentTime; osc('sawtooth',620,580,t,.5,.11); osc('sawtooth',664,600,t,.5,.09); osc('sine',110,60,t,.5,.16); whoosh(t,.3,.13,2400,300); },
  growl(){ const t=ctx().currentTime; osc('sawtooth',62,40,t,1.15,.09); osc('sawtooth',49,35,t+.06,1.2,.07); whoosh(t,1.1,.04,120,70); },
  wolfhowl(){ const a=ctx(), t=a.currentTime;
    [[.06,0],[.03,.35]].forEach(([vol,at])=>{
      const o=a.createOscillator(),g=a.createGain(),l=a.createOscillator(),lg=a.createGain();
      o.type='sine'; o.frequency.setValueAtTime(300,t+at);
      o.frequency.linearRampToValueAtTime(540,t+at+.55); o.frequency.setValueAtTime(540,t+at+.55);
      o.frequency.linearRampToValueAtTime(500,t+at+1.4); o.frequency.linearRampToValueAtTime(340,t+at+2);
      l.frequency.value=4.2; lg.gain.value=7; l.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(.0001,t+at); g.gain.linearRampToValueAtTime(vol,t+at+.5); g.gain.setValueAtTime(vol,t+at+1.3); g.gain.exponentialRampToValueAtTime(.0001,t+at+2.1);
      o.connect(g); g.connect(master); o.start(t+at); l.start(t+at); o.stop(t+at+2.2); l.stop(t+at+2.2);
    }); },
  whistle(){ const a=ctx(), t=a.currentTime; const o=a.createOscillator(),g=a.createGain();
    o.type='sine'; o.frequency.setValueAtTime(1300,t);
    o.frequency.linearRampToValueAtTime(2400,t+.7); o.frequency.linearRampToValueAtTime(1000,t+1.6);
    g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.028,t+.4); g.gain.exponentialRampToValueAtTime(.0001,t+1.7);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+1.8);
    whoosh(t,1.6,.02,500,900); },
  rumble(){ const t=ctx().currentTime; whoosh(t,2.4,.11,90,40); osc('sine',42,26,t,2.2,.12); osc('sine',34,24,t+.6,1.6,.07); },
  scratch(){ const t=ctx().currentTime; const n=3+Math.floor(Math.random()*3);
    for(let i=0;i<n;i++) whoosh(t+i*.11+Math.random()*.04,.06,.038,2600,1700); },
  skitter(){ const t=ctx().currentTime;
    for(let i=0;i<6;i++) whoosh(t+i*.055,.03,.03,1400,900); },
};

function stopAmbient(){
  clearTimeout(ambTimer); ambTimer=null;
  ambNodes.forEach(n=>{ try{n.stop();}catch(e){} }); ambNodes=[];
}
function drone(freqs,vol,type){
  const a=ctx();
  freqs.forEach(f=>{
    const o=a.createOscillator(),g=a.createGain(),flt=a.createBiquadFilter();
    o.type=type||'sine'; o.frequency.value=f;
    flt.type='lowpass'; flt.frequency.value=400;
    g.gain.value=0; g.gain.linearRampToValueAtTime(vol,a.currentTime+2);
    o.connect(flt); flt.connect(g); g.connect(ambGain);
    o.start(); ambNodes.push(o);
  });
}
function ambient(kind){
  if(!AC && !kind) return;
  ctx(); stopAmbient();
  const loop=(fn,min,vary,first)=>{ const tick=()=>{ fn(); ambTimer=setTimeout(tick, min+Math.random()*vary); }; ambTimer=setTimeout(tick, first==null?min:first); };
  const pick=arr=>{ // [fn, weight] pairs
    let tot=arr.reduce((s,x)=>s+x[1],0), r=Math.random()*tot;
    for(const [fn,w] of arr){ if((r-=w)<0) return fn; }
    return arr[0][0];
  };
  if(kind==='mansion'){
    drone([55,55.7,82.5],.028);
    loop(()=>pick([[FX.distantcreak,5],[FX.belltoll,2],[FX.scratch,3],[FX.wolfhowl,1]])(), 6000, 8000, 4000+Math.random()*4000);
  } else if(kind==='mirror'){
    drone([220,220.9,330],.016);
    loop(FX.twinkle, 2200, 3500, 1200);
  } else if(kind==='kitchen'){
    drone([65,65.6,98],.024);
    loop(()=>pick([[FX.bubble,7],[FX.cackle,1],[FX.skitter,2]])(), 1600, 2600, 1200);
  } else if(kind==='library'){
    drone([58,58.5,87],.022);
    loop(()=>pick([[FX.whisper,4],[FX.rustle,3],[FX.scratch,3]])(), 5000, 7000, 3000);
  } else if(kind==='cellar'){
    drone([48,48.4,72],.032);
    let n=0;
    loop(()=>{ n++; (n%2?FX.heartbeat:pick([[FX.drip,5],[FX.scratch,3],[FX.growl,1]]))(); }, 1400, 1800, 900);
  } else if(kind==='attic'){
    drone([52,52.6,78],.024);
    loop(()=>pick([[FX.wind,4],[FX.whistle,3],[FX.distantcreak,2],[FX.scratch,2],[FX.wolfhowl,1]])(), 4000, 5000, 800);
  }
}

window.Snd = {
  play(k){ try{ (FX[k]||FX.pop)(); }catch(e){} },
  note(f,d,v){ try{ note(f,d,v); }catch(e){} },
  ambient(k){ try{ ambient(k); }catch(e){} },
  get muted(){ return muted; },
  toggle(){
    muted=!muted; store.set('mayaEscapeMuted', muted?'1':'0');
    if(master) master.gain.value = muted?0:0.55;
    return muted;
  },
};
})();
