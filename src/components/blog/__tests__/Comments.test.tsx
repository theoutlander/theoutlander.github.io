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

// Mock react-icons
vi.mock("react-icons/fa", () => ({
	FaComment: ({ size, color }: { size: number; color: string }) => (
		<svg
			data-testid="comment-icon"
			width={size}
			height={size}
			fill={color}
			viewBox="0 0 512 512"
		>
			<path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z" />
		</svg>
	),
	FaHeart: () => <div data-testid="heart-icon">Heart</div>,
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

	it("renders Giscus comments section", () => {
		render(<Comments {...defaultProps} />);

		// Check that the Comments heading is rendered
		expect(screen.getByText("Comments")).toBeInTheDocument();
		
		// Check that the comment icon is rendered
		expect(screen.getByTestId("comment-icon")).toBeInTheDocument();
		
		// Check that the comments container div exists (where Giscus script will be injected)
		const commentsContainer = document.querySelector(
			'div[class*="borderRadius"]'
		);
		expect(commentsContainer).toBeInTheDocument();
	});
});
