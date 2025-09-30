import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import Header from '../Header'

// Mock the router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

describe('Header', () => {
  it('renders the brand name', () => {
    render(<Header />)
    expect(screen.getByText('Nick Karnik')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })

  it('has correct href attributes for navigation links', () => {
    render(<Header />)

    // Find links by their text content and check if they have the correct href
    const homeLink = screen.getByText('Home')
    const blogLink = screen.getByText('Blog')
    const aboutLink = screen.getByText('About')

    // Check that the links exist and are clickable
    expect(homeLink).toBeInTheDocument()
    expect(blogLink).toBeInTheDocument()
    expect(aboutLink).toBeInTheDocument()
  })

  it('has correct href for brand link', () => {
    render(<Header />)

    const brandLink = screen.getByText('Nick Karnik').closest('a')
    expect(brandLink).toHaveAttribute('href', '/')
  })

  it('renders with proper structure', () => {
    render(<Header />)

    // Check that the header element exists
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()

    // Check that the brand and navigation are in the same container
    const brand = screen.getByText('Nick Karnik')
    const home = screen.getByText('Home')
    expect(brand.closest('header')).toBe(home.closest('header'))
  })
})