import { writeFile, mkdir } from "node:fs/promises";

const BASE = process.env.SITE_URL || "https://nick.karnik.io";

async function run() {
	const robotsTxt = `User-agent: *
Allow: /

# Explicitly allow AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Sitemap
Sitemap: ${BASE}/sitemap.xml

# Disallow admin or private areas (if any)
# Disallow: /admin/
# Disallow: /private/
`;

	await mkdir("dist", { recursive: true });
	await writeFile("dist/robots.txt", robotsTxt);
	console.log("robots.txt generated successfully");
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
