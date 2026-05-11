import { css } from "../../styled-system/css/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import { ConceptBox } from "../components/ui";

export function DesignSystemPage() {
	return (
		<div
			className={css({
				bg: "white",
				minH: "100vh",
				width: "100%",
				overflowX: "hidden",
			})}
		>
			<HeaderSSR currentPage="design" />
			<main
				className={css({
					maxW: "5xl",
					py: { base: 6, md: 10 },
					mx: "auto",
					px: { base: 4, md: 6 },
					width: "100%",
				})}
			>
				<h1
					className={css({
						fontSize: { base: "2xl", md: "3xl" },
						fontWeight: "700",
						mb: 2,
						color: "#000",
					})}
				>
					Design System
				</h1>

				<p
					className={css({
						fontSize: "lg",
						color: "gray.600",
						mb: 8,
						maxW: "2xl",
					})}
				>
					Reusable UI components and patterns used across the site. Change styles once
					in <code>/src/styles/blog-components.css</code>, and they update everywhere —
					markdown content, React components, and this guide.
				</p>

				{/* Concept Box Section */}
				<section className={css({ mb: 12 })}>
					<h2
						className={css({
							fontSize: { base: "xl", md: "2xl" },
							fontWeight: "700",
							mb: 6,
							color: "#000",
							mt: 8,
							pb: 3,
							borderBottomWidth: "2px",
							borderColor: "gray.200",
						})}
					>
						ConceptBox
					</h2>

					<p
						className={css({
							fontSize: "md",
							color: "gray.700",
							mb: 6,
							lineHeight: 1.6,
						})}
					>
						Displays key concepts, formulas, and definitions. Use this component to
						highlight important ideas that need visual emphasis.
					</p>

					{/* Usage Examples */}
					<div className={css({ mb: 8 })}>
						<h3
							className={css({
								fontSize: "lg",
								fontWeight: "600",
								mb: 4,
								color: "#333",
							})}
						>
							Usage Examples
						</h3>

						<div className={css({ display: "grid", gridTemplateColumns: { base: "1fr", md: "1fr 1fr" }, gap: 8 })}>
							{/* React Component Example */}
							<div>
								<h4
									className={css({
										fontSize: "sm",
										fontWeight: "700",
										color: "#666",
										textTransform: "uppercase",
										letterSpacing: "wider",
										mb: 3,
									})}
								>
									In React
								</h4>
								<pre
									className={css({
										bg: "#f5f5f5",
										p: 3,
										borderRadius: "md",
										overflowX: "auto",
										fontSize: "xs",
										lineHeight: 1.5,
										color: "#333",
										mb: 4,
									})}
								>
									<code>{`<ConceptBox caption="Range: 0–1 | Good: 0.8–0.9">
  <strong>F1 Score = 2 × (Precision × Recall)
  / (Precision + Recall)</strong>
</ConceptBox>`}</code>
								</pre>

								<ConceptBox caption="Range: 0–1 | Good: 0.8–0.9">
									<strong>F1 Score = 2 × (Precision × Recall) / (Precision + Recall)</strong>
								</ConceptBox>
							</div>

							{/* Markdown Example */}
							<div>
								<h4
									className={css({
										fontSize: "sm",
										fontWeight: "700",
										color: "#666",
										textTransform: "uppercase",
										letterSpacing: "wider",
										mb: 3,
									})}
								>
									In Markdown
								</h4>
								<pre
									className={css({
										bg: "#f5f5f5",
										p: 3,
										borderRadius: "md",
										overflowX: "auto",
										fontSize: "xs",
										lineHeight: 1.5,
										color: "#333",
										mb: 4,
									})}
								>
									<code>{`<div class="concept-box">

**F1 Score = 2 × (Precision × Recall)
/ (Precision + Recall)**

<small>Range: 0–1 | Good: 0.8–0.9</small>

</div>`}</code>
								</pre>

								<div
									className="concept-box"
									style={{
										border: "3px solid #374151",
										padding: "1.5rem",
										margin: "0",
										borderRadius: "2px",
										background: "white",
										textAlign: "center",
									}}
								>
									<strong style={{ display: "block", marginBottom: "0.5rem" }}>
										F1 Score = 2 × (Precision × Recall) / (Precision + Recall)
									</strong>
									<small style={{ display: "block", color: "#666", marginTop: "0.75rem" }}>
										Range: 0–1 | Good: 0.8–0.9
									</small>
								</div>
							</div>
						</div>
					</div>

					{/* Props */}
					<div>
						<h3
							className={css({
								fontSize: "lg",
								fontWeight: "600",
								mb: 4,
								color: "#333",
							})}
						>
							Component Props
						</h3>
						<div
							className={css({
								bg: "#f9f9f9",
								p: 4,
								borderRadius: "md",
								borderLeftWidth: "4px",
								borderLeftColor: "blue.600",
							})}
						>
							<table
								className={css({
									width: "100%",
									fontSize: "sm",
									"& th": { textAlign: "left", fontWeight: "700", pb: 2, color: "#333" },
									"& td": { py: 2, borderTopWidth: "1px", borderColor: "#e0e0e0" },
									"& th:first-child": { paddingRight: "1rem" },
									"& td:first-child": { paddingRight: "1rem" },
								})}
							>
								<thead>
									<tr>
										<th>Prop</th>
										<th>Type</th>
										<th>Description</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>
											<code>children</code>
										</td>
										<td>React.ReactNode</td>
										<td>The content to display inside the box (formulas, text, etc.)</td>
									</tr>
									<tr>
										<td>
											<code>caption?</code>
										</td>
										<td>string</td>
										<td>Optional small text displayed below the content</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</section>

				{/* Source of Truth */}
				<section
					className={css({
						bg: "#f0f4f8",
						p: 6,
						borderRadius: "md",
						mt: 12,
						borderLeftWidth: "4px",
						borderLeftColor: "blue.600",
					})}
				>
					<h3
						className={css({
							fontSize: "lg",
							fontWeight: "700",
							mb: 3,
							color: "#333",
						})}
					>
						🎯 Single Source of Truth
					</h3>
					<p
						className={css({
							fontSize: "md",
							color: "gray.700",
							lineHeight: 1.6,
						})}
					>
						All component styles live in{" "}
						<code className={css({ bg: "white", px: 2, py: 1, borderRadius: "sm" })}>
							src/styles/blog-components.css
						</code>{" "}
						Change the <code className={css({ bg: "white", px: 2, py: 1, borderRadius: "sm" })}>
							.concept-box
						</code>{" "}
						class there, and it updates:
					</p>
					<ul
						className={css({
							mt: 3,
							pl: 6,
							fontSize: "md",
							color: "gray.700",
							"& li": { mb: 2 },
						})}
					>
						<li>✅ All React components using ConceptBox</li>
						<li>✅ All markdown content with class="concept-box"</li>
						<li>✅ This design system page</li>
					</ul>
				</section>
			</main>
			<Footer />
		</div>
	);
}
