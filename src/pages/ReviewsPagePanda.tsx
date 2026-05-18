import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { CodementorReview } from "../types/codementor";
import { META, PERSON } from "../data/person";
import { COPY } from "../data/site-copy";

interface ReviewsPageProps {
	reviews: CodementorReview[];
}

function Stars() {
	return (
		<span style={{ display: "flex", gap: "0.25rem" }} aria-hidden>
			{[0, 1, 2, 3, 4].map((i) => (
				<svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="var(--accent)">
					<path d="M6 1l1.3 2.9H10L7.7 5.7l.9 3L6 7.2 3.4 8.7l.9-3L2 3.9h2.7z" />
				</svg>
			))}
		</span>
	);
}

export function ReviewsPagePanda({ reviews }: ReviewsPageProps) {
	const rc = COPY.reviews;

	return (
		<>
			<Helmet>
				<title>{META.reviews.title}</title>
				<meta name="description" content={META.reviews.description} />
				<link rel="canonical" href={`${PERSON.siteUrl}/reviews`} />
			</Helmet>

			<div className="ds-page ds-page-fade">
				<section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
					<SectionTag num={rc.sectionNum} label={rc.sectionLabel} right={rc.sectionRight} />
					<h1 className="ds-h1" style={{ margin: "0.75rem 0 1rem", maxWidth: "22ch" }}>
						{rc.headlineBefore}
						<em>{rc.headlineEmphasis}</em>
					</h1>
					<p className="ds-mono" style={{ margin: 0, color: "var(--ink-2)", fontSize: "0.85rem", letterSpacing: "0.04em" }}>
						{rc.lede}
					</p>
				</section>

				{reviews.length > 0 ? (
					<section style={{ padding: "var(--gap-2) 0 var(--gap-5)" }}>
						<div className="ds-reviews-grid">
							{reviews.map((r) => (
								<figure key={r.id} className="ds-review-card">
									<Stars />
									<blockquote>{r.text}</blockquote>
									<figcaption>
										<div className="ds-mono ds-review-author">{r.author}</div>
									</figcaption>
								</figure>
							))}
						</div>
					</section>
				) : (
					<section style={{ padding: "var(--gap-4) 0 var(--gap-5)" }}>
						<p style={{ color: "var(--ink-2)" }}>{rc.empty}</p>
					</section>
				)}
			</div>
		</>
	);
}
