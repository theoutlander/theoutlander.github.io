import { readFile, writeFile, mkdir } from "node:fs/promises";

const BASE = process.env.SITE_URL || "https://nick.karnik.io";

type Post = { slug: string };

async function run() {
	const baseRoutes = ["/", "/blog", "/about", "/resume"];
	let posts: Post[] = [];
	try {
		posts = JSON.parse(await readFile("public/data/hashnode.json", "utf8"));
	} catch {
		// Ignore error if file doesn't exist
	}

	const urls = [
		...baseRoutes.map((p) => `${BASE}${p}`),
		...posts.map((p) => `${BASE}/blog/${p.slug}`),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;

	await mkdir("public", { recursive: true });
	await writeFile("public/sitemap.xml", xml);
	console.log(`sitemap.xml written with ${urls.length} URLs`);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
