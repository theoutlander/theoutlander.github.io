/* Shared sound control for every game.

   The problem: each of the 17 games builds its own WebAudio graph and connects it straight to
   ctx.destination. Some have a mute button, most don't, and none of them agree on how it works.
   Retrofitting a mute into 17 hand-rolled audio graphs would be 17 chances to break a game.

   Instead we intercept at the one place they all share: AudioContext.destination. Every game
   connects there, so if `destination` hands back OUR gain node — which is itself wired to the
   real speakers — then one gain controls every sound in every game, and no game needs to know.

   Mute state lives in localStorage (guarded — a bare read is what killed Dust Chasers) and is
   shared across the portal and the game iframe, which are same-origin.

   This file does mute and NOTHING else. It used to also generate a procedural background track
   for every game from a per-game "character" table. That was a mistake: the games that have real
   sound design (Escape Room's per-room ambiences, Castle Defenders 2's step sequencer) ended up
   with two soundtracks fighting, and the generic one — being the loudest thing on the bus — won.
   Music is part of a game's identity, so it belongs in that game's own audio file. A game that
   wants music writes it; nothing is layered on from up here. */
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
		}
	});

	// Another tab (or the other document) changed it.
	window.addEventListener('storage', function (e) {
		if (e.key === MUTE_KEY) {
			muted = readMuted();
			applyAll();
			render();
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

	/* The button is allowed to sit on top of itself and nothing else: every other button, link
	   and game control counts as a solid obstacle, so it moves out of the way. */
	function occupied(x, y) {
		var stack;
		try {
			stack = document.elementsFromPoint(x, y);
		} catch (e) {
			return false;
		}
		for (var i = 0; i < stack.length; i++) {
			var el = stack[i];
			if (el.id === 'maya-mute') continue;
			var tag = el.tagName;
			if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT') return true;
			if (tag === 'HTML' || tag === 'BODY') continue;
			try {
				if (window.getComputedStyle(el).cursor === 'pointer') return true;
			} catch (e) {}
		}
		return false;
	}

	function place() {
		if (!btn) return;
		for (var i = 0; i < SPOTS.length; i++) {
			var s = SPOTS[i];
			btn.style.top = s.top || '';
			btn.style.bottom = s.bottom || '';
			btn.style.left = s.left;
			var r = btn.getBoundingClientRect();
			if (!occupied(r.left + r.width / 2, r.top + r.height / 2)) break; // found a clear spot
		}
		// Everything is crowded — leave it at the last position rather than hide the control.
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
			if (!btn) mount();
			else place();
		}, 250);
	}
	if (window.MAYA_GAME) {
		try {
			new MutationObserver(onDomChanged).observe(document, { childList: true, subtree: true });
		} catch (e) {}
	}
	window.addEventListener('resize', place);

	window.mayaSound = {
		isMuted: function () {
			return muted;
		},
		setMuted: setMuted,
		toggle: function () {
			setMuted(!muted);
		},
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', mount);
	} else {
		mount();
	}
})();
