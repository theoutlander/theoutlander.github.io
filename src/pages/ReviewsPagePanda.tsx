import React, { useState } from "react";
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

const LINKEDIN_PLACEHOLDERS = [
	{ id: "li1", quote: COPY.reviews.placeholderQuote, author: COPY.reviews.placeholderAuthor, role: COPY.reviews.placeholderRole },
	{ id: "li2", quote: COPY.reviews.placeholderQuote, author: COPY.reviews.placeholderAuthor, role: COPY.reviews.placeholderRole },
];

const YOUTUBE_PLACEHOLDERS = [
	{ id: "yt1", quote: COPY.reviews.placeholderQuote, author: COPY.reviews.placeholderYoutubeAuthor },
	{ id: "yt2", quote: COPY.reviews.placeholderQuote, author: COPY.reviews.placeholderYoutubeAuthor },
	{ id: "yt3", quote: COPY.reviews.placeholderQuote, author: COPY.reviews.placeholderYoutubeAuthor },
	{ id: "yt4", quote: COPY.reviews.placeholderQuote, author: COPY.reviews.placeholderYoutubeAuthor },
];

export function ReviewsPagePanda({ reviews }: ReviewsPageProps) {
	const rc = COPY.reviews;
	const [ytIndex, setYtIndex] = useState(0);

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
					<section style={{ padding: "var(--gap-4) 0" }}>
						<p style={{ color: "var(--ink-2)" }}>{rc.empty}</p>
					</section>
				)}

				<section style={{ padding: "var(--gap-4) 0 var(--gap-5)", borderTop: "2px solid var(--ink)" }}>
					<SectionTag num={rc.colleaguesSectionNum} label={rc.colleaguesLabel} right={rc.colleaguesRight} />
					<div className="ds-placeholder-grid" style={{ marginTop: "var(--gap-3)" }}>
						{LINKEDIN_PLACEHOLDERS.map((r) => (
							<figure key={r.id} className="ds-placeholder-card">
								<blockquote>{r.quote}</blockquote>
								<figcaption>
									<div className="ds-mono ds-review-author">{r.author}</div>
									<div className="ds-mono" style={{ fontSize: "0.68rem", color: "var(--ink-3)", marginTop: "0.2rem" }}>
										{r.role}
									</div>
								</figcaption>
							</figure>
						))}
					</div>
				</section>

				<section style={{ padding: "var(--gap-4) 0 var(--gap-5)", borderTop: "2px solid var(--ink)" }}>
					<SectionTag num={rc.youtubeSectionNum} label={rc.youtubeLabel} right={rc.youtubeRight} />
					<div style={{ marginTop: "var(--gap-3)" }}>
						<figure className="ds-placeholder-card ds-placeholder-card-wide">
							<blockquote style={{ fontSize: "1.375rem" }}>{YOUTUBE_PLACEHOLDERS[ytIndex].quote}</blockquote>
							<figcaption>
								<div className="ds-mono" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--ink-3)" }}>
									— {YOUTUBE_PLACEHOLDERS[ytIndex].author}
								</div>
							</figcaption>
						</figure>
						<div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "1rem" }}>
							<button
								type="button"
								className="ds-btn ds-btn-ghost"
								style={{ padding: "0.4rem 0.9rem" }}
								onClick={() => setYtIndex((ytIndex - 1 + YOUTUBE_PLACEHOLDERS.length) % YOUTUBE_PLACEHOLDERS.length)}
							>
								←
							</button>
							<span className="ds-mono" style={{ fontSize: "0.72rem", color: "var(--ink-3)" }}>
								{ytIndex + 1} / {YOUTUBE_PLACEHOLDERS.length}
							</span>
							<button
								type="button"
								className="ds-btn ds-btn-ghost"
								style={{ padding: "0.4rem 0.9rem" }}
								onClick={() => setYtIndex((ytIndex + 1) % YOUTUBE_PLACEHOLDERS.length)}
							>
								→
							</button>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}
