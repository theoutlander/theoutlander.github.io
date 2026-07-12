(function () {
	var MEASUREMENT_ID = 'G-62FC7BDSGJ';

	// Paste the DSN from sentry.io → your Browser JavaScript project. Empty = Sentry stays off
	// and everything below degrades to GA-only, so shipping without it is safe.
	var SENTRY_DSN =
		'https://b9c577f427ad005a5b31897a3804fc2a@o4511723884314624.ingest.us.sentry.io/4511724000706560';
	var SENTRY_CDN = 'https://browser.sentry-cdn.com/10.65.0/bundle.replay.min.js';
	var SENTRY_CDN_INTEGRITY =
		'sha384-m0LuODIrq07DA4qkb96F8k7aKlJwiFXD01313Fl3KePAkg9SFqQfe6LklEB/oSI7';

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

	/* The UI title is deliberately playful — emoji, exclamation marks, and (when the portal
	   opens a game in its modal) a "· Maya's Game Lab 🎮" breadcrumb. All of that is noise in
	   analytics: the lab name repeats on every single row, the emoji vary, and the trailing "!"
	   is inconsistent across games ("Dust Chasers!" but "Sparkle Duel 2"). Normalize here, at
	   the boundary, so GA gets one stable name per game and the games keep their character.

	     "Dust Chasers! 👻 · Maya's Game Lab 🎮"  →  "Dust Chasers" */
	function displayTitle() {
		var t = document.title || '';
		t = t.split('·')[0]; // drop the lab breadcrumb the portal appends on modal open
		t = t.replace(
			/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{FE0F}]/gu,
			''
		);
		return t.replace(/[!\s]+$/, '').trim();
	}

	function trackMayaPageView() {
		window.gtag('event', 'page_view', {
			page_path: mayaPagePath(),
			page_title: displayTitle(),
			page_location: window.location.href,
			site_area: 'maya',
		});
	}

	/* ===== OWNER OPT-OUT =====
	   Nick browsing his own site was showing up as an active user and drowning out the only
	   person whose behaviour actually matters here. Visit any lab page once per device with
	   ?ga=off to stop being counted; ?ga=on undoes it. The choice persists per browser, and
	   because the games are same-origin iframes, setting it on the portal covers every game.

	   Deliberately GA-only: his errors still reach Sentry. If Nick hits a broken game we want
	   to know, and Sentry's value is correctness, not audience counting.

	   Storage is wrapped, of course — reading it bare is the exact bug that started all this. */
	var GA_OPTOUT_KEY = 'maya_ga_optout';
	var OWNER_OPTED_OUT = (function () {
		try {
			var q = new URLSearchParams(window.location.search).get('ga');
			if (q === 'off') window.localStorage.setItem(GA_OPTOUT_KEY, '1');
			if (q === 'on') window.localStorage.removeItem(GA_OPTOUT_KEY);
			return window.localStorage.getItem(GA_OPTOUT_KEY) === '1';
		} catch (e) {
			return false; // storage blocked (Maya's iPad) — she should always be counted
		}
	})();

	function loadGA() {
		if (window.__gaLoaded) return;
		window.__gaLoaded = true;

		if (OWNER_OPTED_OUT) {
			// gtag's official kill switch, in case anything else on the page loads it.
			window['ga-disable-' + MEASUREMENT_ID] = true;
			return;
		}

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
		if (!OWNER_OPTED_OUT) {
			loadGA();
			window.gtag('event', name, payload);
		}
		// Breadcrumbs still run for the owner: they're local to a Sentry error report, not an
		// analytics hit, and they're what makes a crash legible.
		if (window.Sentry && window.Sentry.addBreadcrumb) {
			window.Sentry.addBreadcrumb({ category: 'maya', message: name, data: payload, level: 'info' });
		}
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
		if (OWNER_OPTED_OUT) return;
		if (window.__gaLoaded) {
			trackMayaPageView();
		} else {
			loadGA();
			trackMayaPageView();
		}
	};

	/* ===== SENTRY =====
	   Errors, alerts, and a session replay of any session that broke. Replay is error-only
	   (replaysSessionSampleRate 0): a replay is recorded when something actually goes wrong,
	   not while she's happily playing. That keeps us far inside the free tier and means we
	   aren't continuously recording a kid's screen. */

	// Errors thrown before the Sentry bundle finishes downloading would otherwise be lost —
	// and that is exactly when the interesting ones happen. Dust Chasers threw during initial
	// script evaluation, before any async script could possibly have loaded. Buffer, then flush.
	var earlyErrors = [];
	var sentryReady = false;

	function sentryTags() {
		return {
			game: gameSlug() || 'portal',
			embedded: String(EMBEDDED),
			storage_blocked: String(storageBlocked()),
		};
	}

	// The DSN is public (it's in a public repo, and browser DSNs are write-only by design).
	// Anyone could point it at their own page and burn the free-tier quota, so only accept
	// events that actually originate from Nick's domains.
	var PROD_HOSTS = ['nick.karnik.io', 'maya.karnik.io'];
	function isProd() {
		return PROD_HOSTS.indexOf(window.location.hostname) !== -1;
	}

	function loadSentry() {
		if (!SENTRY_DSN) return;
		var s = document.createElement('script');
		s.src = SENTRY_CDN;
		s.crossOrigin = 'anonymous';
		s.setAttribute('integrity', SENTRY_CDN_INTEGRITY);
		s.onload = function () {
			if (!window.Sentry) return;
			window.Sentry.init({
				dsn: SENTRY_DSN,
				environment: isProd() ? 'production' : 'development',

				// Replay keeps Sentry's default text masking ON. Do not turn it off: the portal
				// hosts the family chat with Dad, so an unmasked replay of an error there would
				// ship a kid's private messages to a third party. Masked replay still shows the
				// thing we actually need — her tapping a button and nothing happening.
				integrations: [window.Sentry.replayIntegration()],
				replaysSessionSampleRate: 0,
				replaysOnErrorSampleRate: 1.0,

				// Only report errors whose code came from our own pages.
				allowUrls: [/nick\.karnik\.io/, /maya\.karnik\.io/],
				// Errors thrown by her iPad's extensions/injected scripts are not our bugs.
				denyUrls: [/extensions\//i, /^chrome:\/\//i, /^chrome-extension:\/\//i, /^safari-extension:\/\//i],
				// Known browser noise that is never actionable.
				ignoreErrors: [
					'ResizeObserver loop limit exceeded',
					'ResizeObserver loop completed with undelivered notifications',
					'Non-Error promise rejection captured',
				],

				// Never let local development or my own testing pollute her error inbox — the
				// whole value of this project is that an issue appearing MEANS something broke
				// for Maya.
				beforeSend: function (event) {
					return isProd() ? event : null;
				},

				// One game per document, so tagging at init covers everything this frame sends.
				initialScope: { tags: sentryTags() },
			});
			sentryReady = true;
			earlyErrors.forEach(function (err) {
				window.Sentry.captureException(err);
			});
			earlyErrors = [];
		};
		s.onerror = function () {
			/* offline or CDN blocked — telemetry must never break the game */
		};
		document.head.appendChild(s);
	}
	loadSentry();

	function reportError(err) {
		if (!SENTRY_DSN) return;
		if (sentryReady && window.Sentry) window.Sentry.captureException(err);
		else if (earlyErrors.length < 20) earlyErrors.push(err);
	}

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
		reportError((e && e.error) || new Error(String((e && e.message) || 'unknown')));
	});
	window.addEventListener('unhandledrejection', function (e) {
		var r = e && e.reason;
		mayaTrack('js_error', {
			error_message: String((r && r.message) || r || 'unhandled rejection').slice(0, 300),
			fatal: false,
		});
		reportError(r instanceof Error ? r : new Error(String(r || 'unhandled rejection')));
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
