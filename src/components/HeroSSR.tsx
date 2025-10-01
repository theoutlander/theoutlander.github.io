import { css } from "../../styled-system/css/index.mjs";
import { flex, hstack } from "../../styled-system/patterns/index.mjs";
import { cva } from "../../styled-system/css/index.mjs";

export default function HeroSSR() {
	return (
		<section
			className={css({
				bg: "gray.50",
				pt: "16",
				pb: "16",
				mb: { base: "8", md: "10" },
			})}
		>
			<div
				className={css({
					maxW: "6xl",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
				})}
			>
				{/* Title */}
				<h1
					className={css({
						fontSize: { base: "3xl", md: "4xl", lg: "5xl" },
						fontWeight: "bold",
						lineHeight: "1.1",
					})}
				>
					Engineering Leader & Software Engineer
				</h1>

				{/* Subtitle */}
				<p
					className={css({
						fontSize: { base: "lg", md: "xl" },
						color: "gray.500",
						mt: { base: "2", md: "3" },
						fontWeight: "normal",
						lineHeight: "1.6",
					})}
				>
					Helping teams ship with clarity, speed, and reliable systems.
				</p>

				{/* Checklist */}
				<ul
					className={css({
						listStyle: "none",
						pl: "0",
						mt: { base: "4", md: "5" },
						fontSize: { base: "md", md: "lg" },
						color: "gray.700",
					})}
				>
					<li
						className={css({
							mb: { base: "2", md: "3" },
							display: "flex",
							alignItems: "flex-start",
							gap: "3",
						})}
					>
						<span
							className={css({
								color: "green.600",
								mt: "0.5",
								flexShrink: 0,
							})}
						>
							✅
						</span>
						<span>More than 10 years leading engineering teams</span>
					</li>
					<li
						className={css({
							mb: { base: "2", md: "3" },
							display: "flex",
							alignItems: "flex-start",
							gap: "3",
						})}
					>
						<span
							className={css({
								color: "green.600",
								mt: "0.5",
								flexShrink: 0,
							})}
						>
							✅
						</span>
						<span>
							25+ years building software across Google, Microsoft, and startups
						</span>
					</li>
					<li
						className={css({
							mb: { base: "2", md: "3" },
							display: "flex",
							alignItems: "flex-start",
							gap: "3",
						})}
					>
						<span
							className={css({
								color: "green.600",
								mt: "0.5",
								flexShrink: 0,
							})}
						>
							✅
						</span>
						<span>Advisor to founders on AI and developer experience</span>
					</li>
					<li
						className={css({
							mb: "0",
							display: "flex",
							alignItems: "flex-start",
							gap: "3",
						})}
					>
						<span
							className={css({
								color: "green.600",
								mt: "0.5",
								flexShrink: 0,
							})}
						>
							✅
						</span>
						<span>Passion for shipping reliable, simple systems</span>
					</li>
				</ul>

				{/* Pill Row */}
				<div
					className={css({
						mt: "6",
						display: "flex",
						flexWrap: "wrap",
						gap: "3",
						justifyContent: "center",
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
						mt: "5",
						display: "flex",
						justifyContent: "center",
					})}
				>
					<a
						href="/blogs"
						className={chip({ variant: "cta" })}
					>
						<span>Read the blog</span>
						<span aria-hidden="true">→</span>
					</a>
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
		height: "38px",
		px: "4",
		py: "2",
		rounded: "md",
		borderWidth: "1px",
		borderStyle: "solid",
		fontSize: "sm",
		fontWeight: "500",
		cursor: "pointer",
		transition: "all 200ms ease",
		minWidth: "fit-content",
		_focusVisible: {
			outline: "2px solid currentColor",
			outlineOffset: "2px",
		},
		_hover: {
			boxShadow: "sm",
		},
	},
	variants: {
		variant: {
			ai: {
				bg: "gray.100",
				color: "gray.700",
				borderColor: "gray.300",
				_hover: {
					bg: "gray.200",
				},
			},
			react: {
				bg: "cyan.100",
				color: "cyan.700",
				borderColor: "cyan.700",
				_hover: {
					bg: "cyan.200",
				},
			},
			typescript: {
				bg: "blue.50",
				color: "blue.700",
				borderColor: "blue.700",
				_hover: {
					bg: "blue.100",
				},
			},
			node: {
				bg: "green.50",
				color: "green.700",
				borderColor: "green.700",
				_hover: {
					bg: "green.100",
				},
			},
			cta: {
				height: "44px",
				px: "5",
				py: "3",
				fontSize: "md",
				fontWeight: "600",
				bg: "brand.600",
				color: "white",
				borderColor: "brand.600",
				_hover: {
					bg: "brand.700",
					borderColor: "brand.700",
					boxShadow: "md",
				},
				_active: {
					bg: "brand.800",
					borderColor: "brand.800",
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
