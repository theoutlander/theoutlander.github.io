import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { Monogram, SecondaryMark, TinyMark, Wordmark } from "../components/design/Marks";
import { COPY } from "../data/site-copy";
import { PERSON } from "../data/person";

const PALETTE = [
	["Paper", "var(--paper)", "—"],
	["Sand", "var(--paper-2)", "Section ground"],
	["Ink", "var(--ink)", "Type · rules"],
	["Stone", "var(--ink-2)", "Secondary"],
	["Oxblood", "var(--accent)", "Accent only"],
] as const;

export function BrandingPagePanda() {
	const b = COPY.branding;

	return (
		<>
			<Helmet>
				<title>Nick Karnik | Mark</title>
				<meta name="description" content={b.lede} />
				<link rel="canonical" href={`${PERSON.siteUrl}/design`} />
			</Helmet>

			<div className="ds-page ds-page-fade">
				<section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
					<SectionTag num={b.sectionNum} label={b.sectionLabel} right={b.sectionRight} />
					<h1 className="ds-h1" style={{ margin: "0 0 1rem", maxWidth: "18ch" }}>
						{b.headline}
						<span style={{ color: "var(--accent)" }}>{b.headlineSuffix}</span>
						{b.headlineEnd}
					</h1>
					<p className="ds-lede" style={{ maxWidth: "44ch", margin: 0 }}>
						{b.lede}
					</p>
				</section>

				<section style={{ padding: "var(--gap-4) 0", borderTop: "1px solid var(--ink)" }}>
					<div className="ds-with-margin">
						<div>
							<span className="ds-eyebrow">
								<span className="ds-num">01</span>Wordmark · primary
							</span>
							<div className="ds-brand-specimen">
								<Wordmark variant="primary" size={88} />
							</div>
						</div>
						<aside className="ds-margin-note">
							<span className="ds-small-caps" style={{ color: "var(--ink-2)" }}>Use.</span>
							<p style={{ margin: "0.5rem 0 0" }}>
								The italic Newsreader wordmark is the default. Used in masthead, footer, and the open-graph card.
							</p>
						</aside>
					</div>
					<div className="ds-brand-variants">
						<div className="ds-brand-specimen ds-brand-specimen-sm">
							<span className="ds-dateline" style={{ display: "block", marginBottom: "1rem" }}>Upright</span>
							<Wordmark variant="upright" size={48} />
						</div>
						<div className="ds-brand-specimen ds-brand-specimen-sm">
							<span className="ds-dateline" style={{ display: "block", marginBottom: "1rem" }}>Stacked</span>
							<Wordmark variant="stacked" size={36} />
						</div>
					</div>
				</section>

				<section style={{ padding: "var(--gap-4) 0", borderTop: "1px solid var(--rule)" }}>
					<span className="ds-eyebrow">
						<span className="ds-num">02</span>Monogram · nk
					</span>
					<div className="ds-monogram-grid">
						<div className="ds-brand-specimen ds-brand-specimen-sm">
							<Monogram size={120} />
						</div>
						<div className="ds-brand-specimen ds-brand-specimen-sm" style={{ background: "var(--ink)" }}>
							<Monogram size={120} inverted />
						</div>
						<div className="ds-brand-specimen ds-brand-specimen-sm">
							<Monogram size={60} />
						</div>
						<div className="ds-brand-specimen ds-brand-specimen-sm">
							<TinyMark size={48} />
						</div>
					</div>
				</section>

				<section style={{ padding: "var(--gap-4) 0", borderTop: "1px solid var(--rule)" }}>
					<span className="ds-eyebrow">
						<span className="ds-num">03</span>Secondary mark
					</span>
					<div className="ds-brand-specimen" style={{ marginTop: "var(--gap-3)" }}>
						<SecondaryMark size={28} />
					</div>
				</section>

				<section style={{ padding: "var(--gap-4) 0", borderTop: "1px solid var(--rule)" }}>
					<span className="ds-eyebrow">
						<span className="ds-num">04</span>Palette
					</span>
					<div className="ds-palette-grid">
						{PALETTE.map(([name, bg, use]) => (
							<div key={name}>
								<div className="ds-palette-swatch" style={{ background: bg }} />
								<div className="ds-mono ds-palette-name">{name}</div>
								<div className="ds-mono ds-palette-use">{use}</div>
							</div>
						))}
					</div>
				</section>

				<section style={{ padding: "var(--gap-4) 0 var(--gap-5)", borderTop: "1px solid var(--rule)" }}>
					<span className="ds-eyebrow">
						<span className="ds-num">05</span>Typography
					</span>
					<div className="ds-brand-variants">
						<div className="ds-brand-specimen ds-brand-specimen-sm">
							<div className="ds-mono" style={{ color: "var(--accent)", fontSize: "0.72rem", letterSpacing: "0.14em" }}>
								SERIF · NEWSREADER
							</div>
							<div style={{ fontFamily: "var(--serif)", fontSize: "3.5rem", letterSpacing: "-0.02em", lineHeight: 1, marginTop: "0.5rem" }}>Aa</div>
							<div className="ds-mono" style={{ color: "var(--ink-3)", fontSize: "0.7rem", marginTop: "1rem" }}>Display · body · italics</div>
						</div>
						<div className="ds-brand-specimen ds-brand-specimen-sm">
							<div className="ds-mono" style={{ color: "var(--accent)", fontSize: "0.72rem", letterSpacing: "0.14em" }}>
								MONO · JETBRAINS
							</div>
							<div style={{ fontFamily: "var(--mono)", fontSize: "3.5rem", letterSpacing: "-0.02em", lineHeight: 1, marginTop: "0.5rem" }}>Aa</div>
							<div className="ds-mono" style={{ color: "var(--ink-3)", fontSize: "0.7rem", marginTop: "1rem" }}>Marginalia · datelines · labels</div>
						</div>
					</div>
				</section>
			</div>
		</>
	);
}
