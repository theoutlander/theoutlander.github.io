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
							fontSize: "5xl",
							fontWeight: "bold",
							lineHeight: "1.05",
							letterSpacing: "-0.02em",
							color: { base: "gray.900", _dark: "dark.text" },
							textAlign: "center",
							mb: "2",
						})}
					>
						Engineering Leader & Software Engineer
					</h1>

					{/* Subtitle */}
					<p
						className={css({
							fontSize: { base: "xl", md: "2xl" },
							color: "gray.600",
							fontWeight: "semibold",
							lineHeight: "1.4",
							maxWidth: { base: "2xl", md: "4xl" },
							textAlign: "center",
							mx: "auto",
							mt: "3",
							mb: "6",
							whiteSpace: { base: "normal", md: "nowrap" },
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
									More than 10 years leading high-performing engineering teams
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
									25+ Years building software across Google, Microsoft, and
									startups
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
								<span>Deep expertise in React, TypeScript, and Node.js</span>
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
								<span>Passion for shipping reliable, simple systems</span>
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
							className={chip({ variant: "react" })}
							aria-label="React technology"
						>
							<span
								aria-hidden="true"
								className={css({ fontSize: "0.9em" })}
							>
								⚛️
							</span>
							<span>React</span>
						</button>
						<button
							type="button"
							className={chip({ variant: "typescript" })}
							aria-label="TypeScript technology"
						>
							<span
								aria-hidden="true"
								className={css({ fontSize: "0.9em" })}
							>
								📘
							</span>
							<span>TypeScript</span>
						</button>
						<button
							type="button"
							className={chip({ variant: "node" })}
							aria-label="Node.js technology"
						>
							<span
								aria-hidden="true"
								className={css({ fontSize: "0.9em" })}
							>
								🌱
							</span>
							<span>Node.js</span>
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
				bg: { base: "gray.50", _dark: "dark.card" },
				color: { base: "gray.700", _dark: "dark.textSecondary" },
				borderColor: { base: "gray.200", _dark: "dark.border" },
				_focusVisible: {
					outlineColor: "gray.600",
				},
				_hover: {
					bg: { base: "gray.100", _dark: "dark.surface" },
				},
			},
			react: {
				bg: { base: "blue.50", _dark: "blue.900/20" },
				color: { base: "blue.700", _dark: "blue.400" },
				borderColor: { base: "blue.200", _dark: "blue.700" },
				_focusVisible: {
					outlineColor: "blue.600",
				},
				_hover: {
					bg: { base: "blue.100", _dark: "blue.800/30" },
				},
			},
			typescript: {
				bg: { base: "indigo.50", _dark: "indigo.900/20" },
				color: { base: "indigo.700", _dark: "indigo.400" },
				borderColor: { base: "indigo.200", _dark: "indigo.700" },
				_focusVisible: {
					outlineColor: "indigo.600",
				},
				_hover: {
					bg: { base: "indigo.100", _dark: "indigo.800/30" },
				},
			},
			node: {
				bg: { base: "green.50", _dark: "green.900/20" },
				color: { base: "green.700", _dark: "green.400" },
				borderColor: { base: "green.200", _dark: "green.700" },
				_focusVisible: {
					outlineColor: "green.600",
				},
				_hover: {
					bg: { base: "green.100", _dark: "green.800/30" },
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
