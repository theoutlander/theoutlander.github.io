import { describe, it, expect } from "vitest";
import { render, screen } from "../../test/test-utils";
import { ResumePagePanda } from "../ResumePagePanda";
import { COPY } from "../../data/site-copy";
import { META, PERSON } from "../../data/person";
import { ROLES, SUMMARY } from "../../data/resume";

describe("ResumePagePanda", () => {
	it("renders page title and person name", () => {
		render(<ResumePagePanda />);

		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(PERSON.name);
		expect(document.title).toBe(META.resume.title);
	});

	it("renders summary and experience sections", () => {
		render(<ResumePagePanda />);

		expect(screen.getByText(COPY.resume.sections.summary)).toBeInTheDocument();
		expect(screen.getByText(COPY.resume.sections.experience)).toBeInTheDocument();
		expect(screen.getByText(SUMMARY, { exact: false })).toBeInTheDocument();
	});

	it("renders roles from resume data", () => {
		render(<ResumePagePanda />);

		expect(screen.getByText(ROLES[0].co)).toBeInTheDocument();
		expect(screen.getAllByText(ROLES[0].role).length).toBeGreaterThan(0);
	});

	it("renders PDF download link", () => {
		render(<ResumePagePanda />);

		expect(screen.getByRole("link", { name: COPY.resume.pdfLink })).toHaveAttribute(
			"href",
			COPY.resume.pdfHref
		);
	});

	it("renders education, patents, and skills sections", () => {
		render(<ResumePagePanda />);

		expect(screen.getByText(COPY.resume.sections.education)).toBeInTheDocument();
		expect(screen.getByText(COPY.resume.sections.patents)).toBeInTheDocument();
		expect(screen.getByText(COPY.resume.sections.skills)).toBeInTheDocument();
	});
});
