import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import type { Recipe } from "../data/recipes";
import { COPY } from "../data/site-copy";
import { META, PERSON } from "../data/person";

type RecipePageProps = {
	recipe: Recipe;
};

function getIngredients(recipe: Recipe): [string, string][] {
	if (recipe.category === "Cocktails") {
		return [
			["2 oz", "Rittenhouse rye"],
			["¼ oz", "demerara syrup (2:1)"],
			["2 dashes", "Angostura bitters"],
			["1 dash", "orange bitters"],
			["1", "large rock"],
			["1", "orange peel, expressed"],
		];
	}
	return [
		["1.2 kg", "bone-in short ribs"],
		["1", "yellow onion, diced"],
		["3", "garlic cloves, smashed"],
		["1 Tbsp", "tomato paste"],
		["20 g", "dark cocoa (Valrhona)"],
		["200 ml", "strong brewed coffee"],
		["500 ml", "dry red wine"],
		["500 ml", "beef stock"],
		["—", "kosher salt · pepper · bay"],
	];
}

function getMethod(recipe: Recipe): string[] {
	if (recipe.category === "Cocktails") {
		return [
			"Combine rye, demerara, both bitters in a mixing glass with cracked ice.",
			"Stir 25 – 30 turns, until the glass beads and the liquid is silky.",
			"Strain over a large rock in a chilled rocks glass.",
			"Express orange peel over the surface; drape over the rim.",
			"Drink slowly. The whole point is to watch it open up.",
		];
	}
	return [
		"Salt the short ribs generously the night before. Refrigerate uncovered.",
		"Sear in a heavy Dutch oven over medium-high. All sides; don't rush.",
		"Reduce heat. Soften onion and garlic in the rendered fat. Add tomato paste; cook until brick-red.",
		"Add cocoa, then deglaze with coffee and wine; reduce by a third.",
		"Return ribs; add stock to barely cover. Lid on. 150 °C for 3 h 30 m.",
		"Rest 20 minutes. The braise should slide; the meat should yield to a spoon.",
		"Skim, reduce sauce on the stove if needed. Serve with polenta.",
	];
}

export function RecipePagePanda({ recipe }: RecipePageProps) {
	const kitchen = COPY.kitchen;
	const isCocktail = recipe.category === "Cocktails";
	const ingredients = getIngredients(recipe);
	const method = getMethod(recipe);

	return (
		<>
			<Helmet>
				<title>{`${recipe.title} | ${META.kitchen.title}`}</title>
				<meta name="description" content={recipe.dek} />
				<link rel="canonical" href={`${PERSON.siteUrl}/kitchen/${recipe.slug}`} />
			</Helmet>

			<div className="ds-page ds-page-fade" style={{ maxWidth: "70rem" }}>
				<section style={{ padding: "var(--gap-5) 0 var(--gap-3)" }}>
					<a href="/kitchen" className="ds-plain">
						<span className="ds-mono" style={{ color: "var(--ink-3)" }}>{kitchen.backLink}</span>
					</a>
					<div style={{ borderTop: "2px solid var(--ink)", marginTop: "1rem", paddingTop: "1rem" }}>
						<span className="ds-eyebrow">
							<span className="ds-num">No. {recipe.num}</span>
							{recipe.category} · {recipe.time} · serves {recipe.serves}
						</span>
					</div>
					<h1 className="ds-h1" style={{ margin: "1rem 0 1rem", letterSpacing: "-0.02em", maxWidth: "22ch" }}>
						{recipe.title}
					</h1>
					<p className="ds-lede" style={{ margin: 0, maxWidth: "44ch" }}>{recipe.dek}</p>
				</section>

				<section style={{ padding: "var(--gap-3) 0 var(--gap-4)" }}>
					<div className="ds-img-slot" style={{ aspectRatio: "16/9" }} data-label={`Hero shot · ${recipe.title}`} />
				</section>

				<section style={{ padding: "0 0 var(--gap-5)" }}>
					<div className="ds-recipe-layout">
						<aside className="ds-recipe-aside">
							<h3 className="ds-eyebrow" style={{ display: "block", marginBottom: "1rem" }}>
								<span className="ds-num">§ 01</span>Ingredients
							</h3>
							<ul className="ds-ingredient-list">
								{ingredients.map(([q, n], i) => (
									<li key={i}>
										<span className="ds-mono ds-ingredient-qty">{q}</span>
										<span className="ds-ingredient-name">{n}</span>
									</li>
								))}
							</ul>

							<h3 className="ds-eyebrow" style={{ display: "block", marginTop: "var(--gap-4)", marginBottom: "1rem" }}>
								<span className="ds-num">§ 02</span>Ratios
							</h3>
							<div className="ds-mono" style={{ color: "var(--ink-2)", fontSize: "0.78rem", lineHeight: 1.7 }}>
								{isCocktail ? (
									<>
										spirit : sweet : bitter
										<br />
										<span style={{ color: "var(--accent)" }}>8 : 1 : 0.05</span>
									</>
								) : (
									<>
										meat : liquid
										<br />
										<span style={{ color: "var(--accent)" }}>1 : 1</span>
										<br />
										oven
										<br />
										<span style={{ color: "var(--accent)" }}>150 °C · 3 h 30 m</span>
									</>
								)}
							</div>
						</aside>

						<div>
							<h2 className="ds-eyebrow" style={{ display: "block", marginBottom: "1rem" }}>
								<span className="ds-num">§ 03</span>Method
							</h2>
							<ol className="ds-method-list">
								{method.map((step, i) => (
									<li key={i}>
										<span className="ds-mono ds-method-step">Step 0{i + 1}</span>
										<span className="ds-method-text">{step}</span>
									</li>
								))}
							</ol>

							<div className="ds-iteration-notes">
								<span className="ds-small-caps" style={{ color: "var(--ink-2)" }}>Iteration notes.</span>
								<p>
									<span className="ds-mono" style={{ color: "var(--accent)" }}>v3</span> ·{" "}
									{recipe.category === "Baking"
										? "Reduced hydration to 75%; better oven spring."
										: "Switched from beef chuck to bone-in short rib. Decisively better."}
								</p>
								<p>
									<span className="ds-mono" style={{ color: "var(--accent)" }}>v2</span> · Added coffee for depth; didn't taste like coffee at the end. Stayed.
								</p>
								<p style={{ marginBottom: 0 }}>
									<span className="ds-mono" style={{ color: "var(--accent)" }}>v1</span> · Original. Salt low. Cook time short. Don't go back.
								</p>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}
