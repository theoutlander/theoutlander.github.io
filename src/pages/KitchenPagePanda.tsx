import React, { useState } from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";

const RECIPES = [
  { id: "r1", num: "01", title: "Short Rib Braise · Cocoa & Coffee", category: "Cooking", time: "4h 20m", dek: "A Sunday braise. Mostly oven, mostly forgiving." },
  { id: "r2", num: "02", title: "Country Loaf · 75% Hydration", category: "Baking", time: "36h", dek: "My weekly sourdough. Stable recipe, room for variations." },
  { id: "r3", num: "03", title: "Negroni Sbagliato", category: "Cocktails", time: "3m", dek: "Three ingredients. Built in the glass." },
  { id: "r4", num: "04", title: "Brown-Butter Chocolate Chip Cookies", category: "Baking", time: "1h 10m", dek: "Browned butter, flaky salt, overnight rest." },
  { id: "r5", num: "05", title: "Mushroom Pho", category: "Cooking", time: "2h 30m", dek: "Charred onion, dried shiitake, star anise. Vegetarian." },
  { id: "r6", num: "06", title: "House Old-Fashioned", category: "Cocktails", time: "5m", dek: "Rye, demerara, Angostura, orange peel." },
  { id: "r7", num: "07", title: "Olive Oil & Citrus Cake", category: "Baking", time: "1h 30m", dek: "One bowl. Keeps three days. Travels well." },
  { id: "r8", num: "08", title: "Weeknight Dal", category: "Cooking", time: "45m", dek: "Red lentils, tempered with mustard seed and curry leaves." },
];

const CATS = ["All", "Cooking", "Baking", "Cocktails"] as const;

export function KitchenPagePanda() {
  const [cat, setCat] = useState<string>("All");
  const list = cat === "All" ? RECIPES : RECIPES.filter(r => r.category === cat);

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap-4) var(--gap-3)" }}>
            {list.map((r) => (
              <div key={r.id} style={{ display: "block" }}>
                <div
                  className="ds-img-slot"
                  style={{ aspectRatio: "4/5" }}
                  aria-label={r.title.split(" ").slice(0, 2).join(" ")}
                />
                <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span className="ds-mono" style={{ color: "var(--accent)", fontSize: "0.72rem", letterSpacing: "0.14em" }}>N° {r.num}</span>
                  <span className="ds-mono" style={{ color: "var(--ink-3)", fontSize: "0.72rem", letterSpacing: "0.12em" }}>{r.category} · {r.time}</span>
                </div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.25rem", letterSpacing: "-0.01em", margin: "0.4rem 0 0.3rem", lineHeight: 1.2 }}>
                  {r.title}
                </h3>
                <p style={{ margin: 0, color: "var(--ink-2)", fontSize: "0.95rem", fontStyle: "italic" }}>{r.dek}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
