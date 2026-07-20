(function () {
	var MEASUREMENT_ID = 'G-62FC7BDSGJ';

	// PostHog is the committed primary (product analytics + session replay); GA4 is kept as a
	// read-only archive. See docs/architecture/platform.md. Dual-send: every JTrack event and the
	// pageview go to BOTH until the GA4 archive stops mattering. This file is inert for PostHog
	// until POSTHOG_KEY is filled in with the project API key (starts with "phc_") — GA4 keeps
	// working regardless, so it's safe to ship before the key exists.
	var POSTHOG_KEY = 'phc_oNxUK7hf2mQy9u8eBHEMUcReGahJ44YVnQyaFChHye54'; // paste PostHog project API key here (phc_...)
	var POSTHOG_HOST = 'https://us.i.posthog.com'; // use https://eu.i.posthog.com for an EU project

	window.dataLayer = window.dataLayer || [];
	window.gtag =
		window.gtag ||
		function gtag() {
			window.dataLayer.push(arguments);
		};

	// Development and testing must never show up as usage. The main site
	// (src/lib/analytics.ts) and the Maya lab already do this; the Lab did not, and had been
	// counting localhost traffic as real visits.
	// NOTE: when a property moves to its own domain (e.g. judgement.karnik.io) it MUST be added
	// here or analytics silently turns off for it.
	var PROD_HOSTS = ['nick.karnik.io', 'maya.karnik.io', 'judgement.karnik.io'];
	function isProd() {
		return PROD_HOSTS.indexOf(window.location.hostname) !== -1;
	}

	// Per-device opt-out so Nick's own visits don't pollute stats. Visit any page with
	// ?noanalytics=1 to opt this browser out for good (?noanalytics=0 re-enables).
	// localStorage is wrapped in try/catch — iPad Safari can throw on access and would
	// otherwise kill the whole script.
	function optedOut() {
		try {
			var q = window.location.search || '';
			if (q.indexOf('noanalytics=1') !== -1) localStorage.setItem('analytics_optout', '1');
			else if (q.indexOf('noanalytics=0') !== -1) localStorage.removeItem('analytics_optout');
			return localStorage.getItem('analytics_optout') === '1';
		} catch (e) {
			return false;
		}
	}

	// Single gate for "should we actually record this visitor": prod host AND not opted out.
	function tracks() {
		return isProd() && !optedOut();
	}

	// Shared by every Lab experiment, so the area comes from the URL rather than
	// being baked in — /judgement reports as judgement, not as lab.
	function siteArea() {
		var seg = window.location.pathname.split('/').filter(Boolean)[0];
		return seg || 'lab';
	}

	// Landing on a page and actually using the thing are different signals, and
	// only the second one answers "is anyone really playing this". Experiments
	// call JTrack for the second; it no-ops off prod so local runs aren't counted.
	// Dual-sends to GA4 and PostHog.
	window.JTrack = function (name, params) {
		if (!tracks()) return;
		window.gtag('event', name, params || {});
		if (window.posthog && window.posthog.capture) window.posthog.capture(name, params || {});
	};

	// Attach a stable identity (e.g. the player's chosen name) so PostHog can answer
	// "how much did THIS person play" without a login. Safe to call repeatedly.
	window.JIdentify = function (id, props) {
		if (!tracks() || !id) return;
		if (window.posthog && window.posthog.identify) window.posthog.identify(String(id), props || {});
	};

	function loadGA() {
		if (window.__gaLoaded) return;
		window.__gaLoaded = true;

		if (!tracks()) {
			window['ga-disable-' + MEASUREMENT_ID] = true;
			return;
		}

		var s = document.createElement('script');
		s.async = true;
		s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
		document.head.appendChild(s);

		window.gtag('js', new Date());
		window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
		var path = window.location.pathname;
		window.gtag('event', 'page_view', {
			page_path: path.length > 1 ? path.replace(/\/+$/, '') : path,
			page_title: document.title,
			page_location: window.location.href,
			site_area: siteArea(),
		});
	}

	function loadPostHog() {
		if (window.__phLoaded) return;
		window.__phLoaded = true;
		if (!tracks()) return;
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
					window.posthog.register({ site_area: siteArea() });
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
})();
