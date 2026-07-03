// Injects the live route list into dist/404.html at build time so the 404
// page's nav and "did you mean?" fuzzy matcher never drift from the real site.
//
// Sources of truth:
//   - scripts/site-routes.ts        → static pages (nav + fuzzy list)
//   - public/data/blog-posts.json   → blog slugs (fuzzy list only)
//
// public/404.html carries marker pairs; this replaces whatever is between them:
//   JS array:    /* ROUTES:LIST */ [...] /* /ROUTES:LIST */
//   nav HTML:    <!-- ROUTES:NAV --> ... <!-- /ROUTES:NAV -->
// The defaults inside the markers keep the raw file valid if this step is skipped.

import { readFile, writeFile } from "node:fs/promises";
import { STATIC_ROUTES } from "./site-routes";
import { BlogPostData } from "../src/types/blog";

const FILE = "dist/404.html";

function replaceBetween(
	html: string,
	open: string,
	close: string,
	replacement: string,
	label: string,
): string {
	const start = html.indexOf(open);
	const end = html.indexOf(close);
	if (start === -1 || end === -1 || end < start) {
		throw new Error(`inject-404-routes: markers "${open}" ... "${close}" not found in ${FILE}`);
	}
	console.log(`inject-404-routes: replaced ${label}`);
	return html.slice(0, start + open.length) + replacement + html.slice(end);
}

async function run() {
	let posts: BlogPostData[] = [];
	try {
		posts = JSON.parse(await readFile("public/data/blog-posts.json", "utf8"));
	} catch {
		// No posts yet — fuzzy list will still include the static routes.
	}

	// Fuzzy-match list: every real destination, static pages + blog posts.
	const allRoutes = [
		...STATIC_ROUTES.map((r) => r.path),
		...posts.map((p) => `/blog/${p.slug}`),
	];
	const routesLiteral = JSON.stringify(allRoutes);

	// Visible nav: curated static pages only.
	const navHtml =
		"\n" +
		STATIC_ROUTES.filter((r) => r.nav)
			.map(
				(r) =>
					`      <a href="${r.path}"><span class="name">${r.label}</span><span class="href">${r.path}</span></a>`,
			)
			.join("\n") +
		"\n    ";

	let html = await readFile(FILE, "utf8");
	html = replaceBetween(html, "/* ROUTES:LIST */", "/* /ROUTES:LIST */", routesLiteral, "fuzzy route list");
	html = replaceBetween(html, "<!-- ROUTES:NAV -->", "<!-- /ROUTES:NAV -->", navHtml, "visible nav");
	await writeFile(FILE, html);

	console.log(`inject-404-routes: ${allRoutes.length} routes written to ${FILE}`);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
