import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { SecondaryMark } from "../components/design/Marks";
import { CURRENTLY, META, PERSON, STATS } from "../data/person";
import { COPY } from "../data/site-copy";

export function AboutPagePanda() {
	const about = COPY.about;

	return (
		<>
			<Helmet>
				<title>{META.about.title}</title>
				<meta name="description" content={META.about.description} />
				<link rel="canonical" href={`${PERSON.siteUrl}/about`} />
			</Helmet>

			<div className="ds-page ds-page-fade">
				<section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
					<SectionTag num={about.sectionNum} label={about.sectionLabel} right={PERSON.location} />
					<div className="ds-about-grid">
						<div>
							<div className="ds-about-photo">
								<img
									src={PERSON.aboutImage}
									alt={PERSON.name}
									style={{
										position: "absolute",
										inset: 0,
										width: "100%",
										height: "100%",
										objectFit: "cover",
										objectPosition: "50% 10%",
										display: "block",
									}}
								/>
							</div>
							<div style={{ marginTop: "1rem" }}>
								<span className="ds-dateline">{about.currently}</span>
								<p style={{ margin: "0.5rem 0 0", color: "var(--ink-2)", fontSize: "0.98rem" }}>
									{about.currentlyNote}
								</p>
								<div style={{ marginTop: "1.25rem" }}>
									<SecondaryMark size={13} />
								</div>
							</div>
						</div>

						<div className="ds-prose" style={{ maxWidth: "none" }}>
							<h1 className="ds-h1" style={{ margin: "0 0 1rem", letterSpacing: "-0.02em" }}>
								{about.headline}
							</h1>
							<p>{about.bio1}</p>
							<p>{about.bio2}</p>
							<h2>{about.workHeading}</h2>
							<p>{about.workBody}</p>
							<h2>{about.outsideHeading}</h2>
							<p>{about.outsideBody}</p>
						</div>
					</div>
				</section>

				<section className="ds-stats-strip" style={{ margin: "0 0 var(--gap-4)" }}>
					{STATS.map((s, i) => (
						<div key={i} className="ds-stat" data-first={i === 0 || undefined}>
							<span className="ds-stat-num">{s.n}</span>
							<span className="ds-stat-label">{s.l}</span>
						</div>
					))}
				</section>
			</div>
		</>
	);
}
