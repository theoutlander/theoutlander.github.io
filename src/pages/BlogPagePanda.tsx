import React, { useState } from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { Post } from "../types/blog";
import {
  formatBlogDate,
  formatReadTime,
  getPostNumber,
  postCategoryLabel,
  postReadMinutes,
} from "../lib/blog-format";
import { COPY } from "../data/site-copy";
import { META, PERSON } from "../data/person";

type BlogPageProps = {
  posts: Post[];
  filterTag?: string;
  filterCategory?: string;
};

export function BlogPagePanda({ posts, filterTag: initialFilter, filterCategory }: BlogPageProps) {
  const initial = initialFilter ?? filterCategory ?? COPY.blog.filterAll;
  const [filter, setFilter] = useState(initial);

  const categories = Array.from(
    new Set(posts.map((p) => postCategoryLabel(p)).filter(Boolean))
  ).sort();
  const tags = [COPY.blog.filterAll, ...categories];

  const filtered =
    filter === COPY.blog.filterAll
      ? posts
      : posts.filter(
          (p) =>
            p.category === filter ||
            p.tags?.includes(filter) ||
            postCategoryLabel(p) === filter
        );

  return (
    <>
      <Helmet>
        <title>{META.blog.title}</title>
        <meta name="description" content={META.blog.description} />
        <link rel="canonical" href={`${PERSON.siteUrl}/blog`} />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
          <SectionTag
            num={COPY.blog.sectionNum}
            label={COPY.blog.sectionLabel}
            right={`${posts.length} ${COPY.blog.sectionRightSuffix}`}
          />
          <h1 className="ds-h1" style={{ margin: "0 0 1rem", maxWidth: "20ch" }}>
            {COPY.blog.headline}
          </h1>
          <p className="ds-lede" style={{ maxWidth: "48ch", margin: "0 0 var(--gap-4)" }}>
            {COPY.blog.lede}
          </p>
          <div className="ds-blog-filters">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={`ds-tag${filter === t ? " active" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section>
          {filtered.map((p) => (
            <a key={p.id} href={`/blog/${p.slug}`} className="ds-index-row ds-plain">
              <span className="ds-num">No. {getPostNumber(posts, p.id)}</span>
              <span>
                <span className="ds-title" style={{ display: "block" }}>{p.title}</span>
                <span className="ds-index-dek">{p.excerpt}</span>
              </span>
              <span className="ds-meta">
                {formatBlogDate(p.date)}
                <br />
                {postCategoryLabel(p)}
              </span>
              <span className="ds-meta ds-read-time">{formatReadTime(postReadMinutes(p))}</span>
            </a>
          ))}
          <div className="ds-rule" />
        </section>
      </div>
    </>
  );
}
