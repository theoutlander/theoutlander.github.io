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
const HOST = "nickkarnik.hashnode.dev";
const client = new GraphQLClient("https://gql.hashnode.com");

const Q = gql/* GraphQL */ `
	query Posts($host: String!) {
		publication(host: $host) {
			posts(first: 20) {
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
					}
				}
			}
		}
	}
`;

async function fetchAll(host: string): Promise<Post[]> {
	const data = await client.request<GraphQLResponse>(Q, { host });
	const edges = data?.publication?.posts?.edges ?? [];
	const rawPosts = edges.map((e: PostEdge) => e.node as RawPost);

	return rawPosts.map((p: RawPost) => ({
		id: p.id,
		slug: p.slug,
		title: p.title,
		excerpt: p.brief ?? "",
		url: p.url,
		date: p.publishedAt ?? null,
		cover: p.coverImage?.url ?? null,
		tags: (p.tags ?? []).map((t: { name: string }) => t.name),
	}));
}

const posts = await fetchAll(HOST);
await mkdir("public/data", { recursive: true });
await writeFile("public/data/hashnode.json", JSON.stringify(posts, null, 2));
console.log(`Wrote ${posts.length} posts to public/data/hashnode.json`);
