/* Shared "back to the lab" button for every game.

   The problem: getting out of a game was different in all 17 of them. Some drew a 🏠 in their
   HUD, some hid one in a pause menu, a couple had nothing at all — and on a game-over screen
   (a full-bleed overlay) whatever they did have was usually covered up. Fixing it game by game
   was whack-a-mole.

   So: one button, mounted from here, in every game. Same look, same corner, same behaviour, and
   it sits above every overlay a game can draw. Exactly the same shape as shared/sound.js —
   read that file first if this one looks odd.

   No localStorage here: this button has no state to remember. (If you ever add some, guard it —
   a bare read THROWS on Maya's iPad with site data blocked and takes the whole script down.) */
(function () {
	'use strict';

	var BTN_ID = 'maya-back';

	/* ===== Where "back" goes =====
	   Three cases, and the game does not have to tell us which one it is in:
	   1. Inside the portal's game iframe  → ask the portal to close the modal.
	   2. A game that loaded portal-bridge → let the bridge do it.
	   3. A bare top-level page (maya-shop is opened by a plain link) → walk up to the lab. */
	function inMayaPortal() {
		if (window.parent === window) return false;
		try {
			return !!window.parent.document.getElementById('gf');
		} catch (e) {
			return true; // cross-origin parent: we are framed by *something*, assume the portal
		}
	}

	function labIndexUrl() {
		var key = typeof window.MAYA_GAME === 'string' ? window.MAYA_GAME : '';
		var p = location.pathname;
		if (key && p.length >= key.length && p.slice(-key.length) === key) {
			return p.slice(0, -key.length) + 'index.html';
		}
		return '../../index.html'; // fallback: games/<slug>/index.html is two levels deep
	}

	function leave() {
		if (inMayaPortal()) {
			try {
				window.parent.postMessage('maya:leave-game', '*');
				return;
			} catch (e) {}
		}
		if (window.MayaPortal && typeof window.MayaPortal.leaveToLab === 'function') {
			try {
				window.MayaPortal.leaveToLab();
				return;
			} catch (e) {}
		}
		window.location.href = labIndexUrl();
	}

	/* Tell the portal we exist, so it can hide the "‹ Back" pill in its modal header and we do
	   not end up with two back buttons. Deliberately the portal's default is to SHOW its own —
	   it only hides once it hears from us. If this script ever fails to load, Maya still has a
	   way out; a briefly doubled button is a nuisance, a trapped kid is a bug. */
	function announce() {
		try {
			if (window.parent && window.parent !== window) {
				window.parent.postMessage({ type: 'maya:back-ready' }, '*');
			}
		} catch (e) {}
	}

	/* ===== The button =====
	   Top-left. The mute button owns bottom-left and the family chat owns bottom-right, so this
	   is the corner left over — and it is where a back button belongs anyway. 48px: comfortably
	   over the 44px minimum for an 8-year-old's thumb on an iPad. */
	var btn = null;
	var mounting = false;

	/* No corner is free in all 17 games — several park a score or a coin counter top-left. Rather
	   than special-case every game, the button looks underneath itself and steps to the next spot
	   if it is covering something tappable. Re-checked whenever the DOM changes, because a game's
	   menu, its play screen and its game-over overlay are three different layouts. */
	var SPOTS = [
		{ left: '12px', top: '12px' }, // default: top-left
		{ left: '12px', top: '76px' }, // below a top-left HUD chip
		{ left: '12px', top: '140px' },
		{ right: '12px', top: '12px' }, // top-right, if the whole left edge is taken
		{ right: '12px', top: '76px' },
	];

	function occupied(x, y) {
		var stack;
		try {
			stack = document.elementsFromPoint(x, y);
		} catch (e) {
			return false;
		}
		for (var i = 0; i < stack.length; i++) {
			var el = stack[i];
			if (el === btn || el.id === BTN_ID) continue;
			var tag = el.tagName;
			// The mute button is a BUTTON too, so it is caught here: the two never overlap.
			if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT') return true;
			if (tag === 'HTML' || tag === 'BODY') continue;
			try {
				if (window.getComputedStyle(el).cursor === 'pointer') return true;
			} catch (e) {}
		}
		return false;
	}

	function place() {
		if (!btn || !document.contains(btn)) return;
		for (var i = 0; i < SPOTS.length; i++) {
			var s = SPOTS[i];
			btn.style.top = s.top || '';
			btn.style.left = s.left || '';
			btn.style.right = s.right || '';
			var r = btn.getBoundingClientRect();
			if (!occupied(r.left + r.width / 2, r.top + r.height / 2)) return; // clear spot
		}
		// Everything is crowded — leave it where it landed rather than hide the way out.
	}

	/* A game that already draws its own back/home affordance marks it with
	   data-maya-native-back. We hide it only once OUR button is actually on the page, so a game
	   opened without this script still has its own escape hatch. */
	function hideNativeBackButtons() {
		var nodes;
		try {
			nodes = document.querySelectorAll('[data-maya-native-back]');
		} catch (e) {
			return;
		}
		for (var i = 0; i < nodes.length; i++) nodes[i].style.display = 'none';
	}

	function mount() {
		// Only games get the button. The portal opens a game in a full-viewport iframe and draws
		// its own back control, so mounting here too would stack two on top of each other.
		// window.MAYA_GAME is set only by game pages.
		if (!window.MAYA_GAME || !document.body) return;
		if (btn && document.contains(btn)) return;

		mounting = true;
		btn = document.createElement('button');
		btn.id = BTN_ID;
		btn.type = 'button';
		btn.textContent = '🏠';
		btn.setAttribute('aria-label', 'Back to the Game Lab');
		btn.style.cssText = [
			'position:fixed',
			'left:12px',
			'top:12px',
			'z-index:2147483000', // above anything a game can draw, including a game-over overlay
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
			leave();
		});
		document.body.appendChild(btn);
		mounting = false;

		hideNativeBackButtons();
		place();
		announce();

		// Games swap between menu / play / end screens, so a spot that is clear at load can be
		// covered a second later.
		setTimeout(place, 800);
		setTimeout(place, 2500);
	}

	/* Re-mount + re-place on any DOM change.

	   Two games (maya-shop, sparkle-duel) are exported bundles: they unpack themselves and then
	   `document.documentElement.replaceWith(...)`, which throws away the whole body — and our
	   button with it. Others rebuild their screen with innerHTML. Watching `document` (not
	   documentElement, which is itself replaced) means we notice and come back, and it doubles
	   as the trigger to re-check placement when a game-over overlay appears. */
	var pending = 0;
	function onDomChanged() {
		if (mounting || pending) return;
		pending = setTimeout(function () {
			pending = 0;
			if (!btn || !document.contains(btn)) {
				btn = null;
				mount();
			} else {
				// Keep it last in the body so it also wins on paint order, not just z-index.
				try {
					if (document.body && btn.parentNode === document.body && document.body.lastChild !== btn) {
						mounting = true;
						document.body.appendChild(btn);
						mounting = false;
					}
				} catch (e) {
					mounting = false;
				}
				hideNativeBackButtons();
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
	window.addEventListener('message', function (e) {
		// The portal asks on modal open, in case we mounted before it started listening.
		if (e.data && e.data.type === 'maya:back-ping') announce();
	});

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', mount);
	} else {
		mount();
	}

	window.mayaBack = { leave: leave, place: place };
})();
