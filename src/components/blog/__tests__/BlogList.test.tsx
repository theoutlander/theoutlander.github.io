import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../../test/test-utils'
import BlogList from '../BlogList'
import type { Post } from '../RoutePost'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock the router
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode
    to: string
    params?: { slug: string }
  }) => <a href={`${to}${params ? `/${params.slug}` : ''}`}>{children}</a>,
}))

// Mock Helmet
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='helmet'>{children}</div>
  ),
}))

const mockPosts: Post[] = [
  {
    slug: 'post-1',
    title: 'First Post',
    excerpt: 'This is the first post excerpt.',
    date: '2024-01-15',
    cover: 'https://example.com/cover1.jpg',
    tags: ['react', 'javascript'],
    url: 'https://example.com/post-1',
  },
  {
    slug: 'post-2',
    title: 'Second Post',
    excerpt: 'This is the second post excerpt.',
    date: '2024-01-16',
    cover: 'https://example.com/cover2.jpg',
    tags: ['typescript', 'testing'],
    url: 'https://example.com/post-2',
  },
  {
    slug: 'post-3',
    title: 'Third Post',
    excerpt: 'This is the third post excerpt.',
    date: '2024-01-17',
    cover: undefined,
    tags: ['react', 'typescript'],
    url: 'https://example.com/post-3',
  },
]

describe('BlogList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading skeleton initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<BlogList />)
    // Check for skeleton elements by their class names
    const skeletons = document.querySelectorAll('.chakra-skeleton')
    expect(skeletons).toHaveLength(16) // 4 cards × 4 skeleton elements each
  })

  it('renders posts after loading', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockPosts),
    })

    render(<BlogList />)

    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeInTheDocument()
      expect(screen.getByText('Second Post')).toBeInTheDocument()
      expect(screen.getByText('Third Post')).toBeInTheDocument()
    })
  })

  it('filters posts by tag when filterTag is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockPosts),
    })

    render(<BlogList filterTag='react' />)

    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeInTheDocument()
      expect(screen.getByText('Third Post')).toBeInTheDocument()
      expect(screen.queryByText('Second Post')).not.toBeInTheDocument()
    })
  })

  it('shows all posts when filterTag is not provided', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockPosts),
    })

    render(<BlogList />)

    await waitFor(() => {
      expect(screen.getByText('First Post')).toBeInTheDocument()
      expect(screen.getByText('Second Post')).toBeInTheDocument()
      expect(screen.getByText('Third Post')).toBeInTheDocument()
    })
  })

  it('handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Fetch failed'))

    render(<BlogList />)

    await waitFor(() => {
      expect(screen.queryByText('First Post')).not.toBeInTheDocument()
      expect(screen.queryByText('Second Post')).not.toBeInTheDocument()
      expect(screen.queryByText('Third Post')).not.toBeInTheDocument()
    })
  })

  it('renders posts without cover images', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockPosts),
    })

    render(<BlogList />)

    await waitFor(() => {
      expect(screen.getByText('Third Post')).toBeInTheDocument()
      // Third post has no cover image
      const images = screen.getAllByRole('presentation')
      expect(images).toHaveLength(2) // Only first two posts have cover images
    })
  })

  it('displays formatted dates', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockPosts),
    })

    render(<BlogList />)

    await waitFor(() => {
      expect(screen.getByText(/Jan 14 2024/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 15 2024/)).toBeInTheDocument()
      expect(screen.getByText(/Jan 16 2024/)).toBeInTheDocument()
    })
  })

  it('displays reading time estimates', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockPosts),
    })

    render(<BlogList />)

    await waitFor(() => {
      expect(screen.getAllByText(/min read/)).toHaveLength(3)
    })
  })

  it('renders SEO meta tags', () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockPosts),
    })

    render(<BlogList />)

    expect(screen.getByTestId('helmet')).toBeInTheDocument()
  })
})