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

type BlogPageProps = {
  posts: Post[];
  filterTag?: string;
  filterCategory?: string;
};

export function BlogPagePanda({ posts, filterTag: initialFilter, filterCategory }: BlogPageProps) {
  const initial = initialFilter ?? filterCategory ?? "All";
  const [filter, setFilter] = useState(initial);

  const categories = Array.from(
    new Set(posts.map((p) => postCategoryLabel(p)).filter(Boolean))
  ).sort();
  const tags = ["All", ...categories];

  const filtered =
    filter === "All"
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
        <title>Nick Karnik | Writing</title>
        <meta name="description" content="Writing about AI, engineering leadership, developer tools, and what I learn building software." />
        <link rel="canonical" href="https://nick.karnik.io/blog" />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
          <SectionTag
            num="01"
            label="Writing"
            right={`${posts.length} essays · since 2018`}
          />
          <h1 className="ds-h1" style={{ margin: "0 0 1rem", maxWidth: "20ch" }}>
            Writing about what I know, from someone who built it.
          </h1>
          <p className="ds-lede" style={{ maxWidth: "48ch", margin: "0 0 var(--gap-4)" }}>
            No schedule, no cadence. Just things worth writing down.
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
            <a key={p.id} href={`/blog/${p.slug}`} className="ds-index-row">
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
              <span className="ds-meta ds-read-time">{formatReadTime(postReadMinutes(p), false)}</span>
            </a>
          ))}
          <div className="ds-rule" />
        </section>
      </div>
    </>
  );
}
