import type { CodementorReview } from "../types/codementor";

export const CODEMENTOR_REVIEWS_INLINE_ID = "__CODEMENTOR_REVIEWS__";

let cachedReviews: CodementorReview[] | null = null;

function readInlineJson<T>(id: string): T | null {
	if (typeof document === "undefined") return null;

	const el = document.getElementById(id);
	if (!el?.textContent) return null;

	try {
		return JSON.parse(el.textContent) as T;
	} catch (error) {
		console.error(`Failed to parse inline data from ${id}:`, error);
		return null;
	}
}

function getInlineReviews(): CodementorReview[] | null {
	if (cachedReviews) return cachedReviews;
	const inline = readInlineJson<CodementorReview[]>(CODEMENTOR_REVIEWS_INLINE_ID);
	if (!inline) return null;
	cachedReviews = inline;
	return cachedReviews;
}

export async function loadCodementorReviews(): Promise<CodementorReview[]> {
	try {
		const inline = getInlineReviews();
		if (inline) return inline;

		const response = await fetch("/data/codementor-reviews.json");
		if (!response.ok) {
			throw new Error("Failed to fetch Codementor reviews");
		}
		const reviews = (await response.json()) as CodementorReview[];
		cachedReviews = reviews;
		return reviews;
	} catch (error) {
		console.error("Failed to load Codementor reviews:", error);
		return [];
	}
}

export function clearCodementorReviewsCache() {
	cachedReviews = null;
}
