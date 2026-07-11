/* Pulls every <script src="..."> and <link rel="stylesheet" href="..."> URL
   out of a raw HTML string. Used by sw.js to auto-discover what to precache
   for a game without hand-maintaining a per-file asset list — a game's own
   <script>/<link> tags stay the single source of truth for what it loads. */
(function () {
	"use strict";

	function extractAssetUrls(html) {
		var urls = [];
		var seen = Object.create(null);

		function add(url) {
			if (!url) return;
			url = url.trim();
			if (!url || seen[url]) return;
			seen[url] = true;
			urls.push(url);
		}

		// <script ...src="...">  — [^>]* matches across newlines since it's a
		// negated character class, so this handles both single-line and
		// attribute-per-line (Prettier-formatted) script tags.
		var scriptRe = /<script[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;
		var m;
		while ((m = scriptRe.exec(html))) add(m[1]);

		// <link ...> tags: only keep ones whose full tag text has rel="stylesheet"
		// somewhere in it (attribute order varies across the codebase), then pull
		// the href out of that same tag.
		var linkRe = /<link[^>]*>/gi;
		while ((m = linkRe.exec(html))) {
			var tag = m[0];
			if (!/\srel=["']stylesheet["']/i.test(tag)) continue;
			var hrefMatch = /\shref=["']([^"']+)["']/i.exec(tag);
			if (hrefMatch) add(hrefMatch[1]);
		}

		return urls;
	}

	var api = { extractAssetUrls: extractAssetUrls };
	if (typeof self !== "undefined") self.MayaExtractAssetUrls = api;
})();
