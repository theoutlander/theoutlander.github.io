import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import type { BlogPost } from "../types/blog";
import { HERO_LEDE, META, PERSON, WORK_BLOCKS } from "../data/person";
import { COPY } from "../data/site-copy";
import { formatBlogDate, postCategoryLabel, postReadMinutes } from "../lib/blog-format";

interface HomePageProps {
  posts: BlogPost[];
}

export function HomePagePanda({ posts }: HomePageProps) {
  const top3 = posts.slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{META.home.title}</title>
        <meta name="description" content={META.home.description} />
        <link rel="canonical" href={PERSON.siteUrl} />
      </Helmet>

      <div className="ds-page ds-page-fade">
        {/* Hero — portrait variant: name, rule, lede + CTAs */}
        <section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
          <div style={{ marginBottom: "var(--gap-2)" }}>
            <span className="ds-eyebrow">
              <span className="ds-num">{COPY.home.eyebrowSection}</span>
              {PERSON.tagline}
            </span>
          </div>
          <h1 className="ds-hero-name">
            {COPY.home.headlineLine1}
            <br />
            {COPY.home.headlineLine2}
            <span style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>.</span>
          </h1>
          <div style={{ borderTop: "1px solid var(--rule)", margin: "var(--gap-3) 0" }} />
          <p className="ds-lede" style={{ margin: "0 0 var(--gap-3)", maxWidth: "52ch" }}>
            {HERO_LEDE}
          </p>
          <div className="ds-hero-actions">
            <a href="/blog" className="ds-btn">
              {COPY.home.ctaPrimary}
            </a>
            <a href="/resume" className="ds-btn ds-btn-ghost">
              {COPY.home.ctaSecondary}
            </a>
          </div>
        </section>

        {/* Recent writing */}
        <section style={{ padding: "var(--gap-5) 0" }}>
          <SectionTag
            num={COPY.home.writingSectionNum}
            label={COPY.home.writingHeading}
            right={<a href="/blog">{COPY.home.writingLink}</a>}
          />
          {top3.length > 0 ? (
            <div className="ds-post-grid">
              {top3.map((p) => (
                <article key={p.id} className="ds-post-card">
                  <span className="ds-dateline">
                    {formatBlogDate(p.date)}
                    {postCategoryLabel(p) ? ` · ${postCategoryLabel(p)}` : ""}
                  </span>
                  <h3 className="ds-h3" style={{ margin: "0.6rem 0 0.5rem", letterSpacing: "-0.01em" }}>
                    <a href={`/blog/${p.slug}`} className="ds-plain" style={{ color: "inherit" }}>
                      {p.title}
                    </a>
                  </h3>
                  <p style={{ color: "var(--ink-2)", fontSize: "0.98rem", margin: 0 }}>{p.excerpt}</p>
                  <div style={{ marginTop: "1rem" }}>
                    <span className="ds-mono" style={{ color: "var(--ink-3)" }}>
                      {postReadMinutes(p)} min read
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--ink-2)" }}>{COPY.home.writingEmpty}</p>
          )}
        </section>

        {/* Work */}
        <section style={{ padding: "var(--gap-4) 0 var(--gap-5)" }}>
          <SectionTag num={COPY.home.workSectionNum} label={COPY.home.workHeading} />
          <div className="ds-work-grid">
            {WORK_BLOCKS.map((b, i) => (
              <div key={i}>
                <span className="ds-mono" style={{ color: "var(--accent)" }}>
                  0{i + 1} —
                </span>
                <h3 className="ds-h3" style={{ margin: "0.4rem 0 0.6rem", letterSpacing: "-0.005em" }}>
                  {b.t}
                </h3>
                <p style={{ color: "var(--ink-2)", fontSize: "0.95rem", margin: 0 }}>{b.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
