import { readFileSync } from "node:fs";

type Post = { slug: string };

export async function paths(): Promise<string[]> {
	let posts: Post[] = [];
	try {
		const raw = readFileSync("public/data/hashnode.json", "utf8");
		posts = JSON.parse(raw) as Post[];
	} catch {
		// first build before fetch, default to top-level routes
	}
	return ["/", "/blog", ...posts.map((p) => `/blog/${p.slug}`)];
}
