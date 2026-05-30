import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { META, PERSON } from "../data/person";
import { COPY } from "../data/site-copy";
import { analytics } from "../lib/analytics";
import {
  EDUCATION,
  PATENTS,
  PROJECTS,
  ROLES,
  SKILLS,
  SUMMARY,
  withInlineLinks,
  withProjectInlineLinks,
} from "../data/resume";

const datelineStyle: React.CSSProperties = {
  color: "var(--ink-3)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
};

const tagPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.15rem 0.6rem",
  border: "1px solid var(--rule)",
  borderRadius: "999px",
  fontSize: "0.72rem",
  color: "var(--ink-2)",
  fontFamily: "var(--mono)",
  letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};

const accentTickStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: "0.55em",
  width: "0.6rem",
  height: "1px",
  background: "var(--accent)",
};

const companyNameStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.25rem",
  letterSpacing: "-0.01em",
  marginTop: "0.3rem",
};

const inlineLinkProseStyle: React.CSSProperties = {
  color: "var(--ink-2)",
  fontSize: "1.02rem",
  lineHeight: 1.65,
  margin: "0.5rem 0 0.75rem",
};

function TagRow({ tags }: { tags: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem" }}>
      {tags.map((t) => (
        <span key={t} style={tagPillStyle}>
          {t}
        </span>
      ))}
    </div>
  );
}

