// Canonical résumé data in `resume.json`; types and link helpers live here.
// Kept as a small module so `ResumePagePanda` stays presentation-only.

import resumeData from "./resume.json";

export type Role = {
	co: string;
	role: string;
	dates: string;
	current?: boolean;
	blurb: string;
	tags: string[];
};

export type Project = {
	name: string;
	company: string;
	dates: string;
	description: string;
	tags: string[];
	href?: string;
};

export type Education = {
	institution: string;
	institutionHref: string;
	logoKey: string;
	degree: string;
	location: string;
	notes?: string;
};

export type Patent = {
	id: string;
	title: string;
	href: string;
	status: string;
};

export type SkillGroups = Record<string, string[]>;

const { companyKeyMap, companyUrlMap } = resumeData;

export function getCompanyKey(companyName: string): string {
	return (
		companyKeyMap[companyName as keyof typeof companyKeyMap] ||
		companyName
			.toLowerCase()
			.replace(/\s+/g, "")
			.replace(/[^a-z0-9-]/g, "")
	);
}

export function getCompanyUrl(companyName: string): string | null {
	return companyUrlMap[companyName as keyof typeof companyUrlMap] || null;
}

export const SUMMARY = resumeData.summary;

export const ROLES = resumeData.roles as Role[];

export const PROJECTS = resumeData.projects as Project[];

export const EDUCATION = resumeData.education as Education;

export const PATENTS = resumeData.patents as Patent[];

export const SKILLS = resumeData.skills as SkillGroups;

// Apply the legacy in-blurb HTML substitutions for the TED Talk and patent
// references. Returned strings are intended for `dangerouslySetInnerHTML`.
export function withInlineLinks(blurb: string, company: string): string {
	if (
		company === "Microsoft" &&
		blurb.includes("US Patent 8,918,354")
	) {
		return blurb.replace(
			/US Patent 8,918,354: Intelligent intent detection from social network messages/,
			'<a href="https://patents.google.com/patent/US8918354B2/en" target="_blank" rel="noopener noreferrer" class="patent-link">US Patent 8,918,354: Intelligent intent detection from social network messages</a>',
		);
	}
	if (
		company === "Institute for Disease Modeling (Gates Foundation)" &&
		blurb.includes("The next outbreak? We're not ready.")
	) {
		return blurb.replace(
			/"The next outbreak\? We're not ready\."/,
			'<a href="https://www.ted.com/talks/bill_gates_the_next_outbreak_we_re_not_ready" target="_blank" rel="noopener noreferrer">"The next outbreak? We\'re not ready."</a>',
		);
	}
	return blurb;
}

export function withProjectInlineLinks(description: string): string {
	if (description.includes("The next outbreak? We're not ready.")) {
		return description.replace(
			/"The next outbreak\? We're not ready\."/,
			'<a href="https://www.ted.com/talks/bill_gates_the_next_outbreak_we_re_not_ready" target="_blank" rel="noopener noreferrer">"The next outbreak? We\'re not ready."</a>',
		);
	}
	return description;
}
