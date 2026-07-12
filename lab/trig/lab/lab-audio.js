/* ============================================================
   Lab — shared Web Audio helpers for the sine-wave stations.
   One AudioContext, lazily created on the first user gesture.
   ============================================================ */
window.Lab = (function(){
  let ctx = null;

  function ensure(){
    if(!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  const NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  function freqToMidi(f){ return Math.round(69 + 12*Math.log2(f/440)); }
  function noteName(f){ const m = freqToMidi(f); return NAMES[((m%12)+12)%12] + (Math.floor(m/12)-1); }
  function midiToFreq(m){ return 440 * Math.pow(2, (m-69)/12); }

  /* A short plucked tone: fundamental + optional harmonic gains, with ADSR.
     gains = [a1, a2, a3, ...] amplitude of harmonic n (1-indexed). */
  function pluck(freq, {gains=[1], dur=0.9, when=0, vol=0.26, attack=0.012, release=0.18, dest=null}={}){
    const c = ensure();
    const t0 = c.currentTime + when;
    const out = dest || c.destination;
    const env = c.createGain(); env.connect(out);
    const sum = gains.reduce((s,g)=>s+Math.abs(g),0) || 1;
    const peak = vol / sum;
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    env.gain.setValueAtTime(peak, t0 + Math.max(attack, dur - release));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    gains.forEach((g,i)=>{
      if(Math.abs(g) < 0.002) return;
      const o = c.createOscillator(); o.type='sine'; o.frequency.value = freq*(i+1);
      const gg = c.createGain(); gg.gain.value = g;
      o.connect(gg); gg.connect(env);
      o.start(t0); o.stop(t0 + dur + 0.05);
    });
    return env;
  }

  /* A held voice you control over time. Returns { setFreq, setGain, analyser, stop }. */
  function voice(freq, {type='sine', vol=0.22, analyse=true}={}){
    const c = ensure();
    const osc = c.createOscillator(); osc.type = type; osc.frequency.value = freq;
    const gain = c.createGain(); gain.gain.value = 0.0001;
    let node = gain; osc.connect(gain);
    let ana = null;
    if(analyse){ ana = c.createAnalyser(); ana.fftSize = 2048; ana.smoothingTimeConstant = 0.6; gain.connect(ana); ana.connect(c.destination); }
    else gain.connect(c.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(vol, c.currentTime + 0.02);
    return {
      osc, gain, analyser: ana,
      setFreq(f, glide=0.03){ osc.frequency.setTargetAtTime(f, c.currentTime, glide); },
      setGain(v){ gain.gain.setTargetAtTime(Math.max(0.0001, v), c.currentTime, 0.02); },
      stop(rel=0.1){
        gain.gain.cancelScheduledValues(c.currentTime);
        gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + rel);
        osc.stop(c.currentTime + rel + 0.03);
      }
    };
  }

  /* Draw an analyser's live time-domain signal on a canvas, with grid. */
  function drawScope(canvas, analyser, color, {amp=0.9, width=2.4, glow=8}={}){
    const g = canvas.getContext('2d'), w=canvas.width, h=canvas.height, mid=h/2;
    g.clearRect(0,0,w,h);
    g.strokeStyle = cssVar('--rule'); g.lineWidth = 1; g.globalAlpha = 0.5;
    g.beginPath();
    for(let x=0;x<=w;x+=w/8){ g.moveTo(x,0); g.lineTo(x,h); }
    for(let y=0;y<=h;y+=h/4){ g.moveTo(0,y); g.lineTo(w,y); }
    g.stroke(); g.globalAlpha = 1;
    g.strokeStyle = cssVar('--rule-2'); g.beginPath(); g.moveTo(0,mid); g.lineTo(w,mid); g.stroke();
    if(!analyser) return;
    const data = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(data);
    g.strokeStyle = color; g.lineWidth = width; g.shadowColor = color; g.shadowBlur = glow;
    g.beginPath();
    for(let i=0;i<data.length;i++){ const x=i/(data.length-1)*w; const y=mid-data[i]*mid*amp; i?g.lineTo(x,y):g.moveTo(x,y); }
    g.stroke(); g.shadowBlur = 0;
  }

  /* Draw a faint static reference sine (for idle canvases). */
  function drawIdle(canvas, cycles=4){
    const g = canvas.getContext('2d'), w=canvas.width, h=canvas.height, mid=h/2;
    g.clearRect(0,0,w,h);
    g.strokeStyle = cssVar('--rule'); g.lineWidth = 1; g.globalAlpha = 0.5;
    g.beginPath();
    for(let x=0;x<=w;x+=w/8){ g.moveTo(x,0); g.lineTo(x,h); }
    for(let y=0;y<=h;y+=h/4){ g.moveTo(0,y); g.lineTo(w,y); }
    g.stroke(); g.globalAlpha = 1;
    g.strokeStyle = cssVar('--ink-3'); g.lineWidth = 1.6; g.globalAlpha = 0.45;
    g.beginPath();
    for(let x=0;x<=w;x++){ const y=mid-Math.sin(x/w*Math.PI*2*cycles)*mid*0.3; x?g.lineTo(x,y):g.moveTo(x,y); }
    g.stroke(); g.globalAlpha = 1;
  }

  return { ensure, cssVar, noteName, freqToMidi, midiToFreq, pluck, voice, drawScope, drawIdle, get ctx(){ return ctx; } };
})();
