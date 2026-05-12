import React, { useState } from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";

const CATS = ["All", "Cooking", "Baking", "Cocktails"] as const;

export function KitchenPagePanda() {
  const [cat, setCat] = useState<string>("All");

  return (
    <>
      <Helmet>
        <title>Nick Karnik | The Kitchen</title>
        <meta name="description" content="Recipes for cooking, baking, and cocktails. Versioned, with notes on what changed between iterations." />
        <link rel="canonical" href="https://nick.karnik.io/kitchen" />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
          <SectionTag num="01" label="The Kitchen" right="A weekend logbook" />
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
            gap: "var(--gap-5)",
            alignItems: "end",
          }}>
            <div>
              <h1 className="ds-display" style={{ margin: "0 0 1rem", maxWidth: "12ch" }}>
                The <em>Kitchen</em><span style={{ color: "var(--accent)" }}>.</span>
              </h1>
              <p className="ds-lede" style={{ margin: 0, maxWidth: "44ch" }}>
                A logbook of dinners, bread, and cocktails. Written like a software engineer would — measurements, ratios, and notes from each iteration.
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
            {CATS.map(c => (
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
            Coming soon.
          </p>
        </section>
      </div>
    </>
  );
}
