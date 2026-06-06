#!/usr/bin/env tsx
/**
 * Optimize OG images for social media sharing.
 *
 * Generates a 1200x630 (1.91:1) center-cropped `-og.jpg` next to each blog
 * cover image. The SSR renderer (src/ssr-renderer.tsx) automatically prefers
 * the `-og.jpg`/`-og.png` variant for og:image / twitter:image when present.
 *
 * Covers are discovered from blog frontmatter (`cover:` field), not by filename,
 * so UUID-named covers are included.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const MAX_SIZE_KB = 300; // WhatsApp recommendation

function getDimensions(path: string): { w: number; h: number } | null {
	try {
		const out = execSync(`sips -g pixelWidth -g pixelHeight "${path}"`, {
			encoding: "utf8",
		});
		const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1]);
		const h = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1]);
		if (!w || !h) return null;
		return { w, h };
	} catch {
		return null;
	}
}

/** Resize-to-cover then center-crop to exactly OG_WIDTH x OG_HEIGHT (no distortion). */
function optimizeImage(inputPath: string, outputPath: string): boolean {
	const dims = getDimensions(inputPath);
	if (!dims) {
		console.error(`❌ Could not read dimensions for ${inputPath}`);
		return false;
	}

	// Scale so the image fully covers the target box (larger of the two ratios).
	const ratio = Math.max(OG_WIDTH / dims.w, OG_HEIGHT / dims.h);
	const scaledW = Math.round(dims.w * ratio);
	const scaledH = Math.round(dims.h * ratio);

	try {
		// --resampleHeightWidth forces exact dims; we pass aspect-preserving numbers
		// so there is no distortion, then -c crops centered to the target box.
		execSync(
			`sips -s format jpeg ` +
				`--resampleHeightWidth ${scaledH} ${scaledW} ` +
				`-c ${OG_HEIGHT} ${OG_WIDTH} ` +
				`"${inputPath}" --out "${outputPath}"`,
			{ stdio: "pipe" }
		);

		const sizeKB = statSync(outputPath).size / 1024;
		if (sizeKB > MAX_SIZE_KB) {
			console.log(
				`⚠️  ${outputPath} is ${sizeKB.toFixed(0)}KB (target <${MAX_SIZE_KB}KB) — consider further compression`
			);
		} else {
			console.log(`✅ ${outputPath} (${sizeKB.toFixed(0)}KB)`);
		}
		return true;
	} catch (error) {
		console.error(`❌ Error optimizing ${inputPath}:`, error);
		return false;
	}
}

/** Collect local cover image paths referenced by blog post frontmatter. */
function findCoverImagesFromPosts(): string[] {
	const blogDir = join(process.cwd(), "content", "blog");
	const covers = new Set<string>();

	for (const name of readdirSync(blogDir)) {
		if (!name.endsWith(".md")) continue;
		const md = readFileSync(join(blogDir, name), "utf8");
		const match = md.match(/^cover:\s*["']?([^"'\n]+)["']?\s*$/m);
		if (!match) continue;
		const cover = match[1].trim();
		// Only local images we can process with sips; skip remote URLs and SVGs.
		if (cover.startsWith("http") || cover.endsWith(".svg")) continue;
		covers.add(join(process.cwd(), "public", cover.replace(/^\//, "")));
	}

	return [...covers];
}

async function main() {
	console.log("🖼️  Optimizing OG images for social media...\n");

	const coverImages = findCoverImagesFromPosts();
	if (coverImages.length === 0) {
		console.log("ℹ️  No local cover images found in blog frontmatter");
		return;
	}

	console.log(`Found ${coverImages.length} cover image(s):\n`);

	for (const imagePath of coverImages) {
		if (!existsSync(imagePath)) {
			console.log(`⚠️  Missing on disk, skipping: ${imagePath}\n`);
			continue;
		}

		// Renderer looks for `<base>-og.jpg` (preferred) then `<base>-og.png`.
		const base = imagePath.replace(/\.(png|jpg|jpeg)$/i, "");
		const ogPath = `${base}-og.jpg`;

		const originalStats = statSync(imagePath);
		console.log(`📸 ${imagePath} (${(originalStats.size / 1024).toFixed(0)}KB)`);

		if (existsSync(ogPath) && statSync(ogPath).mtime >= originalStats.mtime) {
			console.log(`   ⏭️  Up-to-date OG version exists\n`);
			continue;
		}

		optimizeImage(imagePath, ogPath);
		console.log("");
	}

	console.log("✅ Optimization complete!");
	console.log(
		"\nThe SSR renderer auto-prefers the -og.jpg variant for og:image / twitter:image."
	);
	console.log("Run `pnpm build` and deploy for the new cards to take effect.");
}

main().catch(console.error);
