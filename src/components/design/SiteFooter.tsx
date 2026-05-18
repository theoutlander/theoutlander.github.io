import React from "react";
import { FOOTER_INDEX_LINKS, COPY } from "../../data/site-copy";
import { SOCIAL_LINKS } from "../../data/person";

export function SiteFooter() {
  return (
    <footer className="ds-site-footer">
      <div className="ds-row">
        <div>
          <h4>{COPY.footer.elsewhereHeading}</h4>
          <ul>
            <li><a href={SOCIAL_LINKS.github} target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
            <li><a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer">Twitter / X</a></li>
            <li><a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer">YouTube</a></li>
            <li><a href={SOCIAL_LINKS.stackoverflow} target="_blank" rel="noreferrer">Stack Overflow</a></li>
            <li><a href={SOCIAL_LINKS.codementor} target="_blank" rel="noreferrer">Codementor</a></li>
            <li><a href="https://maya.karnik.io" target="_blank" rel="noreferrer">Maya's Game Lab</a></li>
          </ul>
        </div>
        <div>
          <h4>{COPY.footer.newsletterHeading}</h4>
          <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", margin: "0 0 0.75rem", maxWidth: 320 }}>
            {COPY.footer.newsletterLede}
          </p>
          <form
            action="https://buttondown.com/api/emails/embed-subscribe/nickkarnik"
            method="POST"
            className="ds-newsletter-input"
          >
            <input
              type="email"
              name="email"
              placeholder={COPY.footer.newsletterPlaceholder}
              aria-label="Email address for newsletter"
            />
            <button className="ds-btn" type="submit" style={{ padding: "0.7em 1.1em" }}>
              {COPY.footer.newsletterCta}
            </button>
          </form>
        </div>
        <div>
          <h4>{COPY.footer.indexHeading}</h4>
          <ul>
            {FOOTER_INDEX_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
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
