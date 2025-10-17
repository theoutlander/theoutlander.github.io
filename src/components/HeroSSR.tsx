import { css } from "../../styled-system/css/index.mjs";
import { flex, hstack } from "../../styled-system/patterns/index.mjs";
import { cva } from "../../styled-system/css/index.mjs";

export default function HeroSSR() {
	return (
		<section
			className={css({
				bg: "gray.50",
				py: "16",
				mb: "8",
				display: "flex",
				alignItems: "center",
				minHeight: "60vh",
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
				<div
					className={css({
						maxW: "960px",
						mx: "auto",
						border: "none",
					})}
				>
					{/* Title */}
					<h1
						className={css({
							fontSize: { base: "3xl", sm: "4xl", md: "5xl" },
							fontWeight: "bold",
							lineHeight: "1.05",
							letterSpacing: "-0.02em",
							color: { base: "gray.900", _dark: "dark.text" },
							textAlign: "center",
							mb: "2",
							px: { base: "2", md: "0" },
						})}
					>
						Engineering Leader - AI & Product Strategy
					</h1>

					{/* Subtitle */}
					<p
						className={css({
							fontSize: { base: "lg", sm: "xl", md: "2xl" },
							color: "gray.600",
							fontWeight: "semibold",
							lineHeight: "1.4",
							maxWidth: { base: "2xl", md: "4xl" },
							textAlign: "center",
							mx: "auto",
							mt: "3",
							mb: "6",
							px: { base: "2", md: "0" },
						})}
					>
						Build faster. Lead stronger. Scale smarter.
					</p>

					{/* Checklist */}
					<div
						className={css({
							display: "flex",
							justifyContent: "center",
							mb: { base: "5", md: "6" },
						})}
					>
						<ul
							className={css({
								listStyle: "none",
								pl: "0",
								fontSize: { base: "16px", md: "18px" },
								lineHeight: "1.6",
								color: { base: "gray.700", _dark: "dark.textSecondary" },
								textAlign: "left",
								maxWidth: "2xl",
							})}
						>
							<li
								className={css({
									mb: { base: "3", md: "4" },
									display: "flex",
									alignItems: "baseline",
									gap: "3",
								})}
							>
								<span
									className={css({
										color: "green.600",
										flexShrink: 0,
									})}
								>
									✅
								</span>
								<span>
									Led AI and platform engineering teams at Google, Microsoft, and Salesforce
								</span>
							</li>
							<li
								className={css({
									mb: { base: "3", md: "4" },
									display: "flex",
									alignItems: "baseline",
									gap: "3",
								})}
							>
								<span
									className={css({
										color: "green.600",
										flexShrink: 0,
									})}
								>
									✅
								</span>
								<span>
									Built products adopted by millions of developers (Gemini Code Assist)
								</span>
							</li>
							<li
								className={css({
									mb: { base: "3", md: "4" },
									display: "flex",
									alignItems: "baseline",
									gap: "3",
								})}
							>
								<span
									className={css({
										color: "green.600",
										flexShrink: 0,
									})}
								>
									✅
								</span>
								<span>Known for clarity, technical strategy, and high-performance team leadership</span>
							</li>
							<li
								className={css({
									mb: "0",
									display: "flex",
									alignItems: "baseline",
									gap: "3",
								})}
							>
								<span
									className={css({
										color: "green.600",
										flexShrink: 0,
									})}
								>
									✅
								</span>
								<span>Passionate about building products that matter, not just software</span>
							</li>
						</ul>
					</div>

					{/* Pill Row */}
					<div
						className={css({
							mt: "6",
							mb: { base: "5", md: "6" },
							display: "flex",
							flexWrap: "wrap",
							gap: { base: "3", md: "4" },
							justifyContent: "center",
							alignItems: "center",
						})}
					>
						<button
							type="button"
							className={chip({ variant: "ai" })}
							aria-label="AI technology"
						>
							<span
								aria-hidden="true"
								className={css({ fontSize: "0.9em" })}
							>
								✨
							</span>
							<span>AI</span>
						</button>
						<button
							type="button"
							className={chip({ variant: "leadership" })}
							aria-label="Leadership"
						>
							<span
								aria-hidden="true"
								className={css({ fontSize: "0.9em" })}
							>
								👥
							</span>
							<span>Leadership</span>
						</button>
						<button
							type="button"
							className={chip({ variant: "product" })}
							aria-label="Product"
						>
							<span
								aria-hidden="true"
								className={css({ fontSize: "0.9em" })}
							>
								📦
							</span>
							<span>Product</span>
						</button>
					</div>

					{/* CTA */}
					<div
						className={css({
							mt: "6",
							mb: "12",
							display: "flex",
							justifyContent: "center",
						})}
					>
						<a
							href="/blog"
							className={chip({ variant: "cta" })}
						>
							<span>Read the blog</span>
							<span aria-hidden="true">→</span>
						</a>
					</div>
				</div>
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
			ai: {
					bg: { base: "blue.50", _dark: "dark.card" },
					color: { base: "blue.700", _dark: "dark.textSecondary" },
					borderColor: { base: "blue.200", _dark: "dark.border" },
				_focusVisible: {
						outlineColor: "blue.600",
				},
				_hover: {
						bg: { base: "blue.100", _dark: "dark.surface" },
				},
			},
				leadership: {
					bg: { base: "orange.50", _dark: "orange.900/20" },
					color: { base: "orange.700", _dark: "orange.400" },
					borderColor: { base: "orange.200", _dark: "orange.700" },
					_focusVisible: {
						outlineColor: "orange.600",
					},
					_hover: {
						bg: { base: "orange.100", _dark: "orange.800/30" },
					},
				},
				product: {
					bg: { base: "purple.50", _dark: "purple.900/20" },
					color: { base: "purple.700", _dark: "purple.400" },
					borderColor: { base: "purple.200", _dark: "purple.700" },
					_focusVisible: {
						outlineColor: "purple.600",
					},
					_hover: {
						bg: { base: "purple.100", _dark: "purple.800/30" },
					},
				},
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
