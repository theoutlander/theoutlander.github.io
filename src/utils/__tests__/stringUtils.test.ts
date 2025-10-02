import { describe, it, expect } from "vitest";
import { capitalizeFirstLetter, capitalizeTags } from "../stringUtils";

describe("stringUtils", () => {
	describe("capitalizeFirstLetter", () => {
		it("should capitalize the first letter of a string", () => {
			expect(capitalizeFirstLetter("hello")).toBe("Hello");
			expect(capitalizeFirstLetter("world")).toBe("World");
			expect(capitalizeFirstLetter("react")).toBe("React");
		});

		it("should handle already capitalized strings", () => {
			expect(capitalizeFirstLetter("Hello")).toBe("Hello");
			expect(capitalizeFirstLetter("WORLD")).toBe("World");
		});

		it("should handle mixed case strings", () => {
			expect(capitalizeFirstLetter("hELLo")).toBe("Hello");
			expect(capitalizeFirstLetter("WoRLd")).toBe("World");
		});

		it("should handle empty string", () => {
			expect(capitalizeFirstLetter("")).toBe("");
		});

		it("should handle single character strings", () => {
			expect(capitalizeFirstLetter("a")).toBe("A");
			expect(capitalizeFirstLetter("A")).toBe("A");
		});

		it("should handle strings with numbers", () => {
			expect(capitalizeFirstLetter("123")).toBe("123");
			expect(capitalizeFirstLetter("a1b2c")).toBe("A1b2c");
		});

		it("should handle strings with special characters", () => {
			expect(capitalizeFirstLetter("@hello")).toBe("@hello");
			expect(capitalizeFirstLetter("hello-world")).toBe("Hello-world");
			expect(capitalizeFirstLetter("hello_world")).toBe("Hello_world");
		});

		it("should handle whitespace", () => {
			expect(capitalizeFirstLetter(" hello")).toBe(" Hello");
			// The function only splits on spaces, not tabs, so tabs are treated as part of the word
			expect(capitalizeFirstLetter("\thello")).toBe("\thello");
		});

		it("should handle null and undefined gracefully", () => {
			// @ts-expect-error - testing runtime behavior
			expect(capitalizeFirstLetter(null)).toBe(null);
			// @ts-expect-error - testing runtime behavior
			expect(capitalizeFirstLetter(undefined)).toBe(undefined);
		});
	});

	describe("capitalizeTags", () => {
		it("should capitalize first letter of each tag", () => {
			const tags = ["react", "typescript", "javascript"];
			const expected = ["React", "Typescript", "Javascript"];
			expect(capitalizeTags(tags)).toEqual(expected);
		});

		it("should handle empty array", () => {
			expect(capitalizeTags([])).toEqual([]);
		});

		it("should handle single tag", () => {
			expect(capitalizeTags(["react"])).toEqual(["React"]);
		});

		it("should handle already capitalized tags", () => {
			const tags = ["React", "TypeScript", "JavaScript"];
			expect(capitalizeTags(tags)).toEqual([
				"React",
				"Typescript",
				"Javascript",
			]);
		});

		it("should handle mixed case tags", () => {
			const tags = ["react", "TypeScript", "JAVASCRIPT"];
			const expected = ["React", "Typescript", "Javascript"];
			expect(capitalizeTags(tags)).toEqual(expected);
		});

		it("should handle tags with special characters", () => {
			const tags = ["react-js", "node.js", "c++"];
			const expected = ["React-js", "Node.js", "C++"];
			expect(capitalizeTags(tags)).toEqual(expected);
		});

		it("should handle empty strings in array", () => {
			const tags = ["react", "", "typescript"];
			const expected = ["React", "", "Typescript"];
			expect(capitalizeTags(tags)).toEqual(expected);
		});

		it("should handle duplicate tags", () => {
			const tags = ["react", "react", "typescript"];
			const expected = ["React", "React", "Typescript"];
			expect(capitalizeTags(tags)).toEqual(expected);
		});
	});
});
