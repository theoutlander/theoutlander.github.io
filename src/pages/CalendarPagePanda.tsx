import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { SectionTag } from "../components/design/SectionTag";

const CALENDAR_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ285Y0xFrPqJ1ktb3KiZrnmDJxP0d6BUicUs93HTXWCtOrnZgZAe7pur4_JFNdyeIS5GEgynDhc?gv=true";

export function CalendarPagePanda() {
  const [loaded, setLoaded] = React.useState(false);

  return (
    <>
      <Helmet>
        <title>Schedule time with Nick Karnik</title>
        <meta
          name="description"
          content="Book time with Nick directly via Google Calendar appointments."
        />
        <link rel="canonical" href="https://nick.karnik.io/calendar" />
        <link rel="dns-prefetch" href="https://calendar.google.com" />
        <link rel="preconnect" href="https://calendar.google.com" />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://ssl.gstatic.com" />
        <link rel="preconnect" href="https://ssl.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      <div className="ds-page ds-page-fade">
        <section style={{ padding: "var(--gap-5) 0 var(--gap-3)" }}>
          <SectionTag num="01" label="Schedule" right="via Google Calendar" />
          <h1 className="ds-h1" style={{ margin: "0 0 1rem", maxWidth: "20ch" }}>
            Schedule a call
          </h1>
          <p className="ds-lede" style={{ margin: 0, maxWidth: "46ch" }}>
            Pick a time that works for you. Prefer a new tab?{" "}
            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--ink)", borderBottom: "1px solid var(--rule)", textDecoration: "none" }}
            >
              Open in Google Calendar
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
                Loading calendar…
              </div>
            )}
            <iframe
              title="Schedule time with Nick Karnik"
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
