import { css } from "../../styled-system/css/index.mjs";
import { flex, hstack } from "../../styled-system/patterns/index.mjs";

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
						})}
					>
						<span className={chip({ variant: "ai" })}>AI</span>
						<span className={chip({ variant: "react" })}>React</span>
						<span className={chip({ variant: "typescript" })}>TypeScript</span>
						<span className={chip({ variant: "node" })}>Node.js</span>
					</div>

					<a
						href="/blogs"
						className={primaryBtn()}
					>
						Read the blog
					</a>
				</div>
			</div>
		</section>
	);
}

/* tiny recipe helpers */
const chip = ({
	variant,
}: {
	variant: "ai" | "react" | "typescript" | "node";
}) => {
	const variants = {
		ai: {
			bg: "white",
			color: "tech.ai",
			borderColor: "tech.ai",
			_hover: { bg: "gray.50" },
		},
		react: {
			bg: "blue.50",
			color: "tech.react",
			borderColor: "tech.react",
			_hover: { bg: "blue.100" },
		},
		typescript: {
			bg: "white",
			color: "tech.typescript",
			borderColor: "tech.typescript",
			_hover: { bg: "gray.50" },
		},
		node: {
			bg: "white",
			color: "tech.nodejs",
			borderColor: "tech.nodejs",
			_hover: { bg: "gray.50" },
		},
	};

	return css({
		...variants[variant],
		fontSize: { base: "sm", md: "md" },
		fontWeight: "medium",
		px: { base: "3", md: "4" },
		py: { base: "1.5", md: "2" },
		rounded: "md",
		border: "1px solid",
		transition: "all 0.2s ease",
		cursor: "default",
	});
};

const primaryBtn = () =>
	css({
		display: "inline-block",
		bg: "accent.600",
		color: "white",
		rounded: "md",
		px: { base: "6", md: "8" },
		py: { base: "3", md: "4" },
		fontSize: { base: "md", md: "lg" },
		fontWeight: "medium",
		_hover: { bg: "accent.700" },
		transition: "all 0.2s ease",
		textDecoration: "none",
	});
