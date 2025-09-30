import { createFileRoute } from "@tanstack/react-router";
import { BlogPostPagePanda } from "../pages/BlogPostPagePanda";

export const Route = createFileRoute("/blog-post/$slug")({
	component: BlogPostPage,
	loader: async ({ params }): Promise<{ post: any }> => {
		console.log("Blog loader called with params:", params);
		try {
			// First try to get the individual post data
			try {
				console.log(
					"Fetching individual post:",
					`/data/posts/${params.slug}.json`
				);
				const response = await fetch(`/data/posts/${params.slug}.json`);
				console.log("Individual post response:", response.status, response.ok);
				if (response.ok) {
					const post = await response.json();
					console.log("Individual post loaded:", post.title);
					return { post };
				}
			} catch (error) {
				console.warn(
					`Could not load individual post data for ${params.slug}, falling back to general data`,
					error
				);
			}

			// Fallback to general hashnode data
			console.log("Fetching hashnode data...");
			const response = await fetch("/data/hashnode.json");
			console.log("Hashnode response:", response.status, response.ok);
			const posts = await response.json();
			console.log("Hashnode posts loaded:", posts.length);
			const post = posts.find((p: any) => p.slug === params.slug);
			console.log("Found post in hashnode data:", post?.title);

			if (!post) {
				throw new Error(`Post with slug "${params.slug}" not found`);
			}

			return { post };
		} catch (error) {
			console.error("Failed to load blog post:", error);
			throw error;
		}
	},
});

function BlogPostPage() {
	const { post } = Route.useLoaderData();
	console.log("BlogPostPage: Loaded post:", post?.title);
	return <BlogPostPagePanda post={post} />;
}
