import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { css } from "../../styled-system/css/index.mjs";
import { container } from "../../styled-system/patterns/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import { CodementorReviews } from "../components/CodementorReviews";
import { CodementorReview } from "../types/codementor";

interface ReviewsPageProps {
	reviews: CodementorReview[];
}

export function ReviewsPagePanda({ reviews }: ReviewsPageProps) {
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
				<title>Codementor Reviews | Nick Karnik</title>
				<meta
					name="description"
					content="Client reviews and testimonials from Codementor sessions with Nick Karnik."
				/>
				<link rel="canonical" href="https://nick.karnik.io/reviews" />
			</Helmet>
			<HeaderSSR currentPage="reviews" />
			<main
				className={container({
					maxW: "1280px",
					mx: "auto",
					px: { base: 4, md: 6 },
					py: 8,
				})}
			>
				{/* Header */}
				<div className={css({ mb: 8, textAlign: "center" })}>
					<h1
						className={css({
							fontSize: { base: "3xl", md: "4xl" },
							fontWeight: "bold",
							color: "gray.900",
							mb: 3,
						})}
					>
						Codementor Reviews
					</h1>
					<p
						className={css({
							fontSize: "lg",
							color: "gray.600",
							maxW: "2xl",
							mx: "auto",
						})}
					>
						Client reviews and testimonials from mentoring sessions on Codementor.
					</p>
					<a
						href="https://www.codementor.io/@theoutlander"
						target="_blank"
						rel="noopener noreferrer"
						className={css({
							display: "inline-flex",
							alignItems: "center",
							gap: 2,
							mt: 4,
							color: "blue.600",
							textDecoration: "none",
							fontSize: "sm",
							fontWeight: "medium",
							_hover: {
								textDecoration: "underline",
							},
						})}
					>
						View profile on Codementor
						<svg
							className={css({ w: 4, h: 4 })}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
							/>
						</svg>
					</a>
				</div>

				{/* Reviews Grid */}
				<CodementorReviews reviews={reviews} />
			</main>
			<Footer />
		</div>
	);
}
