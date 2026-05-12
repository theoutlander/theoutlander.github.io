import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { CodementorReview } from "../types/codementor";

const PROFESSIONAL_REVIEWS = [
  { id: "rv1", quote: "Nick combines a high technical bar with the kind of clarity teams remember years later. I would work with him on anything.", who: "Director, Google", role: "Gemini Code Assist", year: "2025" },
  { id: "rv2", quote: "He rebuilt a stalled platform team into one of the strongest orgs at the company. His roadmap discipline set a new bar for us.", who: "VP Engineering, Salesforce", role: "Manager, 2023–2024", year: "2024" },
  { id: "rv3", quote: "Nick is one of the few managers whose feedback I actually wrote down. Specific, fair, and unusually accurate.", who: "Senior Engineer", role: "Reported to Nick at Microsoft", year: "2021" },
  { id: "rv4", quote: "Sharp technical judgment paired with real org instinct. He'll find the assumption hiding under your plan and ask the right question about it.", who: "Founder, ex-startup", role: "Advisor, 2022–2023", year: "2023" },
  { id: "rv5", quote: "Reads code carefully and reviews it generously. His comments taught me how to write better code, not just fix that one diff.", who: "Principal Engineer, Microsoft", role: "Peer, 2019–2021", year: "2020" },
  { id: "rv6", quote: "I have hired four people on his recommendation. All four are still here. All four are now leading teams.", who: "CTO", role: "Hiring partner", year: "2024" },
];

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
        <meta name="description" content="Reviews from people I have worked with and mentored over the years." />
        <link rel="canonical" href="https://nick.karnik.io/reviews" />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-3)" }}>
          <SectionTag num="01" label="Reviews" right="What collaborators have said" />
          <h1 className="ds-h1" style={{ margin: "0 0 1rem", maxWidth: "20ch" }}>
            Things people have <em>actually written down</em> about working with me.
          </h1>
          <p className="ds-lede" style={{ margin: 0, maxWidth: "46ch" }}>
            Lightly excerpted from performance reviews, LinkedIn recommendations, and the occasional email I had to ask permission to quote.
          </p>
        </section>

        <section style={{ padding: "var(--gap-4) 0 var(--gap-5)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-4)" }}>
            {PROFESSIONAL_REVIEWS.map((r, i) => (
              <figure
                key={r.id}
                style={{
                  margin: 0,
                  padding: "var(--gap-3) 0",
                  borderTop: "1px solid var(--ink)",
                }}
              >
                <div className="ds-mono" style={{ color: "var(--accent)", marginBottom: "0.5rem", fontSize: "0.72rem", letterSpacing: "0.16em" }}>
                  N° {String(i + 1).padStart(2, "0")} · {r.year}
                </div>
                <blockquote style={{
                  margin: 0,
                  fontFamily: "var(--serif)",
                  fontSize: "1.375rem",
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                  fontStyle: "italic",
                  color: "var(--ink)",
                }}>
                  <span style={{ color: "var(--accent)", fontStyle: "normal", fontSize: "1.5em", lineHeight: 0, position: "relative", top: "0.1em", marginRight: "0.05em" }}>"</span>
                  {r.quote}
                </blockquote>
                <figcaption style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <div className="ds-small-caps" style={{ color: "var(--ink)" }}>{r.who}</div>
                    <div className="ds-mono" style={{ color: "var(--ink-3)", fontSize: "0.72rem", marginTop: "0.25rem" }}>{r.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {reviews && reviews.length > 0 && (
          <section style={{ padding: "0 0 var(--gap-5)" }}>
            <SectionTag num="02" label="Mentoring reviews" right="via Codementor" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap-3)" }}>
              {reviews.map((r, i) => (
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
        )}
      </div>
    </>
  );
}
