import { css, cva } from "../../styled-system/css/index.mjs";
import { analytics } from "../lib/analytics";
import NameHeader from "./NameHeader";

export default function HeroSSR() {
	const bioFooter = (
		<>
			<p
				className={css({
					fontSize: { base: "md", sm: "lg", md: "xl" },
					fontWeight: "medium",
					lineHeight: { base: "1.65", md: "1.6" },
					letterSpacing: "normal",
					color: { base: "gray.900", _dark: "dark.text" },
					textAlign: { base: "center", md: "left" },
					mb: { base: "4", md: "4" },
					mt: { base: "1", md: "0" },
					px: { base: "0", md: "0" },
					maxW: { base: "100%", md: "42rem" },
					mx: { base: "auto", md: "0" },
				})}
			>
				Twenty-five years of building software across search engines, disease models, data platforms,
				and AI tools. I cook seriously, make cocktails, travel when I can, and build games with my
				three kids. Still figuring out what comes next and building it anyway.
			</p>
			<div
				className={css({
					display: "flex",
					justifyContent: { base: "center", md: "flex-start" },
				})}
			>
				<a
					href="/blog"
					className={chip({ variant: "cta" })}
					onClick={() => analytics.ctaClick("Read the blog", "hero")}
				>
					<span>Read the blog</span>
					<span aria-hidden="true">→</span>
				</a>
			</div>
		</>
	);

	return (
		<section
			className={css({
				bg: "white",
				_dark: { bg: "dark.surface" },
				py: { base: "10", md: "14" },
				display: "flex",
				alignItems: "flex-start",
			})}
		>
			<div
				className={css({
					maxW: "1040px",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
					width: "100%",
				})}
			>
				<NameHeader
					plain
					footer={bioFooter}
					showDownloadButton={false}
					showSubtitle={false}
					showTagPills={false}
					showSocialLinks={false}
				/>
			</div>
		</section>
	);
}

/* tiny recipe helpers */
const chip = cva({
	base: {
		display: "inline-flex",
		alignItems: "center",
		gap: "2",
		height: "40px",
		px: "4",
		py: "2",
		rounded: "lg",
		borderWidth: "1px",
		borderStyle: "solid",
		fontSize: "sm",
		fontWeight: "500",
		cursor: "pointer",
		transition: "all 200ms ease",
		boxShadow: "sm",
		_focusVisible: {
			outline: "2px solid",
			outlineOffset: "2px",
		},
		_hover: {
			boxShadow: "md",
		},
		"@media (prefers-reduced-motion: reduce)": {
			transition: "none",
		},
	},
	variants: {
		variant: {
			cta: {
				height: "44px",
				px: "4",
				py: "2",
				fontSize: "md",
				fontWeight: "600",
				bg: "brand.600",
				color: "white",
				border: "none",
				textDecoration: "none",
				rounded: "lg",
				_hover: {
					bg: "brand.700",
					textDecoration: "none",
				},
				_active: {
					bg: "brand.800",
					textDecoration: "none",
				},
				_focusVisible: {
					outline: "2px solid",
					outlineColor: "brand.700",
					outlineOffset: "2px",
				},
			},
		},
	},
});
