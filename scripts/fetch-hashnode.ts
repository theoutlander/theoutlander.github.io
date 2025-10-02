import { mkdir, writeFile } from "node:fs/promises";
import { GraphQLClient, gql } from "graphql-request";

type RawPost = {
	id: string;
	slug: string;
	title: string;
	brief?: string;
	url: string;
	publishedAt?: string;
	coverImage?: { url?: string | null } | null;
	tags?: { name: string }[];
	content?: {
		markdown?: string;
		html?: string;
	};
};

type Post = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	url: string;
	date: string | null;
	cover: string | null;
	tags: string[];
	contentMarkdown?: string;
	contentHtml?: string;
};

type PostEdge = {
	node: RawPost;
};

type GraphQLResponse = {
	publication?: {
		posts?: {
			edges?: PostEdge[];
		};
	};
};

// Your actual Hashnode subdomain
const HOST = process.env.HASHNODE_HOST || "nickkarnik.hashnode.dev";
const client = new GraphQLClient("https://gql.hashnode.com");

const Q = gql/* GraphQL */ `
	query Posts($host: String!, $after: String) {
		publication(host: $host) {
			posts(first: 20, after: $after) {
				pageInfo {
					hasNextPage
					endCursor
				}
				edges {
					node {
						id
						slug
						title
						brief
						url
						publishedAt
						coverImage {
							url
						}
						tags {
							name
						}
						content {
							markdown
							html
						}
					}
				}
			}
		}
	}
`;

// Note: Hashnode GraphQL API doesn't support staticPages field
// We'll create a fallback About page instead

async function fetchAll(host: string): Promise<Post[]> {
	const data = await client.request<GraphQLResponse>(Q, { host, after: null });
	const edges = data?.publication?.posts?.edges ?? [];
	const rawPosts = edges.map((e: PostEdge) => e.node as RawPost);

	return rawPosts.map((p: RawPost) => ({
		id: p.id,
		slug: p.slug,
		title: p.title,
		excerpt: p.brief ?? "",
		url: `https://nick.karnik.io/blog/${p.slug}`,
		date: p.publishedAt ?? null,
		cover: p.coverImage?.url ?? null,
		tags: (p.tags ?? []).map((t: { name: string }) => t.name),
		contentMarkdown: p.content?.markdown,
		contentHtml: p.content?.html,
	}));
}

async function createAboutPage() {
	// Since Hashnode GraphQL API doesn't support staticPages,
	// we'll create a fallback About page with your content
	await mkdir("public/data/pages", { recursive: true });

	const aboutContent = {
		slug: "about",
		title: "About",
		html: `
			<p>I help teams move faster without breaking things.</p>
			<p>I've led engineering at Google, Microsoft, Salesforce, Tableau, IDM (now part of the Gates Foundation), TMobile, and startups. I care about clear decisions, strong execution, and code that ships.</p>
			<p>On this blog I write about AI, engineering leadership, and building web products with React, Node.js, and TypeScript. I try to keep it practical so you can use it right away.</p>
			<p>I also run Plutonic Consulting, where I work with founders on fractional CTO support, AI strategy, and scaling teams.</p>
			<p>If you're hiring, wrestling with roadmap and architecture, or want a second set of eyes on your stack, I'm happy to help.</p>
			<ul>
				<li>Email: <a href="mailto:nick@karnik.io">nick@karnik.io</a></li>
				<li>LinkedIn: <a href="https://www.linkedin.com/in/theoutlander" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/theoutlander</a></li>
				<li>Plutonic Consulting: <a href="https://plutonic.consulting" target="_blank" rel="noopener noreferrer">https://plutonic.consulting</a></li>
			</ul>
		`,
	};

	await writeFile(
		`public/data/pages/about.json`,
		JSON.stringify(aboutContent, null, 2)
	);

	console.log("Created fallback About page at public/data/pages/about.json");
}

const posts = await fetchAll(HOST);
await mkdir("public/data", { recursive: true });
await mkdir("public/data/posts", { recursive: true });

// Write the main hashnode.json file
await writeFile("public/data/hashnode.json", JSON.stringify(posts, null, 2));

// Write individual post files
for (const post of posts) {
	const postData = {
		id: post.id,
		title: post.title,
		date: post.date,
		cover: post.cover,
		excerpt: post.excerpt,
		html: post.contentHtml || "",
		url: post.url,
		tags: post.tags,
	};
	await writeFile(
		`public/data/posts/${post.slug}.json`,
		JSON.stringify(postData, null, 2)
	);
}

console.log(`Wrote ${posts.length} posts to public/data/hashnode.json`);
console.log(
	`Wrote ${posts.length} individual post files to public/data/posts/`
);

// Create About page (since Hashnode API doesn't support staticPages)
await createAboutPage();
