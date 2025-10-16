import React from "react";
import { Helmet } from "react-helmet-async";
import NotFound from "../components/NotFound";

export function NotFoundPagePanda() {
    return (
        <>
            <Helmet>
                <title>404 - Page Not Found - Nick Karnik</title>
                <meta name="robots" content="noindex, follow" />
            </Helmet>
            <NotFound />
        </>
    );
}
