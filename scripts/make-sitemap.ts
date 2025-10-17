import { readFile, writeFile, mkdir } from "node:fs/promises";
import { BlogPostData } from "../src/types/blog";

const BASE = process.env.SITE_URL || "https://nick.karnik.io";

async function run() {
	const baseRoutes = [
		{ path: "/", priority: "1.0", changefreq: "weekly" },
		{ path: "/blog", priority: "0.9", changefreq: "weekly" },
		{ path: "/about", priority: "0.8", changefreq: "monthly" },
		{ path: "/resume", priority: "0.8", changefreq: "monthly" },
	];

	let posts: BlogPostData[] = [];
	try {
		posts = JSON.parse(await readFile("public/data/blog-posts.json", "utf8"));
	} catch {
		// Ignore error if file doesn't exist
	}

	const now = new Date().toISOString();

	const urls = [
		...baseRoutes.map((route) => ({
			loc: `${BASE}${route.path}`,
			lastmod: now,
			changefreq: route.changefreq,
			priority: route.priority,
		})),
		...posts.map((post) => ({
			loc: `${BASE}/blog/${post.slug}`,
			lastmod: post.date ? new Date(post.date).toISOString() : now,
			changefreq: "monthly",
			priority: "0.7",
		})),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
	)
	.join("\n")}
</urlset>
`;

	await mkdir("dist", { recursive: true });
	await writeFile("dist/sitemap.xml", xml);
	console.log(`sitemap.xml written with ${urls.length} URLs`);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
