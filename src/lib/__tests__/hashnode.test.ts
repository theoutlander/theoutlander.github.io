import { describe, it, expect } from 'vitest'

// Mock graphql-request to avoid actual API calls
vi.mock('graphql-request', () => ({
  GraphQLClient: vi.fn().mockImplementation(() => ({
    request: vi.fn().mockResolvedValue({
      publication: {
        posts: {
          edges: [],
          pageInfo: { hasNextPage: false },
        },
      },
    }),
  })),
  gql: vi.fn(),
}))

import { fetchAllPosts } from '../hashnode'

describe('Hashnode API', () => {
  it('should return an array of posts', async () => {
    const posts = await fetchAllPosts()
    expect(Array.isArray(posts)).toBe(true)
  })

  it('should handle empty response gracefully', async () => {
    const posts = await fetchAllPosts()
    expect(posts).toHaveLength(0)
  })

  it('should be a function that can be called', () => {
    expect(typeof fetchAllPosts).toBe('function')
  })
})