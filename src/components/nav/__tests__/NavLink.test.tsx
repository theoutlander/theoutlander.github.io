import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../../test/test-utils'
import NavLink from '../NavLink'

// Mock the router
const mockUseRouterState = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useRouterState: () => mockUseRouterState(),
}))

describe('NavLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children correctly', () => {
    mockUseRouterState.mockReturnValue({
      location: { pathname: '/about' },
    });

    render(<NavLink to='/about'>About</NavLink>);
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('applies active styles when pathname matches exactly', () => {
    mockUseRouterState.mockReturnValue({
      location: { pathname: '/about' },
    });

    render(<NavLink to='/about'>About</NavLink>);
    const link = screen.getByText('About');
    expect(link).toHaveStyle('color: var(--chakra-colors-blue-700)')
    expect(link).toHaveStyle('font-weight: var(--chakra-font-weights-semibold)')
  });

  it('applies active styles when pathname starts with the route', () => {
    mockUseRouterState.mockReturnValue({
      location: { pathname: '/blog/some-post' },
    });

    render(<NavLink to='/blog'>Blog</NavLink>);
    const link = screen.getByText('Blog');
    expect(link).toHaveStyle('color: var(--chakra-colors-blue-700)')
    expect(link).toHaveStyle('font-weight: var(--chakra-font-weights-semibold)')
  });

  it('applies inactive styles when pathname does not match', () => {
    mockUseRouterState.mockReturnValue({
      location: { pathname: '/about' },
    });

    render(<NavLink to='/blog'>Blog</NavLink>);
    const link = screen.getByText('Blog');
    expect(link).toHaveStyle('color: var(--chakra-colors-gray-600)')
    expect(link).toHaveStyle('font-weight: var(--chakra-font-weights-normal)')
  });

  it('handles root path correctly', () => {
    mockUseRouterState.mockReturnValue({
      location: { pathname: '/' },
    });

    render(<NavLink to='/'>Home</NavLink>);
    const link = screen.getByText('Home');
    expect(link).toHaveStyle('color: var(--chakra-colors-blue-700)')
    expect(link).toHaveStyle('font-weight: var(--chakra-font-weights-semibold)')
  });

  it('handles nested paths correctly', () => {
    mockUseRouterState.mockReturnValue({
      location: { pathname: '/blog/tag/react' },
    });

    render(<NavLink to='/blog'>Blog</NavLink>);
    const link = screen.getByText('Blog');
    expect(link).toHaveStyle('color: var(--chakra-colors-blue-700)')
    expect(link).toHaveStyle('font-weight: var(--chakra-font-weights-semibold)')
  });

  it('does not match partial paths', () => {
    mockUseRouterState.mockReturnValue({
      location: { pathname: '/about-page' },
    });

    render(<NavLink to='/about'>About</NavLink>);
    const link = screen.getByText('About');
    expect(link).toHaveStyle('color: var(--chakra-colors-gray-600)')
    expect(link).toHaveStyle('font-weight: var(--chakra-font-weights-normal)')
  });
});
