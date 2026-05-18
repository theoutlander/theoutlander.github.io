import { describe, it, expect } from "vitest";
import { render, screen } from "../../test/test-utils";
import { HomePagePanda } from "../HomePagePanda";
import { COPY } from "../../data/site-copy";
import { PERSON, WORK_BLOCKS } from "../../data/person";
import type { BlogPost } from "../../types/blog";

describe("HomePagePanda", () => {
	const mockPosts: BlogPost[] = [
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
			contentMarkdown: "",
			contentHtml: "",
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
			contentMarkdown: "",
			contentHtml: "",
		},
	];

	it("renders hero, writing, and work sections", () => {
		render(<HomePagePanda posts={mockPosts} />);

		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
			`${COPY.home.headlineLine1}${COPY.home.headlineLine2}`
		);
		expect(screen.getByText(COPY.home.writingHeading)).toBeInTheDocument();
		expect(screen.getByText(COPY.home.workHeading)).toBeInTheDocument();
		expect(screen.getByText(PERSON.tagline)).toBeInTheDocument();
	});

	it("renders primary CTAs", () => {
		render(<HomePagePanda posts={mockPosts} />);

		expect(screen.getByRole("link", { name: COPY.home.ctaPrimary })).toHaveAttribute(
			"href",
			"/blog"
		);
		expect(screen.getByRole("link", { name: COPY.home.ctaSecondary })).toHaveAttribute(
			"href",
			"/resume"
		);
	});

	it("renders up to three recent posts", () => {
		render(<HomePagePanda posts={mockPosts} />);

		expect(screen.getByRole("link", { name: "Test Post 1" })).toHaveAttribute(
			"href",
			"/blog/test-post-1"
		);
		expect(screen.getByRole("link", { name: "Test Post 2" })).toHaveAttribute(
			"href",
			"/blog/test-post-2"
		);
		expect(screen.getByText("Test excerpt 1")).toBeInTheDocument();
	});

	it("renders work blocks from person data", () => {
		render(<HomePagePanda posts={mockPosts} />);

		for (const block of WORK_BLOCKS) {
			expect(screen.getByText(block.t)).toBeInTheDocument();
		}
	});

	it("shows empty state when there are no posts", () => {
		render(<HomePagePanda posts={[]} />);

		expect(screen.getByText(COPY.home.writingEmpty)).toBeInTheDocument();
		expect(screen.queryByRole("link", { name: "Test Post 1" })).not.toBeInTheDocument();
	});
});
