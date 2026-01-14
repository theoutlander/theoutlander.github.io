import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
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
	tags: ["AI", "engineering", "Productivity", "programming"],
	contentHtml: "<p>This is the full article content in HTML format.</p>",
};

describe("BlogPostPagePanda", () => {
	it("renders post with contentHtml", () => {
		render(<BlogPostPagePanda post={mockPost} />);

		expect(
			screen.getByText("How Engineers Can Use AI Effectively")
		).toBeInTheDocument();
		expect(
			screen.getByText("This is the full article content in HTML format.")
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

		render(<BlogPostPagePanda post={postWithHtml} />);

		expect(
			screen.getByText("How Engineers Can Use AI Effectively")
		).toBeInTheDocument();
		expect(
			screen.getByText("This is content from the html property.")
		).toBeInTheDocument();
	});

	it("renders excerpt when neither contentHtml nor html is available", () => {
		const postWithExcerptOnly = {
			...mockPost,
			contentHtml: undefined,
			html: undefined,
		};

		render(<BlogPostPagePanda post={postWithExcerptOnly} />);

		expect(
			screen.getByText("How Engineers Can Use AI Effectively")
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"AI is everywhere in tech conversations. Some people hype it as magic while others dismiss it as overblown."
			)
		).toBeInTheDocument();
	});

	it("renders cover image when available", () => {
		render(<BlogPostPagePanda post={mockPost} />);

		const coverImage = screen.getByRole("img", { name: "How Engineers Can Use AI Effectively" });
		expect(coverImage).toBeInTheDocument();
		expect(coverImage).toHaveAttribute("src", mockPost.cover);
		expect(coverImage).toHaveAttribute("alt", "How Engineers Can Use AI Effectively");
	});

	it("does not render cover image when not available", () => {
		const postWithoutCover = {
			...mockPost,
			cover: "",
		};

		render(<BlogPostPagePanda post={postWithoutCover} />);

		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("renders tags when available", () => {
		render(<BlogPostPagePanda post={mockPost} />);

		expect(screen.getByText("Ai")).toBeInTheDocument();
		expect(screen.getByText("Engineering")).toBeInTheDocument();
		expect(screen.getByText("Productivity")).toBeInTheDocument();
		expect(screen.getByText("Programming")).toBeInTheDocument();
	});

	it("does not render tags section when no tags available", () => {
		const postWithoutTags = {
			...mockPost,
			tags: [],
		};

		render(<BlogPostPagePanda post={postWithoutTags} />);

		expect(screen.queryByText("Ai")).not.toBeInTheDocument();
	});

	it("formats date correctly", () => {
		render(<BlogPostPagePanda post={mockPost} />);

		// The date should be formatted as "September 26, 2025" (timezone difference)
		expect(screen.getByText("September 26, 2025")).toBeInTheDocument();
	});

	it("calculates reading time correctly", () => {
		render(<BlogPostPagePanda post={mockPost} />);

		// The excerpt is about 20 words, so reading time should be 1 min
		expect(screen.getByText("1 min read")).toBeInTheDocument();
	});

	it("handles missing date gracefully", () => {
		const postWithoutDate = {
			...mockPost,
			date: "",
		};

		render(<BlogPostPagePanda post={postWithoutDate} />);

		expect(
			screen.getByText("How Engineers Can Use AI Effectively")
		).toBeInTheDocument();
		// Should not crash when date is empty
	});

	it("handles missing excerpt gracefully", () => {
		const postWithoutExcerpt = {
			...mockPost,
			excerpt: "",
		};

		render(<BlogPostPagePanda post={postWithoutExcerpt} />);

		expect(
			screen.getByText("How Engineers Can Use AI Effectively")
		).toBeInTheDocument();
		// Should not crash when excerpt is empty
	});
});
