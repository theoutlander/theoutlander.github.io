/* Shared sound control for every game.

   The problem: each of the 17 games builds its own WebAudio graph and connects it straight to
   ctx.destination. Some have a mute button, most don't, and none of them agree on how it works.
   Retrofitting a mute into 17 hand-rolled audio graphs would be 17 chances to break a game.

   Instead we intercept at the one place they all share: AudioContext.destination. Every game
   connects there, so if `destination` hands back OUR gain node — which is itself wired to the
   real speakers — then one gain controls every sound in every game, and no game needs to know.

   Mute state lives in localStorage (guarded — a bare read is what killed Dust Chasers) and is
   shared across the portal and the game iframe, which are same-origin.

   BACKGROUND MUSIC (second half of this file) rides the same trick: it opens its own
   AudioContext through the patched constructor, so its output lands on a master gain too and
   the existing mute silences it for free. No game file knows music exists. */
(function () {
	'use strict';

	var MUTE_KEY = 'maya_muted';

	function readMuted() {
		try {
			return window.localStorage.getItem(MUTE_KEY) === '1';
		} catch (e) {
			return false; // storage blocked → default to sound ON, never silently mute her
		}
	}
	function writeMuted(m) {
		try {
			window.localStorage.setItem(MUTE_KEY, m ? '1' : '0');
		} catch (e) {}
	}

	var muted = readMuted();
	var masters = []; // one per AudioContext a game creates

	function applyToMaster(g) {
		var target = muted ? 0 : 1;
		try {
			var ctx = g.context;
			g.gain.cancelScheduledValues(ctx.currentTime);
			if (ctx.state === 'running') {
				// Ramp rather than snap: an instant gain change on a live oscillator clicks audibly.
				g.gain.setTargetAtTime(target, ctx.currentTime, 0.015);
			} else {
				// A suspended context has a FROZEN clock (currentTime stays 0), so a scheduled ramp
				// would never advance and the mute would silently do nothing. Set it outright.
				g.gain.value = target;
			}
		} catch (e) {
			try {
				g.gain.value = target;
			} catch (e2) {}
		}
	}

	function applyAll() {
		for (var i = 0; i < masters.length; i++) applyToMaster(masters[i]);
	}

	/* ===== The interception =====
	   Games do `node.connect(ctx.destination)`. We hand them a GainNode instead of the real
	   destination, so all of their audio passes through something we control. */
	(function patchAudioContext() {
		var Native = window.AudioContext || window.webkitAudioContext;
		if (!Native) return;

		function Patched() {
			var ctx = new Native();
			try {
				var master = ctx.createGain();
				master.gain.value = muted ? 0 : 1;
				master.connect(ctx.destination); // the REAL destination, read off the prototype
				masters.push(master);
				// From here on, this context's `destination` IS our master gain.
				Object.defineProperty(ctx, 'destination', {
					get: function () {
						return master;
					},
					configurable: true,
				});
			} catch (e) {
				/* if anything here fails, the game still works — it just can't be muted */
			}
			return ctx;
		}
		Patched.prototype = Native.prototype;
		window.AudioContext = Patched;
		if (window.webkitAudioContext) window.webkitAudioContext = Patched;
	})();

	function setMuted(m) {
		muted = !!m;
		writeMuted(muted);
		applyAll();
		render();
		syncMusic(); // muted → stop the music engine outright, don't just gain it to zero
		// The portal and the game live in two documents. Keep them in step.
		try {
			if (window.parent && window.parent !== window) {
				window.parent.postMessage({ type: 'maya:mute', muted: muted }, '*');
			}
			var f = document.getElementById('gf');
			if (f && f.contentWindow) f.contentWindow.postMessage({ type: 'maya:mute', muted: muted }, '*');
		} catch (e) {}
	}

	window.addEventListener('message', function (e) {
		if (e.data && e.data.type === 'maya:mute' && e.data.muted !== muted) {
			muted = !!e.data.muted;
			applyAll();
			render();
			syncMusic();
		}
	});

	// Another tab (or the other document) changed it.
	window.addEventListener('storage', function (e) {
		if (e.key === MUTE_KEY) {
			muted = readMuted();
			applyAll();
			render();
			syncMusic();
		}
	});

	/* ===== The button =====
	   Bottom-left: every game's HUD lives along the top and the portal's Back button is
	   top-left, so this is the one corner that's reliably free. 48px — comfortably above the
	   44px minimum for an 8-year-old's thumb on an iPad. */
	var btn = null;
	function render() {
		if (!btn) return;
		btn.textContent = muted ? '🔇' : '🔊';
		btn.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
		btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
	}

	/* Seventeen games, each with its own hand-rolled HUD — there is no single corner that is
	   free in all of them (pipe-flow parks a toolbar bottom-left, others put controls there).
	   Rather than special-case each game, the button looks underneath itself and moves if it
	   is covering something you could tap. Re-checked as screens change, because a game's
	   menu and its play screen have different layouts.

	   Bottom-right is deliberately never used: that is the family chat button. */
	var SPOTS = [
		{ left: '12px', bottom: '12px' }, // default: bottom-left
		{ left: '12px', bottom: '84px' }, // raised, clears a bottom toolbar
		{ left: '12px', bottom: '156px' },
		{ left: '12px', top: '76px' }, // below the portal's Back button
	];

	/* `ignore` is the set of element ids this probe is allowed to sit on top of.
	   The mute button ignores the music button (mute has priority and never yields to it —
	   otherwise the two would chase each other around the screen forever). The music button
	   ignores only itself, so it treats the mute button, the Back button and every game control
	   as a solid obstacle and moves out of the way. */
	function occupiedFor(x, y, ignore) {
		var stack;
		try {
			stack = document.elementsFromPoint(x, y);
		} catch (e) {
			return false;
		}
		for (var i = 0; i < stack.length; i++) {
			var el = stack[i];
			if (ignore.indexOf(el.id) !== -1) continue;
			var tag = el.tagName;
			if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT') return true;
			if (tag === 'HTML' || tag === 'BODY') continue;
			try {
				if (window.getComputedStyle(el).cursor === 'pointer') return true;
			} catch (e) {}
		}
		return false;
	}

	function occupied(x, y) {
		return occupiedFor(x, y, ['maya-mute', 'maya-music']);
	}

	function place() {
		if (!btn) {
			placeMusic();
			return;
		}
		for (var i = 0; i < SPOTS.length; i++) {
			var s = SPOTS[i];
			btn.style.top = s.top || '';
			btn.style.bottom = s.bottom || '';
			btn.style.left = s.left;
			var r = btn.getBoundingClientRect();
			if (!occupied(r.left + r.width / 2, r.top + r.height / 2)) break; // found a clear spot
		}
		// Everything is crowded — leave it at the last position rather than hide the control.
		// The music button hangs off wherever the mute button ended up, so it goes last.
		placeMusic();
	}

	function mount() {
		if (!document.body) return;
		if (btn && document.contains(btn)) return;
		// Only games get the button. The portal opens a game in a full-viewport iframe, so if the
		// portal mounted one too you would see two stacked on top of each other — and the portal
		// has no game audio to mute anyway. window.MAYA_GAME is set only by game pages.
		if (!window.MAYA_GAME) return;
		btn = document.createElement('button');
		btn.id = 'maya-mute';
		btn.type = 'button';
		btn.style.cssText = [
			'position:fixed',
			'left:12px',
			'bottom:12px',
			'z-index:2147483000',
			'width:48px',
			'height:48px',
			'border-radius:50%',
			'border:2px solid rgba(255,255,255,.35)',
			'background:rgba(20,12,45,.72)',
			'color:#fff',
			'font-size:22px',
			'line-height:1',
			'cursor:pointer',
			'display:flex',
			'align-items:center',
			'justify-content:center',
			'padding:0',
			'-webkit-backdrop-filter:blur(6px)',
			'backdrop-filter:blur(6px)',
			'touch-action:manipulation',
			'user-select:none',
			'-webkit-user-select:none',
		].join(';');
		// pointerdown, not click: several games swallow clicks on the canvas for gameplay.
		btn.addEventListener('pointerdown', function (e) {
			e.preventDefault();
			e.stopPropagation();
			setMuted(!muted);
		});
		document.body.appendChild(btn);
		render();
		mountMusic();
		place();
		// Games swap between menu / play / end screens, each with a different layout, so a spot
		// that was clear at load can be covered a second later. Re-check as the game settles.
		setTimeout(place, 800);
		setTimeout(place, 2500);
	}

	/* maya-shop and sparkle-duel are exported bundles: they unpack themselves and then
	   `document.documentElement.replaceWith(...)`, throwing away the body — and this button with
	   it. Watching `document` (not documentElement, which is what gets replaced) lets us come
	   back, and doubles as the cue to re-check placement when a game swaps screens. */
	var pending = 0;
	function onDomChanged() {
		if (pending) return;
		pending = setTimeout(function () {
			pending = 0;
			if (btn && !document.contains(btn)) btn = null;
			if (musicBtn && !document.contains(musicBtn)) musicBtn = null;
			if (!btn) mount();
			else {
				if (!musicBtn) mountMusic();
				place();
			}
		}, 250);
	}
	if (window.MAYA_GAME) {
		try {
			new MutationObserver(onDomChanged).observe(document, { childList: true, subtree: true });
		} catch (e) {}
	}
	window.addEventListener('resize', place);

	/* ============================================================================================
	   BACKGROUND MUSIC
	   ============================================================================================

	   Constraints that shaped this:
	   - Zero per-game edits. Every game already loads this file, so the music has to live here and
	     find everything it needs on its own. It gets the game's identity from window.MAYA_GAME.
	   - No audio files. There isn't a single asset in this project and there won't be one on
	     Maya's iPad data plan, so the music is generated: oscillators, a noise buffer, and a
	     scheduler. Same toolkit every game already uses for its sound effects.
	   - It must sit UNDER the game. Effects go straight into the master gain at full level; music
	     goes through its own gain at 0.25 first, so it is always the quieter layer. That gain is
	     the one knob to turn if it ever feels loud.
	   - It must not leak. A generative track that ran for twenty minutes creating a node per note
	     and never releasing them would leave a few thousand oscillators behind and kill the tab.
	     Every scheduled note disconnects itself in onended (see `voice`), and the scheduler
	     resyncs instead of catching up if the clock jumped (see `tick`) — which is what actually
	     happens when the iPad sleeps or Maya switches apps, and is the burst that would otherwise
	     spawn hundreds of nodes at once. `mayaSound.music.stats()` reports created vs. still-live.

	   Music has its OWN toggle, separate from mute: sound effects tell her what's happening in the
	   game, music is a mood — she may well want one without the other. Mute still wins over both. */

	var MUSIC_KEY = 'maya_music';
	/* Music sits UNDER the game, not next to it. 0.25 was still loud enough to be the thing you
	   noticed instead of the thing you felt — "too loud, needs to be subtle in the background".
	   Effects arrive at the master at 1.0; this is the only attenuation on the music path, so it
	   is the one knob that matters. */
	var MUSIC_LEVEL = 0.12;

	function readMusicOn() {
		try {
			return window.localStorage.getItem(MUSIC_KEY) !== '0'; // default ON
		} catch (e) {
			return true; // storage blocked → same default, never a dead-silent game
		}
	}
	function writeMusicOn(on) {
		try {
			window.localStorage.setItem(MUSIC_KEY, on ? '1' : '0');
		} catch (e) {}
	}

	/* ===== Per-game character =====
	   Seventeen games playing the same loop would be worse than no music at all. Each game gets a
	   key, a scale, a tempo and a set of waveforms chosen to match what it feels like to play:
	   dust-chasers is a haunted house, spell-it is a bright classroom, the sewing games are calm.
	   This table is not a per-game edit — no game file knows it exists; the slug is the only link.

	   root  — MIDI note of the tonic (48 = C3, 60 = C4)
	   scale — the notes the melody and bass are allowed to use
	   bpm   — beats per minute
	   pad   — the sustained chord underneath ('sine' = soft, 'triangle' = present, 'sawtooth' = big)
	   lead  — the melody voice
	   density — 0..1, how often a beat gets a melody note (low = sparse and calm)
	   swing — 0..1, how far the offbeats are pushed late (a little groove)
	   gain  — per-game trim on top of MUSIC_LEVEL, for tracks whose voices are naturally louder */
	var SCALES = {
		major: [0, 2, 4, 5, 7, 9, 11],
		minor: [0, 2, 3, 5, 7, 8, 10],
		dorian: [0, 2, 3, 5, 7, 9, 10],
		lydian: [0, 2, 4, 6, 7, 9, 11],
		majPent: [0, 2, 4, 7, 9],
		minPent: [0, 3, 5, 7, 10],
		mixolydian: [0, 2, 4, 5, 7, 9, 10],
	};

	var PROFILES = {
		// Haunted house. Low minor drone, almost no melody, slow — it should feel like a corridor.
		'dust-chasers': { root: 45, scale: 'minor', bpm: 68, pad: 'sawtooth', lead: 'triangle', density: 0.22, swing: 0, gain: 0.8 },
		// Spelling. Bright, major, skippy — school should not sound like homework.
		'spell-it': { root: 60, scale: 'majPent', bpm: 112, pad: 'triangle', lead: 'square', density: 0.6, swing: 0.16, gain: 0.9 },
		// It IS a music game. Anything under it would fight her playing. No track, no button.
		'pinata-piano': { mode: 'none' },
		// Marching, heroic, minor-but-driving.
		'castle-defenders': { root: 48, scale: 'dorian', bpm: 104, pad: 'sawtooth', lead: 'square', density: 0.5, swing: 0, gain: 0.75 },
		'castle-defenders-2': { root: 50, scale: 'dorian', bpm: 110, pad: 'sawtooth', lead: 'square', density: 0.55, swing: 0, gain: 0.75 },
		// Puzzle. Thinking music: sparse, floating, no pulse to rush her.
		'pipe-flow': { root: 57, scale: 'lydian', bpm: 76, pad: 'sine', lead: 'sine', density: 0.3, swing: 0, gain: 1 },
		// Kitchen. Busy little diner shuffle, warm.
		'mayas-kitchen': { root: 55, scale: 'mixolydian', bpm: 120, pad: 'triangle', lead: 'triangle', density: 0.55, swing: 0.22, gain: 0.9 },
		// Sewing: calm, unhurried, soft. These are the "sit quietly and make something" games.
		'mayas-sewing-shop': { root: 53, scale: 'major', bpm: 72, pad: 'sine', lead: 'sine', density: 0.32, swing: 0.12, gain: 1 },
		'mayas-sewing-museum': { root: 53, scale: 'lydian', bpm: 64, pad: 'sine', lead: 'sine', density: 0.24, swing: 0.1, gain: 1 },
		// Building toys. Open, airy, no urgency.
		'skyline-builder': { root: 55, scale: 'majPent', bpm: 84, pad: 'sine', lead: 'triangle', density: 0.35, swing: 0.1, gain: 1 },
		'build-on': { root: 57, scale: 'majPent', bpm: 88, pad: 'sine', lead: 'triangle', density: 0.38, swing: 0.1, gain: 1 },
		'garden-work-update': { root: 52, scale: 'major', bpm: 78, pad: 'sine', lead: 'sine', density: 0.3, swing: 0.14, gain: 1 },
		// Shops. Chirpy, light, a bit of a jingle.
		'maya-shop': { root: 62, scale: 'majPent', bpm: 100, pad: 'triangle', lead: 'square', density: 0.45, swing: 0.18, gain: 0.85 },
		'mayas-delivery-service': { root: 59, scale: 'mixolydian', bpm: 116, pad: 'triangle', lead: 'square', density: 0.5, swing: 0.2, gain: 0.85 },
		// Escape room. Tense, low, sparse — suspense, not scares.
		/* NO generic music. The Escape Room has its own designed per-room ambient soundscapes —
		   layering a procedural bed on top meant two soundtracks fighting each other, and the
		   generic one (at the loudest gain in this table, no less) won. A game that has real sound
		   design should never get a stock backing track; the rule is "fill silence", not "add
		   music everywhere". Same reason pinata-piano is excluded: it IS the music. */
		'mayas-escape-room': { mode: 'none' },
		// RPG. Fantasy, modal, a proper wandering tune.
		'legend-of-the-rainbow-dragon': { root: 50, scale: 'dorian', bpm: 92, pad: 'sawtooth', lead: 'triangle', density: 0.45, swing: 0.12, gain: 0.8 },
		// Duel. Fast, punchy, minor pentatonic.
		'sparkle-duel': { root: 52, scale: 'minPent', bpm: 128, pad: 'sawtooth', lead: 'square', density: 0.55, swing: 0.14, gain: 0.75 },
	};

	// Anything not in the table (a brand new game, the _template) still gets music: a pleasant
	// default, deterministically varied by the slug so two new games don't sound the same.
	var DEFAULT_PROFILE = { root: 57, scale: 'majPent', bpm: 96, pad: 'sine', lead: 'triangle', density: 0.4, swing: 0.12, gain: 1 };

	function gameSlug() {
		var g = window.MAYA_GAME || '';
		var m = /games\/([^/]+)/.exec(g);
		return m ? m[1] : '';
	}

	// Small string hash → the seed for both the melody and the default-profile variation, so a
	// game's tune is the same every time she opens it. Music she recognises beats music she doesn't.
	function hashOf(s) {
		var h = 2166136261;
		for (var i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = (h * 16777619) >>> 0;
		}
		return h >>> 0;
	}

	function profileFor(slug) {
		var p = PROFILES[slug];
		if (p) return p;
		var h = hashOf(slug || 'maya');
		var keys = Object.keys(SCALES);
		var out = {};
		for (var k in DEFAULT_PROFILE) out[k] = DEFAULT_PROFILE[k];
		out.root = 50 + (h % 10); // a different key per unknown game
		out.scale = keys[(h >>> 4) % keys.length];
		out.bpm = 80 + ((h >>> 8) % 40);
		return out;
	}

	var slug = gameSlug();
	var profile = profileFor(slug);
	var hasTrack = !!window.MAYA_GAME && profile.mode !== 'none';
	var musicOn = readMusicOn();

	// mulberry32 — tiny seeded PRNG. Same seed → same tune, every session.
	function rng(seed) {
		var a = seed >>> 0;
		return function () {
			a = (a + 0x6d2b79f5) >>> 0;
			var t = a;
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function midiToFreq(m) {
		return 440 * Math.pow(2, (m - 69) / 12);
	}

	// The tune: a fixed 16-step bar of scale degrees, drawn once from the seeded PRNG. It repeats,
	// so it loops seamlessly by construction — there is no audio buffer with an edge to click on.
	var STEPS = 16;
	function buildPattern(p, seed) {
		var rand = rng(seed);
		var scale = SCALES[p.scale] || SCALES.majPent;
		var mel = [];
		var i;
		for (i = 0; i < STEPS; i++) {
			if (rand() > p.density) {
				mel.push(null); // rest — the space is what keeps it from becoming a ringtone
				continue;
			}
			var deg = Math.floor(rand() * scale.length);
			var oct = rand() < 0.25 ? 12 : 0;
			mel.push(scale[deg] + oct + 12); // melody sits an octave above the tonic
		}
		// Land the first step on the tonic so each loop clearly restarts on home.
		mel[0] = 0 + 12;
		// Bass: one note per half-bar, root / fifth / root / fourth — safe under any of the scales.
		var bass = [0, 7, 0, 5];
		return { mel: mel, bass: bass, scale: scale };
	}

	/* ===== Engine ===== */
	var mctx = null; // our own AudioContext — created through the patched constructor, so its
	// `destination` is a master gain and the existing mute silences music for free.
	var musicBus = null; // the 0.25 gain: the single reason music sits under the effects
	var padNodes = []; // long-lived: created once per start, stopped on stop. Not per note.
	var timer = 0;
	var running = false;
	var nextStepTime = 0;
	var step = 0;
	var pattern = null;
	var noiseBuf = null;
	var created = 0; // total note voices ever made
	var live = 0; // voices currently alive — this is the number that must NOT climb
	var resyncs = 0; // times we skipped ahead instead of catching up (tab was backgrounded)

	var LOOKAHEAD = 0.35; // seconds of music scheduled in advance
	var TICK_MS = 90; // how often we top it up

	function noise(ctx) {
		if (noiseBuf) return noiseBuf;
		var n = ctx.sampleRate * 0.4;
		noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
		var d = noiseBuf.getChannelData(0);
		for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
		return noiseBuf;
	}

	/* One note. The whole no-leak story is the onended handler: a scheduled oscillator fires
	   `ended` when it stops, we disconnect it there, and it becomes garbage. Nothing keeps a
	   reference to it afterwards, so the graph never grows. */
	function voice(type, freq, at, dur, level) {
		try {
			var osc = mctx.createOscillator();
			var g = mctx.createGain();
			osc.type = type;
			osc.frequency.setValueAtTime(freq, at);
			g.gain.setValueAtTime(0, at);
			g.gain.linearRampToValueAtTime(level, at + 0.02); // soft attack, no click
			g.gain.setTargetAtTime(0, at + dur * 0.5, dur * 0.25); // and a tail
			osc.connect(g);
			g.connect(musicBus);
			osc.start(at);
			osc.stop(at + dur + 0.1);
			created++;
			live++;
			osc.onended = function () {
				live--;
				try {
					osc.disconnect();
					g.disconnect();
				} catch (e) {}
			};
		} catch (e) {}
	}

	function tick(type, at, level) {
		try {
			var src = mctx.createBufferSource();
			var g = mctx.createGain();
			src.buffer = noise(mctx);
			var f = mctx.createBiquadFilter();
			f.type = type === 'hat' ? 'highpass' : 'lowpass';
			f.frequency.value = type === 'hat' ? 6000 : 220;
			g.gain.setValueAtTime(level, at);
			g.gain.exponentialRampToValueAtTime(0.0001, at + 0.08);
			src.connect(f);
			f.connect(g);
			g.connect(musicBus);
			src.start(at);
			src.stop(at + 0.1);
			created++;
			live++;
			src.onended = function () {
				live--;
				try {
					src.disconnect();
					f.disconnect();
					g.disconnect();
				} catch (e) {}
			};
		} catch (e) {}
	}

	function startPad() {
		// The chord under everything: tonic + fifth, slightly detuned, behind a slow filter sweep.
		// Two oscillators and an LFO for the whole session — these are created once, so they can't
		// leak no matter how long the game is open.
		var t = mctx.currentTime;
		var filt = mctx.createBiquadFilter();
		filt.type = 'lowpass';
		filt.frequency.value = 900;
		filt.Q.value = 2;
		filt.connect(musicBus);

		var lfo = mctx.createOscillator();
		var lfoGain = mctx.createGain();
		lfo.frequency.value = 0.06; // one slow breath every ~16s
		lfoGain.gain.value = 380;
		lfo.connect(lfoGain);
		lfoGain.connect(filt.frequency);
		lfo.start(t);
		padNodes.push(lfo, lfoGain, filt);

		var voices = [profile.root, profile.root + 7];
		for (var i = 0; i < voices.length; i++) {
			var o = mctx.createOscillator();
			var g = mctx.createGain();
			o.type = profile.pad;
			o.frequency.value = midiToFreq(voices[i]);
			o.detune.value = i === 0 ? -5 : 6;
			g.gain.value = 0.12;
			o.connect(g);
			g.connect(filt);
			o.start(t);
			padNodes.push(o, g);
		}
	}

	function stopPad() {
		for (var i = 0; i < padNodes.length; i++) {
			var n = padNodes[i];
			try {
				if (n.stop) n.stop();
			} catch (e) {}
			try {
				n.disconnect();
			} catch (e) {}
		}
		padNodes = [];
	}

	function schedule() {
		if (!running || !mctx) return;
		var beat = 60 / profile.bpm;
		var stepDur = beat / 2; // 8th notes

		// If the clock jumped — the iPad slept, she switched apps, the tab was backgrounded and
		// setInterval was throttled — do NOT try to catch up. Catching up would schedule every
		// missed step at once: hundreds of oscillators in one tick, which is exactly the leak
		// (and the audio pileup) this has to avoid. Skip to now and carry on.
		if (mctx.currentTime > nextStepTime + 1) {
			nextStepTime = mctx.currentTime + 0.05;
			resyncs++;
		}

		while (nextStepTime < mctx.currentTime + LOOKAHEAD) {
			var t = nextStepTime;
			var s = step % STEPS;

			// swing: push the offbeats late so it grooves instead of marching
			var when = t + (s % 2 === 1 ? stepDur * profile.swing * 0.5 : 0);

			var n = pattern.mel[s];
			if (n !== null && n !== undefined) {
				voice(profile.lead, midiToFreq(profile.root + n), when, stepDur * 1.6, 0.16);
			}
			if (s % 4 === 0) {
				var b = pattern.bass[(s / 4) % pattern.bass.length];
				voice('triangle', midiToFreq(profile.root - 12 + b), t, beat * 0.9, 0.22);
			}
			if (s % 8 === 0) tick('kick', t, 0.25);
			if (profile.bpm >= 96 && s % 4 === 2) tick('hat', t, 0.05);

			nextStepTime += stepDur;
			step++;
		}
	}

	function startEngine() {
		if (running || !mctx || !hasTrack) return;
		running = true;
		pattern = buildPattern(profile, hashOf(slug || 'maya'));
		musicBus = mctx.createGain();
		musicBus.gain.value = 0;
		musicBus.connect(mctx.destination); // = our master gain → mute covers music too
		var lvl = MUSIC_LEVEL * (profile.gain || 1);
		// Fade in rather than punch in — and only with a ramp on a RUNNING context, because a
		// suspended context's clock is frozen and the ramp would never advance (see applyToMaster).
		if (mctx.state === 'running') {
			musicBus.gain.setValueAtTime(0, mctx.currentTime);
			musicBus.gain.linearRampToValueAtTime(lvl, mctx.currentTime + 1.5);
		} else {
			musicBus.gain.value = lvl;
		}
		startPad();
		step = 0;
		nextStepTime = mctx.currentTime + 0.1;
		schedule();
		timer = setInterval(schedule, TICK_MS);
	}

	function stopEngine() {
		if (!running) return;
		running = false;
		if (timer) clearInterval(timer);
		timer = 0;
		stopPad();
		// Notes already scheduled ring out and disconnect themselves in onended; we just cut the
		// bus so nothing new is heard, then drop it.
		var bus = musicBus;
		musicBus = null;
		if (bus) {
			try {
				if (mctx.state === 'running') {
					bus.gain.cancelScheduledValues(mctx.currentTime);
					bus.gain.setTargetAtTime(0, mctx.currentTime, 0.08);
				} else {
					bus.gain.value = 0;
				}
			} catch (e) {}
			setTimeout(function () {
				try {
					bus.disconnect();
				} catch (e) {}
			}, 1200);
		}
	}

	/* iOS will not let audio start without a user gesture, and a context created before one stays
	   suspended with a frozen clock — every ramp we scheduled would silently never apply. So we
	   don't even create the music context until she touches something. Her first tap on the game's
	   own Start button is that gesture; we don't need one of our own. */
	var gestured = false;
	function ensureCtx() {
		if (mctx || !hasTrack) return;
		try {
			// Hard rule (CLAUDE.md): unlock the iOS audio session BEFORE any AudioContext, or the
			// hardware mute switch silences everything while the context still reports "running".
			if (window.MayaIOSAudioUnlock) window.MayaIOSAudioUnlock.unlock();
			var C = window.AudioContext || window.webkitAudioContext;
			if (!C) return;
			mctx = new C(); // patched → its `destination` is a master gain in `masters`
		} catch (e) {
			mctx = null;
		}
	}

	function syncMusic() {
		if (!hasTrack) return;
		var want = musicOn && !muted && gestured;
		if (want) {
			ensureCtx();
			if (!mctx) return;
			if (mctx.state === 'suspended') {
				try {
					mctx.resume().then(function () {
						if (musicOn && !muted && !running) startEngine();
					});
				} catch (e) {}
			}
			if (!running && mctx.state !== 'suspended') startEngine();
		} else {
			stopEngine();
		}
		renderMusic();
	}

	function onGesture() {
		if (gestured) return;
		gestured = true;
		syncMusic();
	}
	if (hasTrack) {
		['pointerdown', 'touchend', 'mousedown', 'keydown'].forEach(function (ev) {
			document.addEventListener(ev, onGesture, { capture: true, passive: true });
		});
	}

	function setMusicOn(on) {
		musicOn = !!on;
		writeMusicOn(musicOn);
		syncMusic();
	}

	/* ===== The music button =====
	   It does not get a fixed corner of its own — there isn't a free one. It hangs off the mute
	   button, wherever the mute button's own probe decided to land (bottom-left in most games,
	   raised in the ones with a bottom toolbar, top-left in the rest). Directly above it if there
	   is room, directly below if there isn't, stepping further out until it finds a spot that
	   isn't covering something tappable. Because placeMusic() runs at the end of place(), it
	   re-tracks the mute button on every re-place: load, +800ms, +2.5s, resize, and every DOM
	   change a game makes when it swaps screens. Bottom-right is never used: family chat. */
	var musicBtn = null;
	var GAP = 60; // 48px button + 12px breathing room

	function renderMusic() {
		if (!musicBtn) return;
		musicBtn.textContent = '🎵';
		musicBtn.style.opacity = musicOn ? '1' : '0.4';
		musicBtn.style.borderStyle = musicOn ? 'solid' : 'dashed';
		musicBtn.setAttribute('aria-label', musicOn ? 'Turn music off' : 'Turn music on');
		musicBtn.setAttribute('aria-pressed', musicOn ? 'true' : 'false');
	}

	function placeMusic() {
		if (!musicBtn) return;
		var anchor = btn && document.contains(btn) ? btn.getBoundingClientRect() : null;
		var vh = window.innerHeight || 800;
		var left = anchor ? anchor.left : 12;
		var candidates = [];
		if (anchor) {
			// Above the mute button first, then below it, then further out in each direction.
			candidates.push(anchor.top - GAP, anchor.bottom + 12, anchor.top - GAP * 2, anchor.bottom + 12 + GAP);
		} else {
			candidates.push(vh - 120, vh - 180, 76);
		}
		var chosen = null;
		for (var i = 0; i < candidates.length; i++) {
			var top = candidates[i];
			if (top < 8 || top + 48 > vh - 8) continue; // off-screen: not a real option
			musicBtn.style.left = left + 'px';
			musicBtn.style.top = top + 'px';
			musicBtn.style.bottom = '';
			if (chosen === null) chosen = top; // remember the first on-screen fallback
			// Only itself is ignored: the mute button, the Back button and every game control
			// count as obstacles, so it moves rather than sitting on top of them.
			if (!occupiedFor(left + 24, top + 24, ['maya-music'])) return;
		}
		// Nothing was clear. Prefer the first on-screen candidate over whatever the loop left,
		// and never hide the control.
		musicBtn.style.left = left + 'px';
		musicBtn.style.top = (chosen === null ? Math.max(8, vh - 120) : chosen) + 'px';
	}

	function mountMusic() {
		if (!hasTrack || !document.body) return;
		if (musicBtn && document.contains(musicBtn)) return;
		musicBtn = document.createElement('button');
		musicBtn.id = 'maya-music';
		musicBtn.type = 'button';
		musicBtn.style.cssText = [
			'position:fixed',
			'left:12px',
			'top:0px',
			'z-index:2147483000',
			'width:48px',
			'height:48px',
			'border-radius:50%',
			'border:2px solid rgba(255,255,255,.35)',
			'background:rgba(20,12,45,.72)',
			'color:#fff',
			'font-size:20px',
			'line-height:1',
			'cursor:pointer',
			'display:flex',
			'align-items:center',
			'justify-content:center',
			'padding:0',
			'-webkit-backdrop-filter:blur(6px)',
			'backdrop-filter:blur(6px)',
			'touch-action:manipulation',
			'user-select:none',
			'-webkit-user-select:none',
		].join(';');
		musicBtn.addEventListener('pointerdown', function (e) {
			e.preventDefault();
			e.stopPropagation();
			gestured = true; // this tap is itself the gesture iOS wants
			setMusicOn(!musicOn);
		});
		document.body.appendChild(musicBtn);
		renderMusic();
	}

	window.mayaSound = {
		isMuted: function () {
			return muted;
		},
		setMuted: setMuted,
		toggle: function () {
			setMuted(!muted);
		},
		music: {
			isOn: function () {
				return musicOn;
			},
			setOn: setMusicOn,
			toggle: function () {
				setMusicOn(!musicOn);
			},
			profile: function () {
				return { slug: slug, hasTrack: hasTrack, profile: profile };
			},
			// Leak check: `live` is the number of note voices currently alive. It must stay in a
			// small band no matter how long the game has been open, while `created` climbs.
			stats: function () {
				return {
					running: running,
					created: created,
					live: live,
					resyncs: resyncs,
					pad: padNodes.length,
					busGain: musicBus ? musicBus.gain.value : 0,
					state: mctx ? mctx.state : 'none',
				};
			},
		},
	};

	/* Bootstrap goes LAST on purpose. This file is loaded with `defer`, so by the time it runs the
	   document is usually already parsed and mount() fires synchronously — if this block sat where
	   it reads more naturally (up by the mute button) it would run before the music section's
	   variables above were initialised, and the music button would never mount. */
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', mount);
	} else {
		mount();
	}
})();
