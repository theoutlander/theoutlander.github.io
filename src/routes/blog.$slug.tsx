import { createFileRoute } from "@tanstack/react-router";
import PostView from "../components/blog/PostView";

export const Route = createFileRoute("/blog/$slug")({
	loader: async ({ params }) => {
		const url = `/data/posts/${params.slug}.json`;
		const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
		if (!res.ok) {
			// Fallback to main hashnode.json for dev safety
			const list = await fetch("/data/hashnode.json").then(r => r.json());
			const fallback = list.find((p: any) => p.slug === params.slug);
			if (!fallback) throw new Error(`No post data for slug: ${params.slug}`);
			return { 
				...fallback, 
				html: fallback.contentHtml || "<p>Full body not available in dev.</p>" 
			};
		}
		return (await res.json()) as {
			title: string;
			date: string | null;
			cover: string | null;
			excerpt: string;
			html: string;
			url: string;
			tags: string[];
		};
	},
	component: () => {
		const post = Route.useLoaderData();
		return <PostView post={post} />;
	},
	errorComponent: ({ error }) => (
		<div style={{ padding: 24 }}>
			<h3>Couldn't load this post</h3>
			<pre style={{ whiteSpace: "pre-wrap" }}>{String(error)}</pre>
		</div>
	),
});
