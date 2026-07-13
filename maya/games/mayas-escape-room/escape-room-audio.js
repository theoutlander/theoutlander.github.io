/* Maya's Escape Room — sound engine (WebAudio, no files needed) */
(function(){
'use strict';
/* Guarded storage — iPad Safari THROWS on any localStorage access when site
   data is blocked; a bare read here would kill this whole file (no sound). */
const store = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} },
};
let AC=null, master=null, fxBus=null, bedBus=null, ambGain=null, echoIn=null, ambTimers=[], ambNodes=[];
let muted = store.get('mayaEscapeMuted')==='1';

/* Two buses (feedback 2026-07-12: "too loud... need to be subtle in the
   background"):
     fxBus  — things she TAPPED. Stay crisp so every tap has a reaction.
     bedBus — the room's atmosphere. Sits WAY under the game, never on top.
   Everything the ambient loops schedule is routed to bedBus by bed(). */
const FX_LEVEL = 0.5;
const BED_LEVEL = 0.22;
let DEST = null;           // default destination for osc()/whoosh() — fxBus, or bedBus inside bed()

function ctx(){
  if (window.MayaIOSAudioUnlock) window.MayaIOSAudioUnlock.unlock();
  if(!AC){
    AC = new (window.AudioContext||window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = muted?0:0.5; master.connect(AC.destination);
    fxBus = AC.createGain(); fxBus.gain.value = FX_LEVEL; fxBus.connect(master);
    bedBus = AC.createGain(); bedBus.gain.value = BED_LEVEL; bedBus.connect(master);
    // a soft blanket over the atmosphere so it reads as "far away", not "in your ear"
    const lp = AC.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=2400; lp.Q.value=.4;
    bedBus.disconnect(); bedBus.connect(lp); lp.connect(master);
    ambGain = bedBus;
    DEST = fxBus;
    // gentle echo send — makes the house feel big and empty
    echoIn = AC.createGain(); echoIn.gain.value = 1;
    const d = AC.createDelay(1); d.delayTime.value = .31;
    const fb = AC.createGain(); fb.gain.value = .26;
    const wet = AC.createGain(); wet.gain.value = .22;
    echoIn.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(master);
  }
  if(AC.state==='suspended') AC.resume();
  return AC;
}
/* run fn with everything it schedules routed to the quiet background bus */
function bed(fn){
  ctx(); const prev=DEST; DEST=bedBus;
  try{ fn(); } catch(e){} finally{ DEST=prev; }
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
  o.connect(g); g.connect(dest||DEST||master); o.start(t0); o.stop(t0+dur+.05);
  return o;
}
function whoosh(t0,dur,vol,fc0,fc1,dest){
  const a=ctx(); NB=NB||noiseBuf();
  const s=a.createBufferSource(); s.buffer=NB; s.loop=true;
  const f=a.createBiquadFilter(); f.type='bandpass'; f.Q.value=1.2;
  f.frequency.setValueAtTime(fc0,t0); f.frequency.exponentialRampToValueAtTime(fc1,t0+dur);
  const g=a.createGain(); g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  s.connect(f); f.connect(g); g.connect(dest||DEST||master); s.start(t0); s.stop(t0+dur+.05);
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
  thump(){ const t=ctx().currentTime; osc('sine',100,45,t,.22,.15); whoosh(t,.15,.03,300,120); },
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
  net(){ const t=ctx().currentTime; whoosh(t,.5,.1,1400,200); osc('triangle',300,80,t+.35,.3,.1); FX.giggle(t+.7); },
  giggle(at){ const a=ctx(), t=at||a.currentTime; [660,784,880,784,988].forEach((f,i)=>osc('sine',f,f*1.06,t+i*.09,.09,.07)); },
  ghost(){ const a=ctx(), t=a.currentTime; const o=a.createOscillator(),g=a.createGain(),l=a.createOscillator(),lg=a.createGain();
    o.type='sine'; o.frequency.setValueAtTime(440,t); o.frequency.linearRampToValueAtTime(330,t+1.2);
    l.frequency.value=5.5; lg.gain.value=18; l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.06,t+.25); g.gain.linearRampToValueAtTime(.0001,t+1.3);
    o.connect(g); g.connect(DEST||master); o.start(t); l.start(t); o.stop(t+1.35); l.stop(t+1.35); },
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
  thunder(){ const t=ctx().currentTime; whoosh(t,1.8,.07,140,50); osc('sine',52,28,t,1.6,.07); osc('sine',40,25,t+.4,1.2,.045); },
  gem(){ const t=ctx().currentTime; [880,1175,1568,2093].forEach((f,i)=>osc('triangle',f,0,t+i*.07,.3,.1)); whoosh(t,.35,.04,3000,7000); },
  screech(){ const t=ctx().currentTime; osc('sawtooth',1900,900,t,.18,.055); osc('sawtooth',1600,700,t+.12,.2,.05); },
  distantcreak(){ const t=ctx().currentTime; const o=osc('sawtooth',60+Math.random()*40,0,t,.9,.035);
    o.frequency.linearRampToValueAtTime(50+Math.random()*30,t+.9); },
  /* --- deluxe scary (but friendly) pack --- */
  knock(){ const t=ctx().currentTime; [0,.32,.64].forEach(at=>{ osc('sine',130,55,t+at,.16,.12); whoosh(t+at,.08,.035,400,150); }); },
  heartbeat(){ const t=ctx().currentTime; osc('sine',70,38,t,.22,.1); osc('sine',62,34,t+.32,.28,.075); },
  drip(){ const t=ctx().currentTime; osc('sine',1400,320,t,.12,.09); osc('sine',900,2200,t+.14,.1,.05); },
  wind(){ const a=ctx(), t=a.currentTime; NB=NB||noiseBuf();
    const s=a.createBufferSource(); s.buffer=NB; s.loop=true;
    const f=a.createBiquadFilter(); f.type='bandpass'; f.Q.value=2.5;
    f.frequency.setValueAtTime(300,t); f.frequency.linearRampToValueAtTime(750,t+1.4); f.frequency.linearRampToValueAtTime(220,t+3);
    const g=a.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.065,t+.9); g.gain.exponentialRampToValueAtTime(.0001,t+3.1);
    s.connect(f); f.connect(g); g.connect(DEST||master); s.start(t); s.stop(t+3.2); },
  whisper(){ const t=ctx().currentTime; whoosh(t,.35,.06,1800,3400); whoosh(t+.4,.3,.05,2600,1500); whoosh(t+.78,.4,.05,2000,3800); },
  cackle(){ const t=ctx().currentTime; [520,620,560,660,590,700,540].forEach((f,i)=>osc('square',f,f*.82,t+i*.11,.1,.028)); },
  belltoll(){ const t=ctx().currentTime; osc('sine',196,0,t,2.6,.07); osc('sine',392.5,0,t,1.8,.03); osc('triangle',589,0,t,1.1,.015); },
  musicbox(){ const t=ctx().currentTime;
    const mel=[1047,1319,1568,1319,1047,1568,2093,1568,1319,1047,1175,1047];
    mel.forEach((f,i)=>voice(f, t+i*.28, .55, .06)); },
  /* the Watchers: a soft shimmer when eyes wake, a giggly blink when tapped */
  wake(){ const t=ctx().currentTime; [784,1175,1568].forEach((f,i)=>{ osc('sine',f,0,t+i*.12,.9,.05); osc('triangle',f*1.5,0,t+i*.12,.5,.02); }); whoosh(t,.6,.02,2200,4200); },
  blink(){ const t=ctx().currentTime; osc('sine',1200,1800,t,.08,.05); osc('sine',1800,900,t+.1,.1,.04); FX.giggle(t+.16); },
  bubble(){ const t=ctx().currentTime; osc('sine',180+Math.random()*160,500+Math.random()*400,t,.16,.06); },
  rustle(){ const t=ctx().currentTime; whoosh(t,.22,.08,1000,2200); },
  /* jump-scare stingers + storm & critter pack */
  stinger(){ const t=ctx().currentTime; osc('sawtooth',620,580,t,.5,.06); osc('sawtooth',664,600,t,.5,.05); osc('sine',110,60,t,.5,.09); whoosh(t,.3,.07,2400,300); },
  growl(){ const t=ctx().currentTime; osc('sawtooth',62,40,t,1.15,.05); osc('sawtooth',49,35,t+.06,1.2,.04); whoosh(t,1.1,.02,120,70); },
  wolfhowl(){ const a=ctx(), t=a.currentTime;
    [[.085,0],[.045,.35]].forEach(([vol,at])=>{
      const o=a.createOscillator(),g=a.createGain(),l=a.createOscillator(),lg=a.createGain();
      o.type='sine'; o.frequency.setValueAtTime(300,t+at);
      o.frequency.linearRampToValueAtTime(540,t+at+.55); o.frequency.setValueAtTime(540,t+at+.55);
      o.frequency.linearRampToValueAtTime(500,t+at+1.4); o.frequency.linearRampToValueAtTime(340,t+at+2);
      l.frequency.value=4.2; lg.gain.value=7; l.connect(lg); lg.connect(o.frequency);
      g.gain.setValueAtTime(.0001,t+at); g.gain.linearRampToValueAtTime(vol,t+at+.5); g.gain.setValueAtTime(vol,t+at+1.3); g.gain.exponentialRampToValueAtTime(.0001,t+at+2.1);
      o.connect(g); g.connect(DEST||master); o.start(t+at); l.start(t+at); o.stop(t+at+2.2); l.stop(t+at+2.2);
    }); },
  whistle(){ const a=ctx(), t=a.currentTime; const o=a.createOscillator(),g=a.createGain();
    o.type='sine'; o.frequency.setValueAtTime(1300,t);
    o.frequency.linearRampToValueAtTime(2400,t+.7); o.frequency.linearRampToValueAtTime(1000,t+1.6);
    g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.042,t+.4); g.gain.exponentialRampToValueAtTime(.0001,t+1.7);
    o.connect(g); g.connect(DEST||master); o.start(t); o.stop(t+1.8);
    whoosh(t,1.6,.03,500,900); },
  rumble(){ const t=ctx().currentTime; whoosh(t,2.4,.05,90,40); osc('sine',42,26,t,2.2,.05); osc('sine',34,24,t+.6,1.6,.03); },
  scratch(){ const t=ctx().currentTime; const n=3+Math.floor(Math.random()*3);
    for(let i=0;i<n;i++){ whoosh(t+i*.13+Math.random()*.04,.09,.1,2600,1700); osc('sawtooth',2200,1400,t+i*.13,.07,.02); } },
  skitter(){ const t=ctx().currentTime; // tiny claws: quick high tick-tick-ticks
    for(let i=0;i<8;i++) osc('triangle',1700+Math.random()*900,800,t+i*.06,.045,.06);
    whoosh(t,.5,.05,1300,900); },
};

