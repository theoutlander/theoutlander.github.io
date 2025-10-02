import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import SkipLink from "../SkipLink";

// Mock the styled-system css function
vi.mock("../../styled-system/css/index.mjs", () => ({
	css: vi.fn((styles) => JSON.stringify(styles)),
}));

describe("SkipLink", () => {
	it("renders skip link with correct href", () => {
		render(<SkipLink />);

		const skipLink = screen.getByRole("link");
		expect(skipLink).toBeInTheDocument();
		expect(skipLink).toHaveAttribute("href", "#main-content");
	});

	it("renders skip link with correct text", () => {
		render(<SkipLink />);

		expect(screen.getByText("Skip to main content")).toBeInTheDocument();
	});

	it("has correct accessibility attributes", () => {
		render(<SkipLink />);

		const skipLink = screen.getByRole("link");
		expect(skipLink).toHaveAttribute("href", "#main-content");
		expect(skipLink).toHaveTextContent("Skip to main content");
	});

	it("is focusable", () => {
		render(<SkipLink />);

		const skipLink = screen.getByRole("link");
		expect(skipLink).toBeInTheDocument();
		// The link should be focusable by default
		expect(skipLink.tagName).toBe("A");
	});
});
