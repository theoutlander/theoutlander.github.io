import { CodementorReview } from "../types/codementor";

// Client-side function to load reviews from JSON
export async function loadCodementorReviews(): Promise<CodementorReview[]> {
	try {
		const response = await fetch("/data/codementor-reviews.json");
		if (!response.ok) {
			throw new Error("Failed to fetch Codementor reviews");
		}
		const reviews = (await response.json()) as CodementorReview[];
		return reviews;
	} catch (error) {
		console.error("Failed to load Codementor reviews:", error);
		return [];
	}
}
