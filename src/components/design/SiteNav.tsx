import React from "react";
import { Wordmark } from "./Marks";
import { NAV_LINKS } from "../../data/site-copy";
import { PERSON } from "../../data/person";

function isActive(href: string, pathname: string): boolean {
	if (href === "/") return pathname === "/";
	return pathname.startsWith(href);
}

export function SiteNav() {
	const [pathname, setPathname] = React.useState("/");

	React.useEffect(() => {
		setPathname(window.location.pathname);
	}, []);

	return (
		<nav className="ds-site-nav" aria-label="Main navigation">
			<a href="/" className="ds-brand-link" aria-label={`${PERSON.name} — home`}>
				<Wordmark variant="primary" size={20} />
			</a>
			<div className="ds-links">
				{NAV_LINKS.map((l) => (
					<a
						key={l.href}
						href={l.href}
						className={isActive(l.href, pathname) ? "ds-active" : ""}
					>
						{l.label}
					</a>
				))}
			</div>
		</nav>
	);
}
