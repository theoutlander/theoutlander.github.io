import { describe, it, expect } from "vitest";
import { render, screen } from "../../test/test-utils";
import { BlogPagePanda } from "../BlogPagePanda";
import { COPY } from "../../data/site-copy";
import type { Post } from "../../types/blog";

describe("BlogPagePanda", () => {
	const mockPosts: Post[] = [
		{
			id: "1",
			slug: "test-post-1",
			title: "Test Post 1",
			excerpt: "Test excerpt 1",
			date: "2024-01-15",
			cover: "https://example.com/cover1.jpg",
			category: "Engineering",
			tags: ["react", "javascript"],
			url: "https://example.com/test-post-1",
		},
		{
			id: "2",
			slug: "test-post-2",
			title: "Test Post 2",
			excerpt: "Test excerpt 2",
			date: "2024-01-16",
			cover: "https://example.com/cover2.jpg",
			category: "AI",
			tags: ["typescript", "testing"],
			url: "https://example.com/test-post-2",
		},
	];

	it("renders page headline and lede", () => {
		render(<BlogPagePanda posts={mockPosts} />);

		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(COPY.blog.headline);
		expect(screen.getByText(COPY.blog.lede)).toBeInTheDocument();
	});

	it("renders post index rows", () => {
		render(<BlogPagePanda posts={mockPosts} />);

		expect(screen.getByRole("link", { name: /Test Post 1/ })).toHaveAttribute(
			"href",
			"/blog/test-post-1"
		);
		expect(screen.getByRole("link", { name: /Test Post 2/ })).toHaveAttribute(
			"href",
			"/blog/test-post-2"
		);
		expect(screen.getByText("Test excerpt 1")).toBeInTheDocument();
	});

	it("renders category filter controls", () => {
		render(<BlogPagePanda posts={mockPosts} />);

		expect(screen.getByRole("button", { name: COPY.blog.filterAll })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "AI" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Engineering" })).toBeInTheDocument();
	});

	it("shows post count in section tag", () => {
		render(<BlogPagePanda posts={mockPosts} />);

		expect(
			screen.getByText(`2 ${COPY.blog.sectionRightSuffix}`, { exact: false })
		).toBeInTheDocument();
	});

	it("handles empty posts array", () => {
		render(<BlogPagePanda posts={[]} />);

		expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
		expect(screen.queryByRole("link", { name: /Test Post 1/ })).not.toBeInTheDocument();
	});
});
