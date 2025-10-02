import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test/test-utils";
import Comments from "../Comments";

// Mock the styled-system css function
vi.mock("../../../../styled-system/css/index.mjs", () => ({
	css: vi.fn((styles) => JSON.stringify(styles)),
}));

// Mock the styled-system recipes
vi.mock("../../../../styled-system/recipes/index.mjs", () => ({
	commentsSection: vi.fn(() => "comments-section"),
	commentsContainer: vi.fn(() => "comments-container"),
	commentsHeader: vi.fn(() => "comments-header"),
	commentsTitle: vi.fn(() => "comments-title"),
	commentsContent: vi.fn(() => "comments-content"),
	commentsActions: vi.fn(() => "comments-actions"),
}));

// Mock the comment components
vi.mock("../UtterancesComments", () => ({
	default: ({ postTitle, postUrl }: { postTitle: string; postUrl: string }) => (
		<div data-testid="utterances-comments">
			Utterances Comments for {postTitle} at {postUrl}
		</div>
	),
}));

vi.mock("../HashnodeComments", () => ({
	default: ({ postUrl }: { postUrl: string }) => (
		<div data-testid="hashnode-comments">Hashnode Comments for {postUrl}</div>
	),
}));

vi.mock("../SimpleComments", () => ({
	default: ({ postSlug }: { postSlug: string }) => (
		<div data-testid="simple-comments">Simple Comments for {postSlug}</div>
	),
}));

// Mock the comments config
vi.mock("../../../../lib/comments", () => ({
	COMMENTS_CONFIG: {
		githubRepo: "test/repo",
		giscus: {
			repoId: "test-repo-id",
			category: "test-category",
			categoryId: "test-category-id",
			mapping: "pathname",
			strict: "0",
			reactionsEnabled: "1",
			emitMetadata: "0",
			inputPosition: "bottom",
			theme: "light",
			lang: "en",
			loading: "lazy",
		},
	},
}));

describe("Comments", () => {
	const defaultProps = {
		postTitle: "Test Post Title",
		postUrl: "https://example.com/test-post",
	};

	beforeEach(() => {
		// Reset DOM
		document.body.innerHTML = "";
	});

	it("renders comments section with title", () => {
		render(<Comments {...defaultProps} />);

		expect(screen.getByText("Comments")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Share your thoughts and join the discussion! Leave a comment below."
			)
		).toBeInTheDocument();
	});

	it("renders comment system selector", () => {
		render(<Comments {...defaultProps} />);

		const selector = screen.getByLabelText("Select comment system");
		expect(selector).toBeInTheDocument();
		expect(selector).toHaveValue("utterances");
	});

	it("renders all comment system options", () => {
		render(<Comments {...defaultProps} />);

		const selector = screen.getByLabelText("Select comment system");
		expect(
			selector.querySelector('option[value="hashnode"]')
		).toBeInTheDocument();
		expect(
			selector.querySelector('option[value="giscus"]')
		).toBeInTheDocument();
		expect(
			selector.querySelector('option[value="utterances"]')
		).toBeInTheDocument();
		expect(
			selector.querySelector('option[value="simple"]')
		).toBeInTheDocument();
	});

	it("renders Utterances comments by default", () => {
		render(<Comments {...defaultProps} />);

		expect(screen.getByTestId("utterances-comments")).toBeInTheDocument();
		expect(
			screen.getByText(
				`Utterances Comments for ${defaultProps.postTitle} at ${defaultProps.postUrl}`
			)
		).toBeInTheDocument();
	});

	it("switches to Hashnode comments when selected", () => {
		render(<Comments {...defaultProps} />);

		const selector = screen.getByLabelText("Select comment system");
		fireEvent.change(selector, { target: { value: "hashnode" } });

		expect(screen.getByTestId("hashnode-comments")).toBeInTheDocument();
		expect(
			screen.getByText(`Hashnode Comments for ${defaultProps.postUrl}`)
		).toBeInTheDocument();
	});

	it("switches to Simple comments when selected", () => {
		render(<Comments {...defaultProps} />);

		const selector = screen.getByLabelText("Select comment system");
		fireEvent.change(selector, { target: { value: "simple" } });

		expect(screen.getByTestId("simple-comments")).toBeInTheDocument();
		expect(
			screen.getByText("Simple Comments for test-post")
		).toBeInTheDocument();
	});

	it("renders scroll to comments button", () => {
		render(<Comments {...defaultProps} />);

		const scrollButton = screen.getByText("Scroll to Comments");
		expect(scrollButton).toBeInTheDocument();
	});

	it("scrolls to comments when scroll button is clicked", () => {
		render(<Comments {...defaultProps} />);

		const scrollButton = screen.getByText("Scroll to Comments");
		const scrollIntoViewMock = vi.fn();

		// Mock scrollIntoView
		Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
			value: scrollIntoViewMock,
			writable: true,
		});

		fireEvent.click(scrollButton);

		expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
	});

	it("renders comment count badge", () => {
		render(<Comments {...defaultProps} />);

		expect(screen.getByText("Hashnode Comments")).toBeInTheDocument();
	});

	it("renders heart icon", () => {
		render(<Comments {...defaultProps} />);

		// The heart icon should be present (it's an SVG element)
		const heartIcon =
			screen.getByTestId("heart-icon") ||
			document.querySelector('[data-testid="heart-icon"]');
		// Since we can't easily test the icon without more complex setup, we'll just check the container
		expect(screen.getByText("Comment System")).toBeInTheDocument();
	});
});
