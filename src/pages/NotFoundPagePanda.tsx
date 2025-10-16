import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
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