export function ResumePagePanda() {
  const resume = COPY.resume;
  const sections = resume.sections;

  return (
    <>
      <Helmet>
        <title>{META.resume.title}</title>
        <meta name="description" content={META.resume.description} />
        <link rel="canonical" href={`${PERSON.siteUrl}/resume`} />
      </Helmet>

      <div className="ds-page ds-page-fade">
        {/* Header */}
        <section
          style={{
            padding: "var(--gap-5) 0 var(--gap-3)",
            borderBottom: "1px solid var(--ink)",
          }}
        >
          <SectionTag
            num={resume.sectionNum}
            label={resume.sectionLabel}
            right={
              <a
                href={resume.pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.ctaClick("download_resume_pdf", "resume_header")}
              >
                {resume.pdfLink}
              </a>
            }
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) auto",
              gap: "var(--gap-3)",
              alignItems: "end",
            }}
          >
            <div>
              <h1 className="ds-display" style={{ margin: "0 0 0.5rem", letterSpacing: "-0.025em" }}>
                {PERSON.name}
              </h1>
              <p
                className="ds-mono"
                style={{
                  margin: 0,
                  color: "var(--ink-2)",
                  fontSize: "0.85rem",
                  letterSpacing: "0.04em",
                }}
              >
                {resume.subtitle}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="ds-mono" style={{ color: "var(--ink-2)" }}>
                <a
                  href={`mailto:${PERSON.email}`}
                  style={{ color: "inherit", textDecoration: "none", borderBottom: "1px solid var(--rule)" }}
                >
                  {PERSON.email}
                </a>
              </div>
              <div className="ds-mono" style={{ color: "var(--ink-3)" }}>
                {PERSON.location}
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section
          style={{
            padding: "var(--gap-3) 0 var(--gap-4)",
            borderTop: "2px solid var(--ink)",
          }}
        >
          <h2 className="ds-eyebrow" style={{ display: "block", marginBottom: "var(--gap-2)" }}>
            <span className="ds-num">§ 02</span>{sections.summary}
          </h2>
          <p
            className="ds-lede"
            style={{ margin: 0, maxWidth: "70ch", color: "var(--ink-2)" }}
          >
            {SUMMARY}
          </p>
        </section>

        {/* Experience */}
        <section style={{ padding: "var(--gap-3) 0 var(--gap-5)" }}>
          <h2 className="ds-eyebrow" style={{ display: "block", marginBottom: "var(--gap-3)" }}>
            <span className="ds-num">§ 03</span>{sections.experience}
          </h2>
          {ROLES.map((r, i) => (
            <div
              key={`${r.co}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: "12rem 1fr",
                gap: "var(--gap-3)",
                padding: "var(--gap-3) 0",
                borderTop: "1px solid var(--rule)",
              }}
            >
              <div>
                <div className="ds-mono" style={datelineStyle}>
                  {r.dates}
                  {r.current ? `  · ${resume.currentLabel}` : ""}
                </div>
                <div style={companyNameStyle}>{r.co}</div>
              </div>
              <div style={{ paddingLeft: "1.25rem", position: "relative" }}>
                <span style={accentTickStyle} />
                <h3 className="ds-h3" style={{ margin: "0 0 0.5rem" }}>
                  {r.role}
                </h3>
                <p
                  style={inlineLinkProseStyle}
                  dangerouslySetInnerHTML={{
                    __html: withInlineLinks(r.blurb, r.co),
                  }}
                />
                <TagRow tags={r.tags} />
              </div>
            </div>
          ))}
        </section>

        {/* Notable Projects */}
        <section
          style={{
            padding: "var(--gap-3) 0 var(--gap-5)",
            borderTop: "2px solid var(--ink)",
          }}
        >
          <h2 className="ds-eyebrow" style={{ display: "block", marginBottom: "var(--gap-3)" }}>
            <span className="ds-num">§ 04</span>{sections.projects}
          </h2>
          {PROJECTS.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: "12rem 1fr",
                gap: "var(--gap-3)",
                padding: "var(--gap-3) 0",
                borderTop: "1px solid var(--rule)",
              }}
            >
              <div>
                <div className="ds-mono" style={datelineStyle}>
                  {p.dates}
                </div>
                <div
                  style={{
                    ...companyNameStyle,
                    fontSize: "1.05rem",
                    color: "var(--ink-3)",
                  }}
                >
                  {p.company}
                </div>
              </div>
              <div style={{ paddingLeft: "1.25rem", position: "relative" }}>
                <span style={accentTickStyle} />
                <h3 className="ds-h3" style={{ margin: "0 0 0.5rem" }}>
                  {p.href ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "underline", borderBottom: "none" }}
                    >
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </h3>
                <p
                  style={inlineLinkProseStyle}
                  dangerouslySetInnerHTML={{
                    __html: withProjectInlineLinks(p.description),
                  }}
                />
                <TagRow tags={p.tags} />
              </div>
            </div>
          ))}
        </section>

        {/* Education + Patents + Skills */}
        <section
          style={{
            padding: "var(--gap-3) 0 var(--gap-5)",
            borderTop: "2px solid var(--ink)",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr)",
            gap: "var(--gap-4)",
          }}
        >
          <div>
            <h2 className="ds-eyebrow" style={{ display: "block", marginBottom: "var(--gap-2)" }}>
              <span className="ds-num">§ 05</span>{sections.education}
            </h2>
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.125rem",
                margin: "0 0 0.25rem",
                letterSpacing: "-0.005em",
              }}
            >
              <a
                href={EDUCATION.institutionHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none", borderBottom: "1px solid var(--rule)" }}
              >
                {EDUCATION.institution}
              </a>
            </h3>
            <p style={{ margin: "0 0 0.25rem", color: "var(--ink-2)", fontSize: "0.95rem" }}>
              {EDUCATION.degree}
            </p>
            <p style={{ margin: "0 0 0.25rem", color: "var(--ink-3)", fontSize: "0.9rem" }}>
              {EDUCATION.location}
            </p>
            {EDUCATION.notes ? (
              <p style={{ margin: "0.4rem 0 0", color: "var(--ink-3)", fontSize: "0.9rem" }}>
                {EDUCATION.notes}
              </p>
            ) : null}
          </div>

          <div>
            <h2 className="ds-eyebrow" style={{ display: "block", marginBottom: "var(--gap-2)" }}>
              <span className="ds-num">§ 06</span>{sections.patents}
            </h2>
            {PATENTS.map((p) => (
              <div key={p.id} style={{ marginBottom: "0.75rem" }}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    fontFamily: "var(--serif)",
                    fontSize: "1.05rem",
                    color: "var(--ink)",
                    textDecoration: "none",
                    borderBottom: "1px solid var(--rule)",
                    paddingBottom: "0.2rem",
                  }}
                >
                  {p.id}
                </a>
                <p style={{ margin: "0.35rem 0 0", color: "var(--ink-2)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                  {p.title}
                </p>
                <span className="ds-mono" style={{ color: "var(--ink-3)", fontSize: "0.72rem", marginTop: "0.35rem", display: "block" }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>

          <div>
            <h2 className="ds-eyebrow" style={{ display: "block", marginBottom: "var(--gap-2)" }}>
              <span className="ds-num">§ 07</span>{sections.skills}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {Object.entries(SKILLS).map(([group, items]) => (
                <div key={group}>
                  <div
                    className="ds-mono"
                    style={{
                      color: "var(--accent)",
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: "0.4rem",
                    }}
                  >
                    {group}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {items.map((it) => (
                      <span key={it} style={tagPillStyle}>
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
