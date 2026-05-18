import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { SecondaryMark } from "../components/design/Marks";
import {
  ABOUT_OUTSIDE_WORK,
  ABOUT_SHORT,
  ABOUT_SITE_DESCRIPTION,
  ABOUT_WORK_DESCRIPTION,
  ADVISORY_BLURB,
  CURRENTLY,
  META,
  PERSON,
} from "../data/person";
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
        <title>{META.about.title}</title>
        <meta name="description" content={META.about.description} />
        <link rel="canonical" href={`${PERSON.siteUrl}/about`} />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-4)" }}>
          <SectionTag num={COPY.about.sectionNum} label={COPY.about.sectionLabel} right={PERSON.location} />
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
                <span className="ds-dateline">{CURRENTLY.label}</span>
                <p style={{ margin: "0.5rem 0 0", color: "var(--ink-2)", fontSize: "0.98rem" }}>
                  {CURRENTLY.description}
                </p>
                <div style={{ marginTop: "1.25rem" }}>
                  <SecondaryMark size={13} />
                </div>
              </div>
            </div>

            <div>
              <h1 className="ds-h1" style={{ margin: "0 0 1rem", letterSpacing: "-0.02em" }}>
                {COPY.about.headline}
              </h1>
              {aboutData.html ? (
                <div
                  className="ds-prose"
                  style={{ maxWidth: "none" }}
                  dangerouslySetInnerHTML={{ __html: aboutData.html }}
                />
              ) : (
                <div className="ds-prose" style={{ maxWidth: "none" }}>
                  <p>{ABOUT_SHORT}</p>
                  <p>{ABOUT_SITE_DESCRIPTION}</p>
                  <h2>{COPY.about.workHeading}</h2>
                  <p>
                    {ABOUT_WORK_DESCRIPTION} {ADVISORY_BLURB}
                  </p>
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
