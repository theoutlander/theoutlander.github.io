// Site UI copy — nav labels, page headings, footer, section tags.
// Personal identity, bio, stats, and SEO meta live in `person.json`.

import siteCopyData from "./site-copy.json";

export type SiteCopy = typeof siteCopyData;

export const COPY = siteCopyData;

export const NAV_LINKS = [
	{ href: "/blog", label: COPY.nav.writing },
	{ href: "/about", label: COPY.nav.about },
	{ href: "/resume", label: COPY.nav.resume },
	{ href: "/reviews", label: COPY.nav.reviews },
] as const;
