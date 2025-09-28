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

// Hashnode configuration
const HASHNODE_KEY = "f221f0f1-5a6f-44ea-a272-39c88e05794f";
const PUBLICATION_ID = "68d5e360b5ea70a47e408afd";
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
	const data = await client.request(Q, { host });
	const edges = data?.publication?.posts?.edges ?? [];
	const rawPosts = edges.map((e: any) => e.node as RawPost);

	return rawPosts.map((p) => ({
		id: p.id,
		slug: p.slug,
		title: p.title,
		excerpt: p.brief ?? "",
		url: p.url,
		date: p.publishedAt ?? null,
		cover: p.coverImage?.url ?? null,
		tags: (p.tags ?? []).map((t) => t.name),
	}));
}

const posts = await fetchAll(HOST);
await mkdir("public/data", { recursive: true });
await writeFile("public/data/hashnode.json", JSON.stringify(posts, null, 2));
console.log(`Wrote ${posts.length} posts to public/data/hashnode.json`);
