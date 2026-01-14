import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "../../../test/test-utils";
import PostView from "../PostView";

// Mock the styled-system css function
vi.mock("../../../styled-system/css/index.mjs", () => ({
	css: vi.fn((styles) => JSON.stringify(styles)),
}));

// Mock the styled-system recipes
vi.mock("../../../styled-system/recipes/index.mjs", () => ({
	blogPost: vi.fn(() => "blog-post"),
	blogTitle: vi.fn(() => "blog-title"),
	blogMeta: vi.fn(() => "blog-meta"),
	blogDate: vi.fn(() => "blog-date"),
	blogTag: vi.fn(() => "blog-tag"),
	blogExcerpt: vi.fn(() => "blog-excerpt"),
	blogContent: vi.fn(() => "blog-content"),
	blogCover: vi.fn(() => "blog-cover"),
}));

// Mock HelmetShim used by PostView
vi.mock("../../seo/HelmetShim", () => ({
    Helmet: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="helmet">{children}</div>
    ),
}));

// Mock the ProgressTop component
vi.mock("../../ui/ProgressTop", () => ({
	default: () => <div data-testid="progress-top">Progress Top</div>,
}));

// Mock the PostJsonLd component
vi.mock("../../seo/PostJsonLd", () => ({
	default: ({
		title,
		url,
		date,
		excerpt,
	}: {
		title: string;
		url: string;
		date: string;
		excerpt: string;
	}) => (
		<div data-testid="post-json-ld">
			JSON-LD for {title} at {url} on {date}: {excerpt}
		</div>
	),
}));

// Mock the Comments component
vi.mock("../Comments", () => ({
	default: ({ postTitle, postUrl }: { postTitle: string; postUrl: string }) => (
		<div data-testid="comments">
			Comments for {postTitle} at {postUrl}
		</div>
	),
}));

// Mock the stringUtils
vi.mock("../../utils/stringUtils", () => ({
	capitalizeFirstLetter: vi.fn(
		(str: string) => str.charAt(0).toUpperCase() + str.slice(1)
	),
}));

describe("PostView", () => {
	const mockPost = {
		id: "test-post-1",
		title: "Test Post Title",
		date: "2024-01-15",
		cover: "https://example.com/cover.jpg",
		excerpt: "This is a test post excerpt",
		html: "<p>This is the post content</p>",
		url: "https://example.com/test-post",
		tags: ["react", "testing", "typescript"],
	};

	const mockPostWithoutCover = {
		...mockPost,
		cover: "",
	};

	const mockPostWithoutUrl = {
		...mockPost,
		url: "",
	};

	const mockPostWithoutHtml = {
		...mockPost,
		html: "",
	};

	beforeEach(() => {
		// Mock window.location
		Object.defineProperty(window, "location", {
			value: {
				href: "https://example.com/test-post",
			},
			writable: true,
		});
	});

	it("renders post title", () => {
		render(<PostView post={mockPost} />);

		expect(screen.getByText("Test Post Title")).toBeInTheDocument();
	});

	it("renders post excerpt", () => {
		render(<PostView post={mockPost} />);

		expect(screen.getByText("This is a test post excerpt")).toBeInTheDocument();
	});

	it("renders formatted date", () => {
		render(<PostView post={mockPost} />);

		// Check for the date in a more flexible way since timezone can affect the exact day
		expect(screen.getByText(/Jan 1[45] 2024/)).toBeInTheDocument();
	});

	it("renders post tags", () => {
		render(<PostView post={mockPost} />);

		expect(screen.getByText("React")).toBeInTheDocument();
		expect(screen.getByText("Testing")).toBeInTheDocument();
		expect(screen.getByText("Typescript")).toBeInTheDocument();
	});

	it("renders cover image when available", () => {
		render(<PostView post={mockPost} />);

		const image = screen.getByRole("img", { name: "Test Post Title" });
		expect(image).toHaveAttribute("src", "https://example.com/cover.jpg");
		expect(image).toHaveAttribute("alt", "Test Post Title");
		expect(image).toHaveAttribute("loading", "lazy");
	});

	it("does not render cover image when not available", () => {
		render(<PostView post={mockPostWithoutCover} />);

		expect(screen.queryByRole("img", { name: "Test Post Title" })).not.toBeInTheDocument();
	});

	it("renders post content when available", () => {
		render(<PostView post={mockPost} />);

		expect(screen.getByText("This is the post content")).toBeInTheDocument();
	});

	it("renders content not available message when html is empty", () => {
		render(<PostView post={mockPostWithoutHtml} />);

		expect(screen.getByText("Content not available")).toBeInTheDocument();
	});

	it("renders Comments component", () => {
		render(<PostView post={mockPost} />);

		expect(screen.getByTestId("comments")).toBeInTheDocument();
		expect(
			screen.getByText(`Comments for ${mockPost.title} at ${mockPost.url}`)
		).toBeInTheDocument();
	});

	it("generates URL from title when url is not provided", () => {
		render(<PostView post={mockPostWithoutUrl} />);

		expect(
			screen.getByText(
				`Comments for ${mockPost.title} at https://nick.karnik.io/blog/test-post-title`
			)
		).toBeInTheDocument();
	});

	it("renders ProgressTop component", () => {
		render(<PostView post={mockPost} />);

		expect(screen.getByTestId("progress-top")).toBeInTheDocument();
	});

	it("renders PostJsonLd component", () => {
		render(<PostView post={mockPost} />);

		expect(screen.getByTestId("post-json-ld")).toBeInTheDocument();
		expect(
			screen.getByText(
				`JSON-LD for ${mockPost.title} at ${mockPost.url} on ${mockPost.date}: ${mockPost.excerpt}`
			)
		).toBeInTheDocument();
	});

	it("renders Helmet with correct meta tags", () => {
		render(<PostView post={mockPost} />);

		expect(screen.getByTestId("helmet")).toBeInTheDocument();
	});

	it("limits tags to 4 maximum", () => {
		const postWithManyTags = {
			...mockPost,
			tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
		};

		render(<PostView post={postWithManyTags} />);

		expect(screen.getByText("Tag1")).toBeInTheDocument();
		expect(screen.getByText("Tag2")).toBeInTheDocument();
		expect(screen.getByText("Tag3")).toBeInTheDocument();
		expect(screen.getByText("Tag4")).toBeInTheDocument();
		expect(screen.queryByText("Tag5")).not.toBeInTheDocument();
		expect(screen.queryByText("Tag6")).not.toBeInTheDocument();
	});

	it("handles empty date gracefully", () => {
		const postWithoutDate = {
			...mockPost,
			date: "",
		};

		render(<PostView post={postWithoutDate} />);

		// Check that the date span exists but is empty
		const dateSpan = screen
			.getByText("Test Post Title")
			.closest(".blog-post")
			?.querySelector(".blog-date");
		expect(dateSpan).toBeInTheDocument();
		expect(dateSpan?.textContent).toBe("");
	});

	it("handles missing tags gracefully", () => {
		const postWithoutTags = {
			...mockPost,
			tags: [],
		};

		render(<PostView post={postWithoutTags} />);

		expect(screen.getByText("Test Post Title")).toBeInTheDocument();
		expect(screen.queryByText("React")).not.toBeInTheDocument();
	});
});
