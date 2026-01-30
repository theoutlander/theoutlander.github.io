import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "../../test/test-utils";
import { BlogPostPagePanda } from "../BlogPostPagePanda";

// Mock the styled-system css function
vi.mock("../../styled-system/css/index.mjs", () => ({
	css: vi.fn((styles) => JSON.stringify(styles)),
}));

// Mock HeaderSSR and Footer components
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

vi.mock("../../components/blog/BlogSidebar", () => ({
	default: () => <aside data-testid="blog-sidebar">Sidebar</aside>,
}));

const mockPost = {
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

		expect(
			within(getArticle()).getByText("How Engineers Can Use AI Effectively")
		).toBeInTheDocument();
		expect(
			within(getArticle()).getByText("This is the full article content in HTML format.")
		).toBeInTheDocument();
		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});

	it("renders post with html property when contentHtml is not available", () => {
		const postWithHtml = {
			...mockPost,
			contentHtml: undefined,
			html: "<p>This is content from the html property.</p>",
		};

		render(<BlogPostPagePanda post={postWithHtml} posts={[postWithHtml]} />);

		expect(
			within(getArticle()).getByText("How Engineers Can Use AI Effectively")
		).toBeInTheDocument();
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
			within(getArticle()).getByText("How Engineers Can Use AI Effectively")
		).toBeInTheDocument();
		expect(
			within(getArticle()).getByText(
				"AI is everywhere in tech conversations. Some people hype it as magic while others dismiss it as overblown."
			)
		).toBeInTheDocument();
	});

	it("renders cover image when available", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		const coverImage = within(getArticle()).getByRole("img", { name: "How Engineers Can Use AI Effectively" });
		expect(coverImage).toBeInTheDocument();
		expect(coverImage).toHaveAttribute("src", mockPost.cover);
		expect(coverImage).toHaveAttribute("alt", "How Engineers Can Use AI Effectively");
	});

	it("does not render cover image when not available", () => {
		const postWithoutCover = {
			...mockPost,
			cover: "",
		};

		render(<BlogPostPagePanda post={postWithoutCover} posts={[postWithoutCover]} />);

		expect(within(getArticle()).queryByRole("img")).not.toBeInTheDocument();
	});

	it("renders category below title when available", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		const article = getArticle();
		// Category and first tag both show "AI"; assert at least one (category) is present
		const aiElements = within(article).getAllByText("AI");
		expect(aiElements.length).toBeGreaterThanOrEqual(1);
	});

	it("renders tags when available", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		const article = getArticle();
		expect(within(article).getByText("Ai")).toBeInTheDocument();
		expect(within(article).getByText("Engineering")).toBeInTheDocument();
		expect(within(article).getByText("Productivity")).toBeInTheDocument();
	});

	it("does not render tags section when no tags available", () => {
		const postWithoutTags = {
			...mockPost,
			tags: [],
		};

		render(<BlogPostPagePanda post={postWithoutTags} posts={[postWithoutTags]} />);

		expect(within(getArticle()).queryByText("Ai")).not.toBeInTheDocument();
	});

	it("formats date correctly", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		// The date should be formatted as "September 26, 2025" (timezone difference)
		expect(within(getArticle()).getByText("September 26, 2025")).toBeInTheDocument();
	});

	it("calculates reading time correctly", () => {
		render(<BlogPostPagePanda post={mockPost} posts={mockPosts} />);

		// The excerpt is about 20 words, so reading time should be 1 min
		expect(within(getArticle()).getByText("1 min read")).toBeInTheDocument();
	});

	it("handles missing date gracefully", () => {
		const postWithoutDate = {
			...mockPost,
			date: "",
		};

		render(<BlogPostPagePanda post={postWithoutDate} posts={[postWithoutDate]} />);

		expect(
			within(getArticle()).getByText("How Engineers Can Use AI Effectively")
		).toBeInTheDocument();
		// Should not crash when date is empty
	});

	it("handles missing excerpt gracefully", () => {
		const postWithoutExcerpt = {
			...mockPost,
			excerpt: "",
		};

		render(<BlogPostPagePanda post={postWithoutExcerpt} posts={[postWithoutExcerpt]} />);

		expect(
			within(getArticle()).getByText("How Engineers Can Use AI Effectively")
		).toBeInTheDocument();
		// Should not crash when excerpt is empty
	});
});
