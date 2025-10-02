import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import { ResumePagePanda } from "../ResumePagePanda";

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

vi.mock("../../components/Resume", () => ({
	default: () => <div data-testid="resume">Resume Content</div>,
}));

vi.mock("../../components/ResumePrintStyles", () => ({
	default: () => <style data-testid="print-styles">/* Print styles */</style>,
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

describe("ResumePagePanda", () => {
	it("renders all main sections", () => {
		render(<ResumePagePanda />);

		expect(screen.getByTestId("print-styles")).toBeInTheDocument();
		expect(screen.getByTestId("skip-link")).toBeInTheDocument();
		expect(screen.getByTestId("header")).toBeInTheDocument();
		expect(screen.getByTestId("resume")).toBeInTheDocument();
		expect(screen.getByTestId("footer")).toBeInTheDocument();
	});

	it("sets correct current page for header", () => {
		render(<ResumePagePanda />);

		const header = screen.getByTestId("header");
		expect(header).toHaveAttribute("data-current-page", "resume");
	});

	it("renders main content with correct id", () => {
		render(<ResumePagePanda />);

		const main = screen.getByRole("main");
		expect(main).toHaveAttribute("id", "main-content");
	});

	it("renders Resume component", () => {
		render(<ResumePagePanda />);

		expect(screen.getByTestId("resume")).toBeInTheDocument();
		expect(screen.getByText("Resume Content")).toBeInTheDocument();
	});

	it("renders ResumePrintStyles component", () => {
		render(<ResumePagePanda />);

		expect(screen.getByTestId("print-styles")).toBeInTheDocument();
		// Style elements don't have visible text content
		const styleElement = screen.getByTestId("print-styles");
		expect(styleElement.tagName).toBe("STYLE");
	});
});
