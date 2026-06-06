import React from "react";
import { Post } from "../types/blog";
import ShareButtons from "../components/blog/ShareButtons";
import {
  formatBlogDate,
  formatReadTime,
  getPostNumber,
  postCategoryLabel,
  postReadMinutes,
} from "../lib/blog-format";

type BlogPostPageProps = {
  post: Post;
  posts: Post[];
};

export function BlogPostPagePanda({ post, posts }: BlogPostPageProps) {
  const content =
    (post as { contentHtml?: string }).contentHtml ||
    (post as { html?: string }).html ||
    "";
  const readTime = postReadMinutes(post);
  const currentIndex = posts.findIndex((p) => p.id === post.id);
  const prevPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const category = postCategoryLabel(post) || "Essay";

  return (
    <div className="ds-page ds-page-fade" style={{ maxWidth: "70rem" }}>
      <section style={{ padding: "var(--gap-5) 0 var(--gap-3)" }}>
        <a href="/blog" className="ds-plain" style={{ display: "inline-block", marginBottom: "var(--gap-3)" }}>
          <span className="ds-mono" style={{ color: "var(--ink-3)" }}>← Back to writing</span>
        </a>
        <div className="ds-rule-thick" style={{ paddingTop: "1rem" }}>
          <span className="ds-eyebrow">
            <span className="ds-num">No. {getPostNumber(posts, post.id)}</span>
            {category} · {formatBlogDate(post.date)} · {formatReadTime(readTime)}
          </span>
        </div>
        <h1
          className="ds-h1"
          style={{ margin: "1rem 0 1rem", letterSpacing: "-0.02em", maxWidth: "22ch" }}
        >
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="ds-lede" style={{ margin: 0, maxWidth: "44ch" }}>{post.excerpt}</p>
        )}
      </section>

      {post.cover && (
        <section style={{ padding: "var(--gap-3) 0" }}>
          <div className="ds-blog-cover">
            <img src={post.cover} alt="" />
          </div>
        </section>
      )}

      <section style={{ padding: "var(--gap-3) 0 var(--gap-5)" }}>
        <div className="ds-with-margin">
          <article
            className="ds-prose blog-post-content"
            dangerouslySetInnerHTML={{ __html: content || `<p>${post.excerpt}</p>` }}
          />
          {post.tags && post.tags.length > 0 && (
            <aside className="ds-margin-note">
              <span className="ds-small-caps" style={{ color: "var(--ink-2)" }}>Topics.</span>
              <div className="ds-blog-topics">
                {post.tags.map((tag) => (
                  <span key={tag} className="ds-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </aside>
          )}
        </div>
        <ShareButtons title={post.title} url={`/blog/${post.slug}`} />
      </section>

      {(prevPost || nextPost) && (
        <section className="ds-blog-nav">
          <div className="ds-blog-nav-grid">
            {prevPost ? (
              <div>
                <span className="ds-mono" style={{ color: "var(--ink-3)" }}>← Previous</span>
                <h3 className="ds-h3 ds-blog-nav-title">
                  <a href={`/blog/${prevPost.slug}`} className="ds-plain">{prevPost.title}</a>
                </h3>
              </div>
            ) : (
              <div />
            )}
            {nextPost ? (
              <div className="ds-blog-nav-next">
                <span className="ds-mono" style={{ color: "var(--ink-3)" }}>Next →</span>
                <h3 className="ds-h3 ds-blog-nav-title">
                  <a href={`/blog/${nextPost.slug}`} className="ds-plain">{nextPost.title}</a>
                </h3>
              </div>
            ) : (
              <div />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
