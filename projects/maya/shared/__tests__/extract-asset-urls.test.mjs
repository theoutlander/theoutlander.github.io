import { test } from "node:test";
import assert from "node:assert";
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
