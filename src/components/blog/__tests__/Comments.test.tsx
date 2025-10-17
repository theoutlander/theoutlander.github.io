import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "../../../test/test-utils";
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

	it("renders Utterances comments by default", () => {
		render(<Comments {...defaultProps} />);

		expect(screen.getByTestId("utterances-comments")).toBeInTheDocument();
		expect(
			screen.getByText(
				`Utterances Comments for ${defaultProps.postTitle} at ${defaultProps.postUrl}`
			)
		).toBeInTheDocument();
	});
});
