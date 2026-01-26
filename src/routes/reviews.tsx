import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPagePanda } from "../pages/ReviewsPagePanda";
import { loadCodementorReviews, type CodementorReview } from "../lib/codementor";

export const Route = createFileRoute("/reviews")({
	component: ReviewsPage,
	loader: async (): Promise<{ reviews: CodementorReview[] }> => {
		try {
			const reviews = await loadCodementorReviews();
			return { reviews };
		} catch (error) {
			console.error("Failed to load Codementor reviews:", error);
			return { reviews: [] };
		}
	},
});

function ReviewsPage() {
	const { reviews } = Route.useLoaderData();
	return <ReviewsPagePanda reviews={reviews} />;
}
