import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { CodementorReview } from "../types/codementor";

interface ReviewsPageProps {
  reviews: CodementorReview[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span
      className="ds-mono"
      style={{ color: "var(--accent)", fontSize: "0.72rem", letterSpacing: "0.08em" }}
      aria-label={`${rating} out of 5 stars`}
    >
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export function ReviewsPagePanda({ reviews }: ReviewsPageProps) {
  return (
    <>
      <Helmet>
        <title>Nick Karnik | Reviews</title>
        <meta name="description" content="Reviews from people I have mentored and worked with." />
        <link rel="canonical" href="https://nick.karnik.io/reviews" />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-3)" }}>
          <SectionTag num="01" label="Mentoring reviews" right="via Codementor" />
          <h1 className="ds-h1" style={{ margin: "0 0 1rem", maxWidth: "20ch" }}>
            What people say after <em>we actually work together.</em>
          </h1>
          <p className="ds-lede" style={{ margin: 0, maxWidth: "46ch" }}>
            Reviews from mentoring sessions on Codementor. Unedited.
          </p>
        </section>

        {reviews && reviews.length > 0 ? (
          <section style={{ padding: "var(--gap-4) 0 var(--gap-5)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap-3)" }}>
              {reviews.map((r) => (
                <figure
                  key={r.id}
                  style={{
                    margin: 0,
                    padding: "var(--gap-3) 0",
                    borderTop: "1px solid var(--rule)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                    <StarRating rating={r.rating} />
                    <span className="ds-mono" style={{ color: "var(--ink-3)", fontSize: "0.72rem" }}>
                      {new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                    </span>
                  </div>
                  <blockquote style={{
                    margin: 0,
                    fontFamily: "var(--serif)",
                    fontSize: "1.0625rem",
                    lineHeight: 1.5,
                    fontStyle: "italic",
                    color: "var(--ink-2)",
                  }}>
                    {r.text}
                  </blockquote>
                  <figcaption style={{ marginTop: "0.75rem" }}>
                    <div className="ds-small-caps" style={{ color: "var(--ink-2)", fontSize: "0.85rem" }}>{r.author}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : (
          <section style={{ padding: "var(--gap-4) 0 var(--gap-5)" }}>
            <p style={{ color: "var(--ink-2)" }}>No reviews yet.</p>
          </section>
        )}
      </div>
    </>
  );
}
