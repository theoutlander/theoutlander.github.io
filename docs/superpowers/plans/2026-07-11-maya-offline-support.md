# Maya's Game Lab Offline Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every game in Maya's Game Lab (`projects/maya/`) playable with zero internet connection, including games Maya hasn't opened yet, via a precaching service worker and an installable home-screen icon.

**Architecture:** A service worker (`projects/maya/sw.js`) precaches the Lab shell and every game listed in `shared/offline-games.json` on first online visit. Rather than a hand-maintained per-file asset list, it auto-discovers each page's own `<script src>` / `<link rel="stylesheet">` references at install time (`shared/extract-asset-urls.js`), so a game's local files are picked up automatically as long as its folder slug is registered. Runtime fetches are cache-first with background revalidation (stale-while-revalidate), so updates reach Maya automatically next time she's online — no update prompt. A web app manifest + generated icons let the Lab be added to her iPad home screen as a standalone app, which is the reliable way to survive iOS Safari's cache eviction for rarely-visited sites.

**Tech Stack:** Plain browser-global JS (no build step, matching every existing file under `projects/maya/`), Service Worker API (Cache Storage, fetch interception), Web App Manifest, Node's built-in `node:test`/`node:assert` for the one pure-logic unit under test, Puppeteer (already a devDependency, used the same way `scripts/generate-og-cards.ts` already does) for icon generation.

## Global Constraints

- No build step for anything under `projects/maya/` — every new file there must be a plain script/HTML/JSON file that works when served as a static asset, exactly like the existing `shared/*.js` files (IIFE attaching to `self`/`window`, no `import`/`export`).
- `projects/maya/` is copied wholesale to `dist/maya` at build time (`src/ssr-renderer.tsx`, `copyDirectory("projects/maya", "dist/maya")`) — no changes to the build script are needed for new files to ship; verify this in Task 8, don't modify `ssr-renderer.tsx`.
- Root Vitest config excludes `projects/**` entirely (`vitest.config.ts`) — do not add a Vitest test for anything under `projects/maya/`. Use `node --test` directly instead (Node 24 ships this built in, zero new dependencies).
- Match the Lab's existing dark palette in any new UI: background `#0f0a1e`, text `#f0e6ff`, accent gradient `#ff6eb4` → `#c77dff`, headings in `'Fredoka One', cursive`, body text in `'Nunito', sans-serif`.
- Babylon.js must be pinned to a specific version (`babylonjs@9.16.1` via jsdelivr, verified reachable with `Access-Control-Allow-Origin: *` at implementation time) instead of the current unversioned `https://cdn.babylonjs.com/babylon.js`.

---

### Task 1: Game registry for the service worker

**Files:**
- Create: `projects/maya/shared/offline-games.json`

**Interfaces:**
- Produces: a JSON array of game folder slugs (strings) that Task 5's service worker reads to know which games to precache. Each slug corresponds 1:1 to a folder under `projects/maya/games/<slug>/index.html`.

- [ ] **Step 1: Create the registry file**

This is the list of every game currently in `GLIST` in `projects/maya/index.html` (`file: 'games/<slug>/index.html'`), with just the slug kept:

```json
[
  "castle-defenders-2",
  "mayas-escape-room",
  "mayas-sewing-museum",
  "build-on",
  "garden-work-update",
  "sparkle-duel",
  "mayas-sewing-shop",
  "mayas-delivery-service",
  "legend-of-the-rainbow-dragon",
  "pipe-flow",
  "mayas-kitchen",
  "skyline-builder",
  "castle-defenders",
  "pinata-piano",
  "dust-chasers",
  "spell-it"
]
```

- [ ] **Step 2: Verify every slug has a matching folder**

