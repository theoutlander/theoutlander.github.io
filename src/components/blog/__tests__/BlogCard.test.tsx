import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import BlogCard from '../BlogCard'
import type { Post } from '../RoutePost'

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

const mockPost: Post = {
  slug: 'test-post',
  title: 'Test Post Title',
  excerpt: 'This is a test post excerpt that should be displayed in the card.',
  date: '2024-01-15',
  cover: 'https://example.com/cover.jpg',
  tags: ['react', 'testing', 'typescript'],
  url: 'https://example.com/test-post',
}

const mockPostWithoutCover: Post = {
  ...mockPost,
  cover: undefined,
}

const mockPostWithoutTags: Post = {
  ...mockPost,
  tags: undefined,
}

describe('BlogCard', () => {
  it('renders post title', () => {
    render(<BlogCard post={mockPost} />)
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('renders post excerpt', () => {
    render(<BlogCard post={mockPost} />)
    expect(
      screen.getByText(
        'This is a test post excerpt that should be displayed in the card.'
      )
    ).toBeInTheDocument()
  })

  it('renders formatted date', () => {
    render(<BlogCard post={mockPost} />)
    expect(screen.getByText(/Jan 14 2024/)).toBeInTheDocument()
  })

  it('renders reading time estimate', () => {
    render(<BlogCard post={mockPost} />)
    expect(screen.getByText(/min read/)).toBeInTheDocument()
  })

  it('renders cover image when available', () => {
    render(<BlogCard post={mockPost} />)
    const image = screen.getByRole('presentation')
    expect(image).toHaveAttribute('src', 'https://example.com/cover.jpg')
    expect(image).toHaveAttribute('alt', '')
  })

  it('does not render cover image when not available', () => {
    render(<BlogCard post={mockPostWithoutCover} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders tags when available', () => {
    render(<BlogCard post={mockPost} />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('testing')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
  })

  it('does not render tags when not available', () => {
    render(<BlogCard post={mockPostWithoutTags} />)
    expect(screen.queryByText('react')).not.toBeInTheDocument()
  })

  it('limits tags to 3 maximum', () => {
    const postWithManyTags: Post = {
      ...mockPost,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    }
    render(<BlogCard post={postWithManyTags} />)
    expect(screen.getByText('tag1')).toBeInTheDocument()
    expect(screen.getByText('tag2')).toBeInTheDocument()
    expect(screen.getByText('tag3')).toBeInTheDocument()
    expect(screen.queryByText('tag4')).not.toBeInTheDocument()
    expect(screen.queryByText('tag5')).not.toBeInTheDocument()
  })

  it('handles empty excerpt gracefully', () => {
    const postWithoutExcerpt: Post = {
      ...mockPost,
      excerpt: '',
    }
    render(<BlogCard post={postWithoutExcerpt} />)
    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
  })

  it('handles missing date gracefully', () => {
    const postWithoutDate: Post = {
      ...mockPost,
      date: undefined,
    }
    render(<BlogCard post={postWithoutDate} />)
    expect(screen.getByText(/min read/)).toBeInTheDocument()
  })
})