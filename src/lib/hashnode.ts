import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient('https://gql.hashnode.com');
const HOST = 'theoutlander.hashnode.dev'; // your publication

export type PostNode = {
  id: string;
  slug: string;
  title: string;
  brief?: string;
  url: string;
  publishedAt?: string;
  coverImage?: { url?: string | null } | null;
  tags?: { name: string }[];
};

const POSTS = gql /* GraphQL */ `
  query Posts($host: String!, $page: Int!) {
    publication(host: $host) {
      posts(page: $page) {
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
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

export async function fetchAllPosts(): Promise<PostNode[]> {
  let page = 1;
  const out: PostNode[] = [];
  // Hashnode caps per-page; loop to fetch all

  while (true) {
    const data = await client.request<Record<string, unknown>>(POSTS, {
      host: HOST,
      page,
    });
    const publication = data?.publication as Record<string, unknown>;
    const posts = publication?.posts as Record<string, unknown>;
    const edges = (posts?.edges as Record<string, unknown>[]) ?? [];
    out.push(...edges.map((e: Record<string, unknown>) => e.node as PostNode));
    const pageInfo = (posts as Record<string, unknown>)?.pageInfo as Record<
      string,
      unknown
    >;
    if (!pageInfo?.hasNextPage) break;
    page++;
  }
  return out;
}
