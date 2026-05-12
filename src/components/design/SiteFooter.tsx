import React, { useState } from "react";

export function SiteFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="ds-site-footer">
      <div className="ds-row">
        <div>
          <h4>Elsewhere</h4>
          <ul>
            <li><a href="https://github.com/theoutlander" target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a href="https://www.linkedin.com/in/theoutlander" target="_blank" rel="noreferrer">LinkedIn</a></li>
            <li><a href="https://x.com/theoutlander" target="_blank" rel="noreferrer">Twitter / X</a></li>
            <li><a href="https://youtube.com/@nick-karnik" target="_blank" rel="noreferrer">YouTube</a></li>
            <li><a href="https://stackoverflow.com/users/460472/nick" target="_blank" rel="noreferrer">Stack Overflow</a></li>
          </ul>
        </div>
        <div>
          <h4>The Newsletter</h4>
          <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", margin: "0 0 0.75rem", maxWidth: 320 }}>
            A short letter, once a fortnight. On building teams, building software, and the occasional braise.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="ds-newsletter-input"
          >
            <input
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address for newsletter"
            />
            <button className="ds-btn" type="submit" style={{ padding: "0.7em 1.1em" }}>
              Subscribe →
            </button>
          </form>
        </div>
        <div>
          <h4>Index</h4>
          <ul>
            <li><a href="/blog">Writing</a></li>
            <li><a href="/kitchen">The Kitchen</a></li>
            <li><a href="/resume">Résumé</a></li>
            <li><a href="/reviews">Reviews</a></li>
          </ul>
        </div>
      </div>
      <div className="ds-colophon">
        <span>© MMXXVI · Nick Karnik · All rights reserved</span>
        <span>Set in Newsreader &amp; JetBrains Mono</span>
      </div>
    </footer>
  );
}
