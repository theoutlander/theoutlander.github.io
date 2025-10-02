import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test/test-utils";
import SimpleComments from "../SimpleComments";

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

// Mock localStorage
const localStorageMock = {
	getItem: vi.fn(),
	setItem: vi.fn(),
	removeItem: vi.fn(),
	clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
	value: localStorageMock,
});

describe("SimpleComments", () => {
	const defaultProps = {
		postSlug: "test-post",
	};

	beforeEach(() => {
		vi.clearAllMocks();
		localStorageMock.getItem.mockReturnValue(null);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("renders comments section with title", () => {
		render(<SimpleComments {...defaultProps} />);

		expect(screen.getByText("Comments")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Share your thoughts and join the discussion! Leave a comment below."
			)
		).toBeInTheDocument();
	});

	it("renders comment count badge", () => {
		render(<SimpleComments {...defaultProps} />);

		expect(screen.getByText("0 Comments")).toBeInTheDocument();
	});

	it("renders add comment button", () => {
		render(<SimpleComments {...defaultProps} />);

		expect(screen.getByText("Add a Comment")).toBeInTheDocument();
	});

	it("shows comment form when add comment button is clicked", () => {
		render(<SimpleComments {...defaultProps} />);

		const addButton = screen.getByText("Add a Comment");
		fireEvent.click(addButton);

		expect(screen.getByLabelText("Name *")).toBeInTheDocument();
		expect(screen.getByLabelText("Comment *")).toBeInTheDocument();
		expect(screen.getByText("Post Comment")).toBeInTheDocument();
		expect(screen.getByText("Cancel")).toBeInTheDocument();
	});

	it("hides comment form when cancel button is clicked", () => {
		render(<SimpleComments {...defaultProps} />);

		// Show form
		const addButton = screen.getByText("Add a Comment");
		fireEvent.click(addButton);

		// Hide form
		const cancelButton = screen.getByText("Cancel");
		fireEvent.click(cancelButton);

		expect(screen.queryByLabelText("Name *")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Comment *")).not.toBeInTheDocument();
		expect(screen.getByText("Add a Comment")).toBeInTheDocument();
	});

	it("shows error when submitting empty form", () => {
		render(<SimpleComments {...defaultProps} />);

		// Show form
		const addButton = screen.getByText("Add a Comment");
		fireEvent.click(addButton);

		// Submit empty form
		const submitButton = screen.getByText("Post Comment");
		fireEvent.click(submitButton);

		expect(screen.getByText("Please fill in all fields")).toBeInTheDocument();
	});

	it("shows error when submitting form with empty name", () => {
		render(<SimpleComments {...defaultProps} />);

		// Show form
		const addButton = screen.getByText("Add a Comment");
		fireEvent.click(addButton);

		// Fill only comment
		const commentInput = screen.getByLabelText("Comment *");
		fireEvent.change(commentInput, { target: { value: "Test comment" } });

		// Submit form
		const submitButton = screen.getByText("Post Comment");
		fireEvent.click(submitButton);

		expect(screen.getByText("Please fill in all fields")).toBeInTheDocument();
	});

	it("shows error when submitting form with empty comment", () => {
		render(<SimpleComments {...defaultProps} />);

		// Show form
		const addButton = screen.getByText("Add a Comment");
		fireEvent.click(addButton);

		// Fill only name
		const nameInput = screen.getByLabelText("Name *");
		fireEvent.change(nameInput, { target: { value: "Test User" } });

		// Submit form
		const submitButton = screen.getByText("Post Comment");
		fireEvent.click(submitButton);

		expect(screen.getByText("Please fill in all fields")).toBeInTheDocument();
	});

	it("submits comment successfully", async () => {
		render(<SimpleComments {...defaultProps} />);

		// Show form
		const addButton = screen.getByText("Add a Comment");
		fireEvent.click(addButton);

		// Fill form
		const nameInput = screen.getByLabelText("Name *");
		const commentInput = screen.getByLabelText("Comment *");

		fireEvent.change(nameInput, { target: { value: "Test User" } });
		fireEvent.change(commentInput, {
			target: { value: "Test comment content" },
		});

		// Submit form
		const submitButton = screen.getByText("Post Comment");
		fireEvent.click(submitButton);

		// Wait for comment to appear
		await waitFor(() => {
			expect(screen.getByText("Test User")).toBeInTheDocument();
			expect(screen.getByText("Test comment content")).toBeInTheDocument();
		});

		// Form should be hidden
		expect(screen.queryByLabelText("Name *")).not.toBeInTheDocument();
		expect(screen.getByText("Add a Comment")).toBeInTheDocument();
	});

	it("updates comment count after adding comment", async () => {
		render(<SimpleComments {...defaultProps} />);

		// Show form
		const addButton = screen.getByText("Add a Comment");
		fireEvent.click(addButton);

		// Fill and submit form
		const nameInput = screen.getByLabelText("Name *");
		const commentInput = screen.getByLabelText("Comment *");

		fireEvent.change(nameInput, { target: { value: "Test User" } });
		fireEvent.change(commentInput, { target: { value: "Test comment" } });

		const submitButton = screen.getByText("Post Comment");
		fireEvent.click(submitButton);

		// Wait for comment count to update
		await waitFor(() => {
			expect(screen.getByText("1 Comment")).toBeInTheDocument();
		});
	});

	it("loads comments from localStorage on mount", () => {
		const savedComments = [
			{
				id: "1",
				name: "Saved User",
				content: "Saved comment",
				date: "2024-01-15T10:00:00.000Z",
			},
		];

		localStorageMock.getItem.mockReturnValue(JSON.stringify(savedComments));

		render(<SimpleComments {...defaultProps} />);

		expect(screen.getByText("Saved User")).toBeInTheDocument();
		expect(screen.getByText("Saved comment")).toBeInTheDocument();
		expect(screen.getByText("1 Comment")).toBeInTheDocument();
	});

	it("saves comments to localStorage", async () => {
		render(<SimpleComments {...defaultProps} />);

		// Show form and add comment
		const addButton = screen.getByText("Add a Comment");
		fireEvent.click(addButton);

		const nameInput = screen.getByLabelText("Name *");
		const commentInput = screen.getByLabelText("Comment *");

		fireEvent.change(nameInput, { target: { value: "Test User" } });
		fireEvent.change(commentInput, { target: { value: "Test comment" } });

		const submitButton = screen.getByText("Post Comment");
		fireEvent.click(submitButton);

		// Wait for localStorage to be called
		await waitFor(() => {
			expect(localStorageMock.setItem).toHaveBeenCalledWith(
				"simple-comments-test-post",
				expect.stringContaining("Test User")
			);
		});
	});

	it("shows empty state when no comments", () => {
		render(<SimpleComments {...defaultProps} />);

		expect(
			screen.getByText("No comments yet. Be the first to comment!")
		).toBeInTheDocument();
	});

	it("formats date correctly", async () => {
		// Mock Date.now to return a specific timestamp
		const mockDate = new Date("2024-01-15T10:30:00.000Z");
		vi.spyOn(Date, "now").mockReturnValue(mockDate.getTime());

		render(<SimpleComments {...defaultProps} />);

		// Add a comment
		const addButton = screen.getByText("Add a Comment");
		fireEvent.click(addButton);

		const nameInput = screen.getByLabelText("Name *");
		const commentInput = screen.getByLabelText("Comment *");

		fireEvent.change(nameInput, { target: { value: "Test User" } });
		fireEvent.change(commentInput, { target: { value: "Test comment" } });

		const submitButton = screen.getByText("Post Comment");
		fireEvent.click(submitButton);

		// Check if date is formatted correctly
		await waitFor(() => {
			expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
		});

		vi.restoreAllMocks();
	});

	it("uses default postSlug when not provided", () => {
		render(<SimpleComments />);

		// Add a comment to trigger localStorage save
		const addButton = screen.getByText("Add a Comment");
		fireEvent.click(addButton);

		const nameInput = screen.getByLabelText("Name *");
		const commentInput = screen.getByLabelText("Comment *");

		fireEvent.change(nameInput, { target: { value: "Test User" } });
		fireEvent.change(commentInput, { target: { value: "Test comment" } });

		const submitButton = screen.getByText("Post Comment");
		fireEvent.click(submitButton);

		// Check that localStorage was called with default slug
		expect(localStorageMock.setItem).toHaveBeenCalledWith(
			"simple-comments-default",
			expect.any(String)
		);
	});

	it("handles localStorage parse error gracefully", () => {
		localStorageMock.getItem.mockReturnValue("invalid json");

		// Mock console.error to avoid noise in test output
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		render(<SimpleComments {...defaultProps} />);

		// Should still render without crashing
		expect(screen.getByText("Comments")).toBeInTheDocument();

		consoleSpy.mockRestore();
	});
});
