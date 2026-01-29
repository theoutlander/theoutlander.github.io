import { createFileRoute } from "@tanstack/react-router";
import { BlogPagePanda } from "../../pages/BlogPagePanda";
import { loadAllBlogPosts, type BlogPost } from "../../lib/content";

export const Route = createFileRoute("/blog/")({
	component: BlogPage,
	validateSearch: (search: Record<string, unknown>) => ({
		tag: typeof search.tag === "string" ? search.tag : undefined,
		category: typeof search.category === "string" ? search.category : undefined,
	}),
	// Don't re-run loader when only search changes — we filter in the component
	loaderDeps: () => ({}),
	loader: async (): Promise<{ posts: BlogPost[] }> => {
		try {
			const posts = await loadAllBlogPosts();
			return { posts };
		} catch (error) {
			console.error("Failed to load blog posts:", error);
			return { posts: [] };
		}
	},
});

function BlogPage() {
	const { posts } = Route.useLoaderData();
	const { tag, category } = Route.useSearch();
	return <BlogPagePanda posts={posts} filterTag={tag} filterCategory={category} />;
}
