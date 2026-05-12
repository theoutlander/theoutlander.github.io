import React, { useState } from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { Post } from "../types/blog";

type BlogPageProps = {
  posts: Post[];
  filterTag?: string;
  filterCategory?: string;
};

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export function BlogPagePanda({ posts, filterTag: initialFilter }: BlogPageProps) {
  const [filter, setFilter] = useState(initialFilter ?? "All");

  const allTags = ["All", ...Array.from(new Set(posts.flatMap(p => p.tags ?? []).filter(Boolean)))];
  const tags = allTags.length > 2 ? allTags : ["All", "Leadership", "AI", "Product", "Engineering", "Craft", "Hiring", "DX", "Kitchen"];

  const filtered = filter === "All"
    ? posts
    : posts.filter(p => p.tags?.includes(filter) || p.category === filter);

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
            Notes on building software<span style={{ color: "var(--accent)" }}>—</span>and the teams that ship it.
          </h1>
          <p className="ds-lede" style={{ maxWidth: "48ch", margin: "0 0 var(--gap-4)" }}>
            Long-form essays, mostly. A new piece every other Tuesday. The archive is below; you can also filter by topic.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "var(--gap-2)" }}>
            {tags.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`ds-tag${filter === t ? " active" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section>
          {filtered.map((p, i) => (
            <a
              key={p.id}
              href={`/blog/${p.slug}`}
              className="ds-index-row"
            >
              <span className="ds-num">No. {String(i + 1).padStart(3, "0")}</span>
              <span>
                <span className="ds-title" style={{ display: "block" }}>{p.title}</span>
                <span style={{ color: "var(--ink-2)", fontSize: "0.95rem", display: "block", marginTop: "0.35rem" }}>{p.excerpt}</span>
              </span>
              <span className="ds-meta">{formatDate(p.date)}<br />{p.category ?? (p.tags?.[0] ?? "")}</span>
              <span className="ds-meta ds-read-time">—</span>
            </a>
          ))}
          <div style={{ borderTop: "1px solid var(--rule)" }} />
        </section>
      </div>
    </>
  );
}
