import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";

const ROLES = [
  {
    co: "PitchBook",
    role: "Lead Software Engineer",
    years: "Mar 2026 — Present",
    loc: "Seattle, WA",
    bullets: [
      "Building data and search infrastructure for the financial intelligence platform.",
    ],
  },
  {
    co: "Google",
    role: "Engineering Manager, Gemini Code Assist",
    years: "May 2022 — Apr 2025",
    loc: "Mountain View, CA",
    bullets: [
      "Led engineering for AI coding assistant shipped to millions of developers across VS Code and IntelliJ.",
      "Drove technical direction for code-aware retrieval, model evaluation, and IDE integration.",
      "Scaled LLM completion acceptance and product adoption across the developer surface.",
    ],
  },
  {
    co: "Salesforce",
    role: "Senior Engineering Manager",
    years: "Apr 2020 — Apr 2022",
    loc: "Bellevue, WA",
    bullets: [
      "Continued connector platform leadership post-Tableau acquisition.",
      "Delivered REST and native Salesforce connectors.",
      "Managed large engineering teams and vendor partnerships.",
    ],
  },
  {
    co: "Microsoft",
    role: "Principal Software Engineer, Visual Studio",
    years: "2017 — 2022",
    loc: "Redmond, WA",
    bullets: [
      "Shipped the diagnostic-tools subsystem used in every Visual Studio installation.",
      "Led migration of a long-lived codebase to a modular plug-in architecture.",
      "Drove an internal community of practice around developer experience and reliability.",
    ],
  },
  {
    co: "Earlier",
    role: "Founder · Consultant · Engineer",
    years: "2000 — 2017",
    loc: "Various",
    bullets: [
      "Founded Plutonic Consulting; advised startups on architecture, hiring, and scaling teams.",
      "Worked across distributed systems, web frameworks, and infrastructure at small and mid-size companies.",
      "Started in C++ on Unix terminals at companies that no longer exist.",
    ],
  },
];

const SKILLS = [
  ["Distributed systems", "Backend infra, AI surfaces, developer platforms"],
  ["Org design", "Scaling teams 1 → 18 · hiring loops · performance"],
  ["Technical strategy", "Roadmaps, executive narrative, board-level memos"],
  ["AI / ML productization", "Eval, retrieval, model-aware tooling"],
  ["Developer experience", "Tools, docs, internal platforms"],
  ["Crisis mode", "On-call, incident review, post-mortems"],
];

export function ResumePagePanda() {
  return (
    <>
      <Helmet>
        <title>Nick Karnik | Résumé</title>
        <meta name="description" content="Software engineer and engineering leader with 25 years across Google, Microsoft, Salesforce, and startups." />
        <link rel="canonical" href="https://nick.karnik.io/resume" />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-3)" }}>
          <SectionTag
            num="01"
            label="Résumé"
            right={<a href="/assets/documents/resume-nick-karnik.pdf" target="_blank" rel="noopener">Download PDF →</a>}
          />
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "var(--gap-3)", alignItems: "end" }}>
            <div>
              <h1 className="ds-display" style={{ margin: 0 }}>Nick Karnik</h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="ds-mono" style={{ color: "var(--ink-2)" }}>nick@karnik.io</div>
              <div className="ds-mono" style={{ color: "var(--ink-3)" }}>Bellevue, WA</div>
            </div>
          </div>
        </section>

        <section style={{ padding: "var(--gap-3) 0 var(--gap-5)", borderTop: "2px solid var(--ink)" }}>
          <h2 className="ds-eyebrow" style={{ display: "block", marginBottom: "var(--gap-3)" }}>
            <span className="ds-num">§ 02</span>Experience
          </h2>
          {ROLES.map((r, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "10rem 1fr",
              gap: "var(--gap-3)",
              padding: "var(--gap-3) 0",
              borderTop: "1px solid var(--rule)",
            }}>
              <div>
                <div className="ds-mono" style={{ color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem" }}>{r.years}</div>
                <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", letterSpacing: "-0.01em", marginTop: "0.3rem" }}>{r.co}</div>
                <div className="ds-mono" style={{ color: "var(--ink-3)", fontSize: "0.72rem", marginTop: "0.3rem" }}>{r.loc}</div>
              </div>
              <div>
                <h3 className="ds-h3" style={{ margin: "0 0 0.75rem" }}>{r.role}</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {r.bullets.map((b, j) => (
                    <li key={j} style={{ paddingLeft: "1.25rem", position: "relative", marginBottom: "0.6rem", color: "var(--ink-2)", fontSize: "1.02rem", lineHeight: 1.55 }}>
                      <span style={{ position: "absolute", left: 0, top: "0.55em", width: "0.6rem", height: "1px", background: "var(--accent)" }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        <section style={{ padding: "0 0 var(--gap-5)" }}>
          <h2 className="ds-eyebrow" style={{ display: "block", marginBottom: "var(--gap-3)" }}>
            <span className="ds-num">§ 03</span>What I bring
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap-3)", borderTop: "1px solid var(--rule)", paddingTop: "var(--gap-3)" }}>
            {SKILLS.map(([t, d], i) => (
              <div key={i}>
                <div className="ds-mono" style={{ color: "var(--accent)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>0{i + 1}</div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.125rem", margin: "0.4rem 0 0.4rem", letterSpacing: "-0.005em" }}>{t}</h3>
                <p style={{ margin: 0, color: "var(--ink-2)", fontSize: "0.95rem" }}>{d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
