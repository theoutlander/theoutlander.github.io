import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { SecondaryMark } from "../components/design/Marks";
import type { BlogPost } from "../types/blog";

interface HomePageProps {
  posts: BlogPost[];
}

const STATS = [
  { n: "25+", l: "Years building software" },
  { n: "10+", l: "Years leading engineers" },
  { n: "100+", l: "Engineers hired or grown" },
  { n: "3", l: "Products shipped at scale" },
];

const WORK_BLOCKS = [
  { t: "AI and Developer Tools", d: "Built Gemini Code Assist at Google. Writing about what I learned building it." },
  { t: "Search and Relevance", d: "Six years on Bing search at Microsoft. A patent. A lot of labeled data." },
  { t: "Making Things", d: "Currently building new tools. Making games with my three kids. Always something cooking." },
  { t: "Engineering Leadership", d: "Led teams at Google, Microsoft, Tableau, and T-Mobile. Hired and scaled engineering organizations." },
];

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export function HomePagePanda({ posts }: HomePageProps) {
  const top3 = posts.slice(0, 3);

  return (
    <>
      <Helmet>
        <title>Nick Karnik</title>
        <meta name="description" content="Nearly three decades building software across search, AI, and developer tools. Engineering leader, writer, cook, dad of three." />
        <link rel="canonical" href="https://nick.karnik.io" />
      </Helmet>

      <div className="ds-page ds-page-fade">
        {/* Hero */}
        <section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
            gap: "var(--gap-5)",
            alignItems: "center",
          }}>
            <div>
              <span className="ds-eyebrow">
                <span className="ds-num">§ 00</span>Engineering · Writing · Cooking
              </span>
              <h1
                className="ds-display"
                style={{ margin: "1rem 0 1.5rem", maxWidth: "14ch" }}
              >
                Nick<br />Karnik<span style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>.</span>
              </h1>
              <p className="ds-lede" style={{ margin: "0 0 var(--gap-3)", maxWidth: "44ch" }}>
                Nearly three decades of building software across search engines, disease models, data platforms, and AI tools. Serious about cooking, cocktails, travel, and building games with my three kids. Still figuring out what comes next and building it anyway.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "var(--gap-3)" }}>
                <a href="/blog" className="ds-btn">Read the writing →</a>
                <a href="/resume" className="ds-btn ds-btn-ghost">The Résumé</a>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div
                className="ds-img-slot"
                style={{ aspectRatio: "4/5", position: "relative" }}
                aria-label="Portrait"
              >
                <img
                  src="/assets/images/profile/nick-karnik.jpeg"
                  alt="Nick Karnik"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                />
              </div>
              <span style={{
                position: "absolute", top: -10, right: -10,
                background: "var(--paper)", padding: "0.35rem 0.6rem",
                border: "1px solid var(--ink)",
              }}>
                <SecondaryMark />
              </span>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section style={{
          margin: "var(--gap-4) 0",
          padding: "var(--gap-3) 0",
          borderTop: "1px solid var(--ink)",
          borderBottom: "1px solid var(--ink)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--gap-3)",
        }}>
          {STATS.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                borderLeft: i ? "1px solid var(--rule)" : "none",
                paddingLeft: i ? "1rem" : 0,
              }}
            >
              <span style={{
                fontFamily: "var(--serif)",
                fontSize: "2.25rem",
                letterSpacing: "-0.02em",
                color: "var(--accent)",
              }}>
                {s.n}
              </span>
              <span
                className="ds-mono"
                style={{ color: "var(--ink-2)", textTransform: "uppercase", letterSpacing: "0.16em", fontSize: "0.72rem" }}
              >
                {s.l}
              </span>
            </div>
          ))}
        </section>

        {/* Recent writing */}
        <section style={{ padding: "var(--gap-5) 0" }}>
          <SectionTag
            num="01"
            label="Recent writing"
            right={<a href="/blog">All essays →</a>}
          />
          {top3.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap-4)" }}>
              {top3.map((p) => (
                <article key={p.id} style={{ borderTop: "1px solid var(--rule)", paddingTop: "1rem" }}>
                  <span className="ds-dateline">{formatDate(p.date)}{p.category ? ` · ${p.category}` : ""}</span>
                  <h3 className="ds-h3" style={{ margin: "0.6rem 0 0.5rem" }}>
                    <a
                      href={`/blog/${p.slug}`}
                      style={{ color: "inherit", textDecoration: "none", borderBottom: "none" }}
                    >
                      {p.title}
                    </a>
                  </h3>
                  <p style={{ color: "var(--ink-2)", fontSize: "0.98rem", margin: 0 }}>{p.excerpt}</p>
                </article>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--ink-2)" }}>No posts yet.</p>
          )}
        </section>

        {/* Work */}
        <section style={{ padding: "var(--gap-4) 0 var(--gap-5)" }}>
          <SectionTag num="02" label="What I work on" />
          <div className="ds-with-margin">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "var(--gap-3)" }}>
              {WORK_BLOCKS.map((b, i) => (
                <div key={i}>
                  <span className="ds-mono" style={{ color: "var(--accent)" }}>0{i + 1} —</span>
                  <h3 className="ds-h3" style={{ margin: "0.4rem 0 0.6rem" }}>{b.t}</h3>
                  <p style={{ color: "var(--ink-2)", fontSize: "0.95rem", margin: 0 }}>{b.d}</p>
                </div>
              ))}
            </div>
            <aside className="ds-margin-note">
              Advisory work runs through Plutonic Consulting: strategy, team review, and technical due diligence. Limited slots each quarter.
            </aside>
          </div>
        </section>

        {/* Kitchen teaser */}
        <section style={{ padding: "var(--gap-5) 0", borderTop: "2px solid var(--ink)" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)",
            gap: "var(--gap-5)",
            alignItems: "end",
          }}>
            <div
              className="ds-img-slot"
              style={{ aspectRatio: "5/4" }}
              aria-label="The Kitchen"
            />
            <div>
              <span className="ds-eyebrow">
                <span className="ds-num">§ 03</span>The Kitchen
              </span>
              <h2 className="ds-h1" style={{ margin: "0.6rem 0 1rem", maxWidth: "14ch" }}>
                The Kitchen.
              </h2>
              <p className="ds-lede" style={{ margin: "0 0 1.25rem", maxWidth: "44ch" }}>
                Recipes for cooking, baking, and cocktails. Versioned, with notes on what changed between iterations.
              </p>
              <a href="/kitchen" className="ds-btn ds-btn-ghost">Browse recipes →</a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
