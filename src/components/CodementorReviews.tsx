import React from "react";
import { css } from "../../styled-system/css/index.mjs";
import { CodementorReview } from "../types/codementor";
import { CodementorIcon } from "./CodementorIcon";

interface CodementorReviewsProps {
	reviews: CodementorReview[];
}

export function CodementorReviews({ reviews }: CodementorReviewsProps) {
	if (!reviews || reviews.length === 0) {
		return (
			<div
				className={css({
					textAlign: "center",
					py: 8,
					color: "gray.500",
				})}
			>
				No reviews available at this time.
			</div>
		);
	}

	return (
		<div
			className={css({
				display: "grid",
				gridTemplateColumns: { base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
				gap: 6,
				alignItems: "stretch",
			})}
		>
			{reviews.map((review) => (
				<article
					key={review.id}
					className={css({
						bg: "white",
						borderWidth: "1px",
						borderColor: "gray.200",
						borderRadius: "xl",
						boxShadow: "sm",
						p: { base: 4, md: 5 },
						display: "flex",
						flexDir: "column",
						height: "100%",
						minHeight: "200px",
						transition: "all 0.2s",
						_hover: {
							boxShadow: "md",
							transform: "translateY(-2px)",
						},
					})}
				>
					{/* Header with rating */}
					<div
						className={css({
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mb: 3,
							pb: 3,
							borderBottomWidth: "1px",
							borderColor: "gray.100",
						})}
					>
						<div
							className={css({
								display: "flex",
								alignItems: "center",
								gap: 1,
							})}
						>
							{Array.from({ length: review.rating }).map((_, i) => (
								<svg
									key={i}
									className={css({
										w: 4,
										h: 4,
										color: "yellow.400",
										fill: "currentColor",
									})}
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
							))}
						</div>
						<CodementorIcon size={16} color="gray.400" />
					</div>

					{/* Review text */}
					<p
						className={css({
							flex: 1,
							color: "gray.700",
							lineHeight: "1.7",
							fontSize: "sm",
							mb: 4,
							overflow: "hidden",
							display: "-webkit-box",
							WebkitLineClamp: 6,
							WebkitBoxOrient: "vertical",
							textOverflow: "ellipsis",
						})}
					>
						{review.text}
					</p>

					{/* Footer with author */}
					<div
						className={css({
							display: "flex",
							alignItems: "center",
							pt: 3,
							borderTopWidth: "1px",
							borderColor: "gray.100",
						})}
					>
						<div
							className={css({
								display: "flex",
								alignItems: "center",
								gap: 2,
							})}
						>
							{review.authorImageLocal && (
								<div
									className={css({
										width: "32px",
										height: "32px",
										borderRadius: "50%",
										overflow: "hidden",
										flexShrink: 0,
										position: "relative",
										display: "inline-block",
									})}
									style={{
										width: "32px",
										height: "32px",
										maxWidth: "32px",
										maxHeight: "32px",
										minWidth: "32px",
										minHeight: "32px",
									}}
								>
									<img
										src={review.authorImageLocal}
										alt={review.author}
										style={{
											width: "32px",
											height: "32px",
											maxWidth: "32px",
											maxHeight: "32px",
											objectFit: "cover",
											display: "block",
										}}
										onError={(e) => {
											// Hide image if it fails to load
											(e.target as HTMLImageElement).style.display = "none";
										}}
									/>
								</div>
							)}
							<span
								className={css({
									fontSize: "sm",
									fontWeight: "semibold",
									color: "gray.800",
								})}
							>
								{review.author}
							</span>
						</div>
					</div>
				</article>
			))}
		</div>
	);
}
