import React from "react";
import { Wordmark } from "./Marks";
import { COPY } from "../../data/site-copy";
import { PERSON, SOCIAL_LINKS } from "../../data/person";

const SOCIAL_LINKS_LIST = [
	{ href: SOCIAL_LINKS.github, label: "GitHub" },
	{ href: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
	{ href: SOCIAL_LINKS.twitter, label: "Twitter / X" },
	{ href: SOCIAL_LINKS.youtube, label: "YouTube" },
	{ href: SOCIAL_LINKS.stackoverflow, label: "Stack Overflow" },
	{ href: SOCIAL_LINKS.codementor, label: "Codementor" },
	{ href: "https://maya.karnik.io", label: "Maya's Game Lab" },
] as const;

export function SiteFooter() {
	return (
		<footer className="ds-site-footer">
			<div className="ds-row ds-footer-row">
				<div>
					<Wordmark variant="stacked" size={42} />
					<div style={{ marginTop: "1.25rem" }}>
						<a
							href={`mailto:${PERSON.email}`}
							className="ds-plain"
							style={{
								fontFamily: "var(--mono)",
								fontSize: "0.78rem",
								color: "var(--ink-2)",
								letterSpacing: "0.04em",
							}}
						>
							{PERSON.email}
						</a>
					</div>
					<div style={{ marginTop: "0.5rem" }}>
						<span className="ds-mono" style={{ color: "var(--ink-3)", fontSize: "0.72rem" }}>
							{PERSON.location}
						</span>
					</div>
				</div>
				<div>
					<ul>
						{SOCIAL_LINKS_LIST.map((l) => (
							<li key={l.href}>
								<a href={l.href} target="_blank" rel="noreferrer">
									{l.label}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="ds-colophon">
				<span>{COPY.footer.colophonRights}</span>
				<span>{COPY.footer.colophonType}</span>
			</div>
		</footer>
	);
}
