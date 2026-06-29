/* Synthesized sound effects via Web Audio. No external files.
   Toggle with JSound.enabled. Lazily creates an AudioContext on first user gesture.
*/
(function () {
  let ctx = null;
  let master = null;
  const state = { enabled: true, volume: 0.5 };

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = state.volume;
      master.connect(ctx.destination);
    } catch (e) { /* no audio */ }
  }

  function tone({ freq = 440, type = 'sine', dur = 0.15, gain = 0.3, attack = 0.005, decay = null, slideTo = null, when = 0 }) {
    if (!ctx || !state.enabled) return;
    const t0 = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    const peak = gain;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  // short filtered-noise burst (shuffle / card slide)
  function noise({ dur = 0.12, gain = 0.18, type = 'highpass', freq = 1200, when = 0 }) {
    if (!ctx || !state.enabled) return;
    const t0 = ctx.currentTime + when;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = type; filt.frequency.value = freq;
    const g = ctx.createGain(); g.gain.value = gain;
    src.connect(filt); filt.connect(g); g.connect(master);
    src.start(t0);
  }

  const API = {
    get enabled() { return state.enabled; },
    set enabled(v) { state.enabled = v; if (v) ensure(); },
    setVolume(v) { state.volume = v; if (master) master.gain.value = v; },
    unlock() { ensure(); },

    click() { ensure(); tone({ freq: 660, type: 'triangle', dur: 0.05, gain: 0.18 }); },
    deal() { ensure(); noise({ dur: 0.09, gain: 0.16, freq: 1600 }); },
    play() { ensure(); noise({ dur: 0.08, gain: 0.2, freq: 900 }); tone({ freq: 320, type: 'sine', dur: 0.06, gain: 0.12 }); },
    bid() { ensure(); tone({ freq: 520, type: 'triangle', dur: 0.1, gain: 0.2, slideTo: 720 }); },
    trickWin() {
      ensure();
      tone({ freq: 523, type: 'sine', dur: 0.12, gain: 0.22 });
      tone({ freq: 784, type: 'sine', dur: 0.16, gain: 0.18, when: 0.07 });
    },
    roundEnd() {
      ensure();
      [392, 523, 659].forEach((f, i) => tone({ freq: f, type: 'sine', dur: 0.22, gain: 0.18, when: i * 0.1 }));
    },
    win() {
      ensure();
      [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.3, gain: 0.2, when: i * 0.12 }));
    },
    error() { ensure(); tone({ freq: 200, type: 'sawtooth', dur: 0.12, gain: 0.15, slideTo: 140 }); },
    your() { ensure(); tone({ freq: 880, type: 'sine', dur: 0.18, gain: 0.16, slideTo: 1100 }); },
  };

  window.JSound = API;
})();
