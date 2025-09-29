import { GraphQLClient, gql } from "graphql-request";

const client = new GraphQLClient("https://gql.hashnode.com");
const HOST = "theoutlander.hashnode.dev"; // your publication

export type PostNode = {
  id: string; slug: string; title: string; brief?: string;
  url: string; publishedAt?: string; coverImage?: { url?: string | null } | null;
  tags?: { name: string }[];
};

const POSTS = gql/* GraphQL */`
  query Posts($host: String!, $page: Int!) {
    publication(host: $host) {
      posts(page: $page) {
        edges { node { id slug title brief url publishedAt coverImage { url } tags { name } } }
        pageInfo { hasNextPage }
      }
    }
  }
`;

export async function fetchAllPosts(): Promise<PostNode[]> {
  let page = 1, out: PostNode[] = [];
  // Hashnode caps per-page; loop to fetch all
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data = await client.request<any>(POSTS, { host: HOST, page });
    const edges = data?.publication?.posts?.edges ?? [];
    out.push(...edges.map((e: any) => e.node as PostNode));
    if (!data?.publication?.posts?.pageInfo?.hasNextPage) break;
    page++;
  }
  return out;
}
