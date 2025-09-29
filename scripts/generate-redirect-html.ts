import { writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { redirects } from "../src/redirects";

// Create redirect HTML files for GitHub Pages
// GitHub Pages doesn't support _redirects files, so we need individual HTML files

function createRedirectHTML(destination: string, statusCode: number): string {
	const isPermanent = statusCode === 301 || statusCode === 308;
	const delay = isPermanent ? 0 : 1; // Immediate for permanent, 1s for temporary

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Redirecting...</title>
	<meta http-equiv="refresh" content="${delay};url=${destination}" />
	<meta name="robots" content="noindex" />
	<style>
		body {
			font-family: system-ui, -apple-system, sans-serif;
			text-align: center;
			padding: 2rem;
			background: #f7fafc;
			color: #1a202c;
		}
		@media (prefers-color-scheme: dark) {
			body {
				background: #1a202c;
				color: #f7fafc;
			}
		}
		.container {
			max-width: 600px;
			margin: 0 auto;
		}
		.spinner {
			display: inline-block;
			width: 20px;
			height: 20px;
			border: 2px solid #e2e8f0;
			border-radius: 50%;
			border-top-color: #2563eb;
			animation: spin 1s ease-in-out infinite;
			margin-right: 8px;
		}
		@keyframes spin {
			to { transform: rotate(360deg); }
		}
		.link {
			color: #2563eb;
			text-decoration: none;
		}
		.link:hover {
			text-decoration: underline;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="spinner"></div>
		<p>Redirecting to <a href="${destination}" class="link">${destination}</a>...</p>
		<p><small>If you are not redirected automatically, <a href="${destination}" class="link">click here</a>.</small></p>
	</div>
	
	<script>
		// Immediate redirect for permanent redirects
		${isPermanent ? `window.location.replace("${destination}");` : ""}
		
		// Fallback redirect after delay
		setTimeout(() => {
			window.location.replace("${destination}");
		}, ${delay * 1000});
	</script>
</body>
</html>`;
}

// Generate redirect HTML files
console.log("🔄 Generating redirect HTML files for GitHub Pages...");

redirects.forEach((redirect) => {
	const htmlContent = createRedirectHTML(
		redirect.destination,
		redirect.statusCode
	);

	// Handle file redirects (like /resume.pdf) differently
	const isFileRedirect = redirect.source.includes(".");

	if (isFileRedirect) {
		// For file redirects, create the redirect file directly
		const filePath = join(process.cwd(), "dist", redirect.source);

		// Remove existing file if it exists (like resume.pdf)
		if (existsSync(filePath)) {
			unlinkSync(filePath);
		}

		writeFileSync(filePath, htmlContent);
	} else {
		// For directory redirects, create index.html in a subdirectory
		const filePath = join(process.cwd(), "dist", redirect.source, "index.html");
		const dir = dirname(filePath);
		mkdirSync(dir, { recursive: true });
		writeFileSync(filePath, htmlContent);
	}

	console.log(`  ✅ ${redirect.source} → ${redirect.destination}`);
});

console.log("🎉 Redirect HTML files generated successfully!");
console.log(`📁 Generated ${redirects.length} redirect files in dist/`);
