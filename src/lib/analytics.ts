declare global {
	interface Window {
		gtag?: (...args: any[]) => void;
		dataLayer?: any[];
		__gaLoaded?: boolean;
	}
}

function isLocalDev() {
	if (typeof window === 'undefined') return false;
	if (import.meta.env.DEV) return true;
	const hostname = window.location.hostname;
	return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
}

function track(eventName: string, params?: Record<string, any>) {
	if (typeof window === 'undefined') return;
	if (isLocalDev()) return;
	if (typeof window.gtag !== 'function') return;
	window.gtag('event', eventName, params);
}

export const analytics = {
	/**
	 * Track a page view. Called on each route change.
	 * Fires GA4's built-in 'page_view' event with page path, title, and full URL.
	 */
	pageView(path: string, title: string) {
		track('page_view', {
			page_path: path,
			page_title: title,
			page_location: typeof window !== 'undefined' ? window.location.href : '',
			site_area: path.startsWith('/maya') ? 'maya' : 'site',
		});
	},

	/**
	 * Track when a blog post is viewed.
	 * Fires GA4's 'view_item' event (an e-commerce event borrowed for content).
	 * Includes title, category, tags, and estimated reading time.
	 */
	blogPostView(post: {
		slug: string;
		title: string;
		category?: string;
		tags?: string[];
		readingTime?: number;
	}) {
		track('view_item', {
			item_id: post.slug,
			item_name: post.title,
			item_category: post.category,
			item_list_name: post.tags?.join(', '),
			estimated_read_time: post.readingTime,
		});
	},

	/**
	 * Track a share action (Twitter, LinkedIn, Facebook, copy link).
	 * Fires GA4's built-in 'share' event, which unlocks a dedicated Share report.
	 */
	share(
		method: 'twitter' | 'linkedin' | 'facebook' | 'copy_link',
		contentId: string,
		contentType = 'blog_post'
	) {
		track('share', {
			method,
			content_type: contentType,
			content_id: contentId,
		});
	},

	/**
	 * Track an outbound link click (external URL).
	 * Fires GA4's 'click' event with URL and link text.
	 */
	outboundClick(url: string, linkText?: string) {
		const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.href : '');
		track('click', {
			link_url: url,
			link_domain: urlObj.hostname,
			link_text: linkText,
			outbound: true,
		});
	},

	/**
	 * Track a CTA (call-to-action) click.
	 * Custom event for conversion actions like "Read the blog", "Schedule a call", etc.
	 */
	ctaClick(ctaName: string, ctaLocation: string) {
		track('cta_click', {
			cta_name: ctaName,
			cta_location: ctaLocation,
		});
	},

	/**
	 * Track when a user applies a filter on the blog (category or tag).
	 * Custom event that helps understand content discovery patterns.
	 */
	blogFilterApplied(filterType: 'category' | 'tag', filterValue: string) {
		track('blog_filter_applied', {
			filter_type: filterType,
			filter_value: filterValue,
		});
	},
};
