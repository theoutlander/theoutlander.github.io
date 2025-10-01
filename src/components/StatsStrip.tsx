import { css } from "../../styled-system/css/index.mjs";
import { vstack } from "../../styled-system/patterns/index.mjs";

export default function StatsStrip() {
	return (
		<section
			className={css({
				bg: "gray.50",
				py: "16",
				mb: "8",
			})}
		>
			<div
				className={css({
					maxW: "6xl",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
					display: "flex",
					flexDirection: { base: "column", md: "row" },
					justifyContent: "center",
					alignItems: "center",
					gap: { base: "8", md: "12" },
				})}
			>
				{/* Years Leadership */}
				<div
					className={css({
						textAlign: "center",
						flex: "1",
					})}
				>
					<div
						className={css({
							fontSize: { base: "3xl", md: "4xl" },
							fontWeight: "bold",
							color: "gray.900",
							lineHeight: "1",
							mb: "2",
						})}
					>
						10+
					</div>
					<div
						className={css({
							fontSize: "sm",
							color: "gray.600",
						})}
					>
						Years Leadership
					</div>
				</div>

				{/* Years Building Software */}
				<div
					className={css({
						textAlign: "center",
						flex: "1",
					})}
				>
					<div
						className={css({
							fontSize: { base: "3xl", md: "4xl" },
							fontWeight: "bold",
							color: "gray.900",
							lineHeight: "1",
							mb: "2",
						})}
					>
						25+
					</div>
					<div
						className={css({
							fontSize: "sm",
							color: "gray.600",
						})}
					>
						Years Building Software
					</div>
				</div>

				{/* Built & Led Multiple Teams */}
				<div
					className={css({
						textAlign: "center",
						flex: "1",
					})}
				>
					<div
						className={css({
							fontSize: { base: "3xl", md: "4xl" },
							fontWeight: "bold",
							color: "gray.900",
							lineHeight: "1",
							mb: "2",
						})}
					>
						∞
					</div>
					<div
						className={css({
							fontSize: "sm",
							color: "gray.600",
						})}
					>
						Built & Led Multiple Teams
					</div>
				</div>
			</div>
		</section>
	);
}
