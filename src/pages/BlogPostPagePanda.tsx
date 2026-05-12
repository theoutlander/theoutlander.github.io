import React from "react";
import { SectionTag } from "../components/design/SectionTag";
import { Post } from "../types/blog";

type BlogPostPageProps = {
  post: Post;
  posts: Post[];
};

function estimateReadingTime(text: string) {
  const cleanText = text.replace(/<[^>]*>/g, "");
  const words = cleanText.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export function BlogPostPagePanda({ post, posts }: BlogPostPageProps) {
  const content = (post as any).contentHtml || (post as any).html || "";
  const readTime = estimateReadingTime(content || post.excerpt || "");
  const currentIndex = posts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;

  return (
    <div className="ds-page ds-page-fade" style={{ maxWidth: "70rem" }}>
      <section style={{ padding: "var(--gap-5) 0 var(--gap-3)" }}>
        <a href="/blog" style={{ display: "inline-block", marginBottom: "var(--gap-3)", textDecoration: "none", borderBottom: "none" }}>
          <span className="ds-mono" style={{ color: "var(--ink-3)" }}>← Back to writing</span>
        </a>
        <div style={{ borderTop: "2px solid var(--ink)", paddingTop: "1rem" }}>
          <span className="ds-eyebrow">
            {post.category ?? (post.tags?.[0] ?? "Essay")} · {formatDate(post.date)} · {readTime} min read
          </span>
        </div>
        <h1 className="ds-h1" style={{ margin: "1rem 0 1rem", maxWidth: "22ch" }}>
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="ds-lede" style={{ margin: 0, maxWidth: "44ch" }}>{post.excerpt}</p>
        )}
      </section>

      {post.cover && (
        <section style={{ padding: "var(--gap-3) 0" }}>
          <img
            src={post.cover}
            alt={post.title}
            style={{ width: "100%", maxHeight: "28rem", objectFit: "cover", display: "block" }}
          />
        </section>
      )}

      <section style={{ padding: "var(--gap-3) 0 var(--gap-5)" }}>
        <div className="ds-with-margin">
          <article
            className="ds-prose blog-post-content"
            style={{ maxWidth: "none" }}
            dangerouslySetInnerHTML={{ __html: content || `<p>${post.excerpt}</p>` }}
          />
          {post.tags && post.tags.length > 0 && (
            <aside className="ds-margin-note">
              <span className="ds-small-caps" style={{ color: "var(--ink-2)" }}>Topics.</span>
              <div style={{ marginTop: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {post.tags.map(tag => (
                  <span key={tag} className="ds-tag">{tag}</span>
                ))}
              </div>
            </aside>
          )}
        </div>
      </section>

      {(prevPost || nextPost) && (
        <section style={{ padding: "var(--gap-4) 0", borderTop: "1px solid var(--ink)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap-3)" }}>
            {prevPost ? (
              <div>
                <span className="ds-mono" style={{ color: "var(--ink-3)" }}>← Previous</span>
                <h3 className="ds-h3" style={{ margin: "0.5rem 0 0" }}>
                  <a href={`/blog/${prevPost.slug}`} style={{ color: "inherit", textDecoration: "none", borderBottom: "none" }}>
                    {prevPost.title}
                  </a>
                </h3>
              </div>
            ) : <div />}
            {nextPost ? (
              <div style={{ textAlign: "right" }}>
                <span className="ds-mono" style={{ color: "var(--ink-3)" }}>Next →</span>
                <h3 className="ds-h3" style={{ margin: "0.5rem 0 0" }}>
                  <a href={`/blog/${nextPost.slug}`} style={{ color: "inherit", textDecoration: "none", borderBottom: "none" }}>
                    {nextPost.title}
                  </a>
                </h3>
              </div>
            ) : <div />}
          </div>
        </section>
      )}
    </div>
  );
}
