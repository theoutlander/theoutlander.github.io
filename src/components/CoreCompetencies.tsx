import { css } from "../../styled-system/css/index.mjs";
import { grid, hstack } from "../../styled-system/patterns/index.mjs";

const items = [
	{
		title: "Full-Stack Development",
		body: "React + Node. Ship weekly with modern tooling and DX.",
		href: "/tags/dev",
		icon: "⚡",
	},
	{
		title: "Engineering Leadership",
		body: "Clear bets, strong execution, calm, predictable delivery.",
		href: "/about#leadership",
		icon: "🎯",
	},
	{
		title: "AI Advisory",
		body: "Use AI as leverage for teams and tooling, not a crutch.",
		href: "/tags/ai",
		icon: "🤖",
	},
];

export default function CoreCompetencies() {
	return (
		<section
			className={css({
				bg: "gray.50",
				borderTop: "1px solid",
				borderColor: "gray.100",
				py: "12",
			})}
		>
			<div className={css({ textAlign: "center", mb: "16", px: { base: "4", md: "6" } })}>
				<h2
					className={css({
						fontWeight: "bold",
						fontSize: { base: "2xl", sm: "3xl", md: "4xl" },
						mb: "4",
						color: "gray.900",
						lineHeight: "1.2",
					})}
				>
					Core Competencies
				</h2>
				<p
					className={css({
						fontSize: { base: "md", md: "lg" },
						color: "gray.600",
						fontWeight: "normal",
						lineHeight: "1.6",
					})}
				>
					Areas where I bring the most impact and experience.
				</p>
			</div>

			<div
				className={css({
					maxW: "6xl",
					mx: "auto",
					px: { base: "4", md: "6" },
					display: "flex",
					flexDirection: { base: "column", md: "row" },
					gap: { base: "6", md: "8" },
					alignItems: "stretch",
					justifyContent: "center",
				})}
			>
				{items.map((it) => (
					<a
						key={it.title}
						href={it.href}
						className={css({
							display: "flex",
							flexDirection: "column",
							flex: "1",
							rounded: "xl",
							borderWidth: "1px",
							borderColor: "gray.200",
							bg: "white",
							p: "8",
							shadow: "sm",
							transition: "all 300ms ease-in-out",
							textDecoration: "none",
							height: "100%",
							_hover: {
								shadow: "xl",
								transform: "translateY(-6px)",
								borderColor: "gray.300",
							},
						})}
					>
						{/* Icon */}
						<div
							className={css({
								fontSize: "4xl",
								mb: "6",
								textAlign: "center",
								height: "64px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							})}
						>
							{it.icon}
						</div>

						{/* Title */}
						<h3
							className={css({
								fontSize: "xl",
								fontWeight: "bold",
								mb: "4",
								textAlign: "center",
								color: "gray.900",
								lineHeight: "1.3",
							})}
						>
							{it.title}
						</h3>

						{/* Description */}
						<p
							className={css({
								color: "gray.600",
								mb: "6",
								textAlign: "center",
								lineHeight: "1.6",
								fontSize: "md",
								flex: "1",
							})}
						>
							{it.body}
						</p>

						{/* Learn more link */}
						<div
							className={hstack({
								justify: "center",
								fontSize: "sm",
								color: "accent.600",
								fontWeight: "medium",
								mt: "auto",
							})}
						>
							<span>Learn more</span>
							<span aria-hidden>→</span>
						</div>
					</a>
				))}
			</div>
		</section>
	);
}
