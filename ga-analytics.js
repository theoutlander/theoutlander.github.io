(function () {
	var MEASUREMENT_ID = 'G-62FC7BDSGJ';

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

	(window.requestIdleCallback || function (cb) {
		setTimeout(cb, 1500);
	})(loadGA);
})();
