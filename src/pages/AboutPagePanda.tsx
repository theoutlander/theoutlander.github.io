import React from "react";
import { css } from "../../styled-system/css/index.mjs";
import { container } from "../../styled-system/patterns/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import NameHeader from "../components/NameHeader";
import ContactSection from "../components/ContactSection";

type AboutData = {
	title: string;
	html: string;
};

type AboutPageProps = {
	aboutData: AboutData;
};

export function AboutPagePanda({ aboutData }: AboutPageProps) {
	return (
		<div
			className={css({
				bg: "gray.50",
				minH: "100vh",
			})}
		>
			<HeaderSSR currentPage="about" />
			<main
				className={container({
					maxW: "1024px",
					mx: "auto",
					px: { base: 4, md: 6 },
					py: 8,
				})}
			>
				{/* Header */}
				<NameHeader showDownloadButton={false} />

				{/* Grid */}
				<section
					className={css({
						display: "grid",
						gridTemplateColumns: { base: "1fr", md: "1.6fr 1fr" },
						gap: 6,
						mt: 6,
					})}
				>
					{/* Left: About */}
					<article
						className={css({
							bg: "white",
							borderWidth: "1px",
							borderColor: "gray.200",
							borderRadius: "xl",
							boxShadow: "sm",
							p: { base: 4, md: 6 },
						})}
					>
						<h3
							className={css({
								fontWeight: "semibold",
								color: "gray.800",
								mb: 3,
								fontSize: "lg",
							})}
						>
							About
						</h3>
						<div
							className={css({
								color: "gray.700",
								lineHeight: "1.7",
								fontSize: "md",
								"& p": { mb: 4 },
								"& p:last-child": { mb: 0 },
								"& ul": { mb: 4 },
								"& li": { mb: 2 },
								"& a": {
									color: "blue.600",
									textDecoration: "underline",
									_hover: {
										color: "blue.700",
										textDecoration: "none",
									},
								},
							})}
							dangerouslySetInnerHTML={{ __html: aboutData.html }}
						/>
					</article>

					{/* Right: Sidebar */}
					<aside
						className={css({ display: "flex", flexDir: "column", gap: 6 })}
					>
						{/* Contact */}
						<ContactSection />

						{/* Focus */}
						<div
							className={css({
								bg: "white",
								borderWidth: "1px",
								borderColor: "gray.200",
								borderRadius: "xl",
								boxShadow: "sm",
								p: { base: 4, md: 5 },
							})}
						>
							<div
								className={css({
									fontSize: "sm",
									fontWeight: "semibold",
									color: "gray.800",
									mb: 3,
								})}
							>
								Focus
							</div>
							<div
								className={css({
									display: "flex",
									gap: 2,
									flexWrap: "wrap",
									mb: 4,
								})}
							>
								{[
									"TypeScript",
									"React",
									"Vite",
									"Chakra",
									"Node",
									"GraphQL",
									"AI",
								].map((tech) => (
									<span
										key={tech}
										className={css({
											display: "inline-flex",
											alignItems: "center",
											px: 2.5,
											py: 1,
											borderRadius: "full",
											fontSize: "xs",
											fontWeight: "medium",
											borderWidth: "1px",
											whiteSpace: "nowrap",
											bg: "gray.50",
											borderColor: "gray.200",
											color: "gray.700",
										})}
									>
										{tech}
									</span>
								))}
							</div>
							<p
								className={css({
									mt: 3,
									fontSize: "sm",
									color: "gray.600",
								})}
							>
								I help teams move faster with clear product bets, strong
								execution, and systems that are simple to maintain.
							</p>
						</div>

						{/* Now */}
						<div
							className={css({
								bg: "white",
								borderWidth: "1px",
								borderColor: "gray.200",
								borderRadius: "xl",
								boxShadow: "sm",
								p: { base: 4, md: 5 },
							})}
						>
							<div
								className={css({
									fontSize: "sm",
									fontWeight: "semibold",
									color: "gray.800",
									mb: 3,
								})}
							>
								Now
							</div>
							<ul className={css({ listStyle: "none", padding: 0, margin: 0 })}>
								<li
									className={css({
										display: "flex",
										alignItems: "flex-start",
										mb: 2,
										"&:last-child": { mb: 0 },
									})}
								>
									<span
										className={css({
											display: "inline-block",
											width: "4px",
											height: "4px",
											borderRadius: "50%",
											bg: "blue.600",
											mt: 2,
											mr: 2,
											flexShrink: 0,
										})}
									/>
									<span
										className={css({
											fontSize: "sm",
											color: "gray.600",
										})}
									>
										Advising founders on pragmatic AI & DX.
									</span>
								</li>
								<li
									className={css({
										display: "flex",
										alignItems: "flex-start",
										mb: 2,
										"&:last-child": { mb: 0 },
									})}
								>
									<span
										className={css({
											display: "inline-block",
											width: "4px",
											height: "4px",
											borderRadius: "50%",
											bg: "blue.600",
											mt: 2,
											mr: 2,
											flexShrink: 0,
										})}
									/>
									<span
										className={css({
											fontSize: "sm",
											color: "gray.600",
										})}
									>
										Building React + Node tools with TypeScript.
									</span>
								</li>
								<li
									className={css({
										display: "flex",
										alignItems: "flex-start",
										mb: 2,
										"&:last-child": { mb: 0 },
									})}
								>
									<span
										className={css({
											display: "inline-block",
											width: "4px",
											height: "4px",
											borderRadius: "50%",
											bg: "blue.600",
											mt: 2,
											mr: 2,
											flexShrink: 0,
										})}
									/>
									<span
										className={css({
											fontSize: "sm",
											color: "gray.600",
										})}
									>
										Writing weekly about engineering leadership.
									</span>
								</li>
							</ul>
						</div>
					</aside>
				</section>
			</main>
			<Footer />
		</div>
	);
}