Run:
```bash
node -e "
const slugs = require('./projects/maya/shared/offline-games.json');
const fs = require('fs');
const missing = slugs.filter(s => !fs.existsSync('projects/maya/games/' + s + '/index.html'));
if (missing.length) { console.error('MISSING:', missing); process.exit(1); }
console.log('OK — all ' + slugs.length + ' slugs have an index.html');
"
```
Expected: `OK — all 16 slugs have an index.html`

- [ ] **Step 3: Commit**

```bash
git add projects/maya/shared/offline-games.json
git commit -m "feat(maya): add offline game registry for service worker precaching"
```

---

### Task 2: Asset URL extractor (TDD)

**Files:**
- Create: `projects/maya/shared/extract-asset-urls.js`
- Test: `projects/maya/shared/__tests__/extract-asset-urls.test.mjs`

**Interfaces:**
- Produces: `self.MayaExtractAssetUrls.extractAssetUrls(html: string): string[]` — a pure function, no side effects. Given raw HTML text, returns every `<script src="...">` URL and every `<link rel="stylesheet" href="...">` URL found in it, deduplicated, in document order. Consumed by Task 5's service worker via `importScripts('shared/extract-asset-urls.js')`.
- The test file loads the target script by reading its source text and running it inside a `vm` sandbox (not `require`/`import`) — this works regardless of the root repo's `"type": "module"` setting and requires zero changes to the plain-script format every other `shared/*.js` file already uses.

- [ ] **Step 1: Write the failing tests**

Create `projects/maya/shared/__tests__/extract-asset-urls.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadExtractor() {
	const src = readFileSync(join(__dirname, "../extract-asset-urls.js"), "utf8");
	const sandbox = { self: {} };
	vm.createContext(sandbox);
	vm.runInContext(src, sandbox);
	return sandbox.self.MayaExtractAssetUrls.extractAssetUrls;
}

test("extracts a single-line script src", () => {
	const extractAssetUrls = loadExtractor();
	const html = '<script src="foo.js"></script>';
	assert.deepEqual(extractAssetUrls(html), ["foo.js"]);
});

test("extracts a multi-line (attribute-per-line) script src", () => {
	const extractAssetUrls = loadExtractor();
	const html = `
		<script
			src="ga-analytics.js"
			defer
		></script>
	`;
	assert.deepEqual(extractAssetUrls(html), ["ga-analytics.js"]);
});

test("extracts an absolute CDN script src", () => {
	const extractAssetUrls = loadExtractor();
	const html = '<script src="https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js"></script>';
	assert.deepEqual(extractAssetUrls(html), [
		"https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js",
	]);
});

test("ignores inline scripts with no src", () => {
	const extractAssetUrls = loadExtractor();
	const html = "<script>window.MAYA_GAME='games/foo/index.html';</script>";
	assert.deepEqual(extractAssetUrls(html), []);
});

test("extracts a stylesheet link", () => {
	const extractAssetUrls = loadExtractor();
	const html = '<link rel="stylesheet" href="shared/family-chat.css">';
	assert.deepEqual(extractAssetUrls(html), ["shared/family-chat.css"]);
});

test("extracts a stylesheet link with href before rel", () => {
	const extractAssetUrls = loadExtractor();
	const html = '<link href="shared/family-chat.css" rel="stylesheet">';
	assert.deepEqual(extractAssetUrls(html), ["shared/family-chat.css"]);
});

test("ignores non-stylesheet link tags", () => {
	const extractAssetUrls = loadExtractor();
	const html = '<link rel="preconnect" href="https://fonts.googleapis.com">';
	assert.deepEqual(extractAssetUrls(html), []);
});

test("dedupes repeated URLs", () => {
	const extractAssetUrls = loadExtractor();
	const html = '<script src="a.js"></script><script src="a.js"></script>';
	assert.deepEqual(extractAssetUrls(html), ["a.js"]);
});

test("handles a realistic mixed document", () => {
	const extractAssetUrls = loadExtractor();
	const html = `
		<script>window.MAYA_GAME='games/castle-defenders-2/index.html';</script>
		<script src="portal-bridge.js"></script>
		<script src="../../shared/ios-audio-unlock.js"></script>
		<link href="https://fonts.googleapis.com/css2?family=Fredoka+One" rel="stylesheet">
		<script src="https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js"></script>
		<script src="cd-data.js"></script>
		<script src="cd-audio.js"></script>
	`;
	// All <script src> matches are collected first (in their own document
	// order), then all <link rel="stylesheet"> matches — the two tag types
	// are scanned in separate passes, so a link between scripts in the
	// source doesn't end up between them in the output. Order doesn't
	// matter for precaching (this feeds a de-duped URL set), so the
	// implementation doesn't need to interleave them to match source order.
	assert.deepEqual(extractAssetUrls(html), [
		"portal-bridge.js",
		"../../shared/ios-audio-unlock.js",
		"https://cdn.jsdelivr.net/npm/phaser@3.87.0/dist/phaser.min.js",
		"cd-data.js",
		"cd-audio.js",
		"https://fonts.googleapis.com/css2?family=Fredoka+One",
	]);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test projects/maya/shared/__tests__/extract-asset-urls.test.mjs`
