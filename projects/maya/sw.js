/* Maya's Game Lab — offline service worker.
   Precaches the Lab shell plus every game listed in
   shared/offline-games.json, auto-discovering each page's own script and
   stylesheet references (shared/extract-asset-urls.js) instead of
   hand-listing every file per game. Cache-first at runtime, refreshing in
   the background when online, so updates reach players automatically. */
"use strict";

importScripts("shared/extract-asset-urls.js");

var CACHE_VERSION = "v1";
var CACHE_NAME = "maya-cache-" + CACHE_VERSION;
var SCOPE_URL = self.registration.scope;

var SHELL_URLS = [
	"index.html",
	"manifest.webmanifest",
	"offline.html",
	"icons/icon-192.png",
	"icons/icon-512.png",
	"icons/apple-touch-icon.png",
];

function resolve(url, base) {
	return new URL(url, base).href;
}

function fetchText(url) {
	return fetch(url).then(function (res) {
		if (!res.ok) throw new Error("fetch failed: " + url);
		return res.text();
	});
}

/** Builds the full set of URLs to precache: the fixed shell files, the Lab
    page's own discovered assets, and every registered game's index.html
    plus that game's own discovered assets. A game whose HTML can't be
    fetched (e.g. a typo'd slug) is skipped with a console warning rather
    than failing the whole install. */
function collectPrecacheUrls() {
	var urls = {};
	SHELL_URLS.forEach(function (u) {
		urls[resolve(u, SCOPE_URL)] = true;
	});

	var shellHtmlUrl = resolve("index.html", SCOPE_URL);
	return fetchText(shellHtmlUrl)
		.then(function (html) {
			self.MayaExtractAssetUrls.extractAssetUrls(html).forEach(function (u) {
				urls[resolve(u, shellHtmlUrl)] = true;
			});
			return fetchText(resolve("shared/offline-games.json", SCOPE_URL));
		})
		.then(function (json) {
			var slugs = JSON.parse(json);
			return Promise.all(
				slugs.map(function (slug) {
					var gameHtmlUrl = resolve("games/" + slug + "/index.html", SCOPE_URL);
					urls[gameHtmlUrl] = true;
					return fetchText(gameHtmlUrl)
						.then(function (html) {
							self.MayaExtractAssetUrls.extractAssetUrls(html).forEach(function (u) {
								urls[resolve(u, gameHtmlUrl)] = true;
							});
						})
						.catch(function (err) {
							console.warn("[maya sw] could not scan", slug, err);
						});
				})
			);
		})
		.then(function () {
			return Object.keys(urls);
		});
}

function precacheAll(urls) {
	return caches.open(CACHE_NAME).then(function (cache) {
		return Promise.allSettled(
			urls.map(function (url) {
				return fetch(url).then(function (response) {
					if (response && response.ok) return cache.put(url, response);
				});
			})
		);
	});
}

self.addEventListener("install", function (event) {
	event.waitUntil(
		collectPrecacheUrls()
			.then(precacheAll)
			.then(function () {
				return self.skipWaiting();
			})
	);
});

self.addEventListener("activate", function (event) {
	event.waitUntil(
		caches
			.keys()
			.then(function (names) {
				return Promise.all(
					names
						.filter(function (name) {
							return name.indexOf("maya-cache-") === 0 && name !== CACHE_NAME;
						})
						.map(function (name) {
							return caches.delete(name);
						})
				);
			})
			.then(function () {
				return self.clients.claim();
			})
	);
});

// CDN hosts the Lab loads engines/fonts from at runtime (see design spec
// "2. What gets cached"). Anything else cross-origin — e.g. Supabase family
// chat — must go straight to the network, never through this cache.
var ALLOWED_CDN_HOSTS = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];

/** True for requests this service worker should apply cache-first-with-
    background-revalidate to: same-origin requests within this SW's own
    scope (/maya/), or requests to the CDN allowlist above. Everything else
    (e.g. Supabase chat traffic) falls through untouched. */
function shouldHandle(url) {
	if (url.origin === self.location.origin && url.pathname.indexOf(new URL(SCOPE_URL).pathname) === 0) {
		return true;
	}
	return ALLOWED_CDN_HOSTS.indexOf(url.hostname) !== -1;
}

/** The key a response is stored under. Same-origin requests are stored without their query
    string, so the portal's `?v=<timestamp>` cache-buster doesn't write a brand-new entry on
    every single game open and grow the cache without bound. CDN URLs keep their query string,
    since for them (Google Fonts' ?family=) it identifies the resource. */
function cacheKey(request) {
	var url = new URL(request.url);
	if (url.origin !== self.location.origin) return request;
	url.search = "";
	return new Request(url.toString(), { method: "GET" });
}

self.addEventListener("fetch", function (event) {
	var request = event.request;
	if (request.method !== "GET") return;
	if (!shouldHandle(new URL(request.url))) return;

	event.respondWith(
		// ignoreSearch matters: the portal opens each game as `<game>/index.html?v=<timestamp>`
		// to force a reload when reopening the same iframe, but games are precached under their
		// clean URL. Matching on the full URL meant the cache never hit and every game fell
		// through to the network — so offline served offline.html instead of her game.
		caches.match(request, { ignoreSearch: true }).then(function (cached) {
			var networkFetch = fetch(request)
				.then(function (response) {
					if (response && response.ok) {
						var copy = response.clone();
						caches.open(CACHE_NAME).then(function (cache) {
							cache.put(cacheKey(request), copy);
						});
					}
					return response;
				})
				.catch(function () {
					return null;
				});

			if (cached) {
				// Stale-while-revalidate: serve the cached copy immediately, let the
				// network request update the cache in the background for next time.
				networkFetch.catch(function () {});
				return cached;
			}

			return networkFetch.then(function (response) {
				if (response) return response;
				if (request.mode === "navigate") {
					return caches.match(resolve("offline.html", SCOPE_URL));
				}
				return new Response("", { status: 504, statusText: "Offline" });
			});
		})
	);
});
