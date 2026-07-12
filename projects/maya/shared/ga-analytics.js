(function () {
	var MEASUREMENT_ID = 'G-62FC7BDSGJ';

	window.dataLayer = window.dataLayer || [];
	window.gtag =
		window.gtag ||
		function gtag() {
			window.dataLayer.push(arguments);
		};

	// A game opened from the portal runs inside the portal's iframe. The portal already
	// pushState's to the game's URL and sends its page_view, so if the framed document sent
	// one too every game open would be counted twice. Games opened directly (deep link,
	// bookmark) are top-level and still send their own.
	var EMBEDDED = (function () {
		try {
			return window.self !== window.top;
		} catch (e) {
			return true;
		}
	})();

	// Set by each game before portal-bridge loads, e.g. 'games/dust-chasers/index.html'.
	function gameSlug() {
		var g = window.MAYA_GAME;
		if (typeof g !== 'string' || !g) return null;
		var m = g.match(/games\/([^/]+)\//);
		return m ? m[1] : g;
	}

	// Whether localStorage is usable. On iPad Safari with Block All Cookies (or Private
	// Browsing) merely touching it throws, which is what killed Dust Chasers. Reporting it
	// turns "is that what's wrong on her iPad?" from a guess into a number.
	function storageBlocked() {
		try {
			window.localStorage.getItem('__maya_probe');
			return false;
		} catch (e) {
			return true;
		}
	}

	function canonicalMayaPath(pathname) {
		if (pathname === '/' || pathname === '/index.html') return '/maya/';
		if (pathname.indexOf('/maya/') === 0 || pathname === '/maya') return pathname;
		return '/maya' + pathname;
	}

	function stripTrailingSlash(path) {
		// '/maya/' is the deliberate canonical root path; leave it alone
		if (path.length <= 1 || path === '/maya/') return path;
		return path.replace(/\/+$/, '');
	}

	function mayaPagePath() {
		var path = window.location.pathname;
		var resolved;
		if (window.location.hostname === 'maya.karnik.io') {
			resolved = canonicalMayaPath(path);
		} else if (path.indexOf('/maya') === 0) {
			resolved = path;
		} else if (/\.html$/i.test(path)) {
			resolved = canonicalMayaPath(path);
		} else {
			resolved = path;
		}
		return stripTrailingSlash(resolved);
	}

	// Attached to every event so any of them can be sliced by game, device, or storage state.
	function baseParams() {
		return {
			site_area: 'maya',
			game: gameSlug() || 'portal',
			embedded: EMBEDDED,
			storage_blocked: storageBlocked(),
		};
	}

	function trackMayaPageView() {
		window.gtag('event', 'page_view', {
			page_path: mayaPagePath(),
			page_title: document.title,
			page_location: window.location.href,
			site_area: 'maya',
		});
	}

	function loadGA() {
		if (window.__gaLoaded) return;
		window.__gaLoaded = true;

		var s = document.createElement('script');
		s.async = true;
		s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
		document.head.appendChild(s);

		window.gtag('js', new Date());
		window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
		if (!EMBEDDED) trackMayaPageView();
	}

	(window.requestIdleCallback || function (cb) {
		setTimeout(cb, 1500);
	})(loadGA);

	/* ===== EVENT API =====
	   mayaTrack('game_start', {mode: 'normal'}) — params merge over baseParams. */
	function mayaTrack(name, params) {
		var payload = baseParams();
		if (params) {
			for (var k in params) {
				if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
			}
		}
		loadGA();
		window.gtag('event', name, payload);
	}
	window.mayaTrack = mayaTrack;

	// Call when play actually begins — the moment the start screen goes away. This is the
	// event that proves Maya got IN, as opposed to merely loading a game whose start button
	// is dead. Idempotent, so restarts within one page don't inflate the count.
	window.mayaGameStart = function (params) {
		if (window.__mayaGameStarted) return;
		window.__mayaGameStarted = true;
		mayaTrack('game_start', params);
	};

	// Call when a round ends, with whatever the game knows (score, level, won).
	window.mayaGameEnd = function (params) {
		mayaTrack('game_end', params);
	};

	// Called by the portal after it pushState's to a game's URL (in-modal open, no real
	// navigation/reload) so each game shows up as its own page_view in GA instead of
	// collapsing into the portal's single initial-load hit.
	window.mayaTrackPageView = function () {
		if (window.__gaLoaded) {
			trackMayaPageView();
		} else {
			loadGA();
			trackMayaPageView();
		}
	};

	/* ===== AUTOMATIC INSTRUMENTATION =====
	   Everything below works for all 18 games with no per-game code. Only game_start needs
	   the game to call mayaTrack('game_start') itself, since only the game knows it began. */

	var slug = gameSlug();
	var loadedAt = Date.now();

	// A game document loaded and its scripts ran. Paired with game_start this is the funnel
	// that catches a dead start button: loads that never convert into starts.
	if (slug) mayaTrack('game_loaded');

	// Her first tap inside the game. The diagnostic value is in the combination: a game that
	// reports game_loaded and game_first_input but never game_start is one where she tapped
	// the start button and nothing happened — exactly the Dust Chasers failure, made visible.
	if (slug) {
		window.addEventListener(
			'pointerdown',
			function () {
				mayaTrack('game_first_input');
			},
			{ once: true }
		);
	}

	// An uncaught error means a game is broken right now. Dust Chasers threw SecurityError
	// here for who knows how long and nothing ever reported it.
	window.addEventListener('error', function (e) {
		mayaTrack('js_error', {
			error_message: String((e && e.message) || 'unknown').slice(0, 300),
			error_source: String((e && e.filename) || '').slice(0, 200),
			error_line: (e && e.lineno) || 0,
			fatal: true,
		});
	});
	window.addEventListener('unhandledrejection', function (e) {
		var r = e && e.reason;
		mayaTrack('js_error', {
			error_message: String((r && r.message) || r || 'unhandled rejection').slice(0, 300),
			fatal: false,
		});
	});

	// Does she actually hear anything? These games play raw WebAudio, which iOS treats as
	// "ambient" and silences with the hardware mute switch — the context reports "running"
	// while nothing comes out. Patching the constructor reports real state with no game edits.
	(function patchAudioContext() {
		var Native = window.AudioContext || window.webkitAudioContext;
		if (!Native) return;
		var reported = false;
		function Patched() {
			var ctx = new Native();
			if (!reported) {
				reported = true;
				// State shortly after the unlocking gesture is the interesting one: 'running'
				// means it unlocked, 'suspended' means audio is going nowhere silently.
				setTimeout(function () {
					mayaTrack('sound_state', {
						audio_state: ctx.state,
						unlocked: ctx.state === 'running',
					});
				}, 800);
			}
			return ctx;
		}
		Patched.prototype = Native.prototype;
		window.AudioContext = Patched;
		if (window.webkitAudioContext) window.webkitAudioContext = Patched;
	})();

	// How long she actually stayed, and whether she ever got past the start screen. This is
	// what separates "bounced off a dead button" from "played for ten minutes".
	window.addEventListener('pagehide', function () {
		if (!slug) return;
		mayaTrack('game_exit', {
			duration_seconds: Math.round((Date.now() - loadedAt) / 1000),
			reached_start: !!window.__mayaGameStarted,
		});
	});
})();
