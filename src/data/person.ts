// Personal identity and site copy live in `person.json`.
// Import from here instead of hardcoding strings across pages and components.

import personData from "./person.json";

export type Person = typeof personData.person;
export type SocialLinks = typeof personData.socialLinks;
export type Currently = typeof personData.currently;
export type Stat = (typeof personData.stats)[number];
export type WorkBlock = (typeof personData.workBlocks)[number];
export type AboutPageData = typeof personData.about;
export type PageMeta = { title: string; description: string };
export type SiteMeta = typeof personData.meta;

export const PERSON = personData.person;
export const SOCIAL_LINKS = personData.socialLinks;
export const CURRENTLY = personData.currently;
export const HERO_LEDE = personData.heroLede;
export const ADVISORY_BLURB = personData.advisoryBlurb;
export const STATS = personData.stats;
export const WORK_BLOCKS = personData.workBlocks;
export const ABOUT_HTML = personData.about.html;
export const ABOUT_SHORT = personData.aboutShort;
export const ABOUT_SITE_DESCRIPTION = personData.aboutSiteDescription;
export const ABOUT_WORK_DESCRIPTION = personData.aboutWorkDescription;
export const ABOUT_OUTSIDE_WORK = personData.aboutOutsideWork;
export const META = personData.meta;

/** About page props shape used by `AboutPagePanda` and SSR. */
export function getAboutPageData(): AboutPageData {
	return personData.about;
}
