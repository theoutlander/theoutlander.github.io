import React from "react";
import { Helmet } from "../seo/HelmetShim";
import { PERSON } from "../../data/person";

// In-app 404. Rendered by the router's notFoundComponent (see src/routes/__root.tsx)
// for any unmatched route in the SPA. The static, self-contained public/404.html
// is what GitHub Pages serves on a hard 404; this is its themed counterpart for
// client-side navigation, so the app never falls back to the router's bare
// "Not Found" text. Nav + footer come from the root layout that wraps this.
const DESTINATIONS = [
	{ label: "home", href: "/" },
	{ label: "writing", href: "/blog" },
	{ label: "about", href: "/about" },
	{ label: "résumé", href: "/resume" },
	{ label: "reviews", href: "/reviews" },
];

export function NotFoundView() {
	return (
		<>
			<Helmet>
				<title>{`404 · not found · ${PERSON.name}`}</title>
				<meta name="robots" content="noindex, nofollow" />
			</Helmet>

			<div className="ds-page ds-page-fade">
				<section style={{ padding: "var(--gap-5) 0 var(--gap-5)", maxWidth: "42rem" }}>
					<div className="ds-eyebrow">
						HTTP <span className="ds-num">404</span>
					</div>
					<h1 className="ds-display" style={{ margin: "var(--gap-2) 0 var(--gap-3)" }}>
						This page isn't here.
					</h1>
					<p className="ds-lede" style={{ maxWidth: "34ch" }}>
						It may have moved. It may never have existed. Everything else works.
					</p>

					<hr className="ds-rule" style={{ margin: "var(--gap-4) 0 var(--gap-3)" }} />

					<p className="ds-label">Pages that do exist</p>
					<nav aria-label="Site pages" style={{ display: "flex", flexDirection: "column" }}>
						{DESTINATIONS.map((d) => (
							<a
								key={d.href}
								href={d.href}
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "baseline",
									gap: "1rem",
									padding: "0.6rem 0",
									borderBottom: "1px solid var(--rule-2)",
									textDecoration: "none",
									fontFamily: "var(--mono)",
									fontSize: "0.9rem",
									color: "var(--ink)",
								}}
							>
								<span>{d.label}</span>
								<span style={{ color: "var(--ink-3)", fontSize: "0.8rem" }}>{d.href}</span>
							</a>
						))}
					</nav>
				</section>
			</div>
		</>
	);
}
