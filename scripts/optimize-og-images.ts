#!/usr/bin/env tsx
/**
 * Optimize OG images for social media sharing
 * Resizes images to 1200x630px and compresses them for WhatsApp/Facebook
 */

import { readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const MAX_SIZE_KB = 300; // WhatsApp recommendation

function optimizeImage(inputPath: string, outputPath: string): boolean {
	try {
		// Use sips on macOS to resize and compress
		// Resize to 1200x630 with smart cropping (maintains aspect ratio, crops to fit)
		execSync(
			`sips -z ${OG_HEIGHT} ${OG_WIDTH} "${inputPath}" --out "${outputPath}"`,
			{ stdio: "inherit" }
		);

		// Check file size
		const stats = statSync(outputPath);
		const sizeKB = stats.size / 1024;

		if (sizeKB > MAX_SIZE_KB) {
			console.log(
				`⚠️  Warning: ${outputPath} is ${sizeKB.toFixed(0)}KB (target: <${MAX_SIZE_KB}KB)`
			);
			console.log("   Consider using a tool like ImageOptim or Squoosh to compress further");
		} else {
			console.log(`✅ Optimized: ${outputPath} (${sizeKB.toFixed(0)}KB)`);
		}

		return true;
	} catch (error) {
		console.error(`❌ Error optimizing ${inputPath}:`, error);
		return false;
	}
}

async function main() {
	console.log("🖼️  Optimizing OG images for social media...\n");

	const blogImagesDir = join(process.cwd(), "public", "assets", "images", "blog");
	
	if (!existsSync(blogImagesDir)) {
		console.error(`❌ Blog images directory not found: ${blogImagesDir}`);
		process.exit(1);
	}

	// Find all cover images
	const findCoverImages = (dir: string): string[] => {
		const images: string[] = [];
		const entries = readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dir, entry.name);
			if (entry.isDirectory()) {
				images.push(...findCoverImages(fullPath));
			} else if (
				entry.isFile() &&
				(entry.name.includes("cover") || entry.name.includes("og"))
			) {
				images.push(fullPath);
			}
		}

		return images;
	};

	const coverImages = findCoverImages(blogImagesDir);

	if (coverImages.length === 0) {
		console.log("ℹ️  No cover images found to optimize");
		return;
	}

	console.log(`Found ${coverImages.length} cover image(s) to optimize:\n`);

	for (const imagePath of coverImages) {
		const originalStats = statSync(imagePath);
		const originalSizeKB = originalStats.size / 1024;

		console.log(`📸 Processing: ${imagePath}`);
		console.log(`   Original size: ${originalSizeKB.toFixed(0)}KB`);

		// Create optimized version with -og suffix
		const ext = imagePath.substring(imagePath.lastIndexOf("."));
		const basePath = imagePath.replace(ext, "");
		const ogPath = `${basePath}-og${ext}`;

		// Only optimize if OG version doesn't exist or is older
		if (!existsSync(ogPath) || statSync(ogPath).mtime < originalStats.mtime) {
			optimizeImage(imagePath, ogPath);
		} else {
			console.log(`   ⏭️  OG version already exists and is up to date`);
		}

		console.log("");
	}

	console.log("✅ Optimization complete!");
	console.log("\n📝 Next steps:");
	console.log("   1. Review the optimized images");
	console.log("   2. Update blog post frontmatter to use -og versions if desired");
	console.log("   3. Or use the optimized versions automatically in the build process");
}

main().catch(console.error);
