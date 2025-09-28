import { GraphQLClient, gql } from "graphql-request";
import { HASHNODE_API_KEY, HASHNODE_PUBLICATION_ID } from "./hashnode-config";

const getClient = () => {
	return new GraphQLClient("https://gql.hashnode.com", {
		headers: {
			Authorization: HASHNODE_API_KEY,
		},
	});
};

export const getAllPosts = async () => {
	const client = getClient();
	const allPosts = await client.request(
		gql`
      query allPosts {
        publication(id: "${HASHNODE_PUBLICATION_ID}") {
          id
          title
          posts(first: 20) {
            pageInfo{
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                author{
                  name
                  profilePicture
                }
                title
                subtitle
                brief
                slug
                coverImage {
                  url
                }
                tags {
                  name
                  slug
                }
                publishedAt
                readTimeInMinutes
              }
            }
          }
        }
      }
    `,
	);
	return allPosts;
};

export const getPost = async (slug: string) => {
	const client = getClient();
	const data = await client.request(
		gql`
      query postDetails($slug: String!) {
        publication(id: "${HASHNODE_PUBLICATION_ID}") {
          id
          post(slug: $slug) {
            id
            author{
              name
              profilePicture
            }
            publishedAt
            title
            subtitle
            readTimeInMinutes
            content{
              html
            }
            tags {
              name
              slug
            }
            coverImage {
              url
            }
          }
        }
      }
    `,
		{ slug: slug },
	);
	return (data as any).publication.post;
};
