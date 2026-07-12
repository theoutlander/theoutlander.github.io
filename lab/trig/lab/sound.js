/* The sound demo. A sine wave played through the speaker, drawn live.
   One pure sine, a pitch slider, and a short tune. Plain and simple. */
(function(){
  const root = document.getElementById('lab-sound');
  if(!root) return;
  const cv      = root.querySelector('[data-scope]');
  const playBtn = root.querySelector('[data-play]');
  const tuneBtn = root.querySelector('[data-tune]');
  const pitch   = root.querySelector('[data-pitch]');
  const noteOut = root.querySelector('[data-note]');
  const hzOut   = root.querySelector('[data-hz]');
  const disc    = root.querySelector('[data-disc]');

  let ana=null, osc=null, env=null, raf=null, on=false, tuneTimer=null, tuneEnd=0, tuneBus=null;
  let freq = +pitch.value;

  function ensureAna(){
    const c = Lab.ensure();
    if(!ana){ ana = c.createAnalyser(); ana.fftSize = 2048; ana.smoothingTimeConstant = 0.5; ana.connect(c.destination); }
    return ana;
  }
  function updateOut(){ noteOut.textContent = Lab.noteName(freq); hzOut.textContent = Math.round(freq); }
  function spin(y){ disc.classList.toggle('spin', y); }
  function idle(){ Lab.drawIdle(cv, Math.max(2, Math.round(freq/90))); }
  function loop(){ Lab.drawScope(cv, ana, Lab.cssVar('--accent'), { amp: 0.7 }); raf = requestAnimationFrame(loop); }
  function ensureLoop(){ if(!raf) loop(); }
  function maybeStopLoop(){ if(!on && performance.now() > tuneEnd){ cancelAnimationFrame(raf); raf=null; idle(); } }

  function startNote(){
    ensureAna(); const c = Lab.ctx;
    osc = c.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
    env = c.createGain(); env.gain.value = 0.0001;
    osc.connect(env); env.connect(ana);
    osc.start(); env.gain.exponentialRampToValueAtTime(0.2, c.currentTime + 0.02);
    on = true; playBtn.classList.add('on'); playBtn.querySelector('.lbl').textContent = 'Stop';
    spin(true); ensureLoop();
  }
  function stopNote(){
    if(env){ const t = Lab.ctx.currentTime; env.gain.cancelScheduledValues(t); env.gain.setValueAtTime(env.gain.value, t); env.gain.exponentialRampToValueAtTime(0.0001, t+0.08); osc.stop(t+0.1); }
    osc = env = null; on = false;
    playBtn.classList.remove('on'); playBtn.querySelector('.lbl').textContent = 'Play a note';
    spin(false); setTimeout(maybeStopLoop, 160);
  }
  playBtn.addEventListener('click', ()=>{ if(tuneBus) stopTune(); on ? stopNote() : startNote(); });
  pitch.addEventListener('input', e=>{
    freq = +e.target.value; updateOut();
    if(osc) osc.frequency.setTargetAtTime(freq, Lab.ctx.currentTime, 0.02);
    if(!raf) idle();
  });

  // Twinkle Twinkle, each note a pure sine
  const TUNE = [['C4',1],['C4',1],['G4',1],['G4',1],['A4',1],['A4',1],['G4',2],['F4',1],['F4',1],['E4',1],['E4',1],['D4',1],['D4',1],['C4',2]];
  function nf(n){ const m=n.match(/^([A-G])(#?)(\d)$/); const pc={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]?1:0); const midi=12*(+m[3]+1)+pc; return 440*Math.pow(2,(midi-69)/12); }
  function playTune(){
    if(on) stopNote();
    ensureAna(); ensureLoop(); spin(true);
    const c = Lab.ctx;
    tuneBus = c.createGain(); tuneBus.gain.value = 1; tuneBus.connect(ana);
    const beat=0.42; let t=c.currentTime+0.06;
    TUNE.forEach(([n,b])=>{ Lab.pluck(nf(n), { gains:[1], dur:b*beat*0.95, when: t-c.currentTime, vol:0.3, dest:tuneBus }); t += b*beat; });
    const ms = (t-c.currentTime)*1000;
    tuneEnd = performance.now() + ms + 200;
    noteOut.textContent = 'a tune';
    tuneBtn.textContent = 'Stop the tune';
    clearTimeout(tuneTimer);
    tuneTimer = setTimeout(endTune, ms + 220);
  }
  function endTune(){
    clearTimeout(tuneTimer);
    tuneBus = null; tuneEnd = 0;
    tuneBtn.textContent = 'Play a little tune';
    spin(false); updateOut(); maybeStopLoop();
  }
  function stopTune(){
    if(!tuneBus) return;
    const t = Lab.ctx.currentTime;
    tuneBus.gain.setValueAtTime(tuneBus.gain.value, t);
    tuneBus.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    endTune();
  }
  tuneBtn.addEventListener('click', ()=> tuneBus ? stopTune() : playTune());

  updateOut(); idle();
})();