function stopAmbient(){
  ambTimers.forEach(s=>clearTimeout(s.id)); ambTimers=[];
  ambNodes.forEach(n=>{ try{n.stop();}catch(e){} }); ambNodes=[];
}
/* ---- tiny tune engine: celesta voice + composed tunes (no audio files) ---- */
function voice(f,t,dur,vol){
  const a=ctx();
  [-4,4].forEach(cents=>{
    const o=a.createOscillator(), g=a.createGain(), fl=a.createBiquadFilter();
    o.type='triangle'; o.frequency.value=f; o.detune.value=cents;
    fl.type='lowpass'; fl.frequency.value=2800;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.015); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(fl); fl.connect(g); g.connect(DEST||master); if(echoIn) g.connect(echoIn);
    o.start(t); o.stop(t+dur+.05);
  });
  const o2=a.createOscillator(), g2=a.createGain();
  o2.type='sine'; o2.frequency.value=f*2;
  g2.gain.setValueAtTime(0,t); g2.gain.linearRampToValueAtTime(vol*.22,t+.01); g2.gain.exponentialRampToValueAtTime(.0001,t+dur*.6);
  o2.connect(g2); g2.connect(DEST||master); if(echoIn) g2.connect(echoIn);
  o2.start(t); o2.stop(t+dur);
}
/* tune = {bpm, mv: melody vol, m: melody} — [beat, freq, beats]
   NOTE (2026-07-12): the bass/chord tracks are GONE. The oom-pah-pah waltz bass,
   the kitchen walking bass, the library tick-tock metronome and the cellar
   heartbeat loop were the "drums" — a plodding pulse under everything, which is
   exactly what Nick called "really, really, really boring". Tunes are now sparse
   melodic motifs only: a few notes, far apart, quiet, no beat to get bored of. */
