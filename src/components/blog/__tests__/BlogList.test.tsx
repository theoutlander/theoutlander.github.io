import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../../../test/test-utils";
import BlogList from "../BlogList";
import type { Post } from "../RoutePost";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the router
vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		params,
	}: {
		children: React.ReactNode;
		to: string;
		params?: { slug: string };
	}) => <a href={`${to}${params ? `/${params.slug}` : ""}`}>{children}</a>,
}));

// Mock Helmet
vi.mock("react-helmet-async", () => ({
	Helmet: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="helmet">{children}</div>
	),
}));

const mockPosts: Post[] = [
	{
		slug: "post-1",
		title: "First Post",
		excerpt: "This is the first post excerpt.",
		date: "2024-01-15",
		cover: "https://example.com/cover1.jpg",
		tags: ["react", "javascript"],
		url: "https://example.com/post-1",
	},
	{
		slug: "post-2",
		title: "Second Post",
		excerpt: "This is the second post excerpt.",
		date: "2024-01-16",
		cover: "https://example.com/cover2.jpg",
		tags: ["typescript", "testing"],
		url: "https://example.com/post-2",
	},
	{
		slug: "post-3",
		title: "Third Post",
		excerpt: "This is the third post excerpt.",
		date: "2024-01-17",
		cover: "",
		tags: ["react", "typescript"],
		url: "https://example.com/post-3",
	},
];

describe("BlogList", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders posts when provided", () => {
		render(<BlogList posts={mockPosts} />);

		expect(screen.getByText("First Post")).toBeInTheDocument();
		expect(screen.getByText("Second Post")).toBeInTheDocument();
		expect(screen.getByText("Third Post")).toBeInTheDocument();
	});

	it("filters posts by tag when filterTag is provided", () => {
		render(
			<BlogList
				posts={mockPosts}
				filterTag="react"
			/>
		);

		expect(screen.getByText("First Post")).toBeInTheDocument();
		expect(screen.getByText("Third Post")).toBeInTheDocument();
		expect(screen.queryByText("Second Post")).not.toBeInTheDocument();
	});

	it("shows all posts when filterTag is not provided", () => {
		render(<BlogList posts={mockPosts} />);

		expect(screen.getByText("First Post")).toBeInTheDocument();
		expect(screen.getByText("Second Post")).toBeInTheDocument();
		expect(screen.getByText("Third Post")).toBeInTheDocument();
	});

	it("renders posts without cover images", () => {
		render(<BlogList posts={mockPosts} />);

		expect(screen.getByText("Third Post")).toBeInTheDocument();
		// Third post has no cover image
		const images = screen.getAllByRole("presentation");
		expect(images).toHaveLength(2); // Only first two posts have cover images
	});

	it("displays formatted dates", () => {
		render(<BlogList posts={mockPosts} />);

		expect(screen.getByText(/Jan 14 2024/)).toBeInTheDocument();
		expect(screen.getByText(/Jan 15 2024/)).toBeInTheDocument();
		expect(screen.getByText(/Jan 16 2024/)).toBeInTheDocument();
	});

	it("displays reading time estimates", () => {
		render(<BlogList posts={mockPosts} />);

		expect(screen.getAllByText(/min read/)).toHaveLength(3);
	});

	it("renders without errors", () => {
		render(<BlogList posts={mockPosts} />);
		// Component renders successfully without Helmet (which is commented out)
		expect(screen.getByText("First Post")).toBeInTheDocument();
	});
});
