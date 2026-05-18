import { describe, it, expect } from "vitest";
import { render, screen, within } from "../../test/test-utils";
import { BlogPostPagePanda } from "../BlogPostPagePanda";
import { formatBlogDate, formatReadTime, postReadMinutes } from "../../lib/blog-format";
import type { Post } from "../../types/blog";

const mockPost: Post = {
	id: "68d72ef766a499385385e183",
	slug: "how-engineers-can-use-ai-effectively",
	title: "How Engineers Can Use AI Effectively",
	excerpt:
		"AI is everywhere in tech conversations. Some people hype it as magic while others dismiss it as overblown.",
	url: "https://nick.karnik.io/blog/how-engineers-can-use-ai-effectively",
	date: "2025-09-27T00:25:27.274Z",
	cover:
		"/assets/images/blog/how-engineers-can-use-ai-effectively-bc5411bc-f5fb-4a4f-aecf-62ae5358c42c.png",
	category: "AI",
	tags: ["AI", "engineering", "Productivity"],
	contentHtml: "<p>This is the full article content in HTML format.</p>",
};

const mockPosts = [mockPost];

function getArticle() {
	return screen.getByRole("article");
}

describe("BlogPostPagePanda", () => {
	it("renders post with contentHtml", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
			"How Engineers Can Use AI Effectively"
		);
		expect(
			within(getArticle()).getByText("This is the full article content in HTML format.")
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /Back to writing/ })).toHaveAttribute(
			"href",
			"/blog"
		);
	});

	it("renders post with html property when contentHtml is not available", () => {
		const postWithHtml = {
			...mockPost,
			contentHtml: undefined,
			html: "<p>This is content from the html property.</p>",
		};

		render(<BlogPostPagePanda post={postWithHtml} posts={[postWithHtml]} />);

		expect(
			within(getArticle()).getByText("This is content from the html property.")
		).toBeInTheDocument();
	});

	it("renders excerpt when neither contentHtml nor html is available", () => {
		const postWithExcerptOnly = {
			...mockPost,
			contentHtml: undefined,
			html: undefined,
		};

		render(<BlogPostPagePanda post={postWithExcerptOnly} posts={[postWithExcerptOnly]} />);

		expect(
			within(getArticle()).getByText(
				"AI is everywhere in tech conversations. Some people hype it as magic while others dismiss it as overblown."
			)
		).toBeInTheDocument();
	});

	it("renders cover image when available", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		const coverImage = screen.getByRole("presentation");
		expect(coverImage).toHaveAttribute("src", mockPost.cover);
		expect(coverImage).toHaveAttribute("alt", "");
	});

	it("does not render cover image when not available", () => {
		const postWithoutCover = {
			...mockPost,
			cover: "",
		};

		render(<BlogPostPagePanda post={postWithoutCover} posts={[postWithoutCover]} />);

		expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
	});

	it("renders category in the dateline", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		expect(screen.getByText(/AI ·/)).toBeInTheDocument();
	});

	it("renders tags when available", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		expect(screen.getByText("AI", { selector: ".ds-tag" })).toBeInTheDocument();
		expect(screen.getByText("engineering", { selector: ".ds-tag" })).toBeInTheDocument();
		expect(screen.getByText("Productivity", { selector: ".ds-tag" })).toBeInTheDocument();
	});

	it("does not render tags section when no tags available", () => {
		const postWithoutTags = {
			...mockPost,
			tags: [],
		};

		render(<BlogPostPagePanda post={postWithoutTags} posts={[postWithoutTags]} />);

		expect(screen.queryByText("Topics.")).not.toBeInTheDocument();
	});

	it("formats date correctly", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		expect(screen.getByText(formatBlogDate(mockPost.date), { exact: false })).toBeInTheDocument();
	});

	it("shows reading time in the dateline", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		expect(
			screen.getByText(formatReadTime(postReadMinutes(mockPost)), { exact: false })
		).toBeInTheDocument();
	});

	it("handles missing date gracefully", () => {
		const postWithoutDate = {
			...mockPost,
			date: "",
		};

		render(<BlogPostPagePanda post={postWithoutDate} posts={[postWithoutDate]} />);

		expect(
			screen.getByRole("heading", { level: 1, name: "How Engineers Can Use AI Effectively" })
		).toBeInTheDocument();
	});

	it("handles missing excerpt gracefully", () => {
		const postWithoutExcerpt = {
			...mockPost,
			excerpt: "",
		};

		render(<BlogPostPagePanda post={postWithoutExcerpt} posts={[postWithoutExcerpt]} />);

		expect(
			screen.getByRole("heading", { level: 1, name: "How Engineers Can Use AI Effectively" })
		).toBeInTheDocument();
	});
});
