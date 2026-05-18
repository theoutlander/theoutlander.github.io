import React, { useState } from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { COPY } from "../data/site-copy";
import { META, PERSON } from "../data/person";

export function KitchenPagePanda() {
  const kitchen = COPY.kitchen;
  const [cat, setCat] = useState<string>(kitchen.categories[0]);

  return (
    <>
      <Helmet>
        <title>{META.kitchen.title}</title>
        <meta name="description" content={META.kitchen.description} />
        <link rel="canonical" href={`${PERSON.siteUrl}/kitchen`} />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
          <SectionTag num={kitchen.sectionNum} label={kitchen.sectionLabel} right={kitchen.sectionRight} />
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: "var(--gap-5)",
            alignItems: "end",
          }}>
            <div>
              <h1 className="ds-display" style={{ margin: "0 0 1rem", maxWidth: "12ch" }}>
                {kitchen.headlinePrefix}<em>{kitchen.headlineEmphasis}</em>
                <span style={{ color: "var(--accent)" }}>.</span>
              </h1>
              <p className="ds-lede" style={{ margin: 0, maxWidth: "44ch" }}>
                {kitchen.lede}
              </p>
            </div>
            <div
              className="ds-img-slot"
              style={{ aspectRatio: "5/4" }}
              aria-label="Mise en place"
            />
          </div>
        </section>

        <section style={{ padding: "var(--gap-3) 0 var(--gap-2)" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {kitchen.categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`ds-tag${cat === c ? " active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <section style={{ padding: "var(--gap-3) 0 var(--gap-5)" }}>
          <p className="ds-mono" style={{ color: "var(--ink-3)", fontSize: "0.9rem" }}>
            {kitchen.comingSoon}
          </p>
        </section>
      </div>
    </>
  );
}
