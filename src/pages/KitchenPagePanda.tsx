import React, { useState } from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { Link } from "@tanstack/react-router";
import { SectionTag } from "../components/design/SectionTag";
import { COPY } from "../data/site-copy";
import { RECIPES } from "../data/recipes";
import { META, PERSON } from "../data/person";

export function KitchenPagePanda() {
	const kitchen = COPY.kitchen;
	const [cat, setCat] = useState(kitchen.categories[0]);
	const list =
		cat === kitchen.categories[0] ? RECIPES : RECIPES.filter((r) => r.category === cat);

	return (
		<>
			<Helmet>
				<title>{META.kitchen.title}</title>
				<meta name="description" content={META.kitchen.description} />
				<link rel="canonical" href={`${PERSON.siteUrl}/kitchen`} />
			</Helmet>

			<div className="ds-page ds-page-fade">
				<section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
					<SectionTag num={kitchen.sectionNum} label={kitchen.sectionLabel} right={kitchen.sectionRight} />
					<div className="ds-kitchen-hero">
						<div>
							<h1 className="ds-display" style={{ margin: "0 0 1rem", maxWidth: "12ch", letterSpacing: "-0.025em" }}>
								{kitchen.headlinePrefix}
								<em>{kitchen.headlineEmphasis}</em>
								<span style={{ color: "var(--accent)" }}>.</span>
							</h1>
							<p className="ds-lede" style={{ margin: 0, maxWidth: "44ch" }}>
								{kitchen.lede}
							</p>
						</div>
						<div className="ds-img-slot" style={{ aspectRatio: "5/4" }} data-label="Mise en place" />
					</div>
				</section>

				<section style={{ padding: "var(--gap-3) 0 var(--gap-2)" }}>
					<div className="ds-blog-filters">
						{kitchen.categories.map((c) => (
							<button
								key={c}
								type="button"
								onClick={() => setCat(c)}
								className={`ds-tag${cat === c ? " active" : ""}`}
							>
								{c}
							</button>
						))}
					</div>
				</section>

				<section style={{ padding: "var(--gap-3) 0 var(--gap-5)" }}>
					<div className="ds-recipe-grid">
						{list.map((r) => (
							<Link
								key={r.id}
								to="/kitchen/$slug"
								params={{ slug: r.slug }}
								className="ds-plain ds-recipe-card"
							>
								<div
									className="ds-img-slot"
									style={{ aspectRatio: "4/5" }}
									data-label={r.title.split(" ").slice(0, 2).join(" ")}
								/>
								<div className="ds-recipe-card-meta">
									<span className="ds-mono" style={{ color: "var(--accent)", fontSize: "0.72rem", letterSpacing: "0.14em" }}>
										N° {r.num}
									</span>
									<span className="ds-mono" style={{ color: "var(--ink-3)", fontSize: "0.72rem", letterSpacing: "0.12em" }}>
										{r.category} · {r.time}
									</span>
								</div>
								<h3 className="ds-recipe-card-title">{r.title}</h3>
								<p className="ds-recipe-card-dek">{r.dek}</p>
							</Link>
						))}
					</div>
				</section>
			</div>
		</>
	);
}
