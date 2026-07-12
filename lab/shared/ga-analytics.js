(function () {
	var MEASUREMENT_ID = 'G-62FC7BDSGJ';

	window.dataLayer = window.dataLayer || [];
	window.gtag =
		window.gtag ||
		function gtag() {
			window.dataLayer.push(arguments);
		};

	// Development and testing must never show up as usage. The main site
	// (src/lib/analytics.ts) and the Maya lab already do this; the Lab did not, and had been
	// counting localhost traffic as real visits.
	var PROD_HOSTS = ['nick.karnik.io', 'maya.karnik.io'];
	function isProd() {
		return PROD_HOSTS.indexOf(window.location.hostname) !== -1;
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
	window.JTrack = function (name, params) {
		if (!isProd()) return;
		window.gtag('event', name, params || {});
	};

	function loadGA() {
		if (window.__gaLoaded) return;
		window.__gaLoaded = true;

		if (!isProd()) {
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

	(window.requestIdleCallback || function (cb) {
		setTimeout(cb, 1500);
	})(loadGA);
})();