Expected: FAIL — `ENOENT` reading `../extract-asset-urls.js` (file doesn't exist yet), all 9 tests fail.

- [ ] **Step 3: Write the implementation**

Create `projects/maya/shared/extract-asset-urls.js`:

```js
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test projects/maya/shared/__tests__/extract-asset-urls.test.mjs`
Expected: PASS — all 9 tests green, e.g. `# pass 9`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add projects/maya/shared/extract-asset-urls.js projects/maya/shared/__tests__/extract-asset-urls.test.mjs
git commit -m "feat(maya): add asset URL extractor for service worker precaching"
```

---

### Task 3: PWA manifest and icons

**Files:**
- Create: `projects/maya/manifest.webmanifest`
- Create: `scripts/generate-maya-icons.ts`
- Modify: `package.json` (add `maya:icons` script)
- Generated (run the script to produce these, then commit them): `projects/maya/icons/icon-192.png`, `projects/maya/icons/icon-512.png`, `projects/maya/icons/apple-touch-icon.png`

**Interfaces:**
- Produces: `projects/maya/manifest.webmanifest` (referenced by Task 6's `<link rel="manifest">`) and three PNG icon files at fixed paths (`icons/icon-192.png`, `icons/icon-512.png`, `icons/apple-touch-icon.png`), referenced by both the manifest and Task 6's `<link rel="apple-touch-icon">`.

- [ ] **Step 1: Write the manifest**

Create `projects/maya/manifest.webmanifest`:

```json
{
	"name": "Maya's Game Lab",
	"short_name": "Maya's Games",
	"description": "Maya's very own game studio — play anywhere, even offline.",
	"start_url": "/maya/index.html",
	"scope": "/maya/",
	"display": "standalone",
	"orientation": "any",
	"background_color": "#0f0a1e",
	"theme_color": "#0f0a1e",
	"icons": [
		{ "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
		{ "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
	]
}
```

- [ ] **Step 2: Write the icon generator script**

Create `scripts/generate-maya-icons.ts`:

```ts
#!/usr/bin/env tsx
/**
 * Generate the PWA icon set for Maya's Game Lab (Add to Home Screen).
 *
 * Renders a simple on-brand square icon with headless Chrome at each
 * required size and writes them to projects/maya/icons/.
 *
 * Run locally and commit the output (matches how og:cards ships its images):
 *   pnpm maya:icons
 */

import { mkdirSync, existsSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer";

type IconSpec = { name: string; size: number };

const ICONS: IconSpec[] = [
	{ name: "icon-192.png", size: 192 },
	{ name: "icon-512.png", size: 512 },
	{ name: "apple-touch-icon.png", size: 180 },
];

function iconHtml(size: number): string {
	const emojiSize = Math.round(size * 0.56);
	return /* html */ `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${size}px; height: ${size}px; }
  body {
    background: radial-gradient(120% 120% at 30% 20%, #2d1260 0%, #0f0a1e 65%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .em {
    font-size: ${emojiSize}px;
    line-height: 1;
    filter: drop-shadow(0 4px 10px rgba(0,0,0,.35));
  }
</style>
</head>
<body>
  <div class="em">🎮</div>
</body>
</html>`;
}

async function main() {
	const outDir = join(process.cwd(), "projects", "maya", "icons");
	if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

	console.log(`🎮 Generating ${ICONS.length} Maya's Game Lab icon(s)…\n`);

	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	try {
		const page = await browser.newPage();

		for (const icon of ICONS) {
			await page.setViewport({ width: icon.size, height: icon.size, deviceScaleFactor: 1 });
			await page.setContent(iconHtml(icon.size), { waitUntil: "load" });
			await new Promise((r) => setTimeout(r, 100));

			const outPath = join(outDir, icon.name);
			await page.screenshot({
				path: outPath,
				type: "png",
				clip: { x: 0, y: 0, width: icon.size, height: icon.size },
			});
			console.log(`✅ ${icon.name}`);
		}
	} finally {
		await browser.close();
	}

	console.log("\n✅ Done. Commit projects/maya/icons/ — the manifest and index.html reference these.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
```

- [ ] **Step 3: Register the npm script**

In `package.json`, in the `"scripts"` block, add a `maya:icons` entry right after the existing `"og:cards"` line:

```json
		"og:cards": "tsx scripts/generate-og-cards.ts",
		"maya:icons": "tsx scripts/generate-maya-icons.ts"
```

- [ ] **Step 4: Run the generator**

Run: `pnpm maya:icons`
Expected output ends with:
```
✅ icon-192.png
✅ icon-512.png
✅ apple-touch-icon.png

✅ Done. Commit projects/maya/icons/ — the manifest and index.html reference these.
```

- [ ] **Step 5: Verify the files exist and are non-trivial in size**

Run:
```bash
ls -la projects/maya/icons/
```
Expected: three `.png` files, each several KB (not 0 bytes).

- [ ] **Step 6: Commit**

```bash
git add projects/maya/manifest.webmanifest scripts/generate-maya-icons.ts package.json projects/maya/icons/
git commit -m "feat(maya): add PWA manifest and generated home-screen icons"
```

---

### Task 4: Offline fallback page

**Files:**
- Create: `projects/maya/offline.html`

**Interfaces:**
- Produces: a static HTML page at `/maya/offline.html`, served by Task 5's service worker when a navigation request misses both cache and network (a game that was never precached, opened while offline).

- [ ] **Step 1: Write the page**

Create `projects/maya/offline.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Not saved yet — Maya's Game Lab</title>
<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;background:#0f0a1e;color:#f0e6ff;font-family:'Nunito',sans-serif;display:flex;align-items:center;justify-content:center;text-align:center}
  .wrap{padding:32px;max-width:420px}
  .em{font-size:64px;margin-bottom:16px}
  h1{font-family:'Fredoka One',cursive;font-size:28px;margin-bottom:12px;color:#ffe14d}
  p{font-size:16px;line-height:1.5;color:rgba(240,230,255,.75)}
  a{display:inline-block;margin-top:24px;background:linear-gradient(135deg,#ff6eb4,#c77dff);color:#fff;text-decoration:none;font-family:'Fredoka One',cursive;font-size:16px;padding:12px 24px;border-radius:50px}
</style>
</head>
<body>
  <div class="wrap">
    <div class="em">📡💤</div>
    <h1>This one's not saved yet!</h1>
    <p>You're offline and this game hasn't been downloaded to play without WiFi. Try it again next time you're connected — after that it'll always work offline! 💕</p>
    <a href="index.html">🎮 Back to the Game Lab</a>
  </div>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add projects/maya/offline.html
git commit -m "feat(maya): add offline fallback page"
```

---

### Task 5: Service worker

**Files:**
- Create: `projects/maya/sw.js`

**Interfaces:**
- Consumes: `self.MayaExtractAssetUrls.extractAssetUrls(html)` from Task 2 (loaded via `importScripts`), the slug array in `shared/offline-games.json` from Task 1, and the fixed shell file list from Tasks 3–4 (`manifest.webmanifest`, `offline.html`, `icons/*.png`).
- Produces: standard service worker lifecycle behavior — precache on `install`, old-cache cleanup on `activate`, cache-first-with-background-revalidate on `fetch`. Nothing else in this plan calls into `sw.js` directly; Task 6 only registers it.

- [ ] **Step 1: Write the service worker**

Create `projects/maya/sw.js`:

```js
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

self.addEventListener("fetch", function (event) {
	var request = event.request;
	if (request.method !== "GET") return;

	event.respondWith(
		caches.match(request).then(function (cached) {
			var networkFetch = fetch(request)
				.then(function (response) {
					if (response && response.ok) {
						var copy = response.clone();
						caches.open(CACHE_NAME).then(function (cache) {
							cache.put(request, copy);
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
```

- [ ] **Step 2: Commit**

```bash
git add projects/maya/sw.js
git commit -m "feat(maya): add precaching service worker"
```

---

### Task 6: Wire up the Lab shell

**Files:**
- Modify: `projects/maya/index.html:1-13` (head tags)
- Modify: `projects/maya/index.html` (near the closing `</body>`, service worker registration)

**Interfaces:**
- Consumes: `manifest.webmanifest` (Task 3), `icons/apple-touch-icon.png` (Task 3), `sw.js` (Task 5).

- [ ] **Step 1: Add manifest, icon, and theme-color tags to `<head>`**

In `projects/maya/index.html`, find:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>Maya's Game Lab 🎮</title>

<!-- Google Analytics -->
<script src="shared/ga-analytics.js" defer></script>
```

Replace with:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>Maya's Game Lab 🎮</title>

<!-- Offline support: installable PWA + service worker (see sw.js) -->
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#0f0a1e">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Maya's Games">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">

<!-- Google Analytics -->
<script src="shared/ga-analytics.js" defer></script>
```

- [ ] **Step 2: Register the service worker**

In `projects/maya/index.html`, find the closing tags:

```html
<script type="module" src="shared/family-chat.js"></script>
</body>
</html>
```

Replace with:

```html
<script type="module" src="shared/family-chat.js"></script>
<script>
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').catch(function(err){
      console.warn('[maya] service worker registration failed', err);
    });
  });
}
</script>
</body>
</html>
```

- [ ] **Step 3: Verify the page still loads with no console errors**

Run: `pnpm dev` (if not already running), then load `http://localhost:5173/maya/index.html` in a browser and open DevTools Console.
Expected: no errors; `navigator.serviceWorker.getRegistrations()` (typed into the console) resolves to an array containing one registration once the page finishes loading.

- [ ] **Step 4: Commit**

```bash
git add projects/maya/index.html
git commit -m "feat(maya): wire up PWA manifest and service worker registration"
```

---

### Task 7: Pin the Babylon.js CDN version

**Files:**
- Modify: `projects/maya/games/build-on/index.html:330`
- Modify: `projects/maya/games/mayas-sewing-museum/index.html:204`

**Interfaces:**
- None — this only changes which exact CDN URL two games load, so the service worker precaches a stable, reproducible file instead of whatever "latest" happens to resolve to at first-cache time.

- [ ] **Step 1: Pin in `build-on/index.html`**

Find:
```html
<script src="https://cdn.babylonjs.com/babylon.js"></script>
```

Replace with:
```html
<script src="https://cdn.jsdelivr.net/npm/babylonjs@9.16.1/babylon.js"></script>
```

- [ ] **Step 2: Pin in `mayas-sewing-museum/index.html`**

Find:
```html
<script src="https://cdn.babylonjs.com/babylon.js"></script>
```

Replace with:
```html
<script src="https://cdn.jsdelivr.net/npm/babylonjs@9.16.1/babylon.js"></script>
```

- [ ] **Step 3: Verify both games still boot**

Run: `pnpm dev`, then load `http://localhost:5173/maya/games/build-on/index.html?standalone=1` and `http://localhost:5173/maya/games/mayas-sewing-museum/index.html?standalone=1`.
Expected: both games render their 3D scene as before (no blank screen, no console errors about `BABYLON` being undefined).

- [ ] **Step 4: Commit**

```bash
git add projects/maya/games/build-on/index.html projects/maya/games/mayas-sewing-museum/index.html
git commit -m "fix(maya): pin Babylon.js to a specific version for predictable offline caching"
```

---

### Task 8: End-to-end verification

**Files:** none (verification only — no code changes).

- [ ] **Step 1: Verify the build copies everything automatically**

Run: `pnpm build`, then:
```bash
ls dist/maya/sw.js dist/maya/manifest.webmanifest dist/maya/offline.html dist/maya/shared/offline-games.json dist/maya/shared/extract-asset-urls.js dist/maya/icons/icon-192.png
```
Expected: all six paths exist (confirms `copyDirectory("projects/maya", "dist/maya")` in `src/ssr-renderer.tsx` picked up every new file with no code changes needed there).

- [ ] **Step 2: Verify precaching in DevTools**

Run: `pnpm preview` (or `vite preview`), open `http://localhost:5173/maya/index.html` in Chrome, open DevTools → Application tab.
- Under **Service Workers**: confirm status is "activated and is running".
- Under **Cache Storage → maya-cache-v1**: confirm it contains `index.html`, `manifest.webmanifest`, `offline.html`, all three icons, and, for each of the 16 slugs in `offline-games.json`, that game's `index.html` plus its local JS/CSS files and any CDN engine it uses (Phaser/Babylon.js URLs should appear for the games that load them).

- [ ] **Step 3: Verify offline playback**

In the same DevTools session: Network tab → set throttling to "Offline". Reload `http://localhost:5173/maya/index.html`.
Expected: the Lab page loads normally. Click into at least one Phaser game (e.g. Castle Defenders 2) and one Babylon.js game (e.g. Build On!) — both should load and be playable with sound, entirely offline.

- [ ] **Step 4: Verify the offline-fallback path**

Still offline in DevTools: navigate directly to a URL under `/maya/games/` that is **not** in `offline-games.json` (temporarily works even without creating a new game — any URL that 404s server-side but is same-origin under `/maya/` will hit the service worker's fetch handler and fall through to the offline-fallback branch, e.g. `http://localhost:5173/maya/games/does-not-exist/index.html`).
Expected: the custom `offline.html` page renders ("This one's not saved yet!") instead of a browser error page.

- [ ] **Step 5: Verify Add to Home Screen (manual, real device)**

On an iOS device (ideally Maya's iPad), with WiFi on: open Safari to `https://nick.karnik.io/maya/` (or `https://maya.karnik.io/` if the Cloudflare Worker proxy is live), let it fully load once, then tap Share → "Add to Home Screen".
Expected: the resulting home screen icon shows the generated game-controller icon and the name "Maya's Games"; tapping it launches full-screen with no Safari address bar. Turn on Airplane Mode and relaunch from the icon — the Lab and a previously-opened game should still work.

- [ ] **Step 6: Commit any fixes found during verification**

If Steps 2–5 surface a bug, fix it in the relevant task's file, re-run that task's verification step, then:
```bash
git add -A
git commit -m "fix(maya): <describe what verification caught>"
```
If nothing needs fixing, this task produces no commit — it's a pure verification pass.
