import { defineConfig } from "@pandacss/dev";

export default defineConfig({
	// Whether to use css reset
	preflight: true,

	// Where to look for your css declarations
	include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],

	// Files to exclude
	exclude: [],

	// Useful for theme customization
	theme: {
		extend: {
			tokens: {
				colors: {
					brand: {
						50: { value: "#EEF2FF" },
						100: { value: "#E0E7FF" },
						200: { value: "#C7D2FE" },
						300: { value: "#A5B4FC" },
						400: { value: "#818CF8" },
						500: { value: "#6366F1" },
						600: { value: "#4F46E5" },
						700: { value: "#4338CA" },
						800: { value: "#3730A3" },
						900: { value: "#312E81" },
					},
					// Add commonly used colors from inline styles
					text: {
						primary: { value: "#1a202c" },
						secondary: { value: "#718096" },
						muted: { value: "#4a5568" },
					},
					background: {
						tag: { value: "#edf2f7" },
						section: { value: "#f8fafc" },
					},
					// Dark mode colors
					dark: {
						bg: { value: "#0f172a" },
						surface: { value: "#1e293b" },
						card: { value: "#334155" },
						border: { value: "#475569" },
						text: { value: "#f1f5f9" },
						textSecondary: { value: "#cbd5e1" },
						textMuted: { value: "#94a3b8" },
					},
				},
				fonts: {
					heading: {
						value:
							'-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
					},
					body: {
						value:
							'-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
					},
				},
				spacing: {
					// Add commonly used spacing values
					"12px": { value: "12px" },
					"16px": { value: "16px" },
					"24px": { value: "24px" },
					"32px": { value: "32px" },
					"48px": { value: "48px" },
				},
				sizes: {
					"768px": { value: "768px" },
				},
			},
			recipes: {
				// Blog post layout recipe
				blogPost: {
					className: "blog-post",
					base: {
						maxW: "768px",
						mx: "auto",
						px: "24px",
					},
				},
				// Blog post title recipe
				blogTitle: {
					className: "blog-title",
					base: {
						fontSize: "2.25rem",
						fontWeight: "600",
						lineHeight: "1.2",
						mb: "16px",
						color: "text.primary",
					},
				},
				// Blog post meta info recipe
				blogMeta: {
					className: "blog-meta",
					base: {
						display: "flex",
						alignItems: "center",
						gap: "12px",
						mb: "24px",
						flexWrap: "wrap",
					},
				},
				// Blog post date recipe
				blogDate: {
					className: "blog-date",
					base: {
						fontSize: "14px",
						color: "text.secondary",
					},
				},
				// Blog post tag recipe
				blogTag: {
					className: "blog-tag",
					base: {
						bg: "blue.100",
						color: "blue.800",
						px: "12px",
						py: "6px",
						borderRadius: "full",
						fontSize: "12px",
						fontWeight: "600",
						display: "inline-flex",
						alignItems: "center",
						textTransform: "uppercase",
						letterSpacing: "0.025em",
						_hover: {
							bg: "blue.200",
							transform: "translateY(-1px)",
						},
						transition: "all 0.2s ease",
					},
				},
				// Blog post excerpt recipe
				blogExcerpt: {
					className: "blog-excerpt",
					base: {
						color: "text.primary",
						mb: "32px",
						fontSize: "18px",
						lineHeight: "1.7",
					},
				},
				// Blog post content recipe
				blogContent: {
					className: "blog-content",
					base: {
						maxW: "none",
						lineHeight: "1.7",
						fontSize: "18px",
						color: "text.primary",
					},
				},
				// Blog post cover image recipe
				blogCover: {
					className: "blog-cover",
					base: {
						mb: "32px",
						borderRadius: "12px",
						w: "100%",
					},
				},
				// Comments section recipe
				commentsSection: {
					className: "comments-section",
					base: {
						mt: "48px",
						pt: "32px",
					},
				},
				// Comments container recipe
				commentsContainer: {
					className: "comments-container",
					base: {
						maxW: "768px",
						mx: "auto",
						p: "0",
					},
				},
				// Comments header recipe
				commentsHeader: {
					className: "comments-header",
					base: {
						display: "flex",
						flexDirection: "column",
						gap: "24px",
					},
				},
				// Comments title recipe
				commentsTitle: {
					className: "comments-title",
					base: {
						display: "flex",
						gap: "12px",
						alignItems: "center",
					},
				},
				// Comments content recipe
				commentsContent: {
					className: "comments-content",
					base: {
						display: "flex",
						flexDirection: "column",
						gap: "16px",
					},
				},
				// Comments actions recipe
				commentsActions: {
					className: "comments-actions",
					base: {
						display: "flex",
						gap: "12px",
						flexWrap: "wrap",
					},
				},
				// Company logo recipe
				companyLogo: {
					className: "company-logo",
					base: {
						display: "inline-block",
						objectFit: "contain",
						borderRadius: "6px",
						mb: "10px",
					},
				},
			},
		},
	},

	// The output directory for your css system
	outdir: "styled-system",

	// Static extraction for SSR
	staticCss: {
		recipes: {
			// Include commonly used recipes
			blogPost: ["*"],
			blogTitle: ["*"],
			blogMeta: ["*"],
			blogDate: ["*"],
			blogTag: ["*"],
			blogExcerpt: ["*"],
			blogContent: ["*"],
			blogCover: ["*"],
			commentsSection: ["*"],
			commentsContainer: ["*"],
			commentsHeader: ["*"],
			commentsTitle: ["*"],
			commentsContent: ["*"],
			commentsActions: ["*"],
			companyLogo: ["*"],
		},
	},
});
