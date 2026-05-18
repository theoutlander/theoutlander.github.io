import React from "react";
import { BrandMark, Wordmark } from "./Marks";

const NAV_LINKS = [
  { href: "/blog", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Résumé" },
  { href: "/reviews", label: "Reviews" },
  { href: "/kitchen", label: "The Kitchen" },
];

function isActive(href: string): boolean {
  if (typeof window === "undefined") return false;
  const pathname = window.location.pathname;
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
      <a href="/" className="ds-brand-link" aria-label="Nick Karnik — home">
        <BrandMark size={32} shape="circle" />
        <Wordmark variant="primary" size={20} />
      </a>
      <div className="ds-links">
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={pathname.startsWith(l.href) ? "ds-active" : ""}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
