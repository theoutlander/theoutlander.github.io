import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import { BlogPagePanda } from "../BlogPagePanda";

// Mock the styled-system css function
vi.mock("../../styled-system/css/index.mjs", () => ({
	css: vi.fn((styles) => JSON.stringify(styles)),
}));

// Mock components
vi.mock("../../components/HeaderSSR", () => ({
	default: ({ currentPage }: { currentPage: string }) => (
		<header
			data-testid="header"
			data-current-page={currentPage}
		>
			Header
		</header>
	),
}));

vi.mock("../../components/Footer", () => ({
	default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock("../../components/blog/BlogList", () => ({
	default: ({ posts }: { posts: any[] }) => (
		<div data-testid="blog-list">
			{posts && posts.map
				? posts.map((post) => (
						<article
							key={post.slug}
							data-testid={`post-${post.slug}`}
						>
							<h2>{post.title}</h2>
							<p>{post.excerpt}</p>
						</article>
				  ))
				: null}
		</div>
	),
}));

vi.mock("../../components/SkipLink", () => ({
	default: () => (
		<a
			href="#main-content"
			data-testid="skip-link"
		>
			Skip to main content
		</a>
	),
}));

describe("BlogPagePanda", () => {
	const mockPosts = [
		{
			slug: "test-post-1",
			title: "Test Post 1",
			excerpt: "Test excerpt 1",
			date: "2024-01-15",
			cover: "https://example.com/cover1.jpg",
			tags: ["react", "javascript"],
			url: "https://example.com/test-post-1",
		},
		{
			slug: "test-post-2",
			title: "Test Post 2",
			excerpt: "Test excerpt 2",
			date: "2024-01-16",
			cover: "https://example.com/cover2.jpg",
			tags: ["typescript", "testing"],
			url: "https://example.com/test-post-2",
		},
	];

	it("renders all main sections", () => {
		render(<BlogPagePanda posts={mockPosts} />);

		expect(screen.getByTestId("skip-link")).toBeInTheDocument();
		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("blog-list")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});

	it("sets correct current page for header", () => {
		render(<BlogPagePanda posts={mockPosts} />);

		const header = screen.getByTestId("header");
		expect(header).toHaveAttribute("data-current-page", "blogs");
	});

	it("renders main content with correct id", () => {
		render(<BlogPagePanda posts={mockPosts} />);

		const main = screen.getByRole("main");
		expect(main).toHaveAttribute("id", "main-content");
	});

	it("passes posts to BlogList component", () => {
		render(<BlogPagePanda posts={mockPosts} />);

		expect(screen.getByTestId("post-test-post-1")).toBeInTheDocument();
		expect(screen.getByTestId("post-test-post-2")).toBeInTheDocument();
		expect(screen.getByText("Test Post 1")).toBeInTheDocument();
		expect(screen.getByText("Test Post 2")).toBeInTheDocument();
	});

	it("handles empty posts array", () => {
		render(<BlogPagePanda posts={[]} />);

		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("blog-list")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
		expect(screen.queryByTestId("post-test-post-1")).not.toBeInTheDocument();
	});

	it("handles undefined posts", () => {
		// @ts-expect-error - testing runtime behavior
		render(<BlogPagePanda posts={undefined} />);

		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("blog-list")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});
});
