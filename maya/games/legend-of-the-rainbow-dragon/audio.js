/* ============================================================
   Legend of the Rainbow Dragon — AUDIO ENGINE
   Web Audio only. Gentle looping music + rich SFX + mute toggle.
   ============================================================ */
window.LORD = window.LORD || {};

LORD.Audio = (function () {
  let ctx = null;
  let master = null;
  let musicGain = null;
  let muted = false;
  let musicTimer = null;
  let currentTrack = null;

  function ensure() {
    if (window.MayaIOSAudioUnlock) window.MayaIOSAudioUnlock.unlock();
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.0;
      musicGain.connect(master);
    } catch (e) { ctx = null; }
  }

  function resume() {
    ensure();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  // ---- one-shot tone ----
  function tone(freq, dur, type, when, vol, dest) {
    if (!ctx) return;
    const t = when || ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    const v = (vol == null ? 0.14 : vol);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function slide(f1, f2, dur, type, vol) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sawtooth';
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, vol) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = vol || 0.12;
    src.connect(g); g.connect(master); src.start(t);
  }

  const N = { C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392, A4:440, B4:493.88,
              C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880, C6:1046.5 };

  // ---- SFX ----
  const SFX = {
    tap()    { resume(); tone(660, 0.06, 'sine', 0, 0.08); },
    hit()    { resume(); tone(200, 0.08, 'square', 0, 0.13); noise(0.06, 0.06); },
    super()  { resume(); [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, 0.12, 'square', ctx && ctx.currentTime + i * 0.05, 0.13)); },
    coin()   { resume(); tone(N.E5, 0.07, 'square', 0, 0.1); tone(N.A5, 0.1, 'square', ctx && ctx.currentTime + 0.06, 0.1); },
    win()    { resume(); [N.C5, N.E5, N.G5].forEach((f, i) => tone(f, 0.14, 'triangle', ctx && ctx.currentTime + i * 0.07, 0.13)); },
    level()  { resume(); [N.C5, N.D5, N.E5, N.G5, N.C6].forEach((f, i) => tone(f, 0.16, 'square', ctx && ctx.currentTime + i * 0.09, 0.14)); },
    fanfare(){ resume(); const seq=[N.G4,N.C5,N.E5,N.G5,N.E5,N.G5,N.C6]; seq.forEach((f,i)=>tone(f,0.22,'triangle',ctx&&ctx.currentTime+i*0.12,0.15)); },
    oops()   { resume(); slide(330, 160, 0.3, 'sine', 0.12); },
    flee()   { resume(); slide(500, 900, 0.18, 'sine', 0.1); },
    shop()   { resume(); tone(880, 0.06, 'square', 0, 0.1); tone(N.C6, 0.08, 'square', ctx && ctx.currentTime + 0.05, 0.1); },
    bard()   { resume(); [N.C5,N.E5,N.D5,N.F5,N.E5].forEach((f,i)=>tone(f,0.13,'triangle',ctx&&ctx.currentTime+i*0.1,0.12)); },
    roar()   { resume(); slide(180, 90, 0.5, 'sawtooth', 0.16); },
    sparkle(){ resume(); tone(N.A5, 0.05, 'sine', 0, 0.07); tone(N.C6, 0.06, 'sine', ctx && ctx.currentTime + 0.04, 0.06); },
  };

  // ---- Background music: looping arpeggio over a chord cycle ----
  // Several town "tunes" she can pick in the Music Stage jukebox.
  const TRACKS = {
    battle: { tempo: 0.2, wave: 'square', vol: 0.05,
      chords: [[N.A4*0.5,N.C4,N.E4,N.A4],[N.A4*0.5,N.C4,N.E4,N.A4],[N.F4,N.A4,N.C5,N.F5],[N.G4,N.B4,N.D5,N.G5]] },
    dragon: { tempo: 0.17, wave: 'sawtooth', vol: 0.05,
      chords: [[N.C4,N.E4,N.G4,N.C5],[N.G4,N.B4,N.D5,N.G5],[N.A4*0.5,N.C4,N.E4,N.A4],[N.F4,N.A4,N.C5,N.F5]] },
  };
  const TUNES = {
    sparkle: { tempo: 0.34, wave: 'triangle', vol: 0.06,
      chords: [[N.C4,N.E4,N.G4,N.C5],[N.A4*0.5,N.C4,N.E4,N.A4],[N.F4,N.A4,N.C5,N.F5],[N.G4,N.B4,N.D5,N.G5]] },
    lullaby: { tempo: 0.5, wave: 'sine', vol: 0.06,
      chords: [[N.C4,N.E4,N.G4,N.C5],[N.F4,N.A4,N.C5,N.F5],[N.D4,N.F4,N.A4,N.D5],[N.G4,N.B4,N.D5,N.G5]] },
    march: { tempo: 0.24, wave: 'square', vol: 0.05,
      chords: [[N.C4,N.G4,N.C5,N.E5],[N.G4,N.D5,N.G5,N.B4],[N.A4*0.5,N.E4,N.A4,N.C5],[N.F4,N.C5,N.F5,N.A4]] },
    disco: { tempo: 0.18, wave: 'square', vol: 0.05,
      chords: [[N.A4*0.5,N.C4,N.E4,N.A4],[N.A4*0.5,N.E4,N.A4,N.C5],[N.F4,N.A4,N.C5,N.F5],[N.G4,N.B4,N.D5,N.G5]] },
    rainbow: { tempo: 0.42, wave: 'triangle', vol: 0.055,
      chords: [[N.C4,N.E4,N.G4,N.B4],[N.A4*0.5,N.C4,N.E4,N.G4],[N.F4,N.A4,N.C5,N.E5],[N.G4,N.B4,N.D5,N.F5]] },
  };
  let townTune = 'sparkle';

  let step = 0;
  function scheduleLoop(name) {
    if (!ctx || muted) return;
    const key = (name === 'town') ? townTune : name;
    const tr = TRACKS[key] || TUNES[key]; if (!tr) return;
    const chord = tr.chords[Math.floor(step / 4) % tr.chords.length];
    const note = chord[step % 4];
    // arpeggio note
    const t = ctx.currentTime;
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = tr.wave; o.frequency.value = note;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(tr.vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + tr.tempo * 0.95);
    o.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + tr.tempo);
    // soft bass on downbeat
    if (step % 4 === 0) {
      const b = ctx.createOscillator(); const bg = ctx.createGain();
      b.type = 'sine'; b.frequency.value = chord[0] / 2;
      bg.gain.setValueAtTime(0.0001, t);
      bg.gain.exponentialRampToValueAtTime(tr.vol * 1.4, t + 0.04);
      bg.gain.exponentialRampToValueAtTime(0.0001, t + tr.tempo * 3.5);
      b.connect(bg); bg.connect(musicGain);
      b.start(t); b.stop(t + tr.tempo * 4);
    }
    step++;
    musicTimer = setTimeout(() => scheduleLoop(name), tr.tempo * 1000);
  }

  function playMusic(name) {
    resume();
    if (!ctx) return;
    if (currentTrack === name) return;
    currentTrack = name;
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
    step = 0;
    if (musicGain) musicGain.gain.linearRampToValueAtTime(muted ? 0 : 1, ctx.currentTime + 0.6);
    scheduleLoop(name);
  }

  function stopMusic() {
    currentTrack = null;
    if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
  }

  function setMuted(m) {
    muted = m;
    if (musicGain && ctx) musicGain.gain.value = m ? 0 : 1;
    if (master && ctx) master.gain.value = m ? 0 : 0.9;
    try { localStorage.setItem('lord_muted', m ? '1' : '0'); } catch (e) {}
  }
  function isMuted() { return muted; }
  function loadMuted() {
    try { muted = localStorage.getItem('lord_muted') === '1'; } catch (e) {}
    return muted;
  }

  function setTune(name) {
    if (!TUNES[name]) return;
    townTune = name;
    try { localStorage.setItem('lord_tune', name); } catch (e) {}
    if (currentTrack === 'town') {
      if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
      step = 0; scheduleLoop('town');
    }
  }
  function getTune() { return townTune; }
  function loadTune() {
    try { const t = localStorage.getItem('lord_tune'); if (t && TUNES[t]) townTune = t; } catch (e) {}
    return townTune;
  }
  function tuneList() { return Object.keys(TUNES); }

  function sfx(name) { if (muted) return; if (SFX[name]) SFX[name](); }

  return { resume, sfx, playMusic, stopMusic, setMuted, isMuted, loadMuted, setTune, getTune, loadTune, tuneList };
})();
