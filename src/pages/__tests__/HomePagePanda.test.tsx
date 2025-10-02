import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import { HomePagePanda } from "../HomePagePanda";

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

vi.mock("../../components/HeroSSR", () => ({
	default: () => <section data-testid="hero">Hero Section</section>,
}));

vi.mock("../../components/CoreCompetencies", () => ({
	default: () => (
		<section data-testid="core-competencies">Core Competencies</section>
	),
}));

vi.mock("../../components/StatsStrip", () => ({
	default: () => <section data-testid="stats-strip">Stats Strip</section>,
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

describe("HomePagePanda", () => {
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
		render(<HomePagePanda posts={mockPosts} />);

		expect(screen.getByTestId("skip-link")).toBeInTheDocument();
		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("hero")).toBeInTheDocument();
		expect(screen.getByTestId("core-competencies")).toBeInTheDocument();
		expect(screen.getByTestId("stats-strip")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});

	it("sets correct current page for header", () => {
		render(<HomePagePanda posts={mockPosts} />);

		const header = screen.getByTestId("header");
		expect(header).toHaveAttribute("data-current-page", "home");
	});

	it("renders main content with correct id", () => {
		render(<HomePagePanda posts={mockPosts} />);

		const main = screen.getByRole("main");
		expect(main).toHaveAttribute("id", "main-content");
	});

	it("handles empty posts array", () => {
		render(<HomePagePanda posts={[]} />);

		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("hero")).toBeInTheDocument();
		expect(screen.getByTestId("core-competencies")).toBeInTheDocument();
		expect(screen.getByTestId("stats-strip")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});

	it("handles undefined posts", () => {
		// @ts-expect-error - testing runtime behavior
		render(<HomePagePanda posts={undefined} />);

		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("hero")).toBeInTheDocument();
		expect(screen.getByTestId("core-competencies")).toBeInTheDocument();
		expect(screen.getByTestId("stats-strip")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});
});
