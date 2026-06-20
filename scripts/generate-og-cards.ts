#!/usr/bin/env tsx
/**
 * Generate branded Open Graph / social-share cards for blog posts.
 *
 * Renders a 1200x630 editorial card per post (dark background, accent rule,
 * large Newsreader title, mono eyebrow + wordmark) with headless Chrome and
 * writes `public/assets/images/og/<slug>.jpg`. The SSR renderer prefers these
 * for og:image / twitter:image.
 *
 * Run locally and commit the output (matches how the repo ships social images):
 *   pnpm og:cards
 */

import { readFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

type PostMeta = {
	slug: string;
	title: string;
	date?: string;
	category?: string;
};

/** Minimal frontmatter parse for the fields the card needs. */
function parsePost(file: string, raw: string): PostMeta | null {
	const fm = raw.match(/^---\n([\s\S]*?)\n---/);
	if (!fm) return null;
	const block = fm[1];
	const field = (key: string) =>
		block.match(new RegExp(`^${key}:\\s*["']?(.*?)["']?\\s*$`, "m"))?.[1]?.trim();

	const title = field("title");
	if (!title) return null;

	return {
		slug: file.replace(/\.md$/, ""),
		title,
		date: field("date"),
		category: field("category"),
	};
}

function collectPosts(): PostMeta[] {
	const dir = join(process.cwd(), "content", "blog");
	const posts: PostMeta[] = [];
	for (const name of readdirSync(dir)) {
		if (!name.endsWith(".md") || name.startsWith("_")) continue;
		const meta = parsePost(name, readFileSync(join(dir, name), "utf8"));
		if (meta) posts.push(meta);
	}
	return posts;
}

function formatDate(iso?: string): string {
	if (!iso) return "";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
}

/** Title size tier so long headlines still fit ~4 lines. */
function titleSize(title: string): number {
	const n = title.length;
	if (n <= 28) return 86;
	if (n <= 44) return 74;
	if (n <= 64) return 62;
	return 52;
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function cardHtml(post: PostMeta): string {
	const eyebrowParts = [post.category, formatDate(post.date)].filter(Boolean);
	const eyebrow = eyebrowParts.join("  ·  ").toUpperCase();

	return /* html */ `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${OG_WIDTH}px; height: ${OG_HEIGHT}px; }
  body {
    /* dark editorial palette */
    background:
      radial-gradient(1100px 500px at 85% -10%, oklch(0.24 0.03 250) 0%, transparent 60%),
      oklch(0.155 0.01 250);
    color: oklch(0.965 0.008 250);
    font-family: "Newsreader", Georgia, serif;
    position: relative;
    overflow: hidden;
  }
  .bar {
    position: absolute; left: 0; top: 0; bottom: 0; width: 10px;
    background: oklch(0.82 0.18 145);
  }
  .frame {
    height: 100%;
    padding: 76px 84px 108px 92px;
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .eyebrow {
    font-family: "JetBrains Mono", monospace;
    font-size: 22px; font-weight: 500;
    letter-spacing: 0.16em;
    color: oklch(0.82 0.18 145);
  }
  .title {
    font-size: ${titleSize(post.title)}px;
    font-weight: 600;
    line-height: 1.07;
    letter-spacing: -0.02em;
    max-width: 18ch;
    /* optical balance */
    text-wrap: balance;
  }
  .foot {
    display: flex; align-items: center; justify-content: space-between;
    font-family: "JetBrains Mono", monospace;
    font-size: 24px; font-weight: 500;
    letter-spacing: 0.02em;
    color: oklch(0.78 0.012 250);
  }
  .wordmark { color: oklch(0.965 0.008 250); }
  .dot { color: oklch(0.82 0.18 145); }
</style>
</head>
<body>
  <div class="bar"></div>
  <div class="frame">
    <div class="eyebrow">${escapeHtml(eyebrow)}</div>
    <div class="title">${escapeHtml(post.title)}</div>
    <div class="foot">
      <span class="wordmark">nick.karnik.io</span>
      <span><span class="dot">●</span>&nbsp;&nbsp;Nick Karnik</span>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
	const posts = collectPosts();
	if (posts.length === 0) {
		console.log("ℹ️  No posts found");
		return;
	}

	const outDir = join(process.cwd(), "public", "assets", "images", "og");
	if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

	console.log(`🎨 Generating ${posts.length} OG card(s) at ${OG_WIDTH}x${OG_HEIGHT}…\n`);

	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	try {
		const page = await browser.newPage();
		await page.setViewport({ width: OG_WIDTH, height: OG_HEIGHT, deviceScaleFactor: 1 });

		for (const post of posts) {
			await page.setContent(cardHtml(post), { waitUntil: "load" });
			// Ensure web fonts are fully loaded and painted before snapshotting.
			await page.evaluate(async () => {
				await (document as Document).fonts.ready;
			});
			await new Promise((r) => setTimeout(r, 150));

			const outPath = join(outDir, `${post.slug}.jpg`);
			await page.screenshot({
				path: outPath,
				type: "jpeg",
				quality: 92,
				clip: { x: 0, y: 0, width: OG_WIDTH, height: OG_HEIGHT },
			});
			console.log(`✅ ${post.slug}.jpg`);
		}
	} finally {
		await browser.close();
	}

	console.log("\n✅ Done. Commit public/assets/images/og/ — the SSR renderer prefers these for og:image.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
