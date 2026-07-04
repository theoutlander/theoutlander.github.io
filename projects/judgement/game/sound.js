/* Modern synthesized sound design via Web Audio. No external files.
   A real signal chain: voices -> (dry) master + (wet) reverb -> soft compressor -> out.
   Sounds are layered & enveloped (mallet/marimba tones, felt card flicks, bell chimes)
   so they feel warm and premium rather than like raw beeps.
   Toggle with JSound.enabled. Lazily creates an AudioContext on first user gesture.
*/
(function () {
  let ctx = null, master = null, comp = null, wetBus = null, reverb = null;
  const state = { enabled: true, volume: 0.5, theme: 'modern' };

  function makeIR(dur, decay) {
    const rate = ctx.sampleRate, len = Math.floor(rate * dur);
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.003; comp.release.value = 0.2;
      master = ctx.createGain(); master.gain.value = state.volume;
      master.connect(comp); comp.connect(ctx.destination);
      reverb = ctx.createConvolver(); reverb.buffer = makeIR(1.8, 2.6);
      wetBus = ctx.createGain(); wetBus.gain.value = 1;
      wetBus.connect(reverb); reverb.connect(master);
    } catch (e) { /* no audio */ }
  }

  // a single enveloped oscillator voice, with optional pitch slide, lowpass body, and reverb send
  function voice(o) {
    if (!ctx || !state.enabled) return;
    const { freq = 440, type = 'sine', dur = 0.3, gain = 0.2, attack = 0.004,
      slideTo = null, detune = 0, cutoff = null, wet = 0.16, when = 0 } = o;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = type; osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    if (detune) osc.detune.value = detune;
    let node = osc;
    if (cutoff) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cutoff; osc.connect(lp); node = lp; }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    node.connect(g); g.connect(master);
    if (wet > 0 && wetBus) { const s = ctx.createGain(); s.gain.value = wet; g.connect(s); s.connect(wetBus); }
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  // warm mallet: fundamental + soft octave shimmer, short decay (marimba/keys feel)
  function mallet(freq, { dur = 0.34, gain = 0.22, wet = 0.2, when = 0 } = {}) {
    voice({ freq, type: 'sine', dur, gain, cutoff: freq * 6, wet, when });
    voice({ freq: freq * 2.01, type: 'sine', dur: dur * 0.55, gain: gain * 0.32, wet: wet * 0.8, when });
    voice({ freq: freq * 0.5, type: 'triangle', dur: dur * 0.7, gain: gain * 0.25, wet: 0, when });
  }

  // filtered-noise burst with a fast percussive envelope (card on felt, shuffles)
  function noiseBurst(o) {
    if (!ctx || !state.enabled) return;
    const { dur = 0.12, gain = 0.18, type = 'bandpass', freq = 2200, q = 0.8, sweepTo = null, wet = 0.1, when = 0 } = o;
    const t0 = ctx.currentTime + when;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) { const k = i / n; data[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 1.6); }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = type; filt.frequency.setValueAtTime(freq, t0); filt.Q.value = q;
    if (sweepTo) filt.frequency.exponentialRampToValueAtTime(Math.max(60, sweepTo), t0 + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt); filt.connect(g); g.connect(master);
    if (wet > 0 && wetBus) { const s = ctx.createGain(); s.gain.value = wet; g.connect(s); s.connect(wetBus); }
    src.start(t0);
  }

  // notes (Hz) for pleasant musical cues
  const N = { C4: 261.6, D4: 293.7, E4: 329.6, G4: 392.0, A4: 440.0, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784.0, A5: 880.0, C6: 1046.5, E6: 1318.5 };
  // an Indian-flavoured scale (raga-ish: Sa Re Ga Ma Pa Dha Ni Sa)
  const RAGA = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 493.9, 523.3];

  // tabla-style pitched drum: resonant membrane with a fast pitch drop + tuned ring
  function tabla(base, o) {
    o = o || {}; const gain = o.gain || 0.26, dur = o.dur || 0.4, when = o.when || 0;
    voice({ freq: base, type: 'sine', dur: dur, gain: gain, slideTo: base * 0.55, wet: 0.14, attack: 0.001, when });
    voice({ freq: base * 2.4, type: 'sine', dur: dur * 0.5, gain: gain * 0.5, slideTo: base * 1.4, wet: 0.1, attack: 0.001, when }); // tuned overtone ("tin")
    voice({ freq: base * 3.8, type: 'sine', dur: dur * 0.28, gain: gain * 0.22, slideTo: base * 2.2, wet: 0.06, when });
    noiseBurst({ dur: 0.02, gain: gain * 0.28, freq: 1800, q: 1.6, wet: 0.02, when });
  }
  // Karplus-Strong plucked string — genuine sitar/guitar-like timbre (noise burst + comb feedback)
  function pluck(freq, o) {
    if (!ctx || !state.enabled) return;
    o = o || {}; const gain = o.gain || 0.42, dur = o.dur || 1.1, wet = o.wet == null ? 0.32 : o.wet, when = o.when || 0, decay = o.decay || 0.996;
    const t0 = ctx.currentTime + when;
    const N = Math.max(2, Math.round(ctx.sampleRate / freq));
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
    for (let i = N; i < len; i++) d[i] = decay * 0.5 * (d[i - N] + d[i - N + 1]);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = gain;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(8000, freq * 7);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 90;
    src.connect(lp); lp.connect(hp); hp.connect(g); g.connect(master);
    if (wet > 0 && wetBus) { const s = ctx.createGain(); s.gain.value = wet; g.connect(s); s.connect(wetBus); }
    src.start(t0);
  }

  const API = {
    get enabled() { return state.enabled; },
    set enabled(v) { state.enabled = v; if (v) ensure(); },
    setVolume(v) { state.volume = v; if (master) master.gain.value = v; },
    setTheme(t) { state.theme = (t === 'indian') ? 'indian' : 'modern'; },
    unlock() { ensure(); },

    // soft UI tick
    click() { ensure(); voice({ freq: 1180, type: 'triangle', dur: 0.045, gain: 0.12, cutoff: 4000, wet: 0.05 }); },
    // dealing: light, airy card flick
    deal() {
      ensure();
      if (state.theme === 'indian') { tabla(165, { gain: 0.12, dur: 0.14 }); return; }
      noiseBurst({ dur: 0.085, gain: 0.13, freq: 3200, sweepTo: 1400, q: 0.6, wet: 0.06 }); voice({ freq: 240, type: 'sine', dur: 0.05, gain: 0.06, wet: 0 });
    },
    // playing a card: satisfying flick + soft felt thump
    play() {
      ensure();
      if (state.theme === 'indian') { tabla(150, { gain: 0.22, dur: 0.26 }); return; }
      noiseBurst({ dur: 0.1, gain: 0.16, freq: 2600, sweepTo: 700, q: 0.7, wet: 0.08 });
      voice({ freq: 150, type: 'sine', dur: 0.13, gain: 0.16, slideTo: 90, wet: 0.05 });
    },
    // selecting / arming a number: gentle wooden tap
    click2() { ensure(); if (state.theme === 'indian') { tabla(240, { gain: 0.13, dur: 0.12 }); return; } mallet(N.A4, { dur: 0.2, gain: 0.16, wet: 0.14 }); },
    // confirming a bid: warm rising two-note mallet / sitar pluck
    bid() {
      ensure();
      if (state.theme === 'indian') { pluck(RAGA[2], { dur: 0.9, gain: 0.42 }); pluck(RAGA[4], { when: 0.11, dur: 1.0, gain: 0.4 }); return; }
      mallet(N.D5, { dur: 0.26, gain: 0.18, wet: 0.22 }); mallet(N.A5, { dur: 0.3, gain: 0.16, wet: 0.26, when: 0.09 });
    },
    // winning a trick: bright bell / tabla + pluck
    trickWin() {
      ensure();
      if (state.theme === 'indian') { tabla(190, { gain: 0.24, dur: 0.34 }); pluck(RAGA[5], { when: 0.07, dur: 1.1, gain: 0.42 }); return; }
      mallet(N.E5, { dur: 0.3, gain: 0.2, wet: 0.3 }); mallet(N.A5, { dur: 0.42, gain: 0.17, wet: 0.36, when: 0.1 });
    },
    // round over: warm arpeggio / short raga phrase
    roundEnd() {
      ensure();
      if (state.theme === 'indian') { [RAGA[0], RAGA[2], RAGA[4]].forEach((f, i) => pluck(f, { when: i * 0.16, dur: 1.0, gain: 0.4 })); return; }
      [N.C5, N.E5, N.G5].forEach((f, i) => mallet(f, { dur: 0.5, gain: 0.16, wet: 0.34, when: i * 0.12 }));
    },
    // game won: full celebratory run / ascending raga + tabla
    win() {
      ensure();
      if (state.theme === 'indian') {
        RAGA.forEach((f, i) => pluck(f, { when: i * 0.12, dur: 1.0, gain: 0.4 }));
        [0, 0.24, 0.48].forEach((w) => tabla(150, { gain: 0.2, dur: 0.3, when: 0.12 + w }));
        return;
      }
      [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => mallet(f, { dur: 0.55, gain: 0.18, wet: 0.4, when: i * 0.11 }));
      [N.C5, N.E5, N.G5].forEach((f) => mallet(f, { dur: 1.1, gain: 0.12, wet: 0.5, when: 0.5 }));
    },
    // gentle, non-harsh "not allowed"
    error() { ensure(); voice({ freq: 196, type: 'sine', dur: 0.16, gain: 0.16, slideTo: 150, cutoff: 900, wet: 0.06 }); },
    // soft attention chime when it becomes your turn
    your() { ensure(); mallet(N.G5, { dur: 0.26, gain: 0.16, wet: 0.28 }); mallet(N.C6, { dur: 0.34, gain: 0.14, wet: 0.32, when: 0.1 }); },
  };

  window.JSound = API;
})();
