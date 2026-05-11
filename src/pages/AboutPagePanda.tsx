import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { css } from "../../styled-system/css/index.mjs";
import { container } from "../../styled-system/patterns/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import ProfileIntroHeader from "../components/ProfileIntroHeader";
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
				width: "100%",
				overflowX: "hidden",
			})}
		>
			<Helmet>
				<title>Nick Karnik | About</title>
				<meta
					name="description"
					content="Engineer, builder, and dad of three. Twenty-five years building software across search, AI, and data."
				/>
				<link rel="canonical" href="https://nick.karnik.io/about" />
			</Helmet>
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
				<ProfileIntroHeader />

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
							pb: 3,
							borderBottomWidth: "1px",
							borderColor: "gray.100",
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

						{/* Featured Work */}
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
									pb: 3,
									borderBottomWidth: "1px",
									borderColor: "gray.100",
								})}
							>
								Featured Work
							</div>
							<p
								className={css({
									fontSize: "sm",
									color: "gray.600",
									lineHeight: "1.6",
									mb: 4,
								})}
							>
								My work on geospatial visualization of epidemiological{" "}
								modeling was featured in this TED Talk by Bill Gates.
							</p>
							<div
								className={css({
									position: "relative",
									width: "100%",
									aspectRatio: "16 / 9",
									borderRadius: "lg",
									overflow: "hidden",
								})}
							>
								<iframe
									className={css({
										position: "absolute",
										top: 0,
										left: 0,
										width: "100%",
										height: "100%",
										border: "none",
									})}
									src="https://www.youtube.com/embed/6Af6b_wyiwI"
									title="TED Talk featuring Institute for Disease Modeling software"
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
								/>
							</div>
						</div>

						{/* Patents */}
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
									pb: 3,
									borderBottomWidth: "1px",
									borderColor: "gray.100",
								})}
							>
								🔬 Patents
							</div>
							<div className={css({ mb: 3 })}>
								<a
									href="https://patents.google.com/patent/US8918354B2/en"
									target="_blank"
									rel="noopener noreferrer"
									className={css({
										fontSize: "sm",
										fontWeight: "semibold",
										color: "blue.600",
										textDecoration: "none",
										_hover: {
											textDecoration: "underline",
										},
										display: "block",
										mb: 1,
										lineHeight: "1.5",
									})}
								>
									US Patent 8,918,354: Intelligent intent detection from social network messages
								</a>
								<p
									className={css({
										color: "gray.500",
										fontSize: "xs",
										mt: 1,
									})}
								>
									Granted 2014 • Active until 2032
								</p>
							</div>
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
								pb: 3,
								borderBottomWidth: "1px",
								borderColor: "gray.100",
								})}
							>
							📍 Now
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
										Building new tools in AI and developer tooling
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
										Writing about what I learn from first principles
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
										Cooking, baking, and experimenting in the kitchen
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
