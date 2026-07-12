/* Castle Defenders v2 — WebAudio synth (no files) */
(function(){
'use strict';
let AC=null, master=null, musTimer=null, musStep=0, musName=null;
/* Guarded: a bare localStorage read here THROWS on Maya's iPad with site data blocked and takes
   this entire file down with it — no audio object, and the game's start flow dies with it.
   CDStore comes from cd-data.js, which loads first. Mute is a device preference, not progress,
   so it stays un-namespaced (but still guarded). */
let muted = (window.CDStore ? CDStore.getPref('cdMuted') : null)==='1';

function ctx(){
  if (window.MayaIOSAudioUnlock) window.MayaIOSAudioUnlock.unlock();
  if(!AC){
    AC = new (window.AudioContext||window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = muted?0:0.5; master.connect(AC.destination);
  }
  if(AC.state==='suspended') AC.resume();
  return AC;
}
let NB=null;
function noiseBuf(){
  const a=ctx(), b=a.createBuffer(1,a.sampleRate*1.2,a.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  return b;
}
function osc(type,f0,f1,t0,dur,vol){
  const a=ctx(), o=a.createOscillator(), g=a.createGain();
  o.type=type; o.frequency.setValueAtTime(Math.max(f0,1),t0);
  if(f1) o.frequency.exponentialRampToValueAtTime(Math.max(f1,1),t0+dur);
  g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  o.connect(g); g.connect(master); o.start(t0); o.stop(t0+dur+.05);
  return o;
}
function whoosh(t0,dur,vol,fc0,fc1){
  const a=ctx(); NB=NB||noiseBuf();
  const s=a.createBufferSource(); s.buffer=NB; s.loop=true;
  const f=a.createBiquadFilter(); f.type='bandpass'; f.Q.value=1.1;
  f.frequency.setValueAtTime(fc0,t0); f.frequency.exponentialRampToValueAtTime(Math.max(fc1,1),t0+dur);
  const g=a.createGain(); g.gain.setValueAtTime(vol,t0); g.gain.exponentialRampToValueAtTime(.0001,t0+dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t0); s.stop(t0+dur+.05);
}
const N={C3:131,D3:147,E3:165,F3:175,G3:196,A3:220,B3:247,C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494,C5:523,D5:587,E5:659,G5:784,A5:880,C6:1047};

const FX={
  chop(){ const t=ctx().currentTime; whoosh(t,.07,.12,1800,600); osc('square',220,140,t+.03,.08,.12); osc('sine',90,60,t+.03,.1,.2); },
  goldchop(){ FX.chop(); const t=ctx().currentTime; osc('triangle',1568,2093,t+.05,.15,.07); },
  crack(){ const t=ctx().currentTime; osc('square',160,60,t,.16,.16); whoosh(t,.14,.1,900,300); },
  treefall(){ const t=ctx().currentTime; whoosh(t,.5,.12,700,150); osc('sine',110,38,t+.15,.5,.34); osc('sine',70,30,t+.3,.4,.25); },
  bigfall(){ FX.treefall(); const t=ctx().currentTime; osc('sine',55,25,t+.35,.6,.35); whoosh(t+.2,.6,.1,400,90); },
  wood(){ const t=ctx().currentTime; osc('triangle',N.C5,0,t,.09,.1); osc('triangle',N.E5,0,t+.06,.11,.1); },
  throwaxe(){ const t=ctx().currentTime; whoosh(t,.3,.1,600,2400); },
  acorn(){ const t=ctx().currentTime; osc('triangle',700,300,t,.08,.1); },
  beaver(){ const t=ctx().currentTime; osc('square',500,350,t,.05,.07); osc('square',420,300,t+.07,.05,.07); },
  click(){ const t=ctx().currentTime; osc('triangle',900,600,t,.06,.09); },
  buy(){ const t=ctx().currentTime; [N.C5,N.E5,N.G5].forEach((f,i)=>osc('triangle',f,0,t+i*.07,.14,.11)); },
  nope(){ const t=ctx().currentTime; osc('sawtooth',180,120,t,.18,.08); },
  unlock(){ const t=ctx().currentTime; [N.G4,N.C5,N.E5,N.G5].forEach((f,i)=>osc('triangle',f,0,t+i*.08,.2,.1)); whoosh(t,.3,.05,2000,4000); },
  bonk(){ const t=ctx().currentTime; osc('square',300,90,t,.1,.15); osc('sine',150,60,t,.12,.2); },
  honk(){ const t=ctx().currentTime; osc('sawtooth',330,310,t,.13,.13); osc('sawtooth',415,390,t+.14,.16,.13); },
  splat(){ const t=ctx().currentTime; whoosh(t,.16,.16,500,120); osc('sine',180,50,t,.16,.2); },
  bubble(){ const t=ctx().currentTime; osc('sine',400,900,t,.18,.1); },
  bubblepop(){ const t=ctx().currentTime; osc('triangle',900,1400,t,.06,.12); whoosh(t,.05,.08,2500,4000); },
  boing(){ const t=ctx().currentTime; const o=osc('triangle',260,0,t,.4,.14);
    o.frequency.setValueAtTime(260,t); o.frequency.linearRampToValueAtTime(90,t+.1); o.frequency.linearRampToValueAtTime(190,t+.2); o.frequency.linearRampToValueAtTime(70,t+.35); },
  nanarang(){ const t=ctx().currentTime; whoosh(t,.4,.09,800,1600); whoosh(t+.4,.4,.09,1600,800); },
  kaboom(){ const t=ctx().currentTime; osc('sine',120,30,t,.7,.4); whoosh(t,.8,.2,2000,200); [N.C5,N.E5,N.G5,N.C6].forEach((f,i)=>osc('triangle',f,0,t+.1+i*.06,.3,.09)); },
  groan(){ const t=ctx().currentTime; const o=osc('sawtooth',115,0,t,.7,.16);
    o.frequency.setValueAtTime(115,t); o.frequency.linearRampToValueAtTime(82,t+.3); o.frequency.linearRampToValueAtTime(105,t+.5); o.frequency.linearRampToValueAtTime(70,t+.7);
    const o2=osc('triangle',230,0,t,.7,.09);
    o2.frequency.setValueAtTime(230,t); o2.frequency.linearRampToValueAtTime(164,t+.35); o2.frequency.linearRampToValueAtTime(140,t+.7);
    whoosh(t+.05,.5,.04,300,150); },
  mumble(){ const t=ctx().currentTime; [190,150,175,130].forEach((f,i)=>osc('sawtooth',f,f*.8,t+i*.13,.12,.11)); },
  bite(){ const t=ctx().currentTime; osc('square',200,80,t,.12,.14); whoosh(t,.1,.08,700,250); },
  hurt(){ const t=ctx().currentTime; osc('sawtooth',300,150,t,.25,.12); osc('sawtooth',220,110,t+.05,.25,.1); },
  poof(){ const t=ctx().currentTime; whoosh(t,.25,.12,1400,400); osc('triangle',600,200,t,.2,.08); },
  dawn(){ const t=ctx().currentTime; [N.C4,N.E4,N.G4,N.C5,N.E5].forEach((f,i)=>osc('triangle',f,0,t+i*.1,.4,.09)); },
  fanfare(){ const t=ctx().currentTime; [[N.C5,0],[N.C5,.12],[N.C5,.24],[N.E5,.36],[N.G5,.56],[N.E5,.76],[N.G5,.9],[N.C6,1.1]].forEach(p=>{osc('square',p[1]===1.1?p[0]:p[0],0,t+p[1],.22,.07); osc('triangle',p[0],0,t+p[1],.3,.1);}); },
  firework(){ const t=ctx().currentTime; whoosh(t,.3,.07,300,2500); osc('triangle',CD.pick([N.C6,N.A5,N.G5]),0,t+.28,.3,.08); whoosh(t+.28,.3,.06,3000,800); }
};

/* --- tiny step-sequencer music --- */
const TUNES={
  day:{ tempo:230, bass:[N.C3,0,N.G3,0,N.A3,0,N.F3,0,N.C3,0,N.G3,0,N.F3,0,N.G3,0],
    mel:[N.E5,0,N.G5,N.E5,0,N.D5,N.C5,0, 0,N.C5,N.D5,0,N.E5,0,N.G5,0, N.A5,0,N.G5,0,N.E5,0,N.D5,0, N.C5,0,N.D5,N.E5,N.D5,0,N.C5,0] },
  night:{ tempo:300, bass:[N.A3*0.5,0,0,0,N.F3*0.5,0,0,0,N.G3*0.5,0,0,0,N.E3*0.5,0,0,0],
    mel:[N.A4,0,0,N.C5,0,0,N.B4,0, 0,0,N.A4,0,0,0,0,0, N.E5,0,0,N.D5,0,0,N.C5,0, N.B4,0,0,0,0,0,0,0] }
};
function music(name){
  stopMusic();
  if(!name) return;
  musName=name; musStep=0;
  const tune=TUNES[name];
  musTimer=setInterval(()=>{
    if(muted) return;
    const a=ctx(), t=a.currentTime;
    const b=tune.bass[musStep % tune.bass.length];
    const m=tune.mel[musStep % tune.mel.length];
    if(b) osc('sine',b,0,t,.3,name==='night'?.1:.13);
    if(m) osc('triangle',m,0,t,name==='night'?.5:.24,name==='night'?.055:.075);
    if(name==='day' && musStep%4===2) whoosh(t,.04,.02,5000,7000);
    musStep++;
  }, tune.tempo);
}
function stopMusic(){ if(musTimer){ clearInterval(musTimer); musTimer=null; musName=null; } }

window.CDAudio={
  fx:FX, music, stopMusic,
  unlockCtx(){ ctx(); },
  get muted(){ return muted; },
  setMuted(m){
    muted=m; if (window.CDStore) CDStore.setPref('cdMuted', m?'1':'0');
    if(AC&&master) master.gain.value=m?0:0.5;
  }
};
})();
