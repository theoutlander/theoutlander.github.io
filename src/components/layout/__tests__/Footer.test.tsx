import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import Footer from '../Footer'

// Mock the router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

describe('Footer', () => {
  it('renders the author name', () => {
    render(<Footer />)
    expect(screen.getByText('Nick Karnik')).toBeInTheDocument()
  })

  it('renders the job title', () => {
    render(<Footer />)
    expect(
      screen.getByText('Engineering Leader & Staff Software Engineer')
    ).toBeInTheDocument()
  })

  it('renders technology stack', () => {
    render(<Footer />)
    expect(screen.getByText('Node')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders social media links', () => {
    render(<Footer />)

    // Check for social media links by their href attributes
    const links = screen.getAllByRole('link')
    const socialLinks = links.filter(
      link =>
        link.getAttribute('href')?.includes('github.com') ||
        link.getAttribute('href')?.includes('linkedin.com') ||
        link.getAttribute('href')?.includes('twitter.com') ||
        link.getAttribute('href')?.includes('youtube.com') ||
        link.getAttribute('href')?.includes('stackoverflow.com')
    )

    expect(socialLinks.length).toBeGreaterThan(0)
  })

  it('renders copyright information', () => {
    render(<Footer />)
    expect(screen.getByText(/© \d{4} Nick Karnik/)).toBeInTheDocument()
  })

  it('renders with proper structure', () => {
    render(<Footer />)

    // Check that the footer element exists
    const footer = screen.getByRole('contentinfo')
    expect(footer).toBeInTheDocument()
  })

  it('has external links with proper target', () => {
    render(<Footer />)

    const externalLinks = screen
      .getAllByRole('link')
      .filter(link => link.getAttribute('href')?.startsWith('http'))

    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})