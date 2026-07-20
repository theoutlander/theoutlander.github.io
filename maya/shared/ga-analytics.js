(function () {
	var MEASUREMENT_ID = 'G-62FC7BDSGJ';

	// PostHog dual-send: every mayaTrack event and the pageview also go to PostHog, mirroring GA
	// and respecting the exact same gate (SKIP_GA / opt-out / non-prod). Inert until POSTHOG_KEY is
	// filled in with the project API key (starts with "phc_") — GA keeps working regardless, so it's
	// safe to ship before the key exists.
	var POSTHOG_KEY = 'phc_oNxUK7hf2mQy9u8eBHEMUcReGahJ44YVnQyaFChHye54'; // paste PostHog project API key here (phc_...)
	var POSTHOG_HOST = 'https://us.i.posthog.com'; // use https://eu.i.posthog.com for an EU project

	// PostHog loads lazily (requestIdleCallback, ~1.5s after load), but mayaTrack('game_loaded')
	// and early js_errors fire SYNCHRONOUSLY at script load — before window.posthog exists. Those
	// hits would reach GA4 but silently miss PostHog, so the loaded->start "dead button" funnel
	// couldn't be built there. Buffer pre-init events here and flush them once PostHog is ready.
	var POSTHOG_ON = POSTHOG_KEY.indexOf('phc_') === 0; // key configured?
	var phEarlyQueue = [];

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
			visitor: VISITOR, // 'maya' | 'nick' | 'unknown' — answers "was that her or me?"
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

	/* ===== WHO IS THIS =====
	   The problem this solves: "I can't tell definitively if it's her playing or me showing up."

	   We LABEL rather than silently drop. Every hit carries visitor = 'maya' | 'nick' |
	   'unknown', so a report answers the question instead of hiding it. Exclusion is then GA's
	   job, not this file's: 'nick' hits also carry traffic_type='internal', which GA's built-in
	   Internal Traffic filter drops (Admin → Data Filters). That filter has a Testing mode that
	   shows ONLY internal traffic — so Nick can actually LOOK at what's being excluded and
	   confirm it's him, instead of trusting a silent client-side skip.

	   Identity comes from the family chat, which is PIN-authenticated and already stores
	   role 'dad' | 'maya'. That's a real signal, not a guess. ?who=nick / ?who=maya overrides it
	   on a device that never signs into chat (it persists).

	   Why labelling beats excluding: if a flag is evicted (iOS Safari drops script storage after
	   ~7 days idle) an excluded device silently reappears as "Maya". A labelled one shows up as
	   'unknown' — a visible anomaly you can chase, not corrupted data you can't see.

	   'unknown' is also how a genuine stranger finding the site would appear, which is worth
	   knowing on its own.

	   Deliberately NOT IP-based: Maya's iPad shares Nick's home IP, so an IP rule would exclude
	   the one person we exist to measure.

	   Storage reads are wrapped, and every fallback favours counting: if storage throws we are
	   almost certainly on Maya's locked-down iPad. */
	var PROD_HOSTS = ['nick.karnik.io', 'maya.karnik.io', 'judgement.karnik.io'];
	function isProd() {
		return PROD_HOSTS.indexOf(window.location.hostname) !== -1;
	}

	var GA_OPTOUT_KEY = 'maya_ga_optout';
	var WHO_KEY = 'maya_visitor';
	var CHAT_SESSION_KEY = 'maya_family_chat_v3'; // written by shared/family-chat.js

	var VISITOR = (function () {
		try {
			// Explicit tag wins, and sticks: maya.karnik.io/?who=nick once per device.
			var q = new URLSearchParams(window.location.search).get('who');
			if (q === 'nick' || q === 'maya') window.localStorage.setItem(WHO_KEY, q);
			var tagged = window.localStorage.getItem(WHO_KEY);
			if (tagged === 'nick' || tagged === 'maya') return tagged;

			// Otherwise fall back to who is signed into the family chat.
			var raw = window.localStorage.getItem(CHAT_SESSION_KEY);
			if (raw) {
				var role = JSON.parse(raw).role;
				if (role === 'dad') return 'nick';
				if (role === 'maya') return 'maya';
			}
			return 'unknown';
		} catch (e) {
			return 'unknown';
		}
	})();

	function manuallyOptedOut() {
		try {
			var q = new URLSearchParams(window.location.search).get('ga');
			if (q === 'off') window.localStorage.setItem(GA_OPTOUT_KEY, '1');
			if (q === 'on') window.localStorage.removeItem(GA_OPTOUT_KEY);
			return window.localStorage.getItem(GA_OPTOUT_KEY) === '1';
		} catch (e) {
			return false; // storage blocked → assume Maya, always count her
		}
	}

	// Nick's hits are still SENT (so he can inspect them in the filter's Testing mode) but are
	// marked internal so GA drops them once the Internal Traffic filter is Active.
	function isInternal() {
		return VISITOR === 'nick';
	}

	// Skip GA entirely only for non-prod hosts, or a hard ?ga=off mute.
	var SKIP_GA = !isProd() || manuallyOptedOut();

	function loadGA() {
		if (window.__gaLoaded) return;
		window.__gaLoaded = true;

		if (SKIP_GA) {
			// gtag's official kill switch, in case anything else on the page loads it.
			window['ga-disable-' + MEASUREMENT_ID] = true;
			return;
		}

		var s = document.createElement('script');
		s.async = true;
		s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
		document.head.appendChild(s);

		window.gtag('js', new Date());
		window.gtag('config', MEASUREMENT_ID, {
			send_page_view: false,
			// GA's built-in Internal Traffic filter keys off exactly this parameter. Setting it
			// from the tag (rather than by IP) makes the exclusion device-level, so Maya's iPad
			// on the same home wifi is unaffected.
			traffic_type: isInternal() ? 'internal' : undefined,
		});
		// A user property, so any report can segment by who was actually playing.
		window.gtag('set', 'user_properties', { visitor: VISITOR });
		if (!EMBEDDED) trackMayaPageView();
	}

	function loadPostHog() {
		if (window.__phLoaded) return;
		window.__phLoaded = true;
		if (SKIP_GA) return; // non-prod or opted out — same skip GA uses
		if (POSTHOG_KEY.indexOf('phc_') !== 0) return; // not configured yet — stay dormant

		var s = document.createElement('script');
		s.async = true;
		// array.js is served from the "-assets" host paired with the ingestion host.
		s.src = POSTHOG_HOST.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
		s.onload = function () {
			if (!window.posthog || !window.posthog.init) return;
			window.posthog.init(POSTHOG_KEY, {
				api_host: POSTHOG_HOST,
				capture_pageview: true, // initial pageview; SPA route changes tracked later if needed
				person_profiles: 'identified_only', // only create profiles once we JIdentify someone
				autocapture: false, // we send explicit, meaningful events — no noisy click autocapture
				loaded: function () {
					window.posthog.register({ site_area: 'maya' });
					// Flush events that fired before this lazy init (game_loaded, early errors).
					// They arrive ~1.5s late (stamped now), which is fine for load-time events.
					for (var i = 0; i < phEarlyQueue.length; i++) {
						window.posthog.capture(phEarlyQueue[i][0], phEarlyQueue[i][1]);
					}
					phEarlyQueue = [];
				},
			});
		};
		document.head.appendChild(s);
	}

	(window.requestIdleCallback || function (cb) {
		setTimeout(cb, 1500);
	})(function () {
		loadGA();
		loadPostHog();
	});

	/* ===== EVENT API =====
	   mayaTrack('game_start', {mode: 'normal'}) — params merge over baseParams. */
	function mayaTrack(name, params) {
		var payload = baseParams();
		if (params) {
			for (var k in params) {
				if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
			}
		}
		if (!SKIP_GA) {
			loadGA();
			window.gtag('event', name, payload);
			// PostHog mirrors GA exactly — same event name, same payload, same gate. If PostHog
			// hasn't finished its lazy load yet, buffer the event (capped) so it's flushed on init
			// instead of lost — this is what gets game_loaded and early errors into PostHog.
			if (window.posthog && window.posthog.capture) {
				window.posthog.capture(name, payload);
			} else if (POSTHOG_ON && phEarlyQueue.length < 50) {
				phEarlyQueue.push([name, payload]);
			}
		}
		// Breadcrumbs still run for the owner: they're local to a Sentry error report, not an
		// analytics hit, and they're what makes a crash legible.
		if (window.Sentry && window.Sentry.addBreadcrumb) {
			window.Sentry.addBreadcrumb({ category: 'maya', message: name, data: payload, level: 'info' });
		}
	}
	window.mayaTrack = mayaTrack;

	// Attach a stable identity (e.g. the player's chosen name) so PostHog can answer "how much did
	// THIS person play" without a login. Safe to call repeatedly. Gated exactly like tracking.
	window.JIdentify = function (id, props) {
		if (SKIP_GA || !id) return;
		if (window.posthog && window.posthog.identify) window.posthog.identify(String(id), props || {});
	};

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
		if (SKIP_GA) return;
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
			visitor: VISITOR, // an error tells us WHO hit it — her, or Nick testing
		};
	}

	// The DSN is public (browser DSNs are write-only by design, and this repo is public), so
	// allowUrls below restricts reporting to Nick's own domains. isProd() is defined above.

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
