import { css } from "../../styled-system/css/index.mjs";

const items = [
	{
		title: "AI and Developer Tools",
		body:
			"Built Gemini Code Assist at Google. Writing about what I learned building it.",
	},
	{
		title: "Search and Relevance",
		body:
			"Six years on Bing search at Microsoft. A patent. A lot of labeled data.",
	},
	{
		title: "Making Things",
		body:
			"Currently building new tools. Making games with my three kids. Always something cooking.",
	},
];

export default function CoreCompetencies() {
	return (
		<section
			className={css({
				bg: "white",
				py: "12",
				_dark: { bg: "dark.surface" },
			})}
		>
			<div className={css({ textAlign: "center", mb: "16", px: { base: "4", md: "6" } })}>
				<h2
					className={css({
						fontWeight: "bold",
						fontSize: { base: "2xl", sm: "3xl", md: "4xl" },
						mb: "0",
						color: { base: "gray.900", _dark: "dark.text" },
						lineHeight: "1.2",
					})}
				>
					What I Work On
				</h2>
			</div>

			<div
				className={css({
					maxW: "5xl",
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
						rounded: "xl",
						borderWidth: "1px",
						borderColor: { base: "gray.200", _dark: "gray.700" },
						bg: { base: "gray.50", _dark: "gray.900" },
						pt: "5",
						px: "8",
						pb: "8",
						shadow: "sm",
						height: "100%",
						gap: "3",
						alignItems: "center",
						justifyContent: "flex-start",
					})}
				>
					<h3
						className={css({
							fontSize: { base: "lg", md: "xl" },
							fontWeight: "bold",
							mb: "2",
							textAlign: "center",
							color: { base: "gray.900", _dark: "dark.text" },
							lineHeight: "1.25",
						})}
					>
						{it.title}
					</h3>

					<p
						className={css({
							color: { base: "gray.600", _dark: "gray.400" },
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
