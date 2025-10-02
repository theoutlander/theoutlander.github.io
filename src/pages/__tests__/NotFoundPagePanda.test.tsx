import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../test/test-utils";
import { NotFoundPagePanda } from "../NotFoundPagePanda";

// Mock the NotFound component
vi.mock("../../components/NotFound", () => ({
	default: () => <div data-testid="not-found">404 Not Found</div>,
}));

describe("NotFoundPagePanda", () => {
	it("renders NotFound component", () => {
		render(<NotFoundPagePanda />);

		expect(screen.getByTestId("not-found")).toBeInTheDocument();
		expect(screen.getByText("404 Not Found")).toBeInTheDocument();
	});

	it("renders only the NotFound component", () => {
		render(<NotFoundPagePanda />);

		// Should only render the NotFound component, nothing else
		expect(screen.getByTestId("not-found")).toBeInTheDocument();
		expect(screen.queryByTestId("header")).not.toBeInTheDocument();
		expect(screen.queryByTestId("footer")).not.toBeInTheDocument();
		expect(screen.queryByTestId("skip-link")).not.toBeInTheDocument();
	});
});
