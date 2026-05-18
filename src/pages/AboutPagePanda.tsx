import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { ABOUT_SHORT, ABOUT_SITE_DESCRIPTION, ABOUT_WORK_DESCRIPTION, ABOUT_OUTSIDE_WORK, ADVISORY_BLURB, CURRENTLY, META, PERSON } from "../data/person";
import { COPY } from "../data/site-copy";

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
        <meta name="description" content={META.about.description} />
        <link rel="canonical" href={`${PERSON.siteUrl}/about`} />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
          <SectionTag num={COPY.about.sectionNum} label={COPY.about.sectionLabel} right={PERSON.location} />
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
                <span className="ds-dateline">{CURRENTLY.label}</span>
                <p style={{ margin: "0.5rem 0 0", color: "var(--ink-2)", fontSize: "0.98rem" }}>
                  {CURRENTLY.description}
                </p>
              </div>

              {/* Featured work */}
              <div style={{ marginTop: "var(--gap-4)", borderTop: "1px solid var(--rule)", paddingTop: "1rem" }}>
                <span className="ds-dateline" style={{ display: "block", marginBottom: "0.75rem" }}>{COPY.about.featuredWorkLabel}</span>
                <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", margin: "0 0 0.75rem" }}>
                  {COPY.about.featuredWorkBody}
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
                <span className="ds-dateline" style={{ display: "block", marginBottom: "0.75rem" }}>{COPY.about.patentsLabel}</span>
                <a
                  href="https://patents.google.com/patent/US8918354B2/en"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.95rem", color: "var(--ink)", display: "block", marginBottom: "0.25rem" }}
                >
                  {COPY.about.patentLink}
                </a>
                <span className="ds-mono" style={{ color: "var(--ink-3)" }}>{COPY.about.patentStatus}</span>
              </div>
            </div>

            <div>
              <h1 className="ds-h1" style={{ margin: "0 0 1rem" }}>{COPY.about.headline}</h1>
              {aboutData.html ? (
                <div
                  className="ds-prose"
                  style={{ maxWidth: "none" }}
                  dangerouslySetInnerHTML={{ __html: aboutData.html }}
                />
              ) : (
                <div className="ds-prose" style={{ maxWidth: "none" }}>
                  <p>
                    {ABOUT_SHORT}
                  </p>
                  <p>{ABOUT_SITE_DESCRIPTION}</p>
                  <h2>{COPY.about.workHeading}</h2>
                  <p>{ABOUT_WORK_DESCRIPTION} {ADVISORY_BLURB}</p>
                  <h2>{COPY.about.outsideHeading}</h2>
                  <p>{ABOUT_OUTSIDE_WORK}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
