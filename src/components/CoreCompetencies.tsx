import { css } from "../../styled-system/css/index.mjs";

const items = [
	{
		title: "Engineering Leadership & Team Growth",
		body:
			"Leading high-performing teams, scaling orgs, mentoring engineers, and driving delivery through clarity and execution.",
	},
	{
		title: "AI & Platform Strategy",
		body:
			"Leading AI initiatives including Gemini Code Assist, bridging engineering, product, and research to deliver at scale.",
	},
	{
		title: "Product Execution & Delivery",
		body:
			"Driving product vision, prioritization, and cross-functional execution to ship products used by millions.",
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
				<div
					key={it.title}
					className={css({
						display: "flex",
						flexDirection: "column",
						flex: "1",
						minHeight: "300px",
						rounded: "xl",
						borderWidth: "1px",
						borderColor: "gray.200",
						bg: "white",
						p: "8",
						shadow: "sm",
						height: "100%",
						gap: "3",
						alignItems: "center",
						justifyContent: "center",
					})}
				>
					

						{/* Title */}
					<h3
							className={css({
							fontSize: { base: "lg", md: "xl" },
								fontWeight: "bold",
							mb: "2",
							textAlign: "center",
								color: "gray.900",
							lineHeight: "1.25",
							})}
						>
							{it.title}
						</h3>

						{/* Description */}
					<p
							className={css({
								color: "gray.600",
							mb: "0",
							textAlign: "center",
								lineHeight: "1.6",
								fontSize: "md",
							})}
					>
						{it.body}
					</p>
				</div>
			))}
			</div>
		</section>
	);
}
