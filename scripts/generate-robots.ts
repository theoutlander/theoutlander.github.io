import { writeFile, mkdir } from "node:fs/promises";

const BASE = process.env.SITE_URL || "https://nick.karnik.io";

async function run() {
	const robotsTxt = `User-agent: *
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
