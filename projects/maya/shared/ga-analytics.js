(function () {
	var MEASUREMENT_ID = 'G-62FC7BDSGJ';

	window.dataLayer = window.dataLayer || [];
	window.gtag =
		window.gtag ||
		function gtag() {
			window.dataLayer.push(arguments);
		};

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
		trackMayaPageView();
	}

	(window.requestIdleCallback || function (cb) {
		setTimeout(cb, 1500);
	})(loadGA);

	// Called by the portal after it pushState's to a game's URL (in-modal open,
	// no real navigation/reload) so each game shows up as its own page_view in
	// GA instead of collapsing into the portal's single initial-load hit.
	window.mayaTrackPageView = function () {
		if (window.__gaLoaded) {
			trackMayaPageView();
		} else {
			loadGA();
		}
	};
})();
