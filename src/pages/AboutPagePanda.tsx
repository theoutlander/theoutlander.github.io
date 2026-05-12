import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";

type AboutData = {
  title: string;
  html: string;
};

type AboutPageProps = {
  aboutData: AboutData;
};

export function AboutPagePanda({ aboutData }: AboutPageProps) {
  return (
    <>
      <Helmet>
        <title>Nick Karnik | About</title>
        <meta name="description" content="Engineering leader. Writer. Twenty-five years building software across search, AI, and data." />
        <link rel="canonical" href="https://nick.karnik.io/about" />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
          <SectionTag num="01" label="About" right="Bellevue, WA" />
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1.5fr)",
            gap: "var(--gap-5)",
            alignItems: "start",
          }}>
            <div>
              <div
                className="ds-img-slot"
                style={{ aspectRatio: "4/5" }}
                aria-label="Portrait"
              >
                <img
                  src="/assets/images/profile/nick-karnik.jpeg"
                  alt="Nick Karnik"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                />
              </div>
              <div style={{ marginTop: "1rem" }}>
                <span className="ds-dateline">Currently · May 2026</span>
                <p style={{ margin: "0.5rem 0 0", color: "var(--ink-2)", fontSize: "0.98rem" }}>
                  Lead Software Engineer at PitchBook. Writing about engineering and what I'm learning. Cooking, baking, and experimenting in the kitchen.
                </p>
              </div>

              {/* Featured work */}
              <div style={{ marginTop: "var(--gap-4)", borderTop: "1px solid var(--rule)", paddingTop: "1rem" }}>
                <span className="ds-dateline" style={{ display: "block", marginBottom: "0.75rem" }}>Featured Work</span>
                <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", margin: "0 0 0.75rem" }}>
                  Geospatial visualization of epidemiological modeling, featured in this TED Talk by Bill Gates.
                </p>
                <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--paper-2)", border: "1px solid var(--rule)" }}>
                  <iframe
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    src="https://www.youtube.com/embed/6Af6b_wyiwI"
                    title="TED Talk featuring Institute for Disease Modeling software"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              <div style={{ marginTop: "var(--gap-3)", borderTop: "1px solid var(--rule)", paddingTop: "1rem" }}>
                <span className="ds-dateline" style={{ display: "block", marginBottom: "0.75rem" }}>Patents</span>
                <a
                  href="https://patents.google.com/patent/US8918354B2/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.95rem", color: "var(--ink)", display: "block", marginBottom: "0.25rem" }}
                >
                  US 8,918,354 — Intelligent intent detection from social network messages
                </a>
                <span className="ds-mono" style={{ color: "var(--ink-3)" }}>Granted 2014 · Active until 2032</span>
              </div>
            </div>

            <div>
              <h1 className="ds-h1" style={{ margin: "0 0 1rem" }}>About</h1>
              {aboutData.html ? (
                <div
                  className="ds-prose"
                  style={{ maxWidth: "none" }}
                  dangerouslySetInnerHTML={{ __html: aboutData.html }}
                />
              ) : (
                <div className="ds-prose" style={{ maxWidth: "none" }}>
                  <p>
                    I'm Nick Karnik. Lead Software Engineer at PitchBook. Previously Google, Microsoft, Tableau, Salesforce. Twenty-five years building software.
                  </p>
                  <p>
                    This site is where I write down what I'm learning. The essays mostly cover engineering, leadership, and the practice of shipping software. The résumé is here too, formatted to read rather than scan. Recipes live in The Kitchen — a side project I treat with the same rigor as my day job.
                  </p>
                  <h2>What I work on</h2>
                  <p>
                    Developer tooling, data platforms, and software at scale. Advisory work runs through Plutonic Consulting — strategy, team review, and technical due diligence.
                  </p>
                  <h2>Outside of work</h2>
                  <p>
                    Cooking, mostly. I keep a versioned recipe log because I think the discipline of writing things down applies as well to dinner as it does to software.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
