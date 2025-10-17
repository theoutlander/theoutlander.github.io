import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { css } from "../../styled-system/css/index.mjs";
import { container } from "../../styled-system/patterns/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import SkipLink from "../components/SkipLink";

export function CalendarPagePanda() {
    const calendarUrl =
        "https://calendar.google.com/calendar/appointments/schedules/AcZssZ285Y0xFrPqJ1ktb3KiZrnmDJxP0d6BUicUs93HTXWCtOrnZgZAe7pur4_JFNdyeIS5GEgynDhc?gv=true";
    const [loaded, setLoaded] = React.useState(false);

    return (
        <div
            className={css({
                bg: "gray.50",
                minH: "100vh",
                width: "100%",
                overflowX: "hidden",
            })}
        >
            <Helmet>
                <title>Schedule time with Nick Karnik</title>
                <meta
                    name="description"
                    content="Book time with Nick directly via Google Calendar appointments."
                />
                <link rel="canonical" href="https://nick.karnik.io/calendar" />
                {/* Help the browser warm up connections to Google's embed hosts */}
                <link rel="dns-prefetch" href="https://calendar.google.com" />
                <link rel="preconnect" href="https://calendar.google.com" />
                <link rel="dns-prefetch" href="https://accounts.google.com" />
                <link rel="preconnect" href="https://accounts.google.com" />
                <link rel="dns-prefetch" href="https://ssl.gstatic.com" />
                <link rel="preconnect" href="https://ssl.gstatic.com" crossOrigin="anonymous" />
            </Helmet>
            <SkipLink />
            <HeaderSSR />
            <main
                id="main-content"
                className={container({ maxW: "6xl", mx: "auto", px: { base: 4, md: 6 }, py: 8 })}
            >
                <h1
                    className={css({
                        fontSize: { base: "2xl", md: "3xl" },
                        fontWeight: "bold",
                        color: "gray.800",
                        mb: 3,
                    })}
                >
                    Schedule a call
                </h1>
                <p className={css({ color: "gray.600", mb: 4 })}>
                    Pick a time that works for you. Prefer a new tab? {" "}
                    <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={css({ color: "blue.600", textDecoration: "underline", _hover: { color: "blue.700", textDecoration: "none" } })}>
                        Open in Google Calendar
                    </a>
                    .
                </p>

                <div className={css({ position: "relative", pt: "62.5%", mb: 6 })}>
                    {!loaded && (
                        <div
                            className={css({
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bg: "gray.100",
                                color: "gray.600",
                                borderRadius: "lg",
                                fontSize: "sm",
                            })}
                        >
                            Loading calendar…
                        </div>
                    )}
                    <iframe
                        title="Schedule time with Nick Karnik"
                        src={calendarUrl}
                        loading="lazy"
                        className={css({ position: "absolute", inset: 0, w: "100%", h: "100%", border: 0, borderRadius: "lg", boxShadow: "sm", bg: "white" })}
                        frameBorder={0}
                        allow="clipboard-write;"
                        onLoad={() => setLoaded(true)}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}


