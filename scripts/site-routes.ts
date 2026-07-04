// Single source of truth for the site's static (non-blog) routes.
//
// Consumed by:
//   - scripts/make-sitemap.ts        → which URLs get indexed
//   - scripts/inject-404-routes.ts   → the 404 page's nav + fuzzy-match list
//
// Add a page here once and it flows to the sitemap AND the 404 page. A route
// that isn't listed here is treated as unlisted (e.g. /kitchen recipes, which
// aren't promoted yet) — it stays out of the sitemap and the 404 suggestions.

export interface StaticRoute {
	/** URL path, e.g. "/about" */
	path: string;
	/** Human label shown in the 404 page's "pages that exist" nav */
	label: string;
	/** Whether to surface this route in the 404 page's visible nav */
	nav: boolean;
	/** sitemap.xml priority */
	priority: string;
	/** sitemap.xml changefreq */
	changefreq: string;
}

export const STATIC_ROUTES: StaticRoute[] = [
	{ path: "/", label: "home", nav: true, priority: "1.0", changefreq: "weekly" },
	{ path: "/blog", label: "writing", nav: true, priority: "0.9", changefreq: "weekly" },
	{ path: "/about", label: "about", nav: true, priority: "0.8", changefreq: "monthly" },
	{ path: "/resume", label: "résumé", nav: true, priority: "0.8", changefreq: "monthly" },
	{ path: "/reviews", label: "reviews", nav: true, priority: "0.7", changefreq: "monthly" },
	{ path: "/lab/", label: "lab", nav: true, priority: "0.8", changefreq: "monthly" },
	// Utility page: reachable + indexed, but kept out of the 404 nav to keep it focused on content.
	{ path: "/calendar", label: "calendar", nav: false, priority: "0.5", changefreq: "yearly" },
	// Individual lab projects: indexed, but kept out of the 404 nav — /lab/ is the entry point.
	{ path: "/lab/guitar/", label: "guitar", nav: false, priority: "0.6", changefreq: "monthly" },
	{ path: "/lab/hand/", label: "hand lab", nav: false, priority: "0.6", changefreq: "monthly" },
	{ path: "/lab/trig/", label: "trigonometry", nav: false, priority: "0.6", changefreq: "monthly" },
];
