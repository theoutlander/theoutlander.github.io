(function () {
	var MEASUREMENT_ID = 'G-62FC7BDSGJ';

	var POSTHOG_KEY = 'phc_oNxUK7hf2mQy9u8eBHEMUcReGahJ44YVnQyaFChHye54'; // paste PostHog project API key here (phc_...)
	var POSTHOG_HOST = 'https://us.i.posthog.com'; // use https://eu.i.posthog.com for an EU project

	var isLocalDev =
		window.location.hostname === 'localhost' ||
		window.location.hostname === '127.0.0.1' ||
		window.location.hostname === '' ||
		window.location.protocol === 'file:';

	if (isLocalDev) return;

	window.dataLayer = window.dataLayer || [];
	window.gtag =
		window.gtag ||
		function gtag() {
			window.dataLayer.push(arguments);
		};

	function loadGA() {
		if (window.__gaLoaded) return;
		window.__gaLoaded = true;

		var s = document.createElement('script');
		s.async = true;
		s.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
		document.head.appendChild(s);

		window.gtag('js', new Date());
		window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
	}

	function loadPostHog() {
		if (window.__phLoaded) return;
		window.__phLoaded = true;
		if (isLocalDev) return;
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
				person_profiles: 'identified_only', // only create profiles once someone is identified
				autocapture: false, // no noisy click autocapture
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