function playTune(tune){
  const spb=60/tune.bpm, t0=ctx().currentTime+.05;
  (tune.m||[]).forEach(([b,f,d])=>voice(f, t0+b*spb, Math.max(d*spb,.28)*1.15, tune.mv||.05));
}
/* Sparse motifs only — a handful of notes, then silence. Nothing repeats often
   enough to become a beat. */
const TUNES={
  /* parlor: three lonely music-box notes, no accompaniment */
  parlor:{bpm:64, mv:.05, m:[[0,1319,2],[2,1047,2],[4,880,4]]},
  /* library: dreamy whole-tone drift */
  celesta:{bpm:60, mv:.04, m:[[0,1047,2],[2,1319,2],[4,1175,4]]},
  /* kitchen: a cheeky little two-note "hmm?" from the cauldron */
  kettle:{bpm:72, mv:.045, m:[[0,880,1],[1,1047,3]]},
  /* attic: slow dreamy descent over the chimes */
  dream:{bpm:60, mv:.042, m:[[0,1480,2],[2,1175,2],[4,880,4]]},
  /* mirror room: a rolled glass arpeggio */
  glassup:{bpm:96, mv:.042, m:[[0,659,.5],[.5,988,.5],[1,1480,3]]},
  glassdown:{bpm:96, mv:.042, m:[[0,1480,.5],[.5,988,.5],[1,659,3]]},
  /* secret room: Lottie's lullaby, shortened */
  lullaby:{bpm:76, mv:.05, m:[[0,1047,1],[1,1319,1],[2,1175,2],[4,988,1],[5,880,3]]},
  /* cellar: rare low shadow motif */
  shadow:{bpm:52, mv:.04, m:[[0,220,2],[2,261.6,2],[4,329.6,4]]},
  /* inside the mirror: happy sparkling run */
  sparkle:{bpm:112, mv:.045, m:[[0,1047,.5],[.5,1319,.5],[1,1568,.5],[1.5,2093,2.5]]},
};
/* a very soft pad — the "texture" the rooms sit on instead of a beat */
function drone(freqs,vol,type){
  const a=ctx(), running = a.state==='running';
  freqs.forEach(f=>{
    const o=a.createOscillator(),g=a.createGain(),flt=a.createBiquadFilter();
    o.type=type||'sine'; o.frequency.value=f;
    flt.type='lowpass'; flt.frequency.value=380;
    // iOS: a suspended context has a FROZEN clock, so a ramp would never apply.
    // Only fade in when the clock is actually moving; otherwise set it outright.
    if(running){ g.gain.value=0; g.gain.linearRampToValueAtTime(vol,a.currentTime+3); }
    else g.gain.value = vol;
    o.connect(flt); flt.connect(g); g.connect(bedBus);
    o.start(); ambNodes.push(o);
  });
}
/* a slow breath of filtered air — barely-there room tone, no pulse */
function breath(){
  const a=ctx(); NB=NB||noiseBuf();
  const s=a.createBufferSource(); s.buffer=NB; s.loop=true;
  const f=a.createBiquadFilter(); f.type='bandpass'; f.Q.value=.7; f.frequency.value=340;
  const g=a.createGain(); g.gain.value=.028;
  // a slow LFO on the filter makes it drift instead of sitting still
  const l=a.createOscillator(), lg=a.createGain();
  l.type='sine'; l.frequency.value=0.045; lg.gain.value=160;
  l.connect(lg); lg.connect(f.frequency);
  s.connect(f); f.connect(g); g.connect(bedBus);
  s.start(); l.start(); ambNodes.push(s); ambNodes.push(l);
}
function ambient(kind){
  if(!AC && !kind) return;
  ctx(); stopAmbient();
  // Everything an ambient loop schedules goes to the quiet bed bus.
  const loop=(fn,min,vary,first)=>{
    const slot={id:0};
    const tick=()=>{ bed(fn); slot.id=setTimeout(tick, min+Math.random()*vary); };
    slot.id=setTimeout(tick, first==null?min:first);
    ambTimers.push(slot);
  };
  const pick=arr=>{ // [fn, weight] pairs
    let tot=arr.reduce((s,x)=>s+x[1],0), r=Math.random()*tot;
    for(const [fn,w] of arr){ if((r-=w)<0) return fn; }
    return arr[0][0];
  };
  /* Feedback 2026-07-12: "too loud... too basic and boring... need to be subtle
     in the background." So: no beat anywhere, long gaps (10–30s) between the
     little sounds, a soft breathing room-tone underneath, and all of it on the
     quiet bed bus so her taps are always the loudest thing she hears. */
  if(kind==='mansion'){
    bed(breath);
    loop(()=>playTune(TUNES.parlor), 26000, 14000, 6000);
    loop(()=>pick([[FX.distantcreak,4],[FX.belltoll,1],[FX.skitter,2]])(), 13000, 12000, 7000);
  } else if(kind==='mirror'){
    drone([220,220.9,330],.012);
    loop(FX.twinkle, 5000, 6000, 1800);
    loop(()=>playTune(TUNES.sparkle), 14000, 8000, 4000);
  } else if(kind==='mirrorroom'){
    bed(breath);
    let g=0;
    loop(()=>playTune(g++%2 ? TUNES.glassdown : TUNES.glassup), 15000, 9000, 3000);
    loop(()=>pick([[FX.whisper,2],[FX.twinkle,5]])(), 11000, 10000, 6000);
  } else if(kind==='kitchen'){
    bed(breath);
    loop(()=>playTune(TUNES.kettle), 18000, 12000, 5000);
    loop(()=>pick([[FX.bubble,8],[FX.drip,2]])(), 5500, 6000, 3000);
  } else if(kind==='library'){
    bed(breath);
    loop(()=>playTune(TUNES.celesta), 22000, 12000, 5000);
    loop(()=>pick([[FX.rustle,4],[FX.whisper,2],[FX.hoot,1]])(), 12000, 12000, 6000);
  } else if(kind==='cellar'){
    drone([48,48.4,72],.014);
    bed(breath);
    loop(()=>pick([[FX.drip,6],[FX.skitter,2],[FX.distantcreak,2]])(), 7000, 8000, 3000);
    loop(()=>playTune(TUNES.shadow), 26000, 14000, 11000);
  } else if(kind==='attic'){
    bed(breath);
    const PENT=[1047,1175,1319,1568,1760];
    loop(()=>{ const t=ctx().currentTime, n=2+Math.floor(Math.random()*2);
      for(let i=0;i<n;i++) osc('sine', PENT[Math.floor(Math.random()*5)], 0, t+i*(.3+Math.random()*.3), 1.1, .04);
    }, 9000, 8000, 2500);
    loop(()=>playTune(TUNES.dream), 24000, 12000, 6000);
    loop(()=>pick([[FX.wind,4],[FX.whistle,2],[FX.distantcreak,2]])(), 13000, 11000, 4000);
  } else if(kind==='secret'){
    bed(breath);
    loop(()=>playTune(TUNES.lullaby), 20000, 12000, 3000);
    loop(()=>pick([[FX.distantcreak,3],[FX.rustle,3]])(), 13000, 12000, 8000);
  }
}

window.Snd = {
  play(k){ try{ (FX[k]||FX.pop)(); }catch(e){} },
  note(f,d,v){ try{ note(f,d,v); }catch(e){} },
  ambient(k){ try{ ambient(k); }catch(e){} },
  get muted(){ return muted; },
  toggle(){
    muted=!muted; store.set('mayaEscapeMuted', muted?'1':'0');
    if(master) master.gain.value = muted?0:0.5;   // set outright — a suspended ctx has a frozen clock
    return muted;
  },
};
})();
