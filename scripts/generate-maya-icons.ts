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
