import recipesData from "./recipes.json";

export type Recipe = (typeof recipesData)[number];

export const RECIPES = recipesData as Recipe[];

export function getRecipeBySlug(slug: string): Recipe | undefined {
	return RECIPES.find((r) => r.slug === slug);
}
