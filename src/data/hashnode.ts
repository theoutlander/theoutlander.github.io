const ENDPOINT = "https://gql.hashnode.com";
const TOKEN = process.env.HASHNODE_TOKEN;
const PUB_ID = process.env.PUBLICATION_ID;

async function gql<T>(query: string, variables: Record<string, any>): Promise<T> {
  if (!TOKEN || !PUB_ID) {
    // Dev mode: no secrets → return empty structures
    return { publication: { posts: { edges: [] }, post: null } } as unknown as T;
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

export async function getPosts(limit = 24) {
  const q = `
    query ($pubId: ObjectId!, $first: Int!) {
      publication(id: $pubId) {
        posts(first: $first) {
          edges { node { id slug title brief publishedAt coverImage { url } tags { name slug } } }
        }
      }
    }`;
  const d = await gql<any>(q, { pubId: PUB_ID, first: limit });
  return (d.publication?.posts?.edges ?? []).map((e: any) => e.node);
}

export async function getPost(slug: string) {
  const q = `
    query ($pubId: ObjectId!, $slug: String!) {
      publication(id: $pubId) {
        post(slug: $slug) {
          id title subtitle publishedAt coverImage { url } content { html } tags { name slug }
        }
      }
    }`;
  const d = await gql<any>(q, { pubId: PUB_ID, slug });
  return d.publication?.post ?? null;
}
