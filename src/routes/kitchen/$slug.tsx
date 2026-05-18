import { createFileRoute, notFound } from "@tanstack/react-router";
import { getRecipeBySlug } from "../../data/recipes";
import { RecipePagePanda } from "../../pages/RecipePagePanda";

export const Route = createFileRoute("/kitchen/$slug")({
	component: RecipePage,
});

function RecipePage() {
	const { slug } = Route.useParams();
	const recipe = getRecipeBySlug(slug);
	if (!recipe) throw notFound();
	return <RecipePagePanda recipe={recipe} />;
}
