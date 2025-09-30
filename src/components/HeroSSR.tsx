import { css } from "../../styled-system/css/index.mjs";
import { flex, hstack } from "../../styled-system/patterns/index.mjs";
import { cva } from "../../styled-system/css/index.mjs";

export default function HeroSSR() {
	return (
		<section
			className={css({
				bg: "gray.50",
				py: { base: "16", md: "20", lg: "24" },
			})}
		>
			<div
				className={flex({
					direction: { base: "column", lg: "row" },
					align: { base: "start", lg: "center" },
					justify: "space-between",
					gap: { base: "12", lg: "16" },
					maxW: "6xl",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
				})}
			>
				{/* LEFT: content */}
				<div className={css({ flex: 1, maxW: "xl" })}>
					<h1
						className={css({
							fontSize: { base: "3xl", md: "4xl", lg: "5xl" },
							fontWeight: "bold",
							mb: { base: "4", md: "6" },
							lineHeight: "1.1",
							whiteSpace: "nowrap",
						})}
					>
						Engineering Leader & Software Engineer
					</h1>

					<p
						className={css({
							fontSize: { base: "lg", md: "xl" },
							color: "gray.600",
							mb: { base: "8", md: "10" },
							fontWeight: "normal",
							lineHeight: "1.6",
						})}
					>
						Helping teams ship with clarity, speed, and reliable systems.
					</p>

					<ul
						className={css({
							listStyle: "none",
							pl: "0",
							mb: { base: "8", md: "10" },
							fontSize: { base: "md", md: "lg" },
							color: "gray.700",
						})}
					>
						<li
							className={css({
								mb: { base: "3", md: "4" },
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
								mb: { base: "3", md: "4" },
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
								25+ years building software across Google, Microsoft, and
								startups
							</span>
						</li>
						<li
							className={css({
								mb: { base: "3", md: "4" },
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
								mb: { base: "3", md: "4" },
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

					<div
						className={hstack({
							gap: { base: "3", md: "4" },
							wrap: "wrap",
							mb: { base: "8", md: "10" },
							align: "center",
						})}
					>
						<span className={chip({ variant: "ai" })}>
							<span>✨</span>
							<span>AI</span>
						</span>
						<span className={chip({ variant: "react" })}>
							<span>⚛️</span>
							<span>React</span>
						</span>
						<span className={chip({ variant: "typescript" })}>
							<span>📘</span>
							<span>TypeScript</span>
						</span>
						<span className={chip({ variant: "node" })}>
							<span>🌱</span>
							<span>Node.js</span>
						</span>
					</div>

					<a
						href="/blogs"
						className={css({
							color: "brand.600",
							_hover: { color: "brand.700" },
							fontSize: "lg",
							fontWeight: "medium",
							textDecoration: "none",
						})}
					>
						Read the blog
					</a>
				</div>
			</div>
		</section>
	);
}

/* tiny recipe helpers */
const chip = cva({
	base: {
		fontSize: { base: "sm", md: "md" },
		fontWeight: "medium",
		px: { base: "3", md: "4" },
		py: { base: "1.5", md: "2" },
		rounded: "lg",
		borderWidth: "1px",
		borderStyle: "solid",
		transition: "all 0.2s ease",
		cursor: "pointer",
		boxShadow: "sm",
		minWidth: "fit-content",
		display: "inline-flex",
		alignItems: "center",
		gap: "2",
		_hover: {
			transform: "translateY(-2px)",
			boxShadow: "md",
		},
	},
	variants: {
		variant: {
			ai: {
				bg: "#f4f4f5",
				color: "#374151",
				borderColor: "#d1d5db",
				_hover: {
					bg: "#e5e7eb",
					color: "#1f2937",
					borderColor: "#9ca3af",
				},
			},
			react: {
				bg: "#cffafe",
				color: "#0e7490",
				borderColor: "#06b6d4",
				_hover: {
					bg: "#a5f3fc",
					color: "#155e75",
					borderColor: "#0891b2",
				},
			},
			typescript: {
				bg: "#dbeafe",
				color: "#1d4ed8",
				borderColor: "#3b82f6",
				_hover: {
					bg: "#bfdbfe",
					color: "#1e3a8a",
					borderColor: "#2563eb",
				},
			},
			node: {
				bg: "#dcfce7",
				color: "#166534",
				borderColor: "#22c55e",
				_hover: {
					bg: "#bbf7d0",
					color: "#14532d",
					borderColor: "#16a34a",
				},
			},
		},
	},
});

const primaryBtn = () =>
	css({
		display: "inline-block",
		bg: "brand.600",
		color: "white",
		rounded: "md",
		px: { base: "6", md: "8" },
		py: { base: "3", md: "4" },
		fontSize: { base: "md", md: "lg" },
		fontWeight: "medium",
		_hover: { bg: "brand.700" },
		transition: "all 0.2s ease",
		textDecoration: "none",
	});
