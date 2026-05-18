import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";
import { META, PERSON } from "../data/person";
import { COPY } from "../data/site-copy";

const CALENDAR_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ285Y0xFrPqJ1ktb3KiZrnmDJxP0d6BUicUs93HTXWCtOrnZgZAe7pur4_JFNdyeIS5GEgynDhc?gv=true";

export function CalendarPagePanda() {
  const [loaded, setLoaded] = React.useState(false);
  const calendar = COPY.calendar;

  return (
    <>
      <Helmet>
        <title>{META.calendar.title}</title>
        <meta name="description" content={META.calendar.description} />
        <link rel="canonical" href={`${PERSON.siteUrl}/calendar`} />
        <link rel="dns-prefetch" href="https://calendar.google.com" />
        <link rel="preconnect" href="https://calendar.google.com" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://ssl.gstatic.com" />
        <link rel="preconnect" href="https://ssl.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-3)" }}>
          <SectionTag num={calendar.sectionNum} label={calendar.sectionLabel} right={calendar.sectionRight} />
          <h1 className="ds-h1" style={{ margin: "0 0 1rem", maxWidth: "20ch" }}>
            {calendar.headline}
          </h1>
          <p className="ds-lede" style={{ margin: 0, maxWidth: "46ch" }}>
            {calendar.ledePrefix}{" "}
            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--ink)", borderBottom: "1px solid var(--rule)", textDecoration: "none" }}
            >
              {calendar.ledeLink}
            </a>
            .
          </p>
        </section>

        <section style={{ padding: "var(--gap-3) 0 var(--gap-5)" }}>
          <div
            style={{
              position: "relative",
              paddingTop: "62.5%",
              border: "1px solid var(--rule)",
              background: "var(--paper-2)",
            }}
          >
            {!loaded && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ink-2)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.85rem",
                  letterSpacing: "0.05em",
                }}
              >
                {calendar.loading}
              </div>
            )}
            <iframe
              title={calendar.iframeTitle}
              src={CALENDAR_URL}
              loading="lazy"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
                background: "transparent",
              }}
              frameBorder={0}
              allow="clipboard-write;"
              onLoad={() => setLoaded(true)}
            />
          </div>
        </section>
      </div>
    </>
  );
}
