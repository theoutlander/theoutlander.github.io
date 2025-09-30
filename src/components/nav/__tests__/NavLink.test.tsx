import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "../../../test/test-utils";
import NavLink from "../NavLink";

// Mock the router
vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
}));

// Mock window.location
const mockLocation = {
	pathname: "/",
};

Object.defineProperty(window, "location", {
	value: mockLocation,
	writable: true,
});

describe("NavLink", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset to default pathname
		mockLocation.pathname = "/";
	});

	it("renders children correctly", () => {
		mockLocation.pathname = "/about";
		render(<NavLink to="/about">About</NavLink>);
		expect(screen.getByText("About")).toBeInTheDocument();
	});

	it("renders as a link with correct href", () => {
		mockLocation.pathname = "/about";
		render(<NavLink to="/about">About</NavLink>);
		const link = screen.getByText("About");
		expect(link).toBeInTheDocument();
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "/about");
	});

	it("renders with correct href for different routes", () => {
		mockLocation.pathname = "/blog/some-post";
		render(<NavLink to="/blog">Blog</NavLink>);
		const link = screen.getByText("Blog");
		expect(link).toHaveAttribute("href", "/blog");
	});

	it("renders with correct href for root path", () => {
		mockLocation.pathname = "/";
		render(<NavLink to="/">Home</NavLink>);
		const link = screen.getByText("Home");
		expect(link).toHaveAttribute("href", "/");
	});

	it("renders with correct href for nested paths", () => {
		mockLocation.pathname = "/blog/tag/react";
		render(<NavLink to="/blog">Blog</NavLink>);
		const link = screen.getByText("Blog");
		expect(link).toHaveAttribute("href", "/blog");
	});

	it("renders with correct href for non-matching paths", () => {
		mockLocation.pathname = "/about-page";
		render(<NavLink to="/about">About</NavLink>);
		const link = screen.getByText("About");
		expect(link).toHaveAttribute("href", "/about");
	});

	it("component renders without errors", () => {
		mockLocation.pathname = "/test";
		render(<NavLink to="/test">Test</NavLink>);
		expect(screen.getByText("Test")).toBeInTheDocument();
	});
});
